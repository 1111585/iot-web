<template>
  <div class="tab-box">
    <div v-for="(item, index) in list" :key="index" class="flex-box">
      <div
        :class="`
          ${item.type}
          ${canSelect && item[valueKey] === modelValue ? 'is-active' : ''}
          ${canSelect ? 'handle' : ''}
        `"
        class="box pl16 pt8"
        @click="handleClick(item)"
      >
        <div class="f12">{{ item[nameKey] }}</div>
        <div class="mt1 f23 num">
          <span class="count">{{ item[numKey] }}</span>
          <span v-if="item.unit" class="f12">{{ item.unit }}</span>
        </div>
        <!-- <div :class="item.type ?? 'info'" class="bar"></div> -->
      </div>
      <div v-if="item.divider" class="divider"></div>
    </div>
    <div v-if="$slots['box-table']" class="right">
      <slot name="box-table"></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { PropType } from 'vue'

const props = defineProps({
  list: {
    type: Array as PropType<any[]>,
    default: () => []
  },
  modelValue: {
    type: [Number, String]
  },
  nameKey: {
    type: String,
    default: 'name'
  },
  numKey: {
    type: String,
    default: 'num'
  },
  valueKey: {
    type: String,
    default: 'value'
  },
  badgeKey: {
    type: String,
    default: 'badge'
  },
  canSelect: {
    type: Boolean,
    default: true
  }
})
const emit = defineEmits(['update:modelValue', 'onSelect'])
const handleClick = function (item: any) {
  emit('update:modelValue', item[props.valueKey])
  emit('onSelect', item)
}
</script>

<style lang="scss" scoped>
.tab-box {
  width: 100%;
  display: flex;
  // justify-content: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  .box {
    width: 120px;
    height: 65px;
    color: #fff;
    // border: 1px solid transparent;
    border-radius: var(--el-border-radius-base);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    .num {
      line-height: 28px;
    }
    .count {
      font-weight: 600;
    }
    .bar {
      width: 58px;
      height: 4px;
      margin-top: 4px;
      &.primary {
        background-color: var(--el-color-primary);
      }
      &.success {
        background-color: var(--el-color-success);
      }
      &.warning {
        background-color: var(--el-color-warning);
      }
      &.danger {
        background-color: var(--el-color-danger);
      }
      &.info {
        background-color: var(--el-color-info);
      }
    }
    // &.is-active {
    //   border: 1px solid #dcdfe6;
    // }
  }
  .hover:hover {
    background: #f5f7fa;
  }
  .box {
    margin: 8px;
  }
  .primary {
    background-image: url('/images/lable/primary.png');
  }
  .success {
    color: #333;
    background-image: url('/images/lable/success.png');
  }
  .warning {
    color: #333;
    background-image: url('/images/lable/warning.png');
  }
  .danger {
    color: #333;
    background-image: url('/images/lable/danger.png');
  }
  .info {
    background-image: url('/images/lable/info.png');
    color: #333;
  }
  .primary.is-active {
    background-image: url('/images/lable/primary-active.png');
  }
  .success.is-active {
    color: #fff;
    background-image: url('/images/lable/success-active.png');
  }
  .warning.is-active {
    color: #fff;
    background-image: url('/images/lable/warning-active.png');
  }
  .danger.is-active {
    color: #fff;
    background-image: url('/images/lable/danger-active.png');
  }
  .info.is-active {
    background-image: url('/images/lable/info-active.png');
    color: #fff;
  }
}
.divider {
  width: 1px;
  height: 30px;
  background: #dcdfe6;
  margin: 0 8px;
}

.right {
  margin-left: auto;
}
</style>
