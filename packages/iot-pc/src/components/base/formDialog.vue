<template>
  <ElDialog
    :width="width"
    :top="top"
    @closed="handleClose"
    @close="handleClose"
    :destroy-on-close="destroyOnClose"
    v-model="visible"
    :close-on-click-modal="false"
    :append-to-body="appendToBody"
    :show-close="showClose"
    :close-on-press-escape="closeOnPressEscape"
    draggable
    :fullscreen="fullscreen"
  >
    <template #header>
      <div class="title flex content-between">
        <span>{{ title }}</span>
        <div class="mr20">
          <slot name="action"></slot>
        </div></div
    ></template>
    <el-scrollbar :style="heightSty" max-height="80vh">
      <div class="content" :style="contentStyle">
        <slot name="content"></slot>
      </div>
    </el-scrollbar>
    <template #footer>
      <slot name="footer">
        <template v-if="isFooter">
          <el-button size="default" @click="handleClose">取 消</el-button>
          <el-button size="default" type="primary" @click="handleSubmit" :loading="loading"
            >确 定</el-button
          >
        </template>
      </slot>
    </template>
  </ElDialog>
</template>
<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    top?: string
    width?: string
    height?: string
    isFooter?: boolean
    destroyOnClose?: boolean
    appendToBody?: boolean
    loading?: boolean
    showClose?: boolean
    closeOnPressEscape?: boolean
    contentStyle?: any
    scroll?: boolean
    fullscreen?: boolean
  }>(),
  {
    title: '',
    top: '10vh',
    width: '640px',
    height: '400px',
    isFooter: true,
    destroyOnClose: true,
    appendToBody: true,
    loading: false,
    showClose: true,
    closeOnPressEscape: true,
    contentStyle: () => ({
      padding: '10px 24px'
    }),
    scroll: true,
    fullscreen: false
  }
)
const emits = defineEmits(['onSubmit', 'update:modelValue', 'onClose'])

// const visible = ref(props.modelValue)
const visible = computed({
  get: () => props.modelValue,
  set: (val) => {
    emits('update:modelValue', val)
  }
})
const heightSty = computed(
  () => `height:${props.height};${props.scroll ? 'padding-right: 10px;' : ''}`
)
const handleSubmit = () => {
  emits('onSubmit')
}
const handleClose = () => {
  visible.value = false
  emits('update:modelValue', false)
  emits('onClose')
}

onErrorCaptured((err) => {
  console.log(err)
})
</script>
<style lang="scss" scoped>
.title {
  font-size: 16px;
  font-weight: 500;
  margin-top: 2px;
}
.content {
  padding: 10px 24px;
}
</style>
