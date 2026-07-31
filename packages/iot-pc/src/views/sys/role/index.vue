<template>
  <div>
    <tab-panel>
      <template #operation>
        <el-button
          size="default"
          type="primary"
          class="btn-add"
          icon="i-ep-plus"
          @click="handleAdd"
        >
          添加</el-button
        >
      </template>
    </tab-panel>
    <div class="app-container">
      <div class="table-container">
        <div class="operation-container">
          <span class="stat">共{{ state.total }}条数据</span>
          <div class="right">
            <div>
              <el-input
                prefix-icon="i-ep-search"
                size="default"
                v-model="state.listQuery.keyword"
                @change="handleSearch"
                clearable
              />
            </div>
            <div>
              <el-button size="default" icon="i-ep-search" @click="handleSearch"> 搜索</el-button>
            </div>
          </div>
        </div>
        <el-table
          :data="state.list"
          style="width: 100%"
          v-loading="state.listLoading"
          :row-style="{ height: '44px' }"
        >
          <el-table-column
            prop="roleName"
            header-align="center"
            align="center"
            min-width="150"
            :show-overflow-tooltip="true"
            label="角色名称"
          >
          </el-table-column>
          <el-table-column
            prop="remark"
            header-align="center"
            align="center"
            min-width="150"
            :show-overflow-tooltip="true"
            label="角色描述"
          >
          </el-table-column>

          <el-table-column label="状态" align="center" min-width="90">
            <template v-slot="scope">
              <el-tag type="success" v-if="scope.row.status === 1101">启用</el-tag>
              <el-tag type="danger" v-if="scope.row.status === 1102">禁用</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="createTime"
            header-align="center"
            align="center"
            min-width="150"
            :show-overflow-tooltip="true"
            label="添加时间"
          >
          </el-table-column>
          <el-table-column
            prop="updateTime"
            header-align="center"
            align="center"
            min-width="150"
            :show-overflow-tooltip="true"
            label="更新时间"
          >
          </el-table-column>
          <el-table-column label="操作" min-width="200" align="center" fixed="right">
            <template v-slot="scope">
              <el-button
                v-if="+scope.row.isEdit === 1"
                v-auth="[authCode.sysRole]"
                type="primary"
                text
                size="default"
                @click="handleUpdate(scope.$index, scope.row)"
                icon="i-ep-edit"
              >
                编辑权限
              </el-button>
              <el-button
                v-if="+scope.row.isEdit === 1"
                v-auth="[authCode.sysRole]"
                type="primary"
                text
                size="default"
                @click="handleDelete(scope.$index, scope.row)"
                icon="i-ep-delete"
                >删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pagination-container" v-if="state.list.length > 0">
        <el-pagination
          background
          @update:page-size="handleSizeChange"
          @update:current-page="handleCurrentChange"
          layout="sizes,prev, pager, next,jumper"
          v-model:pageSize="state.listQuery.pageSize"
          :page-sizes="[5, 10, 15]"
          :current-page="state.listQuery.pageNum"
          :total="state.total"
        >
        </el-pagination>
      </div>
    </div>
    <RoleDetail
      v-if="visible"
      title="角色"
      :objId="objId"
      :isEdit="isEdit"
      v-model="visible"
      @onRefresh="handleRefresh"
    ></RoleDetail>
  </div>
</template>
<script lang="ts" setup>
import { useListWithForm } from '@/composable/listWithFormSup'
import roleApi from '@/apis/role'
import { request } from '@/util/request'
import { usePost, useGet } from '@/composable/requestSup'
import RoleDetail from '@/views/sys/role/component/roleDetail.vue'
import { authCode } from '@/consts'

const defaultQuery = {
  keyword: '',
  pageNum: 1,
  pageSize: 10
}
const state = reactive({
  listQuery: defaultQuery,
  list: [],
  listLoading: true,
  total: 0
})

const { visible, isEdit, objId, useOpsAdd, useOpsUpdate } = useListWithForm()

onMounted(() => {
  fetchRoleList()
})
const fetchRoleList = () => {
  state.listLoading = true
  request.get(roleApi.roleList, state.listQuery).then((rep) => {
    state.listLoading = false
    state.list = rep.data.list
    state.total = rep.data.total
  })
}
const handleDelete = (_, row) => {
  useGet(roleApi.roleDelete, { roleId: row.roleId }, '删除', '是否要删除该角色').then(() =>
    fetchRoleList()
  )
}
const handleAdd = () => {
  useOpsAdd()
}
const handleUpdate = (_, row) => {
  useOpsUpdate(row.roleId)
}
const handleSearch = () => {
  fetchRoleList()
}
const handleRefresh = () => {
  fetchRoleList()
  visible.value = false
}
const handleSizeChange = (val) => {
  state.listQuery.pageNum = 1
  state.listQuery.pageSize = val
  fetchRoleList()
}
const handleCurrentChange = (val) => {
  state.listQuery.pageNum = val
  fetchRoleList()
}
</script>
<style lang="scss" scoped>
.update_box {
  cursor: pointer;
  width: 100%;
}
</style>
