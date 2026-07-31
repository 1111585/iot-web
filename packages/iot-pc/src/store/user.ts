import userApi from '@/apis/user'
import router from '@/router'
import { request } from '@/util/request'
import { AesUtil, AuthUtil } from '@infoview/util'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import { useConfigStore } from '@/store/config'
import { usePermStore } from '@/store'
import { RetEnum } from '@/enums'
import { useLoginState } from '@/composable/useAny'
import { treeDataTranslate } from '@/util/index'
import { fetchPermList } from '@/views/sys/utils'

interface IUserInfo {
  empId: string
  orgId: string
  nickname: string
  phone: string
  avatar: string
  orgName: string
  authCodes: string[]
  ent_id: string
  emp_id: string
  roleType: string
  entName: string
  entId: string
}
interface ITokenInfo {
  token: string
  refreshToken?: string
  expired: string
}
export default defineStore(
  'user',
  () => {
    const userInfo = ref<IUserInfo | null>()
    const isLogin = ref(false)
    const tokenInfo = ref<ITokenInfo | null>()
    const token = computed(() => AuthUtil.getToken())
    const avatar = ref<string>('')

    const configStore = useConfigStore()

    /**
     * 用户登录
     * @param loginForm
     * @returns
     */
    function loginAction<T = any, U = ITokenInfo>(params: T): Promise<RepDataType<U> | null> {
      const loginParams: any = toRaw(params)
      return new Promise((resolve, reject) => {
        request
          .postJson(userApi.login, loginParams)
          .then((rep) => {
            if (rep && rep.code !== RetEnum.SUCCESS) {
              return reject(rep)
            }
            handleLoginSuccess(rep.data)
            return resolve(null)
          })
          .catch((err) => reject(err))
      })
    }

    function handleLoginSuccess(data: any) {
      AuthUtil.setTokenInfo(data)
      useLoginState().set()
      tokenInfo.value = data
      // 要路由鉴权，所以先获取完用户信息再跳转页面
      // router.replace(import.meta.env.VITE_APP_HOME)
    }

    /**
     * 获取用户信息
     * @returns
     */
    function userInfoAction() {
      return new Promise((resolve, reject) => {
        request
          .get(userApi.info)
          .then((rep: any) => {
            if (!rep) return reject()
            userInfo.value = rep.data.userInfo
            avatar.value = rep.data.userInfo.avatar

            const urls = rep.data?.permCodes?.urls || []
            const roleType =
              rep.data?.userInfo?.roleType?.split(',').filter((item: string) => item !== '') || []

            usePermStore().setPerm([...urls, ...roleType])

            // 因为urls中的值会夹着其他非菜单的值，后端设置的权限值也在这了，所以默认菜单以这个为准
            fetchPermList({ pageSize: 99 }).then((rep) => {
              const permStore = usePermStore()
              permStore.setPath(treeDataTranslate(rep.data.list, 'id', 'pid'))
              resolve(true)
            })
          })
          .catch((err) => {
            reject(err)
          })
      })
    }

    function logoutAction() {
      return new Promise((resolve, reject) =>
        request
          .get(userApi.logout)
          .then((rep) => {
            clearUserCacheAction()
            resolve(rep)
          })
          .catch((err) => {
            clearUserCacheAction()
            reject(err)
          })
          .finally(() => {
            clearUserCacheAction()
          })
      )
    }
    function clearUserCacheAction() {
      userInfo.value = null
      tokenInfo.value = null
      localStorage.clear()
      sessionStorage.clear()
      configStore.clear()
      usePermStore().perm = null
    }

    function setUserAvater(img: string) {
      avatar.value = img
    }

    /**
     * 记住账密
     * @param checked 是否记住密码
     * @param params loginForm
     * @param expiryTime 过期时间
     * @returns
     */
    function rememberAccount(checked: boolean, params: Record<string, string>, expiryTime: number) {
      if (checked) {
        const now = new Date()
        localStorage.setItem(
          'account-secret',
          AesUtil.encryptHex(
            JSON.stringify({
              account: params.account,
              password: params.password,
              expiry: now.getTime() + expiryTime // 设定过期时间
            })
          )
        )
      } else if (localStorage.getItem('account-secret') && !checked) {
        localStorage.removeItem('account-secret')
      }
    }
    function logoutTip(mesage = '您的登录状态已失效，请重新登录', isQuitIM = true) {
      ElMessageBox.confirm('您的登录状态已失效，请重新登录', '系统提示', {
        showCancelButton: false,
        confirmButtonText: '重新登录',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          clearUserCacheAction()
        })
        .catch(() => {
          clearUserCacheAction()
        })
    }
    return {
      token,
      tokenInfo,
      userInfo,
      isLogin,
      loginAction,
      userInfoAction,
      logoutAction,
      clearUserCacheAction,
      avatar,
      setUserAvater,
      logoutTip
    }
  },
  {
    persist: true
  }
)
