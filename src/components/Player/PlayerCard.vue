<template>
  <v-card max-width="400" min-width="350" class="mr-3 mb-3">
    <v-container class="pa-0 ma-0">
      <v-row no-gutters justify="start">
        <v-col cols="4">
          <PlayerImage :player="this.player" />
        </v-col>
        <v-col class="justify-start align-start" cols="8">
          <v-chip-group class="pa-0 ma-0">
            <v-chip x-small label class="mr-1">{{ player.number }}</v-chip>
            <v-chip x-small label class="mr-1">{{ getPosition }}</v-chip>
            <v-chip x-small label :color="getStatus.color"><v-icon dense x-small>{{ getStatus.icon }}</v-icon>
            </v-chip>
            <v-spacer></v-spacer>
            <v-chip color="white" x-small label v-if="nextMatchComputed && nextMatchComputed.img">
              <span class="mr-2">VS</span>
              <v-img height="24" width="24" class="flex-grow-0" contain aspect-ratio="1"
                :src="nextMatchComputed.img"></v-img>
            </v-chip>
          </v-chip-group>
          <v-row class="d-flex flex-column align-start">
            <div class="text-no-wrap overflow-hidden ma-0 pa-0 text-h6 font-weight-black text-uppercase">
              <ExternalInfo :src="getLigainsiderLink">
                <span v-if="player.knownName">{{ player.knownName }}</span>
                <span v-else>{{ player.lastName }}</span>
              </ExternalInfo>
            </div>
            <v-row class="justify-start ma-0" style="width:100%">
              <v-col class="pa-0 mr-2">
                <v-row class="text-body-2 font-weight-bold">
                  {{ player.totalPoints | numeral('0,0') }}
                </v-row>
                <v-row class="grey--text mt-0" style="font-size: xx-small;">
                  Pkt.
                </v-row>
              </v-col>
              <v-col class="pa-0">
                <v-row class="text-body-2 font-weight-bold">
                  {{ player.averagePoints }}
                </v-row>
                <v-row class="grey--text mt-0" style="font-size: xx-small;">
                  ⌀&nbsp;Pkt.
                </v-row>
              </v-col>
              <v-spacer></v-spacer>
              <v-col cols="7" class="pa-0 pr-5">
                <div class="text-body-2 font-weight-bold text-right">
                  {{ getComputedPrice }}
                </div>
                <div class="mt-0 text-right" :style="'font-size: xx-small;color:' + getGrowthColor">
                  <v-icon :color="getGrowthColor" dense x-small>{{ getGrowthIcon }}</v-icon>
                  Marktwert
                </div>
                <div :style="'font-size: xx-small;color:' + getGrowthColor" class="mt-0 text-right">
                  {{
                    getDiffMV | numeral('0,0$')
                  }}
                </div>
              </v-col>
            </v-row>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
    <v-divider />
    <slot></slot>
    <v-divider />
    <div :class="statsCssClass">
      <v-expansion-panels v-model="accordion" accordion focusable class="elevation-1 player-card-accordion">
        <v-expansion-panel>
          <v-expansion-panel-header class="elevation-0">
            <v-icon class="mr-2 player-card-accordion__icon" color="yellow darken-2">fa-medal</v-icon>
            season statistics and points
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <player-points-statistic :player="player" v-if="accordion === 0"></player-points-statistic>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel v-if="showPurchaseStatistic">
          <v-expansion-panel-header class="elevation-0">
            <v-icon class="mr-2 player-card-accordion__icon" color="teal darken-2">fa-search-dollar</v-icon>
            purchase statistics
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-data-table :headers="getPlayerStatistics.headers" :items="getPlayerStatistics.values"
              :hide-default-footer="true" class="elevation-1"></v-data-table>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header class="elevation-0">
            <v-icon class="mr-2 player-card-accordion__icon" color="blue lighten-2">fa-chart-line</v-icon>
            market value trend
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <player-market-value-trend :player="player"></player-market-value-trend>
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
import { getMarketValueGrowth, getBundesligaClubImageUrlById, nextMatch, getPositionWording } from "@/helper/helper"

export default {
  name: "PlayerCard",
  components: {
    ExternalInfo,
    PlayerImage,
  },
  props: {
    player: {
      required: true,
      type: Object
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
    }
  },
  data() {
    return {
      accordion: null,
      statsCssClass: 'hidden-xs-only',
      initStatsCssClass: null,
      playerMetaWidth: null,
    }
  },
  mounted() {
    this.initStatsCssClass = this.statsCssClass
    this.determinePlayerMetaWidth()
  },
  computed: {
    ...mapGetters([
      'getPlayers',
      'getMatches',
      'getLigainsiderTeams',
    ]),
    hasPreHeadSlot() {
      return !!this.$slots['pre-head']
    },
    getPlayerImage() {
      return `https://kkstr.s3.amazonaws.com/pool/playersbig/${this.player.id}.png`
    },
    getComputedPrice() {
      return numeral(this.player.price).format('0,0$')
    },
    getGrowthColor() {
      let positive = '#2a5b2a'
      let negative = '#682828'
      if (this.$vuetify.theme.dark) {
        positive = '#afd3af'
        negative = '#e6b6b6'
      }
      let color = 'fa-angle-right'
      if (this.getDiffMV > 0) {
        color = positive
      } else if (this.getDiffMV < 0) {
        color = negative
      }
      return color
    },
    getGrowthIcon() {
      let icon = 'fa-angle-right'
      if (this.getDiffMV > 0) {
        icon = 'fa-angle-up'
      } else if (this.getDiffMV < 0) {
        icon = 'fa-angle-down'
      }
      return icon
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
            'text': 'Stat',
            'value': 'stat',
            'sortable': false,
          },
          {
            'text': '',
            'value': 'value',
            'sortable': false,
          },
        ],
        values: [
          {
            'stat': 'Profit',
            'value': numeral(this.getDiffPurchasePrice).format('0,0')
          },
          {
            'stat': 'Growth to today',
            'value': numeral(this.getDiffMV).format('0,0')
          },
          {
            'stat': 'Current market value',
            'value': numeral(this.player.marketValue).format('0,0')
          },
          {
            'stat': 'Last market value',
            'value': numeral(this.getYesterdaysMV).format('0,0')
          },
          {
            'stat': 'Purchase price',
            'value': numeral(this.getPlayersPurchaseSum).format('0,0')
          },
          {
            'stat': 'Market value change since purchase',
            'value': numeral(this.getPlayersMarketValueChange).format('0,0')
          },
        ]
      }
    },
    getPosition() {
      return getPositionWording(this.player.position)
    },
    teamImage() {
      return getBundesligaClubImageUrlById(this.player.teamId)
    },
    getYesterdaysMV() {
      if (
        this.getPlayers[this.player.id]
        && this.getPlayers[this.player.id].marketValues
        && this.getPlayers[this.player.id].marketValues.length
        && this.getPlayers[this.player.id].marketValues.length > 3
      ) {
        return this.getPlayers[this.player.id].marketValues[this.getPlayers[this.player.id].marketValues.length - 2].m
      }
      return null
    },
    getDiffMV() {
      return getMarketValueGrowth(this.player.id)
    },
    getDiffPurchasePrice() {
      if (this.getPlayers[this.player.id] && this.getPlayers[this.player.id].leaguePlayer && this.player.offers) {
        return this.player.offers[0].price - this.getPlayers[this.player.id].leaguePlayer.buyPrice
      }
      return null
    },
    getPlayersMarketValueChange() {
      if (this.getPlayers[this.player.id] && this.getPlayers[this.player.id].leaguePlayer) {
        return this.getPlayers[this.player.id].leaguePlayer.marketValueChange
      }
      return null
    },
    getPlayersPurchaseSum() {
      if (this.getPlayers[this.player.id] && this.getPlayers[this.player.id].leaguePlayer) {
        return this.getPlayers[this.player.id].leaguePlayer.buyPrice
      }
      return null
    },
    genericInfoFieldColor() {
      return (this.$vuetify.theme.dark) ? '#ccc' : '#2A3B4D'
    },
    nextGameColor() {
      return (this.$vuetify.theme.dark) ? '#9b30ff' : '#5500a9'
    },
    nextMatchComputed() {
      return nextMatch(this.getMatches, this.player)
    },
    getLigainsiderLink() {
      if (this.getPlayers[this.player.id]) {
        if (this.getPlayers[this.player.id].ligainsiderId === undefined) {
          this.addPlayerLigainsiderId(this.player.id);
        }
        if (this.getPlayers[this.player.id].ligainsiderId) {
          return `https://www.ligainsider.de${this.getPlayers[this.player.id].ligainsiderId}`;
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
          status.icon = "fa-plus-square"
          status.color = "red"
          status.status = "verletzt"
          return status;
        default:
          status.icon = "fa-question"
          status.color = "orange";
          status.status = "??"
          return status;
      }
    },
  },
  methods: {
    ...mapMutations([
      "addPlayerLigainsiderId",
    ]),
    toggleStatistics() {
      if (this.statsCssClass === this.initStatsCssClass) {
        this.statsCssClass = null
      } else {
        this.statsCssClass = this.initStatsCssClass
      }
    },
    determinePlayerMetaWidth() {
      if (this.$refs.playerCardContent) {
        this.playerMetaWidth = this.$refs.playerCardContent.offsetWidth
      }
    },
  }
}
</script>