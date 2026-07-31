<template>
  <div class="msg-tabs pl10 pr10">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane :name="val.name" v-for="val in tabsData">
        <template #label>
          <el-badge
            :value="Number(val.num)"
            class="handle"
            :hidden="val.num == 0"
            ><span>{{ val.label }}</span></el-badge
          ></template
        >
        <!-- <el-dropdown class="mt5 mb5" trigger="click">
          <div class="flex-box items-center handle">
            <span class="mr5">全部</span><ElIcon><i-ep-Arrow-down /></ElIcon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>全部</el-dropdown-item>
              <el-dropdown-item>未读</el-dropdown-item>
              <el-dropdown-item>已读</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown> -->
        <el-scrollbar height="300px">
          <div
            v-loading="msgData.listLoading"
            v-if="!msgData.listLoading && msgData.list.length > 0"
          >
            <div
              class="msg-box handle"
              @click="handleCheck(item, val.path)"
              v-for="item in msgData.list"
            >
              <div :class="[item.isRead == 1 ? 'c666' : 'c333', 'f14']">
                {{
                  item.noticeTitle.includes("，退回理由:null")
                    ? item.noticeTitle.replace("，退回理由:null", "")
                    : item.noticeTitle
                }}
              </div>
              <div :class="[item.isRead == 1 ? 'c999' : 'c666', 'f12', 'mt3']">
                {{ item.createTime }}
              </div>
            </div>
          </div>
          <div
            class="flex-box content-center items-center pt50"
            style="flex-direction: column"
            v-else-if="!msgData.listLoading && msgData.list.length == 0"
          >
            <ElIcon size="50px" color="#eee"><i-ep-Bell /></ElIcon>
            <div
              class="f14 mt10"
              style="color: var(--el-text-color-placeholder)"
            >
              暂无通知
            </div>
          </div>
        </el-scrollbar>
      </el-tab-pane>
    </el-tabs>
    <div class="flex-box content-end handle pt5" @click="handleAllMsg">
      <ElTooltip
        class="box-item"
        effect="light"
        content="查看全部消息"
        placement="bottom"
      >
        <ElIcon><i-ep-More /></ElIcon
      ></ElTooltip>
    </div>
    <span class="link f12" @click="handleIsRead(1, '', '')">全部已读</span>
  </div>
</template>
<script lang="ts" setup>
import { Message } from "@/views/open/types/quiz";
import { useGet, usePost } from "@/composable/requestSup";
import { msgApi } from "@/apis/opens/message";
import router from "@/router";
import { msgStore } from "@/store";
interface ListQuery {
  pageNum: number;
  pageSize: number;
  isRead: string | number;
  operateType: string | number;
  title: string;
}
interface MessageType {
  listQuery: ListQuery;
  list: Array<Message>;
  listLoading: boolean;
}
const emit = defineEmits(["onHide"]);
const msgData = reactive<MessageType>({
  listQuery: {
    pageNum: 1,
    pageSize: 100,
    isRead: "0",
    operateType: MsgType.order,
    title: "",
  },
  list: [],
  listLoading: false,
});
const msgCounts = computed(() => msgStore().msgReadCount);
const activeName = ref("order");
const tabsData = ref([
  {
    name: "order",
    label: "订单",
    path: "/open/orderDetail",
    type: MsgType.order,
    num: msgCounts.value.orderUnRead,
  },
  {
    name: "quiz",
    label: "提问",
    path: "/open/quizDetail",
    type: MsgType.quiz,
    num: msgCounts.value.questionUnRead,
  },
  {
    name: "res",
    label: "资源",
    path: "/open/resourceDetail",
    type: MsgType.res,
    num: msgCounts.value.resourcesUnRead,
  },
]);
const fetchMsgList = () => {
  msgData.listLoading = true;
  useGet(msgApi.getGatherList, msgData.listQuery)
    .then((res) => {
      if (res.data) {
        msgData.list = res.data.list;
      }
    })
    .finally(() => (msgData.listLoading = false));
};
onMounted(() => fetchMsgList());
const handleClick = (tab, _event: Event) => {
  msgData.listQuery.operateType = MsgType[tab.props.name];
  fetchMsgList();
};
//全部已读
const handleIsRead = (
  all: number,
  objId: string,
  noticeId: string | number
) => {
  usePost(msgApi.isRead, { all, objId, noticeId }).then(() => {
    if (all == 1) {
      fetchMsgList();
    }
    msgStore().getMsgReadCount();
  });
};
//查看消息内容
const handleCheck = (row: Message, path: string) => {
  handleIsRead(0, row.objId, row.noticeId); //标记为已读
  router.push({
    path: path, //跳转相应详情页
    query: {
      id: row.objId,
    },
  });
  emit("onHide");
};
//跳转站内消息
const handleAllMsg = () => {
  router.push("/open/message");
  emit("onHide");
};
</script>
<style lang="scss" scoped>
.msg-tabs {
  position: reactive;
  .link {
    position: absolute;
    top: 22px;
    right: 20px;
  }
  .msg-box {
    padding: 8px 5px;
    border-radius: 3px;
    &:hover {
      background: #f4f4f5;
    }
  }
  :deep(.el-badge__content) {
    right: 0px;
    top: 0px;
    padding: 0 5px;
  }
}
</style>
