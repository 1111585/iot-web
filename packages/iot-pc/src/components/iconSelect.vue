<template>
  <div class="icon-body">
    <el-input
      v-model="name"
      style="position: relative"
      clearable
      placeholder="请输入图标名称"
      @clear="filterIcons"
      @input="filterIcons"
      suffix-icon="i-ep-search"
    >
    </el-input>
    <div class="icon-list">
      <div
        v-for="(item, index) in iconList"
        :key="index"
        @click="selectedIcon(item)"
      >
        <svg-icon
          :icon-class="iconName(item)"
          style="height: 30px; width: 16px"
        />
        <span>{{ iconName(item) }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import ids from "virtual:svg-icons-names";
const emit = defineEmits(["selected"]);
const name = ref("");
let iconList = reactive<any>(ids);
const filterIcons = () => {
  if (name.value) {
    iconList = iconList.filter((item: any) => item.includes(name.value));
  } else {
    iconList = ids;
  }
};
const selectedIcon = (name: string) => {
  emit("selected", name);
  document.body.click();
};
const iconName = computed(() => {
  return (id: string) => id.replace("icon-", "");
});
</script>

<style lang="scss" scoped>
.icon-body {
  width: 100%;
  padding: 10px;
  .icon-list {
    height: 200px;
    overflow-y: scroll;
    div {
      cursor: pointer;
      width: 33%;
      float: left;
    }
    span {
      display: inline-block;
      vertical-align: -0.15em;
      fill: currentColor;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      padding-left: 10px;
      width: 80%;
    }
  }
}
</style>
