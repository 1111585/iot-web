<template>
  <div class="app-container">
    <el-row>
      <el-col :span="12">
        <img src="/images/404.png" alt="404" class="img-style" />
      </el-col>
      <el-col :span="12">
        <div style="margin-left: 100px; margin-top: 60px">
          <h1 class="color-main">访问受限</h1>
          <h2 class="mt15 mb15" style="color: #606266; font-size: 14px">
            很抱歉，您没有权限访问此页面！
          </h2>
          <div style="color: #909399; font-size: 12px">
            请确认您是否拥有相应的访问权限，或联系系统管理员获取授权
          </div>
          <!-- <el-button
            style="margin-top: 20px; margin-right: 15px"
            type="primary"
            round
            @click="handleGoHome"
          >
            返回首页
          </el-button>
          <el-button style="margin-top: 20px" round @click="handleGoBack"> 返回上一页 </el-button> -->
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import router from '@/router'

const handleGoHome = () => router.push({ path: '/' })
const handleGoBack = () => router.go(-1)
</script>

<style scoped lang="scss">
.app-container {
  width: 80%;
  margin: 120px auto;
}

.img-style {
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
}

.color-main {
  color: var(--el-color-primary, #409eff);
}
</style>
