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


    template:
    `
    <div id="error-list">

        <error-element v-for="(turn, index) in metaList"
                       v-bind:currentId="currentId"
                       v-bind:myId="index + 1">

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
            annotationAppEventBus.$emit("update_id", myId );
        },

        selected : function() {
            temp = (currentId==myId);
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
      "dialogueId"
    ],

    data () {
        return {
            dCurrentId: data.currentTurnId,
        }
    },

    // COMPUTED properties
    computed:{
        dIds: function() {
            temp = utils.range(1, this.dTurns.length);
            return temp;
        },

    },

    mounted () {

    },

    // METHODS
    methods:{

    },

    template:
    `
    <div v-on:keyup.left="change_turn(-1)" v-on:keyup.right="change_turn(1)" v-on:keyup.enter="change_turn(1)" id="annotation-app">

        <resolution-menu v-bind:changesSaved="allDataSaved"
                       v-bind:dialogueTitle="dialogueId">
        </resolution-menu>

        <disagreement-list v-bind:primaryElementClass="primaryElementClassName"
                        v-bind:errorListMeta="errorList.meta"
                        v-bind:currentId="currentId">
        </disagreement-list>

        <resolutions v-bind:error="errorList.errors[currentId]">
        </resolutions>

        <input-box>
        </input-box>

    </div>
    `
});


/************************************
* Resolutions
*************************************/

Vue.component("accept", {

    props: [
      "dialogueId"
    ],

    data () {
        return {
            dCurrentId: data.currentTurnId,
        }
    },

    // COMPUTED properties
    computed:{
        dIds: function() {
            temp = utils.range(1, this.dTurns.length);
            return temp;
        },

    },

    mounted () {

    },

    // METHODS
    methods:{

    },

    template:
    `
    <div v-on:keyup.left="change_turn(-1)" v-on:keyup.right="change_turn(1)" v-on:keyup.enter="change_turn(1)" id="annotation-app">

        <resolution-menu v-bind:changesSaved="allDataSaved"
                       v-bind:dialogueTitle="dialogueId">
        </resolution-menu>

        <disagreement-list v-bind:primaryElementClass="primaryElementClassName"
                        v-bind:errorListMeta="errorList.meta"
                        v-bind:currentId="currentId">
        </disagreement-list>

        <resolutions v-bind:error="errorList.errors[currentId]">
        </resolutions>

        <input-box>
        </input-box>

    </div>
    `
});
