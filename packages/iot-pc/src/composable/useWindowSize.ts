// composables/useWindowSize.ts
import { ref, onMounted, onBeforeUnmount } from 'vue';

export function useWindowSize() {
  const width = ref(window.innerWidth);
  const height = ref(window.innerHeight);

  const calculateSize = () => {
    width.value = window.innerWidth;
    height.value = window.innerHeight;
  };

  const handleResize = () => {
    calculateSize();
  };

  onMounted(() => {
    calculateSize();
    window.addEventListener('resize', handleResize);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
  });

  return { width, height };
}