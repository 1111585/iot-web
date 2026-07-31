<template>
  <div class="player-bar">
    <el-button
      v-for="btn in btns"
      :key="btn.alias"
      :size="iconSize"
      :icon="btn.icon"
      @click="onBtnClick(btn)"
    >
      {{ btn.title || '' }}
    </el-button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  iconSize?: 'default' | 'small' | 'large'
  status?: {
    isPlaying: boolean
  }
}
const props = withDefaults(defineProps<Props>(), {
  iconSize: 'small'
})
const emits = defineEmits<{
  click: [item: (typeof btns.value)[number]]
}>()

const btns = ref([
  {
    icon: computed(() => (props.status?.isPlaying ? 'i-ep-video-pause' : 'i-ep-video-play')),
    title: computed(() => (props.status?.isPlaying ? '暂停' : '播放')),
    alias: 'play'
  },
  { icon: 'i-ep-full-screen', title: '全屏', alias: 'fullscreen' }
])

function onBtnClick(item: (typeof btns.value)[number]) {
  console.log(`[播放器控制]${item.alias}`)
  emits('click', item)
}
</script>

<style lang="scss" scoped></style>
