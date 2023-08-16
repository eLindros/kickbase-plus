<template>
  <player-card :class="[...getPlayerCardCssClasses()]" :player="player" v-if="show">
    <v-card v-for="offer in player.offers" :key="offer.id" class="offer"
      :class="[...getOfferCssClasses(offer)]">
      <v-alert text dense class="pa-0 px-2 w-full" style="font-size: x-small;"
        :color="(isDarkTheme) ? 'deep-purple lighten-3' : 'deep-purple darken-4'">
        {{ offer.validUntilDate | expiry }}
        <span style="font-size: x-small;" v-if="!offerExpired(offer)">expires</span>
        <span style="font-size: x-small;" v-if="offerExpired(offer)">expired</span>
      </v-alert>
      <div class="flex justify-between items-center gap-0">
        <div class="w-2/12">
          <img v-if="offer.userProfile" :src="offer.userProfile" width="40px" />
          <img v-else src="/assets/img/kickbase.png" width="40px" class="mx-auto" />
        </div>
        <div class="w-8/12 p-2">
          <FullDialog>
            <template #placeholder>
              <div class="w-full border text-center">{{ getOffer(offer) }}</div>
              <div class="flex justify-between gap-0" style="font-size: xx-small;">
                <span :class="(isAnHighOffer(offer)) ? 'text-green-500' : 'text-red-500'">
                  <i :class="(calcOffer(offer, player.marketValue) > 0) ? 'fas fa-angle-up' : 'fas fa-angle-down'"></i> {{
                    calcOffer(offer, player.marketValue) | numeral('+0,0 $') }} ({{ percent(offer) }}%)
                </span>
                <span :class="(profit(offer) > 1) ? 'text-green-500' : 'text-red-500'">
                  <i class="fas fa-coins"></i> {{ profit(offer) | numeral('+0,0 $') }}
                </span>
              </div>
            </template>
            <v-data-table :headers="getPlayerStatistics.headers" :items="getPlayerStatistics.values"
              :hide-default-footer="true" class="elevation-1"></v-data-table>
          </FullDialog>
        </div>
        <div class="flex justify-start gap-2 w-2/12 text-xl">
          <accept-button v-if="offerExpired(offer) === false" :offer="offer" :player="player"
            :is-high-offer="isAnHighOffer(offer)" v-on:acceptOffer="acceptOffer"></accept-button>
          <div @click="removePlayerFromMarket(player)" class="cursor-pointer">
            <i class="fas fa-times text-red-600"></i>
          </div>
        </div>
      </div>
      <div class="expired-info" v-if="offerExpired(offer)">
        <v-icon color="white">fa-hourglass-end</v-icon>
        this offer expired {{ offer.validUntilDate | expiry }}
      </div>
    </v-card>
  </player-card>
</template>

<script>
import numeral from 'numeral'
import moment from 'moment'
import { mapGetters, mapMutations } from "vuex";

numeral.locale('deff')

import AcceptButton from './AcceptButton'
import PlayerCard from "../Player/PlayerCard";
import { isHighOffer, getCalcOffer, getPercent, getMarketValueGrowth, offerIsExpired } from "@/helper/helper";
import FullDialog from '../Generic/FullDialog.vue';

export default {
  name: "offer-player-item",
  components: {
    PlayerCard,
    AcceptButton,
    FullDialog
  },
  data: () => ({
  }),
  props: {
    player: {
      required: true,
      type: Object
    },
    showPlayerWithTooLowOffersOnly: {
      required: false,
      default: false,
      type: Boolean
    },
    hideMeta: {
      required: false,
      default: false,
      type: Boolean
    },
  },
  filters: {
    expiry: (validUntilDate) => {
      const m = moment(validUntilDate)
      return m.fromNow()
    }
  },
  computed: {
    ...mapGetters(['getSelf', 'getPlayersOfUser', 'getLeague', 'getPlayers', 'getOfferThreshold']),
    show() {
      return (!this.showPlayerWithTooLowOffersOnly || (this.showPlayerWithTooLowOffersOnly && this.player.hasLowOffer))
    },
    hidePlayerCardDetail() {
      return (!this.player.offers || (this.player.offers & this.player.offers.length === 0)) === true
    },
    isDarkTheme() {
      return this.$vuetify.theme.dark
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
    getPlayersPurchaseSum() {
      if (
        this.getPlayers[this.player.id] &&
        this.getPlayers[this.player.id].leaguePlayer
      ) {
        return this.getPlayers[this.player.id].leaguePlayer.buyPrice;
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
    getDiffMV() {
      return getMarketValueGrowth(this.player.id);
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
  },
  methods: {
    ...mapMutations(['addLoadingMessage', 'setLoading', 'resetLoading']),
    getPlayerCardCssClasses() {
      const classes = []

      if (this.player.hasExpiredOffers === true) {
        classes.push('offer--expired')
      }
      if (this.player.hasHighOffer === true) {
        classes.push('offer--high')
      }
      if (this.player.hasLowOffer === true) {
        classes.push('offer--low')
      }

      return classes
    },
    getOfferCssClasses(offer) {
      const classes = []
      if (this.offerExpired(offer)) {
        classes.push('offer--expired')
      } else if (this.isAnHighOffer(offer) === true) {
        classes.push('offer--high')
      } else if (this.isAnHighOffer(offer) === false) {
        classes.push('offer--low')
      }

      return classes
    },
    calcOffer(offer, marketValue) {
      return getCalcOffer(offer, marketValue)
    },
    percent(offer) {
      return getPercent(this.player, offer)
    },
    isAnHighOffer(offer) {
      return isHighOffer(this.player, offer, this.getOfferThreshold)
    },
    hasNonCPUOffers(offer) {
      return offer.offers.filter((o) => o.userName).length > 0
    },
    getOffer(offer) {
      return numeral(offer.price).format('0,0 $')
    },
    hasOffer(player) {
      return (player.offers && player.offers.length)
    },
    offerExpired(offer) {
      return offerIsExpired(offer)
    },
    profit(offer) {
      if (this.getPlayers[this.player.id] && this.getPlayers[this.player.id].leaguePlayer) {
        return offer.price - this.getPlayers[this.player.id].leaguePlayer.buyPrice
      }
      return null
    },
    removePlayerFromMarket(player) {
      if (this.player.hasHighOffer) {
        if (window.confirm('Add player "' + player.firstName + ' ' + player.lastName + '" to the transfer market again despite high offer?')) {
          this.setPlayerOnMarketAgain(player)
        }
      } else {
        this.setPlayerOnMarketAgain(player)
      }
    },

    async setPlayerOnMarketAgain(player) {
      this.$emit('setPlayerOnMarketAgain', player)
    },

    async acceptOffer(payload) {
      this.$emit('acceptOffer', payload)
    }
  }
}
</script>