/**
 * 各种统计数据的接口
 */

const iot = {
  // 告警数量统计
  getWarningCount: '/iotDevice/device/getWarningCount',
  // 告警列表
  getWarningDetaiListByTimeType: '/iotDevice/device/getWarningDetaiListByTimeType',
  // 告警排行
  getAlarmRanking: '/iotDevice/device/getAlarmRanking',
  // 接入信息
  getAccessInformation: '/iotDevice/device/getAccessInformation',
  // 接入设备数量统计
  getDeviceCountInfo: '/iotDevice/device/getDeviceCountInfo',
  // 饼图
  getAlarmCount: '/iotDevice/device/getAlarmCount',
  // 地球仪点击出来的弹窗列表
  getDeviceStatus: '/iotDevice/device/getDeviceDetailListByRunType'
}

const device = {
  // 感知设备
  sense: {
    tempSevenDays: '/sensingDeviceRecord/getRecent7DaysByDeviceId', // 7天数据（温度）
    deviceSevenDays: '/sensingDeviceRecord/getRecent7DaysByDeviceIdAndWarningInfo', // 7天数据（设备态势）
    tempCurveData: '/sensingDeviceRecord/getTemperatureCurveData', // 温度曲线数据
    exportTempCurveData: '/sensingDeviceRecord/expTemperatureCurveDataExcel'
  }
}

const event = {
  getChart: '/iot/warningInformation/getWarningCountShow',
  getChartBord: '/iot/warningInformation/getWarningCountBoard'
}

// 不知道分在哪儿
const common = {
  getIotDeviceCollectionInfo: '/iotDevice/device/getIotDeviceCollectionInfo',
  getIotSevenDays: '/iotDevice/device/getDeviceCountWeekDateById',
  getIotOneDay: '/iotDevice/device/getDeviceCountDayDateById',
  setIotDeviceAlarmThreshold: '/iotDevice/device/setIotDeviceAlarmThreshold',
  // CT 三相电流
  getCtDeviceList: '/ct/device/list',
  getCtDeviceRecords: '/ct/device/records',
  getAlarmDetail: '/ct/device/alarm-detail',
  updateCtConfig: '/ct/device/config'
}

export const chartApi = {
  iot,
  device,
  event,
  ...common
}
