<template>
  <el-button class="add-dialog-footer__left" :plain="plain" :loading="is.loading" @click="testing">
    {{ btnText }}
    <template #icon v-if="result !== undefined">
      <el-icon v-if="result === false" class="el-icon--left" color="#f56c6c">
        <WarnTriangleFilled />
      </el-icon>
      <el-icon v-if="result" class="el-icon--left" color="#95d475"><SuccessFilled /></el-icon>
    </template>
  </el-button>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { WarnTriangleFilled, SuccessFilled } from '@element-plus/icons-vue'
import { request } from '@/util/request'
import { deviceApi } from '@/apis/device'
import { validateIpv4WithPort } from '@/util/validate'

interface Props {
  btnText?: string
  plain?: boolean
  targetUrl: string
  deviceType: ARC.MonitorDeviceType
  data?: ARC.AnyObj
  ways?: 'auto' | 'manual'
}

const props = withDefaults(defineProps<Props>(), {
  btnText: '测试是否连通',
  plain: true,
  ways: 'auto'
})
const emits = defineEmits(['onClick', 'getResult'])

const urls = {
  aibox: deviceApi.testSenseDevice,
  sense: deviceApi.testSenseDevice
}
const result = ref() // undefined 不显示图标，false 显示叹号图标，true 显示对勾图标
const is = reactive({
  loading: false
})

function validating(): Promise<void> {
  return new Promise((resolve, reject) => {
    const flag = validateIpv4WithPort(props.targetUrl)
    if (flag) return resolve()
    ElMessage.warning('请输入正确的地址！')
    reject()
  })
}

async function testing() {
  is.loading = true
  console.log('[测试联通性]', props.targetUrl)
  try {
    await validating()
    const reqUrl = urls[props.deviceType] || deviceApi.testSenseDevice
    const { data } = await request.get(reqUrl, {
      url: props.targetUrl
    })

    if (data) {
      ElMessage.success('成功连接！')
    } else {
      ElMessage.error('无法连接！')
    }

    result.value = data || false
    emits('getResult', result.value)
  } catch (error) {
    console.log('[测试联通性]失败', error, props.targetUrl)
  } finally {
    is.loading = false
  }
}
</script>

<style scoped></style>
