<template>
  <div class="Field">
    <div class="others">
      <Other></Other>
      <Other></Other>
      <Other></Other>
      <Other></Other>
      <Other></Other>
      <Other></Other>
    </div>
    <div class="center">
      <UnoCard name="1" color="green" />
    </div>
    <Player></Player>
  </div>
</template>

<script setup lang="ts">
import Player from './Player/index.vue';
import Other from './Other.vue';
import UnoCard from './Card.vue';

</script>

<style lang="scss" scoped>
.Field {
  height: 100%;
  width: 100%;
  .others {
    display: flex;
    width: 100%;
    flex-wrap: wrap;
    gap: 120px;
  }
  .center {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }
}
</style>
