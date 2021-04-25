################################################################################
# IMPORTS
################################################################################

# >>>> Native <<<<
import os
import json
import datetime
from typing import Dict, List, Any, Tuple, Hashable, Iterable, Union
from bson.objectid import ObjectId

# >>>> Packages <<<<
from flask import Response

# >>>> Local <<<<



################################################################################
# CODE
################################################################################

def load_json_file(path: str) -> Any:
    """Loads a JSON file."""
    with open(path, "r") as f:
        content = json.load(f)
    return content


def save_json_file(obj: Any, path: str) -> None:
    """Saves a JSON file."""
    with open(path, "w") as f:
        json.dump(obj, f, indent=4)


def database_uri_compose(config):
	"""Forms correct URI for database connection"""

	options = "retryWrites=true&w=majority"

	# if a mongoDB uri is provided
	if ((config["optional_uri"] != None) and (config["optional_uri"] != "")):

		databaseURL = config["optional_uri"]
	
	else:
		config = config["legacy_configuration"]
		
		if ((config["username"] == "") or (config["username"] == None)):
			auth = ""
		else:
			auth = config["username"]+":"+config["password"]+"@"

		if ((config["address"] == "localhost") or (config["address"] == "127.0.0.1")):
			databaseURL = "mongodb://"+auth+config["address"]
		else:
			databaseURL = "mongodb+srv://"+auth+config["address"]+"?"+options

	return databaseURL

def stringify(obj):
	if type(obj) == ObjectId or datetime:
		return str(obj)
	else:
		return json.dumps(obj)

# EOF
