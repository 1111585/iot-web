import configs from "./config";

const colorMix = (color1: string, color2: string, weight) => {
  weight = Math.max(Math.min(Number(weight), 1), 0);
  let r1 = parseInt(color1.substring(1, 3), 16);
  let g1 = parseInt(color1.substring(3, 5), 16);
  let b1 = parseInt(color1.substring(5, 7), 16);
  let r2 = parseInt(color2.substring(1, 3), 16);
  let g2 = parseInt(color2.substring(3, 5), 16);
  let b2 = parseInt(color2.substring(5, 7), 16);
  let r: any = Math.round(r1 * (1 - weight) + r2 * weight);
  let g: any = Math.round(g1 * (1 - weight) + g2 * weight);
  let b: any = Math.round(b1 * (1 - weight) + b2 * weight);
  r = ("0" + (r || 0).toString(16)).slice(-2);
  g = ("0" + (g || 0).toString(16)).slice(-2);
  b = ("0" + (b || 0).toString(16)).slice(-2);
  return "#" + r + g + b;
};

const colorScale = (themeObj: any) => {
  const colorList = ["primary", "success", "warning", "danger", "info"];
  const prefix = "--el-color-";
  themeObj = Object.assign(themeObj, configs.common);
  colorList.forEach((colorItem) => {
    for (let i = 1; i < 10; i += 1) {
      if (i === 2) {
        //深色变量生成未完成 以基本色设置
        themeObj[`${prefix}${colorItem}-dark-${2}`] = colorMix(
          themeObj[`${prefix}black`],
          themeObj[`${prefix}${colorItem}`],
          1
        );
      } else {
        themeObj[`${prefix}${colorItem}-light-${10 - i}`] = colorMix(
          themeObj[`${prefix}white`],
          themeObj[`${prefix}${colorItem}`],
          i * 0.1
        );
      }
    }
  });
  return themeObj;
};

export { colorMix, colorScale };
