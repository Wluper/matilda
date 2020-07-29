/************************************
* Language Options
*************************************/

guiMessages.selected = guiMessages.en;

var languageSection = new Vue({
  el:"#language-selector",
  
  data:{
    gui_languages: [
      // new languages needs to be inserted here with their proper international code
      { name:"English", code:"en" }, 
      { name:"Italian", code:"it" }
    ],
    currentLanguage: "en",
    guiMessages,
  },

  mounted() {
    this.detectLanguage();
  },
  
  methods: {

    detectLanguage() {
      var browserLanguage = navigator.language.substr(0,2);
      if (guiMessages[browserLanguage] == undefined)
        guiMessages.selected = guiMessages.en;
      else 
        guiMessages.selected = guiMessages[browserLanguage];
      this.currentLanguage = browserLanguage;
    },

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