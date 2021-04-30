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
            annotatedTurns: ["annotated"],
            annotationRate: '0%',
            readOnly:false,
            selectingText:false,
            autoSave:JSON.parse(mainApp.autoSave),
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
        annotationAppEventBus.$on( "change_auto_save", this.change_auto_save );
        annotationAppEventBus.$on( "selecting_text", this.select_text_mode );
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
            annotationAppEventBus.$off( "resume_annotation_tools", this.resume_annotation_tools );
            annotationAppEventBus.$off( "turn_is_annotated", this.turn_is_annotated );

            // INPUT BOX EVENTS
            annotationAppEventBus.$off( "new_turn", this.append_new_turn );
            annotationAppEventBus.$off( "save_dialogue", this.save_dialogue );
            annotationAppEventBus.$off( "change_auto_save", this.change_auto_save );
            annotationAppEventBus.$off( "selecting_text", this.select_text_mode );
        },

        init: function() {
            // Step One :: Download a Single Dialogue
            backend.get_single_dialogue_async(this.dialogueId, mainApp.activeCollection)
                .then( (response) => {
                    console.log('---- RECEIVED DATA FROM THE SERVER ----')
                    console.log(response);
                    try {
                        this.metaTags = response[0];
                    } catch {
                        console.log("metaTags empty");
                    }
                    console.log('---- END ----')
                    this.dTurns = response;
                    if (this.dTurns == null) {
                        //alert("Server offline. Try again");
                        annotationAppEventBus.$emit("go_back");
                        return;
                    }
                    //format collection meta-tag
                    if ((this.metaTags["collection"] == null) || (this.metaTags["collection"] == undefined)) {
                        this.metaTags["collection"] = "";
                    }
                    this.annotationRate = this.metaTags["status"];
                })

          // Step Two :: Get the Annotation Styles
          backend.get_annotation_style_async(mainApp.activeCollection, this.dialogueId)
              .then( (response) => {
                  this.annotationFormat = response;
                  if (response["status"] == "fail") {
                        mainApp.activeCollection = null;
                        databaseEventBus.$emit( "assignments_selected");
                  }
                  if (this.annotationFormat.global_slot != undefined) {
                    this.globalSlotNonEmpty = this.annotationFormat.global_slot.labels.length;
                  }
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
            if (((this.autoSave == 'true') || (this.autoSave == true)) && (this.allDataSaved != true)) {
                this.save_dialogue();
            }
            console.log("-----> Updating TurnId:")
            console.log(event);
            this.dCurrentId = event;
            this.resume_annotation_tools();
        },

        turn_update: function(event){
            console.log(event);
            //turn 0 is meta-tags and global_slot reserved so it's skipped
            if (this.dCurrentId != 0) {
                this.allDataSaved = false;
                //update annotation rate
                if (this.annotatedTurns[this.dCurrentId] != "annotated") {
                    this.update_annotation_rate();
                    this.turn_is_annotated(this.dCurrentId);
                }
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

        update_annotation_rate: function() {
            let oldValue = Number(this.dTurns[0]["status"].slice(0,-1));
            let unitRate = (100 / (this.dTurns.length-1));
            let newValue = ( Number(oldValue) + Number(unitRate) ).toFixed(1);
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
            const toFocus = document.getElementById('new-query-entry-box');
            if (toFocus != null) toFocus.focus();
        },

        save_dialogue: function(event) {
            console.log("DIALOGUE ID BEING SENT");
            console.log(this.dialogueId);

            backend.put_single_dialogue_async(event, this.dialogueId, this.dTurns, mainApp.activeCollection)
                .then( (status) => {
                    if (status == "success") {
                        this.allDataSaved = true;
                        //fields = {"status":mainApp.collectionRate};
                        //backend.update_annotations(mainApp.activeCollection, fields, false);
                    } else {
                        this.allDataSaved = false;
                        alert("Server error, dialogue not saved!")
                    }

                });
        },

        resume_annotation_tools: function(event) {
            this.selectingText = false;
            console.log("Resuming annotation tools");
            //resuming label
            try {
                document.getElementById("usr").onmouseup = null;
                document.getElementById("sys").onmouseup = null;
            } catch {
                return;
            }
            let active_label = document.getElementsByClassName("active_label")[0];
            if (active_label != null) {
                active_label.classList.remove("active_label");
            }
            let active_button = document.getElementsByClassName("active_button")[0];
            if (active_button != null) {
                active_button.classList.remove("active_button");
            }
            //resuming turn
            let activeTurn = document.getElementsByClassName("dialogue-turn-selected")[0];
            if (activeTurn != null) {
                activeTurn.style.border = null;
            }
            //resuming annotation sections
            if (document.getElementById("annotations") != undefined) {
                let annotations = document.getElementById("annotations").querySelectorAll("div.classification-annotation");
                for (i=1;i < annotations.length; i++) {
                    annotations[i].style.pointerEvents = null;
                    annotations[i].style.color = null;
                }
            }
        },

        change_auto_save: function(value) {
            this.autoSave = value;
            databaseEventBus.$emit("change_option", "autoSave", value);
        },

        select_text_mode: function(event) {
            this.selectingText = event;
        }

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
                        v-bind:metaTags="metaTags"
                        v-bind:autoSave="autoSave"
                        v-bind:readOnly="readOnly"
                        v-bind:selectingText="selectingText">
        </dialogue-turns>

        <annotations v-bind:globalSlot="annotationFormat.global_slot"
                     v-bind:globalSlotNonEmpty="globalSlotNonEmpty"
                     v-bind:classifications="dCurrentTurn.multilabel_classification"
                     v-bind:classifications_strings="dCurrentTurn.multilabel_classification_string"
                     v-bind:currentId="dCurrentId"
                     v-bind:dialogueNonEmpty="dialogueNonEmpty"
                     v-bind:dTurns="dTurns"
                     v-bind:dialogueId="dialogueId"
                     v-bind:readOnly="readOnly"
                     v-bind:selectingText="selectingText">
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
    props : ["turn","currentId", "changesSaved", "dialogueTitle", "metaTags", "annotationRate"],

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
                   v-bind:value="dialogueTitle">
                   <!--
                   v-on:keyup.enter="handle_dialogue_id_change($event)"
                   v-on:focusout="toggleTitleEdit()">--> 

            <span v-bind:id="dialogueTitle + '-dialogue-title-span'">
                  <!-- v-on:click="toggleTitleEdit()"> -->
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
    props : ["turns","currentId", "primaryElementClass","metaTags", "autoSave", "readOnly", "selectingText"],

    data: function() {
        return {
            maxWidth: mainApp.turnWidth,
            maxChars: mainApp.maxChars,
        }
    },

    created() {
        annotationAppEventBus.$on("change_option", this.change_option );
    },

    beforeDestroyed() {
        annotationAppEventBus.$off("change_option", this.change_option );
    },

    methods: {

        change_option: function(option,value) {
            switch(option) {
                case "change_width":
                    this.change_width(value);
                    databaseEventBus.$emit( "change_option", "turnWidth", value);
                break;
                case "change_chars":
                    this.change_chars(value);
                    databaseEventBus.$emit( "change_option", "maxChars", value);
                break;
            }
            
        },
        
        change_width: function(event) {
            this.maxWidth = event;
            localStorage["turnWidth"] = event;
        },
        change_chars: function(event) {
            this.maxChars = event;
            localStorage["maxChars"] = event;
        }
    },

    template:
    `
    <div id="dialogue-turns">
        <div class="overflow-hide">
            <dialogue-meta
                       v-bind:metaTags="metaTags"
                       v-bind:primaryElementClass="primaryElementClass"
                       v-bind:autoSave="autoSave"
                       v-bind:readOnly="readOnly">
            </dialogue-meta>

            <dialogue-turn v-for="(turn, index) in turns" v-if="(index > 0)"
                       v-bind:primaryElementClass="primaryElementClass"
                       v-bind:turn="turn.string"
                       v-bind:currentId="currentId"
                       v-bind:myId="index"
                       v-bind:selectingText="selectingText"
                       v-bind:style="{ maxWidth:maxWidth+'%' }">
            </dialogue-turn>
        </div>
    </div>
    `
})

Vue.component('dialogue-meta',{
    // primaryElementClass is the class used to select the correct input field
    // to correctly set the focus when turns are changed with arrow keys or enter
    props : ["turn","currentId","myId", "primaryElementClass","metaTags", "autoSave", "readOnly"],
    
    data: function (){
        return {
            guiMessages,
            maxChars: mainApp.maxChars,
            maxWidth: mainApp.turnWidth,
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
            annotationAppEventBus.$emit("update_turn_id", this.myId);
        },
        resize_turn_width(newValue) {
            this.maxWidth = newValue;
            annotationAppEventBus.$emit("change_option", "change_width", newValue);
        },
        change_max_chars(newValue) {
            this.maxChars = newValue;
            annotationAppEventBus.$emit("change_option", "change_chars", newValue);
        },
        auto_save_value(event) {
            annotationAppEventBus.$emit("change_auto_save", event.target.checked);
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
    <div>
        <div v-if="readOnly != true" class="conf-turn-container" v-bind:style="{ maxWidth:maxWidth+'%' }">
            <h2>{{guiMessages.selected.annotation_app.annotationPref}}</h2>
            <div class="annotation-options">
                <div class="max-chars-option">{{guiMessages.selected.annotation_app.scrollAfter}}: <input type="number" v-model="maxChars" min="0" class="max-chars-input" v-on:change="change_max_chars(maxChars)" /> {{guiMessages.selected.annotation_app.chars}}</div>
                <div class="turn-width-option">{{guiMessages.selected.annotation_app.turnWidth}}: {{maxWidth}}%</div>
                <div class="slot-coll-option">{{guiMessages.selected.annotation_app.autoSave}}: <input type="checkbox" v-model="autoSave" v-on:change="auto_save_value($event)" /></div>
            </div>
            <input type="range" min="60" max="98" v-model="maxWidth" v-on:change="resize_turn_width(maxWidth)" class="slider" style="width:100%">
        </div>

        <div class="meta-turn-container" v-bind:style="{ maxWidth:maxWidth+'%' }">
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
    </div>
    `
})


Vue.component('dialogue-turn',{
    // primaryElementClass is the class used to select the correct input field
    // to correctly set the focus when turns are changed with arrow keys or enter
    props : ["turn","currentId","myId", "primaryElementClass", "selectingText"],
    data: function (){
        return {
            guiMessages,
            maxWidth: mainApp.maxWidth,
            maxChars: mainApp.maxChars,
            selectedWords:{"sys":{},"usr":{}}
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
        },
        selection_done() {
            var out = "";
            for (dict in this.selectedWords) {
                var start = 0;
                var end = 0;
                var string = "";
                for (index in this.selectedWords[dict]) {
                    if (string == "") {
                        start = Number(index);
                    }
                    if (Number(index) > Number(end)+1) {
                        //then it starts a new substring
                        if (string != "") {
                            out += dict+"["+start+","+end+"]["+string.slice(0,-1)+"],";
                        }
                        //prepare for next
                        start = Number(index);
                        string = "";
                    }
                    end = Number(index);
                    string = string+this.selectedWords[dict][index]+" ";
                }
                if (string != "") {
                    out += dict+"["+start+","+end+"]["+string.slice(0,-1)+"],";
                }
            }

            //let outEvent = {name: "async", data: [["turn_ref", out]]}
            //annotationAppEventBus.$emit('classification_string_updated', outEvent);
            //console.log(out);
            annotationAppEventBus.$emit("selecting_text", out.slice(0,-1));
            //emptying dict
            this.selectedWords = null;
            this.selectedWords = {"sys":{},"usr":{}};
        },
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
    <div v-if="check_if_selected()" class="dialogue-turn-selected" v-bind:style="{ maxWidth:maxWidth+'%' }">

        <button type="button"
            v-show="selectingText != false"
            class="help-button btn btn-sm btn-primary"
            v-on:click="selection_done()"
            v-bind:id="'selection-done-'+currentId"
            style="float:right">Done Selection</button>

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
            
            <comm-textarea v-if="((selectingText != true) && (stringType.data.length >= maxChars))" :id="stringType.name" v-bind:inputClassName="primaryElementClass" v-bind:inputValue="stringType.data" v-bind:uniqueName="stringType.name" readonly> 
            </comm-textarea>

            <comm-input v-blur v-if="((selectingText != true) && (stringType.data.length < maxChars))" v-bind:inputClassName="primaryElementClass" v-bind:componentId="myId + stringType.name" class="user-string-type-text" v-bind:placeholder=" 'edit me' " v-bind:inputValue="stringType.data" v-bind:uniqueName="stringType.name" readonly> </comm-input>
            
            <clickable-textdiv v-else
                class="static-input"
                v-bind:inputClassName="primaryElementClass" 
                v-bind:inputValue="stringType.data" 
                v-bind:uniqueName="stringType.name"
                v-bind:selectedWords='selectedWords'
                :id="stringType.name"> 
                {{stringType.data}}
            </clickable-textdiv>
        </div>   

        </div>
    </div>

    <div v-else v-on:click="update_id()" class="dialogue-turn" v-bind:style="{ maxWidth:maxWidth+'%' }">
        <div class="sticky">
            {{guiMessages.selected.annotation_app.turnId}}: {{myId}}
        </div>

        <div v-for="stringType in turn" class="user-string-type">
            <div class="user-string-type-name">
                {{stringType.name}}
            </div>

            <div class="user-string-type-text">
                
                <comm-input :id="stringType.name" 
                    v-bind:inputClassName="primaryElementClass" 
                    v-bind:inputValue="stringType.data" 
                    v-bind:uniqueName="stringType.name" readonly>
                    <!-- v-on:comm_input_update="turn_updated_string($event)" -->
                </comm-input>  

            </div>

        </div>
    </div>
    `
})













/********************************
* Annotation Component
********************************/

Vue.component('annotations',{
    props : ["globalSlot","classifications", "classifications_strings", "currentId", "dialogueNonEmpty","globalSlotNonEmpty","dTurns", "dialogueId", "readOnly", "selectingText"],

    template:
    `
    <div id="annotations" v-bind:class="{supervision_readonly:readOnly}">
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
                                          v-bind:currentId="currentId"
                                          v-bind:supervision="readOnly"
                                          v-bind:selectingText="selectingText">
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

            <!--
            <li><input id="new-query-entry-box" v-on:keyup.enter="new_turn($event)" v-model="input" class="new-input" :placeholder="guiMessages.selected.annotation_app.enterQuery"></input>
            </li>
            <li><button v-on:click="new_turn({target:{value:input}})" class="input-button">{{guiMessages.selected.annotation_app.enter}}</button>
            </li>
            -->


            <li><button class="input-button" v-on:click="save()">{{guiMessages.selected.annotation_app.save}}</button>
            </li>
        </ul>
    </div>
    `
})


// EOF
