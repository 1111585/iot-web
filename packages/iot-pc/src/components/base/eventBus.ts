import mitt from "mitt";
const eventBus = mitt();
const install = (app) => (app.config.globalProperties.$eventBus = eventBus);

const useEventOn = (event: string, func: (object) => void) =>
  eventBus.on(event, func);
const useEventEmit = (event: string, obj: any) => eventBus.emit(event, obj);
const useEventOff = (event: string | Array<string>) =>
  typeof event === "string"
    ? eventBus.off(event)
    : event.forEach((e) => eventBus.off(e));

export { install as default, eventBus, useEventOn, useEventEmit, useEventOff };
