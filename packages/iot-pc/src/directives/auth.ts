import { usePermStore } from '@/store/auth'
import type { DirectiveBinding } from 'vue'

/**
 * 页面权限指令，控制元素是否显示
 *
 * 权限码来源：
 * 1. 菜单权限码（code）
 * 2. 角色权限码（用户信息接口的roleType）
 * 3. （其他权限？）往permStore中插数据
 *
 * 权限码快速引用：
 * 1. 在 consts/authCode.ts 中定义
 * 2. 直接通过接口路径
 *
 * TODO:
 * 1. 通过接口路径时，下面的路基需要修改，比如 apiUrl.replace('/', ':')
 * 2. 保存在localStorage中的值是否应该加密
 */

export default {
  mounted(el: HTMLElement, binding: DirectiveBinding<string[]>) {
    const value = binding.value
    const permStore = usePermStore()
    const perms = permStore.perm

    const hasPermission = value.some((permission) => {
      return perms?.includes(permission)
    })
    if (!hasPermission) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  }
}
