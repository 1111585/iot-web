<template>
  <div>
    <div>
      <!-- <span>{{ columnsData.name }}</span> -->
    </div>
    <TabVideo :data="columnsData" :key="forceKey" />
  </div>
</template>

<script setup lang="ts">
import TabVideo from '@/views/deviceManage/components/TabVideo.vue'
import { DrawerInjectKey } from '../utils'

const deviceData = inject(DrawerInjectKey)!

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

const forceKey = ref(0)

watch(
  () => columnsData.value.deviceId,
  () => {
    forceKey.value++
  }
)

onMounted(() => {
  if (deviceData.value) {
    columnsData.value.deviceId = deviceData.value.deviceId as string
    columnsData.value.name = deviceData.value.deviceName || ''
  }
})
</script>

<style scoped></style>
