<template>
  <el-switch v-model="switchStatus" :loading="is.loading" @change="(val) => onChange(val)" />
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { request } from '@/util/request'
import { deviceApi } from '@/apis/device'

interface Props {
  /** 设备id */
  id: string | number
  /** 设备类型 */
  type: keyof typeof urls
  status: boolean
}
interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'refresh'): void
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

enum Status {
  DISABLE,
  ENABLE
}

const switchStatus = ref(props.status)

const urls = {
  aibox: deviceApi.status.aiBox,
  detect: deviceApi.status.detectDevice,
  sense: deviceApi.status.senseDevice
}

const keys = {
  aibox: 'boxId',
  detect: 'monitoringEquipmentId',
  sense: 'sensingId'
}

const is = reactive({
  loading: false
})

function onChange(value: boolean | string | number) {
  if (is.loading) return
  is.loading = true

  request
    .get(urls[props.type], {
      [keys[props.type]]: props.id,
      enable: value ? Status.ENABLE : Status.DISABLE
    })
    .then((res) => {
      const resStatus = res.data // 成功 1
      resStatus ? ElMessage.success('操作成功') : ElMessage.error('操作失败')
      emits('refresh')
    })
    .finally(() => (is.loading = false))
}
</script>

<style scoped></style>
