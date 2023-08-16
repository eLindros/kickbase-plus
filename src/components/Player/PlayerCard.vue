<template>
  <v-card class="max-w-sm min-w-min">
    <div class="">
      <div class="flex justify-start m-0 p-0">
        <div class="w-1/3">
          <PlayerImage :player="player" />
        </div>
        <div class="justify-start align-start w-2/3">
          <div class="flex justify-start align-start">
            <v-chip-group class="pa-0 ma-0">
              <v-chip x-small label class="mr-1">{{ player.number }}</v-chip>
              <v-chip x-small label class="mr-1">{{ getPosition }}</v-chip>
              <v-chip x-small label :color="getStatus.color"
                ><v-icon dense x-small>{{ getStatus.icon }}</v-icon>
              </v-chip>
              <v-spacer></v-spacer>
              <v-chip
                v-if="nextMatchComputed && nextMatchComputed.img"
                :color="getAgainstColor"
                x-small
                label
              >
                <span class="mr-1">VS</span>
                <v-img
                  height="24"
                  width="24"
                  class="flex-grow-0"
                  contain
                  aspect-ratio="1"
                  :src="nextMatchComputed.img"
                ></v-img>
              </v-chip>
            </v-chip-group>
          </div>
          <div class="flex flex-col align-start">
            <div class="truncate ma-0 pa-0 text-xl font-bold uppercase">
              <ExternalInfo :src="getLigainsiderLink">
                <span v-if="player.knownName">{{ player.knownName }}</span>
                <span v-else>{{ player.lastName }}</span>
              </ExternalInfo>
            </div>
            <div class="flex justify-start ma-0 w-full">
              <div class="pa-0 mr-2">
                <div class="text-sm font-bold ma-0">
                  {{ player.totalPoints | numeral("0,0") }}
                </div>
                <div class="font-extralight mt-0" style="font-size: xx-small;">
                  Pkt.
                </div>
              </div>
              <div class="pa-0">
                <div class="text-sm font-bold ma-0">
                  {{ player.averagePoints }}
                </div>
                <div class="font-extralight mt-0" style="font-size: xx-small;">
                  ⌀&nbsp;Pkt.
                </div>
              </div>
              <v-spacer></v-spacer>
              <div class="pa-0 pr-5 w-7/12">
                <div class="text-sm font-bold text-right">
                  {{ getComputedPrice }}
                </div>
                <div
                  class="mt-0 text-right"
                  :style="'font-size: xx-small;color:' + getGrowthColor"
                >
                  <v-icon :color="getGrowthColor" dense x-small>{{
                    getGrowthIcon
                  }}</v-icon>
                  {{ getDiffMV | numeral("0,0$") }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <v-divider />
    <slot></slot>
    <v-divider />
    <div :class="statsCssClass" class="w-full">
      <v-expansion-panels
        v-model="accordion"
        accordion
        focusable
        class="elevation-1 player-card-accordion"
      >
        <v-expansion-panel>
          <v-expansion-panel-header class="elevation-0">
            <v-icon
              class="mr-2 player-card-accordion__icon"
              color="yellow darken-2"
              >fa-medal</v-icon
            >
            season statistics and points
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <player-points-statistic
              :player="player"
              class="max-w-xs"
              v-if="accordion === 0"
            ></player-points-statistic>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel v-if="showPurchaseStatistic">
          <v-expansion-panel-header class="elevation-0">
            <v-icon
              class="mr-2 player-card-accordion__icon"
              color="teal darken-2"
              >fa-search-dollar</v-icon
            >
            purchase statistics
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-data-table
              :headers="getPlayerStatistics.headers"
              :items="getPlayerStatistics.values"
              :hide-default-footer="true"
              class="elevation-1"
            ></v-data-table>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header class="elevation-0">
            <v-icon
              class="mr-2 player-card-accordion__icon"
              color="blue lighten-2"
              >fa-chart-line</v-icon
            >
            market value trend
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <player-market-value-trend
              :player="player"
            ></player-market-value-trend>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <slot name="extra-expansion-panel"></slot>
      </v-expansion-panels>
    </div>
    <v-btn @click="toggleStatistics" class="hidden-sm-and-up">
      <span v-if="statsCssClass === initStatsCssClass">show</span>
      <span v-else>hide</span>
      &nbsp;statistics
    </v-btn>
  </v-card>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";

import ExternalInfo from "../Generic/ExternalInfo";
import PlayerImage from "./PlayerImage";
import numeral from "numeral";
import {
  getMarketValueGrowth,
  getBundesligaClubImageUrlById,
  nextMatch,
  getPositionWording,
} from "@/helper/helper";
import PlayerMarketValueTrend from "./PlayerMarketValueTrend";
import PlayerPointsStatistic from "@/components/Player/PlayerPointsStatistic";

export default {
  name: "PlayerCard",
  components: {
    ExternalInfo,
    PlayerImage,
    PlayerPointsStatistic,
    PlayerMarketValueTrend,
  },
  props: {
    player: {
      required: true,
      type: Object,
    },
    hideMeta: {
      type: Boolean,
      required: false,
      default: false,
    },
    hidePlayerStatus: {
      type: Boolean,
      required: false,
      default: false,
    },
    hidePlayerPosition: {
      type: Boolean,
      required: false,
      default: false,
    },
    hidePlayerPoints: {
      type: Boolean,
      required: false,
      default: false,
    },
    hidePlayerMarketValue: {
      type: Boolean,
      required: false,
      default: false,
    },
    showPurchaseStatistic: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  data() {
    return {
      accordion: null,
      statsCssClass: "hidden-xs-only",
      initStatsCssClass: null,
      playerMetaWidth: null,
    };
  },
  mounted() {
    this.initStatsCssClass = this.statsCssClass;
    this.determinePlayerMetaWidth();
  },
  computed: {
    ...mapGetters(["getPlayers", "getMatches", "getLigainsiderTeams"]),
    hasPreHeadSlot() {
      return !!this.$slots["pre-head"];
    },
    getPlayerImage() {
      return `https://kkstr.s3.amazonaws.com/pool/playersbig/${this.player.id}.png`;
    },
    getComputedPrice() {
      return numeral(this.player.price).format("0,0$");
    },
    getAgainstColor() {
      return this.$vuetify.theme.dark ? "black" : "white";
    },
    getGrowthColor() {
      let positive = "#2a5b2a";
      let negative = "#682828";
      if (this.$vuetify.theme.dark) {
        positive = "#afd3af";
        negative = "#e6b6b6";
      }
      let color = "fa-angle-right";
      if (this.getDiffMV > 0) {
        color = positive;
      } else if (this.getDiffMV < 0) {
        color = negative;
      }
      return color;
    },
    getGrowthIcon() {
      let icon = "fa-angle-right";
      if (this.getDiffMV > 0) {
        icon = "fa-angle-up";
      } else if (this.getDiffMV < 0) {
        icon = "fa-angle-down";
      }
      return icon;
    },
    getPricePerPoint() {
      return (this.player.marketValue / 1000 / this.player.averagePoints) | 0;
    },
    getComputedPricePerPoint() {
      return numeral(this.getPricePerPoint).format("0,0");
    },
    getPricePerPointColor() {
      let positive = "#2a5b2a";
      let negative = "#682828";
      if (this.$vuetify.theme.dark) {
        positive = "#afd3af";
        negative = "#e6b6b6";
      }
      return this.getPricePerPoint < 200 && this.getPricePerPoint > 0
        ? positive
        : negative;
    },
    getPlayerStatistics() {
      return {
        headers: [
          {
            text: "Stat",
            value: "stat",
            sortable: false,
          },
          {
            text: "",
            value: "value",
            sortable: false,
          },
        ],
        values: [
          {
            stat: "Profit",
            value: numeral(this.getDiffPurchasePrice).format("0,0"),
          },
          {
            stat: "Growth to today",
            value: numeral(this.getDiffMV).format("0,0"),
          },
          {
            stat: "Current market value",
            value: numeral(this.player.marketValue).format("0,0"),
          },
          {
            stat: "Last market value",
            value: numeral(this.getYesterdaysMV).format("0,0"),
          },
          {
            stat: "Purchase price",
            value: numeral(this.getPlayersPurchaseSum).format("0,0"),
          },
          {
            stat: "Market value change since purchase",
            value: numeral(this.getPlayersMarketValueChange).format("0,0"),
          },
        ],
      };
    },
    getPosition() {
      return getPositionWording(this.player.position);
    },
    teamImage() {
      return getBundesligaClubImageUrlById(this.player.teamId);
    },
    getYesterdaysMV() {
      if (
        this.getPlayers[this.player.id] &&
        this.getPlayers[this.player.id].marketValues &&
        this.getPlayers[this.player.id].marketValues.length &&
        this.getPlayers[this.player.id].marketValues.length > 3
      ) {
        return this.getPlayers[this.player.id].marketValues[
          this.getPlayers[this.player.id].marketValues.length - 2
        ].m;
      }
      return null;
    },
    getDiffMV() {
      return getMarketValueGrowth(this.player.id);
    },
    getDiffPurchasePrice() {
      if (
        this.getPlayers[this.player.id] &&
        this.getPlayers[this.player.id].leaguePlayer &&
        this.player.offers
      ) {
        return (
          this.player.offers[0].price -
          this.getPlayers[this.player.id].leaguePlayer.buyPrice
        );
      }
      return null;
    },
    getPlayersMarketValueChange() {
      if (
        this.getPlayers[this.player.id] &&
        this.getPlayers[this.player.id].leaguePlayer
      ) {
        return this.getPlayers[this.player.id].leaguePlayer.marketValueChange;
      }
      return null;
    },
    getPlayersPurchaseSum() {
      if (
        this.getPlayers[this.player.id] &&
        this.getPlayers[this.player.id].leaguePlayer
      ) {
        return this.getPlayers[this.player.id].leaguePlayer.buyPrice;
      }
      return null;
    },
    genericInfoFieldColor() {
      return this.$vuetify.theme.dark ? "#ccc" : "#2A3B4D";
    },
    nextGameColor() {
      return this.$vuetify.theme.dark ? "#9b30ff" : "#5500a9";
    },
    nextMatchComputed() {
      return nextMatch(this.getMatches, this.player);
    },
    getLigainsiderLink() {
      if (this.getPlayers[this.player.id]) {
        if (this.getPlayers[this.player.id].ligainsiderId === undefined) {
          this.addPlayerLigainsiderId(this.player.id);
        }
        if (this.getPlayers[this.player.id].ligainsiderId) {
          return `https://www.ligainsider.de${
            this.getPlayers[this.player.id].ligainsiderId
          }`;
        }
      }
      return undefined;
    },
    getLigainsiderTeamLink() {
      if (this.getPlayers[this.player.id]) {
        const teamId = this.getPlayers[this.player.id].teamId;
        if (teamId && this.getLigainsiderTeams[teamId]) {
          return `https://www.ligainsider.de${this.getLigainsiderTeams[teamId].ligainsiderUrl}`;
        }
      }
      return false;
    },
    getStatus() {
      let status = {
        icon: "fa-thumbs-up",
        color: "success",
        status: "fit",
      };
      switch (this.player.status) {
        case 0:
          return status;
        case 1:
          status.icon = "fa-plus-square";
          status.color = "red";
          status.status = "verletzt";
          return status;
        default:
          status.icon = "fa-question";
          status.color = "orange";
          status.status = "??";
          return status;
      }
    },
  },
  methods: {
    ...mapMutations(["addPlayerLigainsiderId"]),
    toggleStatistics() {
      if (this.statsCssClass === this.initStatsCssClass) {
        this.statsCssClass = null;
      } else {
        this.statsCssClass = this.initStatsCssClass;
      }
    },
    determinePlayerMetaWidth() {
      if (this.$refs.playerCardContent) {
        this.playerMetaWidth = this.$refs.playerCardContent.offsetWidth;
      }
    },
  },
};
</script>
