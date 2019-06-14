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


def generate_new_dialogue_id() -> str:

def get_dialogues_metadata() -> List[Dict[str, Union[str, int]]]:

#TODO ANNOTATOR
def add_new_dialogues_from_json_dict(currentResponseObject: Dict[str, Union[str, List[str]]],
                                     dialogueDict: Dict[str, List[dict]]) -> Dict[str, Union[str, List[str]]]:
    """Takes a dictionary of dialogues, checks their in the correct format and adds them to the main dialogues dict."""

    added_dialogues = []

    for dialouge_name, dialogue in dialogueDict.items():

        dialogue = Configuration.validate_dialogue(dialogue)

        if isinstance(dialogue, str):
            currentResponseObject["error"] = dialogue
            currentResponseObject["status"] = "error"
            break

        DIALOGUES[dialouge_name] = dialogue
        added_dialogues.append(dialouge_name)

    if "error" not in currentResponseObject:
        currentResponseObject["message"] = "Added new dialogues: " + " ".join(added_dialogues)

    return currentResponseObject



def add_new_dialogues_from_string_lists(currentResponseObject: Dict[str, Union[str, List[str]]],
                                        dialogueList: List[str]) -> Dict[str, Union[str, List[str]]]:
    """
    Takes lists of strings, each string corresponding to a dialogue, formats them into a dialogue, runs them
    through the models and adds them to the dialogue list. Returns a dict of info about dialogues added.
    """

    currentResponseObject["message"] = []
    currentResponseObject["new_dialogue_id"] = []

    for string_list in dialogueList:

        string_list      = [x for x in string_list.split("\n") if x.strip()]
        newId            = generate_new_dialogue_id()
        DIALOGUES[newId] = run_models_on_dialogue(convert_string_list_into_dialogue(string_list))

        currentResponseObject["message"].append("Added new dialogue: {}".format(newId))
        currentResponseObject["new_dialogue_id"].append(newId)

    return currentResponseObject





def run_models_on_dialogue(dialogue: List[Dict[str, Any]], dontRun: Tuple[str] = tuple(["sys"])) -> \
        List[Dict[str, Any]]:
    """
    Runs the models in the config dict on the user transcripts in each dialogue
    turn.

    Parameter "dontRun" specifies which models not to run.
    """

    dontRun = set(x for x in dontRun)

    newDialogue = []

    for turn in dialogue:

        userQuery = turn["usr"]

        for label, labelParams in Configuration.configDict.items():

            if label in dontRun:
                continue

            try:

                turn[label] = labelParams["model"].transform(userQuery)

            except KeyError:

                pass

        newDialogue.append(turn)

    return newDialogue







def handle_new_dialogues_post(currentResponseObject: Dict[str, Union[str, List[str]]]) -> \
        Dict[str, Union[str, List[str]]]:
    """Handles when a new dialogue is posted to the server"""

    string_list_or_json_dict = request.get_json()

    if isinstance(string_list_or_json_dict, str) or string_list_or_json_dict is None:

        currentResponseObject["error"]  = "JSON parsing failed"
        currentResponseObject["status"] = "error"
        return currentResponseObject

    elif isinstance(string_list_or_json_dict, list):

        return add_new_dialogues_from_string_lists(currentResponseObject, dialogueList=string_list_or_json_dict)

    elif isinstance(string_list_or_json_dict, dict):

        return add_new_dialogues_from_json_dict(currentResponseObject, dialogueDict=string_list_or_json_dict)

    return currentResponseObject






# ====>> ROUTES <<====

@app.route("/dialogues", methods=["GET", "POST"])
def get_dialouge_id_list():
    """
    TODO this function needs to be less monolithic
    """
    response_object = {"status": "success"}

    if request.method == "POST":

        data = request.get_json()

        if data:

            response_object = handle_new_dialogues_post(response_object)

        else:

            return generate_dialogue_id()


    elif request.method == "GET":

        response_object["metadata"] = get_dialogues_metadata()

    return jsonify(response_object)


# @app.route("/create_empty_dialogue", methods=["GET"])
def generate_dialogue_id():
    newId = generate_new_dialogue_id()
    DIALOGUES[newId] = []
    return jsonify({"generated_id": newId})


# @app.route("/dialogues/change_name/<dialogue_id>", methods=["PUT"])
# def change_dialogue§_name(dialogue_id):
def change_dialogue_name(oldName, newName):
    """
    Changes a dialogue name.
    """

    response_object = {
        "status": "success",
        "id"    : oldName
    }


    try:
        DIALOGUES[newName] = copy.deepcopy(DIALOGUES[oldName])
        del DIALOGUES[oldName]

    except KeyError:

        response_object["status"] = "error"
        response_object["error"] = \
        "Name to replace, \'{}\', doesn't exist on server".format(oldName)

    return jsonify(response_object)


@app.route("/dialogues/<dialogue_id>", methods=["GET", "PUT", "DELETE"])
def single_dialogue(dialogue_id):

    response_object = {
        "status" : "success",
        "id"     : dialogue_id
    }

    if request.method == "PUT":
        error = None
        data  = request.get_json()

        if not (type(data)==list):
            if data["id"]:
                return change_dialogue_name(dialogue_id, data["id"])

        data  = Configuration.validate_dialogue(data)

        if isinstance(data, str):
            error = data
            response_object["error"]  = error
            response_object["status"] = "error"
        else:
            DIALOGUES[dialogue_id]             = data
            response_object["update_complete"] = True
            save_json_file(DIALOGUES, WRITE_PATH)

    elif request.method == "DELETE":

        try:

            del DIALOGUES[dialogue_id]
            save_json_file(DIALOGUES, WRITE_PATH)

        except KeyError:

            response_object["status"] = "error"
            response_object["error"] = "Dialogue doesn't exist"

    elif request.method == "GET":

        try:
            response_object["dialogue"] = DIALOGUES[dialogue_id]
        except KeyError:
            response_object["status"] = "error"
            response_object["error"] = "Dialogue doesn't exist"

    return jsonify(response_object)


@app.route("/get_annotation_style", methods=["GET"])
def get_annotation_style():

    response_object = {
        "status": "success",
        "annotation": Configuration.create_annotation_dict()
    }

    return jsonify(response_object)


@app.route("/get_all_dialogues", methods=["GET"])
def get_all_dialogues():

    response_object = {
        "status": "success",
        "dialogues": DIALOGUES
    }

    return jsonify(response_object)


@app.route("/get_annotate_turn", methods=["GET"])
def get_annotate_turn():
    """Annotates a single turn with the models in the backend."""

    query = request.args.get("query")

    response_object = {
        "status":"success",
        "turn": Configuration.create_empty_dialogue(query)
    }

    for key, val in Configuration.configDict.items():

        try:

            response_object["turn"][key] = val["model"].transform(query)

        except KeyError:

            pass

    return jsonify(response_object)


# ====>> MAIN <<====

if __name__ == '__main__':

    DIRECTORY = "ANNOTATED_DATA"

    if not os.path.exists(DIRECTORY):

        os.mkdir(DIRECTORY)

    ANNOTATOR  = DialogueAnnotator( )

    # Flask
    app = Flask(__name__)
    app.config.from_object(__name__)

    # Enable CORS so that the app can communicate with the front end
    CORS(app)

    app.run(port=5000)
