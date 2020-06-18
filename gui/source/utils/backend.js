/********************************
* FILE NAME FUNCTIONS
********************************/

url = window.location.href;
if (url.split("/").pop() != "admin.html") {
    var API_BASE = url;
} else {
    var API_BASE = url.split("/").splice(0,-1);
}

function session_name() {
    username = "user_1";
    if (localStorage["remember"] != undefined) {
        username =  localStorage["remember"]
    }
    return username
}


async function put_name(name){

    console.log("Set userspace",name);

    var dialogues = {}

    const apiLink = API_BASE+"/"+name+'/name'
    try {
        var response = await axios.put( apiLink, {name : name} )
        return true;
    } catch (error) {

        console.log(error);
        return false;
    }


};



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

    }


};


/***************************************
* ANNOTATON STYLE RESOURCE
***************************************/

async function get_annotation_style_async(id){

    var dialogues = {}

    if (id == undefined) {
        var apiLink = API_BASE+"/dialogue_annotationstyle";
    } else {
        var apiLink = API_BASE+"/"+session_name()+`/dialogue_annotationstyle/${id}`
    }

    try {
        var response = await axios.get(apiLink)


        dialogueStyle = response.data
        console.log("=============ANNOTATION CLASSES==============")
        console.log(dialogueStyle)
        return dialogueStyle

    } catch (error) {

        console.log(error);

    }


};


/***************************************
* DIALOGUES METADATA RESOURCE
***************************************/

async function write_tag(id,tag,value) {

  var apiLink = API_BASE+"/"+session_name()+`/dialogue/${id}/${tag}/${value}`

  try {

    var response = await axios.post(apiLink)

    console.log("=========== TAG WRITING SUCCESS ===========")
    return response

  } catch(error) {

    console.log(error);
    alert(guiMessages.selected.lida.connectionError)

  }

}

async function get_all_dialogue_ids_async(admin) {

  var dialogues = {}

  if (admin == undefined) {

    var apiLink = API_BASE+"/"+session_name()+'/dialogues_metadata';

  } else {

    var apiLink = API_BASE+"/dialogues_metadata";
  }

  try {

    var response = await axios.get(apiLink)

    console.log(response)

    dialoguesList = response.data
    console.log("=========== ALL DIALOGUE METADATA LIST ===========")
    return dialoguesList

  } catch(error) {

    console.log(error);
    alert(guiMessages.selected.lida.connectionError)

  }

}


async function change_dialogue_name_async(oldName, newName) {

    var apiLink = API_BASE+"/"+session_name()+`/dialogues_metadata/${oldName}`

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
    }

    //users workspaces

    try {
        var response = await RESTdialogues( "GET", null, {})

        dialogues = response.data
        return dialogues

    } catch(error) {

        console.log(error);

    }

};


async function get_single_dialogue_async(id) {

    try {

        var response = await RESTdialogues( "GET", id, {})
        console.log("===== GOT SINGLE DIALOGUE =====")
        console.log(response)
        dialogue = response.data.dialogue
        return dialogue

    } catch(error) {

        console.log(error)

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

    }

}


async function post_new_dialogues_from_string_lists_async(stringLists) {

    try {

        const response = await RESTdialogues("POST", null, stringLists );

        console.log('RECEIVED RESPONSE TO POST DATA')
        console.log(response)

        return response

    } catch(error) {

        console.log(error);
    }
}


async function post_new_dialogue_from_json_string_async(jsonString, fileName) {
    
    fileName = fileName.split(".")[0]

    try {

        const response = await RESTdialogues( "POST", null, JSON.parse(jsonString), fileName );

        console.log('RECEIVED RESPONSE TO POST DATA')
        console.log(response)

        return response

    } catch(error) {

        console.log(error);

    }

}


async function put_single_dialogue_async(event, dialogueId, dTurns) {

    try {

        const response = await RESTdialogues( "PUT", dialogueId, dTurns )
        console.log('---- RESPONSE TO PUT ----', response);
        status = response.data.status
        console.log('status', status)
        return status

    } catch(error) {

        console.log(error);

    }

};


async function del_single_dialogue_async(dialogueId) {

    try {

        const response = await RESTdialogues( "DELETE", dialogueId )
        console.log('---- RESPONSE TO DEL ----', response);

    } catch(error) {

        console.log(error);

    }

};

async function del_all_dialogues_async(admin) {

    if (admin == undefined) {
        var apiLink = API_BASE+"/"+session_name()+`/dialogues_wipe`
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

async function recover_dialogues(collection) {

const apiLink = API_BASE+"/"+session_name()+`/dialogues_recover/${collection}`

    try {

        var response = await axios.get(apiLink, collection)

        console.log("=========== RECOVERY DONE ===========")
        return response

    } catch(error) {

        console.log(error);
        alert(guiMessages.selected.lida.connectionError)

  }

}


async function RESTdialogues(method, id, params, fileName){
    console.log("********** ACCESSING DIALOGUES RESOURCE **********");
    console.log("REQUESTED FROM: "+session_name())
    console.log("ID: "+id)
    console.log("METHOD "+method)
    console.log("PARAMS "+params)
    console.log("COLLECTION "+fileName)

    //
    if (fileName != undefined) { var apiLink = API_BASE+"/"+session_name()+`/dialogues/collection/${fileName}` }
    else if (id==null) { var apiLink = API_BASE+"/"+session_name()+`/dialogues` }
    else { var apiLink = API_BASE+"/"+session_name()+`/dialogues/${id}` }

    //
    if (method=="DELETE") {
        var response = await axios.delete( apiLink );
    }
    else if (method=="PUT") {
        var response = await axios.put( apiLink, params );
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

async function update_db(annotationRate, backup) {

  var entries_ids = {}

  if (backup == true) {
    var apiLink = API_BASE+"/"+session_name()+`/backup/${annotationRate}`
  } else {
    var apiLink = API_BASE+"/"+session_name()+`/database/${annotationRate}`
  }

  try {

    var response = await axios.put(apiLink)

    console.log(response)

    entriesList = response.data
    console.log("======== UPDATING DATABASE ========")
    console.log(entriesList)
    return entriesList

  } catch(error) {

    console.log(error);
    alert(guiMessages.selected.lida.connectionError)

  }

}

async function del_db_entry_async(entryId, collection) {

    console.log("DELETING",entryId);

    if (collection == undefined) {
        var apiLink = API_BASE+`/database/${entryId}`;

        try {

            var response = await axios.delete( apiLink, entryId );
            console.log('---- RESPONSE TO DEL ----', response);

        } catch(error) {

            console.log(error);
        }
    
    } else {

        var apiLink = API_BASE+`/database/${entryId}/${collection}`;

        try {

            var response = await axios.delete( apiLink, entryId, collection );
            console.log('---- RESPONSE TO DEL ----', response);
            return response

        } catch(error) {

            console.log(error);
        }
    }
}

async function get_db_entry_async(entryId,DBcollection) {

    console.log("GETTING ID:",entryId, "in collection",DBcollection);

    var apiLink = API_BASE+`/database/${entryId}/${DBcollection}`;

    try {

        var response = await axios.get( apiLink, entryId );
        console.log('---- DATABASE DOCUMENT ----', response.data);

    } catch(error) {

        console.log(error);
    }

    return response.data
}

async function get_all_entries_async() {

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

  const apiLink = API_BASE+`/login/${loginName}/${loginPass}`;

  try {

    var response = await axios.post(apiLink, loginName, loginPass);

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

async function get_collections_ids_async() {

  entriesList = []

  const apiLink = API_BASE+`/collections/ids`

  try {

    var response = await axios.get(apiLink)

    console.log(response)

    entriesList = response.data

    return entriesList

  } catch(error) {

    console.log(error);
    alert(guiMessages.selected.lida.connectionError)

  }
}

async function get_collections_async() {

  entriesList = []

  const apiLink = API_BASE+`/collections`

  try {

    var response = await axios.get(apiLink)

    console.log(response)

    entriesList = response.data

    return entriesList

  } catch(error) {

    console.log(error);
    alert(guiMessages.selected.lida.connectionError)

  }
}

async function update_collection_async(id, params, doc) {

    doc = JSON.parse("{"+doc+"}");
    params.document = doc

    const apiLink = API_BASE+`/collections/${id}`

    try {

        response = await axios.post(apiLink, {json: params})

    } catch(error) {

        console.log(error);
        alert("Error. This could be caused by a server error or a wrong character in your collection file")
        response = error 
    }

    return response
}

/********************************
*  ADMIN 
********************************/

async function get_scores_async(){

    var dialogues = {}

    const apiLink = API_BASE+"/agreements"
    try {
        var response = await axios.get( apiLink );

        errors = response.data
        console.log("=============ERRORS==============")
        console.log(errors)
        return errors

    } catch (error) {

        console.log(error);
    }
}

async function get_errors_async(dialogueId){

    var dialogues = {}

    const apiLink = API_BASE+`/errors/${dialogueId}`
    try {
        var response = await axios.get( apiLink );

        errors = response.data
        console.log("=============ERRORS==============")
        console.log(errors)
        return errors

    } catch (error) {

        console.log(error);
    }
}

async function put_error_async(error, meta, errorId, dialogueId){

    params = {
        errorObject : error,
        meta : meta,
        errorId : errorId,
        dialogueId : dialogueId
    }
    const apiLink = API_BASE+"/errors"
    try {
        var response = await axios.put( apiLink, params );


        console.log("=============ERRORS==============")
        console.log(response)
        return true

    } catch (error) {

        console.log(error);
        return false
    }
}

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


async function import_new_dialogue_from_json_string_async(jsonString, fileName=null) {

    fileName = fileName.split(".")[0]

    var apiLink = API_BASE+"/dialogues_import"

    try {

        var response = await axios.post( apiLink, { payload:JSON.parse(jsonString), name:fileName } )

        console.log('RECEIVED RESPONSE TO POST DATA')
        console.log(response)

        return response

    } catch(error) {

        console.log(error);

    }
}

async function get_all_users(){
    
    const apiLink = API_BASE+"/users"

    var users = {}

    try {
        var response = await axios.get( apiLink )

        users = response.data
        return users

    } catch(error) {

        console.log(error);
    }
}

async function create_user(user,pass,role,email){
    
    const apiLink = API_BASE+`/create_users`;

    var response = {}

    try {
        var response = await axios.post( apiLink, { "user":user,"pass":pass, "role":role, "email":email } )

        response = response.data
        return response

    } catch(error) {

        console.log(error);
    }
}


/********************************
* Exporting
********************************/

backend =
{
    put_name                                    : put_name,
    annotate_query                              : annotate_query,
    write_tag                                   : write_tag,
    get_annotation_style_async                  : get_annotation_style_async,

    get_all_dialogues_async                     : get_all_dialogues_async,
    put_single_dialogue_async                   : put_single_dialogue_async,
    get_all_dialogue_ids_async                  : get_all_dialogue_ids_async,
    get_single_dialogue_async                   : get_single_dialogue_async,
    del_single_dialogue_async                   : del_single_dialogue_async,
    del_all_dialogues_async                     : del_all_dialogues_async,
    change_dialogue_name_async                  : change_dialogue_name_async,
    recover_dialogues                           : recover_dialogues,

    post_empty_dialogue                         : post_empty_dialogue,
    post_new_dialogues_from_string_lists_async  : post_new_dialogues_from_string_lists_async,
    post_new_dialogue_from_json_string_async    : post_new_dialogue_from_json_string_async,

    get_all_db_entries_ids                      : get_all_db_entries_ids,
    update_db                                   : update_db,
    get_db_entry_async                          : get_db_entry_async,
    del_db_entry_async                          : del_db_entry_async,
    get_all_entries_async                       : get_all_entries_async,

    login                                       : login,
    get_all_users                               : get_all_users,
    create_user                                 : create_user,

    update_collection_async                     : update_collection_async,
    get_collections_ids_async                   : get_collections_ids_async,
    get_collections_async                       : get_collections_async,

    get_scores_async                            : get_scores_async,
    get_errors_async                            : get_errors_async,
    put_error_async                             : put_error_async,

    admin_post_empty_dialogue                    : admin_post_empty_dialogue,
    import_new_dialogues_from_string_lists_async : import_new_dialogues_from_string_lists_async,
    import_new_dialogue_from_json_string_async   : import_new_dialogue_from_json_string_async
}



//
