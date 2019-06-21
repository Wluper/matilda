################################################################################
# IMPORTS
################################################################################

# >>>> Native <<<<
import os
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
        self.allFiles = { MultiAnnotator.__GOLD_FILE_NAME : DialogueAnnotator(self.path, MultiAnnotator.__GOLD_FILE_NAME) }
        self.filesAdded = 0

        self.__load_all_jsons(self.path)


    def add_dialogue_file( self, jsonObjectOrFileName ):
        """
        adds a new DialogueAnnotator
        """
        if type( jsonObjectOrFileName )==str:
            fileName = jsonObjectOrFileName
        else:
            fileName = self.__get_new_file_id()
            save_json_file( obj=jsonObjectOrFileName, path= os.path.join( self.path, fileName ) )
            self.allFiles[MultiAnnotator.__GOLD_FILE_NAME].update_dialogues(jsonObjectOrFileName)

        self.filesAdded += 1
        self.allFiles[ fileName ] = DialogueAnnotator( self.path, fileName )


    def get_metadata(self):
        """
        returns the names of the files
        """
        return { "names" : [ {"name":x} for x,_ in self.allFiles.items() ] }



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



    def __load_all_jsons(self,path):
        """
        loads all files from directory
        """
        files = [ x for x in os.listdir('.') if os.path.isfile(x) ]

        for file in files:

            if file.endswith('.json'):

                self.add_dialogue_file( file )


    def __get_new_file_id(self):
        """
        Creates a new file ID
        """
        return self.__DEFAULT_NAME + str( self.filesAdded ) + ".json"











class DialogueAnnotator(object):
    """
    class that handles everything which relates to managing a single dialogues file
    """
    __DEFAULT_FILENAME="labelled_data.json"

    def __init__( self, filePath, fileName=None, dialogues=None ):
        """
        """
        self.set_dialogues( dialogues )
        self.set_file( filePath, fileName )
        self.addedDialogues = 0


    def set_dialogues( self, dialogues=None ):
        """
        """
        self.__dialogues = dialogues if dialogues else {}

    def set_file( self, filePath, fileName=None ):
        """
        sets the file and tries to load it to use
        """
        self.__filePath = filePath

        if fileName:
            self.__fileName = fileName
            try:
                self.__dialogues = load_json_file( os.path.join( self.__filePath, self.__fileName ) )
            except FileNotFoundError:
                save_json_file( obj=self.__dialogues, path=os.path.join( self.__filePath, self.__fileName ) )

        else:
            self.__fileName = DialogueAnnotator.__DEFAULT_FILENAME



    def get_dialogues(self, id=None):
        """
        Returns all dialogues or specific dialogue (as dict {id: dialogue} )
        """
        if id:
            return { "dialogue" : self.__dialogues.get(id) }

        return self.__dialogues


    def get_dialogues_metadata(self):
        """
        Gets the name of dialogues, returns a list
        """

        metadata = []

        for dialogueID, dialogueTurnList in self.__dialogues.items():
            print(dialogueID)

            metadata.append({"id": dialogueID, "num_turns": len(dialogueTurnList)})

        return metadata


    def update_dialogue(self, id, newDialogue ):
        """
        updates the dialogue
        """
        self.__dialogues[ id ] = newDialogue

        return {"status" : "success"}


    def update_dialogues(self, newDialogues):
        """
        updates all the dialogues with a new dictionary
        """
        self.__dialogues.update( newDialogues )

        return True


    def update_dialogue_name(self, id, newName):
        """
        updates the dialogue name
        """
        self.__dialogues[newName] = copy.deepcopy( self.__dialogues[id] )

        del self.__dialogues[id]


    def add_new_dialogue(self, dialogue=None, id=None):
        """
        creates a new dialogue with an optional name
        """
        self.addedDialogues += 1

        if not id:
            id = self.__get_new_dialogue_id()


        self.__dialogues[ id ] = dialogue if dialogue else []

        return {"id":id}


    def delete_dialogue(self, id):
        """
        Deletes a dialogue
        """
        del self.__dialogues[ id ]


    def save(self):
        """
        Save the dialogues dictionary
        """
        save_json_file( obj=self.__dialogues, path=os.path.join( self.__filePath, self.__fileName ) )




    def __get_new_dialogue_id(self):
        """
        """
        newId = "Dialogue" + str(self.addedDialogues)

        return newId




        # save_json_file( obj=self.__dialogues, path=self.__filePath )




################################################################################
# MAIN
################################################################################







# EOF
