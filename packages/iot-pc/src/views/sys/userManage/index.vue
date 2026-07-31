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
          添加
        </el-button>
      </template>
    </tab-panel>
    <div class="app-container">
      <div class="table-container">
        <div class="operation-container">
          <div>
            <span class="stat">共{{ state.total }}条数据</span>
            <span class="ml10 mr10 f12">|</span>
            <el-button link type="primary" @click="checkLockAccount">查询锁定账号</el-button>
            <!-- <el-button link type="primary" @click="exportLockAccount">导出锁定账号</el-button> -->
          </div>
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
            prop="nickname"
            header-align="center"
            align="center"
            min-width="150"
            :show-overflow-tooltip="true"
            label="昵称"
          >
          </el-table-column>
          <ElTableColumn header-align="center" align="center" min-width="150" label="手机号码">
            <template #default="scope">
              <span v-if="scope.row.phone != 0">{{ phoneVal(scope.row.phone) }}</span>
            </template>
          </ElTableColumn>
          <el-table-column
            prop="email"
            header-align="center"
            align="center"
            min-width="150"
            :show-overflow-tooltip="true"
            label="邮箱"
          >
          </el-table-column>
          <el-table-column label="状态" align="center" min-width="90">
            <template v-slot="scope">
              <el-tag :type="baseTagType(scope.row.status)">
                {{ AccountStatus[scope.row.status] }}
              </el-tag>
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
          <el-table-column label="操作" min-width="100" align="center" fixed="right">
            <template v-slot="scope">
              <MultiOpertion :limit="5" v-if="!state.listLoading">
                <el-button
                  type="primary"
                  text
                  size="default"
                  @click="handleAddAccount(scope.row)"
                  icon="i-ep-plus"
                >
                  添加账号
                </el-button>
                <el-button
                  type="primary"
                  text
                  size="default"
                  @click="handleAccountDetail(scope.row)"
                  icon="i-ep-Reading"
                >
                  查看账号
                </el-button>
                <el-button
                  type="primary"
                  text
                  size="default"
                  @click="handleSetRole(scope.row)"
                  icon="i-ep-user"
                >
                  分配角色
                </el-button>
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
              </MultiOpertion>
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
    <UserDetail
      v-if="visible && type == ''"
      title="人员"
      :objId="objId"
      :isEdit="isEdit"
      v-model="visible"
      @onRefresh="handleRefresh"
    ></UserDetail>
    <AddAccount
      v-if="visible && type == 'addAccount'"
      title="账号"
      :objId="objId"
      :isEdit="isEdit"
      v-model="visible"
      :userInfo="userInfo"
    ></AddAccount>
    <AccountDetail
      v-if="visible && type == 'addAccountDetail'"
      title="账号详情"
      :objId="objId"
      :isEdit="isEdit"
      v-model="visible"
      :userInfo="userInfo"
      @click-update="handleUpdateAccount"
    ></AccountDetail>
    <SetRole
      v-if="visible && type == 'setRole'"
      title="分配角色"
      :objId="objId"
      :isEdit="isEdit"
      v-model="visible"
      :userInfo="userInfo"
      @onRefresh="handleRefresh"
    ></SetRole>
    <AccountLocked v-model="isShow.accountLocked"></AccountLocked>
  </div>
</template>
<script lang="ts" setup>
import { useListWithForm } from '@/composable/listWithFormSup'
import empApi from '@/apis/emp'
import { request } from '@/util/request'
import { usePost, useGet } from '@/composable/requestSup'
import UserDetail from '@/views/sys/userManage/component/userDetail.vue'
import AddAccount from '@/views/sys/userManage/component/addAccount.vue'
import AccountDetail from '@/views/sys/userManage/component/accountDetail.vue'
import AccountLocked from '@/views/sys/userManage/component/accountLocked.vue'
import SetRole from '@/views/sys/userManage/component/setRole.vue'
import MultiOpertion from '@/components/base/multiOpertion'
import { AccountStatus } from '@/enums'
import { baseTagType } from '@/util/styles'
import { checkPermPrompt } from '@/views/sys/utils'
import userStore from '@/store/user'

const currentLoginUser = userStore().userInfo

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
const isShow = reactive({
  accountLocked: false
})

const { visible, isEdit, objId, useOpsAdd, useOpsUpdate } = useListWithForm()
const type = ref()
const userInfo = ref({})
onMounted(() => {
  fetchEmpList()
})
const phoneVal = (val) => {
  const phone = '' + val
  var reg = /(\d{3})\d{4}(\d{4})/
  return phone.replace(reg, '$1****$2')
}
const fetchEmpList = () => {
  state.listLoading = true
  request.get(empApi.empList, state.listQuery).then((rep) => {
    state.listLoading = false
    state.list = rep.data.list
    state.total = rep.data.total
  })
}
const handleDelete = (_, row) => {
  checkPermPrompt()
    .then(() => {
      useGet(empApi.empDelete, { empId: row.empId }, '删除', '是否要删除该人员').then(() =>
        fetchEmpList()
      )
    })
    .catch(() => {})
}
const handleAdd = () => {
  checkPermPrompt()
    .then(() => {
      useOpsAdd()
      type.value = ''
    })
    .catch(() => {})
}
const handleUpdate = (_, row) => {
  checkPermPrompt()
    .then(() => {
      useOpsUpdate(row.empId)
      type.value = ''
    })
    .catch(() => {})
}
const handleSearch = () => {
  fetchEmpList()
}
const handleRefresh = () => {
  fetchEmpList()
  visible.value = false
}
const handleSizeChange = (val) => {
  state.listQuery.pageNum = 1
  state.listQuery.pageSize = val
  fetchEmpList()
}
const handleCurrentChange = (val) => {
  state.listQuery.pageNum = val
  fetchEmpList()
}
const handleAddAccount = (row) => {
  checkPermPrompt()
    .then(() => {
      useOpsAdd()
      type.value = 'addAccount'
      userInfo.value = row
    })
    .catch(() => {})
}
const handleAccountDetail = (row) => {
  useOpsAdd()
  type.value = 'addAccountDetail'
  userInfo.value = row
}
const handleUpdateAccount = (row) => {
  checkPermPrompt()
    .then(() => {
      useOpsUpdate(row.accountId)
      type.value = 'addAccount'
      userInfo.value = row
    })
    .catch(() => {})
}

const handleSetRole = (row) => {
  checkPermPrompt()
    .then(() => {
      useOpsAdd()
      type.value = 'setRole'
      userInfo.value = row
    })
    .catch(() => {})
}

const checkLockAccount = () => {
  isShow.accountLocked = true
}
</script>
<style lang="scss" scoped>
.update_box {
  cursor: pointer;
  width: 100%;
}

.table-container {
  min-height: 73vh !important;
}
</style>
