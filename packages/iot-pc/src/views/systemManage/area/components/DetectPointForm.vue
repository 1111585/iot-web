<template>
  <CustomForm
    class="custom-form"
    ref="formRef"
    :form="formData"
    :form-fields="formFields"
    :rules="formRules"
    :is-show-footer-btn="false"
    @submit="onFormSubmit"
  >
    <template #areaName>
      <el-select v-model="formData.areaName">
        <el-option
          v-for="item in addOptions.areaName"
          :key="item.label"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </template>
    <template #buildingName>
      <el-select v-model="formData.buildingName">
        <el-option
          v-for="item in addOptions.buildingName"
          :key="item.label"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </template>
    <template #roomName>
      <el-select v-model="formData.roomName">
        <el-option
          v-for="item in addOptions.roomName"
          :key="item.label"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </template>
  </CustomForm>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import CustomForm from '@/components/form/CustomForm.vue'
import { request } from '@/util/request'
import { deviceApi } from '@/apis/device'
import {
  detectPointForm as formFields,
  detectPointFormRules as formRules,
  fetchAddOptions as fetchAddDetectPointOptions,
  addDialog,
  fetchDetectPointDetail
} from '@/views/systemManage/utils'

type FormData = ARC.ExtractProps<typeof formFields>

const emits = defineEmits<{
  (e: 'refresh'): void
}>()

const formData = ref<FormData>({
  areaName: '',
  roomName: '',
  pointName: '',
  buildingName: '',
  description: ''
})
const formRef = ref()

const addOptions = reactive({
  areaName: [] as ARC.Options[],
  roomName: [] as ARC.Options[],
  buildingName: [] as ARC.Options[]
})

async function onFormSubmit(data: FormData) {
  try {
    // 下拉对应的名称
    const affiliatedPark = addOptions.areaName.find((item) => item.value === data.areaName)?.label
    const buildingName = addOptions.buildingName.find(
      (item) => item.value === data.buildingName
    )?.label
    const localCityName = addOptions.roomName.find((item) => item.value === data.roomName)?.label
    const pointId = addDialog.data?.id

    const urls = {
      add: deviceApi.addDetectPoint,
      edit: deviceApi.editDetectPoint
    }
    const msgs = {
      add: '添加成功',
      edit: '保存成功'
    }

    const url = urls[addDialog.type]
    const msg = msgs[addDialog.type]

    const { code } = await await request.postJson(url, {
      pointId: pointId,
      pointName: formData.value.pointName, //点位名称
      affiliatedPark: affiliatedPark, //所属园区
      affiliatedParkId: formData.value.areaName, //所属园区ID
      buildingName: buildingName, //楼宇名称
      buildingId: formData.value.buildingName, //楼宇ID
      localCityName: localCityName, //市内名称
      localCityId: formData.value.roomName, //市内ID
      description: formData.value.description, //描述
      departmentName: '本部门', //部门名称
      departmentId: '1' //部门ID
    })

    if (code !== 100) throw '失败了'

    ElMessage.success(msg)
    addDialog.visible = false
    Object.keys(formData.value).forEach((key) => {
      formData.value[key] = ''
    })

    emits('refresh')
  } catch (error) {
    console.log('error :>> ', error)
  }
}

function confirm() {
  formRef.value?.confirm()
}

defineExpose({ confirm })

onMounted(() => {
  fetchAddDetectPointOptions().then((res) => {
    if (!res) return
    formFields.forEach((item) => {
      if (item.prop === 'areaName') {
        addOptions.areaName = res.areaOptions
      } else if (item.prop === 'buildingName') {
        addOptions.buildingName = res.buildingOptions
      } else if (item.prop === 'roomName') {
        addOptions.roomName = res.roomOptions
      }
    })
  })

  if (addDialog.type === 'edit') {
    fetchDetectPointDetail(addDialog.data?.id).then((res) => {
      if (!res) return
      formData.value.areaName = res.affiliatedParkId
      formData.value.roomName = res.localCityId
      formData.value.buildingName = res.buildingId
      formData.value.pointName = res.pointName
      formData.value.description = res.description
    })
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/mixin.scss';
.custom-form {
  padding: 20px;
  padding-right: 40px;
  @include mixin.selector-full-width();
}
</style>
