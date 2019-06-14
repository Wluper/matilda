
/************************************************************************************************
********************************
* UTILS FUNCTIONS
********************************
************************************************************************************************/

/********************************
* LOCAL DATA MANIPULATROS
********************************/

function create_empty_turn(validAnnotations){

    var out = {};

    for (idx = 0, len = validAnnotations.length; idx<len; idx++){
        out[validAnnotations[idx]]=[];
    }

    return out;

}


function get_default_data_for_type(type) {

  switch (type) {

      case 'string':
          dataToAppend = ''
          break;

      case 'data':
          dataToAppend = ''
          break;

      case 'multilabel_classification':
          dataToAppend = []
          break;

      case 'multilabel_classification_string':
          dataToAppend = []
          break;

      default:
          console.log('******** TYPE NOT FOUND ********')
          dataToAppend = null;
          break;

    }

    return dataToAppend

}


function get_turn_data(turnData, validAnnotations, annotationStyle){
    // """
    // returns data in the shape of
    //     {
    //         classification: [{name: sys_act, data:[act1,act2], params:[]}],
    //         string: [{name: user, data:'hi', params:''}],
    //     }
    // """
    // needs to be the type defined above
    var out = create_empty_turn(validAnnotations);

    // Iterate through
    for ( [key, value] of Object.entries(annotationStyle) ){

        type = annotationStyle[key][0];

        try {
            dataToAppend = turnData[key]
        } catch (error) {
            dataToAppend = null
        }

        if (dataToAppend == null) {
            dataToAppend = get_default_data_for_type(type)
        }

        if (type in out) {
            if (type=="data"){

                // If type is data, which means it's the user's query, then put
                // it at the front of the list to ensure it's displayed first
                out["string"].unshift({name: key, data: dataToAppend, params: annotationStyle[key][1]})

            } else {

                out[type].push({name: key, data: dataToAppend, params: annotationStyle[key][1]})

            }
        }
    }

    return out;
}


function get_all_turns_data(turns, validAnnotations, annotationStyle){
    out = []


    for (var idx=0, len=turns.length; idx<len; idx++){

        temp = get_turn_data( turns[idx], validAnnotations, annotationStyle );
        out.push( temp  )

    }

    return out;
}


function update_turn(turn, turnData){
    // """
    // turn:
    //     {
    //         name(e.g. user) : data(e.g. hello)
    //     }
    // turnData:
    // {
    //     name : name(e.g. user) data: data(e.g. hello)
    // }
    // """
    temp = {}
    temp[turnData.name] = turnData.data
    update_dict1_from_dict2(turn,temp)
}



/********************************
* API INTERACTION FUNCTIONS
********************************/

function format_received_dialogue_data(dialogues){

    var formatDialogues = {}
    var dialogueId = 0

    for (var  dialogue in dialogues["dialogues"])
    {
        var singleDialogue = []

        for (var turnIndex in dialogues["dialogues"][dialogue])
        {
          turn = dialogues["dialogues"][dialogue][turnIndex]
          // var formatTurn = {}
          // formatTurn["transcript"] = turn["transcript"]
          // formatTurn["sys_transcript"] = turn["sys_transcript"]
          // formatTurn["policy_funcs"] = turn["policy_funcs"]
          // singleDialogue.push(formatTurn)
          singleDialogue.push(turn)
        }

        dialogueId = dialogueId + 1;

        formatDialogues[dialogueId] = singleDialogue

    }
    return formatDialogues
}


function get_all_dialogues(){

    var dialogues = {}

    axios.get('http://127.0.0.1:5000/get_all_dialogues')

        .then(function (response) {
          // handle success
          dialogues = response.data
          console.log(dialogues)
          dialoguesGet = format_received_dialogue_data(dialogues)
          console.log(dialoguesGet)
          return dialoguesGet

        })

        .catch(function (error) {
          // handle error
          console.log(error);
        })

        .finally(function () {
          console.log("CALLBACK FINISHED 1")
        });

};


function get_annotation_style(){

    var dialogues = {}

    axios.get('http://127.0.0.1:5000/get_annotation_style')

        .then(function (response) {
          // handle success
          dialogueStyle = response.data
          console.log(dialogueStyle)
          return dialogueStyle
        })

        .catch(function (error) {
          // handle error
          console.log(error);
        })

        .finally(function () {
          console.log("CALLBACK FINISHED 2")
        });

};


async function get_all_dialogues_async(){

    var dialogues = {}

    try {
        var response = await axios.get('http://127.0.0.1:5000/get_all_dialogues');

        dialogues = response.data
        // console.log("=============DIALOGUE==============")
        // console.log(dialogues)
        // dialoguesGet = format_received_dialogue_data(dialogues)
        // console.log(dialoguesGet)
        return dialogues.dialogues

    } catch(error) {

        console.log(error);

    }

};


async function get_single_dialogue_async(id) {

    try {

        var response = await axios.get(`http://127.0.0.1:5000/dialogues/${id}`)
        console.log("===== GOT SINGLE DIALOGUE =====")
        console.log(response)
        dialogue = response.data.dialogue
        return dialogue

    } catch(error) {

        console.log(error)

    }

}


async function get_all_dialogue_ids_async() {

  var dialogues = {}

  try {

    var response = await axios.get('http://127.0.0.1:5000/dialogues');

    dialoguesList = response.data.metadata
    console.log("=========== ALL DIALOGUE METADATA LIST ===========")
    console.log(dialoguesList)
    return dialoguesList

  } catch(error) {

    console.log(error);
    alert("Couldn't connect to server, check that it's running.")

  }

}


async function get_annotation_style_async(){

    var dialogues = {}

    try {
        var response = await axios.get('http://127.0.0.1:5000/get_annotation_style')


        dialogueStyle = response.data
        console.log("=============ANNOTATION==============")
        console.log(dialogueStyle)
        return dialogueStyle["annotation"]

    } catch (error) {

        console.log(error);

    }


};


async function get_annotate_turn_async(query){

    var dialogues = {}

    try {
        var response = await axios.get(
            'http://127.0.0.1:5000/get_annotate_turn',{ params:{query: query} } );

        dialogueStyle = response.data
        console.log("=============TURN ANNOTATION==============")
        console.log(dialogueStyle)
        return dialogueStyle["turn"]

    } catch (error) {

        console.log(error);

    }


};


async function create_empty_dialogue() {

    const apiPath = 'http://127.0.0.1:5000/create_empty_dialogue'

    try {

        const response = await axios.get(apiPath);

        return response.data.generated_id

    } catch(error) {

        console.log(error);

    }

}


async function post_new_dialogues_from_string_lists_async(stringLists) {

    const apiPath = 'http://127.0.0.1:5000/dialogues'

    try {

        const response = await axios.post(apiPath, stringLists)

        console.log('RECEIVED RESPONSE TO POST DATA')
        console.log(response)

        return response

    } catch(error) {

        console.log(error);

    }

}


async function post_new_dialogue_from_json_string_async(jsonString) {

    try {

        const response = RESTdialogues( "POST", JSON.parse(jsonString) )

        console.log('RECEIVED RESPONSE TO POST DATA')
        console.log(response)

        return response

    } catch(error) {

        console.log(error);

    }

}


async function put_single_dialogue_async(event, dialogueId, dTurns) {

    try {

        const response = RESTdialogues( "PUT", dialogueId, {turns : dTurns} )
        console.log('---- RESPONSE TO PUT ----', response);
        status = response.data.status
        console.log('status', status)
        return status

    } catch(error) {

        console.log(error);

    }

};


async function change_dialogue_name_async(oldName, newName) {

    try {

        const response = RESTdialogues( "PUT", oldName, {id: newName} )
        console.log('---- RESPONSE TO NAME CHANGE ----', response);
        return true;

    } catch(error) {

        console.log(error);

    }
    return false;

};


async function del_single_dialogue_async(dialogueId) {

    try {

        const response = RESTdialogues( "DELETE", dialogueId )
        console.log('---- RESPONSE TO DEL ----', response);

    } catch(error) {

        console.log(error);

    }

};



async function RESTdialogues(method, id, params){
    console.log("********** ACCESSING DIALOGUES RESOURCE **********");
    console.log("ID:"+dialogueId)
    console.log("METHOD"+method)
    console.log("PARAMS"+params)

    //
    if (id==NONE) const apiLink = `http://127.0.0.1:5000/dialogues`;
    else const apiLink = `http://127.0.0.1:5000/${dialogueId}`;

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
    return response


}
/********************************
* HELPER FUNCTIONS
********************************/

function range(start, stop, step) {
    var a = [start], b = start;
    while (b < stop) {
        a.push(b += step || 1);
    }
    return a;
}


function update_dict1_from_dict2(dict1,dict2){

    for ( [key, value] of Object.entries(dict2) ){

        dict1[key] = value;

    }

}


function determine_drag_and_drop_capable() {

    /*
     * Source for this function:
     * https://serversideup.net/drag-and-drop-file-uploads-with-vuejs-and-axios/
     */

     /*
      * Create a test element to see if certain events
      * are present that let us do drag and drop.
      */
     var div = document.createElement('div');

     /*
      * Check to see if the `draggable` event is in the element
      * or the `ondragstart` and `ondrop` events are in the element. If
      * they are, then we have what we need for dragging and dropping files.
      *
      * We also check to see if the window has `FormData` and `FileReader`
      * objects present so we can do our AJAX uploading
      */
     return ( ( 'draggable' in div )
             || ( 'ondragstart' in div && 'ondrop' in div ) )
             && 'FormData' in window
             && 'FileReader' in window;

}


/********************************
* Exporting
********************************/

utils =
{
    range                              : range,
    get_all_dialogues_async            : get_all_dialogues_async,
    get_annotation_style_async         : get_annotation_style_async,
    get_annotate_turn_async            : get_annotate_turn_async,
    put_single_dialogue_async          : put_single_dialogue_async,
    get_all_dialogue_ids_async         : get_all_dialogue_ids_async,
    get_single_dialogue_async          : get_single_dialogue_async,
    create_empty_dialogue              : create_empty_dialogue,
    del_single_dialogue_async          : del_single_dialogue_async,
    change_dialogue_name_async         : change_dialogue_name_async,
    post_new_dialogues_from_string_lists_async : post_new_dialogues_from_string_lists_async,
    post_new_dialogue_from_json_string_async : post_new_dialogue_from_json_string_async,
}

//
// export utils;
//




//
