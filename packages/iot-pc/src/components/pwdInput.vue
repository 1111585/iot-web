<template>
  <ElInput :type="!show ? 'password' : 'text'" clearable>
    <template #prefix v-if="$slots.prefix">
      <slot name="prefix"></slot>
    </template>
    <template #suffix>
      <div class="mr10 handle action" @click="show = !show">
        <SvgIcon :icon-class="show ? 'view-close' : 'view-open'"></SvgIcon>
      </div>
    </template>
  </ElInput>
</template>

<script lang="ts" setup>
const show = ref(false)
</script>
<style lang="scss" scoped>
.action {
  user-select: none;
}
</style>
