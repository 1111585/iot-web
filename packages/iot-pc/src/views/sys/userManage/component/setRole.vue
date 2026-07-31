<template>
  <form-dialog
    title="分配角色"
    height="unset"
    @onSubmit="handleSubmit(permFromRef)"
    @close="close"
    v-model="visible"
  >
    <template #content>
      <el-form
        size="default"
        :model="state.roleData"
        :rules="state.rules"
        ref="permFromRef"
        label-width="120px"
      >
        <el-form-item label="用户名：" prop="name">
          <el-input size="default" v-model="state.roleData.nickname" disabled></el-input>
        </el-form-item>
        <!-- 单选模式下不需要全选/全不选 -->
        <el-form-item label="关联角色：" prop="roleId">
          <div class="roleselect" v-if="state.roles.length != 0">
            <el-radio-group v-model="state.roleData.roleId">
              <div v-for="item in state.roles" :key="item.roleId" class="mr15">
                <el-radio :label="item.roleId">{{ item.roleName }}</el-radio>
              </div>
            </el-radio-group>
          </div>
          <empty
            v-else
            style="min-height: 100px; border: 1px solid #e9e9e9; border-radius: 4px; width: 470px"
          ></empty>
        </el-form-item>
      </el-form>
    </template>
    <template #footer>
      <el-button @click="close">取消</el-button>
      <el-button type="primary" @click="handleSubmit(permFromRef)" :loading="state.saveLoading">
        确定
      </el-button>
    </template>
  </form-dialog>
</template>
<script setup lang="ts">
import { useDetailForm } from '@/composable/listWithFormSup'
import { type FormInstance } from 'element-plus'
import { request } from '@/util/request'
import roleApi from '@/apis/role'
import { usePostJson } from '@/composable/requestSup'
const permFromRef = ref<FormInstance>()

const { userInfo, isEdit, modelValue } = defineProps({
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
  },
  userInfo: {
    type: Object
  }
})
const visible = ref(modelValue) //数据源
const emit = defineEmits(['update:modelValue', 'onRefresh'])
const { combTitle, refreshList } = useDetailForm('', isEdit, emit)
interface Roles {
  roleId: string
  roleName: string
}
const state = reactive({
  roleData: {
    roleIds: [] as Array<string>,
    roleId: '',
    empId: '',
    nickname: userInfo?.nickname
  },
  rules: {},
  saveLoading: false,
  loading: false,
  checkedSelect: false,
  roles: [] as Roles[]
})

onMounted(() => {
  fetchRoleList()
})
const fetchRoleEmpsByEmpId = () => {
  request
    .get(roleApi.getRoleEmpsByEmpId, {
      empId: userInfo?.empId
    })
    .then((rep) => {
      if (rep) {
        if (!rep.data || !rep.data.length) {
          state.roleData.roleId = ''
          state.roleData.roleIds = []
        } else {
          state.roleData.roleIds = rep.data
          // 单选模式下，只取第一个角色ID作为选中值
          state.roleData.roleId = rep.data[0] || ''
        }
      }
    })
}
const fetchRoleList = () => {
  state.loading = true
  request
    .get(roleApi.roleList, {
      keyword: '',
      pageNum: 1,
      pageSize: 1000
    })
    .then((rep) => {
      state.loading = false
      state.roles = rep.data.list.filter((item) => item.roleId != '21')
      fetchRoleEmpsByEmpId()
    })
}
const close = () => {
  visible.value = false
  emit('update:modelValue', false)
}

const handleSubmit = (roleForm: FormInstance | undefined) => {
  roleForm?.validate((valid) => {
    if (!valid) return
    state.saveLoading = true
    usePostJson(
      roleApi.updateRoleEmpBind,
      {
        roleIds: state.roleData.roleId,
        empId: userInfo?.empId
      },
      '分配'
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
// 单选模式下不需要这些处理函数
</script>
<style scoped lang="scss">
.roleselect {
  border: 1px solid #e9e9e9;
  padding-left: 5px;
  border-radius: 4px;
  width: 450px;
  min-height: 100px;
  max-height: 250px;
  overflow: scroll;
}
</style>
