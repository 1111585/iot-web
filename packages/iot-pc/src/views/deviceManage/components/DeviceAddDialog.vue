<template>
  <el-dialog v-model="addDialog.visible" :title="addDialog.title" draggable destroy-on-close>
    <el-scrollbar max-height="70vh">
      <slot></slot>
    </el-scrollbar>
    <template #footer>
      <div class="da-footer">
        <div class="da-footer-left">
          <slot name="footer-left"> </slot>
        </div>
        <div class="da-footer-right">
          <slot name="footer-right">
            <el-button :loading="submitting" @click="addDialog.visible = false">取消</el-button>
            <el-button type="primary" @click="confirm">保存</el-button>
          </slot>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { addDialog } from '../utils'

const page = computed(() => addDialog.page)

defineProps<{
  submitting?: boolean
}>()

const emits = defineEmits<{
  (e: 'confirm'): void
  (e: 'testingResult', result: boolean): void
}>()

function confirm() {
  emits('confirm')
}
</script>

<style lang="scss" scoped>
.da-content {
  max-height: 80vh;
  overflow-y: scroll;
}

.da-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;

  &-left {
    margin-right: auto;
  }
}
</style>
