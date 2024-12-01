<template>
  <div class="Player">
    <CardPreviewModal ref="modal" />
    <PlayerField @click="handleClickCard" />
    <div class="user_actions">
      <div class="button draw">draw</div>
      <div class="button vno">vuo</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CardPreviewModal from './CardPreviewModal.vue';
import PlayerField from './Field.vue';
import { CardColor } from '../cardInfo';

import { ref } from 'vue';

const modal = ref<InstanceType<typeof CardPreviewModal> | null>(null);

const handleClickCard = (props: { name: string; color?: CardColor }) => {
  console.log('click Player', props.name, props.color);
  modal.value?.show();
};


</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Courgette&family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap');
.Player {
  & {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    position: relative;
  }
  .user_actions {
    & {
      position: absolute;
      display: flex;
      justify-content: center;
      gap: 10px;
      bottom: 20px;
      right: 0;
    }
    .button {
      & {
        padding: 10px;
        border-radius: 40%;
        cursor: pointer;
      }
      &:hover {
        transform: translate(-1px, -1px);
      }
    }
    .draw {
      color: white;
      background-color: gray;
    }
    .vno {
      font-family: "Courgette", cursive;
      font-weight: 400;
      font-style: normal;
      background-color: #beff81;
      color: black;
    }
  }
}
</style>
