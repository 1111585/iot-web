export interface IotCollRes {
  deviceposition: string
  devicename: string
  deviceid: string
  crtime: string
  state: string
  temp1: string
  temp2: string
  temp3: string
  temp4: string
  temp5: string
  devicetype: string
  collecttime: string
  opstate: string
}

export interface IotSevenDaysRes {
  deviceId: string
  maxTemp: string
  minTemp: string
  recordTime: string
}

export interface IotOneDayRes {
  crtime: string
  temp1: number
  temp2: number
  temp3: number
  temp4: number
  temp5: number
}
