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
classificationList = [
    ["a","b"],
    ["a","c"]
]

classificationList2 = [
    ["a","b"],
    ["a","b"]
]


clsStringList = [
    [("a","Hi"), ("b","Hi")],
    [("b", "Bye"), ("c", "Bye")]
]

clsStringList2 = [
    [("a","Hi"), ("b","Hi")],
    [("a", "Bye"), ("b", "Bye")]
]

clsStringList3 = [
    [("a","Hi"), ("b","Hi")],
    [("a", "Hi"), ("b", "Hi")]
]


##############################################
#  MAIN
##############################################

if __name__ == '__main__':

    # print( json.dumps( agreementConfig["multilabel_classification"](classificationList2) , indent=4 ) )

    print( json.dumps( agreementConfig["multilabel_classification_string"](clsStringList3) , indent=4 ) )


    # print( json.dumps(lida.LidaApp.run_models_on_query("Hi"), indent=4 ) )

    # print( json.dumps(Configuration.create_annotation_dict(), indent=4 ) )



# EOF
