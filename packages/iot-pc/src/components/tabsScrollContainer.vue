<template>
  <div class="blk" id="contentInfo">
    <div id="content_div">
      <div class="content-title flex-box" style="align-items: center">
        <div class="content-title_icon" v-if="props.showIcon"></div>
        <div class="content-title_txt">
          {{ props.title }}
        </div>
        <div style="margin-left: auto; margin-right: 14px">
          <slot name="right"></slot>
        </div>
      </div>
      <div class="content plr30">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  showIcon?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showIcon: false
})
</script>

<style lang="scss" scoped>
.blk {
  margin: 10px 10px 0px 10px;
  background: var(--el-bg-color);

  .title {
    border-bottom: 1px solid var(--el-border-color-base);
  }

  .content {
    padding: 20px;

    :deep(.el-alert--info.is-light) {
      background: var(--el-bg-color-primary);
      border: 1px solid var(--el-color-primary);
      color: var(--el-color-primary);
    }

    :deep(.el-step__title) {
      font-size: 14px;
      color: var(--el-text-color-primary);
      line-height: 18px;
    }
  }

  .content-title {
    display: flex;
    align-items: center;
    font-weight: bold;
    padding-top: 20px;
    padding-bottom: 20px;

    .content-title_icon {
      height: 20px;
      border: 1px solid var(--el-color-primary);
      width: 4px;
      background: var(--el-color-primary);
    }

    .content-title_txt {
      font-size: 16px;
      color: var(--el-text-color-primary);
      padding-left: 25px;
    }
  }

  .content.plr30 {
    padding-left: 30px;
    padding-right: 30px;
    padding-top: 0px;
  }
}

.footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 10px;
  padding: 10px 0 15px 0;
  padding-right: 20px;
  background: var(--el-bg-color);
  box-shadow: 0 -2px 12px 0 rgb(0 0 0 / 10%);
  position: absolute;
  bottom: 0;
  width: 100%;
  z-index: 99;
}
</style>
