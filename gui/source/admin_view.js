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
      status : 'resolving'
    }
  },


  template:
  `
      <main-admin v-if="!(status === 'resolving')">
      </main-admin>

      <resolution-app v-else-if="status === 'resolving'"
      v-bind:dialogueId="displayingDialogue">
      </resolution-app>
  `


})
