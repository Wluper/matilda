Vue.component("login-view", {

    data() {
        return {
            guiMessages,
            insertedName: ''
        }
    },

    mounted () {
        //
    },

    beforeDestroyed() {
        console.log("==================================");
        console.log("I am being destroyed");
    },
    // METHODS
    methods:{
        init : function(){
            //
        },
        login() {
            this.insertedName = document.getElementById("login_input").value;
            if (this.insertedName.length < 1) {
                console.log("EMPTY USERNAME FIELD")
                alert('Insert a username')
                return;
            } else {
                console.log('---- CHECKING USERNAME ----');
                backend.login(this.insertedName)
                    .then( (response) => {
                        if (response.data.status == "success") {
                            console.log("Username is valid");
                            allDialoguesEventBus.$emit("update_username", this.insertedName);
                        } else {
                            (response.data.status == "fail")
                            alert("User doesn't exist")
                        }
                });
            }
        },
    },
    template:
    `
        <div id="login-view">
            <div class="login_block">
                <h1>{{guiMessages.selected.login.welcome}}</h1>
                <div class="login_form">
                    <input id="login_input" class="login_input" type="text" name="login_username" v-bind:value="insertedName">
                    <button type="button" @click="login()" class="login_button">{{guiMessages.selected.login.send}}</button>
                </div>
            </div>
        </div>
    `
});