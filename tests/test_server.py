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
from annotator_config import Configuration


##############################################
#  CODE
##############################################



##############################################
#  MAIN
##############################################

if __name__ == '__main__':

    print( json.dumps(app.LidaAppWrapper.run_models_on_query("Hi"), indent=4 ) )

    print( json.dumps(Configuration.create_annotation_dict(), indent=4 ) )



# EOF
