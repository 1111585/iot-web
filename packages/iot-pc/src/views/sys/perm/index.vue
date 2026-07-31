<template>
  <div>
    <tab-panel>
      <template #operation>
        <el-button
          size="default"
          type="primary"
          class="btn-add"
          icon="i-ep-plus"
          @click="useOpsAdd()"
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
          row-key="id"
          v-loading="state.listLoading"
          :row-style="{ height: '44px' }"
          @expand-change="handleExpandChange"
        >
          <el-table-column
            prop="id"
            header-align="center"
            align="center"
            width="80"
            label="ID"
            type=""
          >
          </el-table-column>
          <el-table-column
            prop="pid"
            header-align="center"
            align="center"
            width="120"
            label="上级ID"
            type=""
          >
          </el-table-column>
          <el-table-column header-align="center" align="center" min-width="100" label="图标">
            <template v-slot="scope">
              <svgIcon :icon-class="scope.row.icon"></svgIcon>
            </template>
          </el-table-column>
          <el-table-column
            header-align="center"
            align="center"
            prop="name"
            min-width="200"
            label="名称"
          >
          </el-table-column>
          <el-table-column
            prop="code"
            header-align="center"
            align="center"
            width="150"
            :show-overflow-tooltip="true"
            label="权限值"
          >
          </el-table-column>
          <el-table-column
            prop="sort"
            header-align="center"
            align="center"
            width="150"
            :show-overflow-tooltip="true"
            label="排序"
          >
          </el-table-column>
          <el-table-column
            prop="type"
            header-align="center"
            align="center"
            label="类型"
            width="120"
          >
            <template v-slot="scope">
              <el-tag v-if="scope.row.type === 0" size="default">目录</el-tag>
              <el-tag v-else-if="scope.row.type === 1" size="default" type="success">菜单</el-tag>
              <el-tag v-else-if="scope.row.type === 2" size="default" type="info">按钮</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="url"
            header-align="center"
            align="center"
            width="150"
            :show-overflow-tooltip="true"
            label="菜单URL"
          >
          </el-table-column>
          <el-table-column
            fixed="right"
            header-align="center"
            align="center"
            width="250"
            label="操作"
          >
            <template v-slot="scope">
              <span>
                <el-button
                  icon="i-ep-edit"
                  size="default"
                  text
                  type="primary"
                  @click="handleUpdate(scope.$index, scope.row)"
                  >编辑
                </el-button>
                <el-divider direction="vertical"></el-divider>
              </span>
              <el-button
                v-if="scope.row.type == 0"
                icon="i-ep-edit"
                size="default"
                text
                type="primary"
                @click="handleAdd(scope.$index, scope.row)"
                >添加下级
              </el-button>
              <el-divider direction="vertical"></el-divider>
              <el-button
                icon="i-ep-delete"
                size="default"
                text
                type="primary"
                @click="handleDelete(scope.$index, scope.row)"
                >删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <PermDetail
      v-if="visible"
      title="菜单"
      :objId="objId"
      :isEdit="isEdit"
      v-model="visible"
      @onRefresh="handleRefresh"
    ></PermDetail>
  </div>
</template>
<script lang="ts" setup>
import { treeDataTranslate } from '@/util/index'
import { useListWithForm } from '@/composable/listWithFormSup'
import PermDetail from '@/views/sys/perm/component/permDetail.vue'
import permApi from '@/apis/perm'
import { request } from '@/util/request'
import { usePost, useGet } from '@/composable/requestSup'
const prefix = shallowRef(import.meta.env.VITE_APP_PLATFORM)
const defaultQuery = {
  keyword: '',
  pageNum: 1,
  pageSize: 1000
}
const state = reactive({
  listQuery: defaultQuery,
  list: [],
  listLoading: true,
  total: 0
})
const parentUrl = ref<string>('')

const { visible, isEdit, objId, useOpsAdd, useOpsUpdate } = useListWithForm()

onMounted(() => {
  fetchPermList()
})
const fetchPermList = () => {
  state.listLoading = true
  request
    .get(permApi.permList, state.listQuery)
    .then((rep) => {
      state.listLoading = false
      state.list = treeDataTranslate(rep.data.list, 'id', 'pid')
      state.total = rep.data.total
    })
    .finally(() => {
      state.listLoading = false
    })
}
const handleDelete = (_, row) => {
  useGet(permApi.permDelete, { id: row.id }, '删除', '是否要删除该菜单').then(() => fetchPermList())
}
const handleAdd = (_, row) => {
  useOpsAdd(row ? row.id : '')
}
const handleUpdate = (_, row) => {
  useOpsUpdate(row.id)
}
const handleSearch = () => {
  fetchPermList()
}
const handleRefresh = () => {
  fetchPermList()
  visible.value = false
}
const formatDate = (time) => {
  if (time == null || time === '') {
    return 'N/A'
  }
}
const handleExpandChange = (row) => {}
</script>
<style lang="scss" scoped>
.update_box {
  cursor: pointer;
  width: 100%;
}
</style>
