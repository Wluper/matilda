##############################################
#  IMPORT STATEMENTS
##############################################

# == Native ==
import os
import sys
import json
import copy
from typing import Dict, List, Any, Tuple, Hashable, Iterable, Union

# == Flask ==
from flask import Flask, jsonify, request
from flask_cors import CORS

# == Local ==
from annotator_config import Configuration
from annotator import DialogueAnnotator
from text_splitter import convert_string_list_into_dialogue


##############################################
#  CODE
##############################################

class LidaApp(object):
    """
    Container Class that orchastrates the app.
    """
    __DEFAULT_PATH = "LIDA_ANNOTATIONS"
    app = None

    def __init__(self, path=None, multiAnnotator=False):
        """
        Creates the Flask App & setups all the api calls
        """
        # Flask
        self.app = Flask(__name__)
        self.app.config.from_object(__name__)
        CORS(self.app)

        # Initialising all the necessary classes & default paths.
        self.set_main_path(path)

        #AT THE MOMENT SINGLE FILE ONLY
        self.dialogueFile = DialogueAnnotator(self.path)

        # Setting the final endpoints
        self.setup_endpoints()


    def set_main_path(self, path=None):
        """
        creates the main path or
        """
        if path:
            self.path = path
        else:
            self.path = LidaApp.__DEFAULT_PATH

        if not os.path.exists(self.path):
            os.mkdir(self.path)


    def run(self, port=5000):
        """
        runs the app
        """
        self.app.run(port=port)


    def add_endpoint(self, endpoint=None, endpoint_name=None, methods=None, handler=None):
        """
        adds an endpoint to the API.
        """
        self.app.add_url_rule( endpoint, endpoint_name, handler, methods=methods )



    def setup_endpoints(self):
        """
        sets all the endpoints, that this app has.
        """
        self.add_endpoint( \
                            endpoint="/dialogues_metadata",
                            endpoint_name="/dialogues_metadata",
                            methods=["GET"],
                            handler= self.handle_dialogues_metadata_resource  )


        self.add_endpoint( \
                            endpoint="/dialogues_metadata/<id>",
                            endpoint_name="/dialogues_metadata/<id>",
                            methods=["PUT"],
                            handler= self.handle_dialogues_metadata_resource  )


        self.add_endpoint( \
                            endpoint="/dialogues",
                            endpoint_name="/dialogues",
                            methods=["GET","POST","DELETE"],
                            handler= self.handle_dialogues_resource )

        self.add_endpoint( \
                            endpoint="/dialogues/<id>",
                            endpoint_name="/dialogues/<id>",
                            methods=["GET", "POST", "PUT", "DELETE"],
                            handler= self.handle_dialogues_resource )


        self.add_endpoint( \
                            endpoint="/dialogue_annotationstyle",
                            endpoint_name="/dialogue_annotationstyle",
                            methods=["GET"],
                            handler= self.handle_annotations_resource )

        self.add_endpoint( \
                            endpoint="/turns",
                            endpoint_name="/turns",
                            methods=["POST"],
                            handler= self.handle_turns_resource  )

        self.add_endpoint( \
                            endpoint="/name",
                            endpoint_name="/name",
                            methods=["GET", "PUT"],
                            handler= self.handle_name_resource  )


    def handle_name_resource(self):
        """
        GET - Gets the fileName

        PUT - Updates the fileName
        """
        responseObject = {
            "status" : "success",
        }
        if request.method == "GET":
            responseObject.update( self.dialogueFile.get_file_name() )

        if request.method == "PUT":
            newName = request.get_json()["name"]
            self.dialogueFile.change_file_name(newName=newName)

        return jsonify(responseObject)



    def handle_dialogues_resource(self, id=None):
        """
        GET - All dialogues

        POST - Create a new one, either from data(json, string) or empty

        PUT - change specific dialogue with a dialogue
        """
        if id:

            if request.method == "GET":
                responseObject = self.dialogueFile.get_dialogue(id = id)

            if request.method == "PUT":
                data = request.get_json()
                Configuration.validate_dialogue( data )
                responseObject = self.dialogueFile.update_dialogue( id=id, newDialogue=data )

            if request.method == "DELETE":
                responseObject = self.dialogueFile.delete_dialogue(id=id)

        else:

            if request.method == "GET":
                responseObject = self.dialogueFile.get_dialogues()

            if request.method == "POST":
                responseObject = self.__handle_post_of_new_dialogues()

        self.dialogueFile.save()
        return jsonify( responseObject )


    def handle_dialogues_metadata_resource(self,id=None):
        """
        GET - All dialogues metadata

        PUT - Handle
        """
        if request.method == "GET":
            responseObject = self.dialogueFile.get_dialogues_metadata()


        if request.method == "PUT":
            error = None
            data  = request.get_json()

            responseObject = self.dialogueFile.update_dialogue_name( id, data["id"])

        self.dialogueFile.save()
        return jsonify( responseObject )


    def handle_annotations_resource(self):
        """
        GET - Returns the annotation style
        """
        return jsonify( Configuration.create_annotation_dict() )



    def handle_turns_resource(self):
        """
        POST - Returns the annotation style
        """

        if request.method == "POST":
            query = request.get_json()['query']

            responseObject = {
                "status" : "success",
            }

            responseObject.update( LidaApp.run_models_on_query(query) )

        else:

            responseObject = {
                "status" : "error",
                "error"  : "not available"
            }

        return jsonify( responseObject )


    def __handle_post_of_new_dialogues(self):
        """
        takes care of posting new dialogues
        """
        responseObject = {}

        stringListOrJsonDict = request.get_json()

        if isinstance(stringListOrJsonDict, str):
            responseObject["error"]  = "JSON parsing failed"
            responseObject["status"] = "error"

        elif not stringListOrJsonDict:
            responseObject = self.dialogueFile.add_new_dialogue()

        elif isinstance(stringListOrJsonDict, list):
            responseObject = self.__add_new_dialogues_from_string_lists(responseObject, dialogueList=stringListOrJsonDict)

        elif isinstance(stringListOrJsonDict, dict):
            responseObject = self.__add_new_dialogues_from_json_dict(responseObject, dialogueDict=stringListOrJsonDict)

        return responseObject




    def __add_new_dialogues_from_json_dict(self, currentResponseObject, dialogueDict):
        """
        Takes a dictionary of dialogues, checks their in the correct format and adds them to the main dialogues dict.
        """

        added_dialogues = []

        for dialouge_name, dialogue in dialogueDict.items():

            dialogue = Configuration.validate_dialogue(dialogue)

            if isinstance(dialogue, str):
                currentResponseObject["error"] = dialogue
                currentResponseObject["status"] = "error"
                break

            self.dialogueFile.add_new_dialogue(dialogue)

        if "error" not in currentResponseObject:
            currentResponseObject["message"] = "Added new dialogues: " + " ".join(added_dialogues)

        return currentResponseObject





    def __add_new_dialogues_from_string_lists(self, currentResponseObject, dialogueList):
        """
        Takes lists of strings, each string corresponding to a dialogue, formats them into a dialogue, runs them
        through the models and adds them to the dialogue list. Returns a dict of info about dialogues added.
        """

        currentResponseObject["message"] = []
        currentResponseObject["new_dialogue_id"] = []

        for string_list in dialogueList:

            string_list      = [x for x in string_list.split("\n") if x.strip()]
            newId = self.dialogueFile.add_new_dialogue( LidaApp.run_models_on_dialogue( convert_string_list_into_dialogue(string_list) ) )

            currentResponseObject["message"].append("Added new dialogue: {}".format(newId["id"]))
            currentResponseObject["new_dialogue_id"].append(newId["id"])

        return currentResponseObject


    @staticmethod
    def run_models_on_query(query):
        """
        runs the model on the query
        """
        outDict = {
            "turn"  : {}
        }

        outDict["turn"]["usr"] = query

        for key, val in Configuration.configDict.items():

            try:

                outDict["turn"][key] = val["model"].transform(query)

            except KeyError:

                pass

        return outDict

    @staticmethod
    def run_models_on_dialogue(dialogue, dontRun= tuple(["sys"])):
        """
        Runs the models in the config dict on the user transcripts in each dialogue
        turn.

        Parameter "dontRun" specifies which models not to run.
        """

        dontRun = set(x for x in dontRun)

        newDialogue = []

        for turn in dialogue:

            userQuery = turn["usr"]

            newDialogue.append( LidaApp.run_models_on_query(userQuery)["turn"] )

        return newDialogue



##############################################
# MAIN
##############################################

if __name__ == '__main__':

    app = LidaApp()

    app.run()
