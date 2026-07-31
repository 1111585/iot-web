<template>
  <div class="tab pl20 pr20">
    <div>
      <div class="title flex-box items-center content-between">
        <slot>
          <div class="f12 pt20 pb20 flex-box items-center">
            <ElIcon><i-ep-Location color="#666666" /></ElIcon
            ><span class="ml5 c666"
              >当前位置：{{ onelevelMenu.includes(title) ? title : curMenuTitle }}</span
            >
            <ElIcon size="12" color="#666666" class="ml5 mr5" v-show="!onelevelMenu.includes(title)"
              ><i-ep-ArrowRight /> </ElIcon
            ><span v-show="!onelevelMenu.includes(title)">{{ title }}</span>
          </div>
        </slot>
        <div v-if="!hasItems">
          <div class="operation flex-box">
            <slot name="operation"></slot>
          </div>
        </div>
      </div>
      <div class="flex-box items-center content-between" v-if="hasItems">
        <div>
          <el-tabs v-model="selected" @tab-change="handleClick">
            <el-tab-pane
              v-for="(item, key) in items"
              :key="key"
              :label="item.title"
              :name="item.type"
            />
          </el-tabs>
        </div>
        <div class="operation flex-box mb7">
          <slot name="operation"></slot>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { sysStore } from '@/store'
interface TabItemProps {
  title: string
  type: string
}
const curMenuTitle = computed(() => sysStore().curMenuTitle)
const props = withDefaults(
  defineProps<{
    items?: Array<TabItemProps> | any
    modelValue?: string
    title?: string | object
  }>(),
  {
    items: () => []
  }
)
const emits = defineEmits(['tabClick', 'update:modelValue'])
const route = useRoute()
const title = computed(() => {
  return props.title ? props.items[selected.value].title : route.meta.title
})
const onelevelMenu = ['站内消息']
const selected = ref(props.modelValue ?? props.items[0]?.type ?? '')
const handleClick = () => {
  emits('update:modelValue', selected.value)
  emits('tabClick', selected.value)
}
const hasItems = computed(() => {
  return props.items && props.items.length > 0
})
</script>
<style lang="scss" scoped>
.tab {
  position: relative;
  width: 100%;
  min-height: 32px;
  background-color: #fff;
  border-bottom: 1px solid var(--el-border-color-base);

  :deep(.el-tabs__item.is-active) {
    font-weight: 600;
  }

  :deep(.el-tabs__header) {
    margin: 0;
  }

  :deep(.el-tabs__active-bar) {
    height: 3px;
  }

  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }
}
</style>
