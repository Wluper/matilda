/************************************
* Main Resolution Component
*************************************/

Vue.component("resolution-app", {

    props: [
        "dialogueId"
    ],

    data () {
        return {
            errorList : data.errorList.errors,
            metaDataList : data.errorList.meta,
            validAnnotations: data.validAnnotations,
            currentErrorId: 1,
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
            console.log("===This is the current Resolution===")
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
        window.addEventListener('keyup', this.change_turn);

        // meta-error-list Listener
        annotationAppEventBus.$on("update_id", this.set_current_id );

    },



    // METHODS
    methods:{

        init: function() {
            console.log(this.metaDataList)
            // Step One :: Get the Annotation Styles
            backend.get_annotation_style_async()
            .then( (response) => {
                this.annotationFormat = response;
            });

        },

        change_turn: function(event) {

            console.log(" ************ DTURNS ************ ")
            console.log(this.dCurrentId)
            console.log(event)
            if (event.key=="ArrowLeft" || event.key=="ArrowUp"){
                temp=-1;
            }
            else if (event.key=="ArrowRight" || event.key=="ArrowDown" || event.key=="Enter"){
                temp=1;
            } else {
                return;
            }

            if ( !( this.currentErrorId==this.dTurns.length ) ){
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

    <error-list v-bind:metaList="metaDataList"
    v-bind:currentId="currentErrorId">
    </error-list>

    <resolutions v-bind:error="currentError">
    </resolutions>

    </div>
    `
});
