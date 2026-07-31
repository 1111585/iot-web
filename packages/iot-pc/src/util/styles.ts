import type { TagProps } from 'element-plus'

/** 获取 el-tag 的颜色 */
export function baseTagType(status: number) {
  const ids: Record<number, TagProps['type']> = {
    1101: 'success',
    1102: 'warning',
    1103: 'danger',
    1104: 'info'
  }
  return ids[status] || '' // 空即为默认值 primary 的样式
}
