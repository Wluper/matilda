/************************************
* MAIN ADMIN LIDA VIEW
*************************************/

Vue.component("main-admin-view", {

  props: [
      "userName"
  ],

  data () {
      return {
          //Reference to the language data
          guiMessages,
          view:"admin-panel",
          displayingDialogue: '',
          displayingCollection: '',
          alreadyVisited: [],
      }
  },

  mounted () {
     //
  },

  created () {
      adminEventBus.$on("go_back", this.switchToMain);
      adminEventBus.$on("collection_clicked", this.switchToCollection);
      adminEventBus.$on("conflicts_on_collection", this.switchToConflictsReview);
      adminEventBus.$on("dialogue_clicked", this.switchToResolving);
      adminEventBus.$on("usersManagement_clicked", this.switchToUsersManagement);
      adminEventBus.$on("conflicts_clicked", this.switchToConflicts);
      adminEventBus.$on("supervision_clicked", this.switchToSupervision);
  },

  methods: {

    log_out() {
        let ask = confirm("Do you want to log out?");
        if (ask == true) {
            localStorage.removeItem("remember");
            location.reload();
         }
    },
    switchToMain() {
          this.view = "admin-panel";
    },

    switchToResolving(dialogueName) {
          this.displayingDialogue = dialogueName
          this.view = 'resolving'
          this.alreadyVisited.push(dialogueName)
    },

    switchToUsersManagement() {
          this.view = 'users-view';
    },

    switchToCollection() {
        console.log('--- DATAMANAGEMENT VIEW ----');
        this.view = 'datamanagement';
    },

    switchToConflicts() {
        console.log('--- INTERRANOTATOR MAIN ----');
        this.view = 'listview';
    },

    switchToConflictsReview(collectionName) {
         console.log('--- INTERRANOTATOR Collection ----');
         this.displayingCollection = collectionName;
         this.view = 'collection-conflicts';
    },

    switchToSupervision() {
        console.log('--- SUPERVISION ----');
        this.view = 'supervision';
    },

    switchToAnnotation() {
        console.log('--- BACK TO ANNOTATION VIEW ----');
        databaseEventBus.$emit("assignments_selected");
    },


    open_file(event){
        let file = event.target.files[0];
        this.handle_file(file);
    },
  },
  template:
  `
<div id="admin_main">
  <div v-if="view === 'admin-panel'">
    <div class="all-dialogues-container">
      <div class="dialogue-list-title-container">
          <div class="all-dialogues-list-title">
            <h2>
              {{guiMessages.selected.admin.titlePanel}}
            </h2>
          </div>

        <user-bar v-bind:userName="userName"></user-bar>
        <div class="help-button-container">
            <button class="help-button btn btn-sm btn-primary" @click="switchToAnnotation()">{{ guiMessages.selected.admin.annotation}}</button>
        </div>
      </div>
      <div class="inner-wrap">
        <div class="admin-panel">
          <button class="help-button btn btn-sm btn-primary panel" @click="switchToUsersManagement()">{{ guiMessages.selected.admin.userButton }}</button>
          <button class="help-button btn btn-sm btn-primary panel" @click="switchToCollection()">{{ guiMessages.selected.admin.dataManagement}}</button>
          <button class="help-button btn btn-sm btn-primary panel" @click="switchToSupervision()">{{ guiMessages.selected.admin.supervision}}</button>
          <button class="help-button btn btn-sm btn-primary panel" @click="switchToConflicts()">{{ guiMessages.selected.admin.interAnno }}</button>
          <p>{{guiMessages.selected.admin_panel[1]}}</p>
          <p>{{guiMessages.selected.admin_panel[2]}}</p>
          <p>{{guiMessages.selected.admin_panel[3]}}</p>
          <p>{{guiMessages.selected.admin_panel[0]}}</p>
        </div>
      </div>
    </div>
  </div>

  <interannotator-view v-if="view === 'listview'" 
      v-bind:alreadyVisited="alreadyVisited"
      v-bind:userName="userName">
  </interannotator-view>

  <users-view v-else-if="view === 'users-view'" 
      v-bind:userName="userName">
  </users-view>

  <datamanagement-view v-else-if="view === 'datamanagement'">
  </datamanagement-view>

  <supervision-view v-else-if="view === 'supervision'"
      v-bind:userName="userName">
  </supervision-view>

  <interannotator-app v-else-if="view === 'collection-conflicts'"
      v-bind:displayingCollection="displayingCollection" 
      v-bind:alreadyVisited="alreadyVisited"
      v-bind:userName="userName">
  </interannotator-app>

  <resolution-app v-else-if="view === 'resolving'"
      v-bind:collectionId="displayingCollection"
      v-bind:dialogueId="displayingDialogue">
  </resolution-app>  
</div>
  `

});