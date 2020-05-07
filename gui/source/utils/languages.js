/************************************
* Language Config file
*************************************/

guiMessages = {
  en: {
    admin: {
      dataItems: "Data Items",
      visited: "Visited",
      button_downloadAll:"Download All Data",
      button_interAgreement:"Inter-annotator Agreement", 
      annotators:"Annotators", 
      button_upload:"Upload File or Drag and Drop",
      dropAnywhere: "Drop Files Anywhere to Upload!",
      userButton: "Users Management",
      createButton: "Add",
      deleteConfirm:"Are you sure you want to permanently delete this entry? This cannot be undone!",
    },
    lida: {
      button_fileFormatInfo: "File Format Info",
      button_delete: "Delete",
      turns: "Turns",
      button_newDialogue: "Add a New Dialogue",
      button_wipeDialogues: "Delete all dialogues",
      interfaceLanguage: "Interface Language:",
    },
    annotation_app: {
      turnId: "Turn Id",
      enter: "Enter",
      save: "Save",
      enterQuery:"Enter New Query",
      allSaved: "All Changes Saved",
      unsaved: "Unsaved Changes",
      backToAll: "Back to All Dialogues",
      close: "Close",
      select: "Select or write text from turn"
    },
    resolution_app: {
      errorId: "Error Id:",
      name: "Name:",
      accepted: "Accepted",
      review: "Review",
      fail: "FAIL!",
      accept:"Accept"
    },
    modal_formatInfo:
    [ 
      `
        Dialoque File Format
      `,
      `
        Files can be uploaded to the annotation system in one of two
        formats: either as a raw .txt file or as a JSON file in the
        correct format.
      `,
      `
        If you upload a .txt file, there are no format restrictions and
        you will be taken to a screen to process it into a dialogue.
      `,
      `
        If you upload a JSON file, it must be in the correct format. This
        format is as follows:
      `
    ],
      modal_formatInfo_list:
    [
      `
        File is a dict with keys as the names of each dialogue
        and values as lists.
      `,
      `
        Each value is a list of dictionaries, where each
        dictionary contains a number of key-value pairs which
        are used to display the dialogue data for annotation.
      `,
      `
        Some key-value pairs are compulsory in order to correctly
        display the dialogue.
      `,
      `
        The key-value pairs which are compulsory are defined in
        the annotator_config.py file in the "server" folder.
      `,
      `
        By default, the only required key-value pair in each turn
        is called "usr" and should be the user's query as
        a string.
      `
    ],
      modal_agreementScores:
    [ 
      "Inter-annotator Agreement Scores",
      "This represents a report for your data.",
      "Available Annotations:",
      "Overall"
    ],
    modal_document:
    [ 
        "Document",
        "Tags",
        "JSON",
        "lastUpdate"
    ],
      database: {
        title: "Database Management",
        location:"Database Location",
        port:"Port",
        saved: "Database updated",
        update: "Update database",
        importDb: "Reload from Database",
        confirmImport:"This will import the dialogues in your database doc directly to your current list.",
        confirmWipe:"Do you wish to wipe your current list before importing?",
        importDoc: "Import this document",
    },
      login: {
        welcome: "Welcome",
        send: "Log in",
        warning:"A username and a password are required!",
        fail:"Username and password combinatio invalid"
      }
  },
  it: {
    admin: {
      dataItems: "Dialoghi",
      visited: "Visitato",
      button_downloadAll:"Scarica i dati",
      button_interAgreement:"Indice di concordanza", 
      annotators:"Annotatori", 
      button_upload:"Carica o trascina un file",
      dropAnywhere: "Rilascia il file per caricarlo!",
      userButton: "Gestione Utenti",
      createButton: "Crea",
      deleteConfirm:"Si è sicuri di voler eliminare questo documento? Non sarà recuperabile!",
  },
    lida: {
      button_fileFormatInfo: "Info sui formati",
      button_delete: "Elimina",
      turns: "Turni",
      button_newDialogue: "Aggiungi un nuovo Dialogo",
      button_wipeDialogues: "Elimina tutti i dialoghi",
      interfaceLanguage: "Lingua Interfaccia:"  

    },
      annotation_app: {
        turnId: "Id Turno",
        enter: "Invia",
        save: "Salva",
        enterQuery: "Nuova richiesta",
        allSaved: "Modifiche salvate",
        unsaved: "Cambiamenti non salvati",
        backToAll: "Indietro",
        close: "Chiudi",
        select: "Seleziona o scrivi dal turno"
    },
    resolution_app: {
      errorId: "Id Conflitto:",
      name: "Nome:",
      accepted: "Accettato",
      review: "Revisiona",
      fail: "ERRORE!",
      accept:"Accetta"
    },
    modal_formatInfo:
    [ 
      `
        Formato dei File Dialogo 
      `,
      `
        I file possono essere caricati nel sistema in uno dei due formati:
        un file grezzo .txt oppure un file JSON nel formato richiesto.
      `,
      `
        Se viene caricato un file .txt, non ci sono restrizioni di formato
        e si aprirà una schermata per processarlo in un dialogo.
      `,
      `
        Se carichi un file JSON, deve essere nel formato corretto. 
        Il formato richiesto è il seguente:
      `
    ],
      modal_formatInfo_list:
    [
      `
        Un file dizionario con chiavi come nomi dei dialoghi 
        e valori come liste. 
      `,
      `
        Ogni valore è una lista di dizionari, dove ogni 
        dizionario contiene un numero di coppie chiave-valore
        usate per mostrare i dati del dialogo da annotare.
      `,
      `
        Alcune coppie chiave-valore sono obbligatorie per 
        mostrare correttamente il dialogo.
      `,
      `
        Le coppie obbligatorie sono definite nel file 
        annotator_config.py nella cartella "server".
      `,
      `
        Di default, l'unica coppia chiave-valore obbligatoria è
        chiamata "usr" e dovrebbe essere la stringa contenente
        la richiesta dell'utente.
      `
    ],
      modal_agreementScores:
    [ 
      "Indice di Concordanza tra gli annotatori",
      "Questo è un rapporto suoi tuoi dati.",
      "Annotazioni disponibili:",
      "Riepilogo"
    ],
      modal_document:
    [ 
        "Documento",
        "Tags",
        "JSON",
        "lastUpdate"
    ],
    database: {
      title: "Gestione Database",
      location: "Indirizzo",
      port: "Porta",
      saved: "Database aggiornato",
      update: "Aggiorna il database",
      importDb: "Ricarica dal database",
      confirmImport:"L'operazione importerà i dialoghi dal database verso la lista dei dialoghi.",
      confirmWipe:"Vuoi azzerrare la lista prima di importare dal database?",
      importDoc: "Importa questo documento",
    },
    login: {
      welcome:"Benvenuto",
      send: "Accedi",
      warning:"Sono richiesti sia un username sia una password!",
      fail:"Combinazione di nome utente e password non valida",
    }
  },
}