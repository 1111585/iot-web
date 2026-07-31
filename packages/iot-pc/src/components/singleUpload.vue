<template>
  <ElUpload
    ref="uploadRef"
    :action="action"
    :headers="headers"
    :list-type="listType"
    :multiple="multiple"
    :show-file-list="showList"
    v-model:file-list="fileList"
    :before-remove="handleBeforeRemove"
    :on-remove="handleRemove"
    :on-success="handleUploadSuccess"
    :on-error="handleUploadError"
    :before-upload="handleBeforeUpload"
    :on-preview="handlePictureCardPreview"
    :on-exceed="handleExceed"
    :on-change="fileChange"
    :accept="accept"
    :limit="limit"
    :class="{ hide: hideUpload }"
    :data="{
      repName: props.repName
    }"
  >
    <slot>
      <ElButton
        :size="type === 'text' ? 'default' : 'small'"
        :type="type"
        :loading="loading"
        :disabled="multiple && limit <= fileList.length"
        :icon="type === 'text' ? 'i-ep-paperclip' : 'i-ep-upload'"
        >{{ props.title ? props.title : '点击上传' }}</ElButton
      >
    </slot>
    <template #tip>
      <slot name="tip"
        ><div class="el-upload__tip">{{ tip }}</div></slot
      >
    </template>

    <template #file="{ file }">
      <slot name="file" v-bind="file"></slot>
    </template>
  </ElUpload>
</template>
<script lang="ts" setup>
import { ElMessageBox, ElMessage } from 'element-plus'
import { request } from '@/util/request'
import { isArray, isEmpty } from 'lodash-es'
import { RetType } from '@/enums'
import { userStore } from '@/store'
import { generateSignatureSm } from '@/util/crypto/tools'

type BindingResultList = {
  url: string
  name: string
  size?: string
  fid?: string
}

const uploadRef = ref()
const props = withDefaults(
  defineProps<{
    modelValue?: string | Array<string>
    list?: Array<BindingResultList>
    type?: 'text' | 'primary'
    multiple?: boolean
    limit?: number
    limitFileMB?: number
    tip?: string
    showList?: boolean
    listType: 'text' | 'picture' | 'picture-card'
    isImg?: boolean
    accept?: string
    url?: string
    showlimitTip?: boolean
    title?: string
    repName?: string
  }>(),
  {
    showlimitTip: true,
    type: 'primary',
    multiple: false,
    limit: 1,
    limitFileMB: 200,
    showList: true,
    listType: 'picture',
    isImg: true,
    accept: '*',
    url: '/sys/resource/upload',
    title: '',
    repName: '0'
  }
)

const emits = defineEmits([
  'update:modelValue', // 上传结果，仅url的绑定
  'update:list', // 上传结果，更详细的数据
  'onUploaded',
  'onRemoved',
  'onChange',
  'onPreview',
  'update:fileList' // 上传的原始数据
])
const { token } = userStore()
const action = computed(() => request.getBaseUrl() + props.url)
const headers = ref({
  ['Authorization']: token,
  ['X-Nonce']: '',
  ['X-Signature']: '',
  ['X-Timestamp']: ''
})
function setHeaders() {
  const { signature, timestamp, nonce } = generateSignatureSm({
    method: 'POST',
    url: props.url,
    params: {},
    body: ''
  })
  headers.value = {
    ['Authorization']: token,
    ['X-Nonce']: nonce,
    ['X-Signature']: signature,
    ['X-Timestamp']: timestamp + ''
  }
}

let fileList = ref<Array<any>>([])
let saveList = computed(() => {
  return fileList.value.map((item) => {
    return {
      name: item.name,
      url: item.url || '',
      fid: item.fid || '',
      size: item.size || ''
    }
  })
})

const loading = ref(false)
const accept = computed(() => (props.isImg ? 'image/jpeg,image/gif,image/png' : props.accept))
// const showList = computed(() => fileList.value.length > 0)
const tip = computed(
  () =>
    `支持${props.isImg ? 'jpg|gif|png' : props.accept === '*' ? '任意' : props.accept}格式${
      props.showlimitTip
        ? props.limitFileMB === -1
          ? '任意大小'
          : ',大小不能超过' + props.limitFileMB + 'MB'
        : ''
    }${props.multiple ? `，最多可上传 ${props.limit} 个文件` : ''}`
)

const handleUploadSuccess = (
  ret: RepDataType<{ size: string; fid: string; name: string; url: string }>
) => {
  emits('update:fileList', fileList.value)
  if (props.limit == 2 && fileList.value?.length > 1) {
    fileList.value.splice(0, 1)
  }
  hideUpload.value = fileList.value?.length >= props.limit
  // 无fid返回
  // if (ret.code != RetType.SUCCESS || !ret.data.fid) {
  if (ret.code != RetType.SUCCESS || !ret.data.url) {
    loading.value = false
    return
  }

  fileList.value.forEach((item) => {
    if (item.status === 'success') {
      const data = item?.response?.data
      if (data) {
        Object.assign(item, {
          name: data.name,
          url: data.url,
          fid: data.fid,
          size: data.size
        })
      }
    }
  })
  !props.multiple
    ? emits('update:modelValue', ret.data?.url ?? '')
    : emits(
        'update:modelValue',
        saveList.value.map((item) => item.url)
      )
  emits('update:list', saveList.value)
  emits('onUploaded', ret.data)
  handleChange()
  loading.value = false
}

const hideUpload = ref()

const handleUploadError = () => {
  loading.value = false
}
const handleBeforeUpload = (file: any) => {
  setHeaders()
  if (props.limit == 1) {
    hideUpload.value = true
  }
  if (file.size / 1024 / 1024 > props.limitFileMB) {
    ElMessage.error('文件大小不能超过' + props.limitFileMB + 'MB')
    return false
  }
  loading.value = true
  return true
}
const handleBeforeRemove = (file) => {
  if (!file.size || file.size / 1024 / 1024 > props.limitFileMB) return true
  return ElMessageBox.confirm('是否删除该文件?', '提示', {
    type: 'warning'
  })
    .then(() => true)
    .catch(() => false)
}
const handleRemove = (_file, files) => {
  fileList.value = files
  hideUpload.value = files.length >= props.limit
  !props.multiple
    ? emits('update:modelValue', '')
    : emits(
        'update:modelValue',
        saveList.value.map((item) => item.url)
      )
  emits('onRemoved', saveList.value, _file)
  handleChange()
}
const handleChange = () => {
  emits('onChange', saveList.value)
}

const fileChange = (file, fileList) => {
  // console.log(file, fileList)
}

const handleExceed = (files, fileList) => {
  ElMessage.error(
    `限制上传 ${props.limit} 个文件，当前已上传 ${fileList.length} 个文件，本次选择了 ${files.length} 个文件`
  )
}

const handlePictureCardPreview = (uploadFile) => {
  emits('onPreview', uploadFile)
}

watch(
  () => props.accept,
  () => {
    uploadRef.value?.clearFiles()
  }
)

onMounted(() => {
  hideUpload.value = fileList.value?.length >= props.limit
  if (props.list) {
    fileList.value = props.list.map((item) => ({
      name: item.name ? item.name : '',
      url: item.url || '',
      fid: item.fid || '',
      size: item.size || ''
    }))
  } else if (!isEmpty(props.modelValue)) {
    !props.multiple && !isArray(props.modelValue)
      ? fileList.value.push({
          name: '',
          url: props.modelValue as string,
          fid: '',
          size: ''
        })
      : (fileList.value = (props.modelValue as any).map((item) => ({
          name: item.fileName ? item.fileName : item.name ? item.name : '',
          url: item.url || (typeof item == 'string' && item) || '',
          fid: item.fid || '',
          size: item.size || ''
        })))
  }
})
</script>
<style lang="scss">
.el-upload__tip {
  color: #999999;
  line-height: 18px;
  margin-top: 0;
}
:deep(.el-upload) {
  text-align: left;
}

.hide .el-upload--picture-card {
  display: none;
}
:deep(.el-icon--close-tip) {
  display: none !important;
}

.el-upload-list--picture-card .el-upload-list__item-actions span {
  margin-left: 3px;
}

.el-upload-list--picture-card .el-upload-list__item-actions .el-upload-list__item-delete {
  margin-left: 13px;
}
</style>
