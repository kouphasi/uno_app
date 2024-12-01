<template>
  <div class="card" :class="[color]" @click="onClick">
    <img class="img" :src="cardImages[props.name].img" alt="" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cardImages, CardColor } from './cardInfo.ts';

const props = defineProps<{
  name: string
  color?: CardColor
}>()

const emit = defineEmits<{(e: 'click', props: {name: string; color?: CardColor}):void;}>();
const onClick = () => {
  emit('click', {name: props.name, color: props.color});
}

const color = computed(() => cardImages[props.name].hasColor ? props.color : null)
</script>

<style lang="scss" scoped>
.card {
  & {
    width: 100px;
    height: 150px;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 10px;
    background-color: white;
  }
  &[sm] {
    width: 75px;
    height: 105px;
  }
  .img {
    width: 100%;
    height: 100%;
  }
  &.red {
    background-color: rgb(255, 136, 136);
  }
  &.blue {
    background-color: rgb(136, 136, 255);
  }
  &.green {
    background-color: rgb(92, 206, 92);
  }
  &.yellow {
    background-color: rgb(241, 241, 117);
  }
}
</style>
