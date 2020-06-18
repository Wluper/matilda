/********************************
* Annotation Component
********************************/

Vue.component('classification-annotation',{

    props: ["classification", "classFormat", "uniqueName", "info", "turn", "confidences"],


    data () {

        return {

            collapsed: false,
            showInfo: false,
            guiMessages

        }

    },

    computed: {
        correctClassification : function(){
            console.log("Classification Computed");
            if (this.classification.length > 0) {
              //if turn already annotated, send event for annotation rate
              annotationAppEventBus.$emit("turn_is_annotated", this.turn);
            } 
            return this.classification
        }
    },

    methods:{
        get_confidence : function (id){
            if (this.confidences){

                x = this.confidences[id];
                if (x){
                    return x;
                }
                else {
                    return 0;
                }
            }
            else{
                return '';
            }

        },

        toggleCollapse: function () {

            if (this.collapsed) {
                this.collapsed = false;
            } else {
                this.collapsed = true;
            }

        },

        turnSeparatorWhite: function() {
            const element = document.getElementById(this.uniqueName + '-collapsed-separator')
            element.style.borderColor = 'white';

        },

        turnSeparatorGrey: function() {

            const element = document.getElementById(this.uniqueName + '-collapsed-separator')
            element.style.borderColor = '#aaa';

        },

        update_classification : function(event) {
            if ( this.correctClassification.includes(event.target.value) )
                // remove particular element from list
                this.correctClassification.splice( this.correctClassification.indexOf(event.target.value), 1 );
            else
                // add particular classification to list
                this.correctClassification.push(event.target.value)

            /* TODO
             * I don't understand why this is necessary - for some reason if and
             * only if `this.classification_strings` is empty, then pushing to it
             * will not update the display. However as soon as there is
             * *ANYTHING* in the list, then it suddenly becomes reactive. The
             * only way to make the view update when the list is empty is to call
             * this `forceUpdate()` method, and once that is called Vue seems to
             * realise that there's something in the list and become reactive.
             *
             * I suspect this may be related to the fact that we set an empty
             * list as the default value for `this.classification_strings` if the
             * server doesn't send over any data to populate the list. Something
             * about the way the empty list is assigned as default seems to mean
             * it's not reactive, but my Vue.js skill isn't good enough to know
             * why that happens and then it suddenly becomes reactive once
             * something is appended to it.
             */
            this.$forceUpdate();

            outEvent = {name: this.uniqueName, data: this.correctClassification, turn: this.turn}
            annotationAppEventBus.$emit("update_classification", outEvent)
        },

        checkedMethod : function(labelName){
            return this.correctClassification.includes(labelName)
        },
    },

    template:
    `
    <div>

        <div v-if="collapsed"
             class="classification-annotation">

            <div class="sticky space collapsor"
                 v-on:click="toggleCollapse()"
                 v-on:mouseover="turnSeparatorWhite()"
                 v-on:mouseout="turnSeparatorGrey()">

                {{uniqueName}}
                <br><hr v-bind:id="uniqueName + '-collapsed-separator'">

                <span class="soft-text">{{guiMessages.selected.annotation_app.expand}}</span>
            </div>

        </div>

        <div v-else class="classification-annotation">

            <div class="single-annotation-header">
                <div class="sticky space collapsor" v-on:click="toggleCollapse()">
                    {{uniqueName.replace(/_/g, ' ')}}
                </div>

                <div class="info-button-container">
                    <button v-if="showInfo" class="info-button" v-on:click="showInfo ? showInfo = false : showInfo = true">
                       {{guiMessages.selected.annotation_app.close}}
                    </button>

                    <button v-else class="info-button" v-on:click="showInfo ? showInfo = false : showInfo = true">
                        Info
                    </button>
                </div>

            </div>

            <div v-if="showInfo">

                <hr>

                <div class="text-container">
                    {{ info }}
                </div>

                <hr>

            </div>

            <div v-for="labelName in classFormat" class="checkbox-wrapper">

                <input type="checkbox"
                       class="checkbox"
                       v-bind:id="labelName"
                       v-bind:value="labelName"
                       v-bind:checked="checkedMethod(labelName)"
                       v-on:input="update_classification($event)">

                <label v-bind:for="labelName">
                    <span v-if="checkedMethod(labelName)" class="bold-label"> {{labelName}} || {{get_confidence(labelName)}}</span>
                    <span v-else> {{labelName}} || {{get_confidence(labelName)}} </span>
                </label>

            </div>

        </div>

    </div>
    `
})



























Vue.component('classification-string-annotation', {

    props: ["classification_strings", "uniqueName", "classes", "info", "confidences","currentId"],

    data () {

        return {

            collapsed: false,
            showInfo: false,
            guiMessages,
        }

    },

    methods: {
        get_confidence : function (id){
            if (this.confidences){

                x = this.confidences[id];
                if (x){
                    return x;
                }
                else {
                    return 0;
                }
            }
            else{
                return ''
            }

        },


      toggleCollapse: function () {

          if (this.collapsed) {
              this.collapsed = false;
          } else {
              this.collapsed = true;
          }

      },

      turnSeparatorWhite: function() {

          const element = document.getElementById(this.uniqueName + '-collapsed-separator')
          element.style.borderColor = 'white';

      },

      turnSeparatorGrey: function() {

          const element = document.getElementById(this.uniqueName + '-collapsed-separator')
          element.style.borderColor = '#aaa';

      },

      checkedMethod : function(labelName){

          for (classStringTuple in this.classification_strings) {

              if (this.classification_strings[classStringTuple][0] == labelName) {
                  return true;
              }

          }

          return false;
      },

      getStringPart: function(labelName) {

          for (classStringTuple in this.classification_strings) {

              if (this.classification_strings[classStringTuple][0] == labelName) {
                  console.log(this.classification_strings[classStringTuple][0]);
                  return this.classification_strings[classStringTuple][1]

              }

          }

      },

      updateClassAndString: function(event, labelName) {

          console.log('---- UPDATING SLOT-VALUE ----')
          present = false;

          if (event.target) { slotValue = event.target.value }
            else { slotValue = event.value }

          for (idx in this.classification_strings) {

              if (this.classification_strings[idx][0] == labelName && slotValue !== '') {

                  present = true;
                  this.classification_strings[idx][1] = slotValue

              } else if (this.classification_strings[idx][0] == labelName && slotValue == '') {

                  present = true;
                  this.classification_strings.splice(idx, 1)

              }

              if (present) {
                  break;
              }

          }

          if (!present) {
              this.classification_strings.push([labelName, slotValue])
          }

          /* TODO
           * I don't understand why this is necessary - for some reason if and
           * only if `this.classification_strings` is empty, then pushing to it
           * will not update the display. However as soon as there is
           * *ANYTHING* in the list, then it suddenly becomes reactive. The
           * only way to make the view update when the list is empty is to call
           * this `forceUpdate()` method, and once that is called Vue seems to
           * realise that there's something in the list and become reactive.
           *
           * I suspect this may be related to the fact that we set an empty
           * list as the default value for `this.classification_strings` if the
           * server doesn't send over any data to populate the list. Something
           * about the way the empty list is assigned as default seems to mean
           * it's not reactive, but my Vue.js skill isn't good enough to know
           * why that happens and then it suddenly becomes reactive once
           * something is appended to it.
           */
          this.$forceUpdate();

          outEvent = {name: this.uniqueName, data: this.classification_strings}
          annotationAppEventBus.$emit('classification_string_updated', outEvent);

      },

      select_word: function(event,labelName) {
         annotationAppEventBus.$emit( "resume_annotation_tools");

         let activeTurn = document.getElementsByClassName("dialogue-turn-selected")[0];
         let activeInputs = activeTurn.getElementsByClassName("primary-turn-input");
         event.target.title = labelName;
         event.target.id = "active_label";

         activeTurn.style.border = "3px solid #fafa69";
         Array.from(activeInputs).forEach(element => element.onmouseup = this.update_slot);

      },

      update_slot: function(event) {
         console.log("Gathering text");
         let activeLabel = document.getElementById("active_label"); 
         let labelName = activeLabel.title;
         let context = event.target.parentNode.parentNode.getElementsByClassName("user-string-type-name")[0].textContent;
         let text = event.target.value.substring(event.target.selectionStart, event.target.selectionEnd);

         //updating
         if ((text == undefined) || (text == "")) {
            annotationAppEventBus.$emit("resume_annotation_tools");
            return
         }
         activeLabel.value += context.trim()+"["+event.target.selectionStart+","+event.target.selectionEnd+"]["+text+"],";
         this.updateClassAndString(activeLabel, labelName);
         //put all back to place
         annotationAppEventBus.$emit("resume_annotation_tools");
      },
    },

    template:
    `
    <div>

        <div v-if="collapsed"
             class="classification-annotation">

            <div class="sticky space collapsor"
                 v-on:click="toggleCollapse()"
                 v-on:mouseover="turnSeparatorWhite()"
                 v-on:mouseout="turnSeparatorGrey()">
                {{uniqueName}} <br><hr v-bind:id="uniqueName + '-collapsed-separator'">
                <span class="soft-text">[Click to Expand]</span>
            </div>

        </div>

        <div v-else class="classification-annotation">

            <div class="single-annotation-header">
                <div class="sticky space collapsor" v-on:click="toggleCollapse()">
                    {{uniqueName.replace(/_/g, ' ')}}
                </div>

                <div class="info-button-container">

                    <button v-if="showInfo" class="info-button" v-on:click="showInfo ? showInfo = false : showInfo = true">
                        {{guiMessages.selected.annotation_app.close}}
                    </button>

                    <button v-else class="info-button" v-on:click="showInfo ? showInfo = false : showInfo = true">
                        Info
                    </button>

                </div>

            </div>

            <div v-if="showInfo">

                <hr>

                <div class="text-container">
                    {{ info }}
                </div>

                <hr>

            </div>


            <div v-for="labelName in classes" class="multilabel-string-item-wrapper">

                <div class="multilabel-string-checkbox-container">
                  <input type="checkbox"
                         class="multilabel-string-checkbox"
                         v-bind:id="labelName"
                         v-bind:value="labelName"
                         v-bind:checked="checkedMethod(labelName)"
                         disabled>
                </div>

                <label v-bind:for="labelName" class="multilabel-string-label">
                    <span v-if="checkedMethod(labelName)" class="bold-label"> {{labelName}} || {{get_confidence(labelName)}} </span>
                    <span v-else> {{labelName}} || {{get_confidence(labelName)}}</span>
                </label>

                <input class="multilabel-string-input"
                       v-on:click="select_word($event,labelName)"
                       v-bind:value="getStringPart(labelName)"
                       v-on:input="updateClassAndString($event, labelName)">
                </input>

            </div>

        </div>
    </div>
    `
})

Vue.component('classification-global-annotation',{

    props: ["globals", "info", "turn", "dTurns", "dialogueId"],


    data () {

        return {

            collapsed: false,
            showInfo: false,
            guiMessages

        }

    },

    methods: {

        toggleCollapse: function () {

            if (this.collapsed) {
              this.collapsed = false;
            } else {
              this.collapsed = true;
            }

        },

        turnSeparatorWhite: function() {
            const element = document.getElementById("Global Slot")
            element.style.borderColor = 'white';

        },

        turnSeparatorGrey: function() {
            const element = document.getElementById("Global Slot")
            element.style.borderColor = '#aaa';

        },

        stopAnnotation: function() {
            //set turn to 0, prevent other types of annotation
            annotationAppEventBus.$emit( "update_turn_id", 0 );
            let annotations = document.getElementById("annotations").querySelectorAll("div.classification-annotation");
            for (i=1;i < annotations.length; i++) {
                annotations[i].style.pointerEvents = "none";
                annotations[i].style.color = "rgba(0,0,0,0.2)";
            }
        },

        getActualValue: function(labelName) {
            console.log("Computing global slots:");
            if (this.dTurns.length > 0) {
                try { 
                    var value = this.dTurns[0]["global_slot"][labelName];
                    console.log(labelName,":",value);
                    return value;
                } catch { 
                    return ""; 
                }
            }
            console.log("----------")
        },

        updateValue: function(event) {
            event.stopPropagation();
            //update dTurns
            if (this.dTurns[0]["global_slot"] == undefined) {
                this.dTurns[0]["global_slot"] = {};
            } 
            this.dTurns[0]["global_slot"][event.target.id] = event.target.value;
            console.log("Dialogue updated:",this.dTurns);
            annotationAppEventBus.$emit("save_dialogue");
            }
        },

    template:
`
    <div>

        <div v-if="collapsed"
             class="classification-annotation">

            <div class="sticky space collapsor"
                 v-on:click="toggleCollapse()"
                 v-on:mouseover="turnSeparatorWhite()"
                 v-on:mouseout="turnSeparatorGrey()">

                Global Slot
                <br><hr id="Global Slot">

                <span class="soft-text">{{guiMessages.selected.annotation_app.expand}}</span>
            </div>

        </div>

        <div v-else class="classification-annotation">

            <div class="single-annotation-header">
                <div class="sticky space collapsor" v-on:click="toggleCollapse()">
                    Global Slot
                </div>

                <div class="info-button-container">
                    <button v-if="showInfo" class="info-button" v-on:click="showInfo ? showInfo = false : showInfo = true">
                       {{guiMessages.selected.annotation_app.close}}
                    </button>

                    <button v-else class="info-button" v-on:click="showInfo ? showInfo = false : showInfo = true">
                        Info
                    </button>
                </div>

            </div>

            <div v-if="showInfo">

                <hr>

                <div class="text-container">
                    {{ globals.info }}
                </div>

                <hr>

            </div>

            <div v-for="labelName in globals.labels" class="global-input-wrapper">

                <label v-bind:for="labelName" class="global-label">{{labelName}}</label>
                <input class="global-input" type="text" v-bind:id="labelName" v-bind:value="getActualValue(labelName)" v-on:click="stopAnnotation()" v-on:keyup.enter="updateValue($event)" v-on:blur="updateValue($event)">

            </div>

        </div>

    </div>
`
})
