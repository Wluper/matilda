
API_BASE = window.origin

/********************************
* API INTERACTION FUNCTIONS
********************************/

async function annotate_query(query){

    var dialogues = {}

    const apiLink = API_BASE+'/turns'
    try {
        var response = await axios.post( apiLink, { query: query}  );
        console.log(response.data)

        dialogueStyle = response.data.turn
        console.log("=============TURN ANNOTATION==============")
        console.log(dialogueStyle)
        return dialogueStyle

    } catch (error) {

        console.log(error);
        alert(error);

    }


};


/***************************************
* ANNOTATON STYLE RESOURCE
***************************************/

async function manage_configuration_file(mode,id,jsonFile) {

    if (id == undefined) {

        var apiLink = API_BASE+`/configuration`;

        try {
            var response = await axios.get(apiLink)

            var configurationFile = response.data
            console.log("============= CONFIGURATION ==============")
            console.log(configurationFile)
            return configurationFile

        } catch (error) {

            console.log(error);
            if (response != undefined) {
                response["error"] = error;
            } else {
                response = {}
                response["error"] = error;
            }
            return response;
        }

    } else {
        
        try {

            var apiLink = API_BASE+`/configuration/${id}`;

            if (mode == "get") {

                var response = await axios.get(apiLink)

            } else if (mode == "post") {  

                var response = await axios.post(apiLink, {json:jsonFile})
           
            } else if (mode == "put") {

                var response = await axios.put(apiLink, {json:jsonFile})
            
            } else if (mode == "change") {
                
                apiLink = API_BASE+`/configuration/change/${id}`;
                var response = await axios.post(apiLink, {json:jsonFile})
            
            }

            var result = response;
            console.log("============= CONFIGURATION ==============")
            console.log(result);
            return result;

        } catch (error) {

            console.log(error);
            if (response != undefined) {
                response["data"]["error"] = error;
            } else {
                response = {}
                response["data"]["error"] = error;
            }
            return response;
        }
    }
}

async function get_annotation_style_async(collection,id,supervision){

    var dialogues = {}

    if (id == undefined) {
        var apiLink = API_BASE+`/dialogue_annotationstyle/${collection}`;
    
    } else {
        
        if (supervision != undefined) {
            var apiLink = API_BASE+"/supervision/"+mainApp.userName+`/dialogue_annotationstyle/${collection}/${id}`
        } else { 
            var apiLink = API_BASE+"/"+mainApp.userName+`/dialogue_annotationstyle/${collection}/${id}`
        }
    }

    try {
        
        var response = await axios.get(apiLink)

        if (response["data"]["error"] != undefined) {
            alert(response["data"]["error"])
            if (response["data"]["status"] == "logout") {
                mainApp.force_logout()
            }
        }

        dialogueStyle = response.data
        console.log("============= ANNOTATION CLASSES ==============")
        console.log(dialogueStyle)
        return dialogueStyle

    } catch (error) {

        console.log(error);
        alert("Server offline or trying to access a deleted collection");
        return {"status":"fail"}

    }

}

async function get_logs(complete=undefined){

    if (complete == undefined) {
        var apiLink = API_BASE+"/logs";
    } else {
        var apiLink = API_BASE+"/logs/complete";
    }

    try {
        var response = await axios.get(apiLink)

        let logs = response.data
        console.log("============= APP LOGS ==============")
        console.log(logs)
        return logs

    } catch (error) {

        console.log(error);
        alert(error);
    }

};

async function get_registered_annotation_styles(){

    const apiLink = API_BASE+"/registered_annotationstyles";

    try {
        var response = await axios.get(apiLink)


        let annotationStyles = response.data
        console.log("============= REGISTERED ANNOTATION STYLES ==============")
        console.log(annotationStyles)
        return annotationStyles

    } catch (error) {

        console.log(error);
        alert(error);
    }

}


/***************************************
* DIALOGUES METADATA RESOURCE
***************************************/

async function write_tag(id,tag,value) {

  var apiLink = API_BASE+"/"+mainApp.userName+`/dialogue/${id}/${tag}/${value}`

  try {

    var response = await axios.post(apiLink)

    console.log("=========== TAG WRITING SUCCESS ===========")
    return response

  } catch(error) {

    console.log(error);
    alert(guiMessages.selected.lida.connectionError)

  }

}

async function get_all_dialogue_ids_async(admin, interannotatorCollection=undefined) {

  var dialogues = {}

  if (admin == undefined) {

    //annotators
    var apiLink = API_BASE+"/"+mainApp.userName+'/dialogues_metadata/'+mainApp.activeCollection;

  } else if (admin == "supervision") {

    //supervision
    var apiLink = API_BASE+"/"+mainApp.userName+'/supervision';

  } else { 

    //interannotator
    var apiLink = API_BASE+"/dialogues_metadata/"+interannotatorCollection;
  }

  try {

    var response = await axios.get(apiLink)

    console.log(response);

    if (response["data"]["error"] != undefined) {
        alert(response["data"]["error"])
        if (response["data"]["status"] == "logout") {
            mainApp.force_logout()
        }
    }

    dialoguesList = response.data
    console.log("=========== ALL DIALOGUE METADATA LIST ===========")
    return dialoguesList

  } catch(error) {

    console.log(error);
    alert(guiMessages.selected.lida.connectionError)

  }

}


async function change_dialogue_name_async(oldName, newName) {

    var apiLink = API_BASE+"/"+mainApp.userName+`/dialogues_metadata/${oldName}`

    try {

        var response = await axios.put( apiLink, {id:newName} )
        console.log('---- RESPONSE TO NAME CHANGE ----', response);
        return true;

    } catch(error) {

        console.log(error);

    }
    return false;

};



/***************************************
* DIALOGUES RESOURCE
***************************************/

async function get_all_dialogues_async(admin) {

    // admin workspace

    var dialogues = {}

    if (admin != undefined) {

        apiLink = API_BASE+"/dialogues";

        try { 
            var response = await axios.get( apiLink )

            dialogues = response.data
            return dialogues 

        } catch(error) {

            console.log(error)
            return response
        }

        return dialogues
    
    } else {

        try {
            var response = await RESTdialogues( "GET", null, {})

            dialogues = response.data
            return dialogues

        } catch(error) {

            console.log(error);

        }
    }
};


async function get_single_dialogue_async(id, collection, supervision) {

    if (supervision != undefined) {

        apiLink = API_BASE+"/supervision/"+mainApp.userName+"/dialogues/"+id;

        var response = await axios.get( apiLink )

        dialogues = response.data.dialogue

        return dialogues
    
    } else if (collection != undefined) {

        apiLink = API_BASE+"/"+mainApp.userName+"/dialogues/"+id+"/"+collection;

        var response = await axios.get( apiLink )

        dialogues = response.data.dialogue

        return dialogues
    
    }

    try {

        var response = await RESTdialogues( "GET", id, collection, {})
        console.log("===== GOT SINGLE DIALOGUE =====")
        console.log(response)
        dialogue = response.data.dialogue
        return dialogue

    } catch(error) {

        console.log(error)
        alert(error);
        //logout?
    }

}



async function post_empty_dialogue(collection) {

    try {

        if (collection == undefined) {
            var response = await RESTdialogues("POST", null, null);
        } else {
            var response = await RESTdialogues("POST", null, null, collection);
        }

        console.log(response)

        return response.data.id

    } catch(error) {

        console.log(error);
        alert(error);
    }

}


async function post_new_dialogues_from_string_lists_async(stringLists) {

    try {

        const response = await RESTdialogues("POST", null, stringLists );

        console.log('RECEIVED RESPONSE TO POST DATA', response)

        return response

    } catch(error) {

        console.log(error);
        alert(error);
    }
}


async function post_new_dialogue_from_json_string_async(jsonString, fileName) {
    
    fileName = fileName.split(".")[0]

    try {

        const response = await RESTdialogues( "POST", null, JSON.parse(jsonString), fileName );

        console.log('RECEIVED RESPONSE TO POST DATA', response)

        return response

    } catch(error) {

        console.log(error);
        alert(error);

    }

}


async function put_single_dialogue_async(event, dialogueId, dTurns, collection) {

    try {

        const response = await RESTdialogues( "PUT", dialogueId, dTurns, collection )
        console.log('---- RESPONSE TO PUT ----', response);
        status = response.data.status
        console.log('status', status)

        if (response["data"]["error"] != undefined) {
            alert(response["data"]["error"])
            if (response["data"]["status"] == "logout") {
                mainApp.force_logout()
            }
        }

        return status

    } catch(error) {

        console.log(error);
        alert(error)

    }

};


async function del_single_dialogue_async(dialogueId) {

    try {

        const response = await RESTdialogues( "DELETE", dialogueId )
        console.log('---- RESPONSE TO DEL ----', response);

    } catch(error) {

        console.log(error);
        alert(error)
    }

};


async function del_all_dialogues_async(admin) {

    if (admin == undefined) {
        var apiLink = API_BASE+"/"+mainApp.userName+`/dialogues_wipe`
    } else {
        var apiLink = API_BASE+"/dialogues_wipe"
    }

    try {

        var response = await axios.delete(apiLink)

        console.log("=========== WIPE DONE ===========")
        return response

    } catch(error) {

        console.log(error);
        alert(guiMessages.selected.lida.connectionError)
    }
}

async function recover_dialogues(id) {

const apiLink = API_BASE+"/"+mainApp.userName+`/annotations_recover/${id}`

    try {

        var response = await axios.get(apiLink)

        console.log("=========== RECOVERY DONE ===========")
        return response

    } catch(error) {

        console.log(error);
        alert(guiMessages.selected.lida.connectionError)

  }

}

async function load_dialogues(doc) {

    const apiLink = API_BASE+"/"+mainApp.userName+`/annotations_load/${doc}`

    try {

        var response = await axios.put(apiLink)
        return response
    
    } catch(error) {

        console.log(error);
        alert(guiMessages.selected.lida.connectionError)
    }
}

async function supervision(annotator,doc) {

    const apiLink = API_BASE+"/"+mainApp.userName+`/supervision/${annotator}/${doc}`
    
    try {

        var response = await axios.put(apiLink)
        return response
    
    } catch(error) {

        console.log(error);
        alert(guiMessages.selected.lida.connectionError)
    }
}

async function RESTdialogues(method, id, params, fileName){
    console.log("********** ACCESSING DIALOGUES RESOURCE **********");
    console.log("REQUESTED FROM: "+mainApp.userName)
    console.log("ID: "+id)
    console.log("METHOD "+method)
    console.log("PARAMS "+params)
    console.log("COLLECTION "+fileName)

    //
    if (fileName != undefined) { var apiLink = API_BASE+"/"+mainApp.userName+`/dialogues/collection/${fileName}` }
    else if (id==null) { var apiLink = API_BASE+"/"+mainApp.userName+`/dialogues` }
    else { var apiLink = API_BASE+"/"+mainApp.userName+`/dialogues/${id}` }

    //
    if (method=="DELETE") {
        var response = await axios.delete( apiLink );
    }
    else if (method=="PUT") {
        //override
        var response = await axios.put( API_BASE+`/${mainApp.userName}/dialogues/${fileName}/${id}`, params );
    }
    else if (method=="POST") {
        var response = await axios.post( apiLink, params );
    }
    else if (method=="GET") {
        var response = await axios.get( apiLink, params );
    }
    else{
        console.log("********** INVALID METHOD **********")
    }
    console.log(response)
    return response


}

async function get_all_db_entries_ids() {

  var entries_ids = {}

  const apiLink = API_BASE+"/database"

  try {

    var response = await axios.get(apiLink)

    console.log(response)

    entriesList = response.data
    console.log("=========== ALL DATABASE ENTRIES LIST ===========")
    console.log(entriesList)
    return entriesList

  } catch(error) {

    console.log(error);
    alert(guiMessages.selected.lida.connectionError)

  }

}

async function update_annotations(activeColl,fields,backup) {

  var entries_ids = {}

  if (backup == true) {
    var apiLink = API_BASE+"/"+mainApp.userName+`/backup/${activeColl}`
  } else {
    var apiLink = API_BASE+"/"+mainApp.userName+`/database/annotations/${activeColl}`
  }

  try {

    var response = await axios.put(apiLink, fields)

    entriesList = response.data
    console.log("======== UPDATING DATABASE ========")
    console.log(entriesList)
    return entriesList

  } catch(error) {

    console.log(error);
    alert(guiMessages.selected.lida.connectionError)

  }

}

async function update_collection_fields(activeColl,fields, annotator) {

    if (annotator == undefined)
        annotator = mainApp.userName;

    var apiLink = API_BASE+"/"+annotator+`/database/fields/${activeColl}`

    try {

        var response = await axios.put(apiLink, fields)

        console.log("======== UPDATING DATABASE ========")
        console.log(response)
        return response

    } catch(error) {

        console.log(error);
        alert(guiMessages.selected.lida.connectionError)
    }
}

async function del_db_entry_async(pairs, collectionDB) {

    console.log("DELETING...");

    var apiLink = API_BASE+`/database/${collectionDB}`;

    try {

        var response = await axios.post( apiLink, {"search":JSON.stringify(pairs)} );
        console.log('---- RESPONSE TO DEL ----', response);
            
        return response

    } catch(error) {

        console.log(error);
    }
}

async function get_db_entry_async(entryId,DBcollection) {

    console.log("GETTING ID:",entryId, "in DBcollection",DBcollection);

    var apiLink = API_BASE+`/database/${entryId}/${DBcollection}`;

    try {

        var response = await axios.get( apiLink );
        console.log('---- DATABASE DOCUMENT ----', response.data);

        return response.data

    } catch(error) {

        console.log(error);

    }
}

async function get_database_dump_async() {

  entriesList = []

  const apiLink = API_BASE+'/database/download'

  try {

    var response = await axios.get(apiLink)

    console.log(response)

    entriesList = response.data
    console.log("=========== DOWNLOADING ===========")
    return entriesList

  } catch(error) {

    console.log(error);
    alert(guiMessages.selected.lida.connectionError)

  }
}

async function login(loginName,loginPass) {

  console.log("Username inserted",loginName);

  const apiLink = API_BASE+`/login`;

  try {

    var response = await axios.post(apiLink, {"username":loginName, "password":loginPass});

    console.log(response);

    console.log("=========== LOGGIN IN ===========")
    return response

  } catch(error) {

    console.log(error);
    alert(guiMessages.selected.lida.connectionError)

  }

}

/***************************************
*  COLLECTIONS RESOURCE
***************************************/

async function get_collections_ids_async(DBcollection) {

  entriesList = []

  const apiLink = API_BASE+`/collections/${DBcollection}/ids`

  try {

    var response = await axios.get(apiLink)

    console.log(response)

    if (response["data"]["error"] != undefined) {
        alert(response["data"]["error"])
        if (response["data"]["status"] == "logout") {
            mainApp.force_logout()
        }
    }

    entriesList = response.data

    return entriesList

  } catch(error) {

    console.log(error);
    alert(guiMessages.selected.lida.connectionError)

  }
}

async function get_specific_collections(DBcollection,fields,projection) {

  let entriesList = []

  const apiLink = API_BASE+`/collections/${DBcollection}`

  try {

    if (projection == undefined) {
        var response = await axios.post(apiLink, {"search":JSON.stringify(fields)})
    } else {
        var response = await axios.post(apiLink, {"search":JSON.stringify(fields), "projection":JSON.stringify(projection)})
    }
    
    console.log(response)

    if (response["data"]["error"] != undefined) {
        alert(response["data"]["error"])
        if (response["data"]["status"] == "logout") {
            mainApp.force_logout()
        }
    }

    entriesList = response.data

    return entriesList

  } catch(error) {

    console.log(error);
    alert(guiMessages.selected.lida.connectionError)

  }
}

async function get_collections_and_annotations_meta() {

    let entriesList = []
  
    const apiLink = API_BASE+`/collections_and_annotations_meta`
  
    try {
  
        var response = await axios.get(apiLink)
      
        console.log(response)
  
        if (response["data"]["error"] != undefined) {
            alert(response["data"]["error"])
            if (response["data"]["status"] == "logout") {
                 mainApp.force_logout()
            }
        }
  
      entriesList = response.data
  
      return entriesList
  
    } catch(error) {
  
      console.log(error);
      alert(guiMessages.selected.lida.connectionError)
  
    }
  }

async function remove_from_collection_async(DBcollection, id, fields) {

    const apiLink = API_BASE+`/pull/collection/${DBcollection}/${id}`

    try {

        var response = await axios.post(apiLink, fields)

        return response

    } catch(error) {

        console.log(error);
        alert(guiMessages.selected.lida.connectionError)
    }
}

async function new_collection_async(id, params, doc) {

    params["document"] = doc

    DBcollection = "dialogues_collections"

    const apiLink = API_BASE+`/new/collection/${DBcollection}/${id}`

    try {

        response = await axios.post(apiLink, params)

    } catch(error) {

        console.log(error);
        alert("Error. This could be caused by a server error or a wrong character in your collection file")
        response = error 
    }

    return response
}

async function new_annotated_collection_async(id, params, doc) {

    params["document"] = doc

    DBcollection = "annotated_collections"

    const apiLink = API_BASE+`/new/collection/${DBcollection}/${id}`

    try {

        response = await axios.post(apiLink, params)

        if (response["data"]["error"] != undefined) {
            alert(response["data"]["error"])
        }

    } catch(error) {

        console.log(error);
        alert("Error. This could be caused by a server error or a wrong character in your collection file")
        response = error 
    }

    return response
}

async function update_collection_async(id, DBcollection, params) {

    const apiLink = API_BASE+`/update/collection/${DBcollection}/${id}`

    try {

        response = await axios.post(apiLink, params)

    } catch(error) {

        console.log(error);
        var message = "Error. This could be caused by a server error or a wrong character in your collection file. For example, dots are not allowed in dialogues' names";
        alert(message);
        response = {"error":message};
    }

    return response
}

async function update_multiple_collections_async(DBcollection, params) {

    const apiLink = API_BASE+`/multiple/collection/${DBcollection}`

    try {

        response = await axios.post(apiLink, params)

    } catch(error) {

        console.log(error);
        var message = "Error. This could be caused by a server error or a wrong character in your collection file. For example, dots are not allowed in dialogues' names";
        alert(message);
        response = {"error":message};
    }

    return response
}

/*******************************************
*  ADMIN
********************************************/

async function get_scores_async(collection){

    var dialogues = {}

    const apiLink = API_BASE+"/agreements/"+collection
    try {
        var response = await axios.get( apiLink );

        errors = response.data
        console.log("=============ERRORS==============")
        console.log(errors)
        return errors

    } catch (error) {

        console.log(error);
        alert(error)
    }
}

async function get_errors_async(collection,dialogueId){

    var dialogues = {}

    const apiLink = API_BASE+`/errors/${collection}/${dialogueId}`
    try {
        var response = await axios.get( apiLink );

        errors = response.data
        console.log("=============ERRORS==============")
        console.log(errors)
        return errors

    } catch (error) {

        console.log(error);
        alert(error)
    }
}

async function get_collection_errors_async(collectionId){

    var dialogues = {}

    const apiLink = API_BASE+`/errors/check_or_restore/${collectionId}`
    try {
        var response = await axios.get( apiLink );

        errors = response.data
        console.log("========= CHECKING SESSION TO RESTORE =========")
        return errors

    } catch (error) {

        console.log(error);
        alert(error)
    }
}

async function put_error_async(listOfErrors){

    const apiLink = API_BASE+"/errors"
    try {
        var response = await axios.put( apiLink, listOfErrors );


        console.log("=============ERRORS==============")
        console.log(response)
        return true

    } catch (error) {

        console.log(error);
        alert(error)
        return false
    }
}

/*
async function admin_post_empty_dialogue() {

    const apiLink = API_BASE+"/dialogues";

    try {
        var response = await axios.post( apiLink, null, null )

        console.log(response)

        return response.data.id

    } catch(error) {

        console.log(error)
    }
}
*/

async function admin_import_for_interannotation(collection, newFile=undefined) {

    var apiLink = API_BASE+`/interannotation_import/${collection}`

    try {

        if (newFile == undefined)
            var response = await axios.get( apiLink )
        else
            var response = await axios.post( apiLink, { payload:JSON.parse(newFile) } )

        console.log('---- RESPONSE TO POST DATA ----', response);
        return response;

    } catch(error) {

        console.log(error);
    }
    return false;
}

async function import_new_dialogues_from_string_lists_async(stringLists) {

    var apiLink = API_BASE+`/dialogues_import`

    try {

        var response = await axios.post( apiLink, stringLists )
        console.log('---- RESPONSE TO POST DATA ----', response);
        return true;

    } catch(error) {

        console.log(error);
    }
    return false;
}

async function get_all_users(){
    
    const apiLink = API_BASE+"/users"

    var users = {}

    try {
        var response = await axios.get( apiLink )

        if (response["data"]["error"] != undefined) {
            alert(response["data"]["error"])
            if (response["data"]["status"] == "logout") {
                mainApp.force_logout()
            }
        }

        users = response.data
        return users

    } catch(error) {

        console.log(error);
        alert(error)

    }
}

async function create_user(parameters,update=false){
    
    const apiLink = API_BASE+`/users/create`;

    var response = {}

    try {

        if (update == false) {
            var response = await axios.post( apiLink, parameters )
        } else {
            var response = await axios.put( apiLink, parameters )
        }

        return response

    } catch(error) {

        console.log(error);
        alert(error)
    }
}


/********************************
* Exporting
********************************/

backend =
{
    annotate_query                              : annotate_query,
    write_tag                                   : write_tag,
    get_annotation_style_async                  : get_annotation_style_async,
    get_registered_annotation_styles            : get_registered_annotation_styles,
    manage_configuration_file                   : manage_configuration_file,
    get_logs                                    : get_logs,

    get_all_dialogues_async                     : get_all_dialogues_async,
    put_single_dialogue_async                   : put_single_dialogue_async,
    get_all_dialogue_ids_async                  : get_all_dialogue_ids_async,
    get_single_dialogue_async                   : get_single_dialogue_async,
    del_single_dialogue_async                   : del_single_dialogue_async,
    del_all_dialogues_async                     : del_all_dialogues_async,
    change_dialogue_name_async                  : change_dialogue_name_async,
    get_collections_and_annotations_meta        : get_collections_and_annotations_meta,

    load_dialogues                              : load_dialogues,
    recover_dialogues                           : recover_dialogues,

    post_empty_dialogue                         : post_empty_dialogue,
    post_new_dialogues_from_string_lists_async  : post_new_dialogues_from_string_lists_async,
    post_new_dialogue_from_json_string_async    : post_new_dialogue_from_json_string_async,

    get_all_db_entries_ids                      : get_all_db_entries_ids,
    get_db_entry_async                          : get_db_entry_async,
    del_db_entry_async                          : del_db_entry_async,
    get_database_dump_async                     : get_database_dump_async,

    update_annotations                          : update_annotations,
    update_collection_fields                    : update_collection_fields,

    login                                       : login,
    get_all_users                               : get_all_users,
    create_user                                 : create_user,

    new_collection_async                        : new_collection_async,
    new_annotated_collection_async              : new_annotated_collection_async,
    update_collection_async                     : update_collection_async,
    update_multiple_collections_async           : update_multiple_collections_async,
    remove_from_collection_async                : remove_from_collection_async, 

    get_collections_ids_async                   : get_collections_ids_async,
    get_specific_collections                    : get_specific_collections,

    get_scores_async                            : get_scores_async,
    get_collection_errors_async                 : get_collection_errors_async,
    get_errors_async                            : get_errors_async,
    put_error_async                             : put_error_async,

    supervision                                  : supervision,
    admin_import_for_interannotation             : admin_import_for_interannotation,
    import_new_dialogues_from_string_lists_async : import_new_dialogues_from_string_lists_async
}



//
