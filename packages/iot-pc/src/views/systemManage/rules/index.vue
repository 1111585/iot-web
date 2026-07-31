<template>
  <BaseContainer title="规则配置" :tabs="tabItems" v-model:tab="tab">
    <ul class="list">
      <li class="list-item">
        当高温事件告警发生后，每
        <el-input v-model="rules.temp[0]" />
        分钟再次进行告警
      </li>
      <!-- <li class="list-item">
        当告警事件被忽略后，等待
        <el-input v-model="rules.temp[1]" />
        分钟再次提醒
      </li>
      <li class="list-item">
        当告警事件被确定后，等待
        <el-input v-model="rules.temp[2]" />
        分钟再次提醒
      </li>
      <li class="list-item">
        当告警已处理后，后续
        <el-input v-model="rules.temp[3]" />
        分钟内，原有的告警不生效，如果再次产生，则产生新的一条记录
      </li>
      <li class="list-item">
        一个感知设备的不同区域发生告警时，
        <el-radio-group v-model="rules.temp[4]" size="small">
          <el-radio-button value="1">产生不同条数</el-radio-button>
          <el-radio-button value="2">合并成一条</el-radio-button>
        </el-radio-group>
        预警信息
      </li>
      <li class="list-item">
        预警由一级升级为二级时，
        <el-radio-group v-model="rules.temp[5]" size="small">
          <el-radio-button value="1">产生不同条数</el-radio-button>
          <el-radio-button value="2">合并成一条</el-radio-button>
        </el-radio-group>
        条预警信息，一级告警处理后，二级告警的状态也随之变化
      </li>
      <li class="list-item">
        当监测的数据恢复到正常时，预警的状态
        <el-radio-group v-model="rules.temp[6]" size="small">
          <el-radio-button value="1">不变</el-radio-button>
          <el-radio-button value="2">显示为已处理</el-radio-button>
        </el-radio-group>
      </li>
      <li class="list-item">
        当布控区域发生变化时，再次告警会
        <el-radio-group v-model="rules.temp[7]" size="small">
          <el-radio-button value="1">重新生成一份新的告警</el-radio-button>
          <el-radio-button value="2">保持不变</el-radio-button>
        </el-radio-group>
      </li> -->
      <li class="list-item">
        预警间隔时长
        <el-input v-model="rules.temp[8]" type="number" style="width: 80px;" />
        分钟
      </li>
    </ul>
    <div class="footer">
      <el-button plain type="primary" @click="onSubmitClick">保存配置</el-button>
    </div>
  </BaseContainer>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import BaseContainer from '@/components/renderer/BaseContainer.vue'
import { request } from '@/util/request'
import { deviceApi } from '@/apis/device'
import type { EventRuleRes } from '../types'

/**
 * TODO：这是一个等待被决定的页面
 */

const tabItems = [
  { title: '高温事件告警', type: '0' },
  { title: '电弧闪络告警', type: '1' },
]

const rules = ref({
  // TODO 这个是什么格式的数据 ???
  temp: ['60', '60', '60', '60', '1', '1', '1', '1']
})

const tab = ref('1')

async function onSubmitClick() {
  try {
    const payload = {
      ruleId: 1, //规则配置主键ID
      ruleConfigurationName: '高温事件告警', //规则配置名称
      afterTheEvent: rules.value.temp[0], //事件发生后
      afterTheIgnore: rules.value.temp[1], //事件忽略后
      afterTheConfirm: rules.value.temp[2], //事件确定后
      afterTheProcessed: rules.value.temp[3], //事件已处理后
      warningTime: rules.value.temp[8], //预警时长
      entId: '', //企业ID
      addTime: '2024-12-02 16:46',
      addUser: '杨才文',
      addId: '1863428605317615616',
      updateTime: '',
      updateUser: '',
      updateId: '',
      enable: 1 //是否启用
    }

    const reqUrl = deviceApi.eventRules.update
    const { code } = await request.postJson(reqUrl, payload)

    if (code === 100) ElMessage.success('保存成功')
  } catch (error) {
    onError('保存的时候报错了')
  }
}

async function fetchRules() {
  try {
    // TODO: 当前仅设置这一个规则
    const ruleId = 1
    const reqUrl = deviceApi.eventRules.getDetail
    const { data } = await request.get<any, EventRuleRes>(reqUrl, { ruleId })

    const temp = rules.value.temp
    temp[0] = data.afterTheEvent
    temp[1] = data.afterTheIgnore
    temp[2] = data.afterTheConfirm
    temp[3] = data.afterTheProcessed
    temp[8] = data.warningTime.toString()
  } catch (error) {
    onError(error)
  }
}

function onError(error) {
  console.log('[规则配置]', error)
}

onMounted(() => {
  fetchRules()
})
</script>

<style lang="scss" scoped>
.list {
  margin-left: 8px;
  padding: 10px 20px;
  color: var(--el-text-color-primary);
  background-color: #f7f7f7;
  border-radius: 4px;
  &-item {
    display: flex;
    align-items: center;
    margin: 10px 0;
    font-size: 14px;
    font-weight: normal;

    .el-input {
      width: 60px;
      margin: 0 5px;
    }

    .el-radio-group {
      margin: 0 5px;
    }
  }
}

.footer {
  position: absolute;
  bottom: 20px;
  padding: 0 10px;
}
</style>
