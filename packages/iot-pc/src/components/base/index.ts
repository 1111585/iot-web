import { type App } from "vue";
import svgIcon from "./svgIcon.vue";
import tabPanel from "./tabPanel.vue";
import formDialog from "./formDialog.vue";
import empty from "./empty.vue";
import element from "./element";
const install = function (app: App<Element>) {
  app.component("svgIcon", svgIcon);
  app.component("tabPanel", tabPanel);
  app.component("formDialog", formDialog);
  app.component("empty", empty);
  element(app);
};
export default install;
