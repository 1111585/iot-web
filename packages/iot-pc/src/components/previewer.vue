<template>
  <el-image-viewer
    v-if="modelValue && modelValue.length > 0"
    :url-list="modelValue"
    :initialIndex="initialIndex"
    :hideOnClickModal="hideOnClickModal"
    @close="handleClick"
  />
</template>
<script lang="ts">
import { ElImageViewer } from "element-plus";
export default defineComponent({
  name: "previewer",
  props: ["modelValue", "initialIndex", "hideOnClickModal"],
  emits: ["update:modelValue"],
  components: { ElImageViewer },
  setup(_, { emit }) {
    const handleClick = () => emit("update:modelValue", []);
    return {
      handleClick,
    };
  },
});
</script>
<style lang="scss" scoped>
:deep(.el-image-viewer__canvas) {
  img {
    cursor: grab;
  }
  img:active {
    cursor: grabbing;
  }
}
</style>
