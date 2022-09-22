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
      1: {
        name: 'Borussia Dortmund',
        ligainsiderUrl: '/borussia-dortmund/14/'
      },
      2: {
        name: 'Borussia Dortmund',
        ligainsiderUrl: '/borussia-dortmund/14/'
      },
      4: {
        name: 'Borussia Dortmund',
        ligainsiderUrl: '/borussia-dortmund/14/'
      },
      5: {
        name: 'Borussia Dortmund',
        ligainsiderUrl: '/borussia-dortmund/14/'
      },
      6: {
        name: 'Borussia Dortmund',
        ligainsiderUrl: '/borussia-dortmund/14/'
      },
      7: {
        name: 'Borussia Dortmund',
        ligainsiderUrl: '/borussia-dortmund/14/'
      },
      9: {
        name: 'Borussia Dortmund',
        ligainsiderUrl: '/borussia-dortmund/14/'
      },
      10: {
        name: 'Borussia Dortmund',
        ligainsiderUrl: '/borussia-dortmund/14/'
      },
      11: {
        name: 'Borussia Dortmund',
        ligainsiderUrl: '/borussia-dortmund/14/'
      },
      12: {
        name: 'Borussia Dortmund',
        ligainsiderUrl: '/borussia-dortmund/14/'
      },
      13: {
        name: 'Borussia Dortmund',
        ligainsiderUrl: '/borussia-dortmund/14/'
      },
      14: {
        name: 'Borussia Dortmund',
        ligainsiderUrl: '/borussia-dortmund/14/'
      },
      15: {
        name: 'Borussia Dortmund',
        ligainsiderUrl: '/borussia-dortmund/14/'
      },
      16: {
        name: 'Borussia Dortmund',
        ligainsiderUrl: '/borussia-dortmund/14/'
      },
      17: {
        name: 'Borussia Dortmund',
        ligainsiderUrl: '/borussia-dortmund/14/'
      },
      18: {
        name: 'Borussia Dortmund',
        ligainsiderUrl: '/borussia-dortmund/14/'
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