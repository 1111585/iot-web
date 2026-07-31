<template>
  <div class="menu-container">
    <transition name="el-fade-in-linear">
      <div class="logo-container mb5" :style="`height:${isCollapse ? '120px' : '60px'};`">
        <div class="pos">
          <Avatar
            :src="avatar"
            shape="square"
            :size="isCollapse ? 75 : 32"
            alt="logo"
            class="handle"
            @click="handleUserInfo"
          />
          <div v-if="userInfo" class="name" :class="isCollapse ? 'mt10' : ''">
            <div v-if="isCollapse">
              {{ userInfo?.nickname }}
            </div>
            <div class="dot" :class="isCollapse ? 'ml10 ' : ''"></div>
          </div>
        </div>
      </div>
    </transition>
    <!-- 
    background-color="var(--el-menu-item-bgcolor)"
             active-text-color="var(--el-menu-active-color)"
              style="--el-menu-hover-bg-color: none"

    -->

    <ElScrollbar style="height: calc(100vh - 190px)">
      <ElMenu
        :class="isCollapse ? 'spread' : 'unspread'"
        mode="vertical"
        :unique-opened="false"
        :default-active="$route.path"
        :collapse="!isCollapse"
        @open="handleOpen"
        :router="true"
      >
        <template v-for="(menu, index) in menus" :key="menu.id">
          <!-- <template v-if="menu.children && menu.type < 2" :key="menu.id"> -->
          <template v-if="menu.type < 2">
            <ElSubMenu
              popper-class="collapse"
              :index="menu.url + index"
              :data-tour="menu.url.replace('/', '')"
              v-if="menu.children && menu.children.length > 0 && menu.type < 2"
            >
              <template #title>
                <ElIcon style="width: unset">
                  <svg-icon :icon-class="menu.icon" :style="state.iconSize" class="mr5" />
                </ElIcon>
                <span>{{ menu.name }}</span>
              </template>
              <template v-for="item in menu.children" :key="item.id">
                <el-menu-item :index="menuUrl(menu, item)">{{ item.name }}</el-menu-item>
              </template>
            </ElSubMenu>
            <el-menu-item
              :data-tour="menu.url.replace('/', '')"
              :index="menu.url"
              v-else
              class="level1-menu-item"
            >
              <ElIcon style="width: unset">
                <svg-icon :icon-class="menu.icon" :style="state.iconSize" class="mr5" />
              </ElIcon>
              <span>{{ menu.name }}</span>
            </el-menu-item>
          </template>
        </template>
      </ElMenu>
    </ElScrollbar>
    <div class="menu-floor" @click="handleToggleClick">
      <div style="width: 100%; height: 100%">
        <ElIcon class="hamburger"><i-ep-fold v-if="isCollapse" /><i-ep-expand v-else /></ElIcon>
      </div>
    </div>
    <el-tour v-model="state.isShowTour" @close="onTourClose">
      <el-tour-step title="设备管理" target=".el-sub-menu[data-tour='deviceManage']">
        <div>在此处管理"监测设备"和"被监测设备"</div>
      </el-tour-step>
      <el-tour-step title="监控中心" target=".el-menu-item[data-tour='monitorCenter']">
        <div>对"被监控设备"进行监控</div>
      </el-tour-step>
      <el-tour-step title="链路监测" target=".el-menu-item[data-tour='connection']">
        <div>在此处测试设备之间的连通性</div>
        <el-checkbox
          class="mt10 ml10"
          v-model="dontShowTourThisTime"
          size="small"
          label="不再提示"
        />
      </el-tour-step>
    </el-tour>
  </div>
</template>

<script lang="ts" setup>
import Avatar from '@/components/avatar.vue'
import sysStore from '@/store/sys'
import userStore from '@/store/user'
// import { usePermStore } from '@/store'
import { useConfigStore } from '@/store/config'
import { treeDataTranslate } from '@/util/index'
import { fetchPermList, pickPerm } from '@/views/sys/utils'

const configStore = useConfigStore()

const menus = ref<MenuType[] | any>()
const state = shallowReactive({
  isActive: false,
  iconSize: {
    '--fontSize': '14px'
  },
  isShowTour: false
})
const avatar = computed(() => userStore().avatar)
const { useSidebarOpened, setCurMenuTitle } = sysStore()
const isCollapse = ref(false)
onMounted(() => {
  const sidebarOpened = useSidebarOpened()
  isCollapse.value = sidebarOpened.value
  watch(sidebarOpened, () => {
    isCollapse.value = sidebarOpened.value
  })

  if (__appType === 'dmzn') {
    menus.value = [
      {
        id: 'devices',
        parentId: '0',
        weight: 0,
        name: '设备列表',
        icon: 'resource',
        sort: 0,
        category: 0,
        type: 1,
        code: 'devices',
        url: '/devices',
        children: []
      }
    ]
  } else {
    fetchPermList({ pageSize: 99 }).then((rep) => {
      const list = rep.data.list
      menus.value = treeDataTranslate(list, 'id', 'pid')
      // menus.value.unshift({
      //   id: 'devices',
      //   parentId: '0',
      //   weight: 0,
      //   name: '设备列表',
      //   icon: 'resource',
      //   sort: 0,
      //   category: 0,
      //   type: 1,
      //   code: 'devices',
      //   url: '/devices',
      //   children: []
      // })

      checkIsShowTour()
    })
  }
})
const userInfo = userStore().userInfo

const dontShowTourThisTime = ref(false)
let checkTimes = 0
const checkIsShowTour = async () => {
  checkTimes++
  await nextTick()
  const firstTour = document.querySelector(".el-sub-menu[data-tour='deviceManage']")
  if (firstTour === null) {
    if (checkTimes < 2) {
      setTimeout(() => {
        checkIsShowTour()
      }, 1000)
    }
  } else {
    if (configStore.elTourConfig.sidebar.show) {
      // TODO 暂时隐藏
      // state.isShowTour = true
      checkTimes = 0
    }
  }
}

const onTourClose = () => {
  if (dontShowTourThisTime.value) {
    configStore.setElTourConfig('sidebar', false)
  }
}

const handleToggleClick = () => {
  sysStore().sidebarOpened = !isCollapse.value
}
const handleOpen = (index: string) => {
  const regex = /\d+$/
  const match: any = index.match(regex)
  setCurMenuTitle(menus.value[match[0]]?.name)
}
const handleUserInfo = () => {
  return console.log('注释掉了')
  // router.push('/sys/setting')
}

const menuUrl = computed(() => (menu, item) => {
  const url = item.permJumpTag ? `/view?url=${item.url}` : menu.url + '/' + item.url
  return url
})
</script>
<style lang="scss" scoped>
.menu-container {
  position: relative;
  height: 100%;
  overflow: hidden;
  user-select: none;

  .logo-container {
    position: relative;

    .pos {
      text-align: center;
      margin-top: 30px;
    }

    .name {
      color: #fff;
      font-size: var(--el-font-size-medium);
      text-align: center;
      display: flex;
      justify-content: center;
    }

    .dot {
      width: 8px;
      height: 8px;
      background-color: var(--el-color-success);
      border-radius: 50%;
      margin-top: 5px;
    }
  }

  .el-menu {
    border: none;
    width: 100% !important;
  }

  .offset {
    margin-left: -10px !important;
  }
}

.menu-floor {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 30px;
  border-top: 1px solid var(--el-sub-menu-bg-color);
  // border-top: 1px solid #2aaf68;

  & > div {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .hamburger {
    cursor: pointer;
    display: block;
    font-size: 16px;
    color: #ffffffa6;

    &:hover {
      color: var(--el-menu-active-color) !important;
    }

    margin: 0 auto;
    line-height: 30px;
  }
}

:deep(.el-sub-menu .el-menu-item),
:deep(.el-menu-item) {
  height: 40px;
  line-height: 40px;
  min-width: 180px !important;
  font-size: var(--el-font-size-base);
}

:deep(.el-sub-menu__title) {
  height: 40px;
  line-height: 40px;
  padding: 0 16px !important;
}

:deep(.el-menu-item) {
  background-color: var(--el-sub-menu-bg-color) !important;

  &.is-active {
    color: #ffffff !important;
    background-image: var(--el-color-gradient-primary) !important;
  }

  &:hover {
    color: #ffffff !important;
    background-image: var(--el-color-gradient-primary) !important;
  }
}

:deep(.el-sub-menu__title) {
  font-size: var(--el-font-size-base);

  &:hover {
    color: var(--el-menu-text-hover) !important;

    .el-sub-menu__icon-arrow {
      color: var(--el-menu-text-hover);
    }
  }
}

:deep(.spread .el-sub-menu.is-active) {
  .el-sub-menu__title {
    color: var(--el-menu-unsel-text-active) !important;
  }

  .el-sub-menu__icon-arrow {
    color: var(--el-menu-unsel-text-active) !important;
  }
}

:deep(.el-sub-menu.is-active) {
  color: var(--el-menu-active-color);
  background-image: var(--el-color-gradient-primary) !important;
}

.level1-menu-item {
  min-width: unset !important;
  padding: 0 16px !important;
  background-color: var(--el-menu-item-bgcolor) !important;
  // background-color: #eb8338 !important;
}

//收缩样式设置
:deep(.unspread .el-sub-menu.is-active .el-sub-menu__title) {
  color: var(--el-menu-unsel-text-active) !important;
  background-color: var(--el-color-gradient-primary) !important;
}

.collapse {
  .el-menu-item {
    height: 40px;
    line-height: 40px;
    font-size: var(--el-font-size-base);

    &.is-active {
      color: var(--el-menu-active-color);
      background-image: var(--el-color-gradient-primary) !important;
    }

    &:hover {
      color: var(--el-menu-active-color);
      background-image: var(--el-color-gradient-primary) !important;
    }
  }
}
</style>
