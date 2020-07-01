/*******************************************************************************
* MAIN VIEW
*******************************************************************************/

/*
Vue.component("admin-panel", {

  data() {
      return {
            // displayingDialogue: 'Dialogue1',
            displayingDialogue: '',
            alreadyVisited: [],
            role:mainApp.role,
            status:"admin-panel",
            userName:mainApp.userName,
      }
  },

  methods: {

      switchStatusToMain() {
          this.status = "welcome"
      },

      switchStatusToResolving(dialogueName) {
          this.displayingDialogue = dialogueName
          this.status = 'resolving'
          this.alreadyVisited.push(dialogueName)
      },
      switchStatusToUsersManagement() {
          this.status = 'users-view';
      },

      switchStatusToCollection() {
        console.log('--- COLLECTION VIEW ----');
        this.status = 'collection';
      },

      switchStatusToConflicts() {
        console.log('--- INTERRANOTATOR ----');
        this.status = 'listview';
      },

      switchStatusToConflictsReview() {
         console.log('--- INTERRANOTATOR Collection ----');
        this.status = 'collection-conflicts';
      },

      switchStatusToSupervision() {
        //console.log('--- SUPERVISION ----');
        //this.status = 'supervision';
      },

      switchStatusToAnnotation() {
        //
      },

      load_document_view: function (event) {
        this.displayingDocument = event;
      },

  },

  created (){
       annotationAppEventBus.$on("go_back", this.switchStatusToMain);
       allDialoguesEventBus.$on("dialogue_clicked", this.switchStatusToResolving);
       allDialoguesEventBus.$on("usersManagement_clicked", this.switchStatusToUsersManagement);
       allDialoguesEventBus.$on("collection_clicked", this.switchStatusToCollection);
       allDialoguesEventBus.$on("conflicts_clicked", this.switchStatusToConflicts);
       allDialoguesEventBus.$on("conflicts_on_collection", this.switchStatusToConflictsReview);
       allDialoguesEventBus.$on("annotation_clicked", this.switchStatusToAnnotation);
       allDialoguesEventBus.$on("supervision_clicked", this.switchStatusToSupervision);
       databaseEventBus.$on( "document_selected", this.load_document_view );

  },

  template:
  `
      <main-admin-view v-if="status === 'admin-panel'" 
      v-bind:userName="userName">
      </main-admin-view>

      <interannotator-view v-else-if="status === 'listview'" 
      v-bind:alreadyVisited="alreadyVisited"
      v-bind:userName="userName">
      </interannotator-view>

      <users-view v-else-if="status === 'users-view'" 
      v-bind:userName="userName">
      </users-view>

      <datamanagement-view v-else-if="status === 'datamanagement-view'">
      </datamanagement-view>

      <supervision-view v-else-if="status === 'supervision'">
      </supervision-view>

      <interannotator-app v-else-if="status === 'collection-conflicts'" 
      v-bind:alreadyVisited="alreadyVisited"
      v-bind:userName="userName">
      </interannotator-app>

      <resolution-app v-else-if="status === 'resolving'"
      v-bind:dialogueId="displayingDialogue">
      </resolution-app>
  `
});

*/

/************************************
* All Dialgoues View "aka MAIN ADMIN LIDA VIEW"
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
      //databaseEventBus.$on( "document_selected", this.load_document_view );
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

    switchToConflictsReview() {
         console.log('--- INTERRANOTATOR Collection ----');
         this.view = 'collection-conflicts';
    },

    switchToSupervision() {
        //console.log('--- SUPERVISION ----');
        //this.view = 'supervision';
    },

    switchToAnnotation() {
        console.log('--- BACK TO ANNOTATION VIEW ----');
        databaseEventBus.$emit("assignements_selected");
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
              
        </div>
      </div>
      <div class="inner-wrap">
        <div class="admin-panel">
          <button class="help-button btn btn-sm btn-primary panel" @click="switchToConflicts()">{{ guiMessages.selected.admin.interAnno }}</button>
          <button class="help-button btn btn-sm btn-primary panel" @click="switchToUsersManagement()">{{ guiMessages.selected.admin.userButton }}</button>
          <button class="help-button btn btn-sm btn-primary panel" @click="switchToCollection()">{{ guiMessages.selected.collection.title}}</button>
          <button class="help-button btn btn-sm btn-primary panel" @click="switchToSupervision()">{{ guiMessages.selected.admin.supervision}}</button>
          <button class="help-button btn btn-sm btn-primary panel" @click="switchToAnnotation()">{{ guiMessages.selected.admin.annotation}}</button>
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

  <supervision-view v-else-if="view === 'supervision'">
  </supervision-view>

  <interannotator-app v-else-if="view === 'collection-conflicts'" 
      v-bind:alreadyVisited="alreadyVisited"
      v-bind:userName="userName">
  </interannotator-app>

  <resolution-app v-else-if="view === 'resolving'"
      v-bind:dialogueId="displayingDialogue">
  </resolution-app>  
</div>
  `

});