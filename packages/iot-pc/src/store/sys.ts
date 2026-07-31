import { useWindowSize } from "@vueuse/core";
import { defineStore } from "pinia";
export default defineStore("sys", () => {
  const sidebarOpened = ref(true);
  const curMenuTitle = ref("");
  const setCurMenuTitle = (name: string) => {
    curMenuTitle.value = name;
  };
  const useSidebarOpened = () => {
    const { width } = useWindowSize();
    sidebarOpened.value = width.value > 1200;
    watch(width, () => {
      sidebarOpened.value = width.value > 1200;
    });
    return sidebarOpened;
  };
  return {
    sidebarOpened,
    useSidebarOpened,
    curMenuTitle,
    setCurMenuTitle,
  };
});
