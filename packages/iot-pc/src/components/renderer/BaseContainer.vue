<template>
  <div class="app-container">
    <tab-panel v-model="tabBinding" :items="tabs">
      <div class="title" v-if="title">{{ title }}</div>
      <template #operation>
        <slot name="operation"></slot>
      </template>
    </tab-panel>
    <div class="table-container mt20">
      <tab-box v-model="boxBinding" :list="boxes" @on-select="onBoxClick" v-if="boxes">
        <template #box-table>
          <slot name="box-table"></slot>
        </template>
      </tab-box>
      <tag-panel :data="tags" @tag-click="onTagClick" v-if="tags" />
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import TabPanel from '@/components/base/tabPanel.vue'
import TagPanel from '@/components/TagPanel.vue'
import TabBox from '@/components/tabBox.vue'

type SN = string | number

/**
 * tab切换栏
 */
interface Tabs {
  title: string
  type: string
}
/**
 * 在页面上以气泡的形式展示，type代表不同底色的气泡
 */
interface Box {
  name: string
  alias?: string
  num: number
  value: string
  unit: string
  /** 底色 */
  type: 'primary' | 'success' | 'info' | 'warning' | 'danger' | string
}

/**
 * 在页面上大概以这种形式呈现：
 *
 * `
 * 媒体类型：视频  音乐  图片  文章  其他
 * 排序方式：热度  最新
 * `
 *
 * - 媒体类型：分类
 * - 右边的内容为可点击的标签
 */
interface Tag {
  title: string
  value: string // 字段名
  active: SN // 当前激活，对应绑定时list中的value
  list: { title: string; value: SN }[]
}

interface Props {
  title?: string
  box?: string
  boxes?: Box[]
  tabs?: Tabs[]
  tab?: string
  tag?: string
  tags?: Tag[]
}
interface Emits {
  (e: 'boxClick', box: Box): void
  (e: 'update:box', box: string): void
  (e: 'update:tab', tab: string): void
  (e: 'update:tag', tag: string): void
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const boxBinding = computed({
  get() {
    return props.box!
  },
  set(val) {
    emits('update:box', val)
  }
})

const tabBinding = computed({
  get() {
    return props.tab!
  },
  set(val) {
    emits('update:tab', val)
  }
})

function onBoxClick(item: Box) {
  console.log('[状态气泡]', item)
  emits('boxClick', item)
  emits('update:box', item.value)
}

function onTagClick(item: any) {
  emits('update:tag', item.value)
}

/** 合并状态气泡数值 */
function updateBoxItems(boxItems: any[], data: ARC.Res.Counts[]) {
  let total = 0

  data.forEach((item) => {
    const boxItem = boxItems.find((box) => box.value === item.name)
    if (boxItem) {
      boxItem.num = item.num
      total += item.num
    }
  })

  const totalBoxItem = boxItems.find((box) => box.value === 'total')
  if (totalBoxItem) {
    totalBoxItem.num = total
  }
}

defineExpose({ updateBoxItems })
</script>

<style lang="scss" scoped>
.table-container {
  padding: 0 12px !important;
}

.title {
  padding: 20px 0 10px 0;
  font-size: 18px;
  font-weight: 700;
  color: #333333;
}
</style>
