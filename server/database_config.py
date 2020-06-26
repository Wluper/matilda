##############################################
#  IMPORT STATEMENTS
##############################################

# == Native ==
import os
import sys
import json
import copy
import json
import datetime
from typing import Dict, List, Any, Tuple, Hashable, Iterable, Union
from pprint import pprint
import functools
import ast

# == Flask ==
from flask import Flask
from flask_cors import CORS

# == Pymongo ==
from pymongo import MongoClient
from bson.objectid import ObjectId


##############################################
#  CONFIGURATION VALUES
##############################################
# Config with your database

class DatabaseConfiguration:

#<<<<<<< HEAD
	databaseURL="mongodb://localhost"
#	databaseURL="mongodb+srv://<user>:<passwd>@cluster0-wyaud.mongodb.net/lida?retryWrites=true&w=majority"

	db = MongoClient(databaseURL)["lida"]
	print("Connecting to DB");
#	client = MongoClient("mongodb+srv://augusto:asterix@cluster0-wyaud.mongodb.net/<dbname>?retryWrites=true&w=majority")
#	db = client.mymongodb
#	serverStatusResult=db.command("serverStatus")
#	pprint(serverStatusResult)
#	collection = db.lida_database
#	users = db.lida_users
#	dialogues = db.lida_dialogues
#=======
#	databaseLocation = "localhost" 
#	databasePort = 27017

#	client = MongoClient(databaseLocation,databasePort)
#	db = client["lida"]

	users = db["users"]
	dialogueCollections = db["dialogues_collections"]
	annotatedCollections = db["annotated_collections"]
#>>>>>>> master

