##############################################
#  IMPORT STATEMENTS
##############################################

# >>>> Native <<<<
import os
import sys
import json
import copy
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
#     => "multilabel_global_string"         :: same as multilabel_classification_string but global for the dialogue
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

    #accepted metaTags, can be customized
    metaTags = ["collection","status","ID"]

    @staticmethod
    def validate_dialogue(dialogue: List[Dict[str, Any]]) -> Union[str, List[Dict]]:
        """
        validates the dialogue and makes sure it conforms to the configDict
        """
        try:
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
        except:
            print("dialogue",i,"in list couldn't validate with the current annotation style model")
            return

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
# FUNCTIONS FOR FINDING THE ERRORS
##############################################


def agreement_classification(listOfClassifications):
    """
    computes, whether there is diagreement, the most likely prediction and confidences of each.
    """
    countDict = { "counts" : defaultdict(float), "predictions" : set()}
    counter = 0

    errorFlag = False

    for prediction in listOfClassifications:

        counter += 1

        for label in prediction:

            countDict["counts"][label] += 1

    if counter > 0:

        for key,value in countDict["counts"].items():

            temp = value/counter

            countDict["counts"][key] = temp

            if temp<1:

                errorFlag = True

    if errorFlag:
        for key,value in countDict["counts"].items():

            if value>=0.5:

                countDict["predictions"].add(key)

        countDict["predictions"] = list( countDict["predictions"] )
        return countDict

    else:
        return {}





def agreement_classification_string(listOfClassificationStrings):
    """
    computes, whether there is diagreement, the most likely prediction and confidences of each.
    """
    countDict = { "counts" : defaultdict(float), "predictions" : set()}

    valueDict = {}

    counter = 0

    errorFlag = False

    for prediction in listOfClassificationStrings:

        counter += 1

        for label in prediction:

            countDict["counts"][label[0]] += 1

            temp = valueDict.get(label[0])

            if temp:
                if not (temp==label[1]):
                    errorFlag = True
            else:
                valueDict[label[0]] = label[1]

    if counter > 0:

        for key,value in countDict["counts"].items():

            temp = value/counter

            countDict["counts"][key] = temp

            if temp<1:

                errorFlag = True


    if errorFlag:
        for key,value in countDict["counts"].items():

            if value>=0.5:

                countDict["predictions"].add(key)

        countDict["predictions"] = [ (x,y) for x in countDict["predictions"] for z,y in valueDict.items() if z==x]

        return countDict

    else:
        return {}






##############################################
# FUNCTIONS FOR CALCULATING THE SCORES
##############################################

def agreement_classification_score(listOfClassifications, totalLabels):
    """
    computes, whether there is diagreement, the most likely prediction and confidences of each.
    """
    countDict = { "counts" : defaultdict(float), "total" : 0 , "errors":0, "annotatedBy" : 0, "alpha" : 0.0 , "kappa" : 0.0, "accuracy" : 0 }
    counter = 0

    #getting raw counts
    for prediction in listOfClassifications:

        counter += 1

        for label in prediction:

            countDict["counts"][label] += 1

    countDict["annotatedBy"] = counter

    #getting error, `alpha` and `kappa` -> slightly modified version of Fleiss Kappa & Krippendorff Alpha
    errorCount = 0
    totalLabel = 0
    for label, count in countDict["counts"].items():

        totalLabel += 1

        if counter > count:

            errorCount += 1

    countDict["errors"] = errorCount
    countDict["total"] = totalLabel


    #kappa is calculated with uniform random probabilty for the chance
    A0 = (1 / (totalLabels * totalLabels ) )
    Ae = errorCount / totalLabels
    countDict["kappa"] = (Ae-A0) / (1-A0)


    #A02
    countDict["accuracy"] = errorCount/totalLabels

    return countDict






##############################################
# API to the outside world
##############################################

agreementConfig = {
    "data" : None,
    "string" : None,
    "multilabel_classification" : agreement_classification,
    "multilabel_classification_string" : agreement_classification_string,
    "multilabel_global_string" : agreement_classification_string
}

agreementScoreConfig = {
    "data" : None,
    "string" : None,
    "multilabel_classification" : agreement_classification_score,
    "multilabel_classification_string" : None,
    "multilabel_global_string" : None
}
