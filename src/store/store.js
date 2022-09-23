import Vue from 'vue'
import Vuex from 'vuex'

import getters from './getters'
import mutations from './mutations'
import actions from './actions'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    fetchedGift: null,
    giftBonus: 0,
    giftLevel: 0,
    errorMessage: null,
    authData: {},
    teams: {
      8: {
        name: 'FC Schalke 04',
        ligainsiderUrl: '/fc-schalke-04/13/'
      },
      3: {
        name: 'Borussia Dortmund',
        ligainsiderUrl: '/borussia-dortmund/14/'
      },
      40: {
        name: '1. FC Union Berlin',
        ligainsiderUrl: '/1-fc-union-berlin/1246/'
      },
      4: {
        name: 'Eintracht Frankfurt',
        ligainsiderUrl: '/eintracht-frankfurt/3/'
      },
      2: {
        name: 'FC Bayern München',
        ligainsiderUrl: '/fc-bayern-muenchen/1/'
      },
      5: {
        name: 'SC Freiburg',
        ligainsiderUrl: '/sc-freiburg/18/'
      },
      7: {
        name: 'Bayer 04 Leverkusen',
        ligainsiderUrl: '/bayer-04-leverkusen/4/'
      },
      9: {
        name: 'VfB Stuttgart',
        ligainsiderUrl: '/vfb-stuttgart/12/'
      },
      10: {
        name: 'SV Werder Bremen',
        ligainsiderUrl: '/sv-werder-bremen/2/'
      },
      11: {
        name: 'Vfl Wolfsburg',
        ligainsiderUrl: '/vfl-wolfsburg/16/'
      },
      13: {
        name: 'FC Augsburg',
        ligainsiderUrl: '/fc-augsburg/21/'
      },
      14: {
        name: 'TSG Hoffenheim',
        ligainsiderUrl: '/tsg-hoffenheim/10/'
      },
      15: {
        name: 'Borussia Mönchengladbach',
        ligainsiderUrl: '/borussia-moenchengladbach/5/'
      },
      18: {
        name: '1. FSV Mainz 05',
        ligainsiderUrl: '/1-fsv-mainz-05/17/'
      },
      20: {
        name: 'Hertha BSC Berlin',
        ligainsiderUrl: '/hertha-bsc/6/'
      },
      24: {
        name: 'Vfl Bochum',
        ligainsiderUrl: '/vfl-bochum/11/'
      }, 
      28: {
        name: '1. FC Köln',
        ligainsiderUrl: '/1-fc-koeln/15/'
      },
      43: {
        name: 'RB Leipzig',
        ligainsiderUrl: '/rb-leipzig/1311/'
      },         
    },
    bids: [],
    players: {},
    selectedPlayers: {},
    selectedPlayersMarketValueSum: 0,
    ligainsiderPlayers: [],
    users: {},
    liveData: {},
    loading: false,
    loadingMessages: [],
    leagues: [],
    league: null,
    self: null,
    selfData: null,
    selfPlayersStatsFetched: null,
    playersStatsFetched: {},
    bearerToken: '',
    ranking: null,
    defaults: {
      offerThreshold: .6,
      offerOrder: 'newest',
      offerOpenPlayerNotOnMarketPanel: true,
      offerOpenPlayerWithoutAnyOfferPanel: false,
      offerShowTooLowOffersOnly: false,
      offerOrders: {
        oldest: 'oldest first',
        newest: 'newest first'
      },
    },
    offerThreshold: null,
    offerShowTooLowOffersOnly: false,
    offerOpenPlayerNotOnMarketPanel: false,
    offerOpenPlayerWithoutAnyOfferPanel: false,
    offerOrder: {
      init: null,
      temporary: null,
    },
  },
  getters,
  mutations,
  actions,
})

export default store
