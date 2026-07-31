export function useListWithForm() {
  const visible = ref(false);
  const isEdit = ref(false);
  const objId = ref("");
  /**
   * 操作数据更新
   * @param opsId  操作数据id
   * @returns
   */
  const useOpsUpdate = (opsId: string) => {
    visible.value = true;
    isEdit.value = true;
    objId.value = opsId;
  };
  /**
   * 操作数据添加
   */
  const useOpsAdd = (opsId: string = "") => {
    visible.value = true;
    isEdit.value = false;
    objId.value = opsId;
  };

  return {
    visible,
    isEdit,
    objId,
    useOpsUpdate,
    useOpsAdd,
  };
}

export function useDetailForm(title: string, isEdit: boolean, emit) {
  const combTitle = computed(() => (isEdit ? "修改" + title : "添加" + title));
  const refreshList = () => emit && emit("onRefresh");

  return {
    combTitle,
    refreshList,
  };
}
