<template>
  <div id="add-button" class="buttons full-length">
    <b-button
      rounded
      size="is-medium"
      icon-left="book-plus"
      type="is-success is-light"
      class="full-length"
      @click="addBookmarkCallback"
    >
      Add bookmark
    </b-button>
  </div>
</template>

<script>
export default {
  props: ["addBookmarkCallback"],
};
</script>