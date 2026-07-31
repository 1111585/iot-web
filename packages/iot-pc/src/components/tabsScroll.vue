<template>
  <div class="tab-scorll" v-if="items && items.length > 0">
    <ElAffix @scroll="onScroll" style="background-color: var(--el-color-white)">
      <ElTabs class="pl25" v-model="tabsData.tabsIndex" @tab-click="handleClick">
        <ElTabPane v-for="(item, key) in items" :key="key" :label="item.label" :name="item.value" />
      </ElTabs>
    </ElAffix>
    <div id="contentInfo">
      <slot name="content"></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { openStore } from '@/store'
import { ElMessage } from 'element-plus'
type itemsType = {
  label: string
  value: string
}
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  items: {
    type: Array<itemsType>,
    default: []
  },
  //tabs内容模块指定相同类名或id
  class: {
    type: String,
    default: ''
  },
  //滚动高度偏差高度
  biasHeight: {
    type: String,
    default: ''
  }
})
const tabsData = reactive({
  tabsIndex: props.modelValue || props.items[0]?.value,
  contentDiv: <any>[],
  class: props.class,
  biasHeight: props.biasHeight || 0,
  isScroll: true,
  timer: null as any
})
onMounted(() => {
  tabsData.contentDiv = document.querySelectorAll(`#contentInfo ${tabsData.class}`)
})
const emit = defineEmits(['update:modelValue', 'onTabClick'])
const timer = () => {
  tabsData.timer = setTimeout(() => {
    tabsData.isScroll = true
  }, 2000)
}
const handleClick = (tab: any) => {
  if (tabsData.contentDiv[tab.index]?.offsetTop) {
    tabsData.isScroll = false
    openStore().SET_CONTENT_SCROLLTOP(
      tabsData.contentDiv[tab.index].offsetTop - Number(tabsData.biasHeight)
    )
    timer()
  } else {
    ElMessage.warning('暂无数据！')
  }
  emit('onTabClick', tab)
}
const scrollTops = computed(() => {
  const arr = [] as Array<number>
  tabsData.contentDiv.forEach((item) => {
    arr.push(item.offsetTop - Number(tabsData.biasHeight))
  })
  return arr
})
const onScroll = (value) => {
  if (tabsData.isScroll) {
    scrollTops.value.forEach((item, index) => {
      if (scrollTops.value[index + 1]) {
        if (value.scrollTop >= item && value.scrollTop < scrollTops.value[index + 1]) {
          tabsData.tabsIndex = props.items[index]?.value
        }
      } else {
        if (value.scrollTop >= item) {
          tabsData.tabsIndex = props.items[index]?.value
        }
      }
    })
  }
}
onUnmounted(() => {
  if (tabsData.timer) {
    clearTimeout(tabsData.timer)
    tabsData.timer = null
  }
})
</script>

<style lang="scss" scoped>
:deep(.el-tabs__nav) {
  margin: 10px 0px 0px 25px;
}
:deep(.el-tabs__header) {
  margin: 0;
  height: unset;
}
:deep(.el-tabs__nav-wrap) {
  background-color: white;
}
</style>
