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
          row-key="dictId"
          :tree-props="{ children: 'children' }"
        >
          <el-table-column
            prop="dictName"
            header-align="center"
            align="center"
            min-width="150"
            :show-overflow-tooltip="true"
            label="字典名称"
          >
          </el-table-column>
          <el-table-column
            prop="dictTypeName"
            header-align="center"
            align="center"
            min-width="150"
            :show-overflow-tooltip="true"
            label="字典种类名称"
          >
          </el-table-column>

          <el-table-column
            prop="dictType"
            header-align="center"
            align="center"
            min-width="150"
            :show-overflow-tooltip="true"
            label="字典类型"
          >
          </el-table-column>

          <el-table-column
            prop="dictValue"
            header-align="center"
            align="center"
            min-width="150"
            :show-overflow-tooltip="true"
            label="字典值"
          >
          </el-table-column>
          <el-table-column
            prop="remark"
            header-align="center"
            align="center"
            min-width="150"
            :show-overflow-tooltip="true"
            label="备注"
          >
          </el-table-column>
          <el-table-column
            prop="creater"
            header-align="center"
            align="center"
            min-width="150"
            :show-overflow-tooltip="true"
            label="创建人"
          >
          </el-table-column>
          <el-table-column
            prop="createTime"
            header-align="center"
            align="center"
            min-width="150"
            :show-overflow-tooltip="true"
            label="创建时间"
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
    <DictionaryDetail
      v-if="visible"
      title="数据字典"
      :objId="objId"
      :isEdit="isEdit"
      v-model="visible"
      @onRefresh="handleRefresh"
    ></DictionaryDetail>
  </div>
</template>
<script lang="ts" setup>
import { useListWithForm } from '@/composable/listWithFormSup'
import dictApi from '@/apis/dict'
import { request } from '@/util/request'
import { usePost, useGet } from '@/composable/requestSup'
import DictionaryDetail from '@/views/sys/dictionary/component/dictionaryDetail.vue'

import { treeDataTranslate } from '@/util/index'
const defaultQuery = {
  keyword: '',
  pageNum: 1,
  pageSize: 10,
  dictType: '', //字典类型
  dictName: '' //字典名称
}
const state = reactive({
  listQuery: defaultQuery,
  list: [],
  listLoading: true,
  total: 0
})

const { visible, isEdit, objId, useOpsAdd, useOpsUpdate } = useListWithForm()

onMounted(() => {
  fetchDictList()
})
const fetchDictList = () => {
  state.listLoading = true
  request.get(dictApi.dictList, state.listQuery).then((rep) => {
    state.listLoading = false
    state.list = treeDataTranslate(rep.data.list, 'dictId', 'pid')
    state.total = rep.data.total

    console.log(state.list)
  })
}
const handleDelete = (_, row) => {
  useGet(dictApi.dictDelete, { dictId: row.dictId }, '删除', '是否要删除数据字典').then(() =>
    fetchDictList()
  )
}
const handleAdd = () => {
  useOpsAdd()
}
const handleUpdate = (_, row) => {
  useOpsUpdate(row.dictId)
}
const handleSearch = () => {
  fetchDictList()
}
const handleRefresh = () => {
  fetchDictList()
  visible.value = false
}
const handleSizeChange = (val) => {
  state.listQuery.pageNum = 1
  state.listQuery.pageSize = val
  fetchDictList()
}
const handleCurrentChange = (val) => {
  state.listQuery.pageNum = val
  fetchDictList()
}
</script>
<style lang="scss" scoped>
.update_box {
  cursor: pointer;
  width: 100%;
}
</style>
