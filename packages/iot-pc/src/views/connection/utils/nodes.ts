import type { Nodes, Edges, Layouts } from 'v-network-graph'

const nodes: Nodes = {
  node1: { active: true, name: '172.168.1.1\n海康摄像头A' },
  node2: { active: true, name: '172.168.1.2\n视频流处理服务器' },
  node3: { active: true, name: '172.168.1.3\nAI算法盒子' },
  node4: { active: true, name: '172.168.1.4\n管理后台' },
  node5: { active: false, name: '172.168.1.5\nAI算法盒子001' },
  node6: { active: true, name: '172.168.1.6\n红外摄像头' },
  node7: { active: true, name: '172.168.1.7\n海康红外摄像头' },
  node8: { active: true, name: '172.168.1.8\n海康摄像头B' },
  node9: { active: true, name: '172.168.1.9\n可见光摄像头' }
}

const edges: Edges = {
  edge1: { source: 'node1', target: 'node3' },
  edge2: { source: 'node2', target: 'node3' },
  edge3: { source: 'node3', target: 'node4' },
  edge4: { source: 'node5', target: 'node4' },
  edge5: { source: 'node6', target: 'node4' },
  edge6: { source: 'node7', target: 'node2' },
  edge7: { source: 'node8', target: 'node3' },
  edge8: { source: 'node9', target: 'node5' }
}

const layouts: Layouts = {
  nodes: {
    node1: { x: 0, y: 0 },
    node2: { x: 0, y: 160 },
    node3: { x: 80, y: 80 },
    node4: { x: 240, y: 80 },
    node5: { x: 320, y: 0 },
    node6: { x: 320, y: 160 },
    node7: { x: 0, y: 260 },
    node8: { x: 0, y: 80 },
    node9: { x: 420, y: 0 }
  }
}

export { nodes, edges, layouts }
