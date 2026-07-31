import type { DrawShape } from "@/components/drawing/types"

// 在各个界面渲染时会用到的绘制数据
export const useShape = reactive({
    shapes: [] as DrawShape[] | [],
    setShapes: (shapes: DrawShape[] | []) => {
        console.log('[绘制]设置配置', shapes)
        useShape.shapes = shapes
    }
})