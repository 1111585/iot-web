<template>
  <div class="connectedness-dot">
    <div class="status-dot" :class="enabled ? 'online' : 'offline'" @click="onDotClick()"></div>
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      append-to-body
      draggable
      destroy-on-close
    >
      <main>
        <!-- 节点图 -->
        <section class="section-node">
          <v-network-graph
            :nodes="nodes"
            :edges="data.edges"
            :layouts="data.layouts"
            :configs="configs"
            :event-handlers="eventHandlers"
          />
        </section>
        <!-- 诊断状态文案 -->
        <section class="section-text">
          <div class="section-title">开始诊断</div>
          <div
            v-for="item in sectionText"
            :key="item.text"
            :class="item.type"
            class="section-text-item"
          >
            {{ item.text }}
          </div>
        </section>
      </main>
      <template #footer>
        <div class="dialog-footer">
          <el-button>重新测试</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import * as vNG from 'v-network-graph'
import type { Nodes, Edges, Layouts } from 'v-network-graph'

interface Props {
  enabled: boolean
  dialogTitle?: string
}

interface SectionText {
  text: string
  type: string
  alias?: string
}

const props = withDefaults(defineProps<Props>(), {
  dialogTitle: '诊断'
})

const dialog = reactive({
  visible: false,
  title: ''
})

const sectionText = ref<SectionText[]>([])

function updateSectionText() {
  let timer: any
  const fakeData = [
    { text: '摄像头正常', type: 'success', alias: '' },
    { text: '端口协议正常', type: 'success', alias: '' },
    { text: '网络连接不稳定', type: 'danger', alias: '' },
    { text: '网络链路正常', type: 'success', alias: '' }
  ]
  timer = setInterval(() => {
    const fakeItem = fakeData.pop()
    if (fakeItem) {
      sectionText.value.push(fakeItem)
    } else {
      clearInterval(timer)
    }
  }, 1000)
}

function onDotClick() {
  dialog.visible = true
}

onMounted(() => {
  dialog.title = props.dialogTitle
  updateSectionText()
})

const _nodes: Nodes = {
  node1: { active: true, name: '172.168.1.1\n红外摄像头' },
  node2: { active: true, name: '172.168.1.26\nAI算法盒子' },
  node3: { active: true, name: '172.168.1.27\n管理服务器' },
  node4: { active: false, name: '172.168.1.28\n可见光摄像头' }
}

const edges: Edges = {
  edge1: { source: 'node1', target: 'node2' },
  edge2: { source: 'node2', target: 'node3' },
  edge3: { source: 'node3', target: 'node4' }
}

const layouts: Layouts = {
  nodes: {
    node1: { x: 0, y: 0 },
    node2: { x: 160, y: 0 },
    node3: { x: 320, y: 0 },
    node4: { x: 480, y: 0 }
  }
}

const data = {
  nodes: _nodes,
  edges: edges,
  layouts: layouts
}

const ACTIVE = '#00ee00'
const INACTIVE = '#ff0000'

const nodes = reactive(data.nodes)

const configs = vNG.defineConfigs({
  node: {
    normal: {
      radius: 10,
      color: '#aaaaaa'
    },
    hover: {
      color: '#bbbbbb'
    },
    label: {
      visible: true
    }
  },
  edge: {
    normal: {
      width: 2,
      color: '#888888',
      dasharray: (edge) => (nodes[edge.source].active && nodes[edge.target].active ? 4 : 0),
      animate: (edge) => nodes[edge.source].active && nodes[edge.target].active
    },
    hover: {
      color: '#222222'
    },
    margin: 2,
    marker: {
      source: {
        type: 'circle',
        width: 5,
        height: 5,
        margin: 1,
        color: ([edge, _stroke]) => (nodes[edge.source].active ? ACTIVE : INACTIVE)
      },
      target: {
        type: 'circle',
        width: 5,
        height: 5,
        margin: 1,
        color: ([edge, _stroke]) => (nodes[edge.target].active ? ACTIVE : INACTIVE)
      }
    }
  }
})

const eventHandlers: vNG.EventHandlers = {
  'node:click': ({ node }) => {
    // toggle
    nodes[node].active = !nodes[node].active
  }
}
</script>

<style lang="scss" scoped>
.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  cursor: pointer;
  &.online {
    background-color: var(--el-color-success);
  }
  &.offline {
    background-color: var(--el-color-danger);
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-start;
}

.section {
  &-node {
    height: 120px;
  }
  &-text {
    height: 200px;
    &-item {
      margin-bottom: 1em;
      text-indent: 2em;
    }
  }
  &-title {
    padding: 14px;
  }
}
</style>
