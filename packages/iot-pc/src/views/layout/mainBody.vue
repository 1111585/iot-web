<template>
  <router-view v-slot="{ Component }" :key="$route.fullPath">
    <transition name="el-fade-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>
<style scoped></style>
