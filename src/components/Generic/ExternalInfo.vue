<template>
  <div class="external_info">
    <v-dialog 
      v-model="dialog" 
      fullscreen
      transition="dialog-bottom-transition"
      hide-overlay
      >
      <template v-slot:activator="{ on, attrs }">
        <span text v-bind="attrs" v-on="on">
          <slot></slot>
        </span>
      </template>
      <v-card>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="dialog = false">Close</v-btn>
        </v-card-actions>
        <v-divider></v-divider>
        <iframe :src="src"></iframe>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.external_info {
  display: inline;
}
</style>	

<script>
export default {
  props: {
    src: {
      type: String,
      required: true,
      default: "https://www.ligainsider.de",
    },
  },
  data() {
    return {
      dialog: false,
    };
  },
};
</script>