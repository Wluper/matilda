/************************************
* Language Options
*************************************/

var languageSection = new Vue({
  el:"#language-selector",
  
  data:{
    gui_languages: [
      { name:"English", code:"en" }, 
      { name:"Italian", code:"it"}
    ],
    currentLanguage: "en",
    guiMessages,
  },
  
  methods: {
    updateGui(event) {
      console.log('---- CHANGING GUI LANGUAGE ----');
      guiMessages.selected = guiMessages[this.currentLanguage];
    }
  },

  template: 

  `
  	<div class="language-list-title-container">
  		<label for="droplist_language_selector">{{ guiMessages.selected.lida.interfaceLanguage }}</label>
  		<select id="language_selector" class="droplist_language_selector" v-model="currentLanguage" @change="updateGui()">
  			<option v-for="options in gui_languages" v-bind:value="options.code">{{ options.name }}</option>
      </select>
  	</div>

  `
})