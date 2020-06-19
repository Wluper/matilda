/************************************
* Main Single Annotation Component
*************************************/

Vue.component("annotation-app", {

    props: [
      "dialogueId"
    ],

    data () {
        return {
            guiMessages,
            dCurrentId: data.currentTurnId,
            dTurns: [],
            validAnnotations: data.validAnnotations,
            annotationFormat: {},
            allDataSaved: true,
            primaryElementClassName: "primary-turn-input",
            globalSlotNonEmpty: 0,
            metaTags: [],
            annotatedTurns: [],
            annotationRate: '0%',
        }
    },

    // COMPUTED properties
    computed:{
        dIds: function() {
            temp = utils.range(1, this.dTurns.length);
            return temp;
        },

        dCurrentTurn: function() {
            temp = utils.get_turn_data(this.dTurns[ this.dCurrentId], this.validAnnotations, this.annotationFormat);
            return temp;
        },

        dTransformedTurns: function(){
            temp = utils.get_all_turns_data(this.dTurns, this.validAnnotations, this.annotationFormat);
            return temp;
        },

        dialogueNonEmpty: function() {
            return this.dTurns.length > 0
        },
    },

    mounted () {
        this.init();
        this.focus_on_new_query_box();
    },

/***************************************************************************
*
* EVENTS GO HERE
*
***************************************************************************/
    created (){
        // GENERAL EVENT LISTENERS
        window.addEventListener('keyup', this.change_turn);
        annotationAppEventBus.$on("go_back", this.go_back );

        // DIALOGUE TURNS EVENTS
        //annotationAppEventBus.$on( "turn_updated_string", this.turn_update );
        annotationAppEventBus.$on( "update_turn_id", this.id_updated_from_ids_list );
        annotationAppEventBus.$on( "delete_turn", this.remove_turn );

        // ANNOTATION EVENTS
        annotationAppEventBus.$on( "update_classification", this.turn_update );
        annotationAppEventBus.$on( "classification_string_updated", this.turn_update );
        annotationAppEventBus.$on( "resume_annotation_tools", this.resume_annotation_tools );
        annotationAppEventBus.$on( "turn_is_annotated", this.turn_is_annotated );

        // INPUT BOX EVENTS
        annotationAppEventBus.$on( "new_turn", this.append_new_turn );
        annotationAppEventBus.$on( "save_dialogue", this.save_dialogue );
    },

    beforeDestroyed() {
        console.log("==================================");
        console.log("I am being destroyed");
        console.log(this.dialogueId);
    },
    // METHODS
    methods:{
        go_back : function(){
            console.log("==================================");
            console.log("==================================");
            console.log("==================================");
            window.removeEventListener('keyup', this.change_turn);
            annotationAppEventBus.$off("go_back", this.go_back );

            // DIALOGUE TURNS EVENTS
            //annotationAppEventBus.$off( "turn_updated_string", this.turn_update );
            annotationAppEventBus.$off( "update_turn_id", this.id_updated_from_ids_list );
            annotationAppEventBus.$off( "delete_turn", this.remove_turn );

            // ANNOTATION EVENTS
            annotationAppEventBus.$off( "update_classification", this.turn_update );
            annotationAppEventBus.$off( "classification_string_updated", this.turn_update );
            annotationAppEventBus.$off( "turn_is_annotated", this.turn_is_annotated );

            // INPUT BOX EVENTS
            annotationAppEventBus.$off( "new_turn", this.append_new_turn );
            annotationAppEventBus.$off( "save_dialogue", this.save_dialogue );
        },

        init: function() {

            // Step One :: Download a Single Dialogue
            backend.get_single_dialogue_async(this.dialogueId)
                .then( (response) => {
                    console.log('---- RECEIVED DATA FROM THE SERVER ----')
                    console.log(response);
                    this.metaTags = response[0];
                    console.log('---- END ----')
                    this.dTurns = response;
                    //format collection meta-tag
                    if ((this.metaTags["collection"] == null) || (this.metaTags["collection"] == undefined))
                    this.metaTags["collection"] = "";
                    this.annotationRate = this.metaTags["status"];
                })

          // Step Two :: Get the Annotation Styles
          backend.get_annotation_style_async(this.dialogueId)
              .then( (response) => {
                  this.annotationFormat = response;
                  this.globalSlotNonEmpty = this.annotationFormat.global_slot.labels.length;
              });

        },

        remove_turn: function(event) {
            this.resume_annotation_tools();
            console.log('Removing turn', event)
            this.dTurns.splice(event - 1, 1)
            this.allDataSaved = false;
            //if (this.dCurrentId > 1) {
            //    this.dCurrentId -= 1
            //}
        },

        change_turn: function(event) {
            console.log(" ************ DTURNS ************ ")
            console.log(this.dCurrentId)
            console.log(event)
            if (event.key=="Enter"){
                temp=1;
            } else {
              return;
            }

            if ( !( this.dCurrentId==this.dTurns.length ) ){
                if ( !( this.dCurrentId==1 ) ){
                    this.dCurrentId += temp;
                }
                else if (temp==1){
                    this.dCurrentId += temp;
                }
            }
            else if (temp==-1){
                this.dCurrentId += temp;
            }

            this.change_focus_based_on_current_turn_id();

        },

        change_focus_based_on_current_turn_id : function () {
            // Changes the focus of the current text field to be the first input
            // field in the turn which has the current ID.
            console.log("Changing focus");
            turnInputElements = document.querySelectorAll('.' + this.primaryElementClassName)

            for (var i = 0; i < turnInputElements.length; i++) {
                elementId = turnInputElements[i].id;
                if (elementId[0] == this.dCurrentId) {
                    const element = document.getElementById(elementId);
                    element.focus();
                    break;
                }
            }
        },

        id_updated_from_ids_list: function(event) {
            console.log("-----> Updating TurnId:")
            console.log(event);
            this.dCurrentId = event;
            this.resume_annotation_tools();
        },

        turn_update: function(event){
            //turn 0 is meta-tags and global_slot reserved so it's skipped
            if (this.dCurrentId != 0) {
                this.allDataSaved = false;
                //update annotation rate, slots don't count
                if (event.turn != undefined)
                    this.update_annotation_rate(event, this.dTurns.length);
                //update turn
                utils.update_turn( this.dTurns[this.dCurrentId], event);
                console.log("-----> Turn Updated", this.dCurrentTurn);

            } else {
                console.log(guiMessages.selected.annotation_app.noTurn);
            }
        },

        turn_is_annotated: function(event) {
            if (this.annotatedTurns[event] == undefined)
                this.annotatedTurns[event] = "annotated";
        },

        update_annotation_rate: function(annotations, turnTot) {
            let oldValue = Number(this.dTurns[0]["status"].slice(0,-1));
            let increment = Number(utils.annotation_increment(annotations.turn, annotations, turnTot, this.annotatedTurns));
            let newValue = ( Number(oldValue) + Number(increment) ).toFixed(1);
            //small adjustments due to decimals removal and exceptions
            if (newValue >= 98) newValue = 100;
            else if (newValue < 0) newValue = 0;
            //updating value
            this.dTurns[0]["status"] = newValue + "%";
            this.annotationRate = newValue + "%";
        },

        append_new_turn: function(event){
            this.allDataSaved = false;
            backend.annotate_query(event)
                .then( (response) => {
                    console.log("+++++++++++++ GOT ANNOTATED TURN FROM API ++++++++++++")
                    console.log(response)
                    this.dTurns.push(response);
                    this.dCurrentId = this.dTurns.length;
                    this.focus_on_new_query_box();
                });
        },

        focus_on_new_query_box: function() {
            console.log('FOCUSING ON THE INPUT BOX')
            const toFocus = document.getElementById('new-query-entry-box')
            toFocus.focus()
        },

        save_dialogue: function(event) {
            console.log("DIALOGUE ID BEING SENT");
            console.log(this.dialogueId);

            backend.put_single_dialogue_async(event, this.dialogueId, this.dTurns)
                .then( (status) => {

                    if (status == "success") {
                        this.allDataSaved = true;
                        backend.update_db(mainApp.collectionRate, false);
                    } else {
                        this.allDataSaved = false;
                        alert("Server error, dialogue not saved!")
                    }

                });
        },

        resume_annotation_tools: function(event) {
            console.log("Resuming annotation tools");
            //resuming label
            if (document.getElementById("active_label") != undefined) {
                let activeLabel = document.getElementById("active_label");
                let labelName = activeLabel.title;
                activeLabel.id = null;
                activeLabel.title = null;
            }
            //resuming turn
            let activeTurn = document.getElementsByClassName("dialogue-turn-selected")[0];
            if (activeTurn != undefined) {
                activeTurn.style = null;
                let activeInputs = activeTurn.getElementsByClassName("primary-turn-input");
                Array.from(activeInputs).forEach(element => element.onmouseup = null);
            }
            //resuming annotation sections
            let annotations = document.getElementById("annotations").querySelectorAll("div.classification-annotation");
            for (i=1;i < annotations.length; i++) {
                annotations[i].style.pointerEvents = null;
                annotations[i].style.color = null;
            }
        },

    },

    template:
    `
    <div v-on:keyup.enter="change_turn(1)" id="annotation-app">

        <dialogue-menu v-bind:changesSaved="allDataSaved"
                       v-bind:dialogueTitle="dialogueId"
                       v-bind:annotationRate="annotationRate">
        </dialogue-menu>

        <dialogue-turns v-bind:primaryElementClass="primaryElementClassName"
                        v-bind:turns="dTransformedTurns"
                        v-bind:currentId="dCurrentId"
                        v-bind:metaTags="metaTags">
        </dialogue-turns>

        <annotations v-bind:globalSlot="annotationFormat.global_slot"
                     v-bind:globalSlotNonEmpty="globalSlotNonEmpty"
                     v-bind:classifications="dCurrentTurn.multilabel_classification"
                     v-bind:classifications_strings="dCurrentTurn.multilabel_classification_string"
                     v-bind:currentId="dCurrentId"
                     v-bind:dialogueNonEmpty="dialogueNonEmpty"
                     v-bind:dTurns="dTurns"
                     v-bind:dialogueId="dialogueId">
        </annotations>

        <input-box>
        </input-box>

    </div>
    `
});



/********************************
* Dialogue Turns Component
********************************/

Vue.component('dialogue-menu',{
    props : ["turn","currentId", "changesSaved", "dialogueTitle","metaTags","annotationRate"],

    data () {
      return {
          editingTitle: false,
          guiMessages,
      }
    },

    methods :{
        handle_dialogue_id_change : function(event){
            if (event.target.value !== '') {
                this.allDataSaved = false;
                annotationAppEventBus.$emit('dialogue_id_change', event)
            }
        },

        go_back_to_all_dialogues: function(event){
            annotationAppEventBus.$emit("go_back", event)
        },

        toggleTitleEdit: function() {

            let inputSection = document.getElementById(this.dialogueTitle + '-name-input')
            let titleSpan    = document.getElementById(this.dialogueTitle + '-dialogue-title-span')

            if (this.editingTitle) {
                this.editingTitle          = false;
                inputSection.style.display = 'none';
                titleSpan.style.display    = 'inherit';
            } else {
                this.editingTitle          = true;
                inputSection.style.display = 'inherit';
                inputSection.focus();
                titleSpan.style.display    = 'none';
            }

        },

    },
    template:
    `
    <div id="dialogue-menu">
        <button v-on:click="go_back_to_all_dialogues($event)" class="back-button btn btn-sm">{{guiMessages.selected.annotation_app.backToAll}}</button>

        <div class="dialogue-name">

            <input type="text"
                   class="dialogue-name-edit"
                   v-bind:id="dialogueTitle + '-name-input'"
                   v-bind:value="dialogueTitle"
                   v-on:keyup.enter="handle_dialogue_id_change($event)"
                   v-on:focusout="toggleTitleEdit()">

            <span v-bind:id="dialogueTitle + '-dialogue-title-span'"
                  v-on:click="toggleTitleEdit()">
                  {{ dialogueTitle }}
            </span>

        </div>

        <div class="annotation-rate">
            {{guiMessages.selected.annotation_app.rate}} {{annotationRate}}
        </div>

        <div class="saved-status">
            <span v-if="changesSaved" class="is-saved">{{guiMessages.selected.annotation_app.allSaved}}</span>
            <span v-else class="is-not-saved">{{guiMessages.selected.annotation_app.unsaved}}</span>
        </div>
    </div>
    `
})




/********************************
* Dialogue Turn Component
********************************/


Vue.component('dialogue-turns',{

    // primaryElementClass is the class used to select the correct input field
    // to correctly set the focus when turns are changed with arrow keys or enter
    props : ["turns","currentId", "primaryElementClass","metaTags"],

    template:
    `
    <div id="dialogue-turns">
        <div class="overflow-hide">
            <dialogue-meta v-for="(turn, index) in turns" v-if="(index == 0)"
                       v-bind:metaTags="metaTags"
                       v-bind:primaryElementClass="primaryElementClass">
            </dialogue-meta>

            <dialogue-turn v-for="(turn, index) in turns" v-if="(index > 0)"
                       v-bind:primaryElementClass="primaryElementClass"
                       v-bind:turn="turn.string"
                       v-bind:currentId="currentId"
                       v-bind:myId="index">
            </dialogue-turn>
        </div>
    </div>
    `
})

Vue.component('dialogue-meta',{
    // primaryElementClass is the class used to select the correct input field
    // to correctly set the focus when turns are changed with arrow keys or enter
    props : ["turn","currentId","myId", "primaryElementClass","metaTags"],
    data: function (){
        return {
            guiMessages
        }
    },
    methods :{
        turn_updated_string : function(event){
            annotationAppEventBus.$emit("turn_updated_string", event )
        },
        check_if_selected(){
            return this.currentId==this.myId;
        },
        update_id(){
            annotationAppEventBus.$emit("update_turn_id", this.myId)
        },
    },

    directives: {

        blur: {
            componentUpdated: function(el) {
                el.blur();
            }
        }

    },

    template:
    `
    <div class="meta-turn-container">

        <div class="turn-header">
            <div class="meta-turn">
                Meta Tags: {{myId}}
            </div>
        </div>

        <div v-for="content,tag in metaTags" class="meta-tags" v-if="tag != 'global_slot'">
            <div class="meta-type" :id="'meta_type_'+tag">
                {{tag}}
            </div>

            <div class="meta-value">
                <comm-input :id="'meta_value_'+tag" v-bind:inputClassName="primaryElementClass" v-bind:placeholder="content" readonly="readonly"> </comm-input>
            </div>

        </div>
    </div>
    `
})



Vue.component('dialogue-turn',{
    // primaryElementClass is the class used to select the correct input field
    // to correctly set the focus when turns are changed with arrow keys or enter
    props : ["turn","currentId","myId", "primaryElementClass"],
    data: function (){
        return {
            guiMessages
        }
    },
    methods :{
        turn_updated_string : function(event){
            annotationAppEventBus.$emit("turn_updated_string", event )
        },
        check_if_selected(){
            return this.currentId==this.myId;
        },
        update_id(){
            annotationAppEventBus.$emit("update_turn_id", this.myId)
        },
        delete_this_turn(event) {
            annotationAppEventBus.$emit("delete_turn", this.myId)
        }
    },
    mounted(){
        if (this.currentId==this.myId){
            var elem = this.$el
            elem.scrollIntoView({ block: "start", behavior: "smooth" });
        }
    },
    updated(){
        if (this.currentId==this.myId){
            var elem = this.$el
            elem.scrollIntoView({ block: "start", behavior: "smooth" });
        }
    },

    directives: {

        blur: {
            componentUpdated: function(el) {
                el.blur();
            }
        }

    },

    template:
    `
    <div v-if="check_if_selected()" class="dialogue-turn-selected">

        <div class="turn-header">
            <div class="active-turn-id">
                {{guiMessages.selected.annotation_app.turnId}}: {{myId}}
            </div>
            <button class="turn-deleter" v-on:click="delete_this_turn($event)" hidden>{{guiMessages.selected.lida.button_delete}}</button>
        </div>

        <div v-for="stringType in turn" class="user-string-type">
            <div class="user-string-type-name">
                {{stringType.name}}
            </div>

        <div class="user-string-type-text">
            
            <comm-textarea v-if="stringType.data.length > 95" v-bind:inputClassName="primaryElementClass" v-bind:inputValue="stringType.data" v-bind:uniqueName="stringType.name" readonly> 
            <!-- v-on:comm_input_update="turn_updated_string($event)" -->
            </comm-textarea>  
            
            <comm-input v-else v-bind:inputClassName="primaryElementClass" v-bind:inputValue="stringType.data" v-bind:uniqueName="stringType.name" readonly>
            <!-- v-on:comm_input_update="turn_updated_string($event)" -->
            </comm-input>  
        </div>   

        </div>
    </div>

    <div v-else v-on:click="update_id()" class="dialogue-turn">
        <div class="sticky">
            {{guiMessages.selected.annotation_app.turnId}}: {{myId}}
        </div>

        <div v-for="stringType in turn" class="user-string-type">
            <div class="user-string-type-name">
                {{stringType.name}}
            </div>

            <div class="user-string-type-text">
                <comm-input v-blur v-bind:inputClassName="primaryElementClass" v-bind:componentId="myId + stringType.name" class="user-string-type-text" v-bind:placeholder=" 'edit me' " v-bind:inputValue="stringType.data" v-bind:uniqueName="stringType.name" readonly> </comm-input>
                <!-- v-on:comm_input_update="turn_updated_string($event)" -->
            </div>

        </div>
    </div>
    `
})













/********************************
* Annotation Component
********************************/

Vue.component('annotations',{
    props : ["globalSlot","classifications", "classifications_strings", "currentId", "dialogueNonEmpty","globalSlotNonEmpty","dTurns", "dialogueId"],

    template:
    `
    <div id="annotations">
        <div class="annotation-header sticky">
        Current Turn: {{currentId}}
        </div>
        <classification-global-annotation v-if="(globalSlotNonEmpty > 0)"
                                          v-bind:globals="globalSlot"
                                          v-bind:dTurns="dTurns"
                                          v-bind:dialogueId="dialogueId">
        </classification-global-annotation>
        <classification-annotation v-if="dialogueNonEmpty"
                                   v-for="classification in classifications"
                                   v-bind:classification="classification.data"
                                   v-bind:classFormat="classification.params"
                                   v-bind:uniqueName="classification.name"
                                   v-bind:info="classification.info"
                                   v-bind:turn="currentId">
        </classification-annotation>
        <classification-string-annotation v-if="dialogueNonEmpty"
                                          v-for="classString in classifications_strings"
                                          v-bind:classification_strings="classString.data"
                                          v-bind:uniqueName="classString.name"
                                          v-bind:classes="classString.params"
                                          v-bind:info="classString.info"
                                          v-bind:currentId="currentId">
        </classification-string-annotation>

    </div>
    `
})





/********************************
* Input Box Component
********************************/

Vue.component('input-box',{
    props : ["message"],
    data: function (){
        return {
            input : this.message,
            guiMessages
        }
    },
    methods:{

        new_turn : function(event){
            console.log('NEW TURN EMISSION', event)
            this.input="";
            console.log(event.target.value);
            if ( (event.target.value != undefined) && !(event.target.value=="") )
                annotationAppEventBus.$emit("new_turn",event.target.value)
        },

        save : function(event) {
            console.log(event);
            annotationAppEventBus.$emit("save_dialogue", event)
        }
    },
    template:
    `
    <div id="input-box">
        <ul>
            <li><input id="new-query-entry-box" v-on:keyup.enter="new_turn($event)" v-model="input" class="new-input" :placeholder="guiMessages.selected.annotation_app.enterQuery">
        </input></li>
            <li><button v-on:click="new_turn({target:{value:input}})" class="input-button">{{guiMessages.selected.annotation_app.enter}}</button></li>
            <li><button class="input-button" v-on:click="save()">{{guiMessages.selected.annotation_app.save}}</button></li>
        </ul>






    </div>
    `
})


// EOF
