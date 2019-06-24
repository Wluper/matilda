##############################################
#  IMPORT STATEMENTS
##############################################

# == Native ==
import os
import sys
import json
import copy
from typing import Dict, List, Any, Tuple, Hashable, Iterable, Union

path = os.path.dirname(os.path.realpath(__file__))
sys.path.append(path + "/../server")


# == Local ==
import app
import lida_app as lida
from annotator_config import Configuration
from interannotator_config import agreementConfig

##############################################
#  CODE
##############################################

dialogue1 ={
    "Dialogue1": [
        {
            "hotel_belief_state": [
                [
                    "hotel-book people",
                    "1"
                ]
            ],
            "policy_funcs": [
                "Ask For Missing Slots"
            ],
            "query_type": [
                "farewell"
            ],
            "sys": "I am a mock model response",
            "usr": "Hi"
        }
    ]
}


##############################################
#  MAIN
##############################################

if __name__ == '__main__':

    print( json.dumps(Configuration.validate_dialogue(dialogue1["Dialogue1"]), indent=4 ) )



# EOF
