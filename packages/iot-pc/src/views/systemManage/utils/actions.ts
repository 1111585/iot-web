import { ElNotification } from 'element-plus'

import useUserStore from '@/store/user'
import { usePolling } from '@/composable/useAny'
import { authCode } from '@/consts/authCode'
import { addDialog } from './dialog'
import { fetchErrorLogs } from './fetch'

type UsePage = 'detectPoint'

type Action = Record<UsePage, ARC.Action[]>

const isDev = import.meta.env.DEV

export const tableActions: Action = {
  detectPoint: [
    { text: '编辑', callback: handleEdit },
    { text: '删除', callback: handleRemove }
  ]
}

function handleEdit(row: ARC.AnyObj) {
  return new Promise((resolve, reject) => {
    console.log('编辑', row)
    addDialog.showing('edit', 'detectPoint')
    addDialog.setData(row)
    // request.get(deviceApi.editDetectPoint).then((res) => {})
  })
}

function handleRemove(row: ARC.AnyObj) {
  return new Promise((resolve, reject) => {
    // request.get(deviceApi.deleteDetectPoint).then((res) => {})
  })
}

/**
 * 监听错误日志
 */
export function listenErrorLogs() {
  const isInWhitelist = () => {
    if (location.pathname === '/login') {
      return true
    }
    return false
  }
  // 用于存储上一次的错误日志总数
  const ERROR_LOGS_TOTAL_KEY = 'error_logs_total'
  // 用于存储已展示过的错误日志ID，避免重复通知
  const ERROR_LOGS_SHOWN_KEY = 'error_logs_shown'
  const SHOW_CHOUNTS = 5

  // 获取存储的错误日志总数
  const getStoredTotal = () => {
    const stored = localStorage.getItem(ERROR_LOGS_TOTAL_KEY)
    return stored ? parseInt(stored, 10) : 0
  }

  // 保存错误日志总数
  const setStoredTotal = (total: number) => {
    localStorage.setItem(ERROR_LOGS_TOTAL_KEY, total.toString())
  }

  // 获取已展示过的错误日志ID
  const getShownIds = (): number[] => {
    const stored = localStorage.getItem(ERROR_LOGS_SHOWN_KEY)
    return stored ? JSON.parse(stored) : []
  }

  // 保存已展示过的错误日志ID
  const setShownIds = (ids: number[]) => {
    localStorage.setItem(ERROR_LOGS_SHOWN_KEY, JSON.stringify(ids))
  }

  // 轮询查询异常数据回调
  const pollCallback = async () => {
    try {
      const userInfo = useUserStore().userInfo
      if (!userInfo) return

      /*
      const USERNAME_CAN_FETCH = '审计管理员'
      const userName = userInfo.nickname
      if (userName !== USERNAME_CAN_FETCH) return
      */

      const userRole = userInfo.roleType.split(',')
      if (!userRole.includes(authCode.auditRole)) return

      // if (isDev) return
      if (isInWhitelist()) return

      const result = await fetchErrorLogs()
      if (!result) return

      const { list, total } = result
      const storedTotal = getStoredTotal()

      // 如果总数增加，说明有新的错误日志
      if (total > storedTotal) {
        // 更新存储的总数
        setStoredTotal(total)

        // 获取已展示过的ID
        let shownIds = getShownIds()

        // 过滤出新的错误日志（按ID判断）
        const newLogs = list.filter((log: any) => !shownIds.includes(log.id))

        // 如果有新的错误日志
        if (newLogs.length > 0) {
          // 按创建时间排序，最新的在前面
          newLogs.sort(
            (a: any, b: any) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
          )

          // 取最新的5条
          const latestLogs = newLogs.slice(0, SHOW_CHOUNTS)

          // 更新已展示过的ID
          const newShownIds = [...shownIds, ...latestLogs.map((log: any) => log.id)].slice(-100) // 保留最近100个ID，避免存储过多

          setShownIds(newShownIds)

          const displayLogs = latestLogs.slice(0, SHOW_CHOUNTS)
          displayLogs.forEach((log: any, index) => {
            setTimeout(() => {
              ElNotification({
                title: `异常提示 ${log.name}`,
                message: `操作人：${log.userName}\nIP：${log.ip}\n时间：${log.createTime}\n`,
                type: 'error',
                duration: 10000 // 10秒后自动关闭
              })
            }, index * 1000) // 每个通知间隔1秒显示
          })

          // 在所有错误日志显示完成后，显示一次总结性提示
          setTimeout(() => {
            ElNotification({
              title: '异常提示',
              message: `请前往系统日志页面查看详细信息！`,
              type: 'info',
              duration: 10000 // 10秒后自动关闭
            })
          }, displayLogs.length * 1000)
        }
      } else {
        // 如果总数没有增加，更新存储的总数（可能有删除操作）
        setStoredTotal(total)
      }
    } catch (error) {
      console.error('轮询错误日志失败:', error)
    }
  }

  // 创建轮询实例，每10秒检查一次
  const polling = usePolling(pollCallback, 1000 * 10, true)

  // 开始轮询
  polling.startPolling()

  // 返回停止轮询的函数，供外部调用
  return () => {
    polling.stopPolling()
  }
}
