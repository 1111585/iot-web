<template>
  <BaseContainer>
    <template #operation>
      <div>
        <el-tag v-if="fetchFailureCount >= 5" type="danger" size="large" style="margin-right: 10px">
          <span>连接失败</span>
        </el-tag>
        <el-tag v-else type="primary" size="large" style="margin-right: 10px">
          <span class="refresh-icon">⟳</span>
          <span>获取数据中...</span>
        </el-tag>
        <!-- <el-button type="primary" @click="dialogVisible = true">添加设备</el-button> -->
      </div>
    </template>
    <div class="devices-container">
      <!-- 开关柜分组 -->
      <div class="cabinets-group">
        <div class="group-header">
          <span class="group-title">开关柜</span>
        </div>
        <!-- 开关柜列表 -->
        <div v-for="cabinet in cabinets" :key="cabinet.id" class="cabinet-card">
          <div class="cabinet-header">
            <button class="collapse-btn" @click="toggleCabinetExpanded(cabinet.id)">
              <span
                :class="[
                  'collapse-icon',
                  (cabinetExpandedState.get(cabinet.id) ?? true) ? 'expanded' : 'collapsed'
                ]"
              >
                ▼
              </span>
            </button>
            <span class="cabinet-title" @click="openDrawer(cabinet, 0)">{{ cabinet.name }}</span>
            <div class="cabinet-status">
              <div
                :class="[
                  'status-circle',
                  getCabinetLatestStatus(cabinet) === 'on' ? 'status-on' : 'status-off'
                ]"
              ></div>
            </div>
          </div>

          <!-- 变电箱列表 -->
          <div v-show="cabinetExpandedState.get(cabinet.id) ?? true" class="transformer-list">
            <div
              v-for="(transformer, index) in cabinet.transformers.slice(0, 3)"
              :key="transformer.id"
              class="transformer-item"
              @click="openDrawer(cabinet, index)"
            >
              <span class="transformer-time">
                {{ formatDate(transformer.createTime, 'yyyy年MM月dd日 hh:mm:ss') }}
              </span>

              <div class="status-indicator">
                <div
                  :class="[
                    'status-circle',
                    transformer.status === 'on' ? 'status-on' : 'status-off'
                  ]"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 骨架屏占位符 -->
        <div
          v-for="i in 8 - cabinets.length"
          :key="`skeleton-${i}`"
          class="cabinet-card skeleton-card"
        >
          <div class="cabinet-header">
            <button class="collapse-btn" disabled>
              <span class="collapse-icon">▼</span>
            </button>
            <div class="skeleton-title"></div>
            <div class="cabinet-status">
              <div class="skeleton-circle"></div>
            </div>
          </div>

          <!-- 骨架屏变电箱列表 -->
          <div class="transformer-list">
            <div v-for="j in 3" :key="`skeleton-item-${j}`" class="transformer-item skeleton-item">
              <div class="skeleton-time"></div>
              <div class="skeleton-circle-small"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑设备' : '添加设备'"
      width="40%"
      draggable
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        style="padding: 30px 20px"
      >
        <el-form-item label="设备名称" prop="deviceName">
          <el-input v-model="formData.deviceName" />
        </el-form-item>
        <el-form-item label="设备ID" prop="deviceId">
          <el-input v-model="formData.deviceId" />
        </el-form-item>
        <el-form-item label="状态" prop="state">
          <el-select v-model="formData.state">
            <el-option label="开" :value="1" />
            <el-option label="关" :value="2" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div style="display: flex; justify-content: flex-end">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="onSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>
    <el-drawer v-model="drawerVisible" :title="drawerTitle" size="50%">
      <template #header>
        <div class="drawer-header">
          <span>{{ drawerTitle }}</span>
          <div class="drawer-header-actions" v-if="selectedTransformer">
            <el-button type="primary" link size="small" @click="onEdit(selectedTransformer)">
              编辑
            </el-button>
            <el-button type="danger" link size="small" @click="onDelete(selectedTransformer)">
              删除
            </el-button>
          </div>
        </div>
      </template>
      <div class="drawer-content">
        <div
          v-for="transformer in drawerTransformers"
          :key="transformer.id"
          class="drawer-item"
          @click="selectedTransformer = transformer"
        >
          <div class="drawer-item-row">
            <span class="drawer-item-time">
              {{ formatDate(transformer.createTime, 'yyyy年MM月dd日 hh:mm:ss') }}
            </span>
            <div
              :class="['status-circle', transformer.status === 'on' ? 'status-on' : 'status-off']"
            ></div>
          </div>
        </div>
      </div>
      <template #footer>
        <div style="display: flex; justify-content: flex-end">
          <el-pagination
            v-model:currentPage="drawerListQuery.pageNum"
            v-model:page-size="drawerListQuery.pageSize"
            :page-size-opts="[20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="drawerTotal"
            @size-change="fetchDrawerList"
            @current-change="fetchDrawerList"
          />
        </div>
      </template>
    </el-drawer>
  </BaseContainer>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import BaseContainer from '@/components/renderer/BaseContainer.vue'
import { request } from '@/util/request'
import { deviceApi } from '@/apis/_dmzn'
import { RetEnum } from '@/enums'
import { useGet } from '@/composable/requestSup'
import { formatDate } from '@/util'
import { DeviceRes } from './types'

interface Transformer {
  id: string | number
  deviceId: string | number
  name: string
  status: 'on' | 'off'
  createTime: string
}

interface Cabinet {
  id: string | number
  deviceId: string | number
  name: string
  transformers: Transformer[]
}

// 将 DeviceRes 转换为 Cabinet 格式
function transformDevicesToCabinets(devices: DeviceRes[]): Cabinet[] {
  // 按设备名称分组（假设设备名称表示柜子）
  const cabinetMap = new Map<string, Transformer[]>()

  devices.forEach((device) => {
    const cabinetName = device.deviceName
    const transformer: Transformer = {
      id: device.id,
      deviceId: device.deviceId,
      name: device.deviceName,
      status: device.state === 2 ? 'on' : 'off',
      createTime: device.createTime
    }

    if (!cabinetMap.has(cabinetName)) {
      cabinetMap.set(cabinetName, [])
    }
    cabinetMap.get(cabinetName)!.push(transformer)
  })

  // 转换为 Cabinet 数组
  return Array.from(cabinetMap.entries()).map((entry, index) => ({
    id: index + 1,
    deviceId: entry[1][0].deviceId,
    name: entry[0],
    transformers: entry[1]
  }))
}

// 示例数据
const cabinets = ref<Cabinet[]>([
  /*
  {
    id: 1,
    deviceId: '1',
    name: '中心井开关柜',
    transformers: [
      { id: 1, deviceId: '1', name: '中心变电箱-01', status: 'off' },
      { id: 2, deviceId: '2', name: '中心变电箱-02', status: 'on' }
    ]
  },
  {
    id: 2,
    deviceId: '3',
    name: '东区井开关柜',
    transformers: [
      { id: 3, deviceId: '3', name: '东区变电箱-01', status: 'on' },
      { id: 4, deviceId: '4', name: '东区变电箱-02', status: 'off' },
      { id: 5, deviceId: '5', name: '东区变电箱-03', status: 'on' }
    ]
  }
    */
])

// 管理每个柜子的折叠状态
const cabinetExpandedState = ref<Map<string | number, boolean>>(new Map())

// 获取柜子的最新子类状态（取第一个子类的状态）
function getCabinetLatestStatus(cabinet: Cabinet): 'on' | 'off' {
  if (cabinet.transformers.length === 0) {
    return 'off'
  }
  return cabinet.transformers[0].status
}

// 切换柜子的折叠状态
function toggleCabinetExpanded(cabinetId: string | number) {
  const currentState = cabinetExpandedState.value.get(cabinetId) ?? true
  cabinetExpandedState.value.set(cabinetId, !currentState)
}

const listQuery = reactive({
  keyword: '',
  pageSize: 20,
  pageNum: 1
})

const total = ref(0)
let fetchFailureCount = ref(0)
let isFetching = ref(false)
const MAX_FAILURE_COUNT = 5

// Drawer 列表独立的分页参数
const drawerListQuery = reactive({
  keyword: '',
  pageSize: 20,
  pageNum: 1
})
const drawerTotal = ref(0)
const drawerTransformers = ref<Transformer[]>([])

async function fetchList() {
  // 如果已有请求在进行中，则跳过本次轮询
  if (isFetching.value) {
    return
  }

  isFetching.value = true
  try {
    const { data, code } = await request.get<any, ARC.ListRes<DeviceRes>>(deviceApi.list, listQuery)
    if (code !== RetEnum.SUCCESS) {
      throw new Error()
    }
    cabinets.value = transformDevicesToCabinets(data.list)
    // 请求成功，重置失败计数
    fetchFailureCount.value = 0
    isFetching.value = false
    total.value = data.total
  } catch (error) {
    fetchFailureCount.value++
    console.error(`获取设备列表失败 (${fetchFailureCount.value}/${MAX_FAILURE_COUNT}):`, error)

    // 失败5次后停止轮询
    if (fetchFailureCount.value >= MAX_FAILURE_COUNT) {
      console.warn('请求连续失败5次，已停止轮询。请刷新浏览器重试。')
      if (pollInterval) {
        clearInterval(pollInterval)
        pollInterval = null
      }
    }
    isFetching.value = false
  }
}

const drawerVisible = ref(false)
const drawerTitle = ref('')
const currentCabinet = ref<Cabinet | null>(null)
const selectedTransformer = ref<Transformer | null>(null)

function getCurrentCabinetTransformers() {
  return currentCabinet.value?.transformers || []
}

const currentCabinetTransformers = ref<Transformer[]>([])

// Drawer 列表独立的请求函数
async function fetchDrawerList() {
  try {
    const { data, code } = await request.get<any, ARC.ListRes<DeviceRes>>(
      deviceApi.list,
      drawerListQuery
    )
    if (code !== RetEnum.SUCCESS) {
      throw new Error()
    }
    drawerTransformers.value = transformDevicesToCabinets(data.list).flatMap(
      (cabinet) => cabinet.transformers
    )
    drawerTotal.value = data.total
  } catch (error) {
    console.error('获取 Drawer 列表失败:', error)
  }
}

function openDrawer(cabinet: Cabinet, index: number) {
  currentCabinet.value = cabinet
  currentCabinetTransformers.value = cabinet.transformers
  selectedTransformer.value = cabinet.transformers[0] || null
  drawerTitle.value = `${cabinet.name} - 变电箱列表`
  drawerVisible.value = true

  // 重置 drawer 列表的分页参数
  drawerListQuery.pageNum = 1
  drawerListQuery.keyword = ''
  // 请求 drawer 列表数据
  fetchDrawerList()
}

const dialogVisible = ref(false)
const isEdit = ref(false)

const formData = ref({
  deviceName: '', //设备名称
  deviceId: '', //设备id
  state: 1 //状态:1开 2关
})

const formDataEdit = ref({
  id: ''
})

const formRules = reactive({
  deviceName: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  deviceId: [{ required: true, message: '请输入设备id', trigger: 'blur' }],
  state: [{ required: true, message: '请选择状态', trigger: 'change' }]
})

const formRef = ref()

function onEdit(transformer: Transformer) {
  isEdit.value = true
  formDataEdit.value.id = transformer.id
  formData.value = {
    deviceName: transformer.name,
    deviceId: transformer.deviceId as string,
    state: transformer.status === 'on' ? 2 : 1
  }
  dialogVisible.value = true
}

function onDelete(transformer: Transformer) {
  useGet(deviceApi.delete, { id: transformer.id }, '删除', '是否要删除设备').then(() => {
    ElMessage.success('删除成功')
    fetchList()
  })
}

function onSubmit() {
  formRef.value?.validate((valid) => {
    if (valid) {
      const reqUrl = isEdit.value ? deviceApi.update : deviceApi.create
      const reqData = isEdit.value
        ? { ...formData.value, id: formDataEdit.value.id }
        : formData.value
      request
        .postJson(reqUrl, reqData)
        .then((res) => {
          if (res.code === RetEnum.SUCCESS) {
            ElMessage.success(isEdit.value ? '修改成功' : '添加成功')
            dialogVisible.value = false
            fetchList()
          } else {
            ElMessage.error('操作失败')
          }
        })
        .catch((error) => {
          ElMessage.error('请求失败，请重试')
          console.error('请求错误:', error)
        })
    }
  })
}

watch(dialogVisible, (val) => {
  if (!val) {
    formRef.value?.resetFields()
    isEdit.value = false
    formDataEdit.value.id = ''
  }
})

let pollInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  fetchList()
  // 每3秒轮询一次列表
  pollInterval = setInterval(() => {
    fetchList()
  }, 3000)
})

onUnmounted(() => {
  // 组件卸载时清理定时器
  if (pollInterval) {
    clearInterval(pollInterval)
  }
})
</script>

<style scoped>
.devices-container {
  padding: 0;
  min-height: 100vh;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 开关柜分组 */
.cabinets-group {
  margin-bottom: 20px;
  padding: 20px;
  background: #eef2f7;
  border-radius: 8px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.group-header {
  padding: 0 0 16px 0;
  margin-bottom: 16px;
  border-bottom: 2px solid #c5cfd9;
  display: flex;
  align-items: center;
  gap: 12px;
  grid-column: 1 / -1;
}

.group-title {
  color: #2c3e50;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.3px;
}

/* 开关柜卡片 */
.cabinet-card {
  border-radius: 6px;
  padding: 16px;
  background: #3d4a5c;
  border: none;
  /* border-left: 3px solid #5a9fd4; */
  box-shadow: none;
  transition: all 0.3s ease;
}

.cabinet-card:hover {
  background: #4a5a6f;
  transform: none;
}

.cabinet-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #5a6b7f;
  display: flex;
  align-items: center;
  gap: 12px;
}

.collapse-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.collapse-icon {
  display: inline-block;
  color: #5a9fd4;
  font-size: 12px;
  transition: transform 0.3s ease;
}

.collapse-icon.expanded {
  transform: rotate(0deg);
}

.collapse-icon.collapsed {
  transform: rotate(-90deg);
}

.cabinet-header::before {
  content: '';
  display: inline-block;
  width: 3px;
  height: 20px;
  background: #5a9fd4;
  border-radius: 1px;
}

.cabinet-title {
  color: #e8eef5;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.3px;
  flex: 1;
  cursor: pointer;
  transition: color 0.3s ease;
}

.cabinet-title:hover {
  color: #5a9fd4;
}

.cabinet-status {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
}

.cabinet-status .status-circle {
  width: 16px;
  height: 16px;
}

/* 变电箱列表 */
.transformer-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.transformer-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 6px;
  background: #2d3a4a;
  border: none;
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;
}

.transformer-item:hover {
  background: #3a4a5a;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.transformer-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.transformer-name {
  color: #b8c5d6;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.2px;
}

.transformer-time {
  color: #b8c5d6;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.2px;
  flex: 1;
}

.transformer-time-right {
  color: #7a8a9a;
  font-size: 12px;
  letter-spacing: 0.1px;
  flex-shrink: 0;
  margin-right: 10px;
}

.action-buttons {
  display: none;
  align-items: center;
  flex-shrink: 0;
  margin-left: 10px;
}

.transformer-item:hover .action-buttons {
  display: flex;
}

.status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
}

.status-circle {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transition: all 0.3s ease;
  border: none;
}

.status-off {
  background-color: #1abc9c;
  box-shadow: 0 0 8px rgba(26, 188, 156, 0.8);
}

.status-off:hover {
  box-shadow: 0 0 12px rgba(26, 188, 156, 1);
  transform: scale(1.15);
}

.status-on {
  background-color: #e74c3c;
  box-shadow: 0 0 8px rgba(231, 76, 60, 0.8);
}

.status-on:hover {
  box-shadow: 0 0 12px rgba(231, 76, 60, 1);
  transform: scale(1.15);
}

/* 刷新标签 */
.refresh-icon {
  display: inline-block;
  animation: rotate 1s linear infinite;
  margin-right: 4px;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 按钮过渡动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

/* Drawer 样式 */
.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.drawer-header-actions {
  display: flex;
  gap: 8px;
}

.drawer-content {
  padding: 20px;
}

.drawer-item {
  padding: 12px 16px;
  margin-bottom: 12px;
  border-radius: 6px;
  background: #f5f7fa;
  border: 1px solid #dcdfe6;
  transition: all 0.3s ease;
  cursor: pointer;
}

.drawer-item:hover {
  background: #f0f2f5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.drawer-item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.drawer-item-time {
  color: #606266;
  font-size: 14px;
  flex: 1;
}

/* 骨架屏样式 */
.skeleton-card {
  /* opacity: 0.6; */
  pointer-events: none;
}

.skeleton-title {
  height: 18px;
  background: linear-gradient(90deg, #4a5a6f 25%, #525d6a 50%, #4a5a6f 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 2.5s infinite;
  border-radius: 4px;
  flex: 1;
}

.skeleton-circle {
  width: 16px;
  height: 16px;
  background: linear-gradient(90deg, #4a5a6f 25%, #525d6a 50%, #4a5a6f 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 2.5s infinite;
  border-radius: 50%;
}

.skeleton-item {
  pointer-events: none;
  min-height: 44px;
}

.skeleton-time {
  height: 16px;
  width: 80%;
  background: linear-gradient(90deg, #3a4a5a 25%, #414d58 50%, #3a4a5a 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 2.5s infinite;
  border-radius: 4px;
}

.skeleton-circle-small {
  width: 12px;
  height: 12px;
  background: linear-gradient(90deg, #3a4a5a 25%, #414d58 50%, #3a4a5a 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 2.5s infinite;
  border-radius: 50%;
  flex-shrink: 0;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .devices-container {
    padding: 0;
  }

  .cabinet-card {
    padding: 16px;
    margin-bottom: 12px;
  }

  .cabinet-title {
    font-size: 15px;
  }

  .transformer-item {
    padding: 10px 14px;
  }

  .transformer-name {
    font-size: 13px;
  }
}
</style>
