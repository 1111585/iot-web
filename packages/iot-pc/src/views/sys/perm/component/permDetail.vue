<template>
  <form-dialog
    :title="combTitle"
    height="unset"
    @onSubmit="handleSubmit(permFromRef)"
    @close="close"
    v-model="visible"
  >
    <template #content>
      <el-form
        size="default"
        :model="state.permission"
        :rules="state.rules"
        ref="permFromRef"
        label-width="120px"
      >
        <el-form-item label="类别：" prop="type">
          <el-radio-group v-model="state.permission.type" @change="handleChangeType">
            <el-radio :value="0">目录</el-radio>
            <el-radio :value="1">菜单</el-radio>
            <el-radio :value="2">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单名称：" prop="name">
          <el-input size="default" v-model="state.permission.name"></el-input>
        </el-form-item>
        <el-form-item label="权限值：">
          <el-input size="default" v-model="state.permission.code"> </el-input>
        </el-form-item>
        <el-form-item label="菜单url：">
          <el-input size="default" v-model="state.permission.url"></el-input>
        </el-form-item>
        <el-form-item label="上级菜单：" prop="pid" v-if="state.permission.type">
          <el-select
            size="default"
            filterable
            v-model="state.permission.pid"
            placeholder="请选择上级菜单"
          >
            <el-option
              v-for="item in state.permList"
              :label="item.label"
              :value="item.value"
              :disabled="item.disabled"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="菜单排序：">
          <el-input
            size="default"
            v-model="state.permission.sort"
            oninput="value=value.replace(/[^0-9.]/g,'')"
          ></el-input>
        </el-form-item>
        <el-form-item label="菜单图像：" prop="logo">
          <el-popover placement="bottom-start" :width="450" trigger="click">
            <IconSelect ref="iconSelect" @selected="handleSelected" />
            <template #reference>
              <el-input
                size="default"
                v-model="state.permission.icon"
                placeholder="点击选择图标"
                clearable
              >
                <template #prefix v-if="state.permission.icon">
                  <svg-icon :icon-class="state.permission.icon" style="height: 30px; width: 16px" />
                </template>
                <template #prefix v-else
                  ><el-icon><i-ep-search /></el-icon>
                </template>
              </el-input>
            </template>
          </el-popover>
        </el-form-item>
        <el-form-item label="是否显示：">
          <el-radio-group v-model="state.permission.status">
            <el-radio :value="1101">是</el-radio>
            <el-radio :value="1102">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </template>
    <template #footer>
      <el-button @click="close">取消</el-button>
      <el-button type="primary" @click="handleSubmit(permFromRef)" :loading="state.saveLoading"
        >确定</el-button
      >
    </template>
  </form-dialog>
</template>
<script setup lang="ts">
import { useDetailForm } from '@/composable/listWithFormSup'
import { type FormInstance } from 'element-plus'
import { request } from '@/util/request'
import permApi from '@/apis/perm'
import { usePostJson, useGet } from '@/composable/requestSup'
import IconSelect from '@/components/iconSelect.vue'
const permFromRef = ref<FormInstance>()
const { title, isEdit, objId, modelValue } = defineProps({
  title: {
    type: String
  },
  isEdit: {
    type: Boolean
  },
  objId: {
    type: String
  },
  modelValue: {
    type: Boolean
  }
})
const visible = ref(modelValue) //数据源
const emit = defineEmits(['update:modelValue', 'onRefresh'])
const { combTitle, refreshList } = useDetailForm(title as string, isEdit, emit)

interface PermissionType {
  id: string
  pid: string
  code: string
  type: any
  name: string
  url: string
  sort: any
  status: string
  icon: string
  children: PermissionType[]
}

const state = reactive({
  permission: {
    id: '',
    pid: '',
    code: '',
    type: '',
    name: '',
    url: '',
    sort: '',
    status: '',
    icon: '',
    children: []
  } as PermissionType,
  permList: [] as any,
  rules: {
    name: [{ required: true, message: '请输入菜单名', trigger: 'blur' }],
    type: [{ required: true, message: '请选择菜单类型', trigger: 'blur' }]
  },
  saveLoading: false,
  loading: false
})

onMounted(() => {
  if (isEdit) {
    state.loading = true
    request
      .get(permApi.permGetOne, {
        id: objId
      })
      .then((rep) => {
        state.permission = rep.data
        handleChangeType()
      })
  } else if (objId) {
    request
      .get(permApi.permGetOne, { id: objId })
      .then((rep) => {
        state.permission = {
          type: 1,
          pid: rep.data.id
        }
        state.permList = [
          {
            label: rep.data.name,
            value: rep.data.id
          }
        ]
      })
      .catch(() => {
        state.loading = false
      })
  } else {
    // state.permission = {
    //   permJumpTag: 0,
    // };
  }
})
const close = () => {
  visible.value = false
  emit('update:modelValue', false)
}
const handleSelected = (name) => {
  state.permission.icon = name.replace('icon-', '')
}
const handleChangeType = () => {
  if (state.permission.type == 0) return
  request
    .get(permApi.permListByType, {
      permType: state.permission.type == 1 ? 0 : state.permission.type == 2 ? 1 : ''
    })
    .then((rep) => {
      state.permList = []
      let list = rep.data
      if (list && list.length > 0) {
        state.permList = list.map((item) => ({
          label: item.name,
          value: item.id
        }))
        state.permList.some((ro) => {
          if (ro.value == objId) {
            ro.disabled = true
            return true
          }
        })
      } else {
        state.permList.unshift({ label: '顶级菜单', value: '0' })
      }
    })
}
const handleSubmit = (permForm: FormInstance | undefined) => {
  permForm?.validate((valid) => {
    if (!valid) return
    state.saveLoading = true
    state.permission.children = []
    usePostJson(
      isEdit ? permApi.permUpdate : permApi.permAdd,
      state.permission,
      isEdit ? '修改' : '添加'
    )
      .then((res) => {
        if (res) {
          refreshList()
          state.saveLoading = false
        }
      })
      .catch(() => {
        state.saveLoading = false
      })
  })
}
</script>
<style scoped lang="scss"></style>
