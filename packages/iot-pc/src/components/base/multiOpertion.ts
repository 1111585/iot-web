import { isArray } from 'lodash-es'
import { defineComponent, h, type VNode } from 'vue'
import { ElDropdown, ElDropdownItem, ElDropdownMenu } from 'element-plus'
import svgIcon from '@/components/base/svgIcon.vue'
import 'element-plus/es/components/dropdown/style/css'
import 'element-plus/es/components/dropdown-item/style/css'
import 'element-plus/es/components/dropdown-menu/style/css'
const MultiOpertion = defineComponent({
  name: 'multiOpertion',
  props: {
    /**
     * 小于3将自动展开
     */
    limit: {
      type: Number,
      default: 3
    },
    icon: {
      type: String,
      default: 'menu2'
    }
  },
  setup(props, { slots }) {
    let childs: any = slots.default?.()
    // slots里使用v-for时
    if (childs && childs.length === 1 && isArray(childs[0].children)) {
      childs = childs[0].children
    }
    const vnode: VNode =
      childs && childs.length < props.limit
        ? h('span', {}, childs)
        : h(
            ElDropdown,
            { trigger: 'click', style: 'margin-top:3px;' },
            {
              dropdown: () =>
                h(ElDropdownMenu, null, {
                  default: () =>
                    childs?.map((item) => {
                      if (!['Symbol()', 'Symbol(Comment)'].includes(item.type.toString())) {
                        return h(ElDropdownItem, null, {
                          default: () => h(item, { style: { width: '100%' } })
                        })
                      }
                    })
                }),
              default: () =>
                h(
                  'span',
                  {},
                  h(svgIcon, {
                    iconClass: props.icon,
                    className: 'handle'
                  })
                )
            }
          )

    return () => vnode
  }
})

export default MultiOpertion
