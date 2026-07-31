<template>
  <form-dialog
    :title="combTitle"
    height="unset"
    @onSubmit="handleSubmit(roleFromRef)"
    @close="close"
    v-model="visible"
  >
    <template #content>
      <el-form
        size="default"
        :model="state.roleData"
        :rules="state.rules"
        ref="roleFromRef"
        label-width="120px"
      >
        <el-form-item label="角色名称：" prop="roleName">
          <el-input size="default" v-model="state.roleData.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述：" prop="remark">
          <el-input
            placeholder="请输入内容"
            type="textarea"
            v-model="state.roleData.remark"
            :rows="2"
          ></el-input>
        </el-form-item>
        <el-form-item label="排序：" prop="sort">
          <el-input
            v-model="state.roleData.sort"
            oninput="value=value.replace(/[^0-9.]/g,'')"
          ></el-input>
        </el-form-item>
        <el-form-item label="菜单权限：">
          <el-checkbox v-model="checkList[0].checked" @change="allExpand(checkList[0].checked)"
            >{{ checkList[0].label }}
          </el-checkbox>
          <el-checkbox v-model="checkList[1].checked" @change="checked1(checkList[1].checked)"
            >{{ checkList[1].label }}
          </el-checkbox>
        </el-form-item>
        <el-form-item label="关联权限：">
          <template #header>
            <div class="clearfix">
              <el-tooltip class="item" effect="dark" content="选择指定权限分配菜单" placement="top">
                <span class="role-span">菜单分配</span>
              </el-tooltip>
            </div>
          </template>
          <ElTree
            ref="menuRef"
            :data="state.menus"
            :default-checked-keys="state.menuIds"
            :props="state.treeProps"
            show-checkbox
            accordion
            show-el-checkbox
            v-if="!loading"
            node-key="id"
            default-expand-all
            :expand-on-click-node="false"
            check-on-click-node
            :check-strictly="!checkList[2].checked"
            style="width: 100%; height: 300px; overflow: auto"
          >
            <template #default="{ node, data }">
              <span class="custom-tree-node">
                <span>{{ node.label }}</span>
                <span class="tree-all" @click.stop="checkAll(node)">
                  <a v-if="data.all">全选/全不选{{ data.checkParent }} </a>
                </span>
              </span>
            </template>
          </ElTree>
        </el-form-item>
        <el-form-item label="是否启用：">
          <el-radio-group v-model="state.roleData.status">
            <el-radio :value="1101">启用</el-radio>
            <el-radio :value="1102">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </template>
    <template #footer>
      <el-button @click="close">取消</el-button>
      <el-button type="primary" @click="handleSubmit(roleFromRef)" :loading="saveLoading"
        >确定</el-button
      >
    </template>
  </form-dialog>
</template>
<script setup lang="ts">
import { useDetailForm } from '@/composable/listWithFormSup'
import { type FormInstance } from 'element-plus'
import { request } from '@/util/request'
import roleApi from '@/apis/role'
import permApi from '@/apis/perm'
import { usePostJson, useGet } from '@/composable/requestSup'
import { treeDataTranslate, treeConvertToArr } from '@/util/index'
const roleFromRef = ref<FormInstance>()
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
const saveLoading = ref(false)
const loading = ref(false)
const emit = defineEmits(['update:modelValue', 'onRefresh'])
const { combTitle, refreshList } = useDetailForm(title as string, isEdit, emit)

interface MenuType {
  id: string
  pid: string
  name: string
  code: string
  icon: string
  sort: number
  type: number
  url: string
  children: Child[]
}

interface Child {
  id: string
  pid: string
  name: string
  code: string
  icon: string
  sort: number
  type: number
  url: string
}
const menuRef = ref()
const state = reactive({
  roleData: { roleId: '', remark: '', status, roleName: '', permIds: '', sort: '' },
  treeProps: {
    children: 'children',
    label: 'name',
    all: 'all'
  },
  menus: Array<MenuType>,
  menuIds: [] as string[],
  keys: [],
  check: false,
  menuNames: [] as string[],
  rules: {
    roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }]
  }
})

onMounted(() => {
  if (isEdit) {
    useGet(roleApi.roleGetOne, { roleId: objId }).then((rep) => {
      state.roleData = rep.data
      state.menuIds = rep.data.permIds.split(',')
    })
  } else {
    // state.role = {
    //   roleName: '',
    //   roleDes: '',
    //   menuIds: '',
    //   sortNum: '',
    //   roleType: '0'
    // }
  }
  fetchPermList()
})
const checkList = reactive([
  { label: '展开/折叠', checked: true },
  { label: '全选/全不选', checked: false },
  { label: '父子联动', checked: false }
])
const fetchPermList = () => {
  loading.value = true
  request
    .get(permApi.permListByRole, {
      permName: '',
      pageNum: 1,
      pageSize: 1000
    })
    .then((rep) => {
      loading.value = false
      state.menus = treeDataTranslate(rep.data.list, 'id', 'pid')
    })
    .finally(() => (loading.value = false))
}
const allExpand = (isExpand) => {
  /* 展开全部 */
  const treeList = treeConvertToArr(state.menus)
  for (let i = 0; i < treeList.length; i++) {
    menuRef.value.store.nodesMap[treeList[i].id].expanded = isExpand
  }
}
const checked1 = (val) => {
  // el-tree全选事件
  if (val) {
    // 全选
    menuRef.value.setCheckedNodes(treeConvertToArr(state.menus))
  } else {
    // 取消选中
    menuRef.value.setCheckedKeys([])
  }
}
const getCheck = (data) => {
  if (data.childNodes.length > 0) {
    data.childNodes.some((ro) => {
      if (state.check) {
        return true
      }
      if (!ro.checked) {
        state.check = true
        return true
      } else {
        state.check = false
        getCheck(ro)
      }
    })
  }
}
const checkAll = (data) => {
  getCheck(data)
  data.data.children.length > 0 && setCheck(data.data)
  menuRef.value.setChecked(data.data, state.check)
  state.check = false
}
const setCheck = (item) => {
  item.children.forEach((ro) => {
    menuRef.value.setChecked(ro, state.check)
    ro.children.length > 0 && setCheck(ro)
  })
}
const close = () => {
  visible.value = false
  emit('update:modelValue', false)
}
const handleSubmit = (roleForm: FormInstance | undefined) => {
  roleForm?.validate((valid) => {
    if (!valid) return
    saveLoading.value = true
    let menuIds = ''
    // 得到半选的父节点数据，保存起来
    menuRef.value.getHalfCheckedNodes().forEach((data) => (menuIds += data.id + ','))
    // 得到已选中的 key 值
    menuRef.value.getCheckedKeys().forEach((data) => (menuIds += data + ','))
    if (menuIds.endsWith(',')) {
      menuIds = menuIds.substring(0, menuIds.length - 1)
    }
    state.roleData.permIds = menuIds
    usePostJson(
      isEdit ? roleApi.roleUpdate : roleApi.roleAdd,
      state.roleData,
      isEdit ? '修改' : '添加'
    )
      .then((res) => {
        if (res) {
          refreshList()
          saveLoading.value = false
        }
      })
      .finally(() => {
        saveLoading.value = false
      })
  })
}
</script>
<style scoped lang="scss">
:deep(.el-tree) {
  border: 1px solid #e9e9e9;
  border-radius: 4px;
}

.tree-all {
  color: var(--el-color-primary);
  margin-left: 20px;
  font-size: 12px;
  padding: 5px 0;
  font-weight: bold;
}
</style>
