<template>
  <div class="inline">
    <v-dialog 
      v-model="dialog" 
      fullscreen
      transition="dialog-bottom-transition"
      hide-overlay
      >
      <template v-slot:activator="{ on, attrs }">
        <span text v-bind="attrs" v-on="on">
          <slot name="placeholder"></slot>
        </span>
      </template>
      <v-card>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="dialog = false">Close</v-btn>
        </v-card-actions>
        <v-divider></v-divider>
       <slot></slot>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dialog: false,
    };
  },
};
</script>