<template>
  <FormDialog v-model="dialogVisible" :title="title" height="250px" draggable>
    <template #content>
      <el-form ref="formRef" label-width="100px">
        <el-form-item label="处置结果">
          <el-radio-group v-model="formData.result">
            <el-radio-button
              v-for="item in handleRadios"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
              {{ item.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            type="textarea"
            placeholder="输入内容"
            v-model="formData.note"
            :rows="4"
            :maxlength="100"
            show-word-limit
          />
        </el-form-item>
      </el-form>
    </template>
    <template #footer>
      <div class="handle-dialog-footer">
        <el-button plain @click="onCancelBtnClick">{{ cancelBtnText }}</el-button>
        <el-button type="primary" @click="onConfirmBtnClick">{{ confirmBtnText }}</el-button>
      </div>
    </template>
  </FormDialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import FormDialog from '@/components/base/formDialog.vue'
import { request } from '@/util/request'
import { deviceApi } from '@/apis/device'
import { handleRadios } from '../utils'
import type { EventData } from '../types'

interface Props {
  // id: ARC.SN
  visible: boolean
  title?: string
  cancelBtnText?: string
  confirmBtnText?: string
  data: EventData
}

const props = withDefaults(defineProps<Props>(), {
  dialogTitle: '处理页面',
  cancelBtnText: '取消',
  confirmBtnText: '确定'
})
const emit = defineEmits(['update:visible', 'refresh'])

const dialogVisible = computed({
  get() {
    return props.visible
  },
  set(val) {
    emit('update:visible', val)
  }
})

const formRef = ref<FormInstance | null>(null)
const formData = reactive({
  result: handleRadios[0].value,
  note: ''
})
const initPayload = reactive({
  warningInformationId: props.data.id, //预警主键ID
  // id: props.data.id, //预警主键ID
  equipmentName: props.data.senseDevice,
  equipmentId: props.data.senseDeviceId,
  levelType: props.data.typeRaw,
  deployControlId: props.data.deployControlId,
  picturePath: '' //图片ID，json格式
  // handlerPhone: '18671002340' //处理人联系方式
})

function onCancelBtnClick() {
  dialogVisible.value = false
}

async function onConfirmBtnClick() {
  try {
    const payload = {
      disposeType: formData.result,
      remark: formData.note, //备注
      ...initPayload
    }
    await request.postJson(deviceApi.status.event, payload)
    dialogVisible.value = false
    formData.note = ''
    formData.result = handleRadios[0].value
    emit('refresh')
    ElMessage.success('处理成功')
  } catch (error) {
    console.log(error)
  }
}

function initData() {
  const payload = {
    ...initPayload,
    id: props.data.id
  }
  request.get(deviceApi.initEventDetail, payload).then(() => {
    console.log('[预警详情]初始化成功')
  })
}

onMounted(() => {
  // initData()
})
</script>

<style lang="scss" scoped>
.handle-dialog {
  &-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
}
</style>
