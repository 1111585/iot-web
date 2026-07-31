import type { RouteRecordRaw } from 'vue-router'

export const iot: RouteRecordRaw[] = [
  {
    path: '/eventCenter',
    name: 'eventCenter',
    redirect: '/eventCenter/index',
    component: () => import('@/views/layout/index.vue'),
    meta: { title: '预警中心', icon: '' },
    children: [
      {
        path: 'index',
        name: 'eventCenterIndex',
        component: () => import('@/views/eventCenter/index.vue'),
        meta: { title: '预警中心', icon: '' }
      },
      {
        path: 'chart',
        name: 'eventCenterChart',
        component: () => import('@/views/eventCenter/views/chart.vue'),
        meta: { title: '预警统计', icon: '' }
      }
    ]
  },
  {
    path: '/deviceManage',
    name: 'deviceManage',
    redirect: '/deviceManage/aiBox',
    component: () => import('@/views/layout/index.vue'),
    meta: { title: '设备管理', icon: '' },
    children: [
      {
        path: 'aiBox',
        name: 'aiBox',
        component: () => import('@/views/deviceManage/aiBoxDevice/index.vue'),
        meta: { title: '算法服务器', icon: '' }
      },
      {
        path: 'detectDevice',
        name: 'detectDevice',
        component: () => import('@/views/deviceManage/detectDevice/index.vue'),
        meta: { title: '被监测的设备', icon: '' }
      },
      {
        path: 'senseDevice',
        name: 'senseDevice',
        component: () => import('@/views/deviceManage/senseDevice/index.vue'),
        meta: { title: '感知设备', icon: '' }
      }
    ]
  },
  {
    path: '/monitorCenter',
    name: 'monitorCenter',
    redirect: '/monitorCenter/index',
    component: () => import('@/views/layout/index.vue'),
    meta: { title: '监控中心', icon: '' },
    children: [
      {
        path: 'index',
        name: 'monitorCenterIndex',
        component: () => import('@/views/monitorCenter/index.vue'),
        meta: { title: '监控中心', icon: '' }
      }
    ]
  },
  {
    path: '/monitor-data',
    name: 'monitorData',
    redirect: '/monitor-data/index',
    component: () => import('@/views/layout/index.vue'),
    meta: { title: '智慧监测', icon: '', hideNavbar: true },
    children: [
      {
        path: 'index',
        name: 'monitorDataIndex',
        component: () => import('@/views/monitorData/index.vue'),
        meta: { title: '其他监测', icon: '' }
      }
    ]
  },
  {
    path: '/files',
    name: 'files',
    redirect: '/files/video',
    component: () => import('@/views/layout/index.vue'),
    children: [
      {
        path: 'video',
        name: 'filesVideo',
        component: () => import('@/views/files/video.vue'),
        meta: { title: '录像中心', icon: '' }
      }
    ]
  },
  {
    path: '/management',
    name: 'management',
    redirect: '/management/rules',
    component: () => import('@/views/layout/index.vue'),
    meta: { title: '系统管理', icon: '' },
    children: [
      {
        path: 'rules',
        name: 'managementRules',
        component: () => import('@/views/systemManage/rules/index.vue'),
        meta: { title: '规则配置', icon: '' }
      },
      {
        path: 'devices',
        name: 'managementDevices',
        component: () => import('@/views/systemManage/devices/index.vue'),
        meta: { title: '设备配置', icon: '' }
      },
      {
        path: 'systemLogs',
        name: 'managementSystemLogs',
        component: () => import('@/views/systemManage/logs/index.vue'),
        meta: { title: '系统日志', icon: '' }
      },
      {
        path: 'detectPoint',
        name: 'detectPoint',
        component: () => import('@/views/systemManage/detectPoint/index.vue'),
        meta: { title: '点位管理', icon: '' }
      },
      {
        path: 'area',
        name: 'managementArea',
        component: () => import('@/views/systemManage/area/index.vue'),
        meta: { title: '位置管理', icon: '' }
      },
      {
        path: 'user-access',
        name: 'userAccess',
        component: () => import('@/views/sys/userAccess/index.vue'),
        meta: { title: '用户访问限制', icon: '' }
      }
    ]
  },
  {
    path: '/connection',
    name: 'connection',
    redirect: '/connection/index',
    component: () => import('@/views/layout/index.vue'),
    meta: { title: '', icon: '' },
    children: [
      {
        path: 'index',
        name: 'connectionIndex',
        component: () => import('@/views/connection/index.vue'),
        meta: { title: '链路监测', icon: '' }
      }
    ]
  },
  {
    path: '/detail',
    name: 'detailPage',
    children: [
      {
        path: 'event',
        name: 'detailPageEvent',
        component: () => import('@/views/eventCenter/components/EventDetail.vue'),
        meta: { title: '预警详情', icon: '' }
      }
    ]
  },
  {
    path: '/chart/:page',
    name: 'chart',
    component: () => import('@/views/chart/index.vue'),
    meta: { title: '智慧监测', icon: '' }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    redirect: '/dashboard/devices',
    component: () => import('@/views/layout/index.vue'),
    children: [
      {
        path: 'devices',
        name: 'devices',
        component: () => import('@/views/dashboard/devices.vue'),
        meta: { title: '设备总览', icon: '' }
      }
    ]
  }
]
