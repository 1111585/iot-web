import { defineStore } from 'pinia'

export const useConfigStore = defineStore(
  'config',
  () => {
    const elTourConfig = ref({
      sense: {
        show: true
      },
      sidebar: {
        show: true
      }
    })

    function setElTourConfig(key: string, value: any) {
      elTourConfig.value[key] = value
    }

    function clear() {
      elTourConfig.value = {
        sense: {
          show: true
        },
        sidebar: {
          show: true
        }
      }
    }

    return {
      elTourConfig,
      setElTourConfig,
      clear
    }
  },
  {
    persist: {
      storage: localStorage,
      pick: ['elTourConfig']
    }
  }
)
