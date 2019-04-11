##############################################
#  IMPORT STATEMENTS
##############################################

from dummy_models import *

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
