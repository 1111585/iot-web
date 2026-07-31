interface ImportMetaEnv {
  /**
   * 打包环境
   */
  VITE_APP_ENV: 'development' | 'production'
  /**
   * 打包平台
   */
  VITE_APP_PLATFORM: string
  VITE_APP_WEB_PREFIX: string
  VITE_APP_BASEURL: string
  VITE_APP_ENCRY: string
  /**
   * 首页路径
   */
  VITE_APP_HOME: string
  VITE_APP_LOGO_TITLE: string
  VITE_APP_THEME_COLOR: string
  VITE_APP_THEME_NAME: string

  MODE: string

  /**
   * IM配置
   */
  VITE_APP_IM_WS_URL: string
  VITE_APP_IM_API_URL: string

  //主题色
  VITE_APP_THEME: 'blue' | 'orange'
  //oss地址
  VITE_APP_OSS: string

  /** 访问地址 */
  VITE_APP_DEPLOY_ON: string

  /** 系统类型 */
  VITE_APP_TYPE: 'dmzn' | 'iot'
}

interface ImportMeta {
  env: ImportMetaEnv
}

declare const __tools: {
  safeJsonParse: <T>(str: string, log?: boolean) => T | null
}

declare const __appType: 'dmzn' | 'iot'

declare const __appTitle: string
