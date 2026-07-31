export {}
declare global {
  interface RepDataType<T = any> {
    code: number
    msg: string
    data: T
  }
}
