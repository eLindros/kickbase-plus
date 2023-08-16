<template>
  <div :class="{ 'high-offer': isHighOffer, 'low-offer': !isHighOffer }" @click="acceptOffer()">
    <i class="fa-solid fa-circle-check"></i>
  </div>
</template>
<script>

export default {
  name: 'accept-button-sell',
  components: {},
  props: {
    offer: {
      required: true,
      type: Object
    },
    player: {
      required: true,
      type: Object
    },
    isHighOffer: {
      required: false,
      type: Boolean,
      default: false,
    }
  },
  computed: {
    showNameInfo() {
      return (this.offer.userName)
    },
    username() {
      return (this.offer.userName) ? this.offer.userName : 'KICKBASE'
    },

    offerWording() {
      return (this.isHighOffer) ? 'high' : 'low'
    },
  },
  methods: {
    acceptOffer() {
      const msg = `Accept ${this.username}'s offer for player "${this.player.firstName} ${this.player.lastName}" ?`

      if (window.confirm(msg)) {

        const offer = {
          offerId: this.offer.id,
          playerId: this.player.id
        }

        this.$emit('acceptOffer', {
          offer
        })
      }
    }
  }
}
</script>