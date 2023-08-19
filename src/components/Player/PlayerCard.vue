<template>
  <v-card class="w-full sm:max-w-xs min-w-xs">
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
              <v-chip x-small label :color="getStatus.color"><v-icon dense x-small>{{ getStatus.icon }}</v-icon>
              </v-chip>
              <v-spacer></v-spacer>
              <v-chip v-if="nextMatchComputed && nextMatchComputed.img" :color="getAgainstColor" x-small label>
                <span class="mr-1">VS</span>
                <v-img height="24" width="24" class="flex-grow-0" contain aspect-ratio="1"
                  :src="nextMatchComputed.img"></v-img>
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
              <FullDialog>
                <template #placeholder>
                  <div class="pa-0 mr-2">
                    <div class="text-sm font-bold ma-0">
                      {{ player.totalPoints | numeral("0,0") }}
                    </div>
                    <div class="font-extralight mt-0" style="font-size: xx-small;">
                      Pkt.
                    </div>
                  </div>
                </template>
                <player-points-statistic :player="player" class="px-5" />
              </FullDialog>
              <div class="pa-0">
                <div class="text-sm font-bold ma-0">
                  {{ player.averagePoints }}
                </div>
                <div class="font-extralight mt-0" style="font-size: xx-small;">
                  ⌀&nbsp;Pkt.
                </div>
              </div>
              <v-spacer></v-spacer>
              <FullDialog>
                <template #placeholder>
                  <div class="pa-0 pr-5">
                    <div class="text-sm font-bold text-right">
                      {{ getComputedPrice }}
                    </div>
                    <div class="mt-0 text-right" :style="'font-size: xx-small;color:' + getGrowthColor">
                      <v-icon :color="getGrowthColor" dense x-small>{{
                        getGrowthIcon
                      }}</v-icon>
                      {{ getDiffMV | numeral("0,0$") }}
                    </div>
                  </div>
                </template>
                  <player-market-value-trend :player="player" />
              </FullDialog>
            </div>
          </div>
        </div>
      </div>
    </div>
    <v-divider />
    <slot></slot>
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
import FullDialog from "../Generic/FullDialog.vue";

export default {
  name: "PlayerCard",
  components: {
    ExternalInfo,
    PlayerImage,
    PlayerPointsStatistic,
    PlayerMarketValueTrend,
    FullDialog
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
      playerMetaWidth: null,
    };
  },
  mounted() {
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
      return this.$vuetify.theme.dark ? "grey darken-4" : "white";
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
    getPosition() {
      return getPositionWording(this.player.position);
    },
    teamImage() {
      return getBundesligaClubImageUrlById(this.player.teamId);
    },
    getDiffMV() {
      return getMarketValueGrowth(this.player.id);
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
          return `https://www.ligainsider.de${this.getPlayers[this.player.id].ligainsiderId
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
