<template>
  <div class="flex-box" style="width: 100%">
    <ElTabs
      tab-position="right"
      v-if="showTabs"
      class="flex-box items-strat"
      @tab-change="handleTabsChange"
    >
      <ElTabPane :label="item.title" v-for="item in tabsOptions" />
    </ElTabs>
    <div
      class="table-box flex-box p10"
      :style="{ width: showTabs ? '86%' : '100%', marginLeft: showTabs ? '100px' : '' }"
      v-loading="loading"
    >
      <div
        v-for="item in list"
        v-if="list.length > 0"
        class="mr20 pro-box"
        @click.stop="handleGoDetail(item, 'block')"
        :style="{ width: '31%' }"
      >
        <div class="table-top">
          <div class="icon" v-if="item.middlewareTypeId == 3">
            <svgIcon icon-class="control" size="18px"></svgIcon>
          </div>
          <div class="flex-box">
            <div
              class="header-tag"
              :style="{
                background:
                  item[fields.status] == 1104 || !item[fields.status]
                    ? 'var(--el-color-primary)'
                    : 'var(--el-color-info)',
                border:
                  item[fields.status] == 1104 || !item[fields.status]
                    ? '1px solid var(--el-color-primary)'
                    : '1px solid var(--el-color-info)'
              }"
            ></div>
            <div style="margin-left: auto" v-if="item[fields.status]">
              <el-tag type="primary" v-if="item[fields.status] == 1104">已发布</el-tag>
              <el-tag type="info" v-else>草稿</el-tag>
            </div>
          </div>
          <div class="c999 f13 ellipsis fw500" width="100%">
            <div class="pro-name">{{ item[fields.name] }}</div>
            <div v-if="item[fields.appId]" :title="item[fields.appId]">
              ID：{{ item[fields.appId] }}
            </div>
            <div v-if="item[fields.bz]" :title="item[fields.bz]" class="mt10">
              描述：{{ item[fields.bz] }}
            </div>
            <div v-if="item[fields.prmLabel]" :title="item[fields.prmLabel]" class="mt10">
              模板标签：{{ item[fields.prmLabel] }}
            </div>
            <div v-if="item[fields.prmContext]" :title="item[fields.prmContext]" class="mt10">
              模板内容：{{ item[fields.prmContext] }}
            </div>
            <div style="clear: both"></div>
          </div>
        </div>

        <!-- 下 -->
        <div class="flex-box" style="width: 100%">
          <div
            style="width: 100%; height: 30px"
            class="flex-box content-end items-center"
            v-if="props.listType != 'server'"
          >
            <template v-if="!isProject">
              <ElButton
                type="info"
                size="large"
                text
                title="查看"
                @click.stop="handleGoDetail(item, 'info')"
                ><template #icon>
                  <ElIcon><i-ep-View /></ElIcon> </template
              ></ElButton>
              <ElButton
                size="large"
                type="info"
                title="编辑"
                text
                @click.stop="handleGoDetail(item, 'edit')"
                ><template #icon>
                  <ElIcon><i-ep-Edit /></ElIcon> </template
              ></ElButton>
              <ElButton
                size="large"
                text
                type="danger"
                v-if="!isZt"
                title="删除"
                @click.stop="handleGoDetail(item, 'delete')"
                ><template #icon>
                  <ElIcon><i-ep-Delete /></ElIcon> </template
              ></ElButton>
            </template>
          </div>
          <div class="flex-box" style="justify-content: space-around; width: 100%" v-else>
            <el-button
              type="primary"
              text
              size="default"
              icon="i-ep-right"
              :disabled="!item[fields.jumpUrl]"
              @click.stop="handleGoDetail(item, 'enter')"
              >进入服务</el-button
            >
            <el-button
              type="primary"
              text
              size="default"
              icon="i-ep-edit"
              @click.stop="handleGoDetail(item, 'edit')"
              >编排</el-button
            >
            <el-button
              type="primary"
              text
              size="default"
              icon="i-ep-delete"
              @click.stop="handleGoDetail(item, 'delete')"
              >删除</el-button
            >
          </div>
        </div>
      </div>
      <Empty v-else style="width: 100%"></Empty>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  list: {
    type: Array as any,
    default: () => []
  },
  fields: {
    type: Object,
    default: {
      name: '',
      img: '',
      appId: '',
      bz: '',
      status: '',
      prmContext: '',
      prmLabel: '',
      jumpUrl: ''
    }
  },
  showTabs: {
    type: Boolean,
    default: false
  },
  showEdit: {
    type: Boolean,
    default: true
  },
  showVersion: {
    type: Boolean,
    default: false
  },
  tabsOptions: {
    type: Array as any,
    default: () => []
  },
  keys: {
    type: String,
    default: ''
  },
  showContent: {
    type: Boolean,
    default: true
  },
  loading: { type: Boolean },
  defaultImg: {
    type: String,
    default: ''
  },
  editAuth: {
    type: Object,
    default: {
      update: '',
      delete: '',
      add: ''
    }
  },
  background: {
    type: String,
    default: '#fff'
  },
  pageNum: {
    type: Number,
    default: 1
  },
  isProject: {
    type: Boolean,
    defalt: false
  },
  isZt: {
    type: Boolean,
    defalt: false
  },
  listType: {
    type: String,
    default: ''
  }
})

const fields = ref(props.fields)
const defaultImg = ref(props.defaultImg)
const tabsOptions = ref(props.tabsOptions)
const editAuth = ref(props.editAuth)
const keys = ref(props.keys)
const prefix = shallowRef(import.meta.env.VITE_APP_WEB_PREFIX)
const emit = defineEmits(['onClick', 'onTabsChange', 'onImport', 'onAdd', 'onVersion'])
watch(
  () => props.tabsOptions,
  (n) => {
    tabsOptions.value = n
  }
)
const handleGoDetail = (item: any, type: string) => {
  emit('onClick', item, type)
}
const handleImport = (item: any) => {
  emit('onImport', item)
}
// const handleVersion = (item: any) => {
//   emit("onVersion", item);
// };
const handleTabsChange = (index) => {
  console.log()

  emit('onTabsChange', {
    key: keys.value,
    value: tabsOptions.value[index].value
  })
}

const handleAdd = () => {
  emit('onAdd')
}
</script>

<style lang="scss" scoped>
@import 'src/styles/mixin';

.table-box {
  flex-wrap: wrap;

  .pro-box {
    border-radius: 8px;
    box-shadow: 0 0 7px rgba(38, 93, 165, 0.2);
    cursor: pointer;
    background-color: #fff;
    display: flex;
    padding: 15px 15px 0 15px;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    margin-right: 2%;
    margin-bottom: 20px;
    height: 170px;

    .imgs {
      border-radius: 15px;
      padding: 5px;
      width: 80px;
      height: 80px;
    }

    .table-top {
      width: 100%;
      height: 130px;
      position: relative;
      .icon {
        position: absolute;
        right: -12px;
        top: -12px;
      }
      .header-tag {
        width: 16%;
        height: 4px;
      }
      .pro-name {
        color: #333;
        font-size: 16px;
        font-weight: 700;
        padding-bottom: 20px;
        padding-top: 8px;
      }

      .ellipsis {
        @include ellipsis-multiline(5);
      }
    }

    .btn {
      width: 100%;
      border-top: 1px solid var(--el-border-color);
    }
    .active {
      &:hover {
        color: var(--el-color-primary) !important;
      }
    }
  }
}

:deep(.el-tabs__header) {
  min-height: 200px !important;
  margin-left: 0 !important;
}

:deep(.image-slot) {
  height: 100%;
  background-color: var(--el-body-bgcolor-base);
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.el-button + .el-button) {
  margin-left: 0 !important;
}

// button:hover {
//   color: var(--el-color-primary);
// }

.table-add {
  cursor: pointer;
  height: 170px;
  background-color: #fff;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  box-shadow: 0 0 7px rgba(54, 141, 255, 0.2);
  border: 1px dashed green;
  margin-right: 2%;
}
</style>
