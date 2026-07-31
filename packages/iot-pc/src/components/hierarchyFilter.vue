<!-- 支持层级的筛选 -->
<template>
  <div class="hierarchyFilter f12">
    <TransitionGroup name="list" tag="div">
      <div v-for="(item, index) in computedList" :key="item.key">
        <div
          class="flex-box"
          :class="{
            'border-top-dashed': index > 0,
          }"
        >
          <div class="c333 mr9 mt11">{{ item.title }}</div>
          <div class="flex-1 flex-box wrap items-center">
            <div
              v-for="it in item.list.slice(
                0,
                item.expansion ? item.list.length : maxNum
              )"
            >
              <div
                @click="handleClick(item, it)"
                style="
                  border: 1px solid var(--el-color-white);
                  border-radius: 26px;
                "
                class="pr8 pl8 pt2 pb2 m8 handle type-box"
                :class="item.selected === it.value ? 'active' : 'c666'"
                v-if="!it.children"
              >
                {{ it.title }}
              </div>
              <!-- 懒加载下拉 -->
              <el-popover trigger="click" v-else :width="600">
                <template #reference>
                  <div
                    class="flex-box items-center pr8 pl8 pt2 pb2 m8 handle"
                    :class="
                      isSelected(item.selected, it) ||
                      item.selected === it.value
                        ? 'primary'
                        : 'c666'
                    "
                    @click="handleClick(item, it)"
                  >
                    {{ it.title }}
                    <el-icon class="el-icon--right">
                      <i-ep-arrow-down />
                    </el-icon>
                  </div>
                </template>
                <template #default>
                  <div class="flex-1 flex-box wrap">
                    <div
                      v-for="child in it.children"
                      class="flex-box items-center"
                    >
                      <div
                        class="pr10 pr10 m5 handle"
                        :class="
                          item.selected === child.value ? 'primary' : 'c666'
                        "
                        @click="handleClick(item, child)"
                      >
                        <div>{{ child.title }}</div>
                      </div>
                    </div>
                  </div>
                </template>
              </el-popover>
            </div>
            <!-- 单行列表收缩 -->
            <ElIcon
              color="#606266"
              :title="item.expansion ? '收起更多' : '展开更多'"
              class="handle hov hov-bg ml10"
              v-if="item.list.length > 5 && item.list.length != 6"
            >
              <i-ep-DArrowLeft
                @click="computedList[index].expansion = false"
                v-if="item.expansion" /><i-ep-DArrowRight
                @click="computedList[index].expansion = true"
                v-else
            /></ElIcon>
          </div>
        </div>
      </div>
    </TransitionGroup>
    <div v-if="list.length > limit" class="more-container hairline--top">
      <div class="c333 handle" @click="expand = !expand">
        <template v-if="expand">
          <el-icon class="mr4"><i-ep-ArrowUp /></el-icon>收起更多
        </template>
        <template v-else>
          <el-icon class="mr4"><i-ep-ArrowDown /></el-icon>展开更多
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { take } from "lodash-es";

const props = withDefaults(
  defineProps<{
    list: any[];
    limit?: number;
    maxNum?: number; //每行最大显示数量
  }>(),
  {
    limit: 2,
    maxNum: 6,
  }
);
const emit = defineEmits(["onSelected"]);
const computedList = computed(() => {
  return expand.value ? props.list : take(props.list, props.limit);
});
const expand = ref(false);
const handleClick = (item, it) => {
  item.selected = it.value;
  emit("onSelected", {
    key: it.key ?? item.key,
    value: it.value,
    completed: it,
  });
};
const isSelected = (selected, it) => {
  let bool = false;
  if (it && it.children.length > 0) {
    it.children.forEach((v) => {
      if (v.value === selected) {
        bool = true;
      }
    });
  }
  return bool;
};
</script>

<style lang="scss" scoped>
.hierarchyFilter {
  line-height: 20px;
  .border-top-dashed {
    border-top: 1px dashed #dcdfe6;
  }
  .more-container {
    width: 100%;
    & > div {
      margin: 0 auto;
      width: 106px;
      height: 28px;
      line-height: 28px;
      background: #ffffff;
      box-shadow: 0px 4px 5px 0px rgba(0, 0, 0, 0.05);
      border-radius: 0px 0px 4px 4px;
      border: 1px solid #ebeef5;
      text-align: center;
    }
  }
  .type-box:hover {
    color: var(--el-color-primary);
  }
  .active {
    border-color: var(--el-color-primary-light-7) !important;
    background-color: var(--el-color-primary-light-9);
    border-radius: 26px;
    color: var(--el-color-primary);
  }
}
.list-move, /* 对移动中的元素应用的过渡 */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}


/* 确保将离开的元素从布局流中删除
  以便能够正确地计算移动的动画。 */
.list-leave-active {
  position: absolute;
}
</style>
