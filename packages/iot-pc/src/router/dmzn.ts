import type { RouteRecordRaw } from 'vue-router'

export const dmzn: RouteRecordRaw[] = [
  {
    path: '/devices',
    name: 'devices',
    component: () => import('@/views/layout/index.vue'),
    children: [
      {
        path: '',
        name: 'devicesIndex',
        component: () => import('@/views/_dmzn/devices/index.vue'),
        meta: { title: '设备列表', icon: '' }
      }
    ]
  }
]
