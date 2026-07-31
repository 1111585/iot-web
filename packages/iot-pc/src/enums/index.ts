/**
 * 响应的code状态码
 */
export enum RetEnum {
  SUCCESS = 100,
  FAIL = 101,
  UNJOINENT = 405, //未加入企业
  INVALID = 400 //无效身份
}

export enum RetType {
  SUCCESS = 100,
  FAIL = 101,
  UNJOINENT = 405, //未加入企业
  INVALID = 400, //无效身份
  PWDEASY = 102, //密码过于简单
  PWDERROR = 103, //密码错误次数过多
  CODEFAIL = 104, //验证码已失效
  PWDUNMODIFIED = 105 //密码长时间未修改
}

/**
 * 响应subCode状态码
 */
export enum SubCodeEnum {
  MISSING = 40001,
  INVALID = 40002, //无效身份
  VALUE_EMPTYE = 40003,
  PERM = 40006
}

/**
 * 设备类型 枚举
 */
export enum DeviceEnum {
  WEB = 1,
  ANDROID = 2,
  IOS = 3,
  LINUX = 4
}

export type FileType =
  | 'apk'
  | 'image'
  | 'txt'
  | 'excel'
  | 'word'
  | 'pdf'
  | 'ppt'
  | 'video'
  | 'radio'
  | 'swf'
  | 'other'

/**
 * 模板场景
 */
export enum PrmSceneEnum {
  '文生文' = 1,
  '文生图' = 2
}

/**
 * 变量识别符
 */
export enum PrmVariableSymbolEnum {
  '大括号{}' = 1,
  '双大括号{{}}' = 2,
  '中括号[]' = 3,
  '双中括号[[]]' = 4,
  '小括号()' = 5,
  '双小括号(())' = 6
}

/**
 * 模板框架
 */
export enum PrmFrameEnum {
  '无' = 1,
  'Basic Prompt Framework' = 2,
  'CRISPE Prompt Framework' = 3,
  'Few-shot Prompt' = 4
}

export enum EventStatus {
  '未处理' = 1,
  '已确认' = 2,
  '已处理' = 3,
  '已忽略' = 4
}

export enum DeviceAbility {
  '超温事件' = 1,
  '电弧闪络' = 2
}

/** 监测类型 */
export enum DetectContent {
  '电弧闪络' = 1,
  '超温布控' = 2
}

export enum SenseAblity {
  '可见光' = 1,
  '红外' = 2,
  '可见光&红外' = 3
}

export enum AccountStatus {
  '激活' = 1101,
  '锁定' = 1102,
  '休眠' = 1103, // 休眠状态（长期未登录）
  '注销' = 1104 // 注销状态（用户主动注销或管理员操作）
}

export enum AccountCycle {
  '长期账号' = 1,
  '临时账号' = 2
}

export enum LogType {
  '系统级事件' = 2101,
  '业务级事件' = 2102
}

export enum LogStatus {
  '成功' = 'SUCCESS',
  '失败' = 'FAIL'
}
