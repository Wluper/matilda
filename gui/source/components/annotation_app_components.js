/************************************
* Main Single Annotation Component
*************************************/

Vue.component("annotation-app", {
    // el: "#annotation-app",

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
            console.log("Dialogue Turns instantiated part: 1");
            temp = utils.range(1, this.dTurns.length);
            return temp;

        },

        dCurrentTurn: function() {
            console.log("Dialogue Turns instantiated part: 2");
            console.log(this.dCurrentId)
            console.log(this.dTurns)
            temp = utils.get_turn_data(this.dTurns[ this.dCurrentId - 1 ], this.validAnnotations, this.annotationFormat);
            console.log('---- DATA IN DISPLAY FORMAT ----')
            console.log(temp)
            return temp;
        },

        dTransformedTurns: function(){
            console.log("Dialogue Turns instantiated part: 3");
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

    // METHODS
    methods:{

        init: function() {

          // Step One :: Download a Single Dialogue
          utils.get_single_dialogue_async(this.dialogueId)
              .then( (response) => {
                  console.log('---- RECEIVED DATA FROM THE SERVER ----')
                  console.log(response)
                  console.log('---- END ----')
                  this.dTurns = response;
              })

          // Step Two :: Get the Annotation Styles
          utils.get_annotation_style_async()
              .then( (response) => {
                  this.annotationFormat = response;
              });

        },

        handle_dialogue_name_change: function(event) {
            if (event.target.value !== '') {
                this.allDataSaved = false;
                this.$emit('dialogue_id_change', event)
            }
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
            utils.get_annotate_turn_async(event)
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

        go_back : function (event) {
            console.log('firing go back again');
            this.$emit('go_back', event);
        },

        save_dialogue: function(event) {

            utils.put_single_dialogue_async(event, this.dialogueId, this.dTurns)
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
    created: function () {
        window.addEventListener('keyup', this.change_turn);
    },

    template:
    ```
    <div v-on:keyup.left="change_turn(-1)" v-on:keyup.right="change_turn(1)" v-on:keyup.enter="change_turn(1)" id="annotation-app">

        <dialogue-menu v-on:go_back="go_back($event)"
                       v-on:dialogue_name_changed="handle_dialogue_name_change($event)"
                       v-bind:changesSaved="allDataSaved"
                       v-bind:dialogueTitle="dialogueId">
        </dialogue-menu>

        <dialogue-turns v-bind:primaryElementClass="primaryElementClassName"
                        v-bind:turns="dTransformedTurns"
                        v-bind:currentId="dCurrentId"
                        v-on:update_string="turn_update($event)"
                        v-on:update_turn_id="id_updated_from_ids_list($event)"
                        v-on:delete_turn="remove_turn($event)">
        </dialogue-turns>

        <annotations v-bind:classifications="dCurrentTurn.multilabel_classification"
                     v-bind:classifications_strings="dCurrentTurn.multilabel_classification_string"
                     v-bind:currentId="dCurrentId"
                     v-bind:dialogueNonEmpty="dialogueNonEmpty"
                     v-on:dialogue_turn_update_classification="turn_update($event)"
                     v-on:dialogue_turn_update_classification_string="turn_update($event)">
        </annotations>

        <input-box v-on:new_turn="append_new_turn($event)" v-on:save_dialogue="save_dialogue($event)">
        </input-box>

    </div>
    ```
});
