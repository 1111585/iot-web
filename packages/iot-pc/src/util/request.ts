import whitelist from '@/apis/whitelist'
import { RetEnum, SubCodeEnum, RetType } from '@/enums'
import userStore from '@/store/user'
import { AuthUtil, RequestUtil } from '@infoview/util'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import { type App } from 'vue'
import { resetEventRingErrorCount } from '@/views/eventCenter/utils/event'
import { generateSignatureSm } from './crypto/tools'
import type { Method, AxiosRequestConfig, AxiosRequestHeaders } from 'axios'

interface AxiosRequestConfigExtend extends AxiosRequestConfig {
  isLoading?: boolean
  headers: AxiosRequestHeaders
}

const isDev = import.meta.env.DEV
const isDebug = isDev && false

let isReshshing = false
let requests: any = []

class Request extends RequestUtil {
  /**
   * 需要抛出为异常的状态码
   */
  private needThrow = [RetType.PWDUNMODIFIED, RetType.PWDERROR]

  constructor() {
    super({ baseURL: import.meta.env.VITE_APP_BASEURL })
  }
  refreshTokenUrl(): string {
    return '/ucs/sso/refreshToken'
  }

  repSuccess() {
    // 重置预警中心错误计数器，恢复预警检查
    try {
      resetEventRingErrorCount()
    } catch (error) {
      // console.error('[请求工具]重置预警错误计数器失败', error)
    }
  }

  requestBeforeLogic(
    config: AxiosRequestConfigExtend
  ): AxiosRequestConfigExtend | Promise<AxiosRequestConfigExtend> {
    // Nonce（Number used once）防止重放攻击
    // config.headers['X-Nonce'] = Math.random().toString(36).slice(-8)
    // if (config.url && !whitelist.includes(config.url)) {

    if (config.url) {
      const { signature, timestamp, nonce } = generateSignatureSm({
        method: config.method ?? 'GET',
        url: config.url,
        params: config.params,
        body: config.data
      })
      config.headers['X-Signature'] = signature
      config.headers['X-Timestamp'] = timestamp
      config.headers['X-Nonce'] = nonce
    }

    let token = AuthUtil.getToken()
    if (token && !whitelist.includes(config.url ?? '')) {
      if (AuthUtil.isExpiration()) {
        if (!isReshshing) {
          isReshshing = true
          this.refreshToken(AuthUtil.getRefreshToken() ?? '')
            ?.then((token) => {
              isReshshing = false
              return token
            })
            .then((token) => {
              requests && requests.forEach((cb) => cb(token))
              requests = []
            })
            .catch((_) => {
              requests = []
              this.toLogin()
            })
        }
        const delayRequest: Promise<AxiosRequestConfigExtend> = new Promise((resolve) => {
          requests.push((token) => {
            config.headers['Authorization'] = token
            resolve(config)
          })
        })
        return delayRequest
      }
      config.headers['Authorization'] = token
      return config
    }
    return config
  }
  /**
   * 这个回调会在 RequestUtil.requestAfter 中调用，这里得到的 code 始终会是业务状态码：
   * - axios fullfilled：如果不为 100，调用此方法
   * - axios rejected： 不管是什么码，最终得到 101
   */
  errorCallback(ret: RepDataType) {
    if (isDebug) return

    /**
     * 抛出的情况：
     * 1. http状态码 200，业务需要页面进一步处理
     *
     * 无抛出实则属于 Promise.resolve(null)，所以在请求时简单的判断可根据 !null 判断，比如 !data && ElMessage.success('操作成功')
     * 如果要进一步的数据处理和信息展示，抛出这个错误
     */
    if (this.needThrow.includes(ret.code)) {
      throw ret
    }

    if (ret && ret.code !== RetEnum.SUCCESS) {
      const errLogFn = (msg: string) => {
        ElMessage({
          message: msg,
          type: 'error',
          duration: 3 * 1000
        })
      }

      if (!!ret.msg) {
        // this.requestAfter -> this.errorCallback 有再处理以下信息
        const errMsg = ['服务【500】异常', '服务出问题了，请稍后重试！']
        // 判定为token失效的文本（无subCode返回）
        const badToken = ['用户未登陆，无访问权限', '用户信息已失效，请重新登录']

        if (errMsg.includes(ret.msg)) {
          if (location.pathname !== '/login') {
            this.toLogin()
          }
          return
        }
        if (badToken.includes(ret.msg)) {
          userStore().clearUserCacheAction()
          // 未登录/登录失效：直接跳转登录页，避免反复弹错误提示
          if (location.pathname !== '/login') {
            location.href = '/login'
          }
          return
        }

        errLogFn(ret.msg)
      }

      if (ret.code === RetEnum.INVALID || ret.subCode === SubCodeEnum.INVALID) {
        this.logOutTip()
        return
      }
    }
  }

  public async uploadFile<T = UploadFileResultType>(
    file: Blob,
    fileName: string,
    url: string = '/ops/sys/resource/upload'
  ) {
    return super.uploadFile<T>(file, fileName, url)
  }

  public async uploadChunkFile<T = UploadFileResultType>(
    file: Blob,
    fileName: string,
    url: string = '/ops/sys/resource/upload',
    params: any
  ) {
    console.log('==upload=>' + file)

    return super.uploadFile<T>(file, fileName, url, params)
  }

  //上传文件并产生缩列图
  public async uploadFileWithGenThumb(file: Blob, fileName: string) {
    return super.uploadFile(file, fileName, '/ops/sys/resource/upload', new Map([['thumb', 1]]))
  }
  public async genThumb(
    headCheckUrl: string,
    url: string,
    size: number = 300,
    thumbApiUrl: string = '/ops/sys/resource/genThumb'
  ) {
    return super.genThumb(headCheckUrl, url, size, thumbApiUrl)
  }

  private logOutTip() {
    const { logoutAction, clearUserCacheAction } = userStore()
    this.messageBoxTip()?.then(() => {
      logoutAction()
        .then(() => {
          clearUserCacheAction()
        })
        .catch(() => {
          clearUserCacheAction()
        })
    })
  }
  private toLogin() {
    this.messageBoxTip()?.then(() => {
      const { clearUserCacheAction } = userStore()
      clearUserCacheAction()
    })
  }
  private messageBoxTip() {
    if (document.getElementsByClassName('el-message-box').length == 0)
      return ElMessageBox.confirm('您的登录状态已失效，请重新登录', '系统提示', {
        showCancelButton: false,
        confirmButtonText: '重新登录',
        cancelButtonText: '取消',
        type: 'warning'
      }).finally(() => {
        // 调用 toLogin 清空token，重载页面，让路由守卫判断token（无token跳转登录页）
        location.href = '/login'
      })
  }

  public async downloadStream(
    url: string,
    fileName?: string,
    params?: any,
    method: Method = 'POST'
  ) {
    const loadingInstance = ElLoading.service({
      fullscreen: true,
      text: '下载中...'
    })

    try {
      // 获取认证信息
      const token = AuthUtil.getToken() ?? ''
      const { signature, timestamp, nonce } = generateSignatureSm({
        method,
        url,
        params,
        body: ''
      })

      // 构建请求配置
      const headers: Record<string, any> = {
        Authorization: token,
        'X-Nonce': nonce,
        'X-Signature': signature,
        'X-Timestamp': timestamp
      }

      // 构建完整URL（如果是相对路径）
      let fullUrl = url
      if (!url.startsWith('http')) {
        fullUrl = `${this.getBaseUrl()}/${url.replace(/^\//, '')}`
      }

      // 准备请求体或查询参数
      let requestInit: RequestInit = {
        method: method,
        headers: headers
      }

      // 根据请求方法添加参数
      if (params) {
        if (method.toUpperCase() === 'GET') {
          // 对于GET请求，将参数添加到URL中
          const queryParams = new URLSearchParams()
          Object.entries(params).forEach(([key, value]) => {
            queryParams.append(key, String(value))
          })
          fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryParams.toString()
        } else {
          // 对于POST等请求，将参数添加到请求体中
          requestInit.body = JSON.stringify(params)
          headers['Content-Type'] = 'application/json'
        }
      }

      // 使用fetch API发起请求
      const response = await fetch(fullUrl, requestInit)

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status} ${response.statusText}`)
      }

      // 后端异常通常被包装成 HTTP 200 的 JSON，避免把错误报文当成文件下载
      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('application/json') || contentType.includes('text/')) {
        let message = '下载失败'
        try {
          const text = await response.text()
          const json = JSON.parse(text)
          message = json?.msg || json?.message || json?.data?.msg || message
        } catch {
          // 忽略解析错误，使用默认提示
        }
        throw new Error(message)
      }

      // 尝试从Content-Disposition获取文件名
      const contentDisposition = response.headers.get('content-disposition')
      if (contentDisposition) {
        const filenameRegex = /filename[^;=\n]*=((['"]).+?\2|[^;\n]*)/
        const matches = filenameRegex.exec(contentDisposition)
        if (matches != null && matches[1]) {
          fileName = decodeURIComponent(matches[1].replace(/['"]/g, ''))
        }
      }

      // 获取响应数据并创建Blob
      const blob = await response.blob()

      if (blob.size === 0) {
        throw new Error('下载内容为空')
      }

      // 创建下载链接并触发下载
      const blobUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = fileName ?? ''
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(blobUrl)
    } catch (error: any) {
      console.error('下载错误:', error)
      ElMessage.error(error.message || '下载失败')
      throw error
    } finally {
      loadingInstance.close()
    }
  }
}

const request = new Request()
const install = (app: App<Element>) => (app.config.globalProperties.$request = request)

export { install as default, request }
