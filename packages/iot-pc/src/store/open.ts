import { defineStore } from "pinia";
export default defineStore("open", () => {
  const contentScrollTop = ref(0);
  const activeIndex = ref(0);
  const SET_CONTENT_SCROLLTOP = (value: number) => {
    contentScrollTop.value = value;
  };
  const SET_CONTENT_ACTIVEINDEX = (value: number) => {
    activeIndex.value = value;
  };
  return {
    contentScrollTop,
    activeIndex,
    SET_CONTENT_SCROLLTOP,
    SET_CONTENT_ACTIVEINDEX,
  };
});
