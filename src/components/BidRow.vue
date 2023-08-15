<template>
  <player-card :class="{ 'own-bid': player.hasOwnBid, 'no-bid': player.hasNoBid, 'only': player.hasOnlySelfBid }"
    class="bid-row" :player="player" :show-purchase-statistic=false>
    <v-alert text width="100%" dense class="pa-0 px-2"
      :color="(isDarkTheme) ? 'deep-purple lighten-3' : 'deep-purple darken-4'" style="cursor: pointer"
      @click="toggleExpiryAsDateTime">
      <div style="font-size: x-small;" v-if="expiryAsDateTime === false">{{ expiryDate }}</div>
      <div style="font-size: x-small;" v-if="expiryAsDateTime === true">{{ expiryDateAsDateTime }}</div>
    </v-alert>
    <div class="flex justify-between items-center gap-0">
      <div class="w-2/12">
        <img v-if="player.userProfile" :src="player.userProfile" width="50px" height="50px" />
        <img v-else src="/assets/img/kickbase.png" width="50%" height="50%" class="mx-auto" />
      </div>
      <div class="w-8/12 p-2">
        <v-form @submit.prevent="dummySubmit">
          <div class="bid-input-container w-full">
            <vue-numeric-input :initialNumber="bidValue" :has-bid="(playerBid !== null)" :reset-call="resetCall" :min="1"
              align="center" :mousewheel=false v-on:input="setInputValue" v-on:input-reset="inputReset"
              v-on:submit="setInputValue" v-on:preview="preview" :placeholder="inputPlaceholder"></vue-numeric-input>
            <saved-alert :value="showSavedAlert" message="saved bid for player"></saved-alert>
          </div>
        </v-form>
      </div>
      <div class="w-2/12 p-2 text-3xl" :class="getRevokeButtonColor" @click="revokeBid">
        <i class="far fa-times-circle"></i>
      </div>
    </div>
    <div class="text-center w-full" style="font-size: xx-small;">
      <span v-if="getComputedBid !== 'no bid'">
        {{ getComputedDifference.number }} Euros
        &nbsp;<span
          :class="{ 'text-green-400': (getComputedDifference.number <= 0), 'text-red-400': (getComputedDifference.number > 0) }">{{
            getComputedDifference.percentage
          }}</span>
      </span>
    </div>

    <div class="flex justify-around items-center w-full">
      <div class="m-1 cursor-pointer" @click="decrementPercentBidCount"><i class="fas fa-angle-left"></i></div>
      <div class="m-1 cursor-pointer" @click="sendPercentageBid(-0.9)"><i class="fas fa-angle-double-left"></i></div>
      <div class="m-1 cursor-pointer" @click="sendPercentageBid(0)"><i class="far fa-dot-circle "></i></div>
      <div class="m-1 cursor-pointer" @click="incrementPercentBidCountBig"><i class="fas fa-angle-double-right "></i>
      </div>
      <div class="m-1 cursor-pointer" @click="incrementPercentBidCount"><i class="fas fa-angle-right "></i></div>
    </div>

    <template v-slot:extra-expansion-panel
      v-if="player.offers && player.offers.length && player.hasOnlySelfBid === false">
      <v-expansion-panel>
        <v-expansion-panel-header class="elevation-0">
          <v-icon class="mr-2 player-card-accordion__icon" color="green darken-1">fa-money-bill-wave</v-icon>
          <strong>{{ player.offers.length }}</strong> user bid on this player
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-simple-table class="mb-5 bid-table">
            <template>
              <tbody>
                <tr>
                  <th>
                    Name
                  </th>
                  <th>
                    Details
                  </th>
                </tr>
                <tr v-for="(offer, okey) in sortedOffers" :key="okey" :class="{ 'foo': offer.isSelf }">
                  <td>
                    <span v-if="offer.userName">{{ offer.userName }}</span>
                    <span v-else>KICKBASE</span>:
                  </td>
                  <td>
                    <span v-if="offer.userId != getSelf">
                      {{ getDate(offer.date) }}
                      <small> / has {{ getUsersPlayers(offer.userId) }} players</small>
                    </span>
                    <span v-else>
                      {{ offer.price | numeral('0,0 $') }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </template>

  </player-card>
</template>

<script>
import api from '../api/api'
import { mapGetters } from 'vuex'
import debounce from "lodash.debounce";

import moment from 'moment'
import numeral from 'numeral'

numeral.locale('deff')

import PlayerCard from './Player/PlayerCard'
import VueNumericInput from './Generic/NumericInput'
import SavedAlert from './Generic/SavedAlert'
import { sleep, getBundesligaClubImageUrlById, getPositionWording } from "@/helper/helper";

const lastDayChangesClassConst = 'hidden-sm-and-down'

export default {
  props: {
    player: {
      type: Object,
      required: true
    },
  },
  components: {
    PlayerCard,
    VueNumericInput,
    SavedAlert,
  },
  data() {
    return {
      playerBid: null,
      playerBidRepresentation: null,
      options: {
        responsive: false,
        maintainAspectRatio: false
      },
      calcPercent: 0.0096,
      calc05Percent: 0.005,
      calc03Percent: 0.003,
      calcPercentSafe: 0.009,
      previewValue: null,
      lastDayChangesClass: '',
      selectedBidStep: 1,
      debouncedCallback: null,
      showSavedAlert: false,
      inputValue: null,
      triggeredByEnterKey: false,
      resetCall: false,
      toggledExpiryDate: false,
      expiryAsDateTime: false,
      expiryTimer: null,
      bidButtons: [
        -0.9,
        0,
      ]
    }
  },
  mounted() {
    this.lastDayChangesClass = lastDayChangesClassConst
    const offers = this.player.offers
    if (offers && offers.length) {
      offers.forEach((offer) => {
        if (offer.userId * 1 === this.$store.getters.getSelf) {
          this.playerBid = offer.price
        }
      })
    }
    this.debouncedCallback = debounce((...args) => {
      if (typeof args[0] === 'function') {
        args[0]()
      }
    }, 1000);

    this.expiryAsDateTime = (this.getTransfermarketExpiryDisplayType === 'timestamp')

    if (this.getTransfermarketExpiryDateFadeEffect === true) {
      this.expiryTimer = setInterval(() => {
        if (this.toggledExpiryDate) {
          clearInterval(this.expiryTimer)
        } else {
          this.expiryAsDateTime = !this.expiryAsDateTime
        }
      }, 7000);
    }
  },
  watch: {
    inputValue(newValue) {
      this.debouncedCallback(() => {
        if (newValue === this.inputValue && newValue !== null && this.triggeredByEnterKey === false) {
          this.sendForm()
        }
      });
    }
  },
  computed: {
    ...mapGetters([
      'getSelf',
      'getPlayers',
      'getUsers',
      'getBids',
      'getTransfermarketExpiryDisplayType',
      'getTransfermarketExpiryDateFadeEffect',
    ]),
    bidValue() {
      return (this.playerBid ?? this.player.marketValue) * 1
    },
    inputPlaceholder() {
      return this.player.marketValue + ''
    },
    sortedOffers() {
      if (this.player.offers && this.player.offers.length) {
        const sortedOffers = [...this.player.offers]
        sortedOffers.sort((a, b) => {
          const aIsOwnBid = a.userId * 1 === this.getSelf
          const bIsOwnBid = b.userId * 1 === this.getSelf

          if (aIsOwnBid) {
            a.isSelf = true
            return -1
          }

          if (bIsOwnBid) {
            b.isSelf = true
            return 1
          }

        })

        return sortedOffers
      }

      return []
    },
    foreignOffers() {
      return this.sortedOffers.filter((offer) => offer.userId * 1 !== this.getSelf)
    },
    expiryDate() {
      const m = moment().subtract(this.player.expiry, 'seconds')
      return m.toNow()
    },
    expiryDateAsDateTime() {
      const m = moment().add(this.player.expiry, 'seconds')
      const format = m.isSame(moment(), 'day') ? 'HH:mm:ss a' : 'HH:mm:ss a (DD.MM.YY)'
      return m.format(format)
    },
    getComputedPrice() {
      return numeral(this.player.price).format('0,0')
    },
    getValidBidNumber() {
      return this.inputValue ?? this.playerBid
    },
    getBidNumber() {
      let calcBid = this.getValidBidNumber
      if (this.previewValue && !calcBid) {
        calcBid = this.previewValue
      }
      return calcBid * 1
    },
    getComputedBid() {
      let calcBid = this.getBidNumber
      return (calcBid) ? numeral(calcBid).format('0,0') : 'no bid'
    },
    getComputedDifference() {
      const calcBid = this.getBidNumber

      const number = (calcBid) ? numeral(calcBid - this.player.price).format('+0,0') : 'no bid'
      const c = (calcBid - this.player.price) / this.player.price * 100
      const percentage = numeral(Number.parseFloat(c).toPrecision(2) / 100).format('+0.0%')

      return {
        number,
        percentage
      }
    },
    isDarkTheme() {
      return this.$vuetify.theme.dark
    },
    getRevokeButtonColor() {
      let revokeButtonColor = 'text-gray-500 cursor-not-allowed';
      if(this.player.hasOwnBid){
        revokeButtonColor = this.isDarkTheme ? 'text-red-400 cursor-pointer' : 'text-red-800 cursor-pointer';
      } else {
        revokeButtonColor = this.isDarkTheme ? 'text-white cursor-not-allowed' : revokeButtonColor;
      }
      return revokeButtonColor;
    },
    getLastChanges() {
      if (this.getPlayers[this.player.id]) {
        const mv = this.getPlayers[this.player.id].marketValues //.sort((a, b) => (a.d > b.d) ? -1 : 1)
        const values = {
          labels: [],
          datasets: [
            {
              label: 'market value',
              // backgroundColor: '#f87979',
              data: []
            }
          ]
        }
        for (let y = mv.length; y >= (mv.length - 21); y--) {
          if (mv[y]) {
            const date = moment(mv[y].d)
            values.labels.push(date.format('DD MM'))
            values.datasets[0].data.push(mv[y].m)
          }
        }
        values.labels = values.labels.reverse()
        values.datasets[0].data = values.datasets[0].data.reverse()
        return values
      } else {
        return null
      }
    },
    getLastDayChanges() {
      const headers = [
        {
          'text': 'day',
          'value': 'day',
          'sortable': false,
        },
        {
          'text': 'change',
          'value': 'change',
          'sortable': false,
        }
      ];
      const mv = this.getLastChanges

      if (mv && mv.datasets && mv.datasets.length) {
        const values = mv.datasets[0].data.slice(0).reverse()
        const day7Value = (values[6]) ? numeral(values[0] - values[6]).format('0,0') : null
        const day14Value = (values[13]) ? numeral(values[0] - values[13]).format('0,0') : null

        if (day7Value === 0 || day14Value === 0) {
          return null
        }

        return {
          headers,
          values: [
            {
              'day': 'yesterday',
              'change': numeral(values[0] - values[1]).format('0,0')
            },
            {
              'day': '7 days change',
              'change': day7Value
            },
            {
              'day': '14 days change',
              'change': day14Value
            }
          ]
        }
      }
      return {
        headers
      }
    },
    getPosition() {
      return getPositionWording(this.player.position)
    },
    teamImage() {
      return getBundesligaClubImageUrlById(this.player.teamId)
    },
  },
  methods: {
    incrementPercentBidCountBig() {
      const percent = this.playerBid ? Math.round((this.playerBid / this.player.marketValue - 1) * 100) + 1 : 1
      this.sendPercentageBid(percent);
    },
    incrementPercentBidCount() {
      const percent = this.playerBid ? Math.round((this.playerBid / this.player.marketValue - 1) * 100 * 10) / 10 + 0.1 : 0.1
      this.sendPercentageBid(percent);
    },
    decrementPercentBidCount() {
      const percent = this.playerBid ? Math.round((this.playerBid / this.player.marketValue - 1) * 100 * 10) / 10 - 0.1 : - 0.1
      this.sendPercentageBid(percent);
    },
    toggleExpiryAsDateTime() {
      this.toggledExpiryDate = true
      this.expiryAsDateTime = !this.expiryAsDateTime
    },
    inputReset() {
      this.resetCall = false
    },
    dummySubmit() {
    },
    preview(previewValue) {
      this.previewValue = previewValue
    },
    setInputValue(payload) {
      if (payload.triggeredByEnterKey) {
        this.triggeredByEnterKey = true
        this.inputValue = payload.value
        this.sendForm()
      } else if (payload.focus === false) {
        this.inputValue = payload.value
      }
    },
    fetchData() {
      api.loadPlayersStats(this.player.id)
    },
    getDate(date) {
      const m = moment(date)
      return m.fromNow()
    },
    revokeBid() {
      let offer = null
      this.getBids.forEach((bid) => {
        if (bid.id === this.player.id && bid.offers && bid.offers.length) {
          bid.offers.forEach((offerObject) => {
            if (offerObject.userId * 1 === this.getSelf) {
              offer = offerObject
            }
          })
        }
      })

      if (offer) {
        api.revokeBid(this.player.id, offer.id, async () => {
          this.playerBid = null
          this.previewValue = null
          this.inputValue = null
          this.resetCall = true
          await sleep(100)
          this.resetCall = false
          await api.loadBids(false)
        })
      }
    },
    sendPercentageBid(percent) {
      this.playerBid = numeral(this.getPercentMVValue(percent)).format('0') * 1
      this.sendForm()
    },
    sendForm() {
      let bid = this.player.marketValue
      if (this.inputValue) {
        bid = this.inputValue
      } else if (this.playerBid) {
        bid = this.playerBid
      }
      api.sendBid(this.player.id, bid, async (data) => {
        if (data.offerId) {
          this.playerBid = bid
          this.inputValue = null
          this.previewValue = null
          this.showSavedAlert = true
          this.triggeredByEnterKey = false
          await api.loadBids(false)
          await sleep(1500)
          this.showSavedAlert = false
        }
      }, false, async () => {
        this.triggeredByEnterKey = false
        this.playerBid = null
        this.inputValue = null
        this.resetCall = true
        this.previewValue = null
        await sleep(1500)
        this.resetCall = false
      })
    },
    getUsersPlayers(userId) {
      const users = this.getUsers
      return (
        users[userId] && users[userId].players && users[userId].players.length
      ) ? users[userId].players.length : 0
    },
    getPercentMVValue(percent) {
      return this.player.marketValue + (this.player.marketValue * percent / 100)
    },
    getPercentMVValueRepresentation(percent) {
      return numeral(this.getPercentMVValue(percent)).format('0,0')
    },
    getButtonLabel(percent) {
      let mvA = ''
      if (percent < 0) {
        mvA = percent + '%'
      } else if (percent > 0) {
        mvA = '+' + percent + '%'
      }

      return `<strong>MV${mvA}</strong>`
    }
  }
}
</script>