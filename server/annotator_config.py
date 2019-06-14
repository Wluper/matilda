##############################################
#  IMPORT STATEMENTS
##############################################

# >>>> Native <<<<
from typing import Dict, List, Any, Tuple, Hashable, Iterable, Union


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

    configDict = {

        "usr": {
            "description" : "The user's query",
            "label_type"  : "data",  # This type, "data", acts the same as "string" but will always be displayed first in UI
            "required"    : True
        },

        "query_type": {

            "description" : "Whether the query was request / inform / farewell",
            "label_type"  : "multilabel_classification",
            "required"    : False,
            "model"       : TypeDummyModel(),
            "labels"      : [

                "request",
                "inform",
                "farewell"

            ]

        },

        "hotel_belief_state": {

            "description" : "Slot-value pairs",
            "label_type"  : "multilabel_classification_string",
            "required"    : False,
            "model"       : BeliefStateDummyModel(),
            "labels"      : [

                "hotel-book people",
                "hotel-book stay",
                "hotel-book day",
                "hotel-name"

            ]

        },

        "policy_funcs": {

            "description" : "Policy functions called for this query",
            "label_type"  : "multilabel_classification",
            "required"    : False,
            "model"       : PolicyDummyModel(),
            "labels"      : [

                "Say Goodbye",
                "Find And Offer Booking",
                "Ask For Missing Slots",
                'Provide Info',
                'Try Book'

            ]

        },

        "sys": {
            "description" : "The system's response",
            "label_type"  : "string",
            "model"       : SysDummyModel(),
            "required"    : True
        }

    }

    @staticmethod
    def validate_dialogue(dialogue: List[Dict[str, Any]]) -> Union[str, List[Dict]]:
        """
        validates the dialogue and makes sure it conforms to the configDict
        """

        for i, turn in enumerate(dialogue):

            for labelName, info in self.configDict.items():

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



    @staticmethod
    def create_annotation_dict():
        """
        Generates a dictionary mapping label names to a tuple of their label types
        and, if applicable, the possible values the label can take.
        """
        out = {}

        for key,value in self.configDict.items():

            temp = list(value["labels"]) if value.get("labels") else ""

            out[key] = (value["label_type"], temp)

        return out


    @staticmethod
    def create_empty_turn():
        """
        creates an empty turn based on the configuration dictionary
        """
        pass

    @staticmethod
    def create_empty_dialogue():
        """
        creates an empty turn based on the configuration dictionary
        """
        pass


##############################################
#  MAIN
##############################################


# EOF
