Vue.component("configuration-view", {

    props: [
      "userName"
    ],

    data() {
        return {
            changesSaved: "",
            guiMessages,
            showHelpConfig:false,
            settings: {"app":{},"database":{}},
            outModels:[],
        }
    },

    created() {
        this.init();
    },

    mounted () {
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
            //get configuration info from server
            backend.manage_configuration_file() 
                .then( (response) => {
                    if (response.status == "done") {
                        this.settings = response;
                        this.outModels = this.settings.app.annotation_models;
                    } else {
                        alert(response.error);
                    }
                }
            );
        },

        go_back: function() {
            adminEventBus.$emit("go_back");
        },

        save() {
            backend.manage_configuration_file(settings) 
                .then( (response) => {
                    if (response.status == "done") {
                        this.init();
                    } else {
                        alert(response.error);
                    }
                }
            );
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
                <h3>Listed annotation models</h3>
                <ul>
                    <template v-for="model in settings['app']['annotation_models']">
                    <li class="listed-entry collection-users">
                         <div class="entry-list-single-item-container">
                            <input type="checkbox" class="user-checkbox" v-bind:id="model" :value="model" v-model="outModels">
                            <div class="entry-info">
                                <label :for="model" class="listed-label" v-on:click="changesSaved = 'false'">{{model}}</label>
                            </div>
                        </div>
                    </li>
                    </template>
                    Aggiungi un nuovo annotation model
                </ul>
            </div>
        </div>
    `
});
