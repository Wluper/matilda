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



################################################################################
# CODE
################################################################################

class AdminAnnotator(object):
    """
    class that handles everything which relates to managing a single dialogues file
    """
    __DEFAULT_FILENAME="admin.json"

    def __init__( self, filePath, fileName=None, dialogues=None ):
        """
        """
        self.set_dialogues( dialogues )
        self.set_file( filePath, fileName )
        self.addedDialogues = 0

    def get_file_name(self):
        """
        """
        return {"name": self.__fileName}

    def change_file_name(self, newName, remove=False):
        """
        """
        oldFileName = self.__fileName
        self.__fileName = newName

        #self.save()

        if remove:
            os.remove( os.path.join( self.__filePath, oldFileName ) )

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
                save_json_file( obj=self.__dialogues, path=os.path.join( self.__filePath, self.__fileName) )

        else:
            self.__fileName = AdminAnnotator.__DEFAULT_FILENAME

    def get_dialogue(self, id: Hashable) -> Dict[str, Any]:
        """Gets a single dialogue"""
        return {"dialogue": self.__dialogues.get(id)}

    def get_dialogues(self, id=None):
        """
        Returns all dialogues or specific dialogue (as dict {id: dialogue} )
        """
        return self.__dialogues

    def get_dialogues_metadata(self):
        """
        Gets the name of dialogues, returns a list
        """

        metadata = []

        for dialogueID, dialogueTurnList in self.__dialogues.items():

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
        for dId, newDialogue in newDialogues.items():

            temp = self.__dialogues.get( dId )
            if temp:
                newDialogue = newDialogue if len(newDialogue)>len(temp) else temp


            self.__dialogues[ dId ] = newDialogue

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
        #deactivated but working
        #save_json_file( obj=self.__dialogues, path=os.path.join( self.__filePath, "INTER_"+self.__fileName+".json" ) )




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
