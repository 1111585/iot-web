<template>
  <BaseContainer title="录像中心">
    <template #operation>
      <el-button class="mr30">视频录制</el-button>
    </template>
    <section class="filter-bar">
      <el-row :gutter="10">
        <el-col :span="8">
          <span>时间：</span>
          <el-date-picker
            v-model="timeRange"
            class="table-date"
            style="width: 340px; margin-right: 10px"
            type="datetimerange"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            arrow-control
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
            clearable
          />
        </el-col>
        <el-col :span="6">
          <span>视频类型：</span>
          <el-select placeholder="请选择" v-model="listQuery.deviceType" clearable>
            <el-option label="全部" value=""></el-option>
            <el-option label="可见光" :value="SenseAblity['可见光']"></el-option>
            <el-option label="红外" :value="SenseAblity['红外']"></el-option>
          </el-select>
        </el-col>
        <el-col :span="6">
          <span>感知设备：</span>
          <el-select placeholder="请选择" v-model="listQuery.sensingDeviceName"></el-select>
        </el-col>
        <el-col :span="3" style="margin-left: auto;">
            <el-button @click="onQueryBtnClick('reset')">重置</el-button>
            <el-button type="primary" @click="onQueryBtnClick('query')">查询</el-button>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8">
          <span>弧温预警设备：</span>
          <el-select placeholder="请选择" v-model="listQuery.aiBoxName"></el-select>
        </el-col>
        <el-col :span="6">
          <span>大小：</span>
          <el-input type="number" v-model="listQuery.startSize" placeholder="最小大小" style="width: 80px" @input="updateSizeRange('start', $event)" />
          <span class="ml5 mr5">-</span>
          <el-input type="number" v-model="listQuery.endSize" placeholder="最大大小" style="width: 80px" @input="updateSizeRange('end', $event)" />
          <span class="ml5">MB</span>
        </el-col>
        <el-col :span="6">
          <span>时长：</span>
          <el-input type="number" v-model="listQuery.startDuration" placeholder="最小时长" style="width: 80px" />
          <span class="ml5 mr5">-</span>
          <el-input type="number" v-model="listQuery.endDuration" placeholder="最大时长" style="width: 80px" />
          <span class="ml5">S</span>
        </el-col>
        <el-col :span="3">
            <!-- 占位 -->
        </el-col>
      </el-row>
    </section>
    <section class="table-wrapper">
      <TableHeadBar :total="total" hideit="keyword" />
      <DataTable v-model:page-num="listQuery.pageNum" :columns="videoColumn" :data="list" :loading="isLoading" :total="total">
        <template #deviceType="{ row }">
          {{ row.deviceType === 1 ? '可见光' : '红外' }}
        </template>
        <template #size="{ row }">
          {{ formatFileSize(row.size) }}
        </template>
        <template #opt="{ row }">
          <el-button type="primary" text @click="onOptBtnClick('view', row)">查看</el-button>
          <el-button type="primary" text @click="onOptBtnClick('download', row)">下载</el-button>
          <el-button type="danger" text @click="onOptBtnClick('delete', row)">删除</el-button>
        </template>
      </DataTable>
    </section>
  </BaseContainer>
</template>

<script setup lang="ts">
import { ElMessageBox } from 'element-plus'
import BaseContainer from '@/components/renderer/BaseContainer.vue'
import DataTable from '@/components/renderer/DataTable.vue'
import TableHeadBar from '@/components/form/TableHeadBar.vue'
import { SenseAblity } from '@/enums'
import { downloadFile } from '@/util'
import { videoColumn, useVideoCenter, formatFileSize } from './utils'
import type { VideoRes } from './types'

const { isLoading, list, total, listQuery, fetchList, deleteVideo } = useVideoCenter()

// 只用于时间范围选择器，因为需要数组格式
const timeRange = ref<string[]>([])

// 监听时间范围变化
watch(timeRange, (newVal) => {
  if (newVal && newVal.length === 2) {
    listQuery.value.startTime = newVal[0]
    listQuery.value.endTime = newVal[1]
  } else {
    listQuery.value.startTime = ''
    listQuery.value.endTime = ''
  }
})

// 监听分页变化
watch(() => listQuery.value.pageNum, () => {
  fetchList()
})

// 处理大小范围输入（MB 转 字节）
function updateSizeRange(type: 'start' | 'end', value: string) {
  const sizeInBytes = value ? String(Number(value) * 1024 * 1024) : ''
  if (type === 'start') {
    listQuery.value.startSize = sizeInBytes
  } else {
    listQuery.value.endSize = sizeInBytes
  }
}

function onQueryBtnClick(action: 'reset' | 'query') {
    if (action === 'reset') {
        timeRange.value = []
        
        listQuery.value.startTime = ''
        listQuery.value.endTime = ''
        listQuery.value.deviceType = ''
        listQuery.value.sensingDeviceName = ''
        listQuery.value.aiBoxName = ''
        listQuery.value.startSize = ''
        listQuery.value.endSize = ''
        listQuery.value.startDuration = ''
        listQuery.value.endDuration = ''
        
        listQuery.value.pageNum = 1
    } else {
        fetchList()
    }
}

function onOptBtnClick(action: 'view' | 'download' | 'delete', row: VideoRes) {
    switch (action) {
        case 'view':
            window.open(row.videoUrl, '_blank')
            break;
        case 'download':
            const filename = row.videoName
            downloadFile(row.videoUrl, filename)  
            break;
        case 'delete':
            ElMessageBox.confirm(`确定要删除${row.videoName}吗？`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }).then(() => deleteVideo(row.videoId)).then(() => {
                fetchList()
            }).catch(() => {})
            break;
    }
}

onMounted(() => {
    fetchList()
})
</script>

<style lang="scss" scoped>
.filter-bar {
  padding: 0 10px;

  .el-row {
    margin-bottom: 20px;
  }

  .el-col > span {
    font-size: 14px;
    color: rgb(80, 80, 80);
  }

  .el-select {
    width: 50%;
  }

  .el-input {
    width: 20%;
  }
}

.table-wrapper {
  margin-top: 50px;
}
</style>
