import { reactive } from 'vue'
import { titles } from './consts'
import { fetchDetail } from './fetch'
import type { DetailPage } from './fetch'

type UsePage = keyof typeof titles

const showTestBtn = ['aiBox']

export const addDialog = reactive({
  visible: false,
  testingBtnVisible: false,
  testingUrl: '',
  type: '' as ARC.DialogType,
  title: '',
  page: '' as UsePage,
  data: {} as ARC.AnyObj,
  showing(type: ARC.DialogType, page: UsePage, data?: ARC.AnyObj) {
    this.title = titles[page][type]
    this.type = type
    this.page = page
    this.visible = true
    if (showTestBtn.includes(page)) {
      this.testingBtnVisible = true
    }
    // 无论什么abcId，来到这里都应该变成 'id'
    if (data) {
      this.data = data
    }
  },
  setTestingUrl(url: string) {
    this.testingUrl = url
  },
  clear() {
    this.visible = false
    this.testingBtnVisible = false
    this.testingUrl = ''
    this.type = '' as ARC.DialogType
    this.title = ''
    this.page = '' as UsePage
    this.data = {}
  }
})

/**
 * @param page 所处页面
 * @param formData 页面对应的表单绑定
 */
export const useDialog = (page: DetailPage, formData: ARC.AnyObj) => {
  watch(
    () => addDialog.visible,
    (flag) => main(flag)
  )

  function main(flag: boolean) {
    if (!flag) return close()
    addDialog.type === 'add' ? add() : edit()
  }

  // 修改内容时，其他非页面表单的内容也要原路返回给接口
  const saveData = ref<ARC.AnyObj>({})

  function add() {
    switch (page) {
      case 'aibox':
        formData.config = 'auto'
        formData.ability = 1
        break
    }
  }

  function edit() {
    fetchDetail(page, addDialog.data).then((res) => {
      if (!res) return
      const rawData = res.raw
      saveData.value = rawData
      reflection(rawData)
    })
  }
  function close() {
    addDialog.clear()
    saveData.value = {}
    Object.keys(formData).forEach((key) => {
      if (Array.isArray(formData[key])) {
        formData[key] = []
      } else if (typeof formData[key] === 'object' && formData[key] !== null) {
        formData[key] = {}
      } else {
        formData[key] = ''
      }
    })
  }

  function reflection(raw: ARC.AnyObj) {
    switch (page) {
      case 'aibox':
        formData.deviceId = raw.aiBoxId
        formData.boxName = raw.aiBoxName
        formData.deviceCode = raw.aiBoxCoding
        formData.ip = raw.ipAddress
        formData.mask = raw.subNetworkMask
        formData.gateway = raw.defaultGateway
        formData.version = raw.version
        formData.ability = raw.analyticalAbility
        formData.installationPosition = raw.installationPosition

        // 根据有无 ip 来判断勾选自动获取、手动配置
        // formData.config 仅用于显示，没有参与后端交互
        if (raw.ipAddress) {
          formData.config = 'manual'
        } else {
          formData.config = 'auto'
        }

        break
      case 'detect':
        formData.deviceId = raw.equipmentId
        formData.deviceName = raw.equipmentName
        formData.deviceCode = raw.equipmentCoding
        formData.deviceType = raw.deviceTypeId
        formData.detectContent = raw.monitoringContent.split('、')
        formData.location = Number(raw.bindingPositionId) // 返回的是字符串，但是下拉选项返回的是数字
        break
      case 'sense':
        formData.deviceName = raw.sensingDeviceName
        formData.deviceId = raw.sensingDeviceId
        formData.deviceCode = raw.sensingDeviceCoding
        formData.deviceType = raw.sensingDeviceType + ''
        formData.lan = raw.intranetAddress
        formData.wan = raw.externalAddress
        formData.aiBox = raw.aiBoxId
        formData.location = raw.bindingPosition
        break
    }

    formData.description = raw.description
    formData.connectedness = raw.connectedness

    try {
      formData.image = JSON.parse(raw.picturePath)
    } catch (error: any) {
      console.log('[设备编辑]', error?.message)
    }
  }

  return {
    saveData
  }
}
