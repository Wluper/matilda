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
            Turn Id: {{myId}}
        </div>
    </div>

    <div v-else class="error-element" v-on:click="update_id()">
        <div class="error-element-id">
            Turn Id: {{myId}}
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


    template:
    `
    <div id="resolutions">
        <div class="left">
        PLACEHOLDER
        </div>

        <div class="right">
        PLACEHOLDER 2
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
            return true
        }

    },

    template:
    `
    <div id="accept">
        PLACEHOLDER
    </div>
    `
});
