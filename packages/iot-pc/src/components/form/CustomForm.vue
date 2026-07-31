<template>
  <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
    <el-form-item
      v-for="field in visibleFormFields"
      :key="field.prop"
      :label="field.label"
      :prop="field.prop"
    >
      <component
        :is="getComponentType(field.type)"
        v-model="formData[field.prop]"
        v-bind="field.attrs"
      >
        <template v-if="field.type === 'radio-group'">
          <el-radio-group v-model="formData[field.prop]">
            <el-radio
              v-for="option in field.options"
              :key="option.value"
              :label="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </el-radio>
          </el-radio-group>
        </template>
        <template v-else-if="field.type === 'checkbox-group'">
          <el-checkbox-group v-model="formData[field.prop]">
            <el-checkbox
              v-for="option in field.options"
              :key="option.value"
              :label="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </el-checkbox>
          </el-checkbox-group>
        </template>
        <template v-else-if="field.type === 'upload'">
          <SingleUpload
            :key="forceKey"
            v-model:list="formData[field.prop]"
            :limit="field.limit"
            :accept="field.accept"
            :multiple="field.multiple"
            :limitFileMB="field.limitFileMB"
            :showlimitTip="field.showlimitTip"
            :listType="field.listType"
          ></SingleUpload>
        </template>
        <template v-else-if="field.type === 'select'">
          <el-select
            v-model="formData[field.prop]"
            :multiple="field.multiple"
            :clearable="field.clearable"
          >
            <el-option
              v-for="option in field.options"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            ></el-option>
          </el-select>
        </template>
        <template v-else-if="field.type === 'slot'">
          <slot :name="field.prop"></slot>
        </template>
        <template v-else-if="field.type === 'suffix'">
          <el-input v-model="formData[field.prop]">
            <template #suffix>
              {{ field.unit }}
            </template>
          </el-input>
        </template>
      </component>
    </el-form-item>
    <el-form-item v-if="isShowFooterBtn">
      <el-button @click="onCancelClick">{{ cancelText }}</el-button>
      <el-button type="primary" @click="onConfirmClick">{{ confirmText }}</el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { ElMessage, ElInput, ElDatePicker, ElRadioGroup, ElSelect } from 'element-plus'
import type { FormInstance } from 'element-plus'
import 'element-plus/dist/index.css'

import SingleUpload from '@/components/singleUpload.vue'

interface Props {
  formFields: ReadonlyArray<any>
  form: any
  rules?: any
  confirmText?: string
  cancelText?: string
  isShowFooterBtn?: boolean
}
interface Emits {
  (e: 'submit', data: any): void
  (e: 'update:form', data: any): void
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: '提交',
  cancelText: '取消',
  isShowFooterBtn: true
})
const emit = defineEmits<Emits>()

const forceKey = ref(0)
const formData = ref(props.form)
const visibleFormFields = computed(() => {
  return props.formFields.filter((field) => {
    return field.condition ? field.condition(formData.value) : true
  })
})

const formRef = ref<FormInstance | null>(null)

const getComponentType = (type: string) => {
  const componentsMap = {
    datepicker: ElDatePicker,
    input: ElInput,
    radio: ElRadioGroup,
    select: ElSelect
  }
  return componentsMap[type] || 'el-input'
}

function onConfirmClick() {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      emit('submit', formData.value)
    } else {
      ElMessage.error('请填写完整信息')
    }
  })
}

function onCancelClick() {
  formRef.value?.resetFields()
}

function reset() {
  console.log('[配置表单]重置表单')
  formRef.value?.resetFields()
}

function validate() {
  return new Promise((resolve, reject) => {
    formRef.value?.validate((valid: boolean) => {
      if (valid) {
        resolve(true)
      } else {
        reject(false)
      }
    })
  })
}

defineExpose({ confirm: onConfirmClick, cancel: onCancelClick, resetFields: reset, validate })

// TODO: 问什么SingleUpload组件没有更新
watch(
  () => formData.value.image,
  () => {
    forceKey.value++
  }
)

onMounted(() => {
  console.log('[配置表单]收到配置项', props.formFields, props.form)
})
</script>
