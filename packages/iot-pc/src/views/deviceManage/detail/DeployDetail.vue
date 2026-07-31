<template>
  <div class="deploy-detail">
    <section>
      <h3>基本信息</h3>
      <div v-for="item in columns" class="column" :key="item.prop">
        <span>{{ item.label }}：</span>
        <span>{{ columnData[item.prop] }}</span>
      </div>
    </section>
    <section>
      <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleTabClick">
        <el-tab-pane v-for="item in tabs" :key="item.text" :label="item.text" :name="item.value">
        </el-tab-pane>
      </el-tabs>
    </section>
  </div>
</template>

<script setup lang="ts">
interface DeviceData {
  id: number
  detectDevice: string
  detectType: string
  areaPoint: string
  /** 红外 */
  infrared: string
  infraredStatus: string | number
  light: string
  lightStatus: string | number
  image: string
}

interface Tab {
  text: string
  value: string
}

interface Props {
  data: DeviceData
}

const props = defineProps<Props>()

const columns = [
  {
    label: '监测设备',
    prop: 'name'
  },
  {
    label: '设备描述',
    prop: 'deviceId'
  }
]

const columnData = ref({
  name: '',
  deviceId: ''
})

const tabs = ref<Tab[]>([
  {
    text: '红外设备AA',
    value: '1'
  },
  {
    text: '红外设备BB',
    value: '2'
  }
])

interface DeployInfo {
  deviceName: string
  deviceSesc: string
  detectDeviceList: [
    {
      deviceName: string
      /** 监测区域 */
      detectLocation: [
        {
          locationName: string
          locationSituation: {
            detectDistance: string
            firstLevelAlertTempature: string
            secondLevelAlertTempature: string
            cd: string
          }
          locationBox: {
            boxName: string
          }
          locationAddUser: {
            name: string
            phone: string
            addDate: string
          }
          locationAlertList: {
            title: string
            device: string
            time: string
            descrition: string
            status: string
            [key: string]: any
          }[]
        }
      ]
    }
  ]
}

const activeName = ref('configInfo')
function handleTabClick() {}
</script>

<style lang="scss" scoped>
.deploy-detail {
  margin: 0 auto;
  padding: 20px;

  section {
    margin-bottom: 10px;

    h3 {
      margin-bottom: 10px;
      font-size: 16px;
      font-weight: bold;
    }
  }

  .column {
    padding: 10px 0;
    font-size: 14px;
  }
}
</style>
