################################################################################
# IMPORTS
################################################################################

# >>>> Native <<<<
import os
import collections
import sys
import json
import copy
import time
from typing import Dict, List, Any, Tuple, Hashable, Iterable, Union
import functools

# >>>> Flask <<<<
from flask import Flask, jsonify, request
from flask_cors import CORS

# >>>> Local <<<<
from utils import load_json_file, save_json_file
from annotator_config import Configuration
from admin_annotator import AdminAnnotator



################################################################################
# CODE
################################################################################

class MultiAnnotator(object):

    """
    The class that governs several DialogueAnnotator(s)
    """
    __GOLD_FILE_NAME = "GOLD_" + str( time.strftime("%Y%m%d-%H%M%S") )
    __DEFAULT_NAME = "FILE_"

    def __init__(self, path):
        self.path = path
        self.allFiles = { MultiAnnotator.__GOLD_FILE_NAME : AdminAnnotator(self.path, MultiAnnotator.__GOLD_FILE_NAME) }
        self.filesAdded = 0

        #self.__load_all_jsons(self.path)

    def get_all_files(self, dialogueId):
        """
        Gets all dialogues
        """
        outList = []

        for fileName, fileObject in self.allFiles.items():

            temp = fileObject.get_dialogue(id=dialogueId)["dialogue"]

            if temp:
                outList.append( temp )

        return outList

    def add_dialogue_file( self, jsonObject, fileName=None ):
        """
        adds a new DialogueAnnotator
        """
        if not fileName:
            fileName = self.__get_new_file_id()
            self.filesAdded += 1

        save_json_file( obj=jsonObject, path= os.path.join( self.path, fileName ) )
        self.allFiles[MultiAnnotator.__GOLD_FILE_NAME].update_dialogues(jsonObject)

        self.allFiles[ fileName ] = AdminAnnotator( self.path, fileName )
        self.save()

    def get_metadata(self):
        """
        returns the names of the files
        """
        return { "names" : [ {"name":x} for x,_ in self.allFiles.items() ] }

    def get_dialogue_names(self) -> List[str]:
        """Gets a list of the names of the dialogues and checks that all JSON files have the same dialogues."""

        allDialogues = []

        for fname, dialogObj in self.allFiles.items():

            if fname == self.__GOLD_FILE_NAME:
                continue

            allDialogues.append(dialogObj.get_dialogues())

        for dialogue in allDialogues:

            for key in dialogue:

                assert all(key in d for d in allDialogues), "Dialogue in {} that's not in all other dialogues".format(dialogue)

        # By this point we know that all of the dialogues must have the same keys (i.e. dialogue names)
        return list(allDialogues[0].keys())

    def get_dialogues_metadata(self) -> List[Tuple[str, List[str]]]:
        """
        Gets a list of tuples of the dialogue names in each file and a list of the filenames that contain those
        dialogues.
        """
        allDialogues = collections.defaultdict(list)

        for fname, dialogObj in self.allFiles.items():

            if fname == self.__GOLD_FILE_NAME:
                continue

            for dialogueName, turnList in dialogObj.get_dialogues().items():

                allDialogues[dialogueName].append(fname)

        return [(key, val) for key, val in allDialogues.items()]

    def get_gold_dialogue_metadata(self):
        """Gets the metadata of the gold dialogue file"""
        return self.allFiles[self.__GOLD_FILE_NAME].get_dialogues_metadata()

    def dialogue_file_function_call(self, methodName, fileId=None, **args):
        """
        Makes the relevant call from the single dialogue file
        """
        if not fileId:
            fileId = MultiAnnotator.__GOLD_FILE_NAME

        temp = self.allFiles.get( fileId )

        method = getattr(temp, methodName)

        return method(**args)

    def __getattr__(self, attr):
        """
        Magic Methods++
        """

        temp = functools.partial( self.dialogue_file_function_call, attr )

        return temp

    def __load_all_jsons(self, targetPath):
        """
        loads all files from directory
        """
        currentDir = os.path.join( os.getcwd(), targetPath)

        files = [ x for x in os.listdir( currentDir ) if os.path.isfile( os.path.join(currentDir, x) ) ]

        for file in files:

            if file.endswith('.json'):
                jsonObject = load_json_file( os.path.join(currentDir,file) )
                self.add_dialogue_file( jsonObject=jsonObject, fileName=file )

    def __get_new_file_id(self):
        """
        Creates a new file ID
        """
        return self.__DEFAULT_NAME + str( self.filesAdded ) + ".json"

    def wipe_view(self):

        self.allFiles = {}
        self.fileAdded = 0
        self.__init__(self.path)

        return {"status":"success"}



class DialogueAnnotator(object):
    """
    class that handles everything which relates to managing a single dialogues file
    """
    __DEFAULT_FILENAME="admin.json"

    __SESSION_USER = "admin"


    class dialogues(object):

        def __getitem__(self,key):
            return getattr(self,key)
    
    __dialogues = dialogues()

    def __init__( self, filePath, fileName=None, dialogues=None ):
        """
        """
        self.set_dialogues( self.__SESSION_USER, dialogues )
        self.set_file( filePath, fileName )
        
        try:
            self.addedDialogues
            self.addedDialogues[self.__SESSION_USER] = 0
        except:
            self.addedDialogues = {}
            self.addedDialogues[self.__SESSION_USER] = 0
        
        try: 
            self.activeCollection
            self.activeCollection[self.__SESSION_USER] = ""
        except:
            self.activeCollection = {}
            self.activeCollection[self.__SESSION_USER] = ""

    #def get_file_name(self):
        """
        """
    #    return {"name": self.__fileName}

    def change_file_name(self, newName, remove=False):
        """
        check if the new user has a workspace otherwise it's created
        """
        DialogueAnnotator.__SESSION_USER = newName

        try: 
            self.__dialogues[DialogueAnnotator.__SESSION_USER]
        except:
            self.set_dialogues(newName)

        oldFileName = self.__fileName
        self.__fileName = newName

        self.save(newName)

        #if remove:
        #    os.remove( os.path.join( self.__filePath, oldFileName ) )

    def set_dialogues( self, newName, dialogues=None ):
        """
        """
        DialogueAnnotator.__SESSION_USER = newName

        self.toBeInserted = dialogues if dialogues else {}

        setattr(DialogueAnnotator.__dialogues, DialogueAnnotator.__SESSION_USER, self.toBeInserted )

        try:
            self.addedDialogues[newName] = 0
        except:
            self.addedDialogues = {}
            self.addedDialogues[newName] = 0

        print("\n * Session requested for",newName,self.__dialogues[DialogueAnnotator.__SESSION_USER])

    def set_file( self, filePath, fileName=None ):
        """
        sets the file and tries to load it to use
        """
        self.__filePath = filePath

        if fileName:
            self.__fileName = fileName
            try:
                self.__dialogues[DialogueAnnotator.__SESSION_USER] = load_json_file( os.path.join( self.__filePath, self.__fileName ) )
            except FileNotFoundError:
                save_json_file( obj=self.__dialogues[DialogueAnnotator.__SESSION_USER], path=os.path.join( self.__filePath, self.__fileName ) )

        else:
            self.__fileName = DialogueAnnotator.__DEFAULT_FILENAME

    def get_dialogue(self, user, id: Hashable) -> Dict[str, Any]:
        """Gets a single dialogue"""
        DialogueAnnotator.__SESSION_USER = user

        return {"dialogue": self.__dialogues[DialogueAnnotator.__SESSION_USER].get(id)}

    def get_dialogues(self, user, id=None):
        """
        Returns all dialogues or specific dialogue (as dict {id: dialogue} )
        """
        DialogueAnnotator.__SESSION_USER = user

        return self.__dialogues[DialogueAnnotator.__SESSION_USER]

    def get_dialogues_metadata(self, user):
        """
        Gets the name of dialogues, returns a list
        """
        DialogueAnnotator.__SESSION_USER = user

        metadata = []

        for dialogueID, dialogueTurnList in self.__dialogues[DialogueAnnotator.__SESSION_USER].items():
            
            try:
                collection = self.__dialogues[DialogueAnnotator.__SESSION_USER][dialogueID][0]["collection"]
            except:
                collection = ""

            try:
                status = self.__dialogues[DialogueAnnotator.__SESSION_USER][dialogueID][0]["status"]
            except:
                status = "0%"

            metadata.append({"id": dialogueID, "num_turns": len(dialogueTurnList), "collection":collection, "status":status})

        return metadata


    def update_dialogue(self, user, id, newDialogue ):
        """
        updates the dialogue
        """
        DialogueAnnotator.__SESSION_USER = user

        self.__dialogues[DialogueAnnotator.__SESSION_USER][ id ] = newDialogue

        self.save(user)

        return {"status" : "success"}


    def update_dialogues(self, user, newDialogues):
        """
        updates all the dialogues with a new dictionary
        """
        DialogueAnnotator.__SESSION_USER = user

        for dId, newDialogue in newDialogues.items():

            temp = self.__dialogues[DialogueAnnotator.__SESSION_USER].get( dId )
            if temp:
                newDialogue = newDialogue if len(newDialogue)>len(temp) else temp


            self.__dialogues[DialogueAnnotator.__SESSION_USER][ dId ] = newDialogue

        return True

    def change_collection(self, user, fileName):

        self.activeCollection[user] = fileName

        print("* ",user,"started working on collection",fileName)


    def update_dialogue_name(self, user, id, newName):
        """
        updates the dialogue name
        """
        DialogueAnnotator.__SESSION_USER = user

        self.__dialogues[DialogueAnnotator.__SESSION_USER][newName] = copy.deepcopy( self.__dialogues[DialogueAnnotator.__SESSION_USER][id] )

        del self.__dialogues[DialogueAnnotator.__SESSION_USER][id]


    def add_new_dialogue(self, user, dialogue=None, id=None, collectionTag=None):
        """
        creates a new dialogue with an optional name
        """
        DialogueAnnotator.__SESSION_USER = user

        #update dialogue user's count
        number = self.addedDialogues[user]
        self.addedDialogues[user] = int(number)+1

        overwritten = ""

        if not id:
            id = self.__get_new_dialogue_id(user)

        #inserts in proper user workspace
        self.__dialogues[DialogueAnnotator.__SESSION_USER][ id ] = dialogue if dialogue else []

        #initialise meta-tags
        if not collectionTag:
            try:
                collectionTag = self.__dialogues[DialogueAnnotator.__SESSION_USER][ id ][0]["collection"]
            except:
                collectionTag = ""

        self.insert_meta_tags(user, id, "collection", collectionTag)
        self.insert_meta_tags(user, id, "status", "0%")

        self.save( user )

        return {"id":id, "overwritten":overwritten}

    def insert_meta_tags(self, user, id, tag, value):
        """
        Checks if meta-tags exist, if not create and format them, then inserts the value
        """
        #print("* User:"+user, id, "writing", tag,":",value)

        DialogueAnnotator.__SESSION_USER = user

        try:
            #verifiy if meta-tag header exists
            self.__dialogues[DialogueAnnotator.__SESSION_USER][ id ][0]["collection"]
            try:
                #verify if specific tag already exists
                self.__dialogues[DialogueAnnotator.__SESSION_USER][ id ][0][tag]
            except:
                self.__dialogues[DialogueAnnotator.__SESSION_USER][ id ][0][tag] = value
        except:
            self.__dialogues[DialogueAnnotator.__SESSION_USER][ id ].insert(0, { tag:value })
        


    def delete_dialogue(self, user, id):
        """
        Deletes a dialogue
        """
        DialogueAnnotator.__SESSION_USER = user

        del self.__dialogues[DialogueAnnotator.__SESSION_USER][ id ]

        self.save(user)


    def save(self, user):
        """
        Save the dialogues dictionary
        """
        DialogueAnnotator.__SESSION_USER = user

        save_json_file( obj=self.__dialogues[DialogueAnnotator.__SESSION_USER], path=os.path.join( self.__filePath, user+".json" ) )




    def __get_new_dialogue_id(self,user):
        """
        """
        newId = "Dialogue" + str(self.addedDialogues[user])

        # save_json_file( obj=self.__dialogues, path=self.__filePath )

        return newId


    def clean_workspace(self, user):

        DialogueAnnotator.__SESSION_USER = user

        self.set_dialogues( user )

        self.save( user )

        return { "status": "wiped" }


################################################################################
# MAIN
################################################################################







# EOF
