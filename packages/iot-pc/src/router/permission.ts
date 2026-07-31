import LoadingBar from '@/components/loadingBar'
import userStore from '@/store/user'
import { usePermStore } from '@/store'
import { AuthUtil } from '@infoview/util'
// import { fetchPermList, pickPerm } from '@/views/sys/utils'
import { useLoginState } from '@/composable/useAny'
import { parseLog } from '@/util/parseLog'

import type { Router } from 'vue-router'

const isDev = import.meta.env.DEV

interface IWhiteUrl {
  url: string
  def?: boolean
}

const whitePages: IWhiteUrl[] = [
  {
    url: '/',
    def: true
  },
  {
    url: '/login',
    def: true
  },
  {
    url: '/404',
    def: false
  },
  {
    url: '/no-rights',
    def: false
  },
  {
    url: '/_test',
    def: false
  }
]

if (isDev) {
  whitePages.push(
    { url: '/management/user-access' },
    { url: '/devices' },
    { url: '/chart/iot' },
    { url: '/_test' }
  )
}

if (__appType === 'dmzn') {
  whitePages.push({ url: '/devices', def: true })
} else {
  whitePages.push({ url: '/dashboard/devices', def: true })
}

const whiteList = whitePages.map(({ url }) => url)
const defPage = whitePages.filter(({ def }) => def)[0].url

export default function (router: Router) {
  router.beforeEach((to: any, _, next: any) => {
    LoadingBar.start()

    /**
     * 路由权限控制
     * 目前策略是根据用户菜单配置的权限进行控制
     */

    if (whiteList.includes(to.path)) return next()

    const permStore = usePermStore()
    const _userStore = userStore()
    const inSession = useLoginState().get()

    // 无token，未登录
    if (!AuthUtil.getToken() || to.path === '/login' || !inSession) return next('/login')

    // 菜单接口会返回非菜单的值，暂不取用菜单中的 code 作为权限控制
    const runPermCheck = () => {
      if (permStore.perm?.includes('*')) {
        return next()
      }
      if (permStore.perm?.includes(to.path.substring(1).replace('/', ':'))) {
        return next()
      }
      // 默认页面（首次进入会来到这，在.env文件中配置）
      if (to.path === '/eventCenter/index' && permStore.perm?.length) {
        const firstUrl = permStore.perm?.[0].replace(':', '/')
        return next('/' + firstUrl)
      }

      const uInfo = _userStore.userInfo
      if (uInfo?.empId) {
        parseLog({
          type: 'log',
          payload: {
            logName: '越权访问',
            opMethod: 'GET',
            reqUrl: to.path,
            reqParams: JSON.stringify(to.query),
            empId: uInfo?.empId || '',
            entId: uInfo?.entId || '',
            entName: uInfo?.entName || '',
            nickname: uInfo?.nickname || ''
          }
        })
      }

      next('/no-rights')
    }

    // 通过用户信息接口返回的 urls 进行权限控制
    const runPermCheckV2 = () => {
      if (isDev) return next()
      if (__appType === 'dmzn') return next()

      const toPath = to.path
        .split('/')
        .filter((item) => item !== 'index')
        .join('/')

      if (permStore.perm?.includes('*')) {
        return next()
      }
      if (permStore.perm?.some((item) => toPath === item || toPath.startsWith(item + '/'))) {
        return next()
      }
      // 选中第一个菜单作为默认页
      if (to.path === '/eventCenter/index' && permStore.perm?.length) {
        const nextUrl = permStore.path || '/no-rights'
        return next(nextUrl)
      }

      const uInfo = _userStore.userInfo
      if (uInfo?.empId) {
        parseLog({
          type: 'log',
          payload: {
            logName: '越权访问',
            opMethod: 'GET',
            reqUrl: to.path,
            reqParams: JSON.stringify(to.query),
            empId: uInfo?.empId || '',
            entId: uInfo?.entId || '',
            entName: uInfo?.entName || '',
            nickname: uInfo?.nickname || ''
          }
        })
      }

      next('/no-rights')
    }

    // if (!permStore.perm) {
    //   fetchPermList({ pageSize: 99 }).then((res) => {
    //     pickPerm(res.data?.list, true)
    //     runPermCheck()
    //   })
    // } else {
    //   runPermCheck()
    // }

    runPermCheckV2()
  })

  router.afterEach(() => {
    LoadingBar.done()
  })
}
