<template>
  <el-card class="card" shadow="hover" @click="$emit('click', data)">
    <div class="card-main">
      <div class="card-main-left">
        <div class="card-field">
          <span>被监测设备：</span>
          <span>{{ data.detectDevice }}</span>
          <span></span>
        </div>
        <div class="card-field">
          <span>布控类型：</span>
          <span>{{ DetectContent[data.detectType] }}</span>
          <span></span>
        </div>
        <div class="card-field">
          <span>所属点位：</span>
          <span>{{ data.areaPoint }}</span>
          <span></span>
        </div>
        <!-- 红外设备 -->
        <!-- <div class="card-field">
          <span>红外设备：</span>
          <span
            v-if="data.infrared"
            class="link device-name"
            @click.stop="onDeviceClick('infrared')"
          >
            {{ data.infrared }}
          </span>
          <span v-else>无</span>
          <span
            v-if="data.infrared"
            class="status-dot"
            :class="data.infraredStatus === 'online' ? 'online' : 'offline'"
          ></span>
        </div> -->
        <!-- 可见光设备 -->
        <!-- <div class="card-field">
          <span>可见光设备：</span>
          <span v-if="data.light" class="link device-name" @click.stop="onDeviceClick('light')">
            {{ data.light }}
          </span>
          <span v-else>无</span>
          <span
            v-if="data.light"
            class="status-dot"
            :class="data.lightStatus === 'online' ? 'online' : 'offline'"
          ></span>
        </div> -->
        <div class="card-field">
          <span>感知设备：</span>
          <span v-if="data.light" class="link device-name" @click.stop="onDeviceClick('light')">
            {{ data.light }}
          </span>
          <span
            v-else-if="data.infrared"
            class="link device-name"
            @click.stop="onDeviceClick('infrared')"
          >
            {{ data.infrared }}
          </span>
          <span v-else>无</span>
          <span class="status-dot" :class="data.isMonitoring == 1 ? 'online' : 'offline'"></span>
        </div>
      </div>
      <div class="card-main-right">
        <div v-if="data.isMonitoring == 1" class="card-tag">
          <el-dropdown>
            <el-icon size="22" @click.stop><Operation /></el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="action in actions"
                  :key="action.text"
                  @click="action.callback"
                >
                  {{ action.text }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <el-image v-if="showImage" :src="coverUrl" style="width: 120px; height: 120px">
          <template #error>
            <ImageError />
          </template>
        </el-image>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { Operation } from '@element-plus/icons-vue'
import { ImageError } from '@/components/renderer'
import { DetectContent } from '@/enums'
import { getImageList } from '@/util'
import type { DeviceData } from '@/views/monitorCenter/types'

interface Props {
  data: DeviceData
  showActions?: boolean
  showImage?: boolean
}
type StateChangeType = 'edit' | 'delete'
interface Emits {
  (e: 'click', data: DeviceData): void
  (e: 'clickDevice', type: ARC.SenseType): void
  (e: 'stateChanged', action: { type: StateChangeType; payload: ARC.AnyObj })
}

const props = withDefaults(defineProps<Props>(), {
  showImage: true
})
const emits = defineEmits<Emits>()

const coverUrl = computed(() => {
  const images = props.data?.image
  const image = getImageList(images)[0]
  if (!image) return ''
  return image.url
})

const actions: ARC.Action[] = [
  {
    text: '编辑',
    callback: handleEdit
  },
  {
    text: '删除',
    callback: handleDelete
  }
]

function onDeviceClick(type: ARC.SenseType) {
  emits('clickDevice', type)
}

function handleEdit() {
  emits('stateChanged', { type: 'edit', payload: props.data })
}

function handleDelete() {
  emits('stateChanged', { type: 'delete', payload: props.data })
}
</script>

<style lang="scss" scoped>
.card {
  position: relative;
  border-radius: 8px;
  margin-bottom: 15px;
  box-shadow:
    2px 2px 4px rgba(156, 156, 156, 0.1),
    -2px -2px 4px rgba(156, 156, 156, 0.1);
  cursor: pointer;
}

.card-main {
  display: flex;
  align-items: center;
  &-left {
    flex: 3;
  }
  &-right {
    flex: 1;
  }
}

.card-field {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
  color: rgb(90, 90, 90);
  & > span:nth-child(1) {
    display: inline-block;
    min-width: 5em;
  }
  & > span:nth-child(2) {
    // max-width: 170px;
    max-width: v-bind('props.showImage ? "120px" : "250px"');
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.card-tag {
  position: absolute;
  right: 14px;
  top: 14px;
  padding: 4px 8px;
  font-size: 12px;
  border: 1px solid #e7e7e7;
  border-radius: 8px;
  background-color: #fff;
  z-index: 99;

  &:hover {
    box-shadow: 0 0 1px 1px rgba(0, 0, 0, 0.1);
  }
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-left: 4px;
  border-radius: 50%;
}
.online {
  background-color: var(--el-color-success);
}
.offline {
  // background-color: var(--el-color-danger);
  background-color: var(--el-color-info);
}

.device-name {
  transition: all 0.3;
  &:hover {
    font-weight: bold;
    // color: var(--el-color-primary-light-3);
  }
}
</style>
