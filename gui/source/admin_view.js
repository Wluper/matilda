/*******************************************************************************
* MAIN VIEW
*******************************************************************************/

var mainApp = new Vue({
  el: '#main-app',

  data() {
      return {
            // displayingDialogue: 'Dialogue1',
            displayingDialogue: '',
            status : 'logging',
            alreadyVisited: [],
            role: 'admin',
            userName:'admin',
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

      switchStatusToSupervision() {
        console.log('--- SUPERVISION ----');
        this.status = 'supervision';
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
       allDialoguesEventBus.$on("annotation_clicked", this.switchStatusToAnnotation);
       allDialoguesEventBus.$on("supervision_clicked", this.switchStatusToSupervision);
       databaseEventBus.$on( "document_selected", this.load_document_view );

  },

  template:
  `
      <main-admin-view v-if="status === 'welcome'" 
      v-bind:userName="userName">
      </main-admin-view>

      <interannotator-view v-else-if="status === 'listview'" 
      v-bind:alreadyVisited="alreadyVisited"
      v-bind:userName="userName">
      </interannotator-view>

      <login-view v-else-if="status === 'logging'">
      </login-view>

      <users-view v-else-if="status === 'users-view'" 
      v-bind:userName="userName">
      </users-view>

      <collection-view v-else-if="status === 'collection'">
      </collection-view>

      <supervision-view v-else-if="status === 'supervision'">
      </supervision-view>

      <resolution-app v-else-if="status === 'resolving'"
      v-bind:dialogueId="displayingDialogue">
      </resolution-app>
  `
});

/************************************
* All Dialgoues View "aka MAIN ADMIN LIDA VIEW"
*************************************/

Vue.component("main-admin-view", {

  props: [
      "userName",
  ],

  data () {
      return {
          //Reference to the language data
          guiMessages
      }
  },

  mounted () {
     //
  },

  methods: {

    log_out() {
        let ask = confirm("Do you want to log out?");
        if (ask == true) {
            localStorage.removeItem("remember");
            location.reload();
         }
    },
    clicked_users_button() {
        allDialoguesEventBus.$emit("usersManagement_clicked");
    },
    clicked_collection_button() {
        allDialoguesEventBus.$emit("collection_clicked");
    },
    clicked_interannotator_button() {
        allDialoguesEventBus.$emit("conflicts_clicked");
    },
    clicked_supervision_button() {
        allDialoguesEventBus.$emit("supervision_clicked");
    },
    clicked_annotator_button() {
        allDialoguesEventBus.$emit("annotation_clicked");
    },


    open_file(event){
        let file = event.target.files[0];
        this.handle_file(file);
    },
  },
  template:
  `
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
        <button class="help-button btn btn-sm btn-primary panel" @click="clicked_interannotator_button()">{{ guiMessages.selected.admin.interAnno }}</button>
        <button class="help-button btn btn-sm btn-primary panel" @click="clicked_users_button()">{{ guiMessages.selected.admin.userButton }}</button>
        <button class="help-button btn btn-sm btn-primary panel" @click="clicked_collection_button()">{{ guiMessages.selected.collection.title}}</button>
        <button class="help-button btn btn-sm btn-primary panel" @click="clicked_supervision_button()">{{ guiMessages.selected.admin.supervision}}</button>
        <button class="help-button btn btn-sm btn-primary panel" @click="clicked_annotator_button()">{{ guiMessages.selected.admin.annotation}}</button>
      </div>
    </div>
  </div>
  `

});