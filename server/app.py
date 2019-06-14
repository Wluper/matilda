# ====>> IMPORTS <<====

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

# ====>> CONFIG <<====


def load_json_file(path: str) -> Any:
    """Loads a JSON file."""
    with open(path, "r") as f:
        content = json.load(f)
    return content


def save_json_file(obj: Any, path: str) -> None:
    """Saves a JSON file."""
    with open(path, "w") as f:
        json.dump(obj, f, indent=4)


# Settings
DIALOGUE_PATH = ""  # os.path.join(os.getcwd(), "dummy_data.json")
WRITE_PATH    = os.path.join(os.getcwd(), "labelled_data.json")
DIALOGUES     = load_json_file(DIALOGUE_PATH) if DIALOGUE_PATH else {}
DEBUG         = True
DIALOGUES_CREATED_THIS_SESSION = 0

# Flask
app = Flask(__name__)
app.config.from_object(__name__)

# Enable CORS so that the app can communicate with the front end
CORS(app)


# ====>> APP HELPER FUNCS <<====

def generate_empty_turn(query):
    """
    generates a turn according to  the annotation config
    """
    out = {}

    for key,value in Configuration.configDict.items():

        labelType = value["label_type"]

        if labelType == "data":
            out[key] = query

        elif labelType == "multilabel_classification" or \
             labelType == "multilabel_classification_string":

            out[key] = []

        elif labelType == "string":

            out[key] = ""

        else:

            raise ValueError("The label type, {}, is not supported"
                             .format(labelType))

    return out


def generate_new_dialogue_id() -> str:
    """Generates a new string ID for a dialogue."""
    global DIALOGUES_CREATED_THIS_SESSION
    newId = "Dialogue" + str(DIALOGUES_CREATED_THIS_SESSION)
    DIALOGUES_CREATED_THIS_SESSION += 1
    return newId


def check_dialogue(dialogue: List[Dict[str, Any]]) -> Union[str, List[Dict]]:
    """Checks if a new piece of data conforms to the config dict"""

    for i, turn in enumerate(dialogue):

        for labelName, info in Configuration.configDict.items():

            try:
                turn[labelName]
            except KeyError:
                if info["required"]:
                    return "Label \'{}\' is listed as \"required\" in the " \
                           "config.py file, but is missing from the provided " \
                           "dialogue in turn {}.".format(labelName, i)

            if info["required"] and not turn[labelName]:
                return "Required label, \'{}\', does not have a value " \
                       "provided in the dialogue in turn {}".format(labelName, i)

            if "classificaiton" in info["label_type"]:

                providedLabels = turn[labelName]

                if not all(x in info["labels"] for x in providedLabels):
                    return "One of the provided labels in the list: " \
                           "\'{}\' is not in allowed list according to " \
                           "config.py in turn {}".format(providedLabels, i)

    return dialogue


def generate_annotation_dict() -> Dict[str, Tuple[str, Union[str, List[str]]]]:
    """
    Generates a dictionary mapping label names to a tuple of their label types
    and, if applicable, the possible values the label can take.
    """
    out = {}

    for key,value in Configuration.configDict.items():

        temp = list(value["labels"]) if value.get("labels") else ""

        out[key] = (value["label_type"], temp)

    return out


def get_dialogues_metadata() -> List[Dict[str, Union[str, int]]]:
    """Gets the metadata associated with each dialogue"""

    metadata = []

    for dialogueID, dialogueTurnList in DIALOGUES.items():
        print(dialogueID)

        metadata.append({"id": dialogueID, "num_turns": len(dialogueTurnList)})

    return metadata


def convert_string_list_into_dialogue(stringList: List[str]) -> List[Dict[str, Any]]:
    """
    Converts a list of strings into a dialogue with the following assumptions:

        - (1) :: there are only two participants in the dialogue: user and sys
        - (2) :: user speaks first
    """

    dialogue    = []
    userTurn    = True
    currentTurn = {}
    turnIdx     = 1

    for providedString in stringList:

        if userTurn:

            currentTurn["usr"] = providedString
            userTurn = False

        else:

            currentTurn["sys"]      = providedString
            currentTurn["turn_idx"] = turnIdx
            dialogue.append(currentTurn)
            turnIdx    += 1
            currentTurn = {}
            userTurn    = True

    if currentTurn:
        currentTurn["turn_idx"] = turnIdx
        dialogue.append(currentTurn)
        turnIdx                += 1

    return dialogue


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


def add_new_dialogues_from_json_dict(currentResponseObject: Dict[str, Union[str, List[str]]],
                                     dialogueDict: Dict[str, List[dict]]) -> Dict[str, Union[str, List[str]]]:
    """Takes a dictionary of dialogues, checks their in the correct format and adds them to the main dialogues dict."""

    added_dialogues = []

    for dialouge_name, dialogue in dialogueDict.items():

        dialogue = check_dialogue(dialogue)

        if isinstance(dialogue, str):
            currentResponseObject["error"] = dialogue
            currentResponseObject["status"] = "error"
            break

        DIALOGUES[dialouge_name] = dialogue
        added_dialogues.append(dialouge_name)

    if "error" not in currentResponseObject:
        currentResponseObject["message"] = "Added new dialogues: " + " ".join(added_dialogues)

    return currentResponseObject


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

        data  = check_dialogue(data)

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
        "annotation": generate_annotation_dict()
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
        "turn": generate_empty_turn(query)
    }

    for key, val in Configuration.configDict.items():

        try:

            response_object["turn"][key] = val["model"].transform(query)

        except KeyError:

            pass

    return jsonify(response_object)


# ====>> MAIN <<====

if __name__ == '__main__':
    app.run(port=5000)
