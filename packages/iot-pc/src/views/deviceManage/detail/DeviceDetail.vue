<template>
  <div class="device-detail">
    <section class="baseinfo">
      <h3 class="baseinfo__title">基本信息</h3>
      <el-row :gutter="24">
        <el-col class="column" v-for="item in columns" :key="item.prop" :span="12">
          <span>{{ item.label }}：</span>
          <span v-if="item.prop === 'img'">
            <el-image
              v-for="img in columnsData[item.prop]"
              class="media-img"
              fit="cover"
              :key="img.name"
              :src="img.url"
              :preview-src-list="[img.url]"
            />
          </span>
          <el-skeleton
            v-else
            style="display: inline-block; width: 60%; margin-left: 14px"
            animated
            :loading="is.loading"
            :rows="1"
          >
            <template #template>
              <el-skeleton-item variant="text" />
            </template>
            <template #default>
              <span>{{ columnsData?.[item.prop] || '-' }}</span>
            </template>
          </el-skeleton>
        </el-col>
      </el-row>
    </section>
    <section>
      <el-tabs v-model="activeTab" class="demo-tabs" @tab-click="handleTabClick">
        <el-tab-pane v-if="page === 'sense'" label="实时视频" name="realTimeVideo">
          <TabVideo
            v-if="columnsData.name"
            :data="columnsData"
            :shapes="shapes"
            :shapesTemperature="shapesTemperature"
          />
        </el-tab-pane>
        <el-tab-pane v-if="page !== 'sense'" label="配置信息" name="configInfo">
          <TabConfigInfo v-if="columnsData.name" />
        </el-tab-pane>
        <el-tab-pane v-if="page === 'sense'" label="网络地址" name="netInfo">
          <TabNetInfo v-if="columnsData.name" :data="columnsData" />
        </el-tab-pane>
        <el-tab-pane v-if="page !== 'sense'" label="布控信息" name="deployInfo">
          <TabDeployInfo v-if="columnsData.name" />
        </el-tab-pane>
        <el-tab-pane v-if="page !== 'aibox'" label="告警记录" name="alertInfo">
          <TabAlertInfo v-if="columnsData.name" />
        </el-tab-pane>
        <el-tab-pane
          v-if="page !== 'aibox' && page !== 'sense'"
          label="周边资源"
          name="resourceInfo"
        >
          <TabResourceInfo v-if="columnsData.name" />
        </el-tab-pane>
        <template v-if="page === 'sense'">
          <el-tab-pane label="温度曲线" name="chart-temp">
            <TabChart type="temp" />
          </el-tab-pane>
          <el-tab-pane label="设备态势" name="chart-device">
            <TabChart type="device" />
          </el-tab-pane>
        </template>
      </el-tabs>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { TabsPaneContext } from 'element-plus'

import TabAlertInfo from '../components/TabAlertInfo.vue'
import TabConfigInfo from '../components/TabConfigInfo.vue'
import TabDeployInfo from '../components/TabDeployInfo.vue'
import TabResourceInfo from '../components/TabResourceInfo.vue'
import TabVideo from '../components/TabVideo.vue'
import TabNetInfo from '../components/TabNetInfo.vue'
import TabChart from '../components/TabChart.vue'
import { getImageList, formatDate } from '@/util'
import {
  deviceDetailColumns,
  senseDeviceDetailColumns,
  fetchDeviceDetail,
  fetchAreaTemp,
  injectKeys
} from '../utils'
import type { DrawShape } from '@/components/drawing/types'
import type { DeviceDetailRes, AreaTempRes } from '../types'

/**
 *  ai盒子、监测设备、感知设备 的详情页
 */

interface Props {
  page: ARC.MonitorDeviceType
  id?: ARC.SN
  data?: ARC.AnyObj
  activeTab?: string
}
const props = defineProps<Props>()

provide(injectKeys.page, props.page)
provide(injectKeys.data, props.data || {})

// ... 应该都用小写, 由 ARC.MonitorDeviceType 约束
enum ReflectName {
  'aiBox' = 'aibox',
  'detectDevice' = 'detect',
  'senseDevice' = 'sense',
  'aibox' = 'aibox',
  'detect' = 'detect',
  'sense' = 'sense'
}

const is = reactive({
  loading: false
})

/** 用来循环渲染的数据: 如 设备名: 计算盒子001 */
const columns = ref()
const columnsData = ref({
  name: '', // 设备名称
  deviceId: '', // 设备ID
  deviceCode: '', // 设备编号
  location: '', // 绑定位置
  // ability: '', // 能力中心
  description: '', // 描述
  contact: '', // 添加联系人方式
  img: [] as { url: string; name: string }[], // 设备图片
  addDate: '', // 添加时间
  aiBoxName: '', // ai盒子名称
  sensingDeviceType: 1
})

const baseInfo = ref<DeviceDetailRes['info']>()
const shapes = ref<DrawShape[]>([])
const shapesTemperature = ref<AreaTempRes[]>([])

const activeTab = ref('configInfo')
const handleTabClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event)
}

onMounted(() => {
  const id = props?.id || props?.data?.id
  const type = ReflectName[props.page]
  console.log('[设备详情]', type)

  // 感知设备默认tab为实时视频，如果传入了activeTab则使用传入的值
  if (props.page === 'sense') {
    activeTab.value = props.activeTab || 'realTimeVideo'
    columns.value = senseDeviceDetailColumns
  } else {
    columns.value = deviceDetailColumns
  }

  is.loading = true
  fetchDeviceDetail(type, id, props.data?.deviceId)
    .then(async (res) => {
      if (!res?.raw) return
      const data = res.raw.info
      baseInfo.value = data

      const tempRes = await fetchAreaTemp(props.data?.deviceId)
      if (tempRes?.raw) {
        shapesTemperature.value = tempRes.raw
      }

      switch (type) {
        case 'aibox':
          columnsData.value.name = data.aiBoxName
          columnsData.value.deviceId = data.aiBoxId
          columnsData.value.deviceCode = data.aiBoxCoding
          break
        case 'detect':
          /**
           * 监测设备
           * 下面这几个字段，传递不同的type返回不一样
           */
          // @ts-ignore
          columnsData.value.name = data.monitoringEquipmentName || data.equipmentName
          // @ts-ignore
          columnsData.value.deviceId = data.monitoringEquipmentId || data.equipmentId
          // @ts-ignore
          columnsData.value.deviceCode = data.monitoringEquipmentCoding || data.equipmentCoding
          break
        case 'sense':
          columnsData.value.name = data.sensingDeviceName
          columnsData.value.deviceId = data.sensingDeviceId
          columnsData.value.deviceCode = data.sensingDeviceCoding
          columnsData.value.aiBoxName = data.aiBoxName
          columnsData.value.sensingDeviceType = data.sensingDeviceType
          break
      }

      const dataNeeds = data.addTime || data.updateTime
      const contactNeeds = data.addPhone || data.updateUser

      columnsData.value.location = data?.installationPosition || data.bindingPosition
      columnsData.value.description = data.description
      columnsData.value.contact = contactNeeds
      columnsData.value.addDate = formatDate(dataNeeds, 'yyyy年MM月dd日 hh:mm')
      columnsData.value.img = getImageList(data.picturePath)

      shapes.value =
        res.raw?.monitoringInformationList
          .filter((item) => item.deviceType != 1)
          .map((item) => {
            const drawCfg = JSON.parse(item.drawCfg)
            let detZones: any[] = []
            try {
              detZones = JSON.parse(item.dets)?.detZones || []
            } catch {
              detZones = []
            }
            // 按 id 匹配 dets 里的区域，取归一化坐标（老数据也有，与发 AI 盒子的一致）
            const zone = detZones.find((z: any) => String(z.id) === String(drawCfg.id))
            return { ...drawCfg, normalizedPoints: zone?.points || [] }
          }) || []

      shapes.value.forEach((item) => {
        item.config.stroke = 'green'
      })
    })
    .finally(() => {
      is.loading = false
    })
})
</script>

<style lang="scss" scoped>
.device-detail {
  margin: 0 auto;
  // padding: 20px;

  section {
    margin-bottom: 10px;
  }

  .column {
    line-height: 1.2em;
    padding: 5px 0;
    font-size: 14px;
    // & span:first-child {
    //   font-weight: bold;
    // }
  }
}
.media-img {
  width: 150px;
  vertical-align: text-top;
}

.baseinfo {
  padding: 10px 20px;
  background-color: #f5f7fa;
  border-radius: 4px;

  &__title {
    position: relative;
    margin-bottom: 10px;
    font-weight: bold;
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: -10px;
      transform: translateY(-60%);
      display: inline-block;
      width: 4px;
      height: 14px;
      margin-right: 10px;
      border-radius: 4px;
      background-color: var(--el-color-primary);
    }
  }
}
</style>
