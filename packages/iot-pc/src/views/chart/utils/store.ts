export const useDeviceStatus = reactive({
  visible: false,
  type: '',
  show(type: string) {
    this.visible = true
    this.type = type
  },
  hide() {
    this.visible = false
    this.type = ''
  }
})
