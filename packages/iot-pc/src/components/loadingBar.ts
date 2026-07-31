import {
    createBlock,
    createVNode,
    defineComponent,
    openBlock,
    ref,
    render,
} from "vue";
  interface ILoadingbar {
    id?: string;
  }
  const script = defineComponent({
    name: "loadingBar",
    props: {
      id: { type: String, default: "" },
    },
    render(_ctx, _cache) {
      return (
        openBlock(),
        createBlock(
          "div",
          {
            key: 0,
            id: _ctx.id,
            class: ["loading-bar", _ctx.visible ? "is-active" : ""],
          },
          null,
          2
        )
      );
    },
    setup(_) {
      const visible = ref(false);
      const start = () => {
        visible.value = true;
      };
      const done = () => {
        visible.value = false;
      };
      return {
        visible,
        start,
        done,
      };
    },
  });
  const LoadingBar = (opts: ILoadingbar = {}) => {
    const id = "loading-bar";
    let options = opts;
    options.id = id;
    const container = document.createElement("div");
    const vm = createVNode(script, options as any);
    vm.props!.onDestroy = () => {
      render(null, container);
    };
    render(vm, container);
    document.body.appendChild(container.firstElementChild!);
    return {
      start: () => ((vm.component!.proxy as any).visible = true),
      done: () =>
        setTimeout(() => ((vm.component!.proxy as any).visible = false), 1500),
    };
  };
  const _LoadingBar: any = LoadingBar();
  export default _LoadingBar;
  