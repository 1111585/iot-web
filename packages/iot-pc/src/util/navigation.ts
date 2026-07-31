import { useRoute, useRouter } from 'vue-router'

const paths = {
  eventDetail: '/detail/event'
}

export const useNavigate = () => {
  const route = useRoute()
  const router = useRouter()

  function toNewTab(name: keyof typeof paths, data: ARC.AnyObj) {
    const url = router.resolve({
      path: paths[name],
      query: {
        id: data.id
      }
    })

    const features = `width=1000,height=600,menubar=no,toolbar=no,location=no,status=no,scrollbars=yes,resizable=yes`
    window.open(url.href, '_blank', features)
  }

  return {
    toNewTab,
    query: route.query
  }
}
