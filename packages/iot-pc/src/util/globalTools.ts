/**
 * !!!!! 看我
 * 这个文件里面的方法应该是纯工具
 * 会在 DOMContentLoaded 之前、vue实例挂载之前执行
 * 在 index.html 中引入
 */

const safeJsonParse = <T>(str: string, log = false): T | null => {
  try {
    return JSON.parse(str)
  } catch (error) {
    log && console.error('[SafeJsonParse]', error)
    return null
  }
}
/**
 * 和项目名称相同应该取名 iot-pc，但是全局namespace用了 ARC，所以和其他类型保持一致取 arc_xx
 * 。。。。。。在 vite.define 中重写为 __tools
 */
function _bootstrap() {
  ;(window as any).__arc_pc_tools = { safeJsonParse }
}

// document.addEventListener('DOMContentLoaded', () => {
//   bootstrap()
// })

// ？？？
_bootstrap()
