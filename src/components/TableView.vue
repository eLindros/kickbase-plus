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
      hide-default-footer
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
import numeral from "numeral";
import ligainsider from "../api/ligainsider";

const KpP = (K, P) => {
  const Kn = numeral(K);
  const Pn = numeral(P);

  if (Pn.value() === 0) {
    return 0;
  } else {
    return numeral(Kn.value() / 1000 / Pn.value()).format("0,0");
  }
};

const sortNumeral = (a, b) => numeral(a).value() - numeral(b).value();

export default {
  name: "table-view",
  data: () => ({
    search: "",
    headers: [
      { text: "Name", value: "name" },
      { text: "Team", value: "team" },
      { text: "Position", value: "position" },
      {
        text: "Points",
        value: "totalPoints",
        sort: (a, b) => sortNumeral(a, b),
      },
      {
        text: "Games Played",
        value: "gamesPlayed",
        sort: (a, b) => sortNumeral(a, b),
      },
      {
        text: "Avg. Points per Games Played",
        value: "averagePointsPerGamesPlayed",
        sort: (a, b) => sortNumeral(a, b),
      },
      {
        text: "Avg. Points per Game Days",
        value: "averagePointsPerGameDays",
        sort: (a, b) => sortNumeral(a, b),
      },
      {
        text: "Market Value",
        value: "marketValue",
        sort: (a, b) => sortNumeral(a, b),
      },
      {
        text: "K per Point",
        value: "kpToPts",
        sort: (a, b) => sortNumeral(a, b),
      },
      {
        text: "K per Avg. Point",
        value: "kpAvPts",
        sort: (a, b) => sortNumeral(a, b),
      },
    ],
  }),
  computed: {
    ...mapGetters(["getSelf", "getLigainsiderPlayers"]),
    getGameDays() {
      const maxPlayer =  this.getLigainsiderPlayers.reduce((a, b) => {
        return (numeral(a.gamesPlayed).value() > numeral(b.gamesPlayed).value())
          ? a
          : b;
      });
      return numeral(maxPlayer.gamesPlayed).value();
    },
    getLigainsiderPlayersWithLinks() {
      return this.getLigainsiderPlayers.map((player) => {
        return {
          ...player,
          averagePointsPerGamesPlayed: numeral(
            numeral(player.averagePoints).value()
          ).format("0,0"),
          averagePointsPerGameDays: numeral(
            numeral(player.totalPoints).value() / this.getGameDays
          ).format("0,0"),
          kpAvPts: KpP(player.marketValue, player.averagePoints),
          kpToPts: KpP(player.marketValue, player.totalPoints),
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