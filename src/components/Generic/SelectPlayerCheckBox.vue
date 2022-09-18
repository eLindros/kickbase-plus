<template>
          <td><v-checkbox
            v-model="isSelectedPlayer">
            </v-checkbox>
          </td>
</template>

<script>
import {mapMutations, mapGetters} from 'vuex';

export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapGetters([
      'getSelectedPlayers'
    ]),
    isSelectedPlayer: {
        get() {
            return this.getSelectedPlayers[this.item.id] !== undefined;
        },
        set(value) {
          if(value && this.getSelectedPlayers[this.item.id] === undefined){
            this.setSelectedPlayers(this.item);
          } else if (!value && this.getSelectedPlayers[this.item.id] !== undefined){
            this.setSelectedPlayers(this.item)
          }
        }
    },
  },
  methods: {
       ...mapMutations([
      'setSelectedPlayers'
    ]),

  }
}
</script>