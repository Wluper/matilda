/************************************
* Main Single Annotation Component
*************************************/

Vue.component("annotation-app", {

    props: [
      "dialogueId"
    ],

    data () {
        return {
            dCurrentId: data.currentTurnId,
            dTurns: [],
            validAnnotations: data.validAnnotations,
            annotationFormat: {},
            allDataSaved: true,
            primaryElementClassName: "primary-turn-input"
        }
    },

    // COMPUTED properties
    computed:{
        dIds: function() {
            temp = utils.range(1, this.dTurns.length);
            return temp;
        },

        dCurrentTurn: function() {
            temp = utils.get_turn_data(this.dTurns[ this.dCurrentId - 1 ], this.validAnnotations, this.annotationFormat);
            return temp;
        },

        dTransformedTurns: function(){
            temp = utils.get_all_turns_data(this.dTurns, this.validAnnotations, this.annotationFormat);
            return temp;
        },

        dialogueNonEmpty: function() {
            return this.dTurns.length > 0
        }
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
        annotationAppEventBus.$on( "turn_updated_string", this.turn_update );
        annotationAppEventBus.$on( "update_turn_id", this.id_updated_from_ids_list );
        annotationAppEventBus.$on( "delete_turn", this.remove_turn );

        // ANNOTATION EVENTS
        annotationAppEventBus.$on( "update_classification", this.turn_update );
        annotationAppEventBus.$on( "classification_string_updated", this.turn_update );

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
            annotationAppEventBus.$off( "turn_updated_string", this.turn_update );
            annotationAppEventBus.$off( "update_turn_id", this.id_updated_from_ids_list );
            annotationAppEventBus.$off( "delete_turn", this.remove_turn );

            // ANNOTATION EVENTS
            annotationAppEventBus.$off( "update_classification", this.turn_update );
            annotationAppEventBus.$off( "classification_string_updated", this.turn_update );

            // INPUT BOX EVENTS
            annotationAppEventBus.$off( "new_turn", this.append_new_turn );
            annotationAppEventBus.$off( "save_dialogue", this.save_dialogue );
        },

        init: function() {

          // Step One :: Download a Single Dialogue
         backend.get_single_dialogue_async(this.dialogueId)
              .then( (response) => {
                  console.log('---- RECEIVED DATA FROM THE SERVER ----')
                  console.log(response)
                  console.log('---- END ----')
                  this.dTurns = response;
              })

          // Step Two :: Get the Annotation Styles
          backend.get_annotation_style_async()
              .then( (response) => {
                  this.annotationFormat = response;
              });

        },

        remove_turn: function(event) {
            console.log('Removing turn', event)
            this.dTurns.splice(event - 1, 1)
            this.allDataSaved = false;
            if (this.dCurrentId > 1) {
                this.dCurrentId -= 1
            }
        },

        change_turn: function(event) {

            console.log(" ************ DTURNS ************ ")
            console.log(this.dCurrentId)
            console.log(event)
            if (event.key=="ArrowLeft" || event.key=="ArrowUp"){
                temp=-1;
            }
            else if (event.key=="ArrowRight" || event.key=="ArrowDown" || event.key=="Enter"){
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
        },

        turn_update: function(event){
            console.log("-----> Updating turn", event)
            this.allDataSaved = false;
            utils.update_turn( this.dTurns[this.dCurrentId - 1], event);
            console.log("-----> Turn Updated", this.dCurrentTurn)
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
                    } else {
                        this.allDataSaved = false;
                        alert("Server error, dialogue not saved!")
                    }

                });
        }

    },

    template:
    `
    <div v-on:keyup.left="change_turn(-1)" v-on:keyup.right="change_turn(1)" v-on:keyup.enter="change_turn(1)" id="annotation-app">

        <dialogue-menu v-bind:changesSaved="allDataSaved"
                       v-bind:dialogueTitle="dialogueId">
        </dialogue-menu>

        <dialogue-turns v-bind:primaryElementClass="primaryElementClassName"
                        v-bind:turns="dTransformedTurns"
                        v-bind:currentId="dCurrentId">
        </dialogue-turns>

        <annotations v-bind:classifications="dCurrentTurn.multilabel_classification"
                     v-bind:classifications_strings="dCurrentTurn.multilabel_classification_string"
                     v-bind:currentId="dCurrentId"
                     v-bind:dialogueNonEmpty="dialogueNonEmpty">
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
    props : ["turn","currentId", "changesSaved", "dialogueTitle"],

    data () {
      return {
          editingTitle: false,
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
        <button v-on:click="go_back_to_all_dialogues($event)" class="back-button btn btn-sm">Back to All Dialgoues</button>

        <div class="dialogue-name">

            <input type="text"
                   class="dialogue-name-edit"
                   v-bind:id="dialogueTitle + '-name-input'"
                   v-bind:value="dialogueTitle"
                   v-on:input="handle_dialogue_id_change($event)"
                   v-on:focusout="toggleTitleEdit()">

            <span v-bind:id="dialogueTitle + '-dialogue-title-span'"
                  v-on:click="toggleTitleEdit()">
                  {{ dialogueTitle }}
            </span>

        </div>

        <div class="saved-status">
            <span v-if="changesSaved" class="is-saved">All Changes Saved</span>
            <span v-else class="is-not-saved">Unsaved Changes</span>
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
    props : ["turns","currentId", "primaryElementClass"],

    template:
    `
    <div id="dialogue-turns">
        <div class="overflow-hide">
            <dialogue-turn v-for="(turn, index) in turns"
                       v-bind:primaryElementClass="primaryElementClass"
                       v-bind:turn="turn.string"
                       v-bind:currentId="currentId"
                       v-bind:myId="index + 1">
            </dialogue-turn>
        </div>
    </div>
    `
})





Vue.component('dialogue-turn',{
    // primaryElementClass is the class used to select the correct input field
    // to correctly set the focus when turns are changed with arrow keys or enter
    props : ["turn","currentId","myId", "primaryElementClass"],

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
                Turn Id: {{myId}}
            </div>

            <button class="turn-deleter" v-on:click="delete_this_turn($event)">Delete</button>
        </div>

        <div v-for="stringType in turn" class="user-string-type">
            <div class="user-string-type-name">
                {{stringType.name}}
            </div>

            <div class="user-string-type-text">
                <comm-input v-bind:inputClassName="primaryElementClass" v-bind:placeholder=" 'edit me' " v-bind:inputValue="stringType.data" v-bind:uniqueName="stringType.name" v-on:comm_input_update="turn_updated_string($event)"> </comm-input>
            </div>

        </div>
    </div>

    <div v-else v-on:click="update_id()" class="dialogue-turn">
        <div class="sticky">
            Turn Id: {{myId}}
        </div>

        <div v-for="stringType in turn" class="user-string-type">
            <div class="user-string-type-name">
                {{stringType.name}}
            </div>

            <div class="user-string-type-text">
                <comm-input v-blur v-bind:inputClassName="primaryElementClass" v-bind:componentId="myId + stringType.name" class="user-string-type-text" v-bind:placeholder=" 'edit me' " v-bind:inputValue="stringType.data" v-bind:uniqueName="stringType.name" v-on:comm_input_update="turn_updated_string($event)"> </comm-input>
            </div>

        </div>
    </div>
    `
})













/********************************
* Annotation Component
********************************/

Vue.component('annotations',{
    props : ["classifications", "classifications_strings", "currentId", "dialogueNonEmpty"],

    template:
    `
    <div id="annotations">
        <div class="annotation-header sticky">
        Current Turn: {{currentId}}
        </div>
        <classification-annotation v-if="dialogueNonEmpty"
                                   v-for="classification in classifications"
                                   v-bind:classification="classification.data"
                                   v-bind:classFormat="classification.params"
                                   v-bind:uniqueName="classification.name"
                                   v-bind:info="classification.info">
        </classification-annotation>
        <classification-string-annotation v-if="dialogueNonEmpty"
                                          v-for="classString in classifications_strings"
                                          v-bind:classification_strings="classString.data"
                                          v-bind:uniqueName="classString.name"
                                          v-bind:classes="classString.params"
                                          v-bind:info="classString.info">
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
            input : this.message
        }
    },
    methods:{

        new_turn : function(event){
            console.log('NEW TURN EMISSION', event)
            this.input="";
            if ( !(event.target.value=="") )
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
            <li><input id="new-query-entry-box" v-on:keyup.enter="new_turn($event)" v-model="input" class="new-input" placeholder="Enter New Query">
        </input></li>
            <li><button v-on:click="new_turn({target:{value:input}})" class="input-button">Enter</button></li>
            <li><button class="input-button" v-on:click="save()">Save</button></li>
        </ul>






    </div>
    `
})


// EOF
