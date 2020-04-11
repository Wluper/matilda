##############################################
#  IMPORT STATEMENTS
##############################################

# == Native ==
import os
import sys
import json
import copy
import json
from typing import Dict, List, Any, Tuple, Hashable, Iterable, Union
import functools

# == Flask ==
from flask import Flask
from flask_cors import CORS

# == Pymongo ==
from pymongo import MongoClient
from bson.objectid import ObjectId

# == Local ==
from utils import load_json_file, save_json_file

#********************************
# CONSTANTS
#********************************

databaseLocation = "localhost" 
databasePort = 27017

app = Flask("_database_")
client = MongoClient(databaseLocation,databasePort)
db = client.mymongodb
collection = db.lida

#********************************
# MAIN
#********************************

class DatabaseManagement(object):
	"""
	container for database functions
	"""
	__DEFAULT_PATH = "LIDA_ANNOTATIONS"

	responseObject = []

	def __init__(self, filePath, fileName=None, entries=None):
		#self.filePath = filePath
		self.set_entries(entries)
		self.set_file( filePath, fileName )
		self.addedEntries = 0

	def get_file_name(self):
		return { "name":self.__fileName}

	def set_entries( self, entries=None ):
		self.__entries = entries if entries else {}

	def set_file( self, filePath, fileName=None):

		self.__filePath = filePath

		if fileName:
			self.__fileName = fileName
			try:
				self.__entries = load_json_file( os.path.join( self.__filePath, self.__fileName ) )
			except FileNotFoundError:
				save_json_file( obj=self.__entries, path=os.path.join( self.__filePath, self.__fileName ) )
			else:
				self.__fileName = DatabaseManagement.__DEFAULT_FILENAME

	def save(self):
		save_json_file( obj=self.__entries, path=os.path.join( self.__filePath, self.__fileName ) )

	def getDatabaseIds(self):
		entries = {}
		collection_dict = collection.find()
		print(collection.find())
		for n,entry in enumerate(collection_dict,1):
			entries = {str(entry["_id"]):({"_id" : str(entry["_id"]), "data" : str(entry)})}
		#for key,value in collection_dict.next().items():
		#	response.append({key,str(value)})
		print(entries)
		return entries

	def deleteEntry(self,id):
		print("delete request for",id)
		collection.delete_one({"_id":id})
		return self.responseObject

	def updateDatabase(self,entry=None):
		#collection = collection #+username
		with open(self.__DEFAULT_PATH+"/Sara.json") as file:
			annotations = json.load(file)
		collection.insert_one({"_id":"15","data":annotations})
		return self.responseObject

#client.close()