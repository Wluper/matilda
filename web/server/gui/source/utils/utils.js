/************************************************************************************************
********************************
* UTILS FUNCTIONS
********************************
************************************************************************************************/

/********************************
* LOCAL DATA MANIPULATROS
********************************/

function create_date(){
    let now = new Date();
    let out = String(now.getHours()+":"+now.getMinutes()+" ");
    out += String(now.getDate()+"/"+now.getMonth()+"/"+now.getFullYear());
    return out
}

function create_empty_turn(validAnnotations){

    var out = {};

    for (idx = 0, len = validAnnotations.length; idx<len; idx++){
        out[ validAnnotations[idx] ]=[];
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

      case 'multilabel_global_string':
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
    if (turnData ==null) {
        console.log("+++++++++++++++++++++++ EXITING TURN DATA ++++++++++++++++++++++++++++++++")
        return {}
    }
    // Iterate through
    for ( [key, value] of Object.entries(annotationStyle) ){

        type = annotationStyle[key]["label_type"];

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
                out["string"].unshift({
                    name: key,
                    data: dataToAppend,
                    params: annotationStyle[key]["labels"],
                    info: annotationStyle[key]["info"]
                })

            } else {

                out[type].push({
                    name: key,
                    data: dataToAppend,
                    params: annotationStyle[key]["labels"],
                    info: annotationStyle[key]["info"]
                })

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

function annotation_rate_increment(turnNumber, annotations, turnTot, turnList) {
    // if turn is not already annotated return the dialogue relative % increment
    let unitRate = (100 / (turnTot-1));

    if (annotations.data != undefined) {
        if (annotations.data.length > 0) {
            if ((turnList[turnNumber] == undefined) || (turnList[turnNumber] == false) || (turnList[turnNumber] == "annotated")) {
                turnList[turnNumber] = true;
                return unitRate
            } else {
                return 0
            }
        } else if (annotations.data.length == 0) {
            if ((turnList[turnNumber] != undefined) && (turnList[turnNumber] != false)) {
                turnList[turnNumber] = false; 
                return -(unitRate)
            } else {
                return 0
            }
        }
    }
}



utils =
{
    range       : range,
    update_turn : update_turn,
    get_turn_data : get_turn_data,
    get_all_turns_data : get_all_turns_data,
    create_date  : create_date,
    annotation_rate_increment : annotation_rate_increment
}
