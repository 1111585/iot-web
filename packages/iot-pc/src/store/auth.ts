import { defineStore } from 'pinia'

export const PERM_KEY = '__perm__'

export const usePermStore = defineStore(
  'perm',
  () => {
    const perm = ref<string[] | null>(null)
    function setPerm(items: string[]) {
      perm.value = items
    }

    const path = ref('')
    function setPath(menu: any[]) {
      if (menu?.length === 0) return
      const first = menu[0]

      let _path = first?.url
      if (first?.children?.length > 0) {
        _path = _path + '/' + first?.children?.[0]?.url
      }
      path.value = _path
    }

    return { perm, setPerm, path, setPath }
  },
  {
    persist: { key: PERM_KEY }
  }
)
