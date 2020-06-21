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
import functools
import ast

# == Flask ==
from flask import Flask, jsonify
from flask_cors import CORS

# == Pymongo ==
from pymongo import MongoClient
from bson.objectid import ObjectId

# == Local ==
from utils import load_json_file, save_json_file
from database_config import DatabaseConfiguration
from annotator_config import Configuration

class DatabaseManagement(object):

	"""
	MAIN PART
	"""

	__DEFAULT_PATH = "LIDA_ANNOTATIONS"

	def selected(collection):
		if collection == "dialogues_collections":
			return DatabaseConfiguration.dialogueCollections
		elif collection == "annotated_collections":
			return DatabaseConfiguration.annotatedCollections
		else:
			return DatabaseConfiguration.users
	
	def readDatabase(coll,attribute,string=None, fields=None):
		# if field parameter is provided the search will be a projection of the id
		# and the requested field only.
		# if string is provided the search will be restricted to the string match
		# last parameter allow to restrict response to desired fields

		responseObject = []

		selected_collection = DatabaseManagement.selected(coll)

		print(" * Searching in:",coll,"for key '",attribute,"' with value '",string+"'")

		entries = {}

		#simple search for one interested field
		if string is not None:
			query = selected_collection.find({attribute:string})
		
		#search with projection of interested fields only
		elif fields is not None:
			projection = {}
			for element in fields:
				projection[element]=1
			query = selected_collection.find({},projection)
		
		#gets all
		else:
			query = selected_collection.find()

		for line in query:
			if line["_id"]:
				line["_id"] = str(line["_id"])
			responseObject.append(line)

		return responseObject

	def deleteDoc(collection, id):

		#delete a database document by id

		DatabaseManagement.selected(collection).delete_one({"id":id})

		responseObject = { "status":"success" }
		return responseObject

	def createDoc(document_id, collection, values):

		values["lastUpdate"] = datetime.datetime.utcnow()

		DatabaseManagement.selected(collection).save(values)
		
		response = {"staus":"success"}
		return response 

	def updateDoc(doc_id, collection, fields):

		fields["lastUpdate"] = datetime.datetime.utcnow()

		DatabaseManagement.selected(collection).update({ "id":doc_id }, { "$set": fields })


###############################################
# ANNOTATIONS AND DIALOGUE-COLLECTIONS UPDATE
################################################

	def storeAnnotations(username, destination, annotationRate, backup=None):

		#update the database user's document

		try:
			with open(DatabaseManagement.__DEFAULT_PATH+"/"+username+".json") as file:
				annotations = json.load(file)
		except:
			annotations = {}

		#if back up mode then saves with a different id and 
		# checks if document will be empty before saving
		name = username+"_"+destination

		if backup:
			if annotations != {}:
				name = "backup_"+username+"_"+destination
			else:
				responseObject = {"status":"empty"}
				return responseObject

		#saving or updating
		if len(DatabaseManagement.readDatabase("annotated_collections","id",name)) == 0:
			fields = {
				"id":name, 
				"fromCollection:":destination, 
				"annotator":username, 
				"done":False, 
				"status":annotationRate, 
				"document":annotations 
			}
			DatabaseManagement.createDoc(name, "annotated_collections", fields)
		else:
			fields = { "status":annotationRate, "document":annotations }
			DatabaseManagement.updateDoc(name, "annotated_collections", fields)
		
		responseObject = {"status":"success"}
		return responseObject	
