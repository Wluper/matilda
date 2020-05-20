/********************************
* FILE NAME FUNCTIONS
********************************/

async function get_scores_async(){

    var dialogues = {}

    const apiLink = API_LINK_INTER+"/agreements"
    try {
        var response = await axios.get( apiLink );

        errors = response.data
        console.log("=============ERRORS==============")
        console.log(errors)
        return errors

    } catch (error) {

        console.log(error);

    }


};

/********************************
* ERRORS RESOURCE
********************************/

async function get_errors_async(dialogueId){

    var dialogues = {}

    const apiLink = API_LINK_INTER+`/errors/${dialogueId}`
    try {
        var response = await axios.get( apiLink );

        errors = response.data
        console.log("=============ERRORS==============")
        console.log(errors)
        return errors

    } catch (error) {

        console.log(error);

    }


};

async function put_error_async(error, meta, errorId, dialogueId){

    params = {
        errorObject : error,
        meta : meta,
        errorId : errorId,
        dialogueId : dialogueId
    }
    const apiLink = API_LINK_INTER+"/errors"
    try {
        var response = await axios.put( apiLink, params );


        console.log("=============ERRORS==============")
        console.log(response)
        return true

    } catch (error) {

        console.log(error);
        return false

    }


};
/********************************
* API INTERACTION FUNCTIONS
********************************/

async function annotate_query(query){

    var dialogues = {}

    const apiLink = API_LINK_INTER+"/turns"
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

async function get_annotation_style_async(){

    var dialogues = {}

    const apiLink = API_LINK_INTER+"/dialogue_annotationstyle"

    try {
        var response = await axios.get(apiLink)


        dialogueStyle = response.data
        console.log("=============ANNOTATION==============")
        console.log(dialogueStyle)
        return dialogueStyle

    } catch (error) {

        console.log(error);

    }


};


/***************************************
* DIALOGUES METADATA RESOURCE
***************************************/
async function get_all_dialogue_ids_async() {

  var dialogues = {}

  const apiLink = API_LINK_INTER+"/dialogues_metadata"

  try {

    var response = await axios.get(apiLink)

    console.log(response)

    dialoguesList = response.data
    console.log("=========== ALL DIALOGUE METADATA LIST ===========")
    console.log(dialoguesList)
    return dialoguesList

  } catch(error) {

    console.log(error);
    alert("Couldn't connect to server, check that it's running.")

  }

}


async function change_dialogue_name_async(oldName, newName) {

    const apiLink = API_LINK_INTER+`/dialogues_metadata/${oldName}`

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

async function get_all_dialogues_async(){

    var dialogues = {}

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



async function post_empty_dialogue() {

    try {

        const response = await RESTdialogues("POST", null, null);

        console.log(response)
        return response.data.id

    } catch(error) {

        console.log(error);

    }

}


async function post_new_dialogues_from_string_lists_async(stringLists) {

    const apiLink = API_LINK_INTER+`/dialogues_import`

    try {

        var response = await axios.post( apiLink, stringLists )
        console.log('---- RESPONSE TO POST DATA ----', response);
        return true;

    } catch(error) {

        console.log(error);

    }
    return false;

}


async function post_new_dialogue_from_json_string_async(jsonString, fileName=null) {

    try {

        const response = await RESTdialogues( "POST", null, {payload: JSON.parse(jsonString), name: fileName } )

        console.log('RECEIVED RESPONSE TO POST DATA')
        console.log(response)

        return response

    } catch(error) {

        console.log(error);

    }

}


async function put_single_dialogue_async(event, dialogueId, dialogue) {

    try {

        const response = await RESTdialogues( "PUT", dialogueId, dialogue )
        console.log('---- RESPONSE TO PUT ----', response);
        status = response.data.status
        console.log('status', status)
        return status

    } catch(error) {

        console.log(error);

    }

}


async function del_single_dialogue_async(dialogueId) {

    try {

        const response = await RESTdialogues( "DELETE", dialogueId )
        console.log('---- RESPONSE TO DEL ----', response);

    } catch(error) {

        console.log(error);

    }

}

async function get_all_users(){
    
    const apiLink = API_LINK_INTER+"/users"

    var users = {}

    try {
        var response = await axios.get( apiLink )

        users = response.data
        return users

    } catch(error) {

        console.log(error);

    }

}

async function create_user(user,pass,email){
    
    const apiLink = API_LINK_INTER+`/users/${user}/${pass}/${email}`;

    var response = {}

    try {
        var response = await axios.post( apiLink, { user, pass, email } )

        response = response.data
        return response

    } catch(error) {

        console.log(error);

    }

}


async function get_all_db_entries_ids() {

  var entries_ids = {}

  const apiLink = API_LINK_INTER+'/database'

  try {

    var response = await axios.get(apiLink)

    console.log(response)

    entriesList = response.data
    console.log("=========== ALL DATABASE ENTRIES LIST ===========")
    console.log(entriesList)
    return entriesList

  } catch(error) {

    console.log(error);
    alert("Couldn't connect to server, check that it's running.")

  }

}

async function update_db() {

  var entries_ids = {}

  const apiLink = API_LINK_INTER+'/database'

  try {

    var response = await axios.put(apiLink)

    console.log(response)

    entriesList = response.data
    console.log("=========== UPDATING ===========")
    console.log(entriesList)
    return entriesList

  } catch(error) {

    console.log(error);
    alert("Couldn't connect to server, check that it's running.")

  }

}

async function del_db_entry_async(entryId,collection) {

    console.log("DELETING",entryId);

    var apiLink = API_LINK_INTER+`/database/${entryId}/${collection}`;

    try {

        var response = await axios.delete( apiLink, entryId, collection );
        console.log('---- RESPONSE TO DEL ----', response);
        return response

    } catch(error) {

        console.log(error);
    }
};

async function get_all_entries_async() {

  entriesList = []

  const apiLink = API_LINK_INTER+'/database/download'

  try {

    var response = await axios.get(apiLink)

    console.log(response)

    entriesList = response.data
    console.log("=========== DOWNLOADING ===========")
    return entriesList

  } catch(error) {

    console.log(error);
    alert("Couldn't connect to server, check that it's running.")

  }
}

async function get_db_entry_async(entryId,collection) {

    console.log("GETTING ID:",entryId, collection,"document");

    var apiLink = API_LINK_INTER+`/database/${entryId}/${collection}`;

    try {

        var response = await axios.get( apiLink, entryId );
        console.log('---- DATABASE DOCUMENT ----', response.data);

    } catch(error) {

        console.log(error);
    }

    return response.data
}

async function del_all_dialogues_async() {

    const apiLink = API_LINK_INTER+"/dialogues_wipe"

    try {

        var response = await axios.delete(apiLink)

        console.log("=========== WIPE DONE ===========")
        return response

    } catch(error) {

        console.log(error);
        alert("Couldn't connect to server, check that it's running.")

    }

}

/***************************************
* COLLECTIONS RESOURCE
***************************************/


async function get_collection_ids_async() {

  entriesList = []

  const apiLink = API_LINK_INTER+`/collections`

  try {

    var response = await axios.get(apiLink)

    console.log(response)

    entriesList = response.data

    return entriesList

  } catch(error) {

    console.log(error);
    alert("Couldn't connect to server, check that it's running.")

  }
}

async function update_collection_async(id, params) {

    const apiLink = API_LINK_INTER+`/collections/${id}`

    try {

        response = await axios.post(apiLink, {json: JSON.parse(params)})

    } catch(error) {

        console.log(error);
        alert("Couldn't connect to server, check that it's running.")
        response = error 
    }

    return response
}


async function RESTdialogues(method, id, params){
    console.log("********** ACCESSING DIALOGUES RESOURCE **********");
    console.log("ID: "+id)
    console.log("METHOD "+method)
    console.log("PARAMS "+params)

    //
    if (id==null) {var apiLink = API_LINK_INTER+"/dialogues";}
    else {var apiLink = API_LINK_INTER+`/dialogues/${id}`;}

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

async function login(loginName,loginPass) {

  console.log("Username inserted",loginName);

  const apiLink = API_LINK_INTER+`/login/${loginName}/${loginPass}`;

  try {

    var response = await axios.post(apiLink, loginName, loginPass);

    console.log(response);

    console.log("=========== LOGGIN IN ===========")
    return response

  } catch(error) {

    console.log(error);
    alert("Couldn't connect to server, check that it's running.")

  }

}


/********************************
* Exporting
********************************/

backend =
{
    get_scores_async                            : get_scores_async,
    get_errors_async                            : get_errors_async,
    put_error_async                             : put_error_async,

    annotate_query                              : annotate_query,

    get_annotation_style_async                  : get_annotation_style_async,

    get_all_dialogues_async                     : get_all_dialogues_async,
    put_single_dialogue_async                   : put_single_dialogue_async,
    get_all_dialogue_ids_async                  : get_all_dialogue_ids_async,
    get_single_dialogue_async                   : get_single_dialogue_async,
    del_single_dialogue_async                   : del_single_dialogue_async,
    change_dialogue_name_async                  : change_dialogue_name_async,

    post_empty_dialogue                         : post_empty_dialogue,
    post_new_dialogues_from_string_lists_async  : post_new_dialogues_from_string_lists_async,
    post_new_dialogue_from_json_string_async    : post_new_dialogue_from_json_string_async, 
    
    get_all_users                               : get_all_users,
    create_user                                 : create_user,

    get_all_db_entries_ids                      : get_all_db_entries_ids,
    get_db_entry_async                          : get_db_entry_async,
    update_db                                   : update_db,
    del_db_entry_async                          : del_db_entry_async,
    del_all_dialogues_async                     : del_all_dialogues_async,
    get_all_entries_async                       : get_all_entries_async,

    get_collection_ids_async                    : get_collection_ids_async,
    update_collection_async                     : update_collection_async,

    login                                       : login
}



//
