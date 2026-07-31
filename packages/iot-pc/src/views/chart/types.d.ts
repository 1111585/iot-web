export interface DeviceStatusRes {
    type: number; //设备类型 （1.接入设备 2.运行正常 3.设备告警 4.设备离线 5.设备异常）
    deviceName: string; //设备名称
    deviceType: string; //设备类型
    deviceId: string; //设备ID
    point: string; //所在位置
    crTime: string; //创建时间
    state: string; //设备状态
}