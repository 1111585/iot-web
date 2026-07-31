<template>
  <form-dialog
    :title="combTitle"
    height="unset"
    @onSubmit="handleSubmit(entFromRef)"
    @close="close"
    v-model="visible"
  >
    <template #content>
      <el-form
        size="default"
        :model="state.entData"
        :rules="state.rules"
        ref="entFromRef"
        label-width="120px"
      >
        <el-form-item label="企业名称：" prop="entName">
          <el-input size="default" v-model="state.entData.entName"></el-input>
        </el-form-item>
        <ElFormItem label="企业logo：" prop="logo">
          <SingleUpload
            v-if="!loading"
            :limitFileMB="2"
            class="avatar-uploader"
            :listType="'picture-card'"
            accept="image/png"
            @change="handleUploadLogo"
            v-model="state.entData.logo"
            @onPreview="handlePreview"
          >
            <template #default
              ><ElIcon :size="20" class="avatar-uploader-icon"><i-ep-Plus /></ElIcon
            ></template>
          </SingleUpload>
        </ElFormItem>
        <ElFormItem label="所在地区：" prop="areaCode">
          <ElCascader
            v-model="state.entData.areaCode"
            :options="areas"
            :props="{ label: 'label', value: 'value' }"
            filterable
            ref="areaRef"
            @change="handleAreaChange"
          />
        </ElFormItem>
        <el-form-item label="企业描述：" prop="introduce">
          <el-input
            placeholder="请输入内容"
            type="textarea"
            v-model="state.entData.introduce"
            :rows="2"
          ></el-input>
        </el-form-item>
        <el-form-item label="是否启用：">
          <el-radio-group v-model="state.entData.status">
            <el-radio :value="1101">启用</el-radio>
            <el-radio :value="1102">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </template>
    <template #footer>
      <el-button @click="close">取消</el-button>
      <el-button type="primary" @click="handleSubmit(entFromRef)" :loading="saveLoading"
        >确定</el-button
      >
    </template>
  </form-dialog>
  <previewer v-model="previewImg" :hideOnClickModal="true" />
</template>
<script setup lang="ts">
import { useDetailForm } from '@/composable/listWithFormSup'
import { type FormInstance } from 'element-plus'
import { request } from '@/util/request'
import entApi from '@/apis/ent'
import { usePostJson, useGet } from '@/composable/requestSup'
import areas from '@/datas/area.json'
const entFromRef = ref<FormInstance>()
const { title, isEdit, objId, modelValue } = defineProps({
  title: {
    type: String
  },
  isEdit: {
    type: Boolean
  },
  objId: {
    type: String
  },
  modelValue: {
    type: Boolean
  }
})
const visible = ref(modelValue) //数据源
const saveLoading = ref(false)
const loading = ref(false)
const areaRef = ref()
const previewImg = ref()
const emit = defineEmits(['update:modelValue', 'onRefresh'])
const { combTitle, refreshList } = useDetailForm(title as string, isEdit, emit)

const state = reactive({
  entData: {
    entName: '',
    logo: '',
    entId: '',
    areaCode: '',
    areaName: '',
    tags: '',
    introduce: '',
    status: ''
  },
  rules: {
    entName: [{ required: true, message: '请输入企业名称', trigger: 'blur' }],
    areaCode: [{ required: true, message: '请选择企业区域', trigger: 'change' }]
  }
})

onMounted(() => {
  if (isEdit) {
    loading.value = true
    useGet(entApi.entGetOne, { entId: objId })
      .then((rep) => {
        state.entData = rep.data
        if (!!rep.data.areaCode) {
          state.entData.areaCode = rep.data.areaCode.split(',')
        }
      })
      .finally(() => {
        loading.value = false
      })
  }
})

const close = () => {
  visible.value = false
  emit('update:modelValue', false)
}
const handleUploadLogo = (file) => {
  state.entData.logo = file.response?.data.url
}
const handlePreview = (file) => {
  if (isEdit) {
    previewImg.value = [file?.url]
  } else {
    previewImg.value = [file.response?.data?.url]
  }
}
const handleAreaChange = (val) => {
  if (val) {
    state.entData.areaName = areaRef?.value.getCheckedNodes()[0].pathLabels.join(',')
  } else {
    state.entData.areaName = ''
  }
}
const handleSubmit = (entForm: FormInstance | undefined) => {
  entForm?.validate((valid) => {
    if (!valid) return
    saveLoading.value = true
    if (state.entData.areaCode?.length > 0) {
      state.entData.areaCode = (state.entData.areaCode as any).join(',')
    }
    usePostJson(isEdit ? entApi.entUpdate : entApi.entAdd, state.entData, isEdit ? '修改' : '添加')
      .then((res) => {
        if (res) {
          refreshList()
          saveLoading.value = false
        }
      })
      .catch(() => {
        saveLoading.value = false
      })
  })
}
</script>
<style scoped lang="scss"></style>
