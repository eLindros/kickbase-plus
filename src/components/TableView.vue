<template>
  <v-card>
    <v-card-title>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="getLigainsiderPlayersWithLinks"
      :items-per-page="500"
      :search="search"
      class="elevation-1"
    >
      <template v-slot:[`item.name`]="{ item }">
        <a :href="`https://www.ligainsider.de${item.url}`">
          {{ item.name }}
        </a>
      </template>
      <template v-slot:[`item.team`]="{ item }">
        <a :href="`https://www.ligainsider.de${item.teamURL}`">
          {{ item.team }}
        </a>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
import ligainsider from "../api/ligainsider";

export default {
  name: "table-view",
  data: () => ({
    search: "",
    headers: [
      { text: "Name", value: "name" },
      { text: "Team", value: "team" },
      { text: "Position", value: "position" },
      { text: "Points", value: "totalPoints" },
      { text: "K per Points", value: "kpToPts" },
      { text: "Avg. Points", value: "averagePoints" },
      { text: "K per Avg. Points", value: "kpAvPts" },
      { text: "Market Value", value: "marketValue" },
    ],
  }),
  computed: {
    ...mapGetters(["getSelf", "getLigainsiderPlayers"]),
    getLigainsiderPlayersWithLinks() {
      return this.getLigainsiderPlayers.map((player) => {
        return {
          ...player,
          kpAvPts: (Number(player.marketValue) / 1000) / Number(player.averagePoints),
          kpToPts: Number(player.totalPoints),
        };
      });
    },
  },
  mounted() {
    this.init();
    this.getLigainsiderPlayers;
  },
  methods: {
    ...mapMutations(["addLoadingMessage", "setLoading", "resetLoading"]),
    init: async function () {
      if (this.getSelf) {
        await this.load();
      } else {
        window.setTimeout(this.init, 1000);
      }
    },
    async load() {
      await ligainsider.loadLigainsiderPlayers();
    },
  },
};
</script>