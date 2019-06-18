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


##############################################
#  CODE
##############################################



##############################################
#  MAIN
##############################################

if __name__ == '__main__':

    print( json.dumps(app.LidaAppWrapper.run_models_on_query("Hi"), indent=4 ) )


# EOF
