// import { AesUtil } from '@infoview/util'
import CryptoJS from 'crypto-js'
import SmCrypto from './sm'

/**
 * 不管是什么算法、什么平台，其实都是遵循统一标准的，
 * 所以当前后端的加密结果不一致的时候，大概率就是秘钥的处理问题、数据预处理的问题
 *
 * generateSignature 和 generateSignatureSm 的区别：
 * - 前者：hmac-sha256，秘钥是环境变量原始值
 * - 后者：sm3，秘钥需要是十六进制的（接口检验需求，与算法无关）
 */

const secretKey = import.meta.env.VITE_APP_SECRET_KEY

// 注意：国密版本需要使用SM2密钥对，而不是对称密钥
const SM2_PUBLIC_KEY = import.meta.env.VITE_APP_SM2_PUBLIC_KEY
const SM2_PRIVATE_KEY = import.meta.env.VITE_APP_SM2_PRIVATE_KEY

/**
 * sm3 加密的时候，接口使用的秘钥是十六进制的，所以需要将字符串转换为十六进制
 * CryptoJS 的时候，秘钥无需转换
 */
function stringToHex(str: string) {
  return str
    .split('')
    .map((char) => char.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('')
}

export function generateNonce(len = 8) {
  return Math.random().toString(36).slice(-len)
}

export function sha256(str: string) {
  return CryptoJS.SHA256(str).toString()
}

export function sha256Sm(str: string) {
  return SmCrypto.sm3Hash(str)
}

export function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export function generateSignature({ method, url, params, body }: GenSign) {
  const timestamp = Date.now()
  const nonce = generateNonce()

  // 解析URL获取路径
  const urlObj = new URL(url, window.location.origin)
  const uri = urlObj.pathname

  // 构建待签名字符串
  let stringToSign = `${method.toUpperCase()}\n${uri}\n`

  // 添加查询参数（按key排序）
  if (params && Object.keys(params).length > 0) {
    const sortedParams = {}
    Object.keys(params)
      .sort()
      .forEach((key) => {
        sortedParams[key] = params[key]
      })

    const paramStr = Object.keys(sortedParams)
      .map((key) => `${key}=${sortedParams[key]}`)
      .join('&')
    stringToSign += paramStr
  }
  stringToSign += '\n'

  // 添加请求体的SHA256哈希值而不是完整内容
  if (body) {
    const bodyStr = typeof body === 'string' ? body : JSON.stringify(body)
    const hashBuffer = sha256(bodyStr)
    const hashArray = new Uint8Array(hashBuffer)
    // const bodyHash = bytesToHex(hashArray)
    const bodyHash = sha256(bodyStr).toString(CryptoJS.enc.Hex)
    stringToSign += bodyHash + '\n'
  } else {
    stringToSign += '\n'
  }

  // 添加时间戳和nonce
  stringToSign += `${timestamp}\n${nonce}`

  // 使用CryptoJS计算HMAC-SHA256签名
  const signature = CryptoJS.HmacSHA256(stringToSign, secretKey).toString(CryptoJS.enc.Base64)

  return {
    signature,
    timestamp,
    nonce
  }
}

export function generateSignatureSm(
  { method, url, params, body }: GenSign,
  useSm2Sign: boolean = false
) {
  /**
   * 生成国密签名
   * @param method - HTTP方法
   * @param url - 请求URL
   * @param params - 查询参数
   * @param body - 请求体
   * @param useSm2Sign - 是否使用SM2签名算法，默认为false（使用SM3哈希）
   * @returns 包含签名、时间戳和随机数的对象
   */
  const timestamp = Date.now()
  const nonce = generateNonce()

  // 解析URL获取路径
  const urlObj = new URL(url, window.location.origin)
  const uri = urlObj.pathname

  // 构建待签名字符串
  let stringToSign = `${method.toUpperCase()}\n${uri}\n`

  // 添加查询参数（按key排序）
  if (params && Object.keys(params).length > 0) {
    const sortedParams = {}
    Object.keys(params)
      .sort()
      .forEach((key) => {
        sortedParams[key] = params[key]
      })

    const paramStr = Object.keys(sortedParams)
      .map((key) => `${key}=${sortedParams[key]}`)
      .join('&')
    stringToSign += paramStr
  }
  stringToSign += '\n'

  // 添加请求体的SM3哈希值而不是完整内容
  if (body) {
    const bodyStr = typeof body === 'string' ? body : JSON.stringify(body)
    const bodyHash = SmCrypto.sm3Hash(bodyStr)

    stringToSign += bodyHash + '\n'
  } else {
    stringToSign += '\n'
  }

  // 添加时间戳和nonce
  stringToSign += `${timestamp}\n${nonce}`

  // 根据参数选择使用SM2签名或SM3哈希
  let signature: string
  if (useSm2Sign) {
    // 使用SM2签名算法生成签名
    signature = SmCrypto.sm2Sign(stringToSign, SM2_PRIVATE_KEY, SM2_PUBLIC_KEY)
  } else {
    // 使用SM3哈希算法生成"签名"，加入密钥以增强安全性
    // 这个是 hmac，如果不加秘钥就是普通的 sm3
    signature = SmCrypto.sm3Hash(stringToSign, stringToHex(secretKey))
  }

  return {
    signature,
    timestamp,
    nonce
  }
}

interface GenSign {
  method: string
  url: string
  params: any
  body: any
}
