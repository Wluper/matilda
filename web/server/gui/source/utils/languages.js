/************************************
* Language Config file
*************************************/

guiMessages = {
    en: {
        admin: {
            title:"Conflicts Resover",
            titlePanel:"Administration Panel",
            interAnno:"Interannotator Resolution",
            dataItems: "Dialogues",
            dataManagement: "Data Management",
            visited: "Visited",
            visited_dialogues: "Visited Dialogues",
            supervision:"Supervision",
            notVisited: "Not visited",
            button_downloadAll:"Download Data",
            button_interAgreement:"Inter-annotator Agreement", 
            assignedTo:"Assigned to",
            annotator:"Annotator",
            annotators:"Annotators", 
            actualAnnotators:"Sources",
            button_upload:"Upload File or Drag and Drop",
            button_admin:"Admin Panel",
            dropAnywhere: "Drop Files Anywhere to Upload!",
            userButton: "Users Management",
            users:"Users",
            createButton: "Add",
            editButton:"Edit",
            createUserButton: "Add a new user",
            deleteConfirm:"Are you sure you want to permanently delete this entry? This cannot be undone!",
            wipeConfirm:"Are you sure to clean the dialogue list? Actual dialogues' files won't be deleted",
            button_wipeView:"Clean dialogues view",
            annotation:"Annotation",
            backToColl:"Back",
            importConflictsResult:"Nothing to import, no annotated versions have been produced yet",
            cantDeleteAdmin:"Sorry, default admin account can't be deleted",
            annotationInProgress:"Annotations in progress for collection",
            button_freeze: "Freeze",
            button_unfreeze: "Unfreeze",
            button_abort: "Cancel",
            userCreation: "User Creation",
            button_downloadGold:"Download Gold",
            button_wipeCache:"Wipe errors' cache",
            wipeCacheConfirm: "This will delete the conflicts file allowing to start conflict resolving anew.",
            confirmOverwriteUser: "Username already exists, please specify another username or confirm to overwrite existing user",
        },
        lida: {
            button_fileFormatInfo: "Format Info",
            button_delete: "Delete",
            button_switch: "Switch view",
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
            annotatedBy: "by",
            logOut:"logout",
            confirmLogout: "Do you want to log out?",
            load:"Load collection",
            assignedColl:"Assigned collections",
            activeColl:"Active collection",
            alert:"Alert",
            welcome:"Welcome",
            exiting:"You are leaving Lida's session. Are you sure?",
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
            editColl:"Edit a collection",
            importColl: "Import this collection",
            importCollfromView: "Add from dialogues list",
            importCollfromFile: "Add from file",
            importCollfromUser: "Add from users' list",
            inspecting:"Inspecting a collection",
            importResult: "Import",
            importSuccess: "Success! Dialogues correctly loaded in your list.",
            importSuccessAddendum: "They are available in your dialogue list.",
            confirmImport: "This will load the selected collection and make it the active collection",
            confirmRevision: "This will load the selected collection in the Interannotator conflict resolver list, adding it to the current dialogues",
            confirmChangesLost: "There are unsaved changes to collections. Do you want to proceed without saving them?",
            confirmDeleteDialogue: "This will immediately delete the selected dialogue from the collection. This cannot be undone.",
            collTitle: "Title",
            collDesc: "Description",
            collAnnot: "Annotation Style",
            collAssi: "Assigned to",
            collUpda: "Last update",
            collStatus: "Status",
            new: "Imported",
            old: "Previous",
            save: "Save and Update Collection",
            done: "Annotations completed",
            freeze: "This operation will freeze the collection and notify your work is done and can be reviewed. Do it only when you finished",
            freezed: "These annotations are freezed and can not be edited until reviewed and unlocked by an administrator",
            empty:"Empty",

        },
        annotation_app: {
            turnId: "Turn Id",
            enter: "Enter",
            save: "Save",
            enterQuery:"Enter New Query",
            allSaved: "All Changes Saved",
            unsaved: "Unsaved Changes",
            backToAll: "Back",
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
            accept:"Accept",
            noConflicts:"No annotation conflicts found in this dialogue",
            updateAccepted:"Value updated",
        },
        admin_panel: [
            "Confront annotations on the same collections and resolve their conflicts",
            "Add, remove and edit annotator and administrator accounts",
            "Create, edit and assign dialogues collections",
            "Inspect how annotations are progressing",
            "Annotate collections assigned to you",
        ],
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
            "Annotation style name",
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
            "This button allows to create a collection from one or more json files.",
            "With this function you can edit the information associated to a collection and remove one or more dialogues from it",
            "This button permanently delete the collection from the database",
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
            title:"Conflitti Annotazione",
            titlePanel:"Pannello di Amministrazione",
            interAnno:"Interannotator Resolution",
            dataItems: "Dialoghi",
            dataManagement: "Gestione Collezioni",
            visited_dialogues: "Dialoghi visitati",
            visited: "Visitato",
            notVisited: "Non visitato",
            button_downloadAll:"Scarica i dati",
            button_interAgreement:"Indice di concordanza", 
            annotator:"Annotatore",
            annotators:"Annotatori", 
            assignedTo: "Assegnato a",
            actualAnnotators:"Fonti",
            button_upload:"Carica o trascina un file",
            button_admin:"Pannello Admin",
            dropAnywhere: "Rilascia il file per caricarlo!",
            userButton: "Gestione Utenti",
            users:"Utenti",
            createButton: "Crea",
            editButton:"Modifica",
            createUserButton: "Crea nuovo utente",
            deleteConfirm:"Si è sicuri di voler eliminare questo documento? Non sarà recuperabile!",
            wipeConfirm:"Si è sicuri di voler azzerare la lista dei dialoghi? I dialoghi non saranno eliminati dai loro file",
            button_wipeView:"Pulisci la lista",
            supervision:"Supervisione",
            annotation:"Annotazione",
            backToColl: "Indietro",
            importConflictsResult:"Non è stato trovato niente da importare, nessuna versione annotata è stata ancora prodotta.",
            cantDeleteAdmin:"L'account speciale 'admin' non può essere eliminato",
            annotationInProgress:"Annotazioni in corso per la collezione",
            button_freeze:"Blocca",
            button_unfreeze:"Sblocca",
            button_abort:"Annulla",
            button_downloadGold:"Scarica versione Gold",
            button_wipeCache:"Resetta la cache degli errori",
            userCreation:"Creazione Utente",
            confirmOverwriteUser: "L'username scelto esiste già, vuoi sovrascrivere l'utente già esistente?",
            wipeCacheConfirm: "Questo cancellerà la lista dei conflitti e permetterà di ricominciare la risoluzione da capo",
        },
        lida: {
            button_fileFormatInfo: "Info sui formati",
            button_delete: "Elimina",
            button_switch: "Cambia interfaccia",
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
            annotatedBy:"da",
            logOut:"logout",
            confirmLogout:"Vuoi eseguire il logout?",
            load:"Carica collezione",
            activeColl:"Collezione attiva",
            assignedColl:"Collezioni assegnate",
            alert:"Attenzione",
            welcome:"Benvenuto",
            exiting:"Stai per uscire dalla sessione di Lida. Sei sicuro?",
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
            editColl:"Modifica una collezione",
            importColl: "Importa questa collezione",
            importCollfromView: "Aggiungi dalla lista dialoghi",
            importCollfromFile: "Aggiungi da file",
            importCollfromUser: "Aggiungi da un utente",
            importResult: "Importazione",
            importSuccess: "Successo! I dialoghi sono stati importati correttamente.",
            importSuccessAddendum: "Sono disponibili nella tua lista dei dialoghi.",
            inspecting:"Visionare una collezione",
            collTitle: "Titolo",
            collDesc: "Descrizione",
            collAnnot: "Modello di annotazione (annotation_style)",
            collAssi: "Assegnata a",
            collUpda: "Ultimo aggiornamento",
            collStatus: "Stato di avanzamento",
            new: "Importato",
            old: "Precedente",
            confirmImport: "Importare la collezione cancellerà tutti i dialoghi attivi e cambierà la collezione attiva.",
            confirmRevision: "Questa operazione aggiungerà la collezione nella lista di revisione, confrontandola con eventuali collezioni già presenti",
            confirmChangesLost: "Ci sono cambiamenti non salvati alle collezioni. Vuoi precedere senza salvarli?",
            confirmDeleteDialogue: "Questo eliminerà immediatamente e irreversibilmente il seguente dialogo dalla collezione. Confermi?",
            save: "Save and Update Collection",
            done: "Annotazione completata",
            freeze: "Questa operazione bloccherà la collezione e notificherà che hai finito e che le annotazioni sono pronte per la revisione",
            freezed: "L'annotazione è stata segnalata come completata e quindi non potrà essere modificata fino alla revisione e allo sblocco da parte di un amministratore.",
            empty:"Vuoto",
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
            accept:"Accetta",
            noConflicts:"Nessun conflitto di annotazione trovato in questo dialogo",
            updateAccepted:"Annotazione aggiornata",
        },
        admin_panel: [
            "Confronta le annotazioni fatte sulla stessa collezione e risolvine i conflitti",
            "Aggiungi, rimuovi o modifica account di tipo amministratore o annotatore",
            "Crea, modifica e assegna le collezioni di dialoghi",
            "Controlla come sta procedendo il lavoro di annotazione",
            "Annota le collezioni assegnate a te",
        ],
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
            "Questo è un rapporto sui tuoi dati.",
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
            "Nome dell'annotation style utilizzato",
            "Puoi assegnare la collezione ad un utente, solo lui potrà modificarla e annotarla",
            "Puoi scrivere qui i progressi nel lavoro di annotazione",
        ],
        modal_collectionInfo:
        [
            "Collezioni",
            "Le collezioni sono gruppi di dialoghi uniti insieme per essere facilmente gestiti e assegnati.",
            "Gli amministratori creano le collezioni e le assegnano agli utenti perché le annotino.",
            "LIDA crea un backup di ogni collezione in uso da almeno un utente, ogni due minuti.",
            "Quando un annotatore è soddisfatto del proprio lavoro può segnalarlo come completato così che venga revisionato",
            "e gli siano assegnati nuovi compiti da svolgere.",
        ],
        modal_collectionButtons:
        [
            "Questo pulsante permette di creare una collezione a partire da uno o più file json.",
            "Da questo pulsante accedi alla modifica della collezione. Puoi modificare le informazioni associate ad essa e rimuovere uno o più dialoghi singolarmente.",
            "Questo pulsante elimina permantentemente la collezione dal database",
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