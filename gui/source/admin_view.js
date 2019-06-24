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
            displayingDialogue: '1',
            status : 'resolving',
            alreadyVisited: [],
      }
  },

  methods: {

      switchStatusToMain() {
          this.status = "listview"
      }

  },

  created (){
       annotationAppEventBus.$on("go_back", this.switchStatusToMain);
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
