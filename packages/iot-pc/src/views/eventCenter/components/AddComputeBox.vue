<template>
  <el-dialog class="add-dialog" v-model="dialogVisible" :title="title" draggable>
    <template #footer>
      <div class="add-dialog-footer">
        <el-button class="add-dialog-footer__left" plain @click="connectionTesting">
          测试是否连通
        </el-button>
        <el-button plain @click="onCancelBtnClick"> 取消 </el-button>
        <el-button type="primary" @click="onConfirmBtnClick">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CustomForm from '@/components/form/CustomForm.vue'
interface Props {
  visible: boolean
  title?: string
}
interface Emits {
  (e: 'update:visible', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  title: '算法服务器添加'
})
const emits = defineEmits<Emits>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emits('update:visible', val)
})

function connectionTesting() {}

function onCancelBtnClick() {}

function onConfirmBtnClick() {}
</script>

<style lang="scss" scoped>
.add-dialog {
  &-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;

    &__left {
      margin-right: auto;
    }
  }
}
</style>
