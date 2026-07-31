<template>
  <form-dialog
    :title="combTitle"
    height="unset"
    @onSubmit="handleSubmit(accountFromRef)"
    @close="close"
    v-model="visible"
  >
    <template #content>
      <el-form
        size="default"
        :model="state.accountData"
        :rules="state.rules"
        ref="accountFromRef"
        label-width="120px"
      >
        <el-form-item label="账号：" prop="account">
          <el-input size="default" v-model="state.accountData.account"></el-input>
        </el-form-item>
        <el-form-item v-if="!isEdit" label="密码：" prop="password">
          <el-input size="default" v-model="state.accountData.password" show-password></el-input>
        </el-form-item>
        <el-form-item label="类型：" prop="accountType">
          <el-radio-group v-model="state.accountData.accountType">
            <el-radio :value="1">账号</el-radio>
            <el-radio :value="2">手机</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="账号类型：" prop="accountCycle">
          <el-radio-group v-model="state.accountData.accountCycle">
            <el-radio :value="AccountCycle['长期账号']">长期账号</el-radio>
            <el-radio :value="AccountCycle['临时账号']">临时账号</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否启用：">
          <el-radio-group v-model="state.accountData.status">
            <el-radio :value="AccountStatus['激活']">启用</el-radio>
            <el-radio :value="AccountStatus['锁定']">锁定</el-radio>
            <el-radio :value="AccountStatus['休眠']">休眠</el-radio>
            <el-radio :value="AccountStatus['注销']">注销</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </template>
    <template #footer>
      <el-button @click="close">取消</el-button>
      <el-button type="primary" @click="handleSubmit(accountFromRef)" :loading="saveLoading">
        确定
      </el-button>
    </template>
  </form-dialog>
</template>
<script setup lang="ts">
import { ElMessageBox } from 'element-plus'
import { useDetailForm } from '@/composable/listWithFormSup'
import empApi from '@/apis/emp'
import { usePostJson, useGet } from '@/composable/requestSup'
import { validatePwd } from '@/util/validate'
import { PasswdValidMsg } from '@/consts'
import { AesUtil } from '@infoview/util'
import { checkMeHasPerm, fetchAccountDetail } from '@/views/sys/utils'
import type { FormInstance } from 'element-plus'
import { RetType, AccountCycle, AccountStatus } from '@/enums'
import userStore from '@/store/user'

const accountFromRef = ref<FormInstance>()
const { title, isEdit, objId, modelValue, userInfo } = defineProps({
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
  },
  userInfo: {
    type: Object
  }
})

const currentLoginUser = userStore().userInfo

const visible = ref(modelValue) //数据源
const saveLoading = ref(false)

const emit = defineEmits(['update:modelValue', 'onRefresh'])
const { combTitle, refreshList } = useDetailForm(title as string, isEdit, emit)

let checkPwd = (_, value, callback) => {
  if (isEdit) return callback()
  if (validatePwd(value)) {
    return callback()
  } else {
    callback(new Error(PasswdValidMsg))
  }
}
const state = reactive({
  accountData: {
    empId: userInfo?.empId,
    account: '',
    password: '',
    accountType: '',
    status: '',
    accountCycle: ''
  },
  rules: {
    account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
    password: [
      { required: isEdit ? false : true, message: '请输入密码', trigger: 'blur' },
      { validator: checkPwd, trigger: 'blur' }
    ],
    accountType: [{ required: true, message: '请选择类型', trigger: 'change' }],
    accountCycle: [{ required: true, message: '请选择账号类型', trigger: 'change' }]
  }
})

onMounted(() => {
  if (isEdit) {
    console.log('[编辑账号]', userInfo)
    fetchAccountDetail(userInfo?.accountId).then((res) => {
      state.accountData = res.data
    })
  }
})

const close = () => {
  visible.value = false
  emit('update:modelValue', false)
}

const handleSubmit = (accountForm: FormInstance | undefined) => {
  accountForm?.validate((valid) => {
    if (!valid) return
    saveLoading.value = true
    state.accountData.password = AesUtil.aesEncrypt(state.accountData.password)

    ElMessageBox.prompt('需要校验您的权限', '身份验证', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /\S/,
      inputErrorMessage: '请输入登录密码',
      inputType: 'password'
    })
      .then(({ value }) => {
        const empId = currentLoginUser?.empId
        checkMeHasPerm({ pwd: AesUtil.aesEncrypt(value), empId }).then((res) => {
          if (!res || res.code !== RetType.SUCCESS) {
            saveLoading.value = false
            state.accountData.password = ''
            return
          }
          let payload = state.accountData as ARC.AnyObj
          let url = empApi.accountCreate
          if (isEdit) {
            const { createTime, updateTime, password, ...req } = state.accountData as ARC.AnyObj
            payload = req
            url = empApi.accountUpdate
          }
          usePostJson(url, payload, isEdit ? '编辑' : '添加')
            .then((res) => {
              if (res.code == 100) {
                close()
              }
            })
            .catch(() => {
              saveLoading.value = false
            })
        })
      })
      .catch(() => {
        saveLoading.value = false
      })
  })
}
</script>
<style scoped lang="scss"></style>
