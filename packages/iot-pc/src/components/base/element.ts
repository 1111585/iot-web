import "element-plus/theme-chalk/el-dialog.css";
import "element-plus/theme-chalk/el-loading.css";
import "element-plus/theme-chalk/el-message-box.css";
import "element-plus/theme-chalk/el-message.css";

import { type App, type Component } from "vue";


const components:App<Element>[] = [];
export default function (app:App<Element>) {
  components.forEach((component: Component) => {
    app.component(component.name ?? "", component);
    
  });
}
