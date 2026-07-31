<template>
  <div class="index-login flex items-center content-center">
    <div class="login-container">
      <div class="login-title">
        <h2>{{ loginTitle }}</h2>
      </div>
      <ElForm
        class="login-form"
        :model="loginForm"
        ref="loginFormRef"
        label-width="auto"
        label-position="top"
        :rules="state.loginRules"
        @keyup.enter="handleLogin"
      >
        <ElFormItem prop="loginAccount" class="mt30" style="margin-bottom: 30px !important">
          <ElInput
            v-model="loginForm.loginAccount"
            placeholder="请输入账号"
            class="login-input"
            size="large"
          >
            <template #prefix>
              <ElIcon><i-ep-user /></ElIcon>
            </template>
          </ElInput>
        </ElFormItem>
        <ElFormItem prop="loginPwd" class="pwd">
          <PwdInput
            v-model="loginForm.loginPwd"
            placeholder="输入登录密码"
            class="login-input"
            size="large"
          >
            <template #prefix>
              <ElIcon><i-ep-lock /></ElIcon>
            </template>
          </PwdInput>
        </ElFormItem>

        <!-- 验证码输入框，错误3次后显示 -->
        <!-- <ElFormItem v-if="loginErrorCount >= 3" prop="captcha" class="captcha-item"> -->
        <ElFormItem prop="captcha" class="captcha-item">
          <div class="captcha-container">
            <ElInput
              v-model="loginForm.captcha"
              placeholder="请输入验证码"
              class="captcha-input"
              size="large"
              maxlength="4"
            >
              <template #prefix>
                <ElIcon><i-ep-key /></ElIcon>
              </template>
            </ElInput>
            <CanvasCaptcha
              ref="captchaRef"
              @refresh="onCaptchaRefresh"
              @generate="fetchCaptcha"
              :text="captchaText"
              :width="120"
              :height="40"
            />
          </div>
        </ElFormItem>

        <ElFormItem>
          <ElButton
            style="width: 100%; margin-top: 5%; padding: 20px"
            type="primary"
            plain
            @click="handleLogin"
            :loading="loading"
          >
            登 录
          </ElButton>
        </ElFormItem>
      </ElForm>
      <!-- </ElTabPane>
      </ElTabs> -->
    </div>
    <ElDialog
      v-model="isShow.passwdChange"
      title="密码修改"
      width="550px"
      destroy-on-close
      draggable
    >
      <ElForm
        class="change-form"
        ref="changeFormRef"
        :model="changeForm"
        :rules="changeFormRules"
        label-width="auto"
      >
        <ElFormItem label="账号" prop="account">
          <ElInput v-model="changeForm.account" type="text"></ElInput>
        </ElFormItem>
        <!-- <ElFormItem label="原密码" prop="oldPwd">
          <ElInput v-model="changeForm.oldPwd" type="password" show-password></ElInput>
        </ElFormItem> -->
        <ElFormItem label="新密码" prop="newPwd">
          <ElInput v-model="changeForm.newPwd" type="password" show-password></ElInput>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="isShow.passwdChange = false">取 消</ElButton>
        <ElButton type="primary" @click="handleChangePwd">确 定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script lang="ts" setup>
import { RetType } from '@/enums'
import router from '@/router'
import { userStore } from '@/store'
import { AesUtil } from '@infoview/util'
import { ElMessage } from 'element-plus'
import empApi from '@/apis/emp'
import { request } from '@/util/request'
import { validatePwd } from '@/util/validate'
import { PasswdValidMsg, CaptchaKey, PermKey } from '@/consts'
import userApi from '@/apis/user'
import CanvasCaptcha from '@/components/CanvasCaptcha.vue'

const loginTitle = import.meta.env.VITE_APP_LOGIN_TITLE

const { loginAction, userInfoAction } = userStore()

const loading = shallowRef(false)
const isShow = reactive({
  passwdChange: false,
  captcha: true as const // 改为总是展示
})

const loginFormRef = ref()
const loginForm = reactive({
  loginAccount: '',
  loginPwd: '',
  vCode: '',
  device: 1,
  imgCode: '',
  captcha: '',
  captchaKey: ''
})

const state = reactive({
  loginRules: {
    loginAccount: [{ required: true, message: '请输入账号', trigger: 'blur' }],
    loginPwd: [{ required: true, message: '请输入密码', trigger: 'blur' }],
    captcha: [{ required: true, message: '请输入验证码', trigger: 'blur', validator: checkCaptcha }]
  }
})

const captchaBlob = ref()
function fetchCaptcha() {
  request.get(userApi.key).then((res) => {
    const key = res.msg
    const baseUrl = request.getBaseUrl()
    loginForm.captchaKey = key
    fetch(baseUrl + userApi.generate + `?key=${key}`).then(async (res) => {
      // const data = await res.blob()
      // captchaBlob.value = URL.createObjectURL(data)
      captchaText.value = (await res.json()).data
    })
  })
}

/** 点击登录 */
const handleLogin = () => {
  if (loading.value) return

  // 验证码校验逻辑(如果使用前端验证码或者数字验证码)
  // if (loginErrorCount.value >= 3) {
  //   if (!loginForm.captcha) {
  //     ElMessage.error('请输入验证码')
  //     return
  //   }
  // if (loginForm.captcha.toUpperCase() !== captchaText.value) {
  //   ElMessage.error('验证码错误')
  //   refreshCaptcha()
  //   return
  // }
  // }

  loginFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      loginAction({
        loginAccount: loginForm.loginAccount,
        loginPwd: AesUtil.aesEncrypt(loginForm.loginPwd),
        accountType: 1, //账号类型
        deviceType: '1',
        captchaKey: loginForm.captchaKey,
        captcha: loginForm.captcha
      })
        .then((rep) => {
          loading.value = false
          userInfoAction().then(() => {
            router.replace('/')
          })
          ElMessage.success('登录成功')
          loginErrorCount.value = 0

          URL.revokeObjectURL(captchaBlob.value)
          captchaText.value = ''
          captchaBlob.value = null
          localStorage.removeItem(CaptchaKey)
        })
        .catch((err) => {
          if (err.code === RetType.PWDUNMODIFIED) {
            ElMessage.error(err.msg)
            setChangeForm()
          } else if (err.code === RetType.PWDERROR) {
            ElMessage.error(err?.msg || '登录失败')
            fetchCaptcha()
          }

          loading.value = false
          loginErrorCount.value++

          fetchCaptcha()
        })
    }
  })
}

/** 密码修改 */
const changeFormRef = ref()
const changeForm = reactive({
  account: '',
  // oldPwd: '',
  newPwd: ''
})
const changeFormRules = reactive({
  account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  // oldPwd: [
  //   { required: true, message: '请输入原密码', trigger: 'blur' },
  //   { validator: checkPwd, trigger: 'blur' }
  // ],
  newPwd: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { validator: checkPwd, trigger: 'blur' }
  ]
})
function setChangeForm() {
  changeForm.account = loginForm.loginAccount
  isShow.passwdChange = true
}

function handleChangePwd() {
  changeFormRef.value.validate((valid) => {
    if (valid) {
      request
        .postJson(empApi.updatePassWord, {
          account: changeForm.account,
          // oldPwd: AesUtil.aesEncrypt(changeForm.oldPwd),
          newPwd: AesUtil.aesEncrypt(changeForm.newPwd)
        })
        .then((res) => {
          if (res) {
            ElMessage.success('密码修改成功')
            isShow.passwdChange = false
          }
        })
        .catch((err) => {
          // ElMessage.error('密码修改失败')
        })
    }
  })
}

function checkPwd(_, value, callback) {
  if (validatePwd(value)) {
    return callback()
  } else {
    callback(new Error(PasswdValidMsg.replace(/（[^）]*）/g, '')))
  }
}

function checkCaptcha(_, value, callback) {
  if (value) {
    if (value.length !== 4) {
      return callback(new Error('请输入4位验证码'))
    }
    return callback()
  } else {
    return callback(new Error('请输入验证码'))
  }
}

/** 登录错误计数 */
const loginErrorCount = ref(0)
const captchaText = ref('')

function generateCaptcha() {
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let result = ''
  for (let i = 0; i < 4; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  captchaText.value = result
}

const captchaRef = ref()

function refreshCaptcha() {
  fetchCaptcha()
}

function onCaptchaRefresh(text: string) {
  captchaText.value = text
}

watch(
  () => isShow.captcha,
  (val) => {
    if (val) {
      localStorage.setItem(CaptchaKey, '1')
      fetchCaptcha()
    }
  }
)

onMounted(() => {
  console.log('[环境变量]', import.meta.env)

  // isShow.captcha = !!localStorage.getItem(CaptchaKey)
  fetchCaptcha()

  localStorage.removeItem(PermKey)
  localStorage.removeItem('tokenInfo')
  localStorage.removeItem('user')
})
</script>

<style lang="scss" scoped>
.el-link {
  --el-link-text-color: var(--el-text-color-primary);
}

:deep(.el-tabs__nav) {
  justify-content: center;
}

.index-login {
  height: 100vh;
  background-image: url('/images/login/login_bg.jpg');
  background-size: 100% 100%;

  .login-container {
    position: relative;
    padding: 70px;
    width: 26%;
    min-width: 450px;
    border-radius: 8px;
    box-shadow: 0px 0px 20px 1px rgba(0, 0, 0, 0.1);
    background-color: #fff;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background-size: 100% 100%;
  }

  .login-title {
    position: absolute;
    top: 10%;
    left: 50%;
    width: max-content;
    transform: translateX(-50%);
    font-size: 22px;
    font-weight: bold;
    letter-spacing: 0.3em;
    color: #232b3fbe;
  }

  :deep(.el-input__suffix) {
    height: 0px;
  }
}

.login-form {
  .el-form {
    margin-top: 60px;
  }

  .el-button {
    padding: 1em 2em;
    letter-spacing: 5px;
    transition: all 1000ms;
    font-size: 15px;
    position: relative;
    overflow: hidden;
    outline: 1px solid var(--el-border-color);
  }

  .el-button:hover {
    color: #ffffff;
    transform: scale(1);
    outline: 1px solid var(--el-color-primary);
    box-shadow: 4px 5px 17px -4px var(--el-color-primary);
  }

  .el-button::before {
    content: '';
    position: absolute;
    left: -50px;
    top: 0;
    width: 0;
    height: 100%;
    background-color: var(--el-color-primary);
    transform: skewX(45deg);
    z-index: -1;
    transition: width 1000ms;
  }

  .el-button:hover::before {
    width: 250%;
  }

  :deep(.el-tabs__nav) {
    width: 100%;

    .el-tabs__item {
      width: 50%;
      text-align: center;
      font-size: 17px;
      margin-bottom: 5px;
    }
  }

  :deep(.el-input__wrapper) {
    padding: 5px 15px;
  }

  .pwd {
    :deep(.el-input__wrapper) {
      padding: 4px 15px;
    }
  }

  :deep(.el-input__inner:-webkit-autofill) {
    -webkit-box-shadow: 0 0 0 1000px white inset;
  }
}

.image {
  border: 1px solid rgb(206, 208, 214);
  position: relative;
  height: 330px;
  // height: 26vh;

  .scaned {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.97;
    text-align: center;
    color: #11aa66;
    background: #fff;
    font-weight: 600;
    font-size: 14px;
  }
}
/* 验证码样式 */
.captcha-item {
  margin-bottom: 20px;
}

.captcha-container {
  display: flex;
  align-items: center;
}

.captcha-input {
  flex: 1;
}

.captcha-code {
  margin-left: 10px;
  width: 100px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  background: #f0f2f5;
  color: #333;
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 4px;
  cursor: pointer;
  user-select: none;
  border-radius: 4px;
}

.captcha-canvas {
  margin-left: 10px;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
}

.change-form {
  padding: 20px;
  margin-top: 0 !important;
  &:deep(.el-form-item) {
    margin-bottom: 20px !important;
  }
}
</style>
