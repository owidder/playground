<template>
  <div :id="buttonId" class="buttons full-length">
    <b-button
      rounded
      size="is-small"
      :icon-left="buttonIcon"
      class="full-length"
      :outlined="true"
      @click="click"
    >
      {{ buttonText }}
    </b-button>
  </div>
</template>

<script>
export default {
  props: ["buttonId", "buttonIcon", "buttonText"],
  methods: {
    click() {
      this.$emit("click");
    },
  },
};
</script>