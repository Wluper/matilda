/************************************
* Main Resolution Component
*************************************/

Vue.component("resolution-app", {

    props: [
        "dialogueId", "dialogue", "collectionId"
    ],

    data () {
        return {
            // errorList : data.errorList.errors,
            // metaDataList : data.errorList.meta,
            // validAnnotations: data.validAnnotations,
            errorList : [],
            metaDataList : [],
            validAnnotations: data.validAnnotations,
            currentErrorId: 1,
            annotationFormat : {},
            goldDialogue : this.dialogue,
            globalSlotValue: "",
        }
    },

    // COMPUTED properties
    computed:{
        ids: function() {
            temp = utils.range(1, this.errorList.length);
            return temp;
        },


        currentError: function() {
            temp = this.errorList[ this.currentErrorId - 1 ];
            console.log("===This is the current ERROR===")
            console.log(temp)
            return temp;
        },



        dialogueNonEmpty: function() {
            return this.errorList.length > 0
        }
    },

    mounted () {
        this.init();
    },

    /***************************************************************************
    *
    * EVENTS GO HERE
    *
    ***************************************************************************/
    created (){
        // GENERAL EVENT LISTENERS
        window.addEventListener('keyup', this.resolve_keyboard_input);
        annotationAppEventBus.$on("clean_events", this.go_back);
        annotationAppEventBus.$on("resume_annotation_tools", this.resume_interannotation_tools);

        // meta-error-list Listener
        annotationAppEventBus.$on("update_id", this.set_current_id );
        annotationAppEventBus.$on("accept", this.accept );

        annotationAppEventBus.$on("update_classification", this.resolve_annotation_update );
        annotationAppEventBus.$on("classification_string_updated", this.resolve_annotation_update );
        annotationAppEventBus.$on("global_string_updated", this.update_global_slot_value );

    },


    // METHODS
    methods:{

        go_back : function(){
            console.log("==================================");
            // GENERAL EVENT LISTENERS
            window.removeEventListener('keyup', this.resolve_keyboard_input);
            annotationAppEventBus.$off("go_back", this.go_back);
            annotationAppEventBus.$off("clean_events", this.go_back);
            annotationAppEventBus.$off("resume_annotation_tools", this.resume_interannotation_tools);

            // meta-error-list Listener
            annotationAppEventBus.$off("update_id", this.set_current_id );
            annotationAppEventBus.$off("accept", this.accept );

            annotationAppEventBus.$off("update_classification", this.resolve_annotation_update );
            annotationAppEventBus.$off("classification_string_updated", this.resolve_annotation_update );
            annotationAppEventBus.$off("global_string_updated", this.update_global_slot_value );
            //get back using the event
            adminEventBus.$emit("conflicts_on_collection", this.collectionId);
        },
        init: function() {
            //console.log(this.metaDataList)
            // Step One :: Get the Annotation Styles
            backend.get_annotation_style_async(this.collectionId)
            .then( (response) => {
                this.annotationFormat = response;
            });

            // Step TWO :: Get the ERRORS
            backend.get_errors_async(this.collectionId,this.dialogueId)
            .then( (response) => {
                this.errorList = response.errors
                this.metaDataList = response.meta;
                if (response.errors.length > 0) {
                    //adminEventBus.$emit("conflicts_on_dialogue",this.dialogueId);
                    let errorsToSave = [];
                    for (i=0;i<response.errors.length;i++) {
                        let params = {
                            errorObject : this.errorList[i],
                            meta : this.metaDataList[i],
                            errorId : i,
                            dialogueId : this.dialogueId,
                            collectionId : this.collectionId
                        }
                        errorsToSave.push(params);
                    }
                    console.log("saving new errors",errorsToSave);
                    backend.put_error_async(errorsToSave)
                }
            });
        },

        print : function(event){
            console.log("****** PRINTING ******");
            console.log(event);
        },

        resolve_annotation_update : function(event){
            console.log("****** RESOLVING ******");
            console.log(event);

            this.errorList[this.currentErrorId-1]["predictions"]=event.data
        },

        resolve_keyboard_input : function(event){
            console.log(" ************ KEY PRESSED ************ ")
            console.log(event.key)
            if (event.key=="Enter"){
                this.accept(event);
            }
            else if (event.key.includes("Arrow")){
                this.change_turn(event);
            }
            else {
                return;
            }

        },

        update_global_slot_value : function(event) {
            this.globalSlotValue = event;
        },

        accept: function(event) {
            this.metaDataList[this.currentErrorId-1].accepted=true;
            let errorsToSave = [];
            params = {
                errorObject : this.errorList[this.currentErrorId-1],
                meta : this.metaDataList[this.currentErrorId-1],
                errorId : this.currentErrorId-1,
                dialogueId : this.dialogueId,
                collectionId : this.collectionId
            }

            if (this.metaDataList[this.currentErrorId-1]["name"] == "global_slot") {
                params["errorObject"]["predictions"][0] = this.globalSlotValue;
                this.errorList[this.currentErrorId-1]["predictions"][0][1] = this.globalSlotValue;
            }

            errorsToSave.push(params);
            backend.put_error_async(errorsToSave);

            this.change_turn( {key:"ArrowRight"})
        },

        change_turn: function(event) {

            console.log(" ************ CHANGING ERROR TURN ************ ")
            console.log(event)
            if (event.key=="ArrowLeft" || event.key=="ArrowUp"){
                temp=-1;
            }
            else if (event.key=="ArrowRight" || event.key=="ArrowDown" || event.key=="Enter"){
                temp=1;
            } else {
                return;
            }

            if ( !( this.currentErrorId==this.errorList.length ) ){
                if ( !( this.currentErrorId==1 ) ){
                    this.currentErrorId += temp;
                }
                else if (temp==1){
                    this.currentErrorId += temp;
                }
            }
            else if (temp==-1){
                this.currentErrorId += temp;
            }
        },

        set_current_id : function(event){
            this.currentErrorId = event;
        },

        resume_interannotation_tools : function() {
            console.log("Resuming inter-annotation tools");
            //resuming label
            document.getElementById("usr").onmouseup = null;
            document.getElementById("sys").onmouseup = null;
            let active_label = document.getElementsByClassName("active_label")[0];
            if (active_label != null) {
                active_label.classList.remove("active_label");
            }
            let active_button = document.getElementsByClassName("active_button")[0];
            if (active_button != null) {
                active_button.classList.remove("active_button");
            }
            //resuming turn
            let activeTurn = document.getElementsByClassName("dialogue-turn-selected")[0];
            if (activeTurn != null) {
                activeTurn.style = null;
            }
            //resuming annotation sections
            if (document.getElementById("annotations") != undefined) {
                let annotations = document.getElementById("annotations").querySelectorAll("div.classification-annotation");
                for (i=1;i < annotations.length; i++) {
                    annotations[i].style.pointerEvents = null;
                    annotations[i].style.color = null;
                }
            }
        }

    },

    template:
    `
    <div id="resolution-app">
        <resolution-menu>
        </resolution-menu>

        <error-list v-if="metaDataList" v-bind:metaList="metaDataList"
            v-bind:currentId="currentErrorId">
        </error-list>

        <resolutions v-if="currentError"
            v-bind:collectionId="collectionId" 
            v-bind:error="currentError" 
            v-bind:errorId="currentErrorId"
            v-bind:metaList="metaDataList">
        </resolutions>
    </div>
    `
});
