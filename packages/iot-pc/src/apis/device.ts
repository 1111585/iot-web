const common = {
  /**
   * 获取设备类型列表, 和其他列表
   * - sensingDeviceList：设备类型列表
   * - pointManagementList
   */
  getDeviceTypeList: '/iot/monitoringEquipment/initMonitoringEquipmentList',
  /** 获取所有绑定位置 */
  getAllBindingLocation: '/iot/pointManagement/getPointManagementNameList',
  /** 进入预警详情时调用 */
  initEventDetail: '/iot/warningInformation/saveFirstInfo',
  dictType: '/dict/list',
  eventDict: '/iot/warningInformation/getWarningDict'
}

/** 检查是否联通 */
const connectionTest = {
  testSenseDevice: '/iot/sensingDevice/isConnection'
}

const media = {
  getVideoStream: '/iot/sensingDevice/getConfigInfo', // 获取视频流基础地址（有返回rtsp直播流）
  getFlvStream: '/iot/configInfo/getConfigInfoByNameOrId', // 获取flv直播流
  getVideoTemp: '/iot/sensingDevice/getSensingDeviceRealTimeTempById',
  getVideoAreaTemp: '/sensingDeviceRecord/getRecentByDeviceIdAndTime'
}
const tree = {
  getDeviceTree: '/iot/pointManagement/getPointManagemenTree'
}
/** 监控中心 */
const monitorCenter = {
  /** 添加监控区域 - 红外、可见光 */
  addMonitorInfrared: '/iot/monitoringInformation/deployAddMonitoringInfo',
  saveMonitorArea: '/iot/sensingDevice/sendRTSPAndDeviceInfo', // 保存监控区域
  /** 下拉选项 */
  getMonitorOprions: '/iot/deployAndControl/initDeployAndControlData',
  getMonitorOprionsV2: '/iot/deployAndControl/initDeployAndControlData2',
  getMonitorDeviceOption: '/iot/monitoringEquipment/getMonitoringEquipmentByBindingPositionId', // 从getMonitorOprions下拉选择点位，监测设备跟随点位变化
  editMonitorArea: '/iot/monitoringInformation/update',
  deleteMonitorArea: '/iot/monitoringInformation/delete',
  checkAreaName: '/iot/deployAndControl/getMonitoringInformationIsExists'
}

/** 系统管理 */
const systemManage = {
  addPark: '/iot/affiliatedPark/create',
  addBuilding: '/iot/ownershipBuilding/create',
  addRoom: '/iot/localCity/create',
  addDeviceConfig: '/iot/configInfo/create',
  deletePark: '/iot/affiliatedPark/delete',
  deleteBuilding: '/iot/ownershipBuilding/delete',
  deleteRoom: '/iot/localCity/delete',
  deleteDeviceConfig: '/iot/configInfo/delete',
  editPark: '/iot/affiliatedPark/update',
  editBuilding: '/iot/ownershipBuilding/update',
  editRoom: '/iot/localCity/update',
  editDeviceConfig: '/iot/configInfo/update',
  getParkDetail: '/iot/affiliatedPark/getOne',
  getBuildingDetail: '/iot/ownershipBuilding/getOne',
  getRoomDetail: '/iot/localCity/getOne',
  getParkList: '/iot/affiliatedPark/list',
  getBuildingList: '/iot/ownershipBuilding/list',
  getRoomList: '/iot/localCity/list',
  getDeviceConfigList: '/iot/configInfo/list',
  getSystemLogs: '/sys/accessLog/list',
  getDeviceConfigDetail: '/iot/configInfo/getOne'
}

/** 各种下载相关 */
const download = {
  event: '/iot/warningInformation/downLoadResouce'
}

const eventRules = {
  getDetail: '/iot/ruleConfiguration/getOne',
  update: '/iot/ruleConfiguration/update'
}

/** 各种状态切换 */
export const statusChange = {
  aiBox: '/iot/aiBox/setAiBoxEnable',
  detectDevice: '/iot/monitoringEquipment/setMonitoringEquipmentEnable',
  senseDevice: '/iot/sensingDevice/setSensingDeviceEnable',
  event: '/iot/disposeInfo/saveDisposeInfo', // 处理预警（POST）
  settleEvent: '/iot/disposeInfo/saveDisposeInfoBatch', // 设为已处置
  senseDeviceLight: '/iot/sensingDevice/lightingOperation' // 感知设备灯光控制
}

export const deviceApi = {
  ...tree,
  ...media,
  ...common,
  ...systemManage,
  ...monitorCenter,
  ...connectionTest,
  download: { ...download },
  status: { ...statusChange },
  eventRules: { ...eventRules },
  /** 添加设备 */
  addAiBox: '/iot/aiBox/saveAiBox',
  addDetectDevice: '/iot/monitoringEquipment/saveMonitoringEquipment',
  addDetectPoint: '/iot/pointManagement/savePointManagement',
  addSenseDevice: '/iot/sensingDevice/saveSensingDevice',
  /** 增加记录 */
  addMonitor: '/iot/deployAndControl/saveDeployAndControl', // 添加一条监控记录
  updateMonitor: '/iot/deployAndControl/update',
  /** 删除 */
  deleteAiBox: '/iot/aiBox/delete',
  deleteDetectDevice: '/iot/monitoringEquipment/delete',
  deleteSenseDevice: '/iot/sensingDevice/delete',
  deleteDetectPoint: '/iot/pointManagement/delete',
  deleteEvent: '/iot/warningInformation/deleteWarningInformation',
  deleteEvents: 'iot/warningInformation/deleteWarningByIds',
  deleteMonitor: '/iot/deployAndControl/delete',
  /** 修改设备信息 */
  editAiBox: '/iot/aiBox/update',
  editDetectDevice: '/iot/monitoringEquipment/update',
  editDetectPoint: '/iot/pointManagement/update',
  editSenseDevice: '/iot/sensingDevice/update',
  /** 获取列表 */
  getAiBoxDevices: '/iot/aiBox/getAiBoxByWhere',
  getDeployDevices: '/iot/deployAndControl/getDeployAndControlByWhere',
  getDetectDevices: '/iot/monitoringEquipment/getMonitoringEquipmentByWhere',
  getSenseDevices: '/iot/sensingDevice/getSensingDeviceByWhere',
  getEvents: '/iot/warningInformation/getWarningInCenterByWhere',
  getAiBoxAll: '/iot/aiBox/getAiBoxAll',
  getSenseDevicesByAiboxId: '/iot/deployAndControl/getSensingDeviceListByAiboxId',
  /** 获取列表统计 */
  getAiBoxCounts: '/iot/aiBox/getAiBoxCount',
  getDeployCounts: '/iot/deployAndControl/getDeployAndControlCount',
  getDetectPoints: '/iot/pointManagement/getPointManagementByWhere',
  getDetectCounts: '/iot/monitoringEquipment/getMonitoringEquipmentCount',
  getDetectPointCounts: '/iot/pointManagement/getPointManagementCount',
  getSenseCounts: '/iot/sensingDevice/getSensingDeviceCount',
  // getEventCounts: '/iot/warningInformation/getWarningInCenterCount'
  getEventCounts: '/iot/warningCenterCount/getCountByUserId',
  /** 获取详情 */
  getAiBoxDeviceDetail: '/iot/aiBox/getOne', // ai盒子
  getDetectDeviceDetail: '/iot/monitoringEquipment/getOne', // 检测设备
  getDeployDeviceDetail: '/iot/deployAndControl/getOne', // 布控设备
  getDetectPointDetail: '/iot/pointManagement/getOne', // 监测点
  getSenseDeviceDetail: '/iot/sensingDevice/getOne', // 感知设备
  getEventDetail: '/iot/warningInformation/getDetail', // 预警详情
  getDeviceDetail: '/iot/aiBox/getEquipmentDetailById', // 获取设备详情（上面的所有设备，根据参数type区分）
  /** 获取下拉菜单 */
  getDetectPointAddOptions: '/iot/pointManagement/initPointData', // 添加点位管理下拉
  getBindingLocation: '/iot/ownershipBuilding/list' // 绑定位置下拉
}
