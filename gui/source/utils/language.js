/************************************
* Language Options
*************************************/

guiMessages = {
  en: {
    admin: {
      dataItems: "Data Items",
      visited: "Visited",
      button_downloadAll:"Download All Data",
      button_interAgreement:"Inter-annotator Agreement", 
      annotators:"Annotators", 
      button_upload:"Upload File or Drag and Drop"
    },
    lida: {
      button_fileFormatInfo: "File Format Info",
      button_delete: "Delete",
      turns: "Turns",
      button_newDialogue: "Add a New Dialogue",
      interfaceLanguage: "Interface Language:"
    },
    annotation_app: {
      turnId: "Turn Id:"
    }
  },
  it: {
    admin: {
      dataItems: "Dialoghi",
      visited: "Visitati",
      button_downloadAll:"Scarica tutti i dati",
      button_interAgreement:"Indice di concordanza", 
      annotators:"Annotatori", 
      button_upload:"Carica o trascina un file"
  },
    lida: {
      button_fileFormatInfo: "Info sui formati",
      button_delete: "Elimina",
      turns: "Turni",
      button_newDialogue: "Aggiungi un nuovo Dialogo",
      interfaceLanguage: "Lingua Interfaccia:"  

    },
      annotation_app: {
        turnId: "Turno Id:"
    }
  },
}

guiMessages.selected = guiMessages.en;

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