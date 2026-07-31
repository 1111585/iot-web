import { useRouter } from 'vue-router'
import { titles } from './consts'

type UsePage = keyof typeof titles

const detailPaths: Record<UsePage, string> = {
  aiBox: '/deviceManage/aiBox/detail',
  detectDevice: '/deviceManage/detectDevice/detail',
  senseDevice: '/deviceManage/senseDevice/detail',
  deployDevice: '/deviceManage/deployDevice/detail'
}

export const useNavigate = () => {
  const router = useRouter()

  function toDetail(page: UsePage, data: ARC.AnyObj) {
    router.push({
      path: detailPaths[page],
      query: {
        ...data
      }
    })
  }

  function toNewTab(page: UsePage, data: ARC.AnyObj) {
    console.log('准备跳转', data)
    const name = page === 'deployDevice' ? 'deviceDeployDetail' : 'deviceManageDetail'
    const url = router.resolve({
      name: name,
      params: {
        ...data,
        page: page,
        id: data.id
      }
    })

    const features = `width=1000,height=600,menubar=no,toolbar=no,location=no,status=no,scrollbars=yes,resizable=yes`
    window.open(url.href, '_blank', features)
  }

  return {
    toDetail,
    toNewTab
  }
}
