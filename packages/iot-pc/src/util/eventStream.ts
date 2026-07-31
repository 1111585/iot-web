import { UrlUtil } from "@infoview/util";
import { EventSourcePolyfill } from "event-source-polyfill";
type  HookFunction = (data: string) => void;
export default class EventStream {
  static evtSource: null | EventSourcePolyfill = null;
  static stream(url: string, params: Record<string, any>, callback: HookFunction) {
    const paramStr =  UrlUtil.toUrlSearchParams(params);
    this.evtSource = new EventSourcePolyfill(
      import.meta.env.VITE_APP_BASEURL +
        url +
        "?" +
        paramStr.replace(/([^:]\/)\/+/g, "$1"),
      {
        headers: {
          Authorization: "",
        },
      }
    );
    this.evtSource.onmessage = function (event) {      
      callback && callback(event.data);
    };
    this.evtSource.onerror = () => {
      this.stop();
      callback && callback("");
    };
  }
  static stop() {
    this.evtSource?.close();
    this.evtSource = null;
  }
}
