<template>
  <div class="head-bar">
    <div class="head-bar-left">共 {{ total }} 条数据</div>
    <div class="head-bar-right">
      <slot name="right">
        <el-input
          v-if="!hideit.includes('keyword')"
          v-model="bindedKeyword"
          :placeholder="placeholder"
          :style="{ width: width }"
          suffix-icon="i-ep-search"
        ></el-input>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
interface Props {
  total?: number
  keyword?: string
  placeholder?: string
  width?: string
  hideit?: string
}
const props = withDefaults(defineProps<Props>(), {
  total: 0,
  keyword: '',
  width: '200px',
  placeholder: '请输入关键字',
  hideit: ''
})

const emit = defineEmits(['update:keyword'])

const bindedKeyword = computed({
  get: () => props.keyword,
  set: (val) => emit('update:keyword', val)
})
</script>

<style lang="scss" scoped>
.head-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0;
  &-left {
    font-size: 12px;
    color: #999999;
  }
  &-right {
    display: flex;
    align-items: center;
    margin-left: auto;
  }
}
</style>
