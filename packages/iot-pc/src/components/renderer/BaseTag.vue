<template>
  <el-tag :type="data.type">{{ data.text }}></el-tag>
</template>

<script setup lang="ts">
interface Tag {
  text: string
  type: 'primary' | 'success' | 'danger' | 'warning'
}
interface Props {
  data: Tag
}

defineProps<Props>()
</script>

<style scoped></style>
