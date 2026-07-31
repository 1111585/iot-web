<template>
  <section :class="themeName" ref="dom"><slot></slot></section>
</template>
<script lang="ts" setup>
import configs from "./config";
import { colorScale } from "./mix";
const props = withDefaults(
  defineProps<{
    themeName?: string;
    prefix?: string;
    data?: any;
    global?: boolean;
  }>(),
  {
    themeName: "default",
    prefix: "--el-",
    data: () => {},
    global: false,
  }
);
const dom = ref<HTMLDivElement>();
onMounted(() => {
  const themeVars = props.global ? colorScale(configs[props.themeName]) : null;
  props.global
    ? Object.keys(themeVars).forEach((key) => {
        document.documentElement.style.setProperty(key, themeVars[key]);
        document.documentElement.setAttribute(
          "class",
          `global-${props.themeName}`
        );
      })
    : Object.keys(props.data).forEach(
        (key) => dom.value && dom.value.style.setProperty(key, props.data[key])
      );
});
</script>
<style lang="scss" scoped></style>
