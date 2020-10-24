/*************************************
* MODAL COMPONENT
*************************************/
Vue.component('modal', {
  data() { 
    return {
      guiMessages
    }
  },
  template:
  `
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">

          <div class="modal-header">
            <slot name="header">
              {{guiMessages.selected.modal_formatInfo[0]}}
            </slot>
          </div>

          <hr>

          <div class="modal-body">
            <slot name="body">
            {{guiMessages.selected.modal_formatInfo[1]}}
            <br><br>
            {{guiMessages.selected.modal_formatInfo[2]}}
            <br><br>
            {{guiMessages.selected.modal_formatInfo[3]}}
              <ul>
                <li v-for="segment in guiMessages.selected.modal_formatInfo_list" :key="segment">
                  {{ segment }}
                </li>
              </ul>

            </slot>
          </div>

          <hr>

          <div class="modal-footer">
            <slot name="footer">
              LIDA
              <button class="modal-default-button" @click="$emit('close')">
                OK
              </button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
  `
})





/*************************************
* MODAL COMPONENT
*************************************/
Vue.component('agreement-modal', {
    data () {
        return {
            scores : {},
            guiMessages,
        }
    },
    mounted () {
        this.init();
    },

    methods: {

          init : function(){

              // Step ONE: Get FILE NAME
              backend.get_scores_async()
                  .then( (response) => {
                      console.log();
                      this.scores = response;

                  });

          },
  },
  template:
  `
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">

          <div class="modal-header">
            <slot name="header">
              <strong>{{guiMessages.selected.modal_agreementScores[0]}}</strong>
            </slot>
          </div>

          <hr>

          <div class="modal-body">
              <slot name="body">
                  {{guiMessages.selected.modal_agreementScores[1]}}
                  <br><br>
                  <strong>
                    {{guiMessages.selected.modal_agreementScores[3]}}
                  </strong>
                  <ul>
                      <li v-for="(item, key, index) in scores">
                        {{key}} : {{item}}
                      </li>
                  </ul>

              </slot>
          </div>

          <hr>

          <div class="modal-footer">
            <slot name="footer">
              LIDA
              <button class="modal-default-button" @click="$emit('close')">
                OK
              </button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
  `
})

Vue.component('help-database-modal', {
  data() { 
    return {
      guiMessages
    }
  },
  template:
  `
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">

          <div class="modal-header">
            <slot name="header">
              <strong>{{guiMessages.selected.modal_databaseInfo[0]}}</strong>
            </slot>
          </div>

          <hr>

          <div class="modal-body">
            <slot name="body">
            {{guiMessages.selected.modal_databaseInfo[1]}}
            <br><br>
            {{guiMessages.selected.modal_databaseInfo[2]}}
            <br><br>
            {{guiMessages.selected.modal_databaseInfo[3]}}
            <br>
              <ul>
                <li> 
                  <strong>{{guiMessages.selected.database.update}}:</strong><br>{{guiMessages.selected.modal_databaseButtons[0]}}
                </li>
                <li> 
                  <strong>{{guiMessages.selected.database.importDb}}:</strong><br>{{guiMessages.selected.modal_databaseButtons[1]}}
                </li>
              </ul>
            </slot>
          </div>

          <hr>

          <div class="modal-footer">
            <slot name="footer">
              LIDA
              <button class="modal-default-button" @click="$emit('close')">
                OK
              </button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
  `
})

Vue.component('help-collection-modal', {

  data() { 
    return {
      guiMessages,
      role:''
    }
  },

  mounted() {
    this.role = mainApp.role;
  },

  template:
  `
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">

          <div class="modal-header">
            <slot name="header">
              <strong>{{guiMessages.selected.modal_collectionInfo[0]}}</strong>
            </slot>
          </div>

          <hr>

          <div class="modal-body">
            <slot name="body">
            {{guiMessages.selected.modal_collectionInfo[1]}}
            <br><br>
            {{guiMessages.selected.modal_collectionInfo[2]}}
            <br><br>
            {{guiMessages.selected.modal_collectionInfo[3]}}
            <br><br>
            {{guiMessages.selected.modal_collectionInfo[4]}}
            {{guiMessages.selected.modal_collectionInfo[5]}}
              <ul>
                <li> 
                  <strong>{{guiMessages.selected.collection.create}}:</strong><br> 
                  {{guiMessages.selected.modal_collectionButtons[0]}}
                </li>
                <li>
                  <strong>{{guiMessages.selected.collection.editColl}}:</strong><br>
                  {{guiMessages.selected.modal_collectionButtons[1]}}
                </li>
                <li>
                  <strong>{{guiMessages.selected.lida.button_delete}}:</strong><br>
                  {{guiMessages.selected.modal_collectionButtons[2]}}
                </li>
              </ul>
            </slot>
          </div>

          <hr>

          <div class="modal-footer">
            <slot name="footer">
              LIDA
              <button class="modal-default-button" @click="$emit('close')">
                OK
              </button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
  `
})

Vue.component('message-modal', {
  
  data() { 
    return {
      guiMessages,
      message:mainApp.showMessage
    }
  },

  methods: {
    close_message: function() {
        allDialoguesEventBus.$emit("show_message",false);
    }
  },
  template:
  `
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">

          <div class="modal-header">
            <slot name="header">
              {{guiMessages.selected.lida.alert}}
            </slot>
          </div>

          <hr>

          <div class="modal-body">
            <slot name="body">
            {{message}}
            </slot>
          </div>

          <hr>

          <div class="modal-footer">
            <slot name="footer">
              LIDA
              <button class="modal-default-button" @click="close_message">
                OK
              </button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
  `
});