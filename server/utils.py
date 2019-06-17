################################################################################
# IMPORTS
################################################################################

# >>>> Native <<<<
import os
import json

# >>>> Packages <<<<
from flask import Response

# >>>> Local <<<<
from typing import Dict, List, Any, Tuple, Hashable, Iterable, Union






################################################################################
# CODE
################################################################################


class EndpointAction(object):
    """
    https://stackoverflow.com/questions/40460846/using-flask-inside-class
    """
    def __init__(self, action):
        self.action = action

    def __call__(self, *args):
        answer = self.action(*args)
        self.response = Response(answer, status=200, headers={})
        return self.response


def load_json_file(path: str) -> Any:
    """Loads a JSON file."""
    with open(path, "r") as f:
        content = json.load(f)
    return content


def save_json_file(obj: Any, path: str) -> None:
    """Saves a JSON file."""
    with open(path, "w") as f:
        json.dump(obj, f, indent=4)
