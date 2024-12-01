<template>
  <div class="OtherField">
    <UnoCard class="back-card" name="back" sm />
    <UnoCard class="back-card" name="back" sm />
    <UnoCard class="back-card" name="back" sm />
    <UnoCard class="back-card" name="back" sm />
  </div>
</template>

<script setup lang="ts">
import UnoCard from './Card.vue';
</script>

<style lang="scss" scoped>
.OtherField {
  & {
    display: flex;
    justify-content: center;
  }
  .back-card {
    margin-right: -80px;
  }
}
</style>
