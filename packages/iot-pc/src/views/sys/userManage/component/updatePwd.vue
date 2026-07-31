<template>
  <form-dialog
    title="修改密码"
    height="unset"
    @onSubmit="handleSubmit(pwdFromRef)"
    @close="close"
    v-model="visible"
  >
    <template #content>
      <el-form
        size="default"
        :model="state.pwdData"
        :rules="state.rules"
        ref="pwdFromRef"
        label-width="120px"
      >
        <!-- <el-form-item label="旧密码：" prop="oldPwd">
          <el-input size="default" v-model="state.pwdData.oldPwd" show-password></el-input>
        </el-form-item> -->
        <el-form-item label="新密码：" prop="newPwd">
          <el-input size="default" v-model="state.pwdData.newPwd" show-password></el-input>
        </el-form-item>
      </el-form>
    </template>
    <template #footer>
      <el-button @click="close">取消</el-button>
      <el-button type="primary" @click="handleSubmit(pwdFromRef)" :loading="saveLoading">
        确定
      </el-button>
    </template>
  </form-dialog>
</template>
<script setup lang="ts">
import { useDetailForm } from '@/composable/listWithFormSup'
import { type FormInstance } from 'element-plus'
import { request } from '@/util/request'
import empApi from '@/apis/emp'
import { usePostJson, useGet } from '@/composable/requestSup'
import { validatePwd } from '@/util/validate'
import { PasswdValidMsg } from '@/consts'
import { AesUtil } from '@infoview/util'
const pwdFromRef = ref<FormInstance>()
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
const visible = ref(modelValue) //数据源
const saveLoading = ref(false)

const emit = defineEmits(['update:modelValue', 'onRefresh'])
const { combTitle, refreshList } = useDetailForm(title as string, isEdit, emit)

let checkPwd = (_, value, callback) => {
  if (validatePwd(value)) {
    return callback()
  } else {
    callback(new Error(PasswdValidMsg))
  }
}
const state = reactive({
  pwdData: {
    // empId: userInfo?.empId,
    account: userInfo?.account,
    // oldPwd: '',
    newPwd: ''
  },
  rules: {
    // oldPwd: [
    //   { required: true, message: '请输入旧密码', trigger: 'blur' },
    //   { validator: checkPwd, trigger: 'blur' }
    // ],
    newPwd: [
      { required: true, message: '请输入新密码', trigger: 'blur' },
      { validator: checkPwd, trigger: 'blur' }
    ]
  }
})

onMounted(() => {
  console.log('[编辑账号]', userInfo)
})

const close = () => {
  visible.value = false
  emit('update:modelValue', false)
}

const handleSubmit = (pwdForm: FormInstance | undefined) => {
  pwdForm?.validate((valid) => {
    if (!valid) return
    saveLoading.value = true
    // state.pwdData.oldPwd = AesUtil.aesEncrypt(state.pwdData.oldPwd)
    state.pwdData.newPwd = AesUtil.aesEncrypt(state.pwdData.newPwd)
    usePostJson(empApi.updatePassWord, state.pwdData, '修改')
      .then(() => {
        close()
      })
      .catch(() => {
        saveLoading.value = false
        close()
      })
  })
}
</script>
<style scoped lang="scss"></style>
