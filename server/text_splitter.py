##############################################
#  IMPORT STATEMENTS
##############################################

# >>>> Native <<<<
from typing import Dict, List, Any, Tuple, Hashable, Iterable, Union





##############################################
#  CODE
##############################################

def convert_string_list_into_dialogue(stringList: List[str]) -> List[Dict[str, Any]]:
    """
    Converts a list of strings into a dialogue with the following assumptions:

        - (1) :: there are only two participants in the dialogue: user and sys
        - (2) :: user speaks first
    """

    dialogue    = []
    userTurn    = True
    currentTurn = {}
    turnIdx     = 1

    for providedString in stringList:

        if userTurn:

            currentTurn["usr"] = providedString
            userTurn = False

        else:

            currentTurn["sys"]      = providedString
            currentTurn["turn_idx"] = turnIdx
            dialogue.append(currentTurn)
            turnIdx    += 1
            currentTurn = {}
            userTurn    = True

    if currentTurn:
        currentTurn["turn_idx"] = turnIdx
        dialogue.append(currentTurn)
        turnIdx                += 1

    return dialogue





# EOF
