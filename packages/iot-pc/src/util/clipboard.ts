import useClipboard from "vue-clipboard3";
import { ElMessage } from "element-plus";
const { toClipboard } = useClipboard();

function clipboardSuccess() {
  ElMessage({
    message: "复制成功",
    type: "success",
    duration: 1500,
  });
}

function clipboardError() {
  ElMessage({
    message: "复制失败",
    type: "error",
  });
}

export default function handleClipboard(text: any) {
  toClipboard(text)
    .then(() => {
      clipboardSuccess();
    })
    .catch(() => {
      clipboardError();
    });
}
