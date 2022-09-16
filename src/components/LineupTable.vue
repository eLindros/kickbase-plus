<template>
<v-container class="overflow-auto">
  <v-simple-table dense>
    <template v-slot:default>
      <thead>
        <tr>
          <th class="text-left" style="width: 5%">Check</th>
          <th class="text-left" style="width: 25%">Name</th>
          <th class="text-left" style="width: 20%">Market Value</th>
          <th class="text-left" style="width: 15%">Total points</th>
          <th class="text-left" style="width: 15%">Average points</th>
          <th class="text-left" style="width: 20%">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.name">
          <td><v-checkbox
            :value=item
            @change="setSelectedPlayers(item)">
            </v-checkbox>
          </td>
          <td>
            <span v-if="item.knownName">{{ item.knownName }}</span>
            <span v-else>{{ item.firstName }} {{ item.lastName }}</span>
          </td>
          <td>{{ marketValueFormated(item) }}</td>
          <td>{{ item.totalPoints }}</td>
          <td>{{ item.averagePoints }}</td>
          <td><status-pill :player="item"></status-pill></td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>
	</v-container>
</template>

<script>
import numeral from "numeral";
import {mapMutations} from 'vuex'

import StatusPill from "./StatusPill";


export default {
  props: {
    items: {
      type: Array,
      required: true,
    },
  },
  components: {
    StatusPill,
  },
  methods: { 
       ...mapMutations([
      'setSelectedPlayers'
    ]),
    marketValueFormated(item) {
      return numeral(item.marketValue).format("0,0");
    },
    setSelectedPlayers(item){
      this.setSelectedPlayers(item);
    }
  },
};
</script>
