<template>
  <form-dialog
    :title="combTitle"
    height="unset"
    @onSubmit="handleSubmit(userFromRef)"
    @close="close"
    v-model="visible"
  >
    <template #content>
      <el-form
        size="default"
        :model="state.userData"
        :rules="state.rules"
        ref="userFromRef"
        label-width="120px"
      >
        <el-form-item label="昵称：" prop="nickname">
          <el-input size="default" v-model="state.userData.nickname"></el-input>
        </el-form-item>
        <el-form-item label="姓名：" prop="realName">
          <el-input size="default" v-model="state.userData.realName"></el-input>
        </el-form-item>
        <el-form-item label="身份证号码" prop="idNumber">
          <el-input size="default" v-model="state.userData.idNumber"></el-input>
        </el-form-item>
        <ElFormItem label="头像：" prop="avatar">
          <SingleUpload
            v-if="!loading"
            :limitFileMB="2"
            class="avatar-uploader"
            :listType="'picture-card'"
            accept="image/png"
            @change="handleUploadAvatar"
            v-model="state.userData.avatar"
            @onPreview="handlePreview"
          >
            <template #default
              ><ElIcon :size="20" class="avatar-uploader-icon"><i-ep-Plus /></ElIcon
            ></template>
          </SingleUpload>
        </ElFormItem>
        <el-form-item label="手机号码：" prop="phone">
          <el-input size="default" v-model="state.userData.phone"></el-input>
        </el-form-item>
        <el-form-item label="邮箱：" prop="email">
          <el-input size="default" v-model="state.userData.email"></el-input>
        </el-form-item>
        <el-form-item label="性别：">
          <el-radio-group v-model="state.userData.sex">
            <el-radio :value="0">男</el-radio>
            <el-radio :value="1">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <!-- <el-form-item label="是否启用：">
          <el-radio-group v-model="state.userData.status">
            <el-radio :value="AccountStatus['激活']">启用</el-radio>
            <el-radio :value="AccountStatus['锁定']">锁定</el-radio>
            <el-radio :value="AccountStatus['休眠']">休眠</el-radio>
            <el-radio :value="AccountStatus['注销']">注销</el-radio>
          </el-radio-group>
        </el-form-item> -->
      </el-form>
    </template>
    <template #footer>
      <el-button @click="close">取消</el-button>
      <el-button type="primary" @click="handleSubmit(userFromRef)" :loading="saveLoading">
        确定
      </el-button>
    </template>
  </form-dialog>
  <previewer v-model="previewImg" :hideOnClickModal="true" />
</template>
<script setup lang="ts">
import { useDetailForm } from '@/composable/listWithFormSup'
import { type FormInstance } from 'element-plus'
import empApi from '@/apis/emp'
import { usePostJson, useGet } from '@/composable/requestSup'
import userStore from '@/store/user'
import { validatePhone, validateEmail, validateIDcard } from '@/util/validate'
import { AesUtil } from '@infoview/util'
import { AccountStatus } from '@/enums'

const { userInfo } = userStore()
const userFromRef = ref<FormInstance>()
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
const previewImg = ref()
const emit = defineEmits(['update:modelValue', 'onRefresh'])
const { combTitle, refreshList } = useDetailForm(title as string, isEdit, emit)

var checkEmail = (_, value, callback) => {
  if (value && !validateEmail(value)) {
    callback(new Error('请输入正确的邮箱'))
  } else {
    callback()
  }
}
const validatePhoneData = (_rule, value, callback) => {
  if (!!value && !validatePhone(value)) {
    callback(new Error('请输入正确的手机号'))
  } else {
    callback()
  }
}
const validateIDcardData = (_rule, value, callback) => {
  if (!!value && !validateIDcard(value)) {
    callback(new Error('请输入正确的身份证号码'))
  } else {
    callback()
  }
}
interface userType {
  nickname: string
  realName: string
  phone: string
  email: string
  sex: string
  status: string
  avatar: string
  empId: string
  entId: string
}

const state = reactive({
  userData: {
    nickname: '',
    realName: '',
    phone: '',
    email: '',
    sex: '',
    status: '',
    avatar: '',
    empId: '',
    entId: userInfo?.entId,
    idNumber: ''
  },
  rules: {
    nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
    realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
    phone: [{ validator: validatePhoneData, trigger: 'blur' }],
    email: [{ validator: checkEmail, trigger: 'blur' }],
    idNumber: [
      { required: true, message: '请输入身份证号码', trigger: 'blur' },
      { validator: validateIDcardData, trigger: 'blur' }
    ]
  }
})

onMounted(() => {
  if (isEdit) {
    loading.value = true
    useGet(empApi.empGetOne, { empId: objId })
      .then((rep) => {
        state.userData = rep.data
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
const handleUploadAvatar = (file) => {
  state.userData.avatar = file.response?.data.url
}
const handlePreview = (file) => {
  if (isEdit) {
    previewImg.value = [file?.url]
  } else {
    previewImg.value = [file.response?.data?.url]
  }
}

const handleSubmit = (userForm: FormInstance | undefined) => {
  userForm?.validate((valid) => {
    if (!valid) return
    saveLoading.value = true
    usePostJson(
      isEdit ? empApi.empUpdate : empApi.empAdd,
      { ...state.userData, idNumber: AesUtil.aesEncrypt(state.userData.idNumber) },
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
