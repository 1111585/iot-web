/** 位置添加、修改弹窗 */
export const addDialog = ref({
  visible: false,
  data: {} as ARC.AnyObj,
  type: '' as ARC.DialogType,
  show(type: ARC.DialogType, data?: ARC.AnyObj) {
    if (data) this.data = data
    this.type = type
    this.visible = true
  },
  clear() {
    this.data = {}
  }
})
