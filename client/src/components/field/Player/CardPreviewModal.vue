<template>
  <BaseModal ref="modal">
    <UnoCard name="1" color="red" />
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from '../../shared/BaseModal.vue';
import UnoCard from '../Card.vue';
import { ref, defineExpose } from 'vue';

const modal = ref<InstanceType<typeof BaseModal> | null>(null);

defineExpose({
  show: () => {
    modal.value?.show();
  },
  hide: () => {
    modal.value?.hide();
  }
});
</script>

<style lang="scss" scoped>
</style>
