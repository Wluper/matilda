Vue.component("supervision-view", {

   props: [
      "alreadyVisited", "userName"
   ],

   data () {
      return {
         allCollectionsMetadata: [],
         showAnnotatorNamesForIds: [],
         guiMessages,
         selectedCollection:'',
         selectedAnnotator:'',
         allAnnotators:[],
         mode:'supervision-collections-list',
      }
   },

   mounted () {
      this.getAllCollectionIdsFromServer();
   },

   created () {
      adminEventBus.$on("annotator_selected", this.clicked_annotator);
      adminEventBus.$on("dialogue_selected", this.load_in_dialogue_in_supervision);
      adminEventBus.$on("supervision_go_back_to_dialogues", this.clear_view);
      annotationAppEventBus.$on("go_back", this.clear_view );
   },

   methods: {        

      go_back : function(){
         console.log("==================================");
         if (this.mode == "supervision-annotating") {
            this.mode = "supervision-dialogues-list";
         } else if (this.mode == "supervision-dialogues-list") {
            this.mode = "supervision-annotators-list";
            this.selectedAnnotator = "";
         } else if (this.mode == "supervision-annotators-list") {
            this.mode = "supervision-collections-list";
            this.selectedCollection = "";
         } else {
            adminEventBus.$emit("go_back");
         }
      },

      clicked_collection(id, assignedTo) {
         this.selectedCollection = id;
         this.allAnnotators = assignedTo;
         this.mode = "supervision-annotators-list";
      },

      clicked_annotator(annotator) {
         console.log(annotator)
         this.selectedAnnotator = annotator;
         this.mode = "supervision-dialogues-list";
      },

      load_in_dialogue_in_supervision: function (event) {
        this.displayingDialogue = event;
        this.mode = 'supervision-annotating';
      },

      clear_view: function() {
         event.stopPropagation();
         this.mode = "supervision-collections-list";
      },

      getAllCollectionIdsFromServer() {
         backend.get_specific_collections("dialogues_collections",{},{"id":1,"gold":1,"assignedTo":1,"document":1} )
            .then( (response) => {
               console.log(response);
               this.allCollectionsMetadata = response;
         });
      },

      toggle_show_annotators(dialogueName){
         if (this.show_annotators(dialogueName)) {
            index = this.showAnnotatorNamesForIds.indexOf(dialogueName)
            this.showAnnotatorNamesForIds.splice(index, 1)
         } else {
            this.showAnnotatorNamesForIds.push(dialogueName)
         }
      },
      show_annotators(dialogueName){
         return this.showAnnotatorNamesForIds.includes(dialogueName)
      },
   },
   template:
   `
<div id="supervision">
   <div class="dialogue-list-title-container">
      <div class="all-dialogues-list-title">
            <h2>{{guiMessages.selected.admin.supervision}}</h2>
      </div>
      <user-bar v-bind:userName="userName"></user-bar>
      <div class="help-button-container">
            <button v-on:click="go_back($event)" class="back-button btn btn-sm">{{guiMessages.selected.annotation_app.backToAll}}</button>
      </div>
   </div>
   
   <div v-if="mode == 'supervision-collections-list'" class="inner-wrap">
      <ul class="dialogue-list">
          <li class="listed-dialogue" v-for="(name) in allCollectionsMetadata">
            <div class="int-coll-list-single-item-container">
               <div class="int-coll-info">
                  <div class="int-coll-id" v-on:click="clicked_collection(name.id, name.assignedTo)">
                     {{name.id}}
                  </div>

                  <div class="errors-space" v-on:click="clicked_collection(name.id, name.assignedTo)">
                     {{guiMessages.selected.admin.dataItems}}:<span class="gold-false">{{name.documentLength}}</span>
                  </div>

                  <div class="gold-space" v-on:click="clicked_collection(name.id, name.assignedTo)">
                     Gold: <span v-if="name.gold" class="gold-true">True</span>
                     <span v-else>False</span>
                  </div>

                  <div v-if="show_annotators(name.id)"
                     class="int-coll-num-turns-clicked"
                     v-on:click="toggle_show_annotators(name.id)">
                    {{ guiMessages.selected.admin.annotators }}: {{ name.assignedTo }}
                  </div>

                  <div v-else
                     class="int-coll-num-turns"
                     v-on:click="toggle_show_annotators(name.id)">
                    {{ guiMessages.selected.admin.annotators }}: {{ name.assignedTo.length }}
                  </div>
               </div>
            </div>
         </li>
      </ul>
   </div>

   <supervision-collection v-else-if="mode == 'supervision-annotators-list' "
      v-bind:selectedCollection="selectedCollection"
      v-bind:allAnnotators="allAnnotators">
   </supervision-collection>
   
   <supervision-dialogues v-else-if="mode == 'supervision-dialogues-list' "
   v-bind:Su_activeCollection="selectedCollection"
   v-bind:selectedAnnotator="selectedAnnotator">
   </supervision-dialogues>

   <supervision-annotation-app v-else-if="mode == 'supervision-annotating'"
                    v-bind:dialogueId="displayingDialogue">
   </supervision-annotation-app>
</div>
  `
});

Vue.component("supervision-collection", {

   props: ["selectedCollection", "allAnnotators"],

   data() {
      return {
         annotatedCollections: [],
         guiMessages
      }
   },

   mounted () {
      this.get_all_annotated_collections(this.selectedCollection);
   },

   methods: {
      get_all_annotated_collections: function(id) {
         mainContainer.style.cursor = "progress";
         backend.get_specific_collections("annotated_collections",{"id":id}, {"annotator":1,"done":1,"status":1,"lastUpdate":1})
            .then( (response) => {
               console.log("==== ANNOTATED VERSIONS FOR",id,"====");
               this.annotatedCollections = response;
               console.log(this.annotatedCollections);
               mainContainer.style.cursor = null;
            }  
         );
        console.log(this.allAnnotators);
        // divide between produced annotations, 
        // annotations from dis-assigned annotators,
        // annotations not yet produced.
      },

      clicked_annotated: function(clickedAnnotator) {
         backend.supervision(clickedAnnotator,this.selectedCollection) 
            .then( (response) => {
               console.log("==== LOADING ANNOTATIONS FOR SELECTED USER ====");
               adminEventBus.$emit("annotator_selected",clickedAnnotator);
            });
      },

      freeze(clicked, doneValue) {
         if (confirm(guiMessages.selected.collection.freeze)) {
            var done = false;
            if (doneValue != true)
               done = true;
            backend.update_collection_fields(this.selectedCollection, {"done":done}, clicked)
            .then((response) => {
               this.get_all_annotated_collections(this.selectedCollection);
            });
         }
      },
   },

   template:
   `  <div id="annotated_wrap" class="inner-wrap">
         <ul class="dialogue-list">
            <li id="annotated_list">
               <h2>{{guiMessages.selected.admin.annotationInProgress}} {{selectedCollection}}</h2>
               <div class="entry-list-single-item-container" v-for="name in annotatedCollections">
                  <div v-if="name.done" class="del-dialogue-button" v-on:click="freeze(name.annotator, name.done)">
                     {{guiMessages.selected.admin.button_unfreeze}}
                  </div>
                  <div v-else class="del-dialogue-button" v-on:click="freeze(name.annotator, name.done)">
                     {{guiMessages.selected.admin.button_freeze}}
                  </div>
                  <div class="entry-info" v-on:click="clicked_annotated(name.annotator)">
                     <div class="entry-id">
                        <span>Annotator:</span> {{name.annotator}}
                     </div>
                     <div class="entry-annotated">
                        <span>Status: {{name.status}}</span>
                        <div class="annotated-bar">
                           <div class="annotated-fill" v-bind:style="{ width: name.status }"></div>
                        </div>
                     </div>
                     <div class="entry-assigned">
                        Done: <span v-if="name.done" class="gold-true">{{name.done}}</span>
                              <span v-else class="gold-false">{{name.done}}</span>
                     </div>
                     <div class="entry-date">
                        {{name.lastUpdate}}
                     </div>
                  </div>
               </div>
            </li>
         </ul>
      </div>
   `
});

Vue.component("supervision-dialogues", {

   props: [
      "Su_activeCollection", "selectedAnnotator"
   ],

   data () {
      return {
         supervisionAlreadyVisited: [],
         supervisionDialogueMetadata: [],
         // Reference to the language item
         guiMessages,
         supervisionUserName: "Su_"+mainApp.userName,
         collectionRate: ""
      }
   },
  created() {
      //allDialoguesEventBus.$on( "refresh_dialogue_list", this.getAllDialogueIdsFromServer )
  },
  mounted () {
      this.init();
  },

  methods: {

      init : function(){
         // Step ONE: Get FILE NAME
         this.getAllDialogueIdsFromServer();
      },

      getAllDialogueIdsFromServer() {
         backend.get_all_dialogue_ids_async("supervision")
            .then( (response) => {
               this.supervisionDialogueMetadata = response;
               this.collectionRate = response[0].status;
               console.log(response);
               this.collectionAnnotationRate();
         });
      },

      collectionAnnotationRate() {
          let summatory = 0; 
          total_turns = 0;
          for (i=0; i < this.supervisionDialogueMetadata.length; i++) {
              total_turns += Number(this.supervisionDialogueMetadata[i]["num_turns"]-1);
              summatory += Number(this.supervisionDialogueMetadata[i]["status"].slice(0,-1) * this.supervisionDialogueMetadata[i]["num_turns"]-1)
          }
          this.colletionRate = Number( summatory / total_turns).toFixed(1);
          if ((this.colletionRate <= 0) || (this.colletionRate == NaN)) {
            this.colletionRate = 0;
          } else if (this.colletionRate >= 99) {
            this.colletionRate = 100;
          }
          this.colletionRate = this.colletionRate+"%";
          if (this.colletionRate == "NaN%") {
              this.colletionRate = "0%";
          }
      },

      dialogue_already_visited(id) {
         return this.supervisionAlreadyVisited.includes(id)
      },

      clicked_dialogue(clickedDialogue) {
         //if collection is freezed dialogues can't be opened
         adminEventBus.$emit("dialogue_selected", this.supervisionDialogueMetadata[clickedDialogue].id)
      }, 

      download_all_dialogues_from_server(event) {
         backend.get_all_dialogues_async()
            .then( (response) => {
               let blob = new Blob([JSON.stringify(response, null, 4)], {type: 'application/json'});
               const url = window.URL.createObjectURL(blob)
               const link = document.createElement('a')
               link.href = url
               fileName = "USER_" + supervisionUserName + "_"+utils.create_date()+".json"
               link.setAttribute('download', fileName )
               document.body.appendChild(link)
               link.click();
         });
      },
  },

  template:

  `
    <div class="inner-wrap">

      <h2>
         <span>{{Su_activeCollection}}:</span> {{ supervisionDialogueMetadata.length }} {{ guiMessages.selected.admin.dataItems }}, {{collectionRate}} {{guiMessages.selected.lida.annotated}} {{guiMessages.selected.lida.annotatedBy}} {{selectedAnnotator}}
      </h2>

      <ul class="dialogue-list">

        <li class="listed-dialogue"
            v-for="(dat, index) in supervisionDialogueMetadata"
            v-bind:id="index">

            <div class="dialogue-list-single-item-container">

                <div v-if="dialogue_already_visited(dat.id)"
                       class="visited-indicator">
                       {{ guiMessages.selected.admin.visited }}
                </div>
                <div v-else
                       class="visited-indicator not-visited">
                       {{ guiMessages.selected.admin.notVisited }}
                </div>

              <div class="dialouge-info" v-on:click="clicked_dialogue(index)">
                  <div class="dialogue-id">
                    {{dat.id}}
                  </div>

                  <div class="dialogue-num-turns" >{{dat.num_turns-1}} {{ guiMessages.selected.lida.turns }}</div>

                  <div class="dialogue-annotated">
                    <span>Annotation: {{dat.status}}</span>
                    <div class="annotated-bar">
                        <div class="annotated-fill" v-bind:style="{ width: dat.status }"></div>
                    </div>
                  </div>
              </div>
            </div>
        </li>
      </ul>
    </div>
  </div>
  `
});

Vue.component("supervision-annotation-app", {

    props: [
      "dialogueId"
    ],

    data () {
        return {
            guiMessages,
            dCurrentId: data.currentTurnId,
            dTurns: [],
            validAnnotations: data.validAnnotations,
            annotationFormat: {},
            allDataSaved: true,
            primaryElementClassName: "primary-turn-input",
            globalSlotNonEmpty: 0,
            metaTags: [],
            annotatedTurns: [],
            annotationRate: '0%',
        }
    },

    // COMPUTED properties
    computed:{
        dIds: function() {
            temp = utils.range(1, this.dTurns.length);
            return temp;
        },

        dCurrentTurn: function() {
            temp = utils.get_turn_data(this.dTurns[ this.dCurrentId], this.validAnnotations, this.annotationFormat);
            return temp;
        },

        dTransformedTurns: function(){
            temp = utils.get_all_turns_data(this.dTurns, this.validAnnotations, this.annotationFormat);
            return temp;
        },

        dialogueNonEmpty: function() {
            return this.dTurns.length > 0
        },
    },

    mounted () {
        this.init();
        this.focus_on_new_query_box();
    },

    beforeDestroyed() {
        console.log("==================================");
        console.log("I am being destroyed");
        console.log(this.dialogueId);
    },

    created () {
        annotationAppEventBus.$on("update_turn_id", this.id_updated_from_ids_list);
    },

    // METHODS
    methods:{
        go_back : function(){
            console.log("==================================");
            console.log("==================================");
            console.log("==================================");
            annotationAppEventBus.$off( "update_turn_id", this.id_updated_from_ids_list );
            adminEventBus.$emit("supervision_go_back_to_dialogues");
        },

        init: function() {

            // Step One :: Download a Single Dialogue
            backend.get_single_dialogue_async(this.dialogueId, "supervision")
                .then( (response) => {
                    console.log('---- RECEIVED DATA FROM THE SERVER ----')
                    console.log(response);
                    this.metaTags = response[0];
                    console.log('---- END ----')
                    this.dTurns = response;
                    //format collection meta-tag
                    if ((this.metaTags["collection"] == null) || (this.metaTags["collection"] == undefined)) {
                        this.metaTags["collection"] = "";
                    }
                    this.annotationRate = this.metaTags["status"];
                })

          // Step Two :: Get the Annotation Styles
          backend.get_annotation_style_async(this.dialogueId, "supervision")
              .then( (response) => {
                  this.annotationFormat = response;
                  this.globalSlotNonEmpty = this.annotationFormat.global_slot.labels.length;
              });

        },

        remove_turn: function(event) {
        },

        change_turn: function(event) {
            console.log(" ************ DTURNS ************ ")
            console.log(this.dCurrentId)
            console.log(event)
            if (event.key=="Enter"){
                temp=1;
            } else {
              return;
            }

            if ( !( this.dCurrentId==this.dTurns.length ) ){
                if ( !( this.dCurrentId==1 ) ){
                    this.dCurrentId += temp;
                }
                else if (temp==1){
                    this.dCurrentId += temp;
                }
            }
            else if (temp==-1){
                this.dCurrentId += temp;
            }

            this.change_focus_based_on_current_turn_id();

        },

        change_focus_based_on_current_turn_id : function () {
            // Changes the focus of the current text field to be the first input
            // field in the turn which has the current ID.
            console.log("Changing focus");
            turnInputElements = document.querySelectorAll('.' + this.primaryElementClassName)

            for (var i = 0; i < turnInputElements.length; i++) {
                elementId = turnInputElements[i].id;
                if (elementId[0] == this.dCurrentId) {
                    const element = document.getElementById(elementId);
                    element.focus();
                    break;
                }
            }
        },

        id_updated_from_ids_list: function(event) {
            console.log("-----> Updating TurnId:")
            console.log(event);
            this.dCurrentId = event;
            this.resume_annotation_tools();
        },

        turn_update: function(event){
        },

        turn_is_annotated: function(event) {
            if (this.annotatedTurns[event] == undefined)
                this.annotatedTurns[event] = "annotated";
        },

        update_annotation_rate: function(annotations, turnTot) {
        },

        append_new_turn: function(event){
        },

        focus_on_new_query_box: function() {
            console.log('FOCUSING ON THE INPUT BOX')
            const toFocus = document.getElementById('new-query-entry-box')
            toFocus.focus()
        },

        save_dialogue: function(event) {
        },

        resume_annotation_tools: function(event) {
        },

    },

    template:
    `
    <div v-on:keyup.enter="change_turn(1)" id="annotation-app">

        <dialogue-menu v-bind:changesSaved="allDataSaved"
                       v-bind:dialogueTitle="dialogueId"
                       v-bind:annotationRate="annotationRate">
        </dialogue-menu>

        <dialogue-turns v-bind:primaryElementClass="primaryElementClassName"
                        v-bind:turns="dTransformedTurns"
                        v-bind:currentId="dCurrentId"
                        v-bind:metaTags="metaTags">
        </dialogue-turns>

        <annotations v-bind:globalSlot="annotationFormat.global_slot"
                     v-bind:globalSlotNonEmpty="globalSlotNonEmpty"
                     v-bind:classifications="dCurrentTurn.multilabel_classification"
                     v-bind:classifications_strings="dCurrentTurn.multilabel_classification_string"
                     v-bind:currentId="dCurrentId"
                     v-bind:dialogueNonEmpty="dialogueNonEmpty"
                     v-bind:dTurns="dTurns"
                     v-bind:dialogueId="dialogueId">
        </annotations>

        <input-box>
        </input-box>

    </div>
    `
});