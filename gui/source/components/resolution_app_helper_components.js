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

    // methods :{
    //
    // },
    template:
    `
    <div id="resolution-menu">
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

        <error-element v-for="(meta, index) in metaList"
                       v-bind:currentId="currentId"
                       v-bind:myId="index + 1"
                       v-bind:metaData="meta">
        </error-element>

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

    template:
    `
    <div v-if="selected()" class="error-element-selected">
        <div class="error-element-id">
            Error Id: {{myId}}
        </div>

        <div class="error-element-turn">
            Turn {{metaData.turn}}
        </div>

        <div class="error-element-annotation">
            Name:  {{metaData.name}}
        </div>
    </div>

    <div v-else class="error-element" v-on:click="update_id()">
        <div class="error-element-id">
            Error Id: {{myId}}
        </div>

        <div class="error-element-turn">
            Turn {{metaData.turn}}
        </div>

        <div class="error-element-annotation">
            Name:  {{metaData.name}}
        </div>
    </div>
    `
});







/************************************
* Resolutions
*************************************/

Vue.component("resolutions", {

    props: [
      "error"
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
                temp = temp[1]
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
                v-bind:annotationFormat="annotationFormat" >
            </annotation-component>
        </div>

        <accept>
        </accept>
    </div>
    `
});


Vue.component("annotation-component", {

    props: [
      "type",
      "predictions",
      "annotationFormat",
      "uniqueName"
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
            v-bind:uniqueName="uniqueName">
        </classification-annotation>

        <classification-string-annotation
            v-else-if="type=='multilabel_classification_string'"
            v-bind:classification_strings="predictions"
            v-bind:uniqueName="uniqueName"
            v-bind:classes="annotationFormat">
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

    // METHODS
    methods:{

        accept : function(){
            annotationAppEventBus.$emit("accept")
        }

    },

    template:
    `
    <div id="accept">
        <button v-on:click="accept()" class="accept-button"> Accept </button>
    </div>
    `
});
