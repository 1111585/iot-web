<template>
  <div class="iot-container">
    <BorderBox11 :title="iotTitle">
      <div class="iot-dashboard">
        <!-- 头部 -->
        <div class="header">
          <div class="weather">
            <!-- <div class="weather-icon">☀️</div> -->
            <div class="weather-info">
              <!-- <div>{{ weatherData.city }} {{ weatherData.weather }}</div> -->
              <!-- <div>{{ weatherData.temperature }}</div> -->
            </div>
          </div>
          <!-- <div class="title">IoT</div> -->
          <div class="decoration-container">
            <Decoration3 style="width: 25vw; height: 3vh" />
          </div>
          <div class="datetime">{{ weatherData.time }}</div>
        </div>

        <!-- 左侧面板 -->
        <div class="left-panel">
          <!-- 系统信息 -->
          <div class="panel-box system-info">
            <div class="panel-title">系统信息</div>
            <div class="status-overview">
              <div class="status-row">
                <div class="status-card">
                  <div class="status-icon">
                    <svgIcon icon-class="chart-account" size="1.8vh"></svgIcon>
                    <!-- <DigitalFlop :config="digitalFlopConfig(0)" /> -->
                  </div>
                  <div class="status-info">
                    <div class="status-name">开设账户</div>
                    <div class="status-value">{{ systemData.account }} 个</div>
                  </div>
                </div>
              </div>
              <div class="status-row">
                <div class="status-card">
                  <div class="status-icon">
                    <svgIcon icon-class="chart-gateway" size="1.8vh"></svgIcon>
                    <!-- <DigitalFlop :config="digitalFlopConfig(1)" /> -->
                  </div>
                  <div class="status-info">
                    <div class="status-name">通讯网关</div>
                    <div class="status-value">{{ systemData.gateway }} 台</div>
                  </div>
                </div>
              </div>
              <div class="status-row">
                <div class="status-card">
                  <div class="status-icon">
                    <svgIcon icon-class="chart-connect" size="1.8vh"></svgIcon>
                    <!-- <DigitalFlop :config="digitalFlopConfig(0)" /> -->
                  </div>
                  <div class="status-info">
                    <div class="status-name">一次接线图</div>
                    <div class="status-value">{{ systemData.connect }} 张</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 接入信息 -->
          <div class="panel-box access-info">
            <div class="panel-title">接入信息</div>
            <div class="area-grid">
              <div v-for="area in areaDeviceData" :key="area.id" class="area-item">
                <div class="area-icon">
                  <svgIcon icon-class="chart-electric" size="5vh"></svgIcon>
                  <!-- <Decoration3 style="width:40px;height:40px;" /> -->
                </div>
                <div class="area-name">{{ area.name }}</div>
                <div class="area-count">{{ area.count }} 个</div>
              </div>
            </div>
          </div>

          <!-- 告警排行 -->
          <div class="panel-box flex-panel">
            <div class="panel-title">告警排行</div>
            <div class="alert-panel-content">
              <div
                v-if="alertRankData && alertRankData.length > 0"
                class="alert-list"
                style="max-height: 30vh; overflow-y: auto"
              >
                <div v-for="(alert, index) in alertRankData" :key="index" class="alert-item">
                  <div :class="`alert-level level-${alert.level}`"></div>
                  <div class="alert-info">
                    <!-- <div class="alert-name">{{ getLevelName(alert.level) }}</div> -->
                    <div class="alert-name">{{ alert.name }}</div>
                  </div>
                  <!-- <div class="alert-count">{{ alert.count }}</div> -->
                  <div class="alert-times">{{ alert.times }} 次</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 中间面板 -->
        <div class="center-panel">
          <!-- 设备状态 -->
          <div class="panel-box radar-box flex-panel device-link">
            <div class="device-status-section">
              <Decoration12 style="width: 5vw; height: 5vw" />
              <div class="device-status-tabs">
                <div class="tab-container">
                  <div class="tab-header">
                    <!-- <div class="tab-item active">接入设备</div> -->
                    <div class="tab-item">接入设备</div>
                    <div class="tab-item">运行正常</div>
                    <div class="tab-item">设备告警</div>
                    <div class="tab-item">设备离线</div>
                    <div class="tab-item">设备异常</div>
                  </div>
                  <div class="tab-content">
                    <div class="device-status-overview">
                      <div
                        v-for="(item, index) in deviceStatusData"
                        :key="index"
                        class="device-status-item"
                      >
                        <div class="status-count">{{ item.count }}</div>
                        <div class="status-label">个</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- 地球仪 -->
            <div class="globe-container">
              <img src="/images/iot/earth.png" class="globe-image" />
              <div class="connection-points">
                <!-- 连接点和连线会在mounted中动态生成 -->
              </div>
            </div>
          </div>

          <!-- 告警统计 -->
          <div class="panel-box flex-panel">
            <div class="panel-title">告警统计</div>
            <!-- <div class="radar-chart" ref="radarChartRef"></div> -->
            <div class="pie-chart" ref="pieChartRef" style="height: 25vh"></div>
          </div>
        </div>

        <!-- 右侧面板 -->
        <div class="right-panel">
          <div class="flex-container">
            <!-- 实时告警 -->
            <div class="panel-box flex-panel">
              <div class="panel-title">实时告警</div>
              <div class="execution-alert">
                <div class="alert-stats" @click="(event) => onLiveAlertClick(event)">
                  <div class="stat-item" data-type="1">
                    <div class="stat-value">{{ liveAlertData.today }}</div>
                    <div class="stat-label" :class="{ active: liveAlertPayload.timeType === 1 }">
                      今日告警
                    </div>
                  </div>
                  <div class="stat-item" data-type="2">
                    <div class="stat-value">{{ liveAlertData.lastWeek }}</div>
                    <div class="stat-label" :class="{ active: liveAlertPayload.timeType === 2 }">
                      近一周告警
                    </div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value" data-type="3">{{ liveAlertData.lastMonth }}</div>
                    <div class="stat-label" :class="{ active: liveAlertPayload.timeType === 3 }">
                      近一月告警
                    </div>
                  </div>
                </div>
                <Decoration10 style="width: 100%; height: 0.5vh; margin: 1vh 0 1.4vh 0" />
                <div class="alert-actions">
                  <div class="action-button">告警点位</div>
                  <div class="action-button">状态</div>
                  <div class="action-button">类型</div>
                  <div class="action-button">时间</div>
                </div>
                <div class="alert-list">
                  <div v-if="liveAlertList.length === 0" class="no-data">暂无数据</div>
                  <div class="alert-item" v-for="(item, index) in liveAlertList" :key="index">
                    <div class="alert-cell">{{ item.name }}</div>
                    <div
                      class="alert-cell"
                      :class="{
                        'status-normal': item.state === 1101,
                        'status-warning': item.state !== 1101
                      }"
                    >
                      {{ item.state === 1101 ? '正常' : '异常' }}
                    </div>
                    <div class="alert-cell">{{ item.alarmType }}</div>
                    <div class="alert-cell">{{ item.alarmTime }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 设备链路 -->
            <div class="panel-box flex-panel">
              <!-- <BorderBox7 class="panel-box flex-panel" :color="['#082062', '#060711']"> -->
              <div class="panel-title">设备链路</div>
              <div class="device-deployment" style="max-height: 40vh; overflow-y: auto">
                <div class="device-network">
                  <ConnectionGraph />
                  <!-- <Decoration2 style="width:100%;height:5px;" />
                                    <div class="device-item">
                                        <div class="device-icon">
                                            <Decoration5 style="width:40px;height:40px;" />
                                        </div>
                                        <div class="device-info">
                                            <div class="device-name">{{ deviceDeploymentData.mainDevice.name }}</div>
                                            <div class="device-id">{{ deviceDeploymentData.mainDevice.id }}</div>
                                        </div>
                                    </div>
                                    <Decoration2 style="width:100%;height:5px;transform:rotate(180deg);" />
                                    <div class="device-item">
                                        <div class="device-icon">
                                            <Decoration5 style="width:40px;height:40px;" />
                                        </div>
                                        <div class="device-info">
                                            <div class="device-name">{{ deviceDeploymentData.subDevice.name }}</div>
                                            <div class="device-id">{{ deviceDeploymentData.subDevice.id }}</div>
                                        </div>
                                    </div> -->
                </div>
              </div>
              <!-- </BorderBox7> -->
            </div>
          </div>
        </div>
      </div>
    </BorderBox11>
    <DeviceStatus v-model="useDeviceStatus.visible" />
  </div>
</template>

<script setup lang="ts">
import { Radar, Pie } from '@antv/g2plot'
import {
  systemData,
  deviceStatusData,
  areaDeviceData,
  alertRankData,
  alertStatisticsData,
  liveAlertData,
  deviceDeploymentData,
  weatherData,
  useWeatherData,
  fetchLiveAlert,
  fetchLiveAlertList,
  fetchAlertRank,
  fetchAreaDevice,
  fetchDeviceStatus,
  fetchAlertStatistics,
  liveAlertList,
  liveAlertPayload,
  useDeviceStatus
} from '../utils'

// DataV组件
import {
  DigitalFlop,
  Decoration2,
  Decoration3,
  Decoration5,
  Decoration10,
  Decoration12,
  BorderBox7,
  BorderBox11
} from '@kjgl77/datav-vue3'

import ConnectionGraph from '../components/ConnectionGraph.vue'
import DeviceStatus from '../components/dialog/DeviceStatus.vue'

useWeatherData()

const iotTitle = import.meta.env.VITE_APP_IOT_TITLE

// 图表引用
const radarChartRef = ref<HTMLElement | null>(null)
const pieChartRef = ref<HTMLElement | null>(null)

// 雷达图实例
let radarChart: Radar | null = null
// 饼图实例
let pieChart: Pie | null = null

// 数字翻牌器配置
const digitalFlopConfig = (number: number) => {
  return {
    number: [number],
    content: '{nt}',
    style: {
      fontSize: '3vh',
      fill: '#00a2ff'
    }
  }
}

// 获取告警等级名称
const getLevelName = (level: number) => {
  switch (level) {
    case 1:
      return '低'
    case 2:
      return '中'
    case 3:
      return '高'
    default:
      return '未知'
  }
}

// 生成连接点和连线
const generateConnectionPoints = () => {
  const container = document.querySelector('.connection-points')
  if (!container) return

  // 清空现有内容
  container.innerHTML = ''

  // 创建连接点
  const points = [
    { x: '20%', y: '30%' },
    { x: '70%', y: '20%' },
    { x: '80%', y: '60%' },
    { x: '30%', y: '70%' }
  ]

  // 中心点
  const centerX = 150
  const centerY = 150

  points.forEach((point, index) => {
    // 创建连接点
    const pointElement = document.createElement('div')
    pointElement.className = 'connection-point'
    pointElement.style.left = point.x
    pointElement.style.top = point.y
    container.appendChild(pointElement)

    // 创建连线
    const lineElement = document.createElement('div')
    lineElement.className = 'connection-line'

    // 计算连线位置和角度
    const pointRect = pointElement.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()

    const pointX = (parseFloat(point.x) / 100) * containerRect.width
    const pointY = (parseFloat(point.y) / 100) * containerRect.height

    // 计算距离和角度
    const dx = centerX - pointX
    const dy = centerY - pointY
    const distance = Math.sqrt(dx * dx + dy * dy)
    const angle = Math.atan2(dy, dx) * (180 / Math.PI)

    // 设置连线样式
    lineElement.style.width = `${distance}px`
    lineElement.style.left = `${pointX}px`
    lineElement.style.top = `${pointY}px`
    lineElement.style.transform = `rotate(${angle}deg)`

    container.appendChild(lineElement)
  })
}

// 初始化雷达图
const initRadarChart = () => {
  if (!radarChartRef.value) return

  // 转换数据格式
  const data = alertStatisticsData.value.map((item) => ({
    item: item.type,
    value: item.value,
    color: item.color
  }))

  radarChart = new Radar(radarChartRef.value, {
    data,
    xField: 'item',
    yField: 'value',
    seriesField: 'item',
    meta: {
      value: {
        min: 0,
        max: 10
      }
    },
    xAxis: {
      line: null,
      tickLine: null,
      grid: {
        line: {
          style: {
            lineDash: null
          }
        }
      }
    },
    yAxis: {
      label: false,
      grid: {
        line: {
          type: 'line',
          style: {
            lineDash: null
          }
        }
      }
    },
    point: {
      size: 2
    },
    area: {
      style: {
        fillOpacity: 0.3
      }
    },
    legend: false,
    theme: 'dark',
    color: alertStatisticsData.value.map((item) => item.color)
  })

  radarChart.render()
}

// 初始化饼图
const initPieChart = () => {
  if (!pieChartRef.value) return

  // 检查是否有数据
  const hasData =
    alertStatisticsData.value.length > 0 && alertStatisticsData.value.some((item) => item.value > 0)

  // 如果没有数据，显示暂无数据提示
  if (!hasData) {
    const noDataContainer = document.createElement('div')
    noDataContainer.style.width = '100%'
    noDataContainer.style.height = '100%'
    noDataContainer.style.display = 'flex'
    noDataContainer.style.flexDirection = 'column'
    noDataContainer.style.justifyContent = 'center'
    noDataContainer.style.alignItems = 'center'
    noDataContainer.style.background = 'rgba(2, 9, 41, 0.7)'
    noDataContainer.style.borderRadius = '0.4vh'

    // 创建图标元素
    const iconDiv = document.createElement('div')
    iconDiv.innerHTML =
      '<svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 4L29.2533 7.83204L35.7557 7.81966L37.7533 14.0077L43.0211 17.8197L41 24L43.0211 30.1803L37.7533 33.9923L35.7557 40.1803L29.2533 40.168L24 44L18.7467 40.168L12.2443 40.1803L10.2467 33.9923L4.97887 30.1803L7 24L4.97887 17.8197L10.2467 14.0077L12.2443 7.81966L18.7467 7.83204L24 4Z" fill="none" stroke="#00a2ff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 24L22 29L32 19" stroke="#00a2ff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    iconDiv.style.marginBottom = '1vh'
    iconDiv.style.opacity = '0.7'

    // 创建文本元素
    const textDiv = document.createElement('div')
    textDiv.textContent = '暂无数据'
    textDiv.style.color = '#00a2ff'
    textDiv.style.fontSize = '1.6vh'
    textDiv.style.fontWeight = '500'
    textDiv.style.textShadow = '0 0 0.5vh rgba(0, 162, 255, 0.5)'

    // 清空容器并添加提示
    pieChartRef.value.innerHTML = ''
    noDataContainer.appendChild(iconDiv)
    noDataContainer.appendChild(textDiv)
    pieChartRef.value.appendChild(noDataContainer)
    return
  }

  // 转换数据格式
  const data = alertStatisticsData.value.map((item) => ({
    type: item.type,
    value: item.value > 0 ? item.value : 1, // 确保有值显示
    color: item.color
  }))

  pieChart = new Pie(pieChartRef.value, {
    data,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.5,
    interactions: [{ type: 'element-single-selected' }, { type: 'element-active' }], // 鼠标悬停
    label: {
      type: 'outer',
      content: '{name}\n{percentage}'
    },
    statistic: {
      title: {
        style: {
          color: '#ffffff',
          fontSize: '14px'
        },
        formatter: () => '告警类型'
      },
      content: {
        style: {
          color: '#ffffff',
          fontSize: '16px'
        },
        formatter: () => '分布'
      }
    },
    state: {
      active: {
        style: {
          lineWidth: 2,
          stroke: '#fff'
        }
      }
    },
    autoFit: true,
    legend: {
      position: 'bottom',
      itemName: {
        style: {
          fill: '#ffffff'
        }
      }
    }
    // theme: 'dark',
    // color: alertStatisticsData.value.map(item => item.color)
  })

  pieChart.render()
}

// "实时告警" 时间切换
function onLiveAlertClick(event: MouseEvent) {
  const target = event.target as HTMLElement
  // 查找最近的带有data-type属性的父元素
  const statItem = target.closest('[data-type]') as HTMLElement

  if (!statItem) return

  const type = Number(statItem.getAttribute('data-type'))
  if (!type || isNaN(type)) return

  liveAlertPayload.value.timeType = type
  fetchLiveAlertList()
}

// 组件挂载后初始化
onMounted(() => {
  // 初始化图表
  initRadarChart()
  generateConnectionPoints()

  // 监听窗口大小变化，重新生成连接点和连线
  window.addEventListener('resize', generateConnectionPoints)

  // 获取数据
  fetchLiveAlert()
  fetchLiveAlertList()
  fetchAlertRank()
  fetchAreaDevice()
  fetchDeviceStatus()
  fetchAlertStatistics().then(() => {
    initPieChart()
  })

  // 设置定时器，定期更新数据
  // const timer = setInterval(() => {
  //     fetchLiveAlert()
  //     fetchLiveAlertList()
  // }, 60000)
})

// 组件卸载前清理
onUnmounted(() => {
  // 销毁图表实例
  radarChart?.destroy()
  pieChart?.destroy()

  // 移除事件监听
  window.removeEventListener('resize', generateConnectionPoints)
})
</script>

<style lang="scss" scoped src="../chart.scss"></style>
<style lang="scss" scoped>
.iot-container {
  width: 100%;
  height: 100%;
  background-image: url('/images/iot/bg.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  overflow: hidden;

  .iot-dashboard {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 25vw 1fr 25vw;
    grid-template-rows: 6vh 1fr;
    gap: 1vh;
    padding: 1.8vh;
    padding-top: 4vh;
    box-sizing: border-box;
    overflow: hidden;

    .header {
      grid-column: 1 / 4;
      grid-row: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5vh;
      position: relative;

      .title {
        font-size: 2.4vh;
        font-weight: bold;
        color: #fff;
        text-align: center;
        flex: 1;
        text-shadow: 0 0 1vh rgba(0, 162, 255, 0.8);
        position: relative;
        z-index: 2;
      }

      .weather {
        display: flex;
        align-items: center;
        z-index: 2;

        .weather-icon {
          font-size: 2.4vh;
          margin-right: 1vh;
          color: #ffcc00;
        }

        .weather-info {
          font-size: 1.4vh;
          text-shadow: 0 0 0.5vh rgba(0, 162, 255, 0.8);
        }
      }

      .datetime {
        font-size: 1.4vh;
        z-index: 2;
        text-shadow: 0 0 0.5vh rgba(0, 162, 255, 0.8);
      }

      .decoration-container {
        margin-left: 12vw;
        padding-top: 2.5vh;
      }
    }

    .panel-box {
      background: rgba(2, 9, 41, 0.7);
      border: 1px solid transparent;
      border-image: linear-gradient(to right, #0078d4, #4abef9, #0078d4) 1;
      border-radius: 1vh;
      padding: 1vh;
      box-sizing: border-box;
      box-shadow:
        0 0 15px rgba(0, 162, 255, 0.4),
        inset 0 0 10px rgba(0, 162, 255, 0.3);
      position: relative;
      overflow: hidden;

      .panel-title {
        font-size: 1.6vh;
        font-weight: bold;
        color: #fff;
        margin-bottom: 1.5vh;
        margin-left: 1vh;
        text-shadow: 0 0 0.5vh rgba(0, 162, 255, 0.8);
        position: relative;
        border-bottom: 0.1vh solid rgba(0, 162, 255, 0.3);
        padding-bottom: 0.8vh;

        &::before {
          content: '';
          position: absolute;
          top: 50%;
          transform: translateY(-60%);
          left: -1vh;
          height: 2.4vh;
          width: 0.3vh;
          background-color: #4abef9;
          border-radius: 0.8vh 0 0 0.8vh;
        }
      }
    }

    .left-panel,
    .right-panel {
      display: flex;
      flex-direction: column;
      gap: 1vh;
      // max-height: calc(100% - 4vh);
      max-height: 100%;
      overflow-y: auto;
    }

    .center-panel {
      grid-column: 2;
      grid-row: 2;
      display: flex;
      flex-direction: column;
      gap: 1vh;
      // max-height: calc(100% - 4vh);
      max-height: 100%;
      overflow-y: auto;
    }

    .flex-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: 1vh;
    }

    .flex-panel {
      flex: 1;
    }

    .status-overview {
      display: flex;
      justify-content: space-between;
      gap: 1vh;

      .status-row {
        display: flex;

        justify-content: space-between;
        margin-bottom: 1vh;

        .status-card {
          flex: 1;
          display: flex;
          align-items: center;
          padding: 1vh;
          background: rgba(0, 31, 77, 0.4);
          border: 1px solid rgba(0, 114, 198, 0.5);
          border-radius: 0.4vh;
          margin: 0 0.5vh;

          .status-icon {
            width: 4vh;
            height: 4vh;
            margin-right: 1vh;
            display: flex;
            align-items: center;
            justify-content: center;

            svg {
              width: 100%;
              height: 100%;
            }
          }

          .status-info {
            .status-name {
              font-size: 1.2vh;
              color: #8baace;
            }

            .status-value {
              margin-top: 0.5vh;
              font-size: 1.6vh;
              color: #00a2ff;
              font-weight: bold;
              // text-shadow: 0 0 5px rgba(0, 162, 255, 0.8);
            }
          }
        }
      }
    }

    .area-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(2, 1fr);
      gap: 1vh;

      .area-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0.8vh;
        background: rgba(0, 31, 77, 0.4);
        border: 0.1vh solid rgba(0, 114, 198, 0.5);
        border-radius: 0.4vh;

        .area-icon {
          margin-bottom: 0.5vh;
          color: #00a2ff;

          // svg {
          //     width: 50px;
          //     height: 50px;
          // }
        }

        .area-name {
          font-size: 1.4vh;
          color: #a4b6ca;
          text-align: center;
        }

        .area-count {
          margin-top: 1vh;
          font-size: 1.4vh;
          color: #00a2ff;
          text-align: center;
        }
      }
    }

    .alert-list {
      .no-data {
        text-align: center;
        color: #a4b6ca;
        font-size: 1.4vh;
        padding: 2vh;
      }
      .alert-item {
        display: flex;
        align-items: center;
        margin-bottom: 1.2vh;
        padding: 0.8vh;
        background: rgba(0, 31, 77, 0.4);
        border: 0.1vh solid rgba(0, 114, 198, 0.5);
        border-radius: 0.4vh;

        .alert-level {
          width: 1.2vh;
          height: 1.2vh;
          border-radius: 50%;
          margin-right: 1vh;
          box-shadow: 0 0 0.5vh currentColor;

          &.level-1 {
            background-color: #ff4d4f;
            box-shadow: 0 0 0.5vh #ff4d4f;
          }

          &.level-2 {
            background-color: #faad14;
            box-shadow: 0 0 0.5vh #faad14;
          }

          &.level-3 {
            background-color: #52c41a;
            box-shadow: 0 0 0.5vh #52c41a;
          }
        }

        .alert-info {
          flex: 1;

          .alert-name {
            font-size: 1.4vh;
            color: #8baace;
          }
        }

        .alert-count,
        .alert-times {
          margin-left: 1vh;
          font-size: 1.4vh;
          color: #00a2ff;
        }
      }
    }

    .device-status-tabs {
      .tab-container {
        .tab-header {
          display: flex;
          // border-bottom: 1px solid rgba(0, 162, 255, 0.3);
          margin-bottom: 1.5vh;

          .tab-item {
            padding: 0.8vh 1.5vh;
            font-size: 1.6vh;
            font-weight: 600;
            cursor: pointer;
            color: #d5d9dd;
            position: relative;

            &.active {
              color: #00a2ff;

              &:after {
                content: '';
                position: absolute;
                bottom: -0.1vh;
                left: 0;
                width: 100%;
                height: 0.2vh;
                background-color: #00a2ff;
                box-shadow: 0 0 0.5vh #00a2ff;
              }
            }
          }
        }

        .tab-content {
          .device-status-overview {
            display: flex;
            justify-content: space-around;

            .device-status-item {
              display: flex;
              align-items: flex-end;

              .status-count {
                font-size: 2.8vh;
                font-weight: bold;
                text-shadow: 0 0 0.5vh rgba(0, 162, 255, 0.8);
              }

              // 为每个status-count设置不同的颜色
              &:nth-child(1) .status-count {
                color: #4e9bff; // 蓝色
              }

              &:nth-child(2) .status-count {
                color: #4aae20; // 绿色
              }

              &:nth-child(3) .status-count {
                color: #f4222d; // 黄色
              }

              &:nth-child(4) .status-count {
                color: #f59509; // 红色
              }

              &:nth-child(5) .status-count {
                color: #858585; // 紫色
              }

              .status-label {
                margin-left: 0.6vh;
                margin-bottom: 0.3vh;
                font-size: 1.4vh;
                color: #8baace;
              }
            }
          }
        }
      }
    }

    .globe-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      .globe-image {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }

      .connection-points {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;

        .point {
          position: absolute;
          width: 0.8vh;
          height: 0.8vh;
          background-color: #00a2ff;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .line {
          position: absolute;
          background-color: rgba(0, 162, 255, 0.4);
          transform-origin: 0 0;
        }
      }
    }

    .execution-alert {
      .alert-stats {
        display: flex;
        justify-content: space-between;
        margin-bottom: 2vh;
        padding: 0 5%;

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;

          .stat-value {
            font-size: 2.4vh;
            font-weight: bold;
            text-shadow: 0 0 0.5vh rgba(0, 162, 255, 0.8);
          }

          &:nth-child(1) {
            .stat-value {
              color: #4e9bff;
            }
          }

          &:nth-child(2) {
            .stat-value {
              color: #f88b16;
            }
          }

          &:nth-child(3) {
            .stat-value {
              color: #f4222d;
            }
          }

          .stat-label {
            margin-top: 0.8vh;
            font-size: 1.4vh;
            color: #8baace;
          }
          .stat-label.active {
            color: #00a2ff;
          }
        }
      }

      .alert-actions {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1vh;

        .action-button {
          padding: 0.8vh 0;
          text-align: center;
          background: rgba(0, 31, 77, 0.4);
          border: 0.1vh solid rgba(0, 114, 198, 0.5);
          border-radius: 0.4vh;
          color: #00a2ff;
          font-size: 1.4vh;
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            background: rgba(0, 114, 198, 0.2);
            box-shadow: 0 0 1vh rgba(0, 162, 255, 0.5);
          }
        }
      }

      .alert-panel-content {
        position: relative;
        height: 30vh;
        margin-top: 1vh;
      }

      .alert-list {
        display: flex;
        flex-direction: column;
        gap: 0.8vh;
        max-height: 30vh;
        overflow-y: auto;

        .alert-item {
          display: flex;
          align-items: center;
          padding: 0.8vh;
          background: rgba(0, 31, 77, 0.4);
          border: 0.1vh solid rgba(0, 114, 198, 0.5);
          border-radius: 0.4vh;

          .alert-cell {
            flex: 1;
            text-align: center;
            font-size: 1.4vh;
            color: #8baace;
          }

          .status-normal {
            color: #4e9bff;
          }

          .status-warning {
            color: #f4222d;
          }
        }
      }

      .empty-alert-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: 100%;
      }

      .empty-alert-content {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        padding: 2vh;
        background: rgba(0, 31, 77, 0.4);
        border: 0.1vh solid rgba(0, 114, 198, 0.5);
        border-radius: 0.4vh;

        .no-data-icon {
          margin-bottom: 1vh;
          opacity: 0.7;
        }

        .no-data-text {
          color: #00a2ff;
          font-size: 1.4vh;
          font-weight: 500;
          text-align: center;
          text-shadow: 0 0 0.5vh rgba(0, 162, 255, 0.5);
        }
      }
    }

    .device-deployment {
      height: 100%;
      max-height: 40vh;
      overflow-y: auto;

      .device-network {
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 100%;

        .device-item {
          display: flex;
          align-items: center;
          padding: 1vh;
          margin: 1vh 0;
          width: 100%;
          background: rgba(0, 31, 77, 0.4);
          border: 0.1vh solid rgba(0, 114, 198, 0.5);
          border-radius: 0.4vh;
          box-sizing: border-box;

          .device-icon {
            margin-right: 1vh;

            svg {
              width: 3vh;
              height: 3vh;
            }
          }

          .device-info {
            .device-name {
              font-size: 1.4vh;
              color: #00a2ff;
            }

            .device-id {
              font-size: 1.2vh;
              color: #8baace;
            }
          }
        }
      }
    }

    .radar-chart,
    .pie-chart {
      width: 100%;
      height: 25vh;
    }

    .radar-box {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;

      .device-status-section {
        width: 100%;
        display: flex;
        justify-content: space-around;
        align-items: center;
      }
    }
  }
}

.left-panel {
  .system-info {
    height: 13vh;
  }

  .access-info {
    height: 29vh;
  }
}

.center-panel {
  .device-link {
    height: 40vh; // 确保与左侧两个面板高度加上间隙相等
  }
}
</style>
