<template>
  <el-row :gutter="0" align="middle" class="header">
    <el-col :span="12" :offset="0">
      <div class="flex-box items-center">
        <div style="width: 56px; height: 40px; margin-left: 10px; margin-bottom: 2px">
          <img
            v-if="appType === 'dmzn'"
            src="/images/app-dmzn.png"
            style="width: 100%; height: 100%; user-select: none; transform: scale(1.2)"
          />
          <img
            v-else
            src="/images/ent_logo_2.png"
            style="width: 100%; height: 100%; user-select: none"
          />
        </div>
        <span class="entName ml8" style="user-select: none">{{ appTitle }}</span>
      </div>
    </el-col>
    <el-col :span="12" :offset="0">
      <div class="flex-box items-center f12 content-end">
        <ElTooltip
          v-if="appType !== 'dmzn'"
          class="box-item"
          effect="light"
          :content="isMuteBell ? '开启声音提醒' : '关闭声音提醒'"
          placement="bottom"
          :hide-after="0"
        >
          <div class="nav-icon mr20 flex-box items-center content-center" @click="toggleMuteBell">
            <el-icon v-if="!isMuteBell" color="var(--el-color-text-regular)" size="20">
              <i-ep-bell></i-ep-bell>
            </el-icon>
            <el-icon v-else color="var(--el-color-danger)" size="20">
              <i-ep-MuteNotification></i-ep-MuteNotification>
            </el-icon>
          </div>
        </ElTooltip>
        <ElTooltip
          v-if="appType !== 'dmzn'"
          class="box-item"
          effect="light"
          content="智慧大屏"
          placement="bottom"
          :hide-after="0"
        >
          <div class="nav-icon mr20 flex-box items-center content-center" @click="goExternal">
            <svgIcon icon-class="mserver" color="var(--el-color-text-regular)"></svgIcon>
          </div>
        </ElTooltip>
        <ElTooltip
          v-if="appType !== 'dmzn'"
          class="box-item"
          effect="light"
          content="退出登录"
          placement="bottom"
          :hide-after="0"
        >
          <div class="nav-icon mr20 flex-box items-center content-center" @click="handleLogout">
            <svgIcon icon-class="exit" color="var(--el-color-text-regular)"></svgIcon>
          </div>
        </ElTooltip>
      </div>
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import userStore from '@/store/user'
import audioStore from '@/store/audio'
import { ElMessageBox } from 'element-plus'

const appTitle = __appTitle
const appType = __appType

const audio = audioStore()

// 初始化铃声状态
onMounted(() => {
  audio.initBellState()
})

const isMuteBell = computed(() => !audio.isBellEnabled)

const router = useRouter()
const { logoutAction } = userStore()
const userInfo = computed(() => userStore().userInfo)

const buttonRef = ref()
const popoverRef = ref()
const msgCount = computed(() => 0)

const moudleType = shallowRef(import.meta.env.VITE_APP_PLATFORM)
const handleLogout = () => {
  console.log('dd==>', userStore().userInfo)

  ElMessageBox.confirm('确定要退出登录吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      // location.href = '/login'
      logoutAction()
        .then((_) => {
          // location.reload()
        })
        .finally(() => {
          location.href = '/login'
        })
    })
    .catch(() => {})
}
const goExternal = () => {
  // const url = import.meta.env.VITE_APP_MONITOR_INTELLIGENT_URL
  // window.open(url, '_blank')
  const { href } = router.resolve('/chart/iot')
  window.open(href, '_blank')
}

const toggleMuteBell = () => {
  audio.toggleBell()
}

const onClickOutside = () => {
  popoverRef.value?.hide()
}
const handleRedirect = (path: string, index?: number) => {}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.header {
  height: 48px;
  line-height: 48px;
  background-color: #fff;
  box-shadow: 0px 1px 4px 0px rgba(0, 21, 41, 0.12);
  position: relative;
  z-index: 10;
}

.navbar-menu {
  float: right;
  height: 100%;
  line-height: 48px;
  background: transparent;
  padding: 0;
  margin: 0;
}

.navbar {
  position: fixed;
  z-index: 90;
  height: 50px;
  line-height: 50px;
  border-radius: 0px !important;
  left: 180px;
  right: 0;
  top: 0;
}

.nav-icon {
  border-radius: 3px;
  width: 24px;
  height: 24px;
  cursor: pointer;
}

.nav-icon:hover {
  background-color: #edf0f3;
}

.setting {
  float: right;
  height: 20px;
  line-height: 20px;

  :deep(.el-button.is-text) {
    font-size: var(--el-font-size-small);

    &:hover {
      color: var(--el-color-primary);
    }
  }
}

.entName {
  margin-top: -5px;
  font-size: 18px;
  color: var(--el-color-text-primary);
}

:deep(.el-badge__content) {
  background-color: #f56c6c;
}

:deep(.el-dropdown-menu__item:not(.is-disabled):hover) {
  background-color: transparent;
  color: var(--el-color-text-secondary);
}

:deep(.el-menu--horizontal > .el-menu-item.is-active) {
  border-bottom: none;
}

:deep(.el-menu--horizontal > .el-sub-menu.is-active .el-sub-menu__title) {
  border-bottom: none;
}

.el-menu--horizontal > .el-menu-item {
  height: 48px !important;
  line-height: 48px !important;
}

:deep(.el-menu--horizontal > .el-sub-menu .el-sub-menu__title) {
  height: 48px !important;
  line-height: 48px !important;
}

:deep(.el-menu.el-menu--horizontal) {
  border: none;
}

:deep(.el-menu-item) {
  padding: 0 15px;
}

:deep(.el-button--mini) {
  min-height: 20px;
}

:deep(.el-button.is-text) {
  color: var(--el-color-text-primary);
  font-weight: normal;
}

.spacer {
  color: var(--el-color-text-secondary);
}

:deep(.el-space) {
  vertical-align: unset;
}

:deep(.el-badge__content) {
  right: 11px;
  top: 2px;
  padding: 0 5px;
}
</style>
