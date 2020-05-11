##############################################
#  IMPORT STATEMENTS
##############################################

# >>>> Native <<<<
import os
import sys
import json
from json import loads
from typing import Dict, List, Any, Tuple, Hashable, Iterable, Union
from collections import defaultdict

# >>>> Local <<<<
from dummy_models import TypeDummyModel, BeliefStateDummyModel, PolicyDummyModel, SysDummyModel

##############################################
#                  CONFIG Dict
#
# The config dict describes all the data fields.
# This is also the place to specify models and label types.
#
# Available label types:
#
#     => "multilabel_classification" :: displays as checkboxes in front end
#
#     => "multilabel_classification_string" :: displays as a checkbox and text input for string value. Used for
#                                              slot-value pairs.
#
#     => "string" :: displays underneath the user utterance (indicated by label_type of "data")
#
#############################################

##############################################
#  CODE
##############################################


class Configuration(object):
    """
    class responsible for configuration and valid annotation structure
    """

    # Folder where annotation models are stored
    __DEFAULT_PATH = "annotation_styles"

    # Here the annotation model file name
    annotation_style = "unipi_model.json"
    
    with open(annotation_style) as style_file:
        configDict = json.load(style_file)

    #convert back functions and classes from string 
    for key,value in configDict.items():
        for sub_key,sub_value in value.items():
            if "()" in str(sub_value):
                configDict[key][sub_key] = eval(sub_value)

        #verify_imported_model()

    def verify_imported_model():
        #verify imported data types in model
        for key,value in configDict.items():
            print(key,":")
            for sub_key,sub_value in value.items():
                print("  ",sub_key,":",sub_value, "type",type(sub_value))

        #validation, if first model doesnt work tries next

    @staticmethod
    def validate_dialogue(dialogue: List[Dict[str, Any]]) -> Union[str, List[Dict]]:
        """
        validates the dialogue and makes sure it conforms to the configDict
        """
        for i, turn in enumerate(dialogue):

            for labelName, info in Configuration.configDict.items():

                try:
                    turn[labelName]
                except KeyError:

                    # turn 0 stores meta-tags
                    if i is 0:
                        continue

                    if info["required"]:
                        message = ("ERROR1: Label \'{}\' is listed as \"required\" in the " \
                                "config.py file, but is missing from the provided " \
                                "dialogue in turn {}.".format(labelName, i))
                        print(message)
                        return message

                    if info["required"] and not turn[labelName]:
                        message = ("ERROR2: Required label, \'{}\', does not have a value " \
                            "provided in the dialogue in turn {}".format(labelName, i))
                        print(message)
                        return message

                    if info["required"] and ("multilabel_classification" == info["label_type"]):

                        providedLabels = turn[labelName]

                        if not all(x in info["labels"] for x in providedLabels):
                            message = "ERROR3: One of the provided labels in the list: " \
                               "\'{}\' is not in allowed list according to " \
                               "config.py in turn {}".format(providedLabels, i)
                            print(message)
                            return message
                            
        return dialogue



    @staticmethod
    def create_annotation_dict():
        """
        Generates a dictionary mapping label names to a dictionary of their description, label types
        and, if applicable, the possible values the label can take.
        """
        out = {}

        for key,value in Configuration.configDict.items():

            temp = list(value["labels"]) if value.get("labels") else ""

            out[key] = {
                "label_type": value["label_type"],
                "labels": temp,
                "info": value["description"]
            }

        return out


    @staticmethod
    def create_empty_turn():
        """
        creates an empty turn based on the configuration dictionary
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








##############################################
#  MAIN
##############################################


# EOF
