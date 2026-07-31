export interface AccountRes {
  accountId: string //账号主键
  empId: string //人员id
  account: string //账户
  password: string //密码
  accountType: number //账号类型（1=账号，2=手机）
  createTime: string
  updateTime: string
  status: number //锁定状态1102
  lastPasswordChangeTime: string //最后一次修改密码的时间
  isInitialPassword: boolean //是否为初始密码 (是，否)
  accountCycle: number //账号类型（1长期账号 2临时账号）
}

export interface UserAccessRes {
  accessId: string //主键
  userId: string //用户ID
  startTime: string //限制开始时间
  endTime: string //限制结束时间
  ipAddresses: string //限制访问的IP地址
  status: number //状态（1:启用，2:禁用）
  createTime: string
  createUser: string
  createId: string
  updateTime: string
  updateUser: string
  updateId: string
}
