<template>
  <el-container>
    <el-aside class="layout-aside fixed" :width="isCollapse ? '180px' : '48px'">
      <Sidebar></Sidebar>
    </el-aside>
    <el-container style="margin-left: 0">
      <el-main class="layout-main">
        <el-scrollbar style="height: 100vh" ref="elscrollbar" class="page-component__scroll">
          <Navbar v-if="!is.hideNavbar" class="layout-nav" />
          <MainBody />
          <ElBacktop target=".page-component__scroll .el-scrollbar__wrap"></ElBacktop>
        </el-scrollbar>
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router'
import sysStore from '@/store/sys'
import MainBody from './mainBody.vue'
import Sidebar from './sidebar.vue'
const Navbar = defineAsyncComponent(() => import('./navbar.vue'))
const isCollapse = computed(() => sysStore().sidebarOpened)
const elscrollbar = ref()

const route = useRoute()
const meta = computed(() => route.meta)

const is = shallowRef({
  hideNavbar: meta.value?.hideNavbar
})
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.layout-main {
  margin: 0;
  padding: 0;
}

.layout-nav {
  position: sticky !important;
  top: 0 !important;
  z-index: 1000;
}

.layout-aside {
  // position: fixed;
  // top: 0;
  // left: 0;
  // bottom: 0;
  overflow: hidden;
  background-color: var(--el-menu-bg-color);
}
</style>
