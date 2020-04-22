/********************************
* CONSTANTS
********************************/

API_LINK_BASE = "http://127.0.0.1:5000";

/********************************
* FILE NAME FUNCTIONS
********************************/

function session_name() {
    username = "user_1";
    if (localStorage["remember"] != undefined) {
        username =  localStorage["remember"]
    }
    return username
}

/* not needed anymore
async function get_name(){

   var dialogues = {}

    const apiLink = API_LINK_BASE+"/"+session_name()+'/name'
    try {
        var response = await axios.get( apiLink );

        name = response.data.name
        console.log("=============File Name==============")
        console.log(name)
        return name

    } catch (error) {

        console.log(error);

    }


};
*/

async function put_name(name){

    console.log("Set userspace",name);

    var dialogues = {}

    const apiLink = API_LINK_BASE+"/"+name+'/name'
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

    const apiLink = API_LINK_BASE+'/turns'
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

    const apiLink = API_LINK_BASE+"/dialogue_annotationstyle"

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

  const apiLink = API_LINK_BASE+"/"+session_name()+'/dialogues_metadata'

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

    const apiLink = API_LINK_BASE+"/"+session_name()+`/dialogues_metadata/${oldName}`

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


    try {

        const response = await RESTdialogues("POST", null, stringLists );

        console.log('RECEIVED RESPONSE TO POST DATA')
        console.log(response)

        return response

    } catch(error) {

        console.log(error);

    }

}


async function post_new_dialogue_from_json_string_async(jsonString) {

    try {

        const response = await RESTdialogues( "POST", null, JSON.parse(jsonString) )

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


async function RESTdialogues(method, id, params){
    console.log("********** ACCESSING DIALOGUES RESOURCE **********");
    console.log("REQUESTED FROM: "+session_name())
    console.log("ID: "+id)
    console.log("METHOD "+method)
    console.log("PARAMS "+params)

    //
    if (id==null) {var apiLink = API_LINK_BASE+"/"+session_name()+`/dialogues`;}
    else {var apiLink = API_LINK_BASE+"/"+session_name()+`/dialogues/${id}`;}

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

  const apiLink = API_LINK_BASE+"/"+session_name()+'/database'

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

  const apiLink = API_LINK_BASE+"/"+session_name()+'/database'

  try {

    var response = await axios.put(apiLink)

    console.log(response)

    entriesList = response.data
    console.log("======== UPDATING DATABASE ========")
    console.log(entriesList)
    return entriesList

  } catch(error) {

    console.log(error);
    alert("Couldn't connect to server, check that it's running.")

  }

}

async function del_db_entry_async(entryId) {

    console.log("DELETING",entryId);

    var apiLink = API_LINK_BASE+`/database/${entryId}`;

    try {

        var response = await axios.delete( apiLink, entryId );
        console.log('---- RESPONSE TO DEL ----', response);

    } catch(error) {

        console.log(error);
    }
}

async function get_db_entry_async(entryId) {

    console.log("GETTING",entryId);

    var apiLink = API_LINK_BASE+`/database/${entryId}`;

    try {

        var response = await axios.get( apiLink, entryId );
        console.log('---- DATABASE SESSION DIALOGUES ----', response.data);

        // update from database only if sessions are not equal
        let database_session = response.data;
        let actual_session = await get_all_dialogues_async()
            .then((response) => {
                //conversion needed to confront responses coming from different formats
                if (JSON.stringify(response) == JSON.stringify(database_session)) {
                    console.log("Session is up to date")
                
                } else {
                    console.log("Updating from Database");
                    //adds dialogues from database
                    post_new_dialogues_from_string_lists_async(database_session)
                        .then((response) => {
                            allDialoguesEventBus.$emit( "refresh_dialogue_list")
                        })

                }
            });

    } catch(error) {

        console.log(error);
    }
}

async function get_all_entries_async() {

  entriesList = []

  const apiLink = API_LINK_BASE+'/database/download'

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

async function login(loginName,loginPass) {

  console.log("Username inserted",loginName);

  const apiLink = API_LINK_BASE+`/login/${loginName}/${loginPass}`;

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
    get_name                                    : get_name,
    put_name                                    : put_name,
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

    get_all_db_entries_ids                      : get_all_db_entries_ids,
    update_db                                   : update_db,
    get_db_entry_async                          : get_db_entry_async,
    del_db_entry_async                          : del_db_entry_async,
    get_all_entries_async                       : get_all_entries_async,
    login                                       : login
}



//
