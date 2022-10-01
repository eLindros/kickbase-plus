<template>
  <div class="text-center">
    <v-dialog v-model="dialog" fullscreen hide-overlay>
      <template v-slot:activator="{ on, attrs }">
        <v-btn color="primary" text v-bind="attrs" v-on="on">
          <slot></slot>
        </v-btn>
      </template>
      <v-card>
        <v-card-actions>
          <v-btn color="primary" text @click="dialog = false"> Close </v-btn>
        </v-card-actions>
        <v-divider></v-divider>
        <iframe :src="src"></iframe>
      </v-card>
    </v-dialog>
  </div>
</template>
	
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