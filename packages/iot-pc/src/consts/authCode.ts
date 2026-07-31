/**
 * 后续权限码映射可往下面插入数据
 *
 * 目前使用的地方有：
 * 1. v-auth 自定义指令
 *
 * TODO: 方便引用，接口返回的所有权限值应该在此定义
 */

// 用户信息接口中的roleType
const roleType = {
  sysRole: '2201',
  userRole: '2202',
  /** 审计管理员 */
  auditRole: '2205'
}

export const authCode = {
  ...roleType
}
