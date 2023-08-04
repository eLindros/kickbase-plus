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
        <div class="iframe_container">
        <iframe :src="src" width="800" height="600"></iframe>
				</div>
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