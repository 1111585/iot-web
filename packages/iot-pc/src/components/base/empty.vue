<template>
  <ElEmpty :image="imgUrl" :image-size="size">
    <template #description
      ><slot name="description"
        ><span
          class="c999 f14"
          v-html="des"
          style="white-space: pre-wrap"
        ></span></slot
    ></template>
  </ElEmpty>
</template>
<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    url?: string;
    size?: number;
    des?: string;
  }>(),
  {
    url: "/images/empty.png",
    size: 100,
    des: "暂无数据",
  }
);
const imgUrl = shallowRef(
  `${
    import.meta.env.VITE_APP_WEB_PREFIX
      ? "/" + import.meta.env.VITE_APP_WEB_PREFIX
      : ""
  }${props.url}`
);
</script>
