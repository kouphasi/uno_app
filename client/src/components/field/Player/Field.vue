<template>
  <div class="PlayerField">
    <UnoCard class="card" :style="{marginLeft: '-50px'}" name="2" color="red" @click="onClickCard"/>
    <UnoCard class="card" :style="{marginLeft: '-50px'}" name="3" color="blue" @click="onClickCard"/>
    <UnoCard class="card" :style="{marginLeft: '-50px'}" name="4" color="green" @click="onClickCard"/>
    <UnoCard class="card" :style="{marginLeft: '-50px'}" name="draw2" color="yellow" @click="onClickCard"/>
    <UnoCard class="card" :style="{marginLeft: '-50px'}" name="draw4" color="yellow" @click="onClickCard"/>
    <UnoCard class="card" :style="{marginLeft: '-50px'}" name="draw4" color="yellow" @click="onClickCard"/>
  </div>
</template>

<script setup lang="ts">
import UnoCard from '../Card.vue';
import { CardColor } from '../cardInfo';
const emit = defineEmits<{
  (e: 'click', props: {name: string; color?: CardColor}): void;
}>();
const onClickCard = ({name, color}: {name: string; color?: CardColor}): void => {
  console.log('click', name, color);
  emit('click', {name, color});
}

</script>

<style lang="scss" scoped>
.PlayerField {
  display: flex;
  justify-content: center;
  .card {
    &:hover {
      border: 2px solid black;
    }
  }
}
</style>
