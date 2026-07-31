const userAccess = {
  list: '/userAccessControl/list',
  create: '/userAccessControl/create',
  getOne: '/userAccessControl/getOne',
  delete: '/userAccessControl/delete',
  update: '/userAccessControl/update'
}

export const sysApi = {
  getLogs: '/sys/accessLog/list',
  sendLogs: '/sys/accessLog/saveExceptionOptionLog',
  getError: '/sys/accessLog/getErrWindowLog',
  uploadFile: '/sys/resource/upload',
  userAcc: userAccess
}
