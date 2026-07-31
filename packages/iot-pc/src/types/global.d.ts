declare namespace ARC {
  type DialogType = 'add' | 'edit'

  type AnyObj = Record<string, any>

  type SN = string | number

  /**
   * 从数组中提取prop作为对象的key（表单渲染、表格渲染）
   * - T = typeof anyObj
   * - 对象必须断言为const
   *   - as const 的对象里面动态内容都用 slot 来渲染（如表单的下拉选项需要从接口获取）
   */
  type ExtractProps<T> = {
    // [K in T[number]['prop']]: string | number | string[]
    [K in T[number]['prop']]: any
  }

  interface Action {
    text: string
    callback: (...arg: any[]) => void
  }

  interface StateAction<T = string> {
    type: T
    payload: AnyObj
  }

  interface RectCoords {
    x: number
    y: number
  }

  /** 下拉选项 */
  interface Options {
    label: string | number
    value: string | number
    disabled?: boolean
    [key: string]: any
  }

  interface ListRes<T> {
    list: T[]
    total: number
    size: number
    pages: number
  }

  interface RecordsRes<T> {
    records: T[]
    total: number
    size: number
    current: number
    pages: number
  }

  interface ImageItem {
    name: string
    url: string
    fid?: string
    size?: string
  }

  interface FormDialog {
    visible: boolean
    title: string
    type?: string
    [key: string]: any
  }

  /** 感知设备类型：可见光 | 红外 */
  type SenseType = 'light' | 'infrared'

  /**
   * 平台涉及到的监控设备种类
   * - aibox: ai盒子 或者 算法服务器
   * - detect: 监测设备
   * - sense: 感知设备
   */
  type MonitorDeviceType = 'aibox' | 'detect' | 'sense'

  interface ListQuery {
    pageSize?: number
    pageNum?: number
    keyword?: string
    [key: string]: any
  }

  interface Column {
    label: string
    prop: string
    width?: string
    fixed?: 'left' | 'right'
    align?: 'left' | 'center' | 'right'
    slot?: string // 插槽名称
    [key: string]: any
  }

  interface FormField {
    label: string
    prop: string
    type: string
    attrs?: Record<string, any>
    [key: string]: any
  }

  namespace Res {
    /** 列表页的气泡数值 */
    interface Counts {
      name: string
      num: number
    }
  }
}

declare global {
  interface RepDataType<T = any> {
    code: number
    msg: string
    data: T
  }

  interface TokenType {
    token: string
    refreshToken: string
    expired: string
  }

  interface MenuType {
    id: string
    parentId: string
    weight: number
    name: string
    icon: string
    sort: number
    category: number
    type: number
    code: string
    url: string
    children?: MenuType[]
  }

  export interface Message {
    role: string
    name: string
    id: string
    content: string | Content[]
    parentId: string
    createAt: number
    status: 'loading' | 'incomplete' | 'complete' | 'error'
    // [x: string]: any;
  }

  /**
   * 挑出非必须的
   * t = {a,b,c,d}
   *  OptionalPickRequired<t,'a'|'b'>  =  {a,b} & {c?,b?}
   *
   */
  type OptionalPickRequired<T, K extends keyof T> = Pick<T, K> & Partial<Omit<T, K>>
  /**
   * 排除非必须的
   *  t = {a,b,c,d}
   *  OptionalPickRequired<t,'a'|'b'>  =   {c,d} & {a?,b?}

   * 
   */
  type OptionalOmitRequired<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
}
