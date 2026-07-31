<template>
  <ElAvatar
    :src="src"
    :size="props.size"
    :icon="icon"
    :shape="props.shape"
    :srcSet="srcSet"
    :alt="alt"
    :fit="props.fit"
    @error="handleError"
  >
    <img src="/images/default_avatar.png" />
  </ElAvatar>
</template>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    src: string;
    icon?: string;
    srcSet?: string;
    alt?: string;
    fit?: "fill" | "contain" | "cover" | "none" | "scale-down";
    size?: number | ("default" | "small" | "large");
    shape?: "circle" | "square";
  }>(),
  {
    size: "default",
    shape: "circle",
  }
);
const handleError = () => true;
</script>
