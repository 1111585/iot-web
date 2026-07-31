<template>
  <div class="tag-group">
    <slot name="top"></slot>
    <div v-for="(item, key) in tagData" :key="key">
      <div class="flex">
        <!-- margin-top: 3px -->
        <div style="max-width: 100px" v-if="item.title">
          <span class="tag-group__title"
            ><el-tag v-html="item.title"></el-tag
          ></span>
        </div>
        <div style="line-height: 24px">
          <template v-for="(tag, k) in item.list" :key="k">
            <el-dropdown
              :hide-on-click="false"
              class="pt2"
              v-if="tag.children && tag.children.length > 0"
              :ref="'dropDownRef' + key"
            >
              <span
                class="pointer"
                :class="{
                  active: item.active === item.value + k,
                  mr15: k !== item.list.length - 1,
                  unactive: item.active !== item.value + k,
                }"
              >
                <span class="vm">{{ tag.title }}</span>
                <el-icon class="vm">
                  <i-ep-arrow-down />
                </el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu style="padding: 0">
                  <el-dropdown-item style="padding: 0" :disabled="true">
                    <div class="tag-panel-m">
                      <el-cascader-panel
                        v-model="modelList[k]"
                        :props="{
                          value: item.valuekey ? item.valuekey : 'title',
                          label: item.labelkey ? item.labelkey : 'value',
                          checkStrictly: true,
                          expandTrigger: 'hover',
                          emitPath: false,
                        }"
                        :options="tag.children"
                        @change="
                          hadnleCascaderChange(key, item.value, modelList[k], k)
                        "
                      />
                    </div>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <span
              v-else
              class="pointer pt5"
              :class="{
                active: item.active === tag.value,
                mr15: k !== item.list.length - 1,
              }"
              @click="handleClick(key, item.value, tag)"
            >
              {{ tag.title }}
            </span>
          </template>
        </div>
      </div>
    </div>
    <slot name="bottom"></slot>
  </div>
</template>

<script>
/**
  data: [
    {
      title: "类型：",
      value: "status",
      list: [{ title: "全部", value: "0" }]
    }
  ]
 */
export default {
  name: "TagPanel",
  props: {
    data: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      tagData: [],
      refList: [],
      modelList: [],
    };
  },
  watch: {
    data: {
      handler: "init",
      immediate: true,
    },
  },
  methods: {
    handleClick(key, clickKey, tag) {
      for (let i = 0; i < this.modelList.length; i++) {
        this.modelList[i] = [];
      }
      this.tagData[key].active = tag.value;
      this.$emit("tagClick", { key: clickKey, value: tag.value });
    },
    init() {
      let tagData = [];
      this.data.forEach((item) => {
        let old = this.tagData.find((it) => {
          return it.value == item.value;
        });
        let active = old
          ? old.list.find((item) => item.value === old.active)
          : "";
        tagData.push({
          ...item,
          ...{ active: active ? active.value : item.active ?? "" },
        });
      });
      this.tagData = tagData;
    },
    hadnleCascaderChange(key, clickKey, value, index) {
      if (value.length > 0) {
        //去除其他选项的选中效果
        for (let i = 1; i < this.tagData.length; i++) {
          // console.log("this.modelList[i] :>> ", i, this.modelList[i]);
          if (this.modelList[i] == value) {
            continue;
          } else {
            this.modelList[i] = "";
          }
        }
        // console.log("this.modelList :>> ", this.modelList);
        // console.log("value :>> ", key, clickKey, value);
        // this.handleClick(key, clickKey, { value: value[value.length - 1] });
        this.tagData[key].active = clickKey + index;
        // console.log("this.tagData[key].active :>> ", this.tagData[key].active);
        this.$emit("tagClick", {
          key: clickKey,
          value: value,
        });
        // console.log(
        //   "this.$refs :>> ",
        //   this.refList,
        //   key,
        //   this.$refs["dropDownRef" + key]
        // );
        // this.$refs[this.refList[key]].toggleDropDownVisible();
        // this.refList[key].handleClose();
        this.$refs["dropDownRef" + key][0].handleClose();
      }
      // this.$refs[this.refList[key]].handleClose();
    },
  },
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.flex {
  display: flex;
  // align-items: center;
  align-items: flex-start;
  color: #999999;
  padding-top: 5px;
}
.tag-group {
  padding: 0;
  font-size: 13px;
  :deep(.el-tag) {
    background-color: transparent;
    border: none;
    font-size: 13px;
    color: #666666;
  }
}
.tag-group__title {
  padding: 10px;
}
.active {
  // color: #333;
  color: #497cfd;
}
.el-divider--horizontal {
  margin: 5px 0;
}
.el-button--mini {
  line-height: 1;
}
.el-button + .el-button {
  margin-left: 0px;
}
.unactive {
  color: #999;
}
.pt2 {
  padding-top: 2px;
}
.vm {
  vertical-align: middle;
}
.tag-panel-m {
  // :deep(.el-dropdown-menu) {
  //   padding: 0px;
  // }
  // :deep(.el-dropdown-menu__item) {
  //   padding: 0px;
  // }
  // :deep(.el-dropdown-menu__item:hover) {
  //   background-color: #fff;
  // }
  // :deep(.el-dropdown-menu__item:active) {
  //   background-color: #fff;
  // }
  :deep(.el-cascader-panel .el-radio) {
    width: 132px;
    height: 34px;
    line-height: 34px;
    padding: 0 10px;
    z-index: 10;
    position: absolute;
  }
  :deep(.el-cascader-panel .el-radio__input) {
    visibility: hidden;
  }
  :deep(.el-cascader-panel .el-cascader-node__postfix) {
    top: 10px;
  }
}
</style>
