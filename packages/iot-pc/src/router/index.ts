import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { dmzn } from './dmzn'
import { iot } from './iot'
import permission from './permission'
import { parseQuery, stringifyQuery } from './query'
// import { usePermStore } from '@/store'

const routes: Record<string, Array<RouteRecordRaw>> = {
  default: [
    { path: '/:w+', name: '*', redirect: '/404' },
    { path: '/404', component: () => import('@/views/404.vue') },
    {
      path: '/_test',
      component: () => import('@/views/test.vue'),
      name: '_test'
    },
    {
      path: '/no-rights',
      component: () => import('@/views/layout/index.vue'),
      children: [
        {
          path: '',
          name: 'noRights',
          component: () => import('@/views/noRights.vue')
        }
      ]
    },
    {
      path: '/login',
      component: () => import('@/views/login/index.vue')
    },
    {
      path: '/',
      redirect: import.meta.env.VITE_APP_HOME || '/login'
    },
    {
      path: '/sys',
      component: () => import('@/views/layout/index.vue'),
      redirect: '/sys/userManage',
      name: 'publicSys',
      meta: { title: '系统管理', icon: '' },
      children: [
        {
          path: 'userManage',
          name: 'userManage',
          component: () => import('@/views/sys/userManage/index.vue'),
          meta: { title: '人员列表', icon: '' }
        },
        {
          path: 'perm',
          name: 'perm',
          component: () => import('@/views/sys/perm/index.vue'),
          meta: { title: '菜单列表', icon: '' }
        },
        {
          path: 'role',
          name: 'role',
          component: () => import('@/views/sys/role/index.vue'),
          meta: { title: '角色列表', icon: '' }
        },
        {
          path: 'ent',
          name: 'ent',
          component: () => import('@/views/sys/ent/index.vue'),
          meta: { title: '企业列表', icon: '' }
        },
        {
          path: 'dictionary',
          name: 'dictionary',
          component: () => import('@/views/sys/dictionary/index.vue'),
          meta: { title: '数据字典', icon: '' }
        }
      ]
    }
  ]
}

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_APP_WEB_PREFIX),
  routes: [...routes.default, ...(__appType === 'iot' ? iot : dmzn)],
  stringifyQuery, // 序列化query参数
  parseQuery // 反序列化query参数
})

import.meta.env.VITE_APP_PLATFORM != 'tool' && permission(router)
export default router
