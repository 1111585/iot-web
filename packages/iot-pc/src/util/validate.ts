/* 合法uri*/
export function validateURL(textval: string) {
  const urlregex =
    /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/
  return urlregex.test(textval)
}

/* 小写字母*/
export function validateLowerCase(str: string) {
  const reg = /^[a-z]+$/
  return reg.test(str)
}

/* 大写字母*/
export function validateUpperCase(str: string) {
  const reg = /^[A-Z]+$/
  return reg.test(str)
}

/* 大小写字母*/
export function validateAlphabets(str: string) {
  const reg = /^[A-Za-z]+$/
  return reg.test(str)
}

/**
 * 验证邮箱
 * @param str
 * @returns {boolean}
 */
export function validateEmail(str: string) {
  const reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/
  return reg.test(str)
}

// 校验保留两位小数金额
export function validaetMoney(str: string) {
  var reg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/
  return reg.test(str)
}

// 正整数或小数
export function validateNumber(str: string) {
  var reg = /^[0-9]+(\.?[0-9]+)?$/
  return reg.test(str)
}

// 手机号
export function validatePhone(str: string) {
  var reg = /^1(3[0-9]|4[01456879]|5[0-3,5-9]|6[2567]|7[0-8]|8[0-9]|9[0-3,5-9])\d{8}$/
  return reg.test(str)
}

// 身份证
export function validateIDcard(str: string) {
  var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  return reg.test(str)
}

//密码至少8位，须包含大写字母、小写字母、数字、特殊符号（_!@#$%^&*`~()-+=）至少3种组合。
export function validatePwd(str: string) {
  var reg =
    /^(?![a-zA-Z]+$)(?![A-Z\d]+$)(?![A-Z_!@#$%^&*`~()\-+=]+$)(?![a-z\d]+$)(?![a-z_!@#$%^&*`~()\-+=]+$)(?![\d_!@#$%^&*`~()\-+=]+$)[a-zA-Z\d_!@#$%^&*`~()\-+=]{8,}$/
  return reg.test(str)
}

// ipv4
export function validateIpv4(str: string) {
  const reg =
    /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  return reg.test(str)
}

// ipv4，带端口
export function validateIpv4WithPort(str: string) {
  const reg =
    /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(:\d{1,5})?$/
  return reg.test(str)
}
