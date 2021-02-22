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
import matilda_app as matilda

from annotator_config import Configuration
from interannotator_config import agreementConfig

##############################################
#  CODE
##############################################


##############################################
#  MAIN
##############################################

if __name__ == '__main__':

    app = matilda.InterAnnotatorApp("TEST_DATA")

    app.run()

    # print( json.dumps( app.mock_handle_errors_resource(id="Dialogue1"), indent=4 ) )

    # print( json.dumps( app.mock_handle_errors_resource(id="Dialogue1"), indent=4 ) )

# EOF
