import { request } from '@/util/request'
import { useGet } from '@/composable/requestSup'
import { deviceApi } from '@/apis/device'
import { parkColumns } from './consts'
import { addDialog } from './dialog'
import { addDialog as addPointDialog } from '@/views/systemManage/utils'

interface RowType extends ARC.ExtractProps<typeof parkColumns> {
  type: keyof typeof baseUrls
}

// 所属园区、所属楼宇、所属房间
const baseUrls = {
  delete: {
    park: deviceApi.deletePark,
    building: deviceApi.deleteBuilding,
    room: deviceApi.deleteRoom
  },
  edit: {
    park: deviceApi.editPark,
    building: deviceApi.editBuilding,
    room: deviceApi.editRoom
  }
}

function handleRemove(row: RowType, refresh: () => void) {
  const url = baseUrls.delete[row.type]
  const keys = {
    park: 'parkId',
    building: 'buildingId',
    room: 'localCityId'
  }
  useGet(url, { [keys[row.type]]: row.id }, '删除', '是否要删除').then(() => refresh())
}

function handleEdit(row: RowType, refresh: () => void) {
  console.log('[位置管理]编辑', row)
  addDialog.value.show('edit', row)
}

function handlePointEdit(row: RowType, refresh: () => void) {
  console.log('[位置管理]编辑点位', row)
  addPointDialog.type = 'edit'
  addPointDialog.data = row
  addPointDialog.visible = true
  addDialog.value.visible = true
}

function handlePointRemove(row: RowType, refresh: () => void) {
  console.log('[位置管理]删除点位', row)
  useGet(deviceApi.deleteDetectPoint, { pointId: row.id }, '删除', '是否要删除当前点位').then(() =>
    refresh()
  )
}

const onError = (error: any) => console.log('[区域管理]表格操作出错了', error?.message)

export const baseActions: ARC.Action[] = [
  { text: '编辑', callback: (row, refresh) => handleEdit(row, refresh) },
  { text: '删除', callback: (row, refresh) => handleRemove(row, refresh) }
]

// 点位管理是额外的接口和数据结构
export const pointActions: ARC.Action[] = [
  { text: '编辑', callback: (row, refresh) => handlePointEdit(row, refresh) },
  { text: '删除', callback: (row, refresh) => handlePointRemove(row, refresh) }
]
