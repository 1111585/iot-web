<template>
  <svg
    class="svg-icon"
    :class="className"
    aria-hidden="true"
    viewBox="0 0 16 16"
    :style="svgStyle"
  >
    <use :xlink:href="iconName"></use>
  </svg>
</template>
<script lang="ts" setup>
import { merge, isNumber } from "lodash-es";

const props = withDefaults(
  defineProps<{
    iconClass: string;
    className?: string;
    style?: string | object;
    size?: string;
    color?: string;
    themeColor?: "primary" | "danger" | "warning" | "info" | "success";
  }>(),
  {
    size: "16px",
  }
);
const iconName = computed(() => `#icon-${props.iconClass}`);
const svgStyle = computed(() =>
  merge(
    {
      color: props.themeColor
        ? `var(--el-color-${props.themeColor})`
        : props.color,
      "--fontSize": isNumber(props.size) ? `${props.size}px` : props.size,
    },
    props.style
  )
);
</script>
<style lang="scss" scoped>
.svg-icon {
  width: var(--fontSize);
  height: var(--fontSize);
  overflow: hidden;
  vertical-align: middle;
}
</style>
