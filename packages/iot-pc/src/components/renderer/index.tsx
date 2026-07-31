import { ElIcon, ElRow, ElCol } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import './index.scss'
import type { ColumnsProps } from './types'

/**
 * <el-image>图片加载失败占位符
 * @example
 * ```vue
 * <template #error>
 *   <ImageError />
 * </template>
 * ```
 */
export function ImageError() {
  return (
    <div class="fc-image-slot">
      <ElIcon size="35">
        <Picture />
      </ElIcon>
    </div>
  )
}

/**
 * 传入一条字符串，使得文本对齐
 * @example
 * ```
 * 文   本
 * 文本对齐
 * ```
 * 其他方式：text-align: justify ???
 */
export function AsLongAsMe(props: { str: string }) {
  return (
    <div class="fc-as-long">
      {props.str.split('').map((item) => {
        return <span>{item}</span>
      })}
    </div>
  )
}

export function Columns(props: ColumnsProps) {
  return (
    <>
      {props.columns.map((item) => (
        <div class="fc-column">
          <span class="fc-column-label">{item.label}：</span>
          <span class="fc-column-value">{item.value}</span>
        </div>
      ))}
    </>
  )
}

/**
 * 没有加载出视频流后的占位
 */ 
export function NoVideoStream() {
  return (
    <div class="fc-no-video-stream">暂时没有视频流</div>
  )
}
