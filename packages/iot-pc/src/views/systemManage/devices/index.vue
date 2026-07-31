<template>
  <BaseContainer title="设备配置">
    <template #operation>
      <el-button type="primary" icon="i-ep-plus" @click="onAddBtnClick">添加配置</el-button>
    </template>
    <TableHeadBar v-model:keyword="payload.keyword" :total="columnDataTotal" />
    <DataTable
      :columns="columns"
      :data="columnData"
      :total="columnDataTotal"
      :page-size="payload.pageSize"
      :page-num="payload.pageNum"
      @update:page-num="onPageNumChange"
    >
      <template #type="{ row }">
        <span>{{ ConfigTypes[row.type] }}</span>
      </template>
      <template #imageHeight="{ row }">
        <span>{{ getImageOptions(row) }}</span>
      </template>
      <template #status="{ row }">
        <el-tag :type="row.status == ConfigStatus['草稿'] ? 'info' : 'success'">
          {{ ConfigStatus[row.status] }}
        </el-tag>
      </template>
      <template #operation="{ row }">
        <TableOperator :row="row" :actions="columnActions" />
      </template>
    </DataTable>
    <el-dialog
      v-model="addDialog.visible"
      :title="addDialog.title"
      destroy-on-close
      draggable
      @close="onCancelClick"
    >
      <el-form
        class="dialog-form"
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="配置名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入"></el-input>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择">
            <el-option
              v-for="item in configOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <template v-if="isShow.imageHeight">
          <el-form-item v-if="!formData.address.includes('ch2')" label="分辨率" prop="imageHeight">
            <el-select v-model="formData.imageHeight" placeholder="请选择">
              <el-option
                v-for="item in imageOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <template v-else>
            <!-- <el-form-item label="分辨率（宽）" prop="imageWidth" :required="false">
                <el-input v-model="formDataTemp.imageWidth" placeholder="请输入"></el-input>
              </el-form-item> 
              <el-form-item label="分辨率（高）" :required="false" prop="imageHeight">
                <el-input v-model="formDataTemp.imageHeight" placeholder="请输入"></el-input>
              </el-form-item> -->
            <el-form-item label="通道号" prop="channelId">
              <el-radio-group v-model="formData.channelId">
                <el-radio :label="1">通道一</el-radio>
                <el-radio :label="2">通道二</el-radio>
              </el-radio-group>
              <!-- <el-select v-model="formData.channelId">
                  <el-option :value="1" label="通道一" />
                  <el-option :value="2" label="通道二" />
                </el-select> -->
            </el-form-item>
            <el-form-item label="测温矩阵" prop="thermalmat">
              <el-input
                v-model="formData.thermalMatW"
                required
                type="number"
                placeholder="请输入宽"
                style="width: 28%"
                class="mr5"
              />
              <el-input
                v-model="formData.thermalMatH"
                required
                type="number"
                placeholder="请输入高"
                style="width: 28%"
              />
            </el-form-item>
            <el-form-item label="可视化热力图" prop="heatmat">
              <el-input
                v-model="formData.heatMatW"
                required
                type="number"
                placeholder="请输入宽"
                style="width: 28%"
                class="mr5"
              />
              <el-input
                v-model="formData.heatMatH"
                required
                type="number"
                placeholder="请输入高"
                style="width: 28%"
              />
            </el-form-item>
          </template>
        </template>
        <el-form-item label="地址" prop="address">
          <el-input v-model="formData.address" placeholder="请输入"></el-input>
        </el-form-item>
        <el-form-item label="账户" prop="account">
          <el-input v-model="formData.account" placeholder="请输入"></el-input>
        </el-form-item>
        <el-form-item label="设备标识" prop="flag">
          <el-input v-model="formData.flag" placeholder="请输入"></el-input>
        </el-form-item>
        <el-form-item label="设备ID" prop="flagId">
          <el-input v-model="formData.flagId" placeholder="请输入"></el-input>
        </el-form-item>
        <el-form-item label="ip地址" prop="newIp">
          <el-input v-model="formData.newIp" placeholder="请输入"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            placeholder="请输入"
            type="textarea"
            :rows="4"
          ></el-input>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="onCancelClick">取消</el-button>
        <el-button @click="onSubmitClick(true)">暂存草稿</el-button>
        <el-button type="primary" @click="onSubmitClick()" :loading="is.btnLoading">保存</el-button>
      </template>
    </el-dialog>
  </BaseContainer>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'

import BaseContainer from '@/components/renderer/BaseContainer.vue'
import DataTable from '@/components/renderer/DataTable.vue'
import TableHeadBar from '@/components/form/TableHeadBar.vue'
import TableOperator from '@/components/form/TableOperator.vue'
import FormDialog from '@/components/base/formDialog.vue'
import { validateAsync } from '@/util'
import { request } from '@/util/request'
import { deviceApi } from '@/apis/device'
import { useGet } from '@/composable/requestSup'

enum ConfigTypes {
  'FLV' = 1,
  'RTSP' = 2,
  'AI盒子' = 3,
  '发送设备信息' = 4
}

enum ConfigStatus {
  '草稿' = 1,
  '已发布' = 2
}

const configOptions: ARC.Options[] = [
  {
    label: 'FLV',
    value: ConfigTypes.FLV
  },
  {
    label: 'RTSP',
    value: ConfigTypes.RTSP
  },
  {
    label: 'AI盒子',
    value: ConfigTypes['AI盒子']
  },
  {
    label: '发送设备信息',
    value: ConfigTypes['发送设备信息']
  }
]

const imageOptions: ARC.Options[] = [
  {
    label: '2688x1520',
    value: '2688x1520'
  },
  {
    label: '2.5K',
    value: '2560x1440'
  },
  {
    label: '2K',
    value: '2048x1080'
  },
  {
    label: '1080P',
    value: '1920x1080'
  },
  {
    label: '720P',
    value: '1280x720'
  }
]
function getImageOptions(row: ConfigRes) {
  if (row.address.includes('ch2')) {
    if (row.imageHeight) {
      return `${row.imageWidth} x ${row.imageHeight}`
    } else {
      // @ts-ignore
      return `${row.thermalMatW} x ${row.thermalMatH}`
    }
  }

  const value = row.imageWidth + 'x' + row.imageHeight
  const valuaAlias = imageOptions.find((item) => item.value === value)?.label // 2k、720p 等等
  if (valuaAlias) {
    return `${value} (${valuaAlias})`
  } else {
    return '-'
  }
}

const payload = reactive({
  pageNum: 1,
  pageSize: 20,
  keyword: '' // 配置名称
})

function onPageNumChange(num: number) {
  payload.pageNum = num
  fetchList()
}

const columns = [
  {
    prop: 'id',
    label: 'ID',
    hide: true
  },
  {
    prop: 'name',
    label: '配置名称'
  },
  {
    prop: 'type',
    label: '类型',
    slot: 'type',
    align: 'center',
    width: '100px'
  },
  {
    prop: 'address',
    label: '地址',
    width: '300'
  },
  {
    prop: 'account',
    label: '账户'
  },
  {
    prop: 'flag',
    label: '设备标识'
  },
  {
    prop: 'imageHeight',
    label: '分辨率',
    slot: 'imageHeight'
  },
  {
    prop: 'newIp',
    label: 'ip地址'
  },
  {
    prop: 'status',
    label: '状态',
    slot: 'status',
    align: 'center'
  },
  {
    prop: 'description',
    label: '描述'
  },
  {
    prop: 'operation',
    label: '操作',
    slot: 'operation',
    align: 'center',
    fixed: 'right',
    width: '100px'
  }
]
const columnData = ref<ConfigRes[]>([])
const columnDataTotal = ref(0)
const columnActions: ARC.Action[] = [
  {
    text: '编辑',
    callback: handleColumnEdit
  },
  {
    text: '删除',
    callback: handleColumnDelete
  }
]

const formRef = ref<FormInstance>()
const formData = reactive({
  name: '',
  type: '',
  address: '',
  account: '',
  description: '',
  flag: '',
  newIp: '',
  flagId: '', // 设备D
  imageHeight: '',
  imageWidth: '',
  channelId: 1,
  thermalMatW: '',
  thermalMatH: '',
  heatMatW: '',
  heatMatH: '',
  status: ConfigStatus['已发布']
})
const formDataTemp = reactive({
  imageHeight: '0',
  imageWidth: '0'
})
const formRules = reactive({
  name: [{ required: true, message: '请输入配置名称', trigger: 'blur' }],
  type: [{ required: true, message: '请输入类型', trigger: 'blur' }],
  imageHeight: [{ required: true, message: '请选择分辨率', trigger: 'change' }],
  imageWidth: [{ required: true, message: '请选择分辨率', trigger: 'change' }]
  // account: [{ required: true, message: '请输入账户', trigger: 'blur' }],
  // flag: [{ required: true, message: '请输入设备标识', trigger: 'blur' }],
  // newIp: [{ required: true, message: '请输入ip地址', trigger: 'blur' }]
})

const is = reactive({
  btnLoading: false
})

const isShow = reactive({
  imageHeight: false
})

const addDialog = reactive({
  visible: false,
  title: '',
  type: '' as ARC.DialogType,
  data: {} as ConfigRes,
  open(type: ARC.DialogType) {
    if (type === 'add') {
      addDialog.title = '添加配置'
    } else {
      addDialog.title = '编辑配置'
      fetchDetail(addDialog.data)
    }
    addDialog.type = type
    addDialog.visible = true
  },
  setData(data: ConfigRes) {
    addDialog.data = data
  }
})

function onAddBtnClick() {
  addDialog.open('add')
}

function onCancelClick() {
  addDialog.visible = false
  formRef.value?.resetFields()
}

async function onSubmitClick(isDraft = false) {
  try {
    is.btnLoading = true
    await validateAsync(formRef.value)

    if (formData.imageHeight) {
      if (formData.address.includes('ch2')) {
        formData.imageHeight = formDataTemp.imageHeight
        formData.imageWidth = formDataTemp.imageWidth
      } else {
        const [width, height] = formData.imageHeight.split('x')
        formData.imageHeight = height
        formData.imageWidth = width
      }
    }

    formData.status = isDraft ? ConfigStatus['草稿'] : ConfigStatus['已发布']

    const urls = {
      add: deviceApi.addDeviceConfig,
      edit: deviceApi.editDeviceConfig
    }
    const url = urls[addDialog.type]
    const { code } = await request.postJson(url, formData)
    if (code === 100) {
      ElMessage.success('保存成功')
      addDialog.visible = false
      fetchList()
    }
  } catch (error) {
    onError(error)
  } finally {
    is.btnLoading = false
  }
}

async function fetchList() {
  try {
    const { data } = await request.get<any, ARC.ListRes<ConfigRes>>(
      deviceApi.getDeviceConfigList,
      payload
    )
    columnData.value = data.list
    columnDataTotal.value = data.total
  } catch (error) {
    onError(error)
  }
}

async function fetchDetail(row: ConfigRes) {
  try {
    const { data } = await request.get(deviceApi.getDeviceConfigDetail, {
      id: row.id
    })
    if (Object.keys(data).length !== 0) {
      if (data.imageHeight) {
        if (data.address.includes('ch2')) {
          formDataTemp.imageHeight = data.imageHeight
          formDataTemp.imageWidth = data.imageWidth
        } else {
          const valueBind = data.imageWidth + 'x' + data.imageHeight
          data.imageHeight = valueBind
        }
      }
      Object.assign(formData, data)
    }
  } catch (error) {
    onError(error)
  }
}

function handleColumnEdit(row: ConfigRes) {
  addDialog.setData(row)
  addDialog.open('edit')
}

function handleColumnDelete(row: ConfigRes) {
  useGet(deviceApi.deleteDeviceConfig, { id: row.id }, '删除', '是否要删除该配置').then(fetchList)
}

const onError = (error: any) => console.log('出错了', error?.message)

watch(payload, fetchList, { deep: true })
// 是否显示分辨率选项
watch(
  () => formData.type,
  (val: any) => {
    if (val == ConfigTypes['RTSP']) {
      formRules.imageHeight = [{ required: true, message: '请选择分辨率', trigger: 'change' }]
      isShow.imageHeight = true
    } else {
      formRules.imageHeight = []
      isShow.imageHeight = false
    }
  }
)

watch(
  () => formDataTemp.imageWidth,
  (val) => {
    formData.imageWidth = val
  }
)

watch(
  () => formDataTemp.imageHeight,
  (val) => {
    formData.imageHeight = val
  }
)

onMounted(() => {
  fetchList()
})

interface ConfigRes {
  id: number
  name: string
  type: number
  address: string
  account: string
  description: string
  flag: string
  newIp: string
  imageWidth: number
  imageHeight: number
}
</script>

<style lang="scss" scoped>
.dialog-form {
  height: 60vh;
  overflow-y: scroll;
  padding: 20px 40px;
}
</style>
