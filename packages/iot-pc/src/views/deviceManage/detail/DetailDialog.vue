<template>
  <el-dialog v-model="visible" :title="title" draggable width="1200px" destroy-on-close>
    <template #header>
      <div class="title flex content-between">
        <span>{{ title }}</span>
        <div class="mr20">
          <slot name="action"></slot>
        </div>
      </div>
    </template>
    <!-- <el-scrollbar max-height="80vh"> -->
    <el-scrollbar height="80vh">
      <div class="content">
        <slot></slot>
      </div>
    </el-scrollbar>
    <template #footer>
      <slot name="footer"> </slot>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)
const title = ref('')
const data = ref<ARC.AnyObj>({})

const emits = defineEmits<{
  (e: 'close'): void
}>()

const open = (_title: string, _data: ARC.AnyObj) => {
  data.value = _data
  title.value = _title
  visible.value = true
}

const close = () => {
  title.value = ''
  data.value = {}
  visible.value = false
}

watch(visible, (flag) => {
  if (!flag) {
    close()
    emits('close')
  }
})

defineExpose({ open, close, data })
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
