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
})
