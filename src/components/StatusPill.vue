<template>
  <span class="status-pill">
    <v-alert v-if="player.status === 0" dense text icon="fa-thumbs-up" type="success">
      fit
    </v-alert>
    <v-alert v-else-if="player.status === 1" dense text icon="fa-plus-square" color="red">
      injured
    </v-alert>
    <v-alert
      v-else-if="player.status === 2"
      dense
      text
      :color="orange"
      icon="fa-user-injured"
      class="is-stricken"
    >
      stricken
    </v-alert>
    <v-alert v-else-if="player.status === 4" dense text icon="fa-dumbbell" color="orange">
      recover training
    </v-alert>
    <v-alert v-else-if="player.status === 8" dense text icon="fa-times-circle" color="red">
      red card
    </v-alert>
    <v-alert
      v-else-if="player.status === 16"
      dense
      text
      icon="fa-times-circle"
      :color="orange"
      class="is-stricken"
    >
      second yellow card
    </v-alert>
    <v-alert
      v-else-if="player.status === 32"
      dense
      text
      icon="fa-times-circle"
      :color="orange"
      class="is-stricken"
    >
      5th yellow card
    </v-alert>
    <v-alert
      v-else-if="player.status === 64"
      dense
      text
      icon="fa-ghost"
      color="this.$vuetify.theme.dark ? #ccc' : '#2A3B4D'"
    >
      not in team
    </v-alert>
    <v-alert
      v-else-if="player.status === 128"
      dense
      text
      icon="fa-suitcase"
      color="this.$vuetify.theme.dark ? #ccc' : '#2A3B4D'"
    >
      left the league
    </v-alert>
    <v-alert
      v-else-if="player.status === 256"
      dense
      text
      icon="fa-suitcase"
      color="this.$vuetify.theme.dark ? #ccc' : '#2A3B4D'"
    >
      away
    </v-alert>
    <v-alert v-else dense text icon="fa-question" type="info"> unsupported status </v-alert>
  </span>
</template>

<script>
export default {
  name: 'StatusPill',
  props: {
    player: {
      type: Object,
      required: true,
    },
  },
  computed: {
    orange() {
      return this.$vuetify.theme.dark ? 'orange lighten-4' : 'orange darken-3'
    },
  },
}
</script>
