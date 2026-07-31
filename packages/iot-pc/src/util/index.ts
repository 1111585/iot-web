import { forEach, cloneDeep, isString, pickBy } from 'lodash-es'
import download from 'downloadjs'
import { type FileType } from '@/enums'
import router from '@/router'
import { ElLoading } from 'element-plus'
import JSZip from 'jszip'
import { userStore } from '@/store'
import { AesUtil } from '@infoview/util'
import type { FormInstance } from 'element-plus'

export function toUrlSearchParam<T>(data: T) {
  if (data instanceof String) return data
  const urlParams = new URLSearchParams()
  forEach(data as any, (item: Object, key: string) => {
    urlParams.append(key, `${item}`)
  })
  return urlParams
}

export function getLocalData<T>(key: string): T {
  const data = localStorage.getItem(key)
  return JSON.parse(data ?? '{}')
}

export function formatDate(date: Date | string, fmt = 'yyyy-MM-dd hh:mm') {
  if (isString(date)) date = new Date(date)
  if (!(date instanceof Date) || isNaN(date.getTime()) || date.getTime() < 0) return '-'
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  let o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  } as any
  for (let k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      let str = o[k] + ''
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? str : padLeftZero(str))
    }
  }
  return fmt
}
function padLeftZero(str: string) {
  return ('00' + str).substr(str.length)
}
/**
 * 树形数据转换
 * @param {*} data
 * @param {*} id
 * @param {*} pid
 */
export function treeDataTranslate(data: any, id = 'id', pid = 'parentId', children = 'children') {
  let _data = JSON.parse(JSON.stringify(data))
  return _data.filter((p: any) => {
    if (!p[id]) return false
    const _arr = _data.filter((c: any) => p[id] === c[pid])
    _arr.length && (p[children] = _arr)
    return p[pid] == 0
  })
}

/**
 * 扁平数组转换为树形结构并计算层级
 * @param list
 * @param parent
 * @param level
 * @returns
 */
export function treeToListWithLevel(tree, childrenKey = 'children') {
  let list: any = []
  const handle = (treeData, level = 0) => {
    treeData.forEach((it) => {
      it.level = level
      list.push(pickBy(it, (_, key) => key != childrenKey))
      const child = it[childrenKey]
      if (child && child.length > 0) {
        handle(child, level + 1)
      }
    })
  }

  handle(tree)
  return list
}

/**
 * 路径替换
 * @param url 替换{}内的值
 * @param params
 * @returns
 */
export function regRepUrl(url: string, params: string) {
  if (url.indexOf('{') !== -1) {
    url = url.replace(new RegExp('\\{.*\\}'), params)
  }
  return url
}
export function repBracket(url: string) {
  if (url.indexOf('{') !== -1) {
    url = url.replace(new RegExp('\\/{.*\\}'), '')
  }
  return url
}

export function hasAuth(value: string | string[]) {
  const { userInfo } = userStore()
  let permissions = userInfo?.authCodes ?? []
  let show = false
  let auths: string[] = typeof value === 'string' ? value.split(',') : value
  if (permissions[0] === '*') return true
  auths.forEach((v) => {
    if (!show)
      show = permissions.includes(
        `${repBracket(v).lastIndexOf('/') != -1 ? v.substring(1).replace(/\//g, ':') : v}`
      )
  })
  return show
}

/**
 * 对电话和姓名身份证等进行部分隐藏处理
 * @param {String} str 字符串
 * @param {Number} frontLen 前面保留位数
 * @param {Number} endLen 后面保留位数
 */
export function hiddenStr(str: string, frontLen: number, endLen: number) {
  if (!str) return
  if (str.length <= 2) endLen = 0
  var len = str.length - frontLen - endLen
  var xing = ''
  for (var i = 0; i < len; i++) {
    xing += '*'
  }
  return str.substring(0, frontLen) + xing + str.substring(str.length - endLen)
}

export function fitUrl(url: string, size: number = 114, width: number = 0) {
  return `${url}?mode=fit&width=${width ?? size}&height=${size}`
}

/**
 * @description 绑定事件 on(element, event, handler)
 */
export const onEvent = (function () {
  if (document.addEventListener !== null) {
    return function (element: any, event: any, handler: any) {
      if (element && event && handler) {
        element.addEventListener(event, handler, false)
      }
    }
  } else {
    return function (element: any, event: any, handler: any) {
      if (element && event && handler) {
        element.attachEvent('on' + event, handler)
      }
    }
  }
})()

/**
 * @description 解绑事件 off(element, event, handler)
 */
export const offEvent = (function () {
  if (document.removeEventListener !== null) {
    return function (element: any, event: any, handler: any) {
      if (element && event) {
        element.removeEventListener(event, handler, false)
      }
    }
  } else {
    return function (element: any, event: any, handler: any) {
      if (element && event) {
        element.detachEvent('on' + event, handler)
      }
    }
  }
})()

export const trim = function (s: string) {
  s = s.trim()
  if (s.startsWith('&nbsp;')) s = s.substring('&nbsp;'.length)
  if (s.endsWith('&nbsp;')) s = s.substring(0, s.length - '&nbsp;'.length)
  return s
}

/**
 * 格式化文件大小
 * @param size 文件大小,单位B
 * @returns
 */
export function formatFileSize(size: number) {
  if (!size) return ''
  let fileSizeString = ''
  if (size < 1024) {
    fileSizeString = size + 'B'
  } else if (size < 1048576) {
    fileSizeString = (size / 1024).toFixed(2) + 'K'
  } else if (size < 1073741824) {
    fileSizeString = (size / 1048576).toFixed(2) + 'M'
  } else {
    fileSizeString = (size / 1073741824).toFixed(2) + 'G'
  }
  return fileSizeString
}

function matchSuffix(list: string[], suffix: string) {
  let result = list.some(function (item) {
    return item == suffix
  })
  return result
}

export function matchFileSuffixType(fileName: string): FileType {
  // 后缀获取
  var suffix = ''
  // 获取类型结果
  var result: FileType = 'other'
  try {
    var flieArr = fileName.split('.')
    suffix = flieArr[flieArr.length - 1]
  } catch (err) {
    suffix = ''
  }
  // fileName无后缀返回
  if (!suffix) {
    return result
  }
  // apk格式
  var imglist = ['apk']
  if (matchSuffix(imglist, suffix)) return 'apk'

  // 图片格式
  var imglist = ['png', 'jpg', 'jpeg', 'bmp', 'gif', 'webp', 'psd', 'svg', 'tiff']
  if (matchSuffix(imglist, suffix)) return 'image'

  // 匹配txt
  var txtlist = ['txt']
  if (matchSuffix(txtlist, suffix)) return 'txt'

  // 匹配 excel
  var excelist = ['xls', 'xlsx']
  if (matchSuffix(excelist, suffix)) return 'excel'

  // 匹配 word
  var wordlist = ['doc', 'docx']
  if (matchSuffix(wordlist, suffix)) return 'word'

  // 匹配 pdf
  var pdflist = ['pdf']
  if (matchSuffix(pdflist, suffix)) return 'pdf'

  // 匹配 ppt
  var pptlist = ['ppt']
  if (matchSuffix(pptlist, suffix)) return 'ppt'

  // 匹配 视频
  var videolist = ['mp4', 'm2v', 'mkv', 'avi']
  if (matchSuffix(videolist, suffix)) return 'video'

  // 匹配 音频
  var radiolist = ['mp3', 'wav', 'wmv']
  if (matchSuffix(radiolist, suffix)) return 'radio'

  // 匹配 音频
  var swflist = ['swf']
  if (matchSuffix(swflist, suffix)) return 'swf'

  // 其他 文件类型
  return result
}

// /**
//  * 在树结构中根据key的值找到对应的路径
//  * @param arr 树形结构数组
//  * @param value 要查找的id值
//  * @param key 要查找的属性
//  * @param returnKey 要返回的属性
//  * @returns
//  */
// export function getPathByKey<T>(
//   arr: T[],
//   value: number | string,
//   key: string = "id",
//   returnKey: string = ""
// ) {
//   let temppath: (string | number)[] = [];
//   returnKey = returnKey || key;
//   try {
//     function getNodePath(node: any) {
//       temppath.push(node[returnKey]);
//       if (node[key] == value) {
//         throw "GOT IT!";
//       }
//       if (node.children && node.children.length > 0) {
//         for (var i = 0; i < node.children.length; i++) {
//           getNodePath(node.children[i]);
//         }
//         temppath.pop();
//       } else {
//         temppath.pop();
//       }
//     }
//     for (let i = 0; i < arr.length; i++) {
//       getNodePath(arr[i]);
//     }
//   } catch (e) {
//     return temppath;
//   }
// }

// /**
//  * 获取树的深度
//  * @param {Object} treeData 树形结构数据
//  * @returns 深度
//  */
// export function getTreeDeep(treeData: any) {
//   let arr: any = [];
//   arr.push(treeData);
//   let depth = 0;
//   while (arr.length > 0) {
//     let temp: any = [];
//     for (let i = 0; i < arr.length; i++) {
//       temp.push(arr[i]);
//     }
//     arr = [];
//     for (let i = 0; i < temp.length; i++) {
//       if (temp[i].children && temp[i].children.length > 0) {
//         for (let j = 0; j < temp[i].children.length; j++) {
//           arr.push(temp[i].children[j]);
//         }
//       }
//     }
//     if (arr.length >= 0) {
//       depth++;
//     }
//   }
//   return depth;
// }

// /**
//  * 递归-----树形数据（数组）获取最深层级数
//  * @param {Array} treeData   树的源数据
//  * @returns {Number} max      最深层级数的值
//  */
// export function getMaxFloor(treeData: any) {
//   let max = 0;
//   let deepEach = (data: any, floor: number) => {
//     data.map((item: any) => {
//       item.floor = floor;
//       if (floor > max) {
//         max = floor;
//       }
//       if (item.children && item.children.length > 0) {
//         deepEach(item.children, floor + 1);
//       }
//     });
//   };
//   deepEach(treeData, 1);
//   return max;
// }

/**
 * 树结构转数组
 * @param tree 树的数据源
 * @param children 子节点key值
 * @returns
 */
export function treeConvertToArr(tree: any, children = 'children') {
  let _tree = cloneDeep(tree)
  let arrs: any = []
  let result: any = []
  arrs = arrs.concat(_tree)
  while (arrs.length) {
    let first: any = arrs.shift() // 弹出第一个元素
    if (first[children]) {
      //如果有children
      arrs = arrs.concat(first[children])
      delete first[children]
    }
    result.push(first)
  }
  return result
}

const chnNumChar = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
const chnUnitSection = ['', '万', '亿', '万亿', '亿亿']
const chnUnitChar = ['', '十', '百', '千']
// 节内转换算法
function SectionToChinese(section: number) {
  var strIns = '',
    chnStr = ''
  var unitPos = 0
  var zero = true
  while (section > 0) {
    var v = section % 10
    if (v === 0) {
      if (!zero) {
        zero = true
        chnStr = chnNumChar[v] + chnStr
      }
    } else {
      zero = false
      strIns = chnNumChar[v]
      strIns += chnUnitChar[unitPos]
      chnStr = strIns + chnStr
    }
    unitPos++
    section = Math.floor(section / 10)
  }
  return chnStr
}
/**
 * 阿拉伯数字转换成中文
 * @param num 数字
 * @returns
 */
export function NumberToChinese(num: number) {
  var unitPos = 0
  var strIns = '',
    chnStr = ''
  var needZero = false

  if (num === 0) {
    return chnNumChar[0]
  }
  while (num > 0) {
    var section = num % 10000
    if (needZero) {
      chnStr = chnNumChar[0] + chnStr
    }
    strIns = SectionToChinese(section)
    strIns += section !== 0 ? chnUnitSection[unitPos] : chnUnitSection[0]
    chnStr = strIns + chnStr
    needZero = section < 1000 && section > 0
    num = Math.floor(num / 10000)
    unitPos++
  }
  return chnStr
}

// 树结构查找节点
export function treeFind(tree, func) {
  for (const data of tree) {
    if (func(data)) return data
    if (data.children) {
      const res = treeFind(data.children, func)
      if (res) return res
    }
  }
  return null
}

export function filterHTMLTag(html) {
  if (html == '') return html
  html = html.replace(/<\/?[^>]*>/g, '') //去除HTML tag
  html = html.replace(/[ | ]*\n/g, '\n') //去除行尾空白
  // html = html.replace(/ /gi, ""); //去掉空格
  html = html.replace(/&nbsp;/gi, '') //去掉&nbsp;
  return html
}
//清除html与特殊字符
export function clearHTMLTagWithSpecialChars(html) {
  if (html == '') return html
  html = html.replace(/<\/?[^>]*>/g, '') //去除HTML tag
  html = html.replace(/ /gi, '') //去掉空格
  html = html.replace(/\n/gi, '')
  html = html.replace(/　/gi, '')
  html = html.replace(/ /gi, '')
  html = html.replace(/&nbsp;/gi, '') //去掉&nbsp;
  return html
}

/**
 * 获取数组中某个key的值, 并拼接成字符串
 * @param data
 * @param key
 * @returns
 */
export const getValueByKey = (data: any, key: string) => {
  let value = <Array<string>>[]
  if (!data) return ''
  let newData = isString(data) ? JSON.parse(data) : data
  newData.forEach((item) => {
    value.push(item[key])
  })
  return value.join(',')
}
/**
 * 去除HTML标签
 * @param str
 * @param allowed_tags 不被去除的标签 例:sup,sub
 * @returns
 */
export const stripTags = (str: string, allowed_tags: string = '') => {
  let key = '',
    allowed = false
  let matches: any = []
  let allowed_array: any = []
  let allowed_tag = ''
  let i = 0
  let k = ''
  let html = ''
  let replacer = function (search, replace, str) {
    return str.split(search).join(replace)
  }
  // Build allowes tags associative array
  if (allowed_tags) {
    allowed_array = allowed_tags.match(/([a-zA-Z0-9]+)/gi)
  }
  str += ''

  // Match tags
  matches = str.match(/(<\/?[\S][^>]*>)/gi)
  // Go through all HTML tags
  for (key in matches) {
    // if (isNaN(key)) {
    //   // IE7 Hack
    //   continue;
    // }

    // Save HTML tag
    html = matches[key].toString()
    // Is tag not in allowed list? Remove from str!
    allowed = false

    // Go through all allowed tags
    for (k in allowed_array) {
      // Init
      allowed_tag = allowed_array[k]
      i = -1

      if (i != 0) {
        i = html.toLowerCase().indexOf('<' + allowed_tag + '>')
      }
      if (i != 0) {
        i = html.toLowerCase().indexOf('<' + allowed_tag + ' ')
      }
      if (i != 0) {
        i = html.toLowerCase().indexOf('</' + allowed_tag)
      }

      // Determine
      if (i == 0) {
        allowed = true
        break
      }
    }
    if (!allowed) {
      str = replacer(html, '', str) // Custom replace. No regexing
    }
  }
  return str
}

/**
 * 去除HTML特殊字符(不完全,可补充)
 * @param str str
 * @returns
 */
export const stripHtmlSpecialChar = (str) => {
  if (str == '') return str
  return str.replace(/\&#39;|&lt;|&gt;|&quot;|&ldquo;|&rdquo;|&amp;|&nbsp;|&emsp;/g, '')
}

/**
 * 跳转到百度搜索
 * @param wd 关键字
 */
export const goBaidu = (wd: string) => {
  window.open('https://www.baidu.com/s?wd=' + wd, '_blank')
}

/**
 * 平滑滚动滚动条
 * @param $el DOM
 * @param top 需要滚动到的位置
 */
export const slideScrollBar = ($el, top) => {
  if (top == $el.scrollTop) return
  $el.scrollTop = top
  //变化的高度
  // const differ = top - $el.scrollTop;
  // let lastTop = -1;
  // const interval = setInterval(() => {
  //   if (differ > 0) {
  //     // 往下滚动
  //     $el.scrollTop += Math.ceil(Math.abs(differ) / 200);
  //     if ($el.scrollTop >= top) {
  //       clearInterval(interval);
  //     }
  //   } else {
  //     // 往上滚动
  //     $el.scrollTop -= Math.ceil(Math.abs(differ) / 200);
  //     if ($el.scrollTop <= top) {
  //       clearInterval(interval);
  //     }
  //   }
  //   if ($el.scrollTop === lastTop) {
  //     // 防止滚动条高度已经是最大值导致一直增加不了
  //     clearInterval(interval);
  //   }
  //   lastTop = $el.scrollTop;
  // }, 1);
}

// 修改tree中指定id的节点值
export const changeTreePositionData = (tree, id, changeValue, idKey = 'id', valueKey = 'title') => {
  const searchId = (source, id) => {
    for (let i = 0; i < source.length; i++) {
      const item = source[i]
      if (item[idKey] === id) {
        item[valueKey] = changeValue
        return
      }
      if (item.children) {
        // 只对非末端节点进行递归
        searchId(item.children, id)
      }
    }
  }
  for (let i = 0; i < tree.length; i++) {
    const item = tree[i]
    // 将每个单独的数组元素视为一个完整树结构
    // 根节点判定
    if (item[idKey] === id) {
      item[valueKey] = changeValue
      return tree
    }
    if (item.children) {
      searchId(item.children, id)
    }
  }

  return tree
}

export const previewPDF = (name: string, file: string) => {
  if (!file) return
  if (matchFileSuffixType(name) != 'pdf') {
    window.open(file)
  } else {
    window.open('/pdf/web/viewer.html?file=' + file)
  }
}

export const zayDecode = (str) => {
  return AesUtil.aesDecrypt(decodeURIComponent(str))
}

export const canPreview = (name: string): boolean => {
  let suffix = ''
  try {
    var flieArr = name.split('.')
    suffix = flieArr[flieArr.length - 1]
  } catch (err) {}
  return ['docx', 'xlsx', 'pptx', 'pdf'].includes(suffix)
}

/**
 * 预览文件
 * @param url 文件地址
 * @param name 文件名称
 * @param openOther 是否打开不支持预览的文件
 */
export const previewFile = (url: string, name: string, openOther = true) => {
  let filetype = matchFileSuffixType(name)
  if (!canPreview(name)) {
    if (openOther) {
      window.open(url, '_blank')
    }
    return false
  }
  const { href } = router.resolve({
    path: '/view',
    query: { url, filetype, name }
  })
  window.open(href, '_blank')
  return true
}

export const downloadBlod = (
  blob: Blob,
  fileName?: string,
  fileType: string = 'application/json'
) => {
  download(blob, fileName, fileType)
}

export const downloadFile = (url: string, fileName?: string) => {
  const loadingInstance = ElLoading.service({
    lock: true,
    fullscreen: true,
    text: '正在下载文件...'
  })
  // 转成blob
  fetch(url)
    .then((res) => res.blob())
    .then((blob) => {
      // 将链接地址字符内容转变成blob地址
      downloadBlod(blob, fileName)
    })
    .finally(() => {
      loadingInstance.close()
    })
}
// 破折号转换驼峰
export const dashe2Hump = (name) => {
  return name.replace(/\-(\w)/g, (_, letter) => {
    return letter.toUpperCase()
  })
}
// 驼峰转破折号
export const hump2Dashe = (name) => {
  return name.replace(/([A-Z])/g, '-$1').toLowerCase()
}
export const downloadZip = (zipName: string, blobFileObj: { blob: Blob; fileName: string }[]) => {
  let zip = new JSZip()
  blobFileObj.forEach((item) => {
    zip.file(item.fileName, item.blob)
  })
  zip.generateAsync({ type: 'blob' }).then((content) => downloadBlod(content, zipName))
}

/**
 * 大数字转换 将数字分段显示，每三位用逗号隔开
 * @param value 数字值
 */
export const formatNumber = (value: string | number) => {
  value = value + ''
  return value.replace(/(\d)(?=(\d{3})+$)/g, '$1,')
}

/**
 * 文件上传到服务器返回的url地址,无域名url将返回 拼接当前页面域名地址
 * @param url 文件地址
 */
export const urlWapper = (url: string) => {
  const origin = location.origin
  return url.includes('http:') || url.includes('https:') ? url : origin + url
}

/**
 * 获取页面路径参数
 * @param {*} name  参数名
 * @param {*} pageUrl  页面路径
 * @returns
 */
export const getUrlParam = (name: any, pageUrl?: any) => {
  var reg = new RegExp('[?&]' + name + '=([^&#]*)')
  var match = reg.exec(pageUrl ?? window.location.href)
  return match ? decodeURIComponent(match[1]) : null
}

export const validateAsync = (formInstance?: FormInstance | null) => {
  return new Promise((resolve, reject) => {
    if (!formInstance) return reject('没有找到表单实例！')
    formInstance.validate((valid) => {
      if (valid) {
        resolve(true)
      } else {
        reject('校验失败~')
      }
    })
  })
}

export const getImageList = (images: string | ARC.ImageItem[]) => {
  try {
    if (!images) return []
    if (Array.isArray(images)) return images
    return JSON.parse(images)
  } catch (error) {
    const err = error as any
    console.log('[格式化图片返回值]', err?.message)
    return []
  }
}

/**
 * 生成一个简短数值类型
 * - 基于时间戳
 * - 有序
 */
export const generateIntId = (timeScale: number = 1000) => Math.floor(Date.now() / timeScale)

export const generateEasyId = (random = 1000) => {
  return Date.now() + '_' + Math.floor(Math.random() * random)
}

export const base64ToFile = (
  base64String: string,
  fileName: string = new Date().getTime() + '.png',
  mimeType: string = 'image/png'
) => {
  // 获取 Base64 字符串的实际内容（去掉头部的数据类型部分）
  const base64Data = base64String.split(',')[1]

  // 将 Base64 数据解码为字节流
  const byteCharacters = atob(base64Data)

  // 创建一个 Uint8Array 来存储字节
  const byteArrays = new Uint8Array(byteCharacters.length)

  for (let i = 0; i < byteCharacters.length; i++) {
    byteArrays[i] = byteCharacters.charCodeAt(i)
  }

  // 创建 Blob 对象
  const blob = new Blob([byteArrays], { type: mimeType })

  // 创建 File 对象
  const file = new File([blob], fileName, { type: mimeType })

  return file
}

export const sleep = (time: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, time)
  })
}
