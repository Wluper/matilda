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
    <resolution-app v-if="status === 'resolving'"
                    v-bind:dialogueId="displayingDialogue">
    </resolution-app>
  `


})
