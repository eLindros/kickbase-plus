<template>
  <v-card outlined max-width="400" min-width="350" class="ml-5">
    <v-container class="pa-0 ma-0">
      <v-row no-gutters justify="start">
        <v-col class="flex-grow-1 flex-shrink-0" cols="4">
          <PlayerImage :player="this.player" />
        </v-col>
        <v-col class="d-flex flex-column justify-start align-start" cols="8" width="120px">
          <v-chip-group class="pa-0 ma-0">
            <v-chip x-small label class="mr-1">{{ player.number }}</v-chip>
            <v-chip x-small label class="mr-1">{{ getPosition }}</v-chip>
            <v-chip x-small label :color="getStatus.color"><v-icon dense x-small>{{ getStatus.icon }}</v-icon>
            </v-chip>
          </v-chip-group>
          <div class="d-flex flex-column align-end align-self-end pr-5">
            <div class="text-no-wrap overflow-hidden ma-0 pa-0 text-h5">
              <ExternalInfo :src="getLigainsiderLink">
                <span v-if="player.knownName">{{ player.knownName }}</span>
                <span v-else>{{ player.firstName }} {{ player.lastName }}</span>
              </ExternalInfo>
            </div>
            <div class="pa-0 ma-0 text-body-1">
              {{ getComputedPrice }} (MV)
            </div>
            <div :style="'color:' + getGrowthColor" class="pa-0 ma-0 text-caption">
              {{
                getDiffMV | numeral('0,0 $')
              }}
            </div>

          </div>
        </v-col>

      </v-row>
    </v-container>
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
      return numeral(this.player.price).format('0,0')
    },
    getGrowthColor() {
      let positive = '#2a5b2a'
      let negative = '#682828'
      if (this.$vuetify.theme.dark) {
        positive = '#afd3af'
        negative = '#e6b6b6'
      }
      let color = 'fa-caret-right'
      if (this.getDiffMV > 0) {
        color = positive
      } else if (this.getDiffMV < 0) {
        color = negative
      }
      return color
    },
    getGrowthIcon() {
      let icon = 'fa-caret-right'
      if (this.getDiffMV > 0) {
        icon = 'fa-caret-up'
      } else if (this.getDiffMV < 0) {
        icon = 'fa-caret-down'
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