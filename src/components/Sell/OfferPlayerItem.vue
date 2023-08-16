<template>
  <player-card :class="[...getPlayerCardCssClasses()]" :player="player" v-if="show">
    <v-card v-for="offer in player.offers" :key="offer.id" class="mb-6 elevation-0 offer"
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
          <div class="w-full border text-center">{{ getOffer(offer) }}</div>
          <div class="flex justify-between" style="font-size: xx-small;">
            <span :class="(isAnHighOffer(offer)) ? 'profit-info--green' : 'profit-info--red'">
              Offer: {{ calcOffer(offer, player.marketValue) | numeral('0,0 $') }} ({{ percent(offer) }}%)
            </span>
            <span :class="(profit(offer) > 1) ? 'profit-info--green' : 'profit-info--red'">
              Profit: {{ profit(offer) | numeral('0,0 $') }}
            </span>
          </div>
        </div>
        <div class="w-2/12 p-2 text-3xl">
          <accept-button v-if="offerExpired(offer) === false" :offer="offer" :player="player"
            :is-high-offer="isAnHighOffer(offer)" v-on:acceptOffer="acceptOffer"></accept-button>
          <div @click="removePlayerFromMarket(player)">
            <i class="far fa-times-circle"></i>
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
import { isHighOffer, getCalcOffer, getPercent, offerIsExpired } from "@/helper/helper";

export default {
  name: "offer-player-item",
  components: {
    PlayerCard,
    AcceptButton,
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