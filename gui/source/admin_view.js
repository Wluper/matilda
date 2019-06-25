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
      }

  },

  created (){
       annotationAppEventBus.$on("go_back", this.switchStatusToMain);
       allDialoguesEventBus.$on("dialogue_clicked", this.switchStatusToResolving);
  },

  template:
  `
      <main-admin v-if="!(status === 'resolving')" v-bind:alreadyVisited="alreadyVisited">
      </main-admin>

      <resolution-app v-else-if="status === 'resolving'"
      v-bind:dialogueId="displayingDialogue">
      </resolution-app>
  `


})
