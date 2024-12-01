<template>
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <div class="">{{ 'a'.repeat(100) }}</div>
  <router-link :to="{name: 'field'}">ゲーム画面にfafa</router-link>
</template>

<script setup lang="ts">
</script>

<style lang="scss" scoped>
</style>
