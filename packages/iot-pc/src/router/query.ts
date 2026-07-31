import { AesUtil } from "@infoview/util";
import { isEmpty } from "lodash-es";

const encrypt = (obj) => {
  return AesUtil.encryptHex(JSON.stringify(obj));
};
const decrypt = (str) => {
  try {
    return JSON.parse(AesUtil.decryptHex(str));
  } catch (error) {
    // 兼容没加密的链接
    const res = {};
    str.split("&").forEach((param) => {
      const parts = param.replace(/\+/g, " ").split("=");
      const key = parts.shift();
      const val = parts.length > 0 ? parts.join("=") : null;
      if (res[key] === undefined) {
        res[key] = val;
      } else if (Array.isArray(res[key])) {
        res[key].push(val);
      } else {
        res[key] = [res[key], val];
      }
    });
    return res;
  }
};

/**
 * 序列化对象 并加密
 * @param {Object} obj
 */
export const stringifyQuery = (obj) => {
  return !isEmpty(obj) ? `reqdata=${encrypt(obj)}` : "";
};

/**
 * 解密  反序列化字符串参数
 * @param {String}} query
 */
export const parseQuery = (query) => {
  query = query.trim().replace(/^(\?|reqdata=|#|&)/, "");
  if (!query) {
    return query;
  }
  // 解密
  query = decrypt(query);
  if (import.meta.env.VITE_APP_ENV === "development") {
    console.log(`%cURL参数:`, "color:#497CFD;", {
      ...query,
    });
  }
  return query;
};
