<template>
  <form-dialog
    :title="combTitle"
    height="unset"
    @onSubmit="handleSubmit(dictFromRef)"
    @close="close"
    v-model="visible"
  >
    <template #content>
      <el-form
        size="default"
        :model="state.dictData"
        :rules="state.rules"
        ref="dictFromRef"
        label-width="150px"
      >
        <el-form-item label="字典名称：" prop="dictName">
          <el-input size="default" v-model="state.dictData.dictName"></el-input>
        </el-form-item>
        <el-form-item label="字典种类名称：" prop="dictTypeName">
          <el-input size="default" v-model="state.dictData.dictTypeName"></el-input>
        </el-form-item>
        <el-form-item label="字典类型：" prop="dictType">
          <el-input size="default" v-model="state.dictData.dictType"></el-input>
        </el-form-item>
        <el-form-item label="字典值：" prop="dictValue">
          <el-input size="default" v-model="state.dictData.dictValue"></el-input>
        </el-form-item>
        <el-form-item label="父级字典：" prop="pid">
          <el-select v-model="state.dictData.pid" clearable filterable>
            <el-option
              v-for="item in state.dictList"
              :key="item.dictId"
              :label="item.dictName"
              :value="item.dictId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注：" prop="remark">
          <el-input
            size="default"
            v-model="state.dictData.remark"
            :rows="3"
            type="textarea"
          ></el-input>
        </el-form-item>
        <el-form-item label="排序：" prop="displayOrder">
          <el-input size="default" v-model="state.dictData.displayOrder"></el-input>
        </el-form-item>
      </el-form>
    </template>
    <template #footer>
      <el-button @click="close">取消</el-button>
      <el-button type="primary" @click="handleSubmit(dictFromRef)" :loading="saveLoading"
        >确定</el-button
      >
    </template>
  </form-dialog>
  <previewer v-model="previewImg" :hideOnClickModal="true" />
</template>
<script setup lang="ts">
import { useDetailForm } from '@/composable/listWithFormSup'
import { type FormInstance } from 'element-plus'
import dictApi from '@/apis/dict'
import { usePostJson, useGet } from '@/composable/requestSup'
import { request } from '@/util/request'

const dictFromRef = ref<FormInstance>()
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
interface dictType {
  dictId: string
  dictName: string
}
const state = reactive({
  dictData: {} as { [key: string]: any },
  dictList: [] as Array<dictType>,
  rules: {
    dictTypeName: [{ required: true, message: '请输入字典种类名称', trigger: 'blur' }],
    dictName: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
    dictType: [{ required: true, message: '请选择字典类型', trigger: 'blur' }],
    dictValue: [{ required: true, message: '请选择字典值', trigger: 'blur' }]
  }
})

onMounted(() => {
  fetchDictList()
  if (isEdit) {
    loading.value = true
    useGet(dictApi.dictGetOne, { dictId: objId })
      .then((rep) => {
        state.dictData = rep.data
        if (state.dictData.pid == '0') {
          state.dictData.pid = ''
        }
      })
      .finally(() => {
        loading.value = false
      })
  }
})
const fetchDictList = () => {
  request.get(dictApi.dictList, { keyword: '', pageNum: 1, pageSize: 1000 }).then((rep) => {
    state.dictList = rep.data.list.filter((item) => item.pid == '0')
  })
}
const close = () => {
  visible.value = false
  emit('update:modelValue', false)
}

const handleSubmit = (dictForm: FormInstance | undefined) => {
  dictForm?.validate((valid) => {
    if (!valid) return
    saveLoading.value = true
    usePostJson(
      isEdit ? dictApi.dictUpdate : dictApi.dictAdd,
      state.dictData,
      isEdit ? '修改' : '添加'
    )
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
