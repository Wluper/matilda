Vue.component("configuration-view", {

    props: [
      "userName"
    ],

    data() {
        return {
            changesSaved: "",
            guiMessages,
            showHelpConfig:false,
        }
    },

    created() {
    },

    mounted () {
        this.init();
    },

    computed : {
        role: function() {
            return mainApp.role;
        }
    },

    beforeDestroyed() {
        console.log("==================================");
        console.log("I am being destroyed");
    },
    // METHODS
    methods:{
        init : function(){
            //get configuration infos from server
        },

        go_back: function() {
            adminEventBus.$emit("go_back");
        },

        save() {
            //send new configuration
            //fields = {"assignedTo":this.selectedCollection.assignedTo};
            //backend.update_collection_async(this.selectedCollection.id,"dialogues_collections",fields)
            //  .then( (response) => {
            //});
        },
    },
    template:
    `
        <div id="collection-view">
            <div class="database-menu">
                <h2 class="database-title">{{guiMessages.selected.collection.title}}</h2>
                <user-bar v-bind:userName="userName"></user-bar>
                <div class="help-button-container">
                    <button class="help-button btn btn-sm" @click="showHelpConfig = true">{{ guiMessages.selected.database.showHelp }}</button>
                    <button v-on:click="go_back()" class="back-button btn btn-sm">{{guiMessages.selected.annotation_app.backToAll}}</button>
                </div>
                <help-config-modal v-if="showHelpConfig" @close="showHelpCongif = false"></help-config-modal>
            </div>

            <div class="inner-wrap">
                <h2 class="list-title">Configuration</h2>
            </div>
        </div>
    `
});
