/*************************************
* MODAL COMPONENT
*************************************/
Vue.component('modal', {
  template:
  `
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">

          <div class="modal-header">
            <slot name="header">
              Dialogue File Format
            </slot>
          </div>

          <hr>

          <div class="modal-body">
            <slot name="body">
              Files can be uploaded to the annotation system in one of two
              formats: either as a raw .txt file or as a JSON file in the
              correct format.
              <br><br>
              If you upload a .txt file, there are no format restrictions and
              you will be taken to a screen to process it into a dialogue.
              <br><br>
              If you upload a JSON file, it must be in the correct format. This
              format is as follows:

              <ul>
                  <li>
                      File is a dict with keys as the names of each dialogue
                      and values as lists.
                  </li>
                  <li>
                      Each value is a list of dictionaries, where each
                      dictionary contains a number of key-value pairs which
                      are used to display the dialogue data for annotation.
                  </li>
                  <li>
                      Some key-value pairs are compulsory in order to correctly
                      display the dialogue.
                  </li>
                  <li>
                      The key-value pairs which are compulsory are defined in
                      the annotator_config.py file in the "server" folder.
                  </li>
                  <li>
                      By default, the only required key-value pair in each turn
                      is called "usr" and should be the user's query as
                      a string.
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
            scores : {}
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
              Inter-annotator Agreement Scores
            </slot>
          </div>

          <hr>

          <div class="modal-body">
              <slot name="body">
                  This represents a report for your data:
                  <br><br>
                        Available Annotations: [query_type, policy_funcs, hotel_belief_state ]
                  <br><br>
                  <strong>
                    Overall
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
