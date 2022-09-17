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
       ...mapMutations([
      'setSelectedPlayers'
    ]),
    isSelectedPlayer: {
        get() {
            return this.getSelectedPlayers[this.item.id] !== undefined;
        },
        set() {
          this.setSelectedPlayers(this.item);
        }
    },
  },
}
</script>