const whitelistSet = new Set<string>()

export interface SuperApiType {
  serviceName: string
  [key: string]: string
}
/**
 * 接口组装
 * @param urls  接口路径
 * @param serviceName  服务名
 * @param whitelist  白名单路径
 * @returns
 */
export function useServiceApi<T extends object>(
  urls: T,
  serviceName?: string,
  whitelist: string[] = []
) {
  return new Proxy<T>(urls, {
    get: function (target, property): string {
      if (property == 'serviceName') target[property]
      whitelist.forEach((v) =>
        whitelistSet.add(`${serviceName ?? Reflect.get(target, 'serviceName')}${v}`)
      )
      console.log(
        'dd==>',
        serviceName,
        `${serviceName ?? Reflect.get(target, 'serviceName')}${Reflect.get(target, property)}`
      )
      return `${serviceName ?? Reflect.get(target, 'serviceName')}${Reflect.get(target, property)}`
    }
  })
}

export const whitelist = () => Array.from(whitelistSet)
