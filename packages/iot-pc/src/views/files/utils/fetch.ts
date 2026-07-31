import { request } from "@/util/request";
import { filesApi } from "@/apis/files";

import type { VideoRes } from "../types";

const onError = (error: any) => console.log('[资源中心]', error?.message)

export const useVideoCenter = () => {

    const isLoading = ref(false)
    
    const listQuery = ref({
        pageNum: 1,
        pageSize: 10,
        startTime: '',
        endTime: '',
        deviceType: '', // 1可见光 2红外
        sensingDeviceName: '', // 感知设备名称
        aiBoxName: '', // ai盒子名称
        startSize: '',
        endSize: '',
        startDuration: '', 
        endDuration: '',
    })

    const list = ref<VideoRes[]>([])
    const total = ref(0)

    async function fetchList() {
        try {
            isLoading.value = true
            const { data } = await request.get<any, ARC.ListRes<VideoRes>>(filesApi.video.getList, listQuery.value)
            list.value = data.list
            total.value = data.total
        } catch (error) {
            onError(error)
        } finally {
            isLoading.value = false
        }
    }

    async function fetchDetail(id: string) {
        try {
            const { data } = await request.get<any, VideoRes>(filesApi.video.getOne, { id })

            return { raw: data }
        } catch (error) {
            onError(error)
        } 
    }

    async function deleteVideo(id: string) {
        try {
            const { data } = await request.get<any>(filesApi.video.delete, { id })

            return { raw: data }
        } catch (error) {
            onError(error)
        } 
    }

    return {
        isLoading,
        list,
        total,
        listQuery,
        fetchList,
        fetchDetail,
        deleteVideo
    }
}