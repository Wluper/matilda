/************************************
* RESOLUTION MENU
*************************************/

Vue.component("resolution-menu", {
    // props : [],
    //
    // data () {
    //     return {
    //
    //     }
    // },

    methods :{
        go_back_to_all_dialogues : function(){
            annotationAppEventBus.$emit("go_back")
        }
    },
    template:
    `
    <div id="resolution-menu">
        <button v-on:click="go_back_to_all_dialogues($event)" class="back-button btn btn-sm">Back to All Dialgoues</button>
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
        <div class="inner-wrap">
            <error-element v-for="(meta, index) in metaList"
                           v-bind:currentId="currentId"
                           v-bind:myId="index + 1"
                           v-bind:metaData="meta">
            </error-element>
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
            Error Id: {{id}}
        </div>

        <div class="error-element-turn">
            Turn {{turn}}
        </div>

        <div class="error-element-annotation">
            Name:  {{name}}
        </div>

        <div v-if="accepted" class="accepted-indicator">
            Accepted
        </div>

        <div v-if="!(accepted)" class="not-accepted-indicator">
            Review
        </div>

    </div>
    `
});






/************************************
* Resolutions
*************************************/

Vue.component("resolutions", {

    props: [
      "error", "errorId"
    ],

    data () {
        return {
            annotationStyle : {}
        }
    },

    computed : {
        annotationFormat : function() {

            temp =  this.annotationStyle[ this.error.name ];
            if (temp){
                temp = temp["labels"]
            }

            console.log("+++++ Annotation Format +++++");
            console.log(temp)

            return temp;
        }
    },

    mounted () {
        this.init();
    },

    methods : {
        init : function(){
            // Step One :: Get the Annotation Styles
            backend.get_annotation_style_async()
                .then( (response) => {
                    this.annotationStyle = response;
                });
        }

    },


    template:
    `
    <div id="resolutions">
        <div class="left">
            <string-type-data v-bind:usr="error.usr" v-bind:sys="error.sys">
            </string-type-data>
        </div>

        <div class="right">
            <annotation-component
                v-bind:type="error.type"
                v-bind:predictions="error.predictions"
                v-bind:uniqueName="error.name"
                v-bind:annotationFormat="annotationFormat"
                v-bind:confidences="error.counts">


            </annotation-component>
        </div>

        <accept v-bind:metaData="{ id : errorId, turn: error.turn, name: error.name }">
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
      "confidences"
    ],

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
            v-bind:confidences="confidences">
        </classification-annotation>

        <classification-string-annotation
            v-else-if="type=='multilabel_classification_string'"
            v-bind:classification_strings="predictions"
            v-bind:uniqueName="uniqueName"
            v-bind:classes="annotationFormat"
            v-bind:confidences="confidences">

        </classification-string-annotation>

        <div v-else >
            FAIL!
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
    },


    template:
    `
    <div class="string-type-data">
        <div class="string-type">
            <div class="string-type-name">
                usr
            </div>

            <div class="string-type-text">
                {{usr}}
            </div>

        </div>

        <div class="string-type">
            <div class="string-type-name">
                sys
            </div>

            <div class="user-string-type-text">
                <comm-input v-bind:inputClassName="'sys-output'" v-bind:placeholder=" 'edit me' " v-bind:inputValue="sys" v-on:comm_input_update="turn_updated_string($event)"> </comm-input>
            </div>

        </div>
    </div>
    `
});



/************************************
* Resolutions
*************************************/

Vue.component("accept", {
    props :[
        "metaData"
    ],
    // METHODS
    methods:{

        accept : function(){
            annotationAppEventBus.$emit("accept", { meta : this.metaData } )
        }

    },

    template:
    `
    <div id="accept">
        <button v-on:click="accept()" class="accept-button btn btn-sm- btn-primary"> Accept </button>
    </div>
    `
});
