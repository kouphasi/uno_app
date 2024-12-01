<template>
  <Teleport to='body'>
    <transition name="fade">
      <div v-if="visible" class="BaseModal" @click="hide">
        <div class="modal-content" @click.stop>
          <slot></slot>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, defineExpose } from 'vue';
const visible = ref(false);

const emits = defineEmits<{
  (e: 'beforeOpen', modalEvents: {abort: () => void}): void;
  (e: 'beforeClose', modalEvents: {abort: () => void}): void;
}>();

const show: () => void = () => {
  let abort = false;
  emits('beforeOpen', {abort: () => abort = true});
  if (!abort) visible.value = true;
};
const hide: ()=>void = () => {
  let abort = false;
  emits('beforeClose', {abort: () => abort = true});
  if (!abort) visible.value = false;
};

defineExpose({
  show,
  hide
});
</script>

<style lang="scss" scoped>
.BaseModal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  .modal-content {
    background-color: white;
  }
}
</style>
