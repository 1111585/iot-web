import { Plugin } from "vite";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";

/**
 * 打包后复制 assets 和 index.html 到桌面
 * 文件夹名称：package.json.name_verYYYYMMDD_releaseYYYYMMDD
 */

export interface CopyAfterBuildOptions {
  mode: string;
  cfg?: {
    package?: string;
    hideLog?: boolean;
  };
}

export default function ({ mode, cfg }: CopyAfterBuildOptions): Plugin {
  return {
    name: "vite-plugin-copy-after-build",
    enforce: "post",
    closeBundle() {
      if (mode === "dev") return;

      const logFn = (...msg: string[]) => {
        if (!cfg?.hideLog) {
          console.log(...msg, "\n");
        }
      };

      logFn("🎉 打包完成 mode:", mode);
      logFn("🚧 开始复制文件...");

      let pkg = cfg?.package;
      if (!pkg) {
        const packagePath = path.resolve(process.cwd(), "package.json");
        try {
          const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf-8"));
          pkg = packageJson.name;
        } catch (error) {
          console.error("❌ 读取 package.json 失败，不设置包名", error);
        }
      }

      const myDesktop = path.resolve(process.env.USERPROFILE!, "Desktop");
      const assets = path.resolve(process.cwd(), "../../dist/pc", "assets");
      const index = path.resolve(process.cwd(), "../../dist/pc", "index.html");

      let month = (new Date().getMonth() + 1).toString();
      let date = new Date().getDate().toString();
      month = month.length < 2 ? `0${month}` : month;
      date = date.length < 2 ? `0${date}` : date;

      const dateStr = `${new Date().getFullYear()}${month}${date}`;
      const saveHere = path.resolve(
        myDesktop,
        `${pkg}_ver${dateStr}_release${dateStr}`
      );
      try {
        fs.mkdirSync(saveHere, { recursive: true });
        fs.cpSync(index, path.join(saveHere, "index.html"));
        fs.cpSync(assets, path.join(saveHere, "assets"), { recursive: true });

        logFn(`🎉 复制成功: ${saveHere}`);
        logFn(
          `🗄️ 更新后可通过: ${process.env.VITE_APP_DEPLOY_ON || "某处"} 访问`
        );

        // 单独 try/catch：explorer.exe 打开文件夹经常返回非零退出码（非真失败），
        // 不能让它掩盖“复制成功”的结论
        if (process.platform === "win32") {
          try {
            execSync("explorer " + saveHere);
          } catch {
            logFn("⚠️ 未能自动打开资源管理器（不影响复制结果）");
          }
        }
      } catch (error) {
        console.error("❌ 复制失败:", error);
      }
    },
  };
}
