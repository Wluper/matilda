/************************************
* Main Resolution Component
*************************************/

Vue.component("resolution-app", {

    props: [
        "dialogueId", "dialogue"
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

        // meta-error-list Listener
        annotationAppEventBus.$on("update_id", this.set_current_id );
        annotationAppEventBus.$on("accept", this.accept );

        annotationAppEventBus.$on("update_classification", this.print );
        annotationAppEventBus.$on("classification_string_updated", this.print );

    },


    // METHODS
    methods:{

        init: function() {
            // console.log(this.metaDataList)
            // Step One :: Get the Annotation Styles
            backend.get_annotation_style_async()
            .then( (response) => {
                this.annotationFormat = response;
            });

            // Step TWO :: Get the ERRORS
            backend.get_errors_async(this.dialogueId)
            .then( (response) => {
                this.errorList = response.errors
                this.metaDataList = response.meta;
                console.log(this.errorList);
            });

        },

        update_annotation : function(event){

        },

        print : function(event){
            console.log("****** PRINTING ******");
            console.log(event);
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

        accept: function(event) {
            this.metaDataList[this.currentErrorId-1].accepted=true;

            backend.put_single_dialogue_async(this.dialogueId, this.dialogue)

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
            this.currentErrorId = event
        },

    },

    template:
    `
    <div id="resolution-app">

    <resolution-menu>
    </resolution-menu>

    <error-list v-if="metaDataList" v-bind:metaList="metaDataList"
    v-bind:currentId="currentErrorId">
    </error-list>

    <resolutions v-if="currentError" v-bind:error="currentError" v-bind:errorId="currentErrorId">
    </resolutions>

    </div>
    `
});
