<template>
  <FullDialog>
    <template v-slot:placeholder>
      <slot></slot>
    </template>
    <div class="iframe_container">
      <iframe :src="src" width="800" height="600"></iframe>
    </div>
  </FullDialog>
</template>

<script>
import FullDialog from './FullDialog.vue';

export default {
  components: {
    FullDialog,
  },
  props: {
    src: {
      type: String,
      required: true,
      default: "https://www.ligainsider.de",
    },
  },
};
</script>