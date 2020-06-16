##############################################
#  IMPORT STATEMENTS
##############################################

# == Native ==
import os
import sys
import json
import copy
from typing import Dict, List, Any, Tuple, Hashable, Iterable, Union

# == Flask ==

# == Local ==
from lida_app import *

##############################################
#  CODE
##############################################



# ====>> MAIN <<====

if __name__ == '__main__':

    app = LidaApp()
    # app = InterAnnotatorApp()

    app.run()
