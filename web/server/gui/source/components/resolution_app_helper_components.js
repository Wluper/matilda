/************************************
* RESOLUTION MENU
*************************************/

Vue.component("resolution-menu", {
    // props : [],
    //
    data () {
        return {
            guiMessages
        }
    },

    methods :{
        go_back_to_all_dialogues : function(){
            adminEventBus.$off("switch_slot_values", this.switchSlotValue);
            annotationAppEventBus.$emit("clean_events");

        }
    },
    template:
    `
    <div id="resolution-menu">
        <button v-on:click="go_back_to_all_dialogues($event)" class="back-button btn btn-sm">{{guiMessages.selected.annotation_app.backToAll}}</button>
    </div>
    `
})

// <div id="resolution-menu">
//     <button v-on:click="go_back_to_all_dialogues($event)" class="back-button">Back to All Dialgoues</button>
//
//     <div class="dialogue-name">
//
//         <input type="text"
//                class="dialogue-name-edit"
//                v-bind:id="dialogueTitle + '-name-input'"
//                v-bind:value="dialogueTitle"
//                v-on:input="handle_dialogue_id_change($event)"
//                v-on:focusout="toggleTitleEdit()">
//
//         <span v-bind:id="dialogueTitle + '-dialogue-title-span'"
//               v-on:click="toggleTitleEdit()">
//               {{ dialogueTitle }}
//         </span>
//
//     </div>
//
//     <div class="saved-status">
//         <span v-if="changesSaved" class="is-saved">All Changes Saved</span>
//         <span v-else class="is-not-saved">Unsaved Changes</span>
//     </div>
// </div>





/************************************
* ERROR LIST
*************************************/

Vue.component("error-list", {

    props: [
      "metaList",
      "currentId"
    ],

    data() {
        return {
            guiMessages
        }
    },

    // mounted () {
    //     this.init();
    // },
    //
    // // METHODS
    // methods:{
    //
    //     init : function(){
    //         console.log(this.metaList)
    //     },
    // },

    template:
    `
    <div id="error-list">
        <div class="inner-wrap" v-if="metaList.length > 0">
            <error-element v-for="(meta, index) in metaList"
                           v-bind:currentId="currentId"
                           v-bind:myId="index + 1"
                           v-bind:metaData="meta">
            </error-element>
        </div>
        <div class="inner-wrap" v-else>
            <h1>{{guiMessages.selected.resolution_app.noConflicts}}</h1>
        </div>
    </div>
    `
});



Vue.component("error-element", {

    props: [
      "metaData",
      "currentId",
      "myId"
    ],

    // METHODS
    methods:{

        update_id : function() {
            annotationAppEventBus.$emit("update_id", this.myId );
        },

        selected : function() {
            temp = (this.currentId==this.myId);
            return temp;
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

    template:
    `
    <div v-if="selected()" class="error-element-selected">
        <error-element-body
            v-bind:accepted="metaData.accepted"
            v-bind:turn="metaData.turn"
            v-bind:name="metaData.name"
            v-bind:id="myId">
        </error-element-body>
    </div>

    <div v-else class="error-element" v-on:click="update_id()">
        <error-element-body
            v-bind:accepted="metaData.accepted"
            v-bind:turn="metaData.turn"
            v-bind:name="metaData.name"
            v-bind:id="myId">
        </error-element-body>
    </div>
    `
});

Vue.component("error-element-body", {

    data() { 
        return {
            guiMessages
        }
    },

    props: [
      "accepted",
      "turn",
      "name",
      "id"
    ],

    template:
    `

    <div class="error-element-body">

        <div class="error-element-id">
            {{guiMessages.selected.annotation_app.errorId}} {{id}}
        </div>

        <div class="error-element-turn">
            {{guiMessages.selected.annotation_app.turnId}} {{turn}}
        </div>

        <div class="error-element-annotation">
             {{guiMessages.selected.resolution_app.name}}  {{name}}
        </div>

        <div v-if="accepted" class="accepted-indicator">
            {{guiMessages.selected.resolution_app.accepted}}
        </div>

        <div v-if="!(accepted)" class="not-accepted-indicator">
            {{guiMessages.selected.resolution_app.review}}
        </div>

    </div>
    `
});






/************************************
* Resolutions
*************************************/

Vue.component("resolutions", {

    props: [
      "error", "errorId", "metaList", "collectionId"
    ],

    data () {
        return {
            annotationStyle : {},
            guiMessages
        }
    },

    computed : {
        annotationFormat : function() {

            temp =  this.annotationStyle[ this.error.name ];
            if (temp){
                temp = temp["labels"]
            }

            console.log("+++++ Annotation Format +++++");
            //console.log(temp)

            return temp;
        }
    },

    mounted () {
        this.init();
    },

    methods : {
        init : function(){
            // Step One :: Get the Annotation Styles
            backend.get_annotation_style_async(this.collectionId)
                .then( (response) => {
                    this.annotationStyle = response;
                });
        }

    },


    template:
    `
    <div id="resolutions">

        <div class="string-type-header">{{guiMessages.selected.annotation_app.turnId}} {{error.turn}}</div>

        <div class="left">
            <string-type-data v-bind:usr="error.usr" v-bind:sys="error.sys">
            </string-type-data>
        </div>

        <resolution-type-header
            v-bind:classification_strings="error.predictions"
            v-bind:uniqueName="error.name"
            v-bind:classes="annotationFormat"
            v-bind:multilabelStringOptions="error.options"
            v-bind:accepted="metaList[0].accepted">
        </resolution-type-header>

        <div class="right">
            <annotation-component
                v-bind:type="error.type"
                v-bind:predictions="error.predictions"
                v-bind:uniqueName="error.name"
                v-bind:annotationFormat="annotationFormat"
                v-bind:confidences="error.counts"
                v-bind:multilabelStringOptions="error.options"
                v-bind:metaList="metaList">
            </annotation-component>
        </div>

        <accept v-bind:metaData="{ id : errorId, turn: error.turn, name: error.name }" v-bind:metaList="metaList">
        </accept>
    </div>
    `
});


Vue.component("annotation-component", {

    props: [
      "type",
      "predictions",
      "annotationFormat",
      "uniqueName",
      "confidences",
      "multilabelStringOptions",
      "metaList"
    ],

    data() { 
        return {
            guiMessages,
            //parameter which identifies if child is called in interannotator or not
            interannotatorView: true,
        }
    },

    updated () {
        this.log_myself();
    },
    // METHODS
    methods:{
        turn_updated_string : function(event) {
            annotationAppEventBus.$emit("turn_updated_string", event )
        },

        log_myself : function() {
            console.log("=== Logging ANNOTATATION COMPONENT ===")
            console.log(this.type)
            console.log(this.predictions)
            console.log(this.annotationFormat)
            console.log(this.uniqueName)
        }
    },



    template:
    `
    <div id="annotation-component">

        <classification-annotation
            v-if="type=='multilabel_classification'"
            v-bind:classification="predictions"
            v-bind:classFormat="annotationFormat"
            v-bind:uniqueName="uniqueName"
            v-bind:confidences="confidences"
            v-bind:interannotatorView="interannotatorView">
        </classification-annotation>

        <classification-string-annotation
            v-else-if="type=='multilabel_classification_string'"
            v-bind:classification_strings="predictions"
            v-bind:uniqueName="uniqueName"
            v-bind:classes="annotationFormat"
            v-bind:confidences="confidences"
            v-bind:multilabelStringOptions="multilabelStringOptions"
            v-bind:accepted="metaList[0].accepted">
        </classification-string-annotation>

        <div v-else >
            {{guiMessages.selected.resolution_app.fail}}
        </div>
    </div>
    `
});




Vue.component("string-type-data", {

    props: [
      "usr",
      "sys",
    ],
    // METHODS
    methods:{

        turn_updated_string : function(event) {
            console.log("------Updating System Response------")
            console.log(event)
            annotationAppEventBus.$emit("turn_updated_string", event )
        },
    }
,

    template:
    `
    <div class="string-type-data">

        <div class="string-type">
            <div class="string-type-name">
                sys
            </div>

            <div class="user-string-type-text">
                <comm-input v-if="sys.length < 95" id="sys" v-bind:inputClassName="'sys-output'" v-bind:placeholder=" 'edit me' " v-bind:inputValue="sys" readonly> </comm-input>
                <comm-textarea v-else id="sys" v-bind:inputClassName="'sys-output'" v-bind:placeholder=" 'edit me' " v-bind:inputValue="sys" readonly> </comm-textarea>
            </div>
        </div>

        <div class="string-type">
            <div class="string-type-name">
                usr
            </div>
            
            <div class="user-string-type-text">
                <comm-input v-if="usr.length < 95" id="usr" v-bind:inputClassName="'usr-input'" v-bind:placeholder=" 'edit me' " v-bind:inputValue="usr" readonly> </comm-input>
                <comm-textarea v-else id="usr" v-bind:inputClassName="'usr-input'" v-bind:placeholder=" 'edit me' " v-bind:inputValue="usr" readonly> </comm-textarea>
            </div>
        </div> 

    </div>
    `
});

/************************************
* Resolutions
*************************************/

Vue.component("resolution-type-header", {
    props :[
        "multilabelStringOptions", "accepted", "uniqueName", "classification_strings", "classes"
    ],

    data() { 
        return {
            guiMessages,
            collapsed: false,
            showInfo: false,
            backup_classification_strings: this.classification_strings,
            saved_classification_strings: this.classification_strings,
        }
    },  

    // METHODS
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

         switchSlotValue: function(optionIndex) {
            adminEventBus.$emit("switch_slot_values", optionIndex);
         }

    },

    template:
    `
    <div class="resolution-type-header">

        <div v-if="collapsed"
             class="classification-annotation">

            <div class="sticky space collapsor"
                 v-on:click="toggleCollapse()"
                 v-on:mouseover="turnSeparatorWhite()"
                 v-on:mouseout="turnSeparatorGrey()">
                {{uniqueName}} <br><hr v-bind:id="uniqueName + '-collapsed-separator'">
                <span class="soft-text">{{guiMessages.selected.resolution_app.instructions}}</span>
            </div>

        </div>

        <div v-else class="classification-annotation">

            <div class="single-annotation-header">
                <div class="sticky space collapsor" v-on:click="toggleCollapse()">
                    {{uniqueName.replace(/_/g, ' ')}}
                </div>

                <div v-if="multilabelStringOptions" class="annotator-switch">
                  <button v-if="accepted" class="switch-button" v-on:click="switchSlotValue('gold')">GOLD</button>
                  <template v-for="option,index in multilabelStringOptions">
                      <button class="switch-button" v-on:click="switchSlotValue(index)">
                        <template v-if="multilabelStringOptions.length > 2">{{guiMessages.selected.resolution_app.optionMin}}</template> 
                        <template v-else>{{guiMessages.selected.resolution_app.option}}</template> 
                        {{index+1}}</button>
                  </template>
                </div>

            </div>

            <div v-if="showInfo">

                <hr>

                <div class="text-container">
                    {{ info }}
                </div>

                <hr>

            </div>
        
        </div>

    </div>
    `
});


Vue.component("accept", {
    props :[
        "metaData","metaList"
    ],

    data() { 
        return {
            guiMessages
        }
    },
    // METHODS
    methods:{

        accept : function(){
            //feedback if trying to update an already solved conflict
            if (this.metaList[(this.metaData.id-1)].accepted) {
                alert(guiMessages.selected.resolution_app.updateAccepted)
            }
            annotationAppEventBus.$emit("accept", { meta : this.metaData } )
        }

    },

    template:
    `
    <div id="accept">
        <button v-on:click="accept()" class="accept-button btn btn-sm- btn-primary"> {{guiMessages.selected.resolution_app.accept}}</button>
    </div>
    `
});
