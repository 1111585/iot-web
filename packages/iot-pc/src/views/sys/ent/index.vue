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
            prop="entName"
            header-align="center"
            align="center"
            min-width="150"
            :show-overflow-tooltip="true"
            label="企业名称"
          >
          </el-table-column>
          <el-table-column
            prop="areaName"
            header-align="center"
            align="center"
            min-width="150"
            :show-overflow-tooltip="true"
            label="所在地区名称"
          >
          </el-table-column>
          <el-table-column
            prop="introduce"
            header-align="center"
            align="center"
            min-width="150"
            :show-overflow-tooltip="true"
            label="描述"
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
                  type="primary"
                  text
                  size="default"
                  @click="handleUpdate(scope.$index, scope.row)"
                  icon="i-ep-edit"
                >
                  编辑
                </el-button>
                <el-button
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
    <EntDetail
      v-if="visible"
      title="企业"
      :objId="objId"
      :isEdit="isEdit"
      v-model="visible"
      @onRefresh="handleRefresh"
    ></EntDetail>
  </div>
</template>
<script lang="ts" setup>
import { useListWithForm } from '@/composable/listWithFormSup'
import entApi from '@/apis/ent'
import { request } from '@/util/request'
import { usePost, useGet } from '@/composable/requestSup'
import EntDetail from '@/views/sys/ent/component/entDetail.vue'
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
  fetchEntList()
})
const fetchEntList = () => {
  state.listLoading = true
  request.get(entApi.entList, state.listQuery).then((rep) => {
    state.listLoading = false
    state.list = rep.data.list
    state.total = rep.data.total
  })
}
const handleDelete = (_, row) => {
  useGet(entApi.entDelete, { entId: row.entId }, '删除', '是否要删除该企业').then(() =>
    fetchEntList()
  )
}
const handleAdd = () => {
  useOpsAdd()
}
const handleUpdate = (_, row) => {
  useOpsUpdate(row.entId)
}
const handleSearch = () => {
  fetchEntList()
}
const handleRefresh = () => {
  fetchEntList()
  visible.value = false
}
const handleSizeChange = (val) => {
  state.listQuery.pageNum = 1
  state.listQuery.pageSize = val
  fetchEntList()
}
const handleCurrentChange = (val) => {
  state.listQuery.pageNum = val
  fetchEntList()
}
</script>
<style lang="scss" scoped>
.update_box {
  cursor: pointer;
  width: 100%;
}
</style>
