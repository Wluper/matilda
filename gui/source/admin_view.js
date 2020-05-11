/*******************************************************************************
* IMPORT STATEMENTS
*******************************************************************************/




/*******************************************************************************
* MAIN VIEW
*******************************************************************************/

var mainApp = new Vue({
  el: '#main-app',

  data() {
      return {
            // displayingDialogue: 'Dialogue1',
            displayingDialogue: '',
            status : 'listview',
            alreadyVisited: [],
            //reference to the language file
            guiMessages
      }
  },

  methods: {

      switchStatusToMain() {
          this.status = "listview"
      },

      switchStatusToResolving(dialogueName) {
          this.displayingDialogue = dialogueName
          this.status = 'resolving'
          this.alreadyVisited.push(dialogueName)
      },
      switchStatusToUsersManagement() {
          this.status = 'users_admin';
      },

      switchStatusToDatabase() {
        console.log('---- DATABASE VIEW ----');
        this.status = 'database-view';
      },

      switchStatusToCollection() {
        console.log('--- COLLECTION VIEW ----');
        this.status = 'collection-view';
      },

      load_document_view: function (event) {
        this.displayingDocument = event;
      },

  },

  created (){
       annotationAppEventBus.$on("go_back", this.switchStatusToMain);
       allDialoguesEventBus.$on("dialogue_clicked", this.switchStatusToResolving);
       allDialoguesEventBus.$on("usersManagement_clicked", this.switchStatusToUsersManagement);
       allDialoguesEventBus.$on("database_clicked", this.switchStatusToDatabase);
       allDialoguesEventBus.$on("collection_clicked", this.switchStatusToCollection);
       databaseEventBus.$on( "document_selected", this.load_document_view )
  },

  template:
  `
      <main-admin v-if="status === 'listview'" v-bind:alreadyVisited="alreadyVisited">
      </main-admin>

      <users-view v-else-if="status === 'users_admin'">
      </users-view>

      <database-view v-else-if="status === 'database-view'">
      </database-view>

      <collection-view v-else-if="status === 'collection-view'">
      </collection-view>

      <resolution-app v-else-if="status === 'resolving'"
      v-bind:dialogueId="displayingDialogue">
      </resolution-app>
  `


});
