##############################################
#  IMPORT STATEMENTS
##############################################

# == Native ==
import os
import sys
import json
import copy
import datetime
import logging
from typing import Dict, List, Any, Tuple, Hashable, Iterable, Union
from collections import defaultdict

# == Flask ==
from flask import Flask, jsonify, request, render_template, session
from flask_cors import CORS

# == Logging ==
logging.basicConfig(
    filename='matilda.log', 
    level=logging.DEBUG, 
    format='%(asctime)s %(message)s', 
    datefmt='%m/%d/%Y %I:%M:%S %p', 
    style='%')
# == Local Import ==
from annotator_config import *
from annotator import DialogueAnnotator, MultiAnnotator
from database import DatabaseManagement, LoginFuncs

##############################################
#  MAIN
##############################################

"""
Container Class that orchastrates the app.
"""

__DEFAULT_PATH = "LIDA_ANNOTATIONS"
path = __DEFAULT_PATH
multiAnnotator=False

MatildaApp = Flask(__name__,
    static_url_path='',
    static_folder='gui',
    template_folder='gui')
MatildaApp.config.from_object(__name__)
MatildaApp.config['SECRET_KEY'] = os.urandom(12)
#MatildaApp.debug = True
CORS(MatildaApp)
#set_main_path(path)
#main modules
dialogueFile = DialogueAnnotator(path)
annotationFiles = MultiAnnotator(path)
jsonConf = Configuration.conf["app"]
#database and account init
LoginFuncs.start()
sessionGuard = jsonConf["session_guard"]

@MatildaApp.route('/')
def welcome():
    return render_template("index.html")

##############################################
#  FUNCTION HANDLERS
##############################################

@MatildaApp.route('/configuration', methods=['GET'])
@MatildaApp.route('/configuration/<annotationStyle>', methods=['GET','POST','PUT'])
@MatildaApp.route('/configuration/change/<option>', methods=['POST'])
def handle_configuration_file(annotationStyle=None, option=None):
    """
    Returns the annotation styles registered in configuration json
    """
    responseObject = { "status":"fail" }

    if request.method == "GET":

        #configuration requested
        if annotationStyle is None:
            for section in Configuration.conf:
                responseObject[section] = Configuration.conf[section]
                if (type(section)) != str:
                    for setting in section:
                        responseObject[setting][section] = setting

            responseObject["app"]["docker"] = Configuration.DOCKER

            #default mongodb databases not listed
            ignoreList = ["admin","config","local"]

            responseObject["databaseList"] = {}
            for db in DatabaseManagement.client.list_databases():
                if db["name"] not in ignoreList:
                    responseObject["databaseList"][db["name"]] = db

        #annotationStyle requested
        else:     
            with open(Configuration.DEFAULT_PATH+annotationStyle) as style_file:
                responseObject["annotationStyle"] = json.load(style_file)
        
        responseObject["status"] = "done"

    if request.method == "POST":

        data = request.get_json()

        if option:
            newValue = data["json"]["new_value"]

            if option == "full_logs":
                #saving new option
                jsonConf["full_log"] = newValue
                #changing on runtime
                if jsonConf["full_log"] is not True:
                    logging.disable(logging.INFO)
                else:
                    logging.disable(logging.NOTSET)

                #writing new option in configuration file
                with open(Configuration.DEFAULT_PATH+"conf.json", "w") as configurationFile:
                    configurationFile.write(json.dumps(Configuration.conf, indent=4))
                    configurationFile.close()

        else:
            newOption = data["json"]

            #backup of previous configuration
            with open(Configuration.DEFAULT_PATH+"conf.old.json", "w") as configurationOld:
                configurationOld.write(json.dumps(Configuration.conf, indent=4))
                configurationOld.close()

            #editing and overwriting memorized configuration file
            Configuration.annotation_styles = newOption

            Configuration.conf["app"]["annotation_models"] = newOption

            #dumping new configuration file
            with open(Configuration.DEFAULT_PATH+"conf.json", "w") as configurationFile:
                configurationFile.write(json.dumps(Configuration.conf, indent=4))
                configurationFile.close()

        responseObject["status"] = "done"


    if request.method == "PUT":

        #overwrite or create a new annotation style with the provided name

        data = request.get_json()

        newFile = data["json"]
        newFile = json.loads(newFile)

        #normalize name
        if ".json" in annotationStyle:
            annotationStyle = annotationStyle.replace(".json", "")

        """
        #check for file name conflicts
        if annotationStyle+".json" in Configuration.conf["app"]["annotation_models"]:
            responseObject = {
                "status":"fail", 
                "error":"Server error. It exists an annotation style with the same name"
            }
            return responseObject
        """
        
        #uploading
        try:
            with open(Configuration.DEFAULT_PATH+annotationStyle+".json", "w") as new_style_file:
                new_style_file.write(json.dumps(newFile, indent=4))
                new_style_file.close()                  

            #backup of previous configuration
            with open(Configuration.DEFAULT_PATH+"conf.old.json", "w") as configurationOld:
                configurationOld.write(json.dumps(Configuration.conf, indent=4))
                configurationOld.close()

            #editing and overwriting memorized configuration file
            if annotationStyle+".json" not in Configuration.conf["app"]["annotation_models"]:
                Configuration.conf["app"]["annotation_models"].append(annotationStyle+".json")

            #dumping new configuration file
            with open(Configuration.DEFAULT_PATH+"conf.json", "w") as configurationFile:
                configurationFile.write(json.dumps(Configuration.conf, indent=4))
                configurationFile.close()

            #loading new annotation style
            with open(Configuration.DEFAULT_PATH+annotationStyle+".json") as style_file:
                Configuration.configDict[annotationStyle+".json"] = json.load(style_file)  

        except Exception as ex:
            responseObject = { "status":"fail", "error":ex }
            return responseObject

        responseObject["status"] = "done"

    return jsonify( responseObject )

@MatildaApp.route('/logs/<complete>',methods=['GET'])
@MatildaApp.route('/logs',methods=['GET'])
def handle_logs_request(complete=None):

    if request.method == "GET":

        try:
            with open("matilda.log", "r") as file:
                logs = file.readlines()
                file.close()
        
        except FileNotFoundError:
            return {"status":"done", "logs":"Logs not active"}            

        out = []
        if complete is None:
            if len(logs) > 50:
                for log in range( len(logs)-50 , len(logs) ):
                    out.append(logs[log])
            else:       
                out = logs
        else:
            out = logs

        responseObject = {"status":"done", "logs":out}

        return jsonify( responseObject )

    


@MatildaApp.route('/<user>/dialogues_metadata/<collection>',methods=['GET'])
@MatildaApp.route('/<user>/dialogues_metadata/<id>',methods=['PUT'])
def handle_dialogues_metadata_resource(user, id=None, collection=None):
    """
    GET - All dialogues metadata

    PUT - Handle
    """
    if request.method == "GET":
        responseObject = dialogueFile.get_dialogues_metadata(user)

        # temporary troublefix for a bug:
        # if you are annotating a dialogue and the server rebooted
        # the update performed on the dialogue will insert that dialogue
        # in the user session but that dialogue will be the only one there
        # until the collection will be entirely reloaded
        # then the updated performed on the database will overwrite the 
        # document with the new, empty, session.

        if len(responseObject) == 1:
            docRetrieved = DatabaseManagement.readDatabase("annotated_collections",{"id":collection, "annotator":user})

            #update dialogue source
            try:
                for docCollection in docRetrieved:
                    dialogueFile.update_dialogues(user, docCollection["document"])
            except:
                #reload session
                dialogueFile.create_userspace(user)
                for docCollection in docRetrieved:
                    dialogueFile.update_dialogues(user, docCollection["document"])

            dialogueFile.change_collection(user, collection)

            responseObject = dialogueFile.get_dialogues_metadata(user)

        #end of fix

    if request.method == "PUT":
        error = None
        data  = request.get_json()

        dialogueFile.update_dialogue_name( user, id, data["id"])

        responseObject = {"status":"success"}

    #dialogueFile.save(user)
    return jsonify( responseObject )

@MatildaApp.route('/collections_and_annotations_meta',methods=['GET'])
def handle_collections_and_annotations_metadata():
    """
    GET - All Collections metadata, with related annotations metadata

    PUT - Handle
    """
    if request.method == "GET":

        responseObject = []

        docsRetrieved = DatabaseManagement.readDatabase("dialogues_collections",{},{"id":1,"gold":1,"assignedTo":1,"annotationStyle":1,"document":"length"} )

        for document in docsRetrieved:
            if document["gold"] != {}:
                document["gold"] = True
            else:
                document["gold"] = False
            #retrieve annotations' completion rates
            document["rates"] = {}
            if len(document["assignedTo"]) != 0:
                annotations = DatabaseManagement.readDatabase("annotated_collections",{"id":document["id"]},{"annotator":1,"status":1} )
                for annotation in annotations:
                    if annotation["annotator"] in document["assignedTo"]:
                        document["rates"][annotation["annotator"]] = annotation["status"]
                responseObject.append(document)

    return jsonify( responseObject )

@MatildaApp.route('/<user>/dialogues',methods=['GET','POST','DELETE'])
@MatildaApp.route('/<user>/dialogues/<id>/<fileName>',methods=['GET','POST','DELETE'])
@MatildaApp.route('/<user>/dialogues/<fileName>/<id>',methods=['PUT'])
@MatildaApp.route('/<user>/dialogues/collection/<fileName>',methods=['POST'])
@MatildaApp.route('/supervision/<supervisor>/dialogues/<id>',methods=['GET'])
def handle_dialogues_resource(user=None, id=None, fileName=None, supervisor=None):
    """
    GET - All dialogues

    POST - Create a new one, either from data(json, string) or empty

    PUT - change specific dialogue with a dialogue
    """

    if request.method == "PUT":
        data = request.get_json()
        #fileName = (data[0]["collection"])

        annotationStyle = retrieve_annotation_style_name(fileName)

        Configuration.validate_dialogue( annotationStyle, data )

        DatabaseManagement.updateDoc({"id":fileName, "annotator":user}, "annotated_collections", {"document"+"."+id:data})

        try:
            dialogueFile.update_dialogue(user, id=id, newDialogue=data )
        except:
            #reload session if needed
            __load_collection_from_database(user, fileName)
            responseObject = dialogueFile.update_dialogue(user, id=id, newDialogue=data )

        responseObject = { "status": "success" }

    if supervisor:
        responseObject = dialogueFile.get_dialogue("Su_"+supervisor, id = id)
        return jsonify(responseObject)

    elif fileName:

        if request.method == "GET":
            try:
                responseObject = dialogueFile.get_dialogue(user, id = id)
            except:
                #reload session if needed
                __load_collection_from_database(user, fileName)
                responseObject = dialogueFile.get_dialogue(user, id = id)

        if request.method == "POST":
            responseObject = __handle_post_of_new_dialogues(user, fileName)
            #dialogueFile.save(user)

    elif id:

        if request.method == "GET":
            responseObject = dialogueFile.get_dialogue(user, id = id)

        if request.method == "DELETE":
            responseObject = dialogueFile.delete_dialogue(user, id=id)

    else:

        if request.method == "GET":
            responseObject = dialogueFile.get_dialogues(user)

        if request.method == "POST":
            responseObject = __handle_post_of_new_dialogues(user)
            #dialogueFile.save(user)

    return jsonify( responseObject )

@MatildaApp.route('/registered_annotationstyles', methods=['GET'])
def retrieve_and_return_annotation_styles():
    """
    Returns the annotation styles registered in configuration json
    """
    responseObject = {"registered_models": Configuration.annotation_styles}

    return jsonify( responseObject )

@MatildaApp.route('/dialogue_annotationstyle/<collection>', methods=['GET'])
@MatildaApp.route('/<user>/dialogue_annotationstyle/<collection>/<id>',methods=['GET'])
@MatildaApp.route('/supervision/<supervisor>/dialogue_annotationstyle/<collection>/<id>', methods=['GET'])
def handle_annotation_style_resource(collection,user=None,id=None,supervisor=None):
    """
    GET - Returns the annotation style for different workspace "global admin", "user specific" or "supervision"
    """

    #retrieve and load correct annotation style
    annotationStyle = retrieve_annotation_style_name(collection)

    #return data for the right view
    if supervisor:
        dialogue = dialogueFile.get_dialogue("Su_"+supervisor, id = id)
        Configuration.validate_dialogue(annotationStyle,dialogue["dialogue"])
        return jsonify( Configuration.create_annotation_dict(annotationStyle) )
    
    if not user and not id:
        return jsonify( Configuration.create_annotation_dict(annotationStyle) )

    else:
        try:
            dialogue = dialogueFile.get_dialogue(user, id = id)
        except:
            #reload session
            __load_collection_from_database(user,collection)
            dialogue = dialogueFile.get_dialogue(user, id = id)
        
        try:
            Configuration.validate_dialogue(annotationStyle,dialogue["dialogue"])
        except:
            return {"status":"fail"}

        return jsonify( Configuration.create_annotation_dict(annotationStyle) )

@MatildaApp.route('/turns',methods=['POST'])
def handle_turns_resource():
    """
    POST - Returns the annotation style
    """
    if request.method == "POST":
        query = request.get_json()['query']

        responseObject = {
            "status" : "success",
        }

        responseObject.update( Models.run_models_on_query(query) )

    else:

        responseObject = {
            "status" : "error",
            "error"  : "not available"
        }

    return jsonify( responseObject )

@MatildaApp.route('/<user>/name',methods=['GET','PUT'])  
def handle_name_resource(user):
    """
    GET - Gets the fileName

    PUT - Updates the fileName
    """
    responseObject = {
        "status" : "success",
    }

    if request.method == "PUT":
        dialogueFile.create_userspace(user)

    return jsonify(responseObject)

@MatildaApp.route('/database', methods=['GET'])
@MatildaApp.route('/<user>/database/<mode>/<activecollection>',methods=['PUT'])
@MatildaApp.route('/database/<DBcollection>',methods=['POST'])
@MatildaApp.route('/database/<id>/<DBcollection>',methods=['GET','POST'])
def handle_database_resource(id=None, user=None, mode=None, DBcollection=None, activecollection=None):
    """
    GET - Gets the dialogues id in the database collection for the user
        or Gets an entire database document 

    POST - Gets all dialogues in the database and import them

    PUT - Updates the database collection

    DELETE - Delete an entry in collection

    """

    if not DBcollection:
        DBcollection = "dialogues_collections"

    responseObject = {}

    if user:
        if request.method == "PUT":

            values = request.get_json()

            if mode == "annotations":
                responseObject = DatabaseManagement.storeAnnotations( user, activecollection, values )
            else:
                responseObject = DatabaseManagement.updateAnnotations( user, activecollection, values )

        #if request.method == "GET":
        #    responseObject = DatabaseManagement.getDatabaseIds()

    elif id:
        if request.method == "GET":
            responseObject = DatabaseManagement.readDatabase(DBcollection,{"id":id})

        #if request.method == "POST":
            #responseObject = DatabaseManagement.getUserEntry(id)

    elif ((not id) and (request.method == "POST")):
        
        pair = request.get_json()
        pair = json.loads(pair["search"])

        responseObject.update( DatabaseManagement.deleteDoc(DBcollection, pair) )

    #else:
        #responseObject = DatabaseManagement.getDatabaseIds()

    return jsonify(responseObject)    


@MatildaApp.route('/database/download', methods=['GET'])
def handle_database_dump():

    responseObject = DatabaseManagement.dumpDatabase()

    return jsonify(responseObject)


@MatildaApp.route('/<user>/dialogue/<id>/<tag>/<value>',methods=['GET','PUT']) 
def handle_dialogues_tag(user, id, tag, value):

    responseObject = {
        "status" : "success"
    }

    if request.method == "POST":
        dialogueFile.insert_meta_tags(user, id, tag, value)

    return jsonify( responseObject )


@MatildaApp.route('/<supervisor>/supervision',methods=['GET'])
@MatildaApp.route('/<supervisor>/supervision/<annotator>/<doc>',methods=['PUT'])
def handle_supervision_mode(supervisor,annotator=None,doc=None):

    responseObject = {"status":"pending"}

    if request.method == "PUT":
    
        #first wipe destination workspace
        dialogueFile.clean_workspace("Su_"+supervisor)
    
        #then load and import dialogues
        docRetrieved = DatabaseManagement.readDatabase("annotated_collections",{"id":doc,"annotator":annotator})
        if len(docRetrieved) != 0:
            for docCollection in docRetrieved:
                __add_new_dialogues_from_json_dict("Su_"+supervisor, doc, responseObject, dialogueDict=docCollection["document"])

        responseObject = {"status":"success"}

    if request.method == "GET":

        responseObject = dialogueFile.get_dialogues_metadata("Su_"+supervisor)

    return jsonify(responseObject)

@MatildaApp.route('/<user>/annotations_load/<doc>',methods=['PUT'])
@MatildaApp.route('/<user>/annotations_recover/<doc>',methods=['GET'])
def handle_switch_collection_request(user, doc):

    responseObject = {"status":"fail", "created":False}

    #get collection document from database
    if request.method == "PUT":

        docRetrieved = DatabaseManagement.readDatabase("annotated_collections",{"id":doc,"annotator":user})
        #first checks if exists an annotated version for the user
        if len(docRetrieved) == 0:
            logging.info(" * No annotated version for user "+user+" creating...")
            docRetrieved = DatabaseManagement.readDatabase("dialogues_collections",{"id":doc})
            #create document 
            values = {
                "id":doc, 
                "fromCollection":doc, 
                "annotator":user, 
                "done":False, 
                "status":"0%",
                "document":docRetrieved[0]["document"],
                "lastUpdate":datetime.datetime.utcnow()
            }
            DatabaseManagement.createDoc(doc, "annotated_collections", values)
            responseObject["created"] = True

        #import and format new dialogues
        for docCollection in docRetrieved:
            __add_new_dialogues_from_json_dict(user, doc, responseObject, dialogueDict=docCollection["document"])

        dialogueFile.change_collection(user, doc)
        responseObject["status"] = "success"

        return jsonify( responseObject )

    else:
        docRetrieved = DatabaseManagement.readDatabase("annotated_collections",{"id":doc, "annotator":user})

    #update dialogue source
    for docCollection in docRetrieved:
        dialogueFile.update_dialogues(user, docCollection["document"])

    dialogueFile.change_collection(user, doc)

    responseObject = { "status": "success" }

    return jsonify( responseObject )


@MatildaApp.route('/<user>/backup/<activecollection>',methods=['PUT'])
def handle_backup_resource(user, activecollection):
    """
    GET - Gets the database collection
    """
    responseObject = {}

    fields = request.get_json()

    if request.method == "PUT":
        responseObject = DatabaseManagement.storeAnnotations(user, activecollection, fields, True)

    return jsonify(responseObject)

#################################################
# ADMIN ROUTES
#################################################

@MatildaApp.route('/dialogues_metadata/<id>',methods=['GET'])
@MatildaApp.route('/dialogues_metadata/<id>', methods=['PUT'])
def admin_dialogues_metadata_resource(id):
    """
    GET - All dialogues metadata for interannotator

    PUT - Handle
    """

    responseObject = {}

    if request.method == "GET":
        responseObject["metadata"] = annotationFiles.get_dialogues_metadata()
        # and calculate errors
        responseObject["errorList"] = restore_errorsList(id)

    if request.method == "PUT":
        error = None
        data  = request.get_json()

        responseObject = annotationFiles.update_dialogue_name( id, data["id"])

    #annotationFiles.save()
    return responseObject

@MatildaApp.route('/dialogues', methods=['GET','POST','DELETE'])
@MatildaApp.route('/dialogues/<collection>/<id>', methods=['GET','POST','PUT','DELETE'])
def admin_dialogues_resource(id=None, collection=None):
    """
    GET - All dialogues

    POST - Create a new one, either from data(json, string) or empty

    PUT - change specific dialogue with a dialogue
    """
    if id:

        if request.method == "GET":

            if id:
                responseObject = annotationFiles.get_dialogue(id)
            else:
                responseObject = annotationFiles.get_dialogues()

        if request.method == "PUT":

            currentResponseObject = {}
            annotationStyle = retrieve_annotation_style_name(collection)

            data = request.get_json()
            data = Configuration.validate_dialogue( annotationStyle, data )

            if isinstance(data, str):
                currentResponseObject["error"] = data
                currentResponseObject["status"] = "error"
                return jsonify( currentResponseObject )

            responseObject = annotationFiles.update_dialogue( id=id, newDialogue=data )

        #if request.method == "DELETE":
        #    responseObject = annotationFiles.delete_dialogue(id=id)

    else:

        if request.method == "GET":
            responseObject = annotationFiles.get_dialogues()

        if request.method == "POST":
            responseObject = admin_post_of_new_dialogues()

    #annotationFiles.save()
    return jsonify( responseObject )


@MatildaApp.route('/errors', methods=['PUT'])
@MatildaApp.route('/errors/<collection>/<id>', methods=['GET'])
def handle_errors_resource(id=None, collection=None):
    """
    POST - Returns the annotation style
    """

    if request.method == "GET":

        responseObject = {
            "status" : "success",
        }

        listOfDialogue = annotationFiles.get_all_files( dialogueId = id )

        errorList = annotationFiles.annotatorErrors.get(id)

        if errorList:
            metaList = annotationFiles.annotatorErrorsMeta[id]
            errorMetaDict = {"errors": errorList, "meta": metaList}

        else:
            errorMetaDict = InterannotatorMethods.find_errors_in_list_of_dialogue( collection,listOfDialogue )
            annotationFiles.annotatorErrors[id] = errorMetaDict["errors"]
            annotationFiles.annotatorErrorsMeta[id] = errorMetaDict["meta"]

        for error in errorMetaDict["errors"]:
            __update_gold_from_error_id(id, error)

        responseObject.update(errorMetaDict)


    elif request.method == "PUT":

        responseObject = {"status":"success"}

        data = request.get_json()

        for i in range(len(data)):
            meta = data[i]["meta"]
            error = data[i]["errorObject"]
            dialogueId = data[i]["dialogueId"]
            errorId = data[i]["errorId"]
            collectionId = data[i]["collectionId"]

            __update_gold_from_error_id(dialogueId, error, collectionId)

            annotationFiles.annotatorErrors[dialogueId][errorId] = error
            annotationFiles.annotatorErrorsMeta[dialogueId][errorId] = meta

            DatabaseManagement.updateDoc({"id":collectionId}, "dialogues_collections", { "errors": { "errorsList":annotationFiles.annotatorErrors, "errorsMeta":annotationFiles.annotatorErrorsMeta} })

    else:

        responseObject = {
            "status" : "error",
            "error"  : "not available"
        }

    return jsonify( responseObject )

@MatildaApp.route('/errors/check_or_restore/<collectionId>', methods=['GET'])
def restore_errorsList(collectionId):

    errorObject = {}

    search = DatabaseManagement.readDatabase("dialogues_collections", {"id":collectionId}, {"document","errors", "gold"})

    if search[0]["errors"] != {}:

        annotationFiles.annotatorErrors = search[0]["errors"]["errorsList"]
        annotationFiles.annotatorErrorsMeta = search[0]["errors"]["errorsMeta"]

        errorObject = {
            "errors" : search[0]["errors"]["errorsList"],
            "meta" : search[0]["errors"]["errorsMeta"]
        }

    else:
        #nothing to restore, performs new error scan
        for dialogue in search[0]["document"]:

            listOfDialogue = annotationFiles.get_all_files( dialogueId = dialogue )

            errorList = annotationFiles.annotatorErrors.get(dialogue)

            if errorList:
                metaList = annotationFiles.annotatorErrorsMeta[dialogue]
                errorMetaDict = {"errors": errorList, "meta": metaList}

            else:
                errorMetaDict = InterannotatorMethods.find_errors_in_list_of_dialogue( collectionId, listOfDialogue )
                annotationFiles.annotatorErrors[dialogue] = errorMetaDict["errors"]
                annotationFiles.annotatorErrorsMeta[dialogue] = errorMetaDict["meta"]

            for error in errorMetaDict["errors"]:
                __update_gold_from_error_id(dialogue, error)

            DatabaseManagement.updateDoc({"id":collectionId}, "dialogues_collections", { 
                "errors": { 
                    "errorsList":annotationFiles.annotatorErrors, 
                    "errorsMeta":annotationFiles.annotatorErrorsMeta
                } 
            })
        
        errorObject = {"errors":annotationFiles.annotatorErrors}

    return errorObject



@MatildaApp.route('/agreements/<collection>', methods=['GET'])
def handle_agreements_resource(collection):
    """
    GET - Returns the interannotator agreement
    """
    if request.method == "GET":

        responseObject = {
            "status" : "success",
        }

        annotationStyle = retrieve_annotation_style_name(collection)

        totalTurns = 0

        totalAnnotations = 0
        errors = 0
        kappa = 0
        accuracy = 0

        dialogues = [ x[0] for x in annotationFiles.get_dialogues_metadata() ]

        for name in dialogues:

            listOfDialogue = annotationFiles.get_all_files( dialogueId = name )

            turnsData = InterannotatorMethods.get_turns_data( listOfDialogue )

            for turn in turnsData:
                totalTurns += 1
                for annotationName, listOfAnnotations in turn.items():

                    if annotationName=="turn_idx" or annotationName=="turn_id":
                        continue

                    if annotationName not in Configuration.metaTags:
 
                        annotationType = Configuration.configDict[annotationStyle][annotationName]["label_type"]

                        agreementScoreFunc = agreementScoreConfig[ annotationType ]

                        if agreementScoreFunc:
                            totalLabels = len( Configuration.configDict[annotationStyle][annotationName]["labels"] )
                            temp = agreementScoreFunc( listOfAnnotations, totalLabels )

                            errors += temp.get("errors")
                            totalAnnotations += totalLabels
                            kappa += temp.get("kappa")
                            accuracy += temp.get("accuracy")

        responseObject["errors"] = errors
        responseObject["total"] = totalAnnotations
        responseObject["kappa"] = kappa / totalTurns
        responseObject["accuracy"] = accuracy  / totalTurns

    else:

        responseObject = {
            "status" : "error",
            "error" : "Something truly frightening is happening on the backend."
        }


    return jsonify( responseObject )

@MatildaApp.route('/users', methods=['GET'])
@MatildaApp.route('/users/create', methods=['POST','PUT'])
def handle_users(user=None, userPass=None, email=None): 
    """
    GET - all users, POST create a new user
    """
    responseObject = {}

    if request.method == "GET":

        responseObject = DatabaseManagement.readDatabase("users")

    if request.method == "POST":

        params = request.get_json()

        #check if user already exists

        if len(DatabaseManagement.readDatabase("users",{"userName":params["userName"]})) != 0:
            responseObject = {"status":"error","error":"user already existing"}          
        else:
            responseObject = DatabaseManagement.createDoc(params["userName"], "users", params)

    if request.method == "PUT":

        #forced update

        params = request.get_json()

        responseObject = DatabaseManagement.updateDoc({"id":params["userName"]}, "users", params)

    return jsonify(responseObject)

#################################################
# COMMON ROUTES
#################################################

@MatildaApp.route('/dialogues_wipe', methods=['DELETE']) #admin
@MatildaApp.route('/<user>/dialogues_wipe',methods=['DELETE'])
def handle_wipe_request(user=None):

    responseObject = {}

    if not user:
        annotationFiles.annotatorErrors = {}
        annotationFiles.annotatorErrorsMeta = {}
        annotationFiles.wipe_view()
        responseObject = {"status":"success"}
    else:
        responseObject = dialogueFile.clean_workspace(user)

    return jsonify( responseObject )

@MatildaApp.route('/collections/<DBcollection>',methods=['POST','GET'])
@MatildaApp.route('/collections/<DBcollection>/<id>',methods=['GET','POST'])
@MatildaApp.route('/collections/<id>/<user>',methods=['PUT'])
def handle_collections(id=None, DBcollection=None, user=None, fields=None):

    try:
        fields = request.get_json()
        fields = json.loads(fields["search"])
    except:
        pass

    if fields is not None:
        try:
            projection = request.get_json()
            projection = json.loads(projection["projection"])
        except:
            projection = {"id":1,"assignedTo":1,"lastUpdate":1, "status":1, "done":1, "annotationStyle":1 }
        
        collectionNames = DatabaseManagement.readDatabase(DBcollection, fields, projection)

        __check_if_gold(collectionNames)

    if fields is None:

        collectionNames = DatabaseManagement.readDatabase(DBcollection, fields)

        __check_if_gold(collectionNames)

    if id:

        if id == "ids":
            if request.method == "GET":

                collectionNames = DatabaseManagement.readDatabase(DBcollection, None, {"id","assignedTo","status","lastUpdate","errors","done","gold"})

                #return if gold is empty or not
                __check_if_gold(collectionNames)

        #if request.method == "PUT":

                #response = __update_collection_from_workspace(user, id)

    return jsonify ( collectionNames )

@MatildaApp.route('/<mode>/collection/<destination>',methods=['POST'])
@MatildaApp.route('/<mode>/collection/<destination>/<id>',methods=['POST'])
def handle_post_of_collections(mode, destination, id=None):

    response = {"status":"success"}

    values = request.get_json()

    if mode == "new":
        
        values["lastUpdate"] = datetime.datetime.utcnow()
        values["document"] = json.loads(values["document"])

        if destination == "dialogues_collections":
            #adds necessary fields
            values["gold"] = {}
            values["errors"] = {}
            #check if annotation style exists
            if values["annotationStyle"] != "":
                try: 
                    Configuration.configDict[values["annotationStyle"]]
                    annotationStyle = values["annotationStyle"]
                except Exception as ex:
                    response = {"status":"error","error":"Impossible to load provided annotation style. "+ex}
                    return jsonify ( response )
            else:
                annotationStyle = Configuration.annotation_styles[0]
                values["annotationStyle"] = annotationStyle

            #check for duplicate documents 
            check = DatabaseManagement.readDatabase(destination, { "id":id })

        #annotated collections
        elif destination == "annotated_collections":
            values["id"] = id
            values["fromCollection"] = id
            values["done"] = False
            values["status"] = "0%"
            annotator = values["annotator"]

            check = DatabaseManagement.readDatabase(destination, { "id":id, "annotator":annotator })

            #getting annotation style from collection id
            annotationStyle = retrieve_annotation_style_name(id)

        #validation
        for dialogueName, dialogue in values["document"].items():
            validation = Configuration.validate_dialogue(annotationStyle, dialogue) 
            if ((type(validation) is str) and (validation.startswith("ERROR"))):
                logging.info(" * Validation for "+dialogueName+" failed with "+annotationStyle)
                response = {"status":"error","error":" Dialogue "+dialogueName+": "+str(validation)} 
                return jsonify( response )

        if (len(check) == 0):
            response = DatabaseManagement.createDoc(id, destination, values)
        else:
            if destination == "dialogues_annotations":
                response = {"status":"error","error":"A collection with the same id already exists. Operation cancelled"}
            else:
                response = {"status":"error","error":"The selected annotator "+annotator+" already has a document for this collection "+id+". Operation cancelled."}

        return jsonify( response )

    elif mode == "update":

        response = DatabaseManagement.updateDoc({"id":id}, destination, values)

    elif mode == "multiple":

        for line in values:
            DatabaseManagement.updateDoc({"id":line}, destination, {"assignedTo":values[line]})
            response.update({line:values[line]})

    elif mode == "pull":

        DatabaseManagement.pullFromDoc(id, destination, values)

    return jsonify( response )

@MatildaApp.route('/login',methods=['POST'])
def handle_login(id=None):
    """
    Check if user login is permitted
    """
    responseObject = {}

    values = request.get_json()

    username = values["username"]

    if request.method == "POST":
        
        allowed = LoginFuncs.logIn( username, values["password"])
        if allowed["status"] == "success":
            dialogueFile.create_userspace(username)
        responseObject = allowed

    return jsonify(responseObject)

@MatildaApp.route('/interannotation_import/<collection_id>',methods=['GET'])
@MatildaApp.route('/interannotation_import/<collection_id>',methods=['POST'])
def handle_annotations_import(collection_id):

    responseObject = {}

    if request.method == "POST":

        #import dialogues from a file

        dialoguesData = request.get_json()

        stringListOrJsonDict = dialoguesData["payload"]

        try:
            responseObject = admin__add_new_dialogues_from_json_dict(responseObject, stringListOrJsonDict, collection_id, "uploaded")
        except:
            responseObject = {"status": "error", "error":"File format is incorrect. Please, check your file."}
            return responseObject

        return jsonify(responseObject)

    else:

        #import annotations for user

        responseObject = {"status":"fail"}

        annotationFiles.annotatorErrors = {}
        annotationFiles.annotatorErrorsMeta = {}
        annotationFiles.wipe_view()

        collections = DatabaseManagement.readDatabase("annotated_collections", {"id":collection_id})

        if collections != []:
            if collections[0]["document"]:
                for collection in collections:
                    admin__add_new_dialogues_from_json_dict(responseObject, collection["document"], collection_id, collection["annotator"])

                responseObject = {"status":"success", "imported":collections}
            
    return jsonify(responseObject)

    
#################################################
# INDEX FUNCTIONS
#################################################

def __load_collection_from_database(user, doc):

    responseObject = {}

    docRetrieved = DatabaseManagement.readDatabase("annotated_collections",{"id":doc,"annotator":user})
    #first checks if exists an annotated version for the user
    if len(docRetrieved) == 0:
        logging.info(" * No annotated version for user "+user+" creating...")
        docRetrieved = DatabaseManagement.readDatabase("dialogues_collections",{"id":doc})
        #create document 
        values = {
            "id":doc, 
            "fromCollection":doc, 
            "annotator":user, 
            "done":False, 
            "status":"0%",
            "document":docRetrieved[0]["document"],
            "lastUpdate":datetime.datetime.utcnow()
        }
        DatabaseManagement.createDoc(doc, "annotated_collections", values)
    
    dialogueFile.create_userspace(user)

    #import and format new dialogues
    for docCollection in docRetrieved:
        __add_new_dialogues_from_json_dict(user, doc, responseObject, dialogueDict=docCollection["document"])

    dialogueFile.change_collection(user, doc)    

def __handle_post_of_new_dialogues(user, fileName=None):
    """
    takes care of posting new dialogues
    """
    responseObject = {}

    if fileName:
        dialogueFile.change_collection(user, fileName)

    stringListOrJsonDict = request.get_json()

    if isinstance(stringListOrJsonDict, str):
        responseObject["error"]  = "JSON parsing failed"
        responseObject["status"] = "error"

    elif not stringListOrJsonDict:
        if fileName:
            responseObject = dialogueFile.add_new_dialogue(user, None, None, fileName)
        else:
            responseObject = dialogueFile.add_new_dialogue(user)

    elif isinstance(stringListOrJsonDict, list):
        responseObject = __add_new_dialogues_from_string_lists(user, fileName, responseObject, dialogueList=stringListOrJsonDict)

    elif isinstance(stringListOrJsonDict, dict):
        responseObject = __add_new_dialogues_from_json_dict(user, fileName, responseObject, dialogueDict=stringListOrJsonDict)

    return jsonify(responseObject)


def __add_new_dialogues_from_json_dict(user, fileName, currentResponseObject, dialogueDict):
    """
    Takes a dictionary of dialogues, checks their in the correct format and adds them to the main dialogues dict.
    """

    if fileName:
        collectionTag = fileName
    else:
        collectionTag = ""

    added_dialogues = []
    overwritten = []

    annotationStyle = retrieve_annotation_style_name(fileName)

    for dialogue_name, dialogue in dialogueDict.items():

        dialogue = Configuration.validate_dialogue(annotationStyle,dialogue)

        if isinstance(dialogue, str):
            currentResponseObject["error"] = dialogue
            currentResponseObject["status"] = "error"
            break

        result = dialogueFile.add_new_dialogue(user, dialogue, dialogue_name, collectionTag)
        added_dialogues.append(result["id"])
        if result["overwritten"] != "": 
            overwritten.append(result["overwritten"])

    if "error" not in currentResponseObject:
        currentResponseObject["message"] = "Added new dialogues: " + " ".join(added_dialogues)
        currentResponseObject["overwritten"] = overwritten

    return currentResponseObject


def __add_new_dialogues_from_string_lists(user, fileName, currentResponseObject, dialogueList):
    """
    Takes lists of strings, each string corresponding to a dialogue, formats them into a dialogue, runs them
    through the models and adds them to the dialogue list. Returns a dict of info about dialogues added.
    """
    if fileName:
        collectionTag = fileName
    else:
        collectionTag = ""

    currentResponseObject["message"] = []
    currentResponseObject["new_dialogue_id"] = []

    for string_list in dialogueList:

        string_list      = [x for x in string_list.split("\n") if x.strip()]
        newId = dialogueFile.add_new_dialogue( user, Models.run_models_on_dialogue( convert_string_list_into_dialogue(string_list), collectionTag ))

        currentResponseObject["message"].append("Added new dialogue: {}".format(newId["id"]))
        currentResponseObject["new_dialogue_id"].append(newId["id"])

    return currentResponseObject

def __check_if_gold(collectionNames):
    try: 
        for name in collectionNames:
            if name["gold"] != {}:
                name["gold"] = True
            else:
                name["gold"] = False
    except:
        pass

#######################################################
#   ADMIN FUNCTIONS
#######################################################

def admin__add_new_dialogues_from_json_dict(currentResponseObject, dialogueDict, fileName=None, annotator=None):
    """
    Takes a dictionary of dialogues, checks their in the correct format and adds them to the main dialogues dict.
    """
    if not fileName:
        fileName = ""

    if not annotator:
        annotator = fileName

    annotationStyle = retrieve_annotation_style_name(fileName)

    addedDialogues = []

    if dialogueDict:

        for dialogueName, dialogue in dialogueDict.items():

            dialogue = Configuration.validate_dialogue(annotationStyle,dialogue)

            if isinstance(dialogue, str):
                currentResponseObject["error"] = dialogue
                currentResponseObject["status"] = "error"
                break

            addedDialogues.append(dialogueName)


        if "error" not in currentResponseObject:
            #here saves the file in interannotator json files
            annotationFiles.add_dialogue_file(dialogueDict, fileName=annotator)
            currentResponseObject["message"] = "Added new dialogues: " + " ".join(addedDialogues)

        return currentResponseObject

def admin__add_new_dialogues_from_string_lists(currentResponseObject, dialogueList):
    """
    Takes lists of strings, each string corresponding to a dialogue, formats them into a dialogue, runs them
    through the models and adds them to the dialogue list. Returns a dict of info about dialogues added.
    """

    currentResponseObject["message"] = []
    currentResponseObject["new_dialogue_id"] = []

    for string_list in dialogueList:

        string_list      = [x for x in string_list.split("\n") if x.strip()]
        DIALOGUES[newId] = Models.run_models_on_dialogue( convert_string_list_into_dialogue(string_list) )

        currentResponseObject["message"].append("Added new dialogue: {}".format(newId))
        currentResponseObject["new_dialogue_id"].append(newId)

    return currentResponseObject


def mock_handle_errors_resource(id=None):
    with self.app.app_context():

        responseObject = {
        "status" : "success",
        }

        listOfDialogue = annotationFiles.get_all_files( dialogueId = id )

        responseObject.update( InterannotatorMethods.find_errors_in_list_of_dialogue( None,listOfDialogue ) )

        return jsonify( responseObject )


def mock_analyse_interannotator_agreement(dialogueIdCap=None):
    with self.app.app_context():
        print(annotationFiles.allFiles.keys())

        report = {}
        totalCount = 0

        if not dialogueIdCap:
            dialogueIdCap = 74

        for x in range(dialogueIdCap+1):
            dialogueId = "Dialogue"+str(x)
            listOfDialogue = annotationFiles.get_all_files( dialogueId = dialogueId )
            responseObject = InterannotatorMethods.find_errors_in_list_of_dialogue( None,listOfDialogue )
            totalCount += len( responseObject["errors"] )

        report["totalCount"] = totalCount
        return report

def __update_gold_from_error_id(dialogueId, error, collectionId=None):
    """
    updates GOLD from error
    """
    dialogue = annotationFiles.get_dialogue(id=dialogueId)["dialogue"]
    annotationName = error["name"]
    turnId = error["turn"]
    dialogue[turnId][annotationName]= error["predictions"]

    annotationFiles.update_dialogue(id=dialogueId, newDialogue=dialogue)
    #annotationFiles.save()

    if collectionId: 
        DatabaseManagement.updateDoc({"id":collectionId}, "dialogues_collections", {"gold":annotationFiles.get_dialogues()})


def retrieve_annotation_style_name(collection):
    search = DatabaseManagement.readDatabase("dialogues_collections", {"id":collection}, {"_id":0,"annotationStyle":1})
    annotationStyle = search[0]["annotationStyle"]

    #if annotation model name not valid or empty system falls back to default model
    if len(annotationStyle) <= 1:
        annotationStyle = Configuration.annotation_styles[0]

    return annotationStyle

################################
# STATIC METHODS
################################
class InterannotatorMethods:

    @staticmethod
    def find_errors_in_list_of_dialogue(collection, listOfDialogue):
        """
        finds errors in the list of dialogues

            meta : [
                {
                    turn: 1,
                    name: "hotel_belief_state",
                    accepted: false,
                    annotateBy: 5
                },...
            errors : [
                {
                    usr : "Hi, how do I get to the moon?",
                    sys : "Call Elon, find 500K and fly.",
                    turn : 1,
                    type : "multilabel_classification_string",
                    name : "hotel_belief_state",
                    predictions: [
                        ["hotel-book people",5]
                    ],
                },...
        """

        #exception and compatibility for lida mock model
        if collection is not None:
            annotationStyle = retrieve_annotation_style_name(collection)
        else:
            annotationStyle = Configuration.annotation_styles[0]

        errorList = []
        metaList = []

        turnsData = InterannotatorMethods.get_turns_data(listOfDialogue)

        # Getting the errors
        for turnId, turn in enumerate(turnsData):

            for annotationName, listOfAnnotations in turn.items():
                error = {}
                error["turn"] = turnId

                meta = {}
                meta["turn"] = turnId
                meta["accepted"] = False

                predictions = None
                agreementFunc = None

                if annotationName == "turn_idx":
                    continue

                #metatags can be ignored
                if annotationName not in Configuration.metaTags:
                    try:
                        #confront
                        annotationType = Configuration.configDict[annotationStyle][annotationName]["label_type"]
                        agreementFunc = agreementConfig[ annotationType ]
                    except:
                        #in case of mismatched number in turn_id (example: a turn has been deleted)
                        if annotationName == "turn_id":
                            continue

                if agreementFunc:
                    temp = agreementFunc( listOfAnnotations )
                    predictions = temp.get("predictions")

                if predictions: #means there is discrepency

                    if turnId == 0:
                        error["usr"] = " "
                        error["sys"] = " "
                    else:
                        error["usr"] = turnsData[turnId]["usr"][0]
                        error["sys"] = turnsData[turnId]["sys"][0]
                    
                    error["type"] = annotationType
                    error["name"] = annotationName
                    error["predictions"] = predictions
                    error["counts"] = temp.get("counts")

                    #multilabel_classification_string needs more details to be evaluted by user
                    if error["type"] == "multilabel_classification_string" or error["type"] == "multilabel_global_string":
                        optionList = []
                        for option in turnsData[turnId][error["name"]]:
                            optionList.append(option) 
                        error["options"] = optionList

                    meta["name"] = annotationName
                    meta["annotateBy"] = len(listOfAnnotations)

                    errorList.append(error)
                    metaList.append(meta)

        return {"errors": errorList, "meta": metaList}

    @staticmethod
    def get_turns_data(listOfDialogue):
        """
        list of dialogue - turns data
        """
        turnsData = []
        #create per turn data
        for dialogue in listOfDialogue:

            for turnId,turn in enumerate( dialogue ):

                if len(turnsData)>turnId:
                    InterannotatorMethods.update_defaultdict_list_with_dict( turnsData[turnId], turn )

                else:
                    temp = defaultdict(list)
                    InterannotatorMethods.update_defaultdict_list_with_dict( temp, turn )

                    turnsData.append(temp)

        return turnsData

    @staticmethod
    def update_defaultdict_list_with_dict(defaultDict, newDict):
        """
        appends on the keys
        """
        for key, value in newDict.items():

            if key == "global_slot":
                for subKey in value:
                    if type(value) == dict:
                        defaultDict[key].append( [ [subKey, value[subKey]] ] )
                    else:
                        defaultDict[key].append([ [subKey, value] ])
            else:
                defaultDict[key].append(value)


########################
# COMMON STATIC METHODS
########################

def convert_string_list_into_dialogue(stringList: List[str]) -> List[Dict[str, Any]]:
    """
    Converts a list of strings into a dialogue with the following assumptions:

        - (1) :: there are only two participants in the dialogue: user and sys
        - (2) :: user speaks first
    """

    dialogue = []
    userTurn = True
    currentTurn = {}
    turnIdx = 1

    for providedString in stringList:

        if userTurn:

            currentTurn["usr"] = providedString
            userTurn = False

        else:

            currentTurn["sys"] = providedString
            currentTurn["turn_idx"] = turnIdx
            dialogue.append(currentTurn)
            turnIdx += 1
            currentTurn = {}
            userTurn = True

    if currentTurn:
        currentTurn["turn_idx"] = turnIdx
        dialogue.append(currentTurn)
        turnIdx += 1

    return dialogue

class Models:

    @staticmethod
    def run_models_on_query(query):
        """
        runs the model on the query
        """
        outDict = {
            "turn"  : {}
        }

        outDict["turn"]["usr"] = query

        for key, val in Configuration.configDict.items():

            try:

                outDict["turn"][key] = val["model"].transform(query)

            except KeyError:

                pass

        return outDict

    @staticmethod
    def run_models_on_dialogue(dialogue, dontRun= tuple(["sys"])):
        """
        Runs the models in the config dict on the user transcripts in each dialogue
        turn.

        Parameter "dontRun" specifies which models not to run.
        """

        dontRun = set(x for x in dontRun)

        newDialogue = []

        for turn in dialogue:

            userQuery = turn["usr"]

            newDialogue.append( Models.run_models_on_query(userQuery)["turn"] )

        return newDialogue

##############
# INIT
##############

@MatildaApp.before_request
def guard():
    requestedUri = request.path
    if (requestedUri != "/" 
    and requestedUri != "/login"
    and requestedUri != "/favicon.ico"
    and requestedUri.split("/")[1] != "assets"
    and requestedUri.split("/")[1] != "source"):
        check = LoginFuncs.checkSession()
        if check == False and sessionGuard == True:
            logging.warning(" * Access violation on route "+requestedUri+" from "+request.remote_addr)
            return jsonify({"status":"logout", "error":"Server rebooted or you logged from another position. You need to log-in again."})

if jsonConf["full_log"] is not True:
    logging.disable(logging.INFO)

if __name__ == "__main__":
    MatildaApp.run(port=jsonConf["port"],host=jsonConf["address"])