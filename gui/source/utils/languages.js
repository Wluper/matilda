/************************************
* Language Config file
*************************************/

guiMessages = {
    en: {
        admin: {
            title:"Annotation-Conflicts Resover",
            titlePanel:"Administration Panel",
            interAnno:"Interannotator Resolution",
            dataItems: "Data Items",
            visited: "Visited",
            notVisited: "Not visited",
            button_downloadAll:"Download All Data",
            button_interAgreement:"Inter-annotator Agreement", 
            annotators:"Annotators", 
            button_upload:"Upload File or Drag and Drop",
            dropAnywhere: "Drop Files Anywhere to Upload!",
            userButton: "Users Management",
            createButton: "Add",
            createUserButton: "Add a new user",
            deleteConfirm:"Are you sure you want to permanently delete this entry? This cannot be undone!",
            wipeConfirm:"Are you sure to clean the dialogue list? Actual dialogues' files won't be deleted",
            button_wipeView:"Clean dialogues view",
            annotation:"Annotation",
        },
        lida: {
            button_fileFormatInfo: "File Format Info",
            button_delete: "Delete",
            turns: "Turns",
            button_newDialogue: "Add a New Dialogue",
            button_wipeDialogues: "Delete dialogues",
            interfaceLanguage: "Interface Language:",
            confirmWipe:"Do you wish to wipe your current list? The active collection will be deactivated but it stays available in the database",
            drop:"Drop Files Anywhere to Upload!",
            buttonCollections:"Collections",
            connectionError: "Couldn't connect to server, check that it's running or the address in backend_config",
            backupDone:"Backup done.",
            backupPost:"Backup postponed: nothing to save.",
            backupFailed:"Backup failed.",
            backupNext:"Next scheduled in two mintues...",
            annotated: "Annotated",
            logOut:"logout",
            confirmLogout: "Do you want to log out?",
        },
        collection: {
            title: "Collections Management",
            create: "Create collection",
            update: "Update annotations manually",
            updateConfirm1: "You are updating Collection",
            updateConfirm2: "with your annotations. This will edit the database document.",
            noCollection: "You have no active collection now. Your editings are only saved in your workspace",
            noAssignement: "You can't update this collection. It's not assigned to you",
            add: "Add from those users",
            nothing: "Default action: overwrite",
            keep: "Dialogue ID Conflit in your workspace. Please choose which dialogues to keep",
            addToColl: "Add to your collection one or more document",
            importColl: "Import this collection",
            importCollfromView: "Add from dialogues list",
            importCollfromFile: "Add from file",
            importCollfromUser: "Add from users' list",
            importResult: "Import",
            importSuccess: "Success! Dialogues correctly loaded in your list.",
            importSuccessAddendum: "They are available in your dialogue list.",
            confirmImport: "This will load the selected collection replacing all the current dialogues in the list.",
            confirmRevision: "This will load the selected collection in the Interannotator conflict resolver list, adding it to the current dialogues",
            collTitle: "Title",
            collDesc: "Description",
            collAnnot: "Annotation Style",
            collAssi: "Assigned to",
            collUpda: "Last update",
            collStatus: "Status",
            new: "Imported",
            old: "Previous",
            save: "Save and Update Collection"
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
            select: "Select or write text from turn",
            expand: "Click to Expand",
            noTurn: "No turn selected. Please select one to annotate",
            rate: "Annotation rate",
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
        coll_creation:
        [
            "Insert an unique id for the collection or LIDA will generate one",
            "Insert a title",
            "Insert a short description of the content",
            "Annotation style name. It must corrispond to a file in the server folder",
            "You can assign this dialogues to an user, only them will be able to update it",
            "You can note down here the progress of the annotation work",
        ],
        modal_collectionInfo:
        [
            "Collections",
            "Collections are group of dialogues linked for easy handling and assignment.",
            "To preserve them and avoid mixtures you can work on one collection at a time.",
            "A backup of in-use collections is performed automatically every two minutes.",
            "When an annotator is satisfied with their work is able to send the annotations and update the collection document",
            "stored in the database. Anyway, the editings performed on collections are saved periodically even without pressing that button.",
        ],
        modal_collectionButtons:
        [
            "This button is shown to administrators only and it allows to create a collection from a json file, the dialogues currently present in the inter-annotator dialogue list or the dialogues in the user's workspaces stored in database.",
            "This button imports the selected collection in your LIDA interface to start annotating it",
            "This button sends your local annotations performed on the collections to the document stored in the database. You may use this before a pause or closing LIDA.",
        ],
        database: {
            title: "Workspaces Management",
            location:"Database Location",
            port:"Port",
            saved: "Database updated",
            update: "Update database",
            importDb: "Synchronize from Database",
            confirmImport:"This will wipe your dialogue list and load the dialogues that are in your database document",
            confirmUpdate:"This will update your user-backup in the database",
            importDoc: "Import this document",
            showHelp: "Help"
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
            title:"Risoluzione Conflitti di Annotazione",
            titlePanel:"Pannello di Amministrazione",
            interAnno:"Interannotator Resolution",
            dataItems: "Dialoghi",
            visited: "Visitato",
            notVisited: "Non visitato",
            button_downloadAll:"Scarica i dati",
            button_interAgreement:"Indice di concordanza", 
            annotators:"Annotatori", 
            button_upload:"Carica o trascina un file",
            dropAnywhere: "Rilascia il file per caricarlo!",
            userButton: "Gestione Utenti",
            createButton: "Crea",
            createUserButton: "Crea nuovo utente",
            deleteConfirm:"Si è sicuri di voler eliminare questo documento? Non sarà recuperabile!",
            wipeConfirm:"Si è sicuri di voler azzerare la lista dei dialoghi? I dialoghi non saranno eliminati dai loro file",
            button_wipeView:"Pulisci la lista",
            supervision:"Supervisione",
            annotation:"Annotazione",
        },
        lida: {
            button_fileFormatInfo: "Info sui formati",
            button_delete: "Elimina",
            turns: "Turni",
            button_newDialogue: "Aggiungi un nuovo Dialogo",
            button_wipeDialogues: "Elimina tutto",
            interfaceLanguage: "Lingua Interfaccia:",
            confirmWipe:"Si è sicuri di voler eliminare tutti i dialoghi nella lista? La collezione verrà disattivata ma rimarrà disponibile all'interno del database.",
            drop:"Rilascia i file per caricarli!",
            buttonCollections: "Collezioni",
            connectionError:"Impossibile connettersi al server, controlla che sia in funzione o l'indirizzo in backend_config",
            backupDone:"Backup completato.",
            backupPost:"Backup postposto: niente da salvare.",
            backupFailed:"Backup fallito.",
            backupNext:"Prossimo tra due minuti...",
            annotated:"Annotato",
            logOut:"logout",
            confirmLogout:"Vuoi eseguire il logout?",
        },
        collection: {
            title: "Gestione Collezioni",
            create: "Crea collezione",
            update: "Aggiorna annotazioni manualmente",
            updateConfirm1: "Stai per aggiornare la Collezione",
            updateConfirm2: "con le tue annotazioni. Questo modificherà il documento nel database.",
            noCollection: "Al momento non hai una collezione attiva, le tue modifiche vengono salvate solo nel tuo workspace.",
            noAssignement: "Non puoi aggiornare questa collezione, non è assegnata a te",
            add: "Aggiungi da questi utenti",
            addToColl: "Aggiungi uno o più documenti alla collezione",
            keep: "Conflitto di ID nel tuo workspace. Quale dialogo vuoi tenere?",
            nothing: "Azione predefinita: sovrascrittura",
            importColl: "Importa questa collezione",
            importCollfromView: "Aggiungi dalla lista dialoghi",
            importCollfromFile: "Aggiungi da file",
            importCollfromUser: "Aggiungi da un utente",
            importResult: "Importazione",
            importSuccess: "Successo! I dialoghi sono stati importati correttamente.",
            importSuccessAddendum: "Sono disponibili nella tua lista dei dialoghi.",
            collTitle: "Titolo",
            collDesc: "Descrizione",
            collAnnot: "Modello di annotazione (annotation_style)",
            collAssi: "Assegnata a",
            collUpda: "Ultimo aggiornamento",
            collStatus: "Stato di avanzamento",
            new: "Importato",
            old: "Precedente",
            confirmImport: "Importare la collezione cancellerà tutti i dialoghi attivi nella tua lista.",
            confirmRevision: "Questa operazione aggiungerà la collezione nella lista di revisione, confrontandola con eventuali collezioni già presenti",
            save: "Save and Update Collection"
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
            select: "Seleziona o scrivi dal turno",
            expand: "Clicca per espandere",
            noTurn: "Nessun turno selezionato, nessuna modifica effettuata.",
            rate: "Stima annotazione",
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
        coll_creation:
        [
            "Inserisci un ID univoco per la Collezione o LIDA ne genererà uno automaticamente",
            "Inserisci un titolo",
            "Inserisci una breve descrizione",
            "Nome dell'annotation style utilizzato. Deve essere presente nella cartella server",
            "Puoi assegnare la collezione ad un utente, solo lui potrà modificarla e annotarla",
            "Puoi scrivere qui i progressi nel lavoro di annotazione",
        ],
        modal_collectionInfo:
        [
            "Collezioni",
            "Le collezioni sono gruppi di dialoghi uniti per essere facilmente gestiti e assegnati.",
            "Per evitare commistioni o sovrascritture è possibile lavorare su una sola collezione per volta.",
            "LIDA crea un backup di ogni collezione in uso da almeno un utente, ogni due minuti.",
            "Quando un annotatore è soddisfatto del proprio lavoro o deve fare una pausa può salvare manualmente le sue annotazioni",
            "sulla collezione memorizzata nel database, che viene comunque aggiornata anche automaticamente.",
        ],
        modal_collectionButtons:
        [
            "Questo pulsante è visibile solo agli amministratori e permette di creare una collezione a partire da un file, da dialoghi presenti nell'interfaccia di LIDA o dai backup dei workspace nel database.",
            "Questo pulsante permette di caricare la collezione selezionata per iniziare ad annotarla",
            "Questo pulsante invia le annotazioni fatte localmente dall'utente al documento della collezione nel database. Un meccanismo di controllo identifica il corretto documento di destinazione.",
        ],
        database: {
            title: "Gestione Workspaces",
            location: "Indirizzo",
            port: "Porta",
            saved: "Database aggiornato",
            update: "Aggiorna il database",
            importDb: "Sincronizza dal database",
            confirmImport:"L'operazione cancellerà la tua lista dialoghi e importerà i dialoghi dal tuo documento nel database.",
            confirmUpdate:"L'operazione aggiornerà il backup dell'utente nel database",
            importDoc: "Importa questo documento",
            showHelp: "Aiuto",
        },
        login: {
            welcome:"Benvenuto",
            send:"Accedi",
            warning:"Sono richiesti sia un username sia una password!",
            fail:"Combinazione di nome utente e password non valida",
        }
    },
}