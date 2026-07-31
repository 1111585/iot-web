<template>
  <v-network-graph
    class="connection-graph"
    :nodes="nodes"
    :edges="data.edges"
    :layouts="data.layouts"
    :configs="configs"
    :event-handlers="eventHandlers"
  />
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import * as vNG from 'v-network-graph'
import { nodes as _nodes, edges, layouts } from '../utils'

const ACTIVE = '#00ee00'
const INACTIVE = '#ff0000'

const data = {
  nodes: _nodes,
  edges,
  layouts
}

const nodes = reactive(data.nodes)

const configs = vNG.defineConfigs({
  node: {
    normal: {
      radius: 16,
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
.connection-graph {
  height: 80vh;
}
</style>
