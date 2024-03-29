##############################################
#  IMPORT STATEMENTS
##############################################

# == Native ==
import os
import sys
import json
import copy
import datetime
from typing import Dict, List, Any, Tuple, Hashable, Iterable, Union
from collections import defaultdict

# == Flask ==
from flask import Flask, jsonify, request, render_template
from flask_cors import CORS

# == Local ==
from annotator_config import *
from annotator import DialogueAnnotator, MultiAnnotator
from database import DatabaseManagement, LoginFuncs
from text_splitter import convert_string_list_into_dialogue

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
CORS(MatildaApp)
#set_main_path(path)
dialogueFile = DialogueAnnotator(path)
annotationFiles = MultiAnnotator(path)
jsonConf = Configuration.conf["app"]

@MatildaApp.route('/')
def welcome():
    return render_template("index.html")

##############################################
#  FUNCTION HANDLERS
##############################################

@MatildaApp.route('/<user>/dialogues_metadata',methods=['GET'])
@MatildaApp.route('/<user>/dialogues_metadata/<id>',methods=['PUT'])
def handle_dialogues_metadata_resource(user, id=None):
    """
    GET - All dialogues metadata

    PUT - Handle
    """
    if request.method == "GET":
        responseObject = dialogueFile.get_dialogues_metadata(user)


    if request.method == "PUT":
        error = None
        data  = request.get_json()

        responseObject = dialogueFile.update_dialogue_name( user, id, data["id"])

    #dialogueFile.save(user)
    return jsonify( responseObject )


@MatildaApp.route('/<user>/dialogues',methods=['GET','POST','DELETE'])
@MatildaApp.route('/<user>/dialogues/<id>',methods=['GET','POST','DELETE'])
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
        responseObject = dialogueFile.update_dialogue(user, id=id, newDialogue=data )

    if supervisor:
        responseObject = dialogueFile.get_dialogue("Su_"+supervisor, id = id)
        return jsonify(responseObject)

    if fileName:
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
        dialogue = dialogueFile.get_dialogue(user, id = id)
        Configuration.validate_dialogue(annotationStyle,dialogue["dialogue"])
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
    #if request.method == "GET":
    #    responseObject.update( user )

    if request.method == "PUT":
        dialogueFile.change_file_name(user)

    return jsonify(responseObject)

@MatildaApp.route('/database', methods=['GET'])
@MatildaApp.route('/<user>/database/<mode>/<activecollection>',methods=['PUT'])
@MatildaApp.route('/database/<id>/<DBcollection>',methods=['GET','POST','DELETE'])
def handle_database_resource(id=None, user=None, mode=None, DBcollection=None, activecollection=None):
    """
    GET - Gets the dialogues id in the database collection for the user
        or Gets an entire database document 

    POST - Gets the entire dialogues in the database and import them

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

        if request.method == "DELETE":
            responseObject.update( DatabaseManagement.deleteDoc(DBcollection, id ) )

    #else:
        #responseObject = DatabaseManagement.getDatabaseIds()

    return jsonify(responseObject)    


@MatildaApp.route('/<user>/dialogue/<id>/<tag>/<value>',methods=['GET','PUT']) 
def handle_dialogues_tag(user, id, tag, value):

    responseObject = {
        "status" : "success"
    }

    if request.method == "POST":
        dialogueFile.insert_meta_tags(user, id, tag, value)

    return responseObject

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
            print("No annotated version for user ",user," creating...")
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

        return responseObject
    else:
        docRetrieved = DatabaseManagement.readDatabase("annotated_collections",{"id":doc, "annotator":user})

    #update dialogue source
    for docCollection in docRetrieved:
        dialogueFile.update_dialogues(user, docCollection["document"])

    dialogueFile.change_collection(user, doc)

    responseObject = { "status": "success" }

    return responseObject

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

@MatildaApp.route('/dialogues_metadata',methods=['GET'])
@MatildaApp.route('/dialogues_metadata/<id>', methods=['PUT'])
def admin_dialogues_metadata_resource(id=None):
    """
    GET - All dialogues metadata

    PUT - Handle
    """
    if request.method == "GET":
        responseObject = annotationFiles.get_dialogues_metadata()

    if request.method == "PUT":
        error = None
        data  = request.get_json()

        responseObject = annotationFiles.update_dialogue_name( id, data["id"])

    annotationFiles.save()
    return jsonify( responseObject )

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

            #    
            annotationStyle = retrieve_annotation_style_name(collection)

            data = request.get_json()
            data = Configuration.validate_dialogue( annotationStyle, data )

            if isinstance(dialogue, str):
                currentResponseObject["error"] = data
                currentResponseObject["status"] = "error"
                return jsonify( currentResponseObject )

            responseObject = annotationFiles.update_dialogue( id=id, newDialogue=data )

        if request.method == "DELETE":
            responseObject = annotationFiles.delete_dialogue(id=id)

    else:

        if request.method == "GET":
            responseObject = annotationFiles.get_dialogues()

        if request.method == "POST":
            responseObject = admin_post_of_new_dialogues()

    annotationFiles.save()
    return jsonify( responseObject )

@MatildaApp.route('/dialogues_import', methods=['POST'])
def admin_post_of_new_dialogues():
    """
    takes care of posting new dialogues
    """
    responseObject = {}

    dialoguesData = request.get_json()

    stringListOrJsonDict = dialoguesData["payload"]

    optionalFileName = dialoguesData["name"]

    if isinstance(stringListOrJsonDict, str):
        responseObject["error"]  = "JSON parsing failed"
        responseObject["status"] = "error"

    elif not stringListOrJsonDict:
        responseObject = annotationFiles.add_new_dialogue()

    elif isinstance(stringListOrJsonDict, list):
        responseObject = admin__add_new_dialogues_from_string_lists(responseObject, dialogueList=stringListOrJsonDict)

    elif isinstance(stringListOrJsonDict, dict):
        responseObject = admin__add_new_dialogues_from_json_dict(responseObject, dialogueDict=stringListOrJsonDict, fileName=optionalFileName)

    return responseObject

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

            DatabaseManagement.updateDoc(collectionId, "dialogues_collections", { "errors": { "errorsList":annotationFiles.annotatorErrors, "errorsMeta":annotationFiles.annotatorErrorsMeta} })

    else:

        responseObject = {
            "status" : "error",
            "error"  : "not available"
        }

    return jsonify( responseObject )

@MatildaApp.route('/errors/restore/<collectionId>', methods=['GET'])
def restore_errorsList(collectionId):

    search = DatabaseManagement.readDatabase("dialogues_collections", {"id":collectionId}, {"document","errors", "gold"})

    if search[0]["errors"] != {}:

        annotationFiles.annotatorErrors = search[0]["errors"]["errorsList"]
        annotationFiles.annotatorErrorsMeta = search[0]["errors"]["errorsMeta"]

        responseObject = {
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

            DatabaseManagement.updateDoc(collectionId, "dialogues_collections", { 
                "errors": { 
                    "errorsList":annotationFiles.annotatorErrors, 
                    "errorsMeta":annotationFiles.annotatorErrorsMeta
                } 
            })
        
        responseObject = {"errors":annotationFiles.annotatorErrors}

    return jsonify(responseObject)



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

                    if ((annotationName=="turn_idx") or (annotationName=="turn_id")):
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

        responseObject = DatabaseManagement.updateDoc(params["userName"], "users", params)

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

    return responseObject

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

        #adds necessary fields
        values["gold"] = {}
        values["errors"] = {}
        values["lastUpdate"] = datetime.datetime.utcnow()
        values["document"] = json.loads(values["document"])

        #validation
        if values["annotationStyle"] != "":
            try: 
                Configuration.configDict[values["annotationStyle"]]
                annotationStyle = values["annotationStyle"]
            except:
                response = {"status":"error","error":"Impossible to load provided annotation style"}
                return jsonify ( response )
        else:
            annotationStyle = Configuration.annotation_styles[0]
            values["annotationStyle"] = annotationStyle

        for dialogueName, dialogue in values["document"].items():
            validation = Configuration.validate_dialogue(annotationStyle, dialogue) 
            if ((type(validation) is str) and (validation.startswith("ERROR"))):
                print("Validation for",dialogueName," failed with "+annotationStyle)
                response = {"status":"error","error":" Dialogue "+dialogueName+": "+str(validation)} 
                return jsonify( response )

        #check for same id    
        check = DatabaseManagement.readDatabase("dialogues_collections", { "id":id })

        if (len(check) == 0):
            response = DatabaseManagement.createDoc(id, destination, values)
        else:
            response = {"status":"error","error":"collection id already exists"}

    elif mode == "update":

        response = DatabaseManagement.updateDoc(id, destination, values)

    elif mode == "multiple":

        for line in values:
            DatabaseManagement.updateDoc(line, destination, {"assignedTo":values[line]})
            response.update({line:values[line]})

    elif mode == "pull":

        DatabaseManagement.pullFromDoc(id, destination, values)

    return jsonify ( response )

@MatildaApp.route('/login',methods=['POST'])
@MatildaApp.route('/login/<id>',methods=['PUT'])
def handle_login(id=None):
    """
    Check if user login is permitted
    """
    responseObject = {}

    values = request.get_json()

    if request.method == "POST":
        responseObject = LoginFuncs.logIn( values["username"], values["password"])

    if request.method == "PUT":
        responseObject = LoginFuncs.create(id)

    return jsonify(responseObject)

@MatildaApp.route('/annotations_import/<collection_id>',methods=['GET'])
def handle_annotations_import(collection_id):

    responseObject = {"status":"fail"}

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

    return responseObject


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

        return responseObject


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
        DatabaseManagement.updateDoc(collectionId, "dialogues_collections", {"gold":annotationFiles.get_dialogues()})


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


                if annotationName=="turn_idx":
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

                    error["usr"] = turnsData[turnId]["usr"][0]
                    error["sys"] = turnsData[turnId]["sys"][0]
                    error["type"] = annotationType
                    error["name"] = annotationName
                    error["predictions"] = predictions
                    error["counts"] = temp.get("counts")

                    #multilabel_classification_string needs more details to be evaluted by user
                    if error["type"] == "multilabel_classification_string":
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

            defaultDict[key].append(value)

########################
# COMMON STATIC METHODS
########################

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

if __name__ == "__main__":
    MatildaApp.run(port=jsonConf["port"],host=jsonConf["address"])

