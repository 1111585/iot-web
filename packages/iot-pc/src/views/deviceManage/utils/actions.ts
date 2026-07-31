import { deviceApi } from '@/apis/device'
import { useGet } from '@/composable/requestSup'
import { request } from '@/util/request'
import { titles } from './consts'
import { addDialog } from './dialog'

type UsePage = keyof typeof titles

type Action = Record<UsePage, ARC.Action[]>

export const tableActions: Action = {
  aiBox: [
    { text: '编辑', callback: (row) => handleEdit(row, 'aiBox') },
    { text: '删除', callback: (row, refresh) => handleRemove(row, 'aiBox', refresh) }
  ],
  detectDevice: [
    { text: '编辑', callback: (row) => handleEdit(row, 'detectDevice') },
    { text: '删除', callback: (row, refresh) => handleRemove(row, 'detectDevice', refresh) }
  ],
  senseDevice: [
    { text: '编辑', callback: (row) => handleEdit(row, 'senseDevice') },
    { text: '删除', callback: (row, refresh) => handleRemove(row, 'senseDevice', refresh) }
  ],
  deployDevice: [
    { text: '编辑', callback: (row) => handleEdit(row, 'deployDevice') },
    { text: '删除', callback: handleRemove }
  ]
}

enum ToggleAction {
  open = 1,
  close = 0
}

type ToggleCfg = {
  deviceId: string
  deviceType: number // 可见光、红外、红外+可见光
  action: 'open' | 'close'
}
export async function toggleSenseDeviceLight(cfg: ToggleCfg) {
  try {
    const reqData = {
      deviceId: cfg.deviceId,
      deviceType: cfg.deviceType,
      action: ToggleAction[cfg.action]
    }
    const { code } = await request.get(deviceApi.status.senseDeviceLight, reqData)

    return code === 100
  } catch (error: any) {
    console.log('[补光]', error?.message)
    return false
  }
}

function handleEdit(row: ARC.AnyObj, page: UsePage) {
  addDialog.showing('edit', page, row)
}

const deleteKeys = {
  aiBox: 'boxId',
  detectDevice: 'monitoringEquipmentId',
  senseDevice: 'sensingId'
  // deployDevice: 'id'
}

const deleteUrls = {
  aiBox: deviceApi.deleteAiBox,
  detectDevice: deviceApi.deleteDetectDevice,
  senseDevice: deviceApi.deleteSenseDevice
  // deployDevice: deviceApi.deleteDeployDevice
}

function handleRemove(row: ARC.AnyObj, page: UsePage, refresh: () => void) {
  useGet(deleteUrls[page], { [deleteKeys[page]]: row.id }, '删除', '是否要删除').then(() => {
    refresh()
  })
}
