################################################################################
# IMPORTS
################################################################################

# >>>> Native <<<<
import os
import json
import copy
from typing import Dict, List, Any, Tuple, Hashable, Iterable, Union

# >>>> Flask <<<<
from flask import Flask, jsonify, request
from flask_cors import CORS

# >>>> Local <<<<
import annotator_config
from utils import load_json_file, save_json_file



################################################################################
# CODE
################################################################################

class DialogueAnnotator(object):
    """
    class that handles everything which relates to managing a single dialogues file
    """

    def __init__( self, filePath=None ):
        """
        """
        self.set_file(filePath)
        self.addedDialogues = 0



    def set_file( self, filePath=None ):
        """
        """
        if filePath:
            self.__filePath = filePath
            self.__dialogues = load_json_file()

        else:
            self.__filePath = ""
            self.__dialogues = {}


    def get_dialogues(self, id=None):
        """
        Returns all dialogues or specific dialogue (as dict {id: dialogue} )
        """
        if id:
            return {id : self.__dialogues[id]}

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


    def get_new_dialogue_id(self):
        """
        """
        newId = "Dialogue" + str(self.addedDialogues)

        self.addedDialogues += 1

        return newId





    def update_dialogue_name(self, id, newName):
        """
        updates the dialogue name
        """
        self.__dialogues[newName] = copy.deepcopy( self.__dialogues[id] )

        del self.__dialogues[id]

        # save_json_file( obj=self.__dialogues, path=self.__filePath )




################################################################################
# MAIN
################################################################################







# EOF
