/************************
* Helper Components
************************/

Vue.component("comm-input",{
    props : ["uniqueName","inputValue", "placeholder", "inputClassName"],

    methods :{
        input_updated : function(event){
            //cause input is inbuild it has complicated event.target.value thing
            this.$emit("comm_input_update",{data: event.target.value, name: this.uniqueName})
        }
    },

    template:
    `
    <input v-bind:class="inputClassName" v-bind:placeholder="placeholder" v-bind:value="inputValue" v-on:input="input_updated($event)">
    `
});

Vue.component("comm-textarea",{
    props : ["uniqueName","inputValue", "inputClassName"],

    methods :{
        input_updated : function(event){
            this.$emit("comm_input_update",{data: event.target.value, name: this.uniqueName})
        }
    },

    template:
    `
    <textarea v-bind:class="inputClassName" v-bind:value="inputValue" v-on:input="input_updated($event)">
    </textarea>
    `
})

Vue.component("clickable-textdiv", {

    props : ["inputValue", "inputClassName", "selectedWords", "uniqueName"],

    computed: {
        transformed_text : function(){
            return this.inputValue.split(" ")
        }
    },
    methods: {
        add_word: function(index,word) {
            this.selectedWords[this.uniqueName][index] = word;
            this.$forceUpdate();
        },
        remove_word: function(index) {
            delete this.selectedWords[this.uniqueName][index];
            this.$forceUpdate();
        },
    },

    template:
    `
    <div v-bind:class="inputClassName">
        <template v-for="word, index in transformed_text">
            <span :id="'w'+index" v-if="selectedWords[uniqueName][index]" class="selected-word" v-on:click="remove_word(index)">{{word}} </span>
            <span :id="'w'+index" v-else class="clickable-word" v-on:click="add_word(index, word)">{{word}} </span>
        </template>
    </div>
    `
});