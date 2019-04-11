
/************************************************************************************************
********************************
* COMPONENTS
********************************
************************************************************************************************/

/************************************
* Text Splitting View
*************************************/

Vue.component("text-splitter", {

    props: [
        "file",
        "sourceFname"
    ],

    data() {
      return {
          inputChanged: false,
          text: 'UNINITIALIZED'
      }
    },

    mounted () {

        this.read_text_file(this.file)

    },

    methods: {

        read_text_file: function (file) {
            let reader = new FileReader();
            reader.onload = (event) => {
                console.log('THE READER VALUE', reader)
                console.log('THE EVENT VALUE', event)
                console.log('THE FILE VALUE', file)
                this.text = reader.result
            };

            reader.readAsText(file);
        },

        log_change_occured: function(event) {
            this.inputChanged = true
            this.text = event.target.value
        },

        cancel_splitting: function (event) {

            if (this.inputChanged) {

                if (confirm("You have made changes, going back will delete them. Are you sure you wish to do this?")) {
                    this.$emit('cancel')
                }

            } else {

                this.$emit('cancel')

            }

        },

        process_into_dialogue: function (event) {

            dialoguesList = this.text.split('===')

            console.log("DIALOGUES LIST:", dialoguesList)

            utils.post_new_dialogues_from_string_lists(dialoguesList)
                .then( (response) => {
                    this.$emit('splitting_complete')
                });
        }

    },

    template: '#text-splitter-template'

});

/************************************
* All Dialgoues View
*************************************/

// register modal component
Vue.component('modal', {
  template: '#modal-template'
})

Vue.component("all-dialogues", {

  props: [
      "alreadyVisited"
  ],

  data () {
      return {
          allDialogueMetadata: [],
          dragging: false,
          showModal: false
      }
  },

  mounted () {
      this.getAllDialogueIdsFromServer();
  },

  methods: {

    handleDragOver(event) {
        event.stopPropagation();
        event.preventDefault();
        let elem = document.getElementById('listedDialoguesContainer');
        elem.style.transition = '0.3s'
        elem.style.backgroundColor = '#c2c6c4';
        event.dataTransfer.effectAllowed = 'copyMove';
        event.dataTransfer.dropEffect = 'copy';
        this.dragging = true;
    },

    handleDragOut(event) {
        event.preventDefault();
        let elem = document.getElementById('listedDialoguesContainer');
        elem.style.backgroundColor = 'inherit';
        this.dragging = false;
    },

    handleDrop(event) {
        event.preventDefault();
        let elem = document.getElementById('listedDialoguesContainer');
        elem.style.backgroundColor = 'inherit';
        this.dragging = false;
        let file     = event.dataTransfer.files[0]
        this.handle_file(file);
    },

    getAllDialogueIdsFromServer() {

      utils.get_all_dialogue_ids_async()
          .then( (response) => {

              this.allDialogueMetadata = response;

          });

    },

    dialogue_already_visited(id) {
        return this.alreadyVisited.includes(id)
    },

    clicked_dialogue(clickedDialogue) {
        this.$emit("dialogue_selected", this.allDialogueMetadata[clickedDialogue].id)
    },

    create_new_dialogue(event) {

        utils.create_empty_dialogue()
            .then( (newDialogueId) => {

                this.allDialogueMetadata.push({id: newDialogueId, num_turns: 0});

            });
    },

    delete_dialogue(event) {

        if (confirm("Are you sure you want to permanently delete this dialogue? This cannot be undone!")) {

            console.log('-------- DELETING --------')
            console.log()
            idToDelete = event.target.parentNode.parentNode.id;
            nameToDelete = this.allDialogueMetadata[idToDelete].id
            utils.del_single_dialogue_async(nameToDelete)
                .then( () => {
                    this.getAllDialogueIdsFromServer();
                });

            this.$emit('dialogue_deleted', nameToDelete);

        } else {

            return

        }

    },

    open_file(event){
        let file = event.target.files[0];
        this.handle_file(file);
    },

    handle_file(file) {
        let textType = /text.plain/;
        let jsonType = /application.json/;

        if (file.type.match(textType)) {

            this.$emit('loaded_text_file', file);

        } else if (file.type.match(jsonType)) {

            console.log('---- HANDLING LOADED JSON FILE ----');
            let reader = new FileReader();
            reader.onload = (event) => {
                console.log('THE READER VALUE', reader)
                console.log('THE EVENT VALUE', event)
                text = reader.result
                utils.post_new_dialogue_from_json_string(text)
                    .then( (response) => {

                        if ('error' in response.data) {
                            alert(`JSON file \"${file.name}\" is not in the correct format. Error from the server: ${response.data.error}`)
                        } else {
                            this.getAllDialogueIdsFromServer();
                        }

                    });
            };

            reader.readAsText(file);

        } else {

            alert('Only .txt or .json files are supported.')

        }
    },

    download_all_dialogues_from_server(event) {
        utils.get_all_dialogues_async()
            .then( (response) => {
                let blob = new Blob([JSON.stringify(response, null, 4)], {type: 'application/json'});
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', 'dialogues.json')
                document.body.appendChild(link)
                link.click();
            });
    }

  },

  template: '#main-all-dialogues-template'

});

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

    template:"#main-annotation-template"
});


/********************************
* Dialogue Turn Component
********************************/

Vue.component('dialogue-menu',{
    props : ["turn","currentId", "changesSaved", "dialogueTitle"],

    data () {
      return {
          editingTitle: false,
      }
    },

    methods :{

        turn_updated_string : function(event){
            this.$emit("dialogue_turn_update_strings", event )
        },

        go_back_to_all_dialogues: function(event){
            this.$emit("go_back", event)
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
        <button v-on:click="go_back_to_all_dialogues($event)" class="back-button">Back to All Dialgoues</button>

        <div class="dialogue-name">

            <input type="text"
                   class="dialogue-name-edit"
                   v-bind:id="dialogueTitle + '-name-input'"
                   v-bind:value="dialogueTitle"
                   v-on:input="$emit('dialogue_name_changed', $event)"
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

Vue.component('dialogue-turn',{
    // primaryElementClass is the class used to select the correct input field
    // to correctly set the focus when turns are changed with arrow keys or enter
    props : ["turn","currentId","myId", "primaryElementClass"],

    methods :{
        turn_updated_string : function(event){
            this.$emit("turn_updated_string", event )
        },
        check_if_selected(){
            return this.currentId==this.myId;
        },
        update_id(){
            this.$emit("update_id", this.myId)
        },
        delete_this_turn(event) {
            this.$emit("delete_me", this.myId)
        }
    },
    mounted(){
        if (this.currentId==this.myId){
            var elem = this.$el
            elem.scrollIntoView({ inline: "nearest", behavior: "smooth" });
        }
    },
    updated(){
        if (this.currentId==this.myId){
            var elem = this.$el
            elem.scrollIntoView({ inline: "nearest", behavior: "smooth" });
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
                <comm-input v-bind:inputClassName="primaryElementClass" v-bind:componentId="myId + stringType.name" v-bind:placeholder=" 'edit me' " v-bind:inputValue="stringType.data" v-bind:uniqueName="stringType.name" v-on:comm_input_update="turn_updated_string($event)"> </comm-input>
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

Vue.component('dialogue-turns',{

    // primaryElementClass is the class used to select the correct input field
    // to correctly set the focus when turns are changed with arrow keys or enter
    props : ["turns","currentId", "primaryElementClass"],
    methods :{
        update_turn_id : function(event){
            this.$emit("update_turn_id", event)
        },
        update_string : function(event){
            this.$emit("update_string", event)
        },
        emit_delete_turn : function(event) {
            this.$emit("delete_turn", event)
        }
    },
    template:
    `
    <div id="dialogue-turns">

        <dialogue-turn v-for="(turn, index) in turns"
                       v-bind:primaryElementClass="primaryElementClass"
                       v-bind:turn="turn.string"
                       v-bind:currentId="currentId"
                       v-bind:myId="index + 1"
                       v-on:turn_updated_string="update_string($event)"
                       v-on:update_id="update_turn_id($event)"
                       v-on:delete_me="emit_delete_turn($event)">
        </dialogue-turn>

    </div>
    `
})


/********************************
* Annotation Component
********************************/

Vue.component('classification-annotation',{
    props: ["classification", "classFormat", "uniqueName"],

    data () {

        return {

            collapsed: false,

        }

    },

    computed: {
        correctClassification : function(){
            console.log("Classification Computed");
            return this.classification
        }
    },

    methods:{
        toggleCollapse: function () {

            if (this.collapsed) {
                this.collapsed = false;
            } else {
                this.collapsed = true;
            }

        },

        turnSeparatorWhite: function() {
            const element = document.getElementById(this.uniqueName + '-collapsed-separator')
            element.style.borderColor = 'white';

        },

        turnSeparatorGrey: function() {

            const element = document.getElementById(this.uniqueName + '-collapsed-separator')
            element.style.borderColor = '#aaa';

        },

        update_classification : function(event) {
            if ( this.correctClassification.includes(event.target.value) )
                // remove particular element from list
                this.correctClassification.splice( this.correctClassification.indexOf(event.target.value), 1 );
            else
                // add particular classification to list
                this.correctClassification.push(event.target.value)

            /* TODO
             * I don't understand why this is necessary - for some reason if and
             * only if `this.classification_strings` is empty, then pushing to it
             * will not update the display. However as soon as there is
             * *ANYTHING* in the list, then it suddenly becomes reactive. The
             * only way to make the view update when the list is empty is to call
             * this `forceUpdate()` method, and once that is called Vue seems to
             * realise that there's something in the list and become reactive.
             *
             * I suspect this may be related to the fact that we set an empty
             * list as the default value for `this.classification_strings` if the
             * server doesn't send over any data to populate the list. Something
             * about the way the empty list is assigned as default seems to mean
             * it's not reactive, but my Vue.js skill isn't good enough to know
             * why that happens and then it suddenly becomes reactive once
             * something is appended to it.
             */
            this.$forceUpdate();

            outEvent = {name: this.uniqueName, data: this.correctClassification}
            this.$emit("update_classification", outEvent)
        },

        checkedMethod : function(labelName){
            return this.correctClassification.includes(labelName)
        },
    },

    template:
    `
    <div>

        <div v-if="collapsed"
             class="classification-annotation">

            <div class="sticky space collapsor"
                 v-on:click="toggleCollapse()"
                 v-on:mouseover="turnSeparatorWhite()"
                 v-on:mouseout="turnSeparatorGrey()">
                {{uniqueName}} <br><hr v-bind:id="uniqueName + '-collapsed-separator'">
                <span class="soft-text">[Click to Expand]</span>
            </div>

        </div>

        <div v-else class="classification-annotation">

            <div class="sticky space collapsor" v-on:click="toggleCollapse()">
                {{uniqueName}}
            </div>

            <div v-for="labelName in classFormat" class="checkbox-wrapper">

                <input type="checkbox"
                       class="checkbox"
                       v-bind:id="labelName"
                       v-bind:value="labelName"
                       v-bind:checked="checkedMethod(labelName)"
                       v-on:input="update_classification($event)">

                <label v-bind:for="labelName">
                    <span v-if="checkedMethod(labelName)" class="bold-label"> {{labelName}} </span>
                    <span v-else> {{labelName}} </span>
                </label>

            </div>

        </div>

    </div>
    `
})


Vue.component('classification-string-annotation', {
    props: ["classification_strings", "uniqueName", "classes"],

    data () {

        return {

            collapsed: false,

        }

    },

    methods: {

      toggleCollapse: function () {

          if (this.collapsed) {
              this.collapsed = false;
          } else {
              this.collapsed = true;
          }

      },

      turnSeparatorWhite: function() {

          const element = document.getElementById(this.uniqueName + '-collapsed-separator')
          element.style.borderColor = 'white';

      },

      turnSeparatorGrey: function() {

          const element = document.getElementById(this.uniqueName + '-collapsed-separator')
          element.style.borderColor = '#aaa';

      },

      checkedMethod : function(labelName){

          for (classStringTuple in this.classification_strings) {

              if (this.classification_strings[classStringTuple][0] == labelName) {
                  return true;
              }

          }

          return false;
      },

      getStringPart: function(labelName) {

          for (classStringTuple in this.classification_strings) {

              if (this.classification_strings[classStringTuple][0] == labelName) {

                  return this.classification_strings[classStringTuple][1]

              }

          }

      },

      updateClassAndString: function(event, labelName) {

          console.log('---- UPDATING SLOT-VALUE ----')
          present = false;

          for (idx in this.classification_strings) {

              if (this.classification_strings[idx][0] == labelName && event.target.value !== '') {

                  present = true;
                  this.classification_strings[idx][1] = event.target.value

              } else if (this.classification_strings[idx][0] == labelName && event.target.value == '') {

                  present = true;
                  this.classification_strings.splice(idx, 1)

              }

              if (present) {
                  break;
              }

          }

          if (!present) {
              this.classification_strings.push([labelName, event.target.value])
          }

          /* TODO
           * I don't understand why this is necessary - for some reason if and
           * only if `this.classification_strings` is empty, then pushing to it
           * will not update the display. However as soon as there is
           * *ANYTHING* in the list, then it suddenly becomes reactive. The
           * only way to make the view update when the list is empty is to call
           * this `forceUpdate()` method, and once that is called Vue seems to
           * realise that there's something in the list and become reactive.
           *
           * I suspect this may be related to the fact that we set an empty
           * list as the default value for `this.classification_strings` if the
           * server doesn't send over any data to populate the list. Something
           * about the way the empty list is assigned as default seems to mean
           * it's not reactive, but my Vue.js skill isn't good enough to know
           * why that happens and then it suddenly becomes reactive once
           * something is appended to it.
           */
          this.$forceUpdate();

          outEvent = {name: this.uniqueName, data: this.classification_strings}
          this.$emit('classification_string_updated', outEvent)

      },

    },

    template:
    `
    <div>

        <div v-if="collapsed"
             class="classification-annotation">

            <div class="sticky space collapsor"
                 v-on:click="toggleCollapse()"
                 v-on:mouseover="turnSeparatorWhite()"
                 v-on:mouseout="turnSeparatorGrey()">
                {{uniqueName}} <br><hr v-bind:id="uniqueName + '-collapsed-separator'">
                <span class="soft-text">[Click to Expand]</span>
            </div>

        </div>

        <div v-else class="classification-annotation">

            <div class="sticky space collapsor" v-on:click="toggleCollapse()">
                {{uniqueName}}
            </div>

            <div v-for="labelName in classes" class="multilabel-string-item-wrapper">

                <div class="multilabel-string-checkbox-container">
                  <input type="checkbox"
                         class="multilabel-string-checkbox"
                         v-bind:id="labelName"
                         v-bind:value="labelName"
                         v-bind:checked="checkedMethod(labelName)"
                         disabled>
                </div>

                <label v-bind:for="labelName" class="multilabel-string-label">
                    <span v-if="checkedMethod(labelName)" class="bold-label"> {{labelName}} </span>
                    <span v-else> {{labelName}} </span>
                </label>

                <input class="multilabel-string-input"
                       v-bind:value="getStringPart(labelName)"
                       v-on:input="updateClassAndString($event, labelName)">
                </input>

            </div>

        </div>
    </div>
    `
})


Vue.component('annotations',{
    props : ["classifications", "classifications_strings", "currentId", "dialogueNonEmpty"],
    methods:{
        dialogue_turn_update_classification(event){
            this.$emit("dialogue_turn_update_classification", event)
        },
        dialogue_turn_update_classification_string(event){
            this.$emit("dialogue_turn_update_classification_string", event);
        }
    },
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
                                   v-on:update_classification="dialogue_turn_update_classification($event)">
        </classification-annotation>
        <classification-string-annotation v-if="dialogueNonEmpty"
                                          v-for="classString in classifications_strings"
                                          v-bind:classification_strings="classString.data"
                                          v-bind:uniqueName="classString.name"
                                          v-bind:classes="classString.params"
                                          v-on:classification_string_updated="dialogue_turn_update_classification_string($event)">
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
                this.$emit("new_turn",event.target.value)
        },

        save : function(event) {
            console.log(event);
            this.$emit("save_dialogue", event)
        }
    },
    template:
    `
    <div id="input-box">
        <input id="new-query-entry-box" v-on:keyup.enter="new_turn($event)" v-model="input" class="new-input" placeholder="Enter New Query">
        </input>

        <button v-on:click="new_turn({target:{value:input}})" class="input-button">Enter</button>

        <button class="input-button" v-on:click="save()">Save</button>

    </div>
    `
})



/************************
* Helper Components
************************/

Vue.component("comm-input",{
    props : ["uniqueName","inputValue", "placeholder", "componentId", "inputClassName"],

    methods :{
        input_updated : function(event){
            //cause input is inbuild it has complicated event.target.value thing
            this.$emit("comm_input_update",{data: event.target.value, name: this.uniqueName})
        }
    },

    template:
    `
    <input v-bind:class="inputClassName" v-bind:id="componentId" v-bind:placeholder="placeholder" v-bind:value="inputValue" v-on:input="input_updated($event)">
    `
})



/********************************
* Dialogue Ids Components
********************************/


Vue.component('dialogue-turn-id', {
    props: ["id","currentId"],
    methods: {
        on_click : function (){
            if (this.id=="+"){
                console.log("wohoo")
            };
            this.$emit('update_currentId_button',this.id)
        }
    },
    template:
    `
    <div v-if="id==currentId" class="dialogue-turn-id-selected">
        <button  v-on:click="on_click()"> {{id}} </button>
    </div>
    <div v-else class="dialogue-turn-id">
        <button  v-on:click="on_click()"> {{id}} </button>
    </div>
    `
})




Vue.component('dialogue-turn-ids', {
    props: ["ids","currentId"],
    methods: {
        on_child_click : function (event){
            this.$emit('update_currentId',event);
        }
    },
    template:
    `
    <div class="dialogue-turn-ids">
        <dialogue-turn-id v-for="id in ids" v-bind:id="id" v-bind:currentId="currentId" v-on:update_currentId_button="on_child_click($event)" > </dialogue-turn-id>
    </div>
    `
})
