import { reactive } from 'vue'
import { titles } from './consts'

type UsePage = keyof typeof titles

export const addDialog = reactive({
  visible: false,
  testingBtnVisible: false,
  type: '' as ARC.DialogType,
  title: '',
  data: {} as ARC.AnyObj,
  showing(type: ARC.DialogType, page: UsePage) {
    this.title = titles[page][type]
    this.type = type
    this.visible = true
  },
  setData(data: ARC.AnyObj) {
    this.data = data
  }
})
