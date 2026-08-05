# 电眸AI智能辅控平台 — 前端

文件位置：`packages/iot-pc`

## 资料

[接口文档](https://doc.apipost.net/docs/detail/39569347bc7c000?target_id=10df5c347d4007&locale=zh-cn)

[原型地址](https://uh4o9z.axshare.com/?id=4frjwp&p=%E9%A2%84%E8%AD%A6%E4%B8%AD%E5%BF%83&sc=3)

[原型地址-大屏](http://hongyuan.cloud/LOLER2/?id=vpjwr2&p=page_1)

## 环境要求

- Node.js 18.x
- pnpm 9.x（启用方式：`corepack enable`）

## 本地开发

### 1. 启动后端（Docker）

```powershell
cd D:\v0\iot\docker
docker-compose up -d
```

启动后确认服务正常：

```powershell
docker ps
# 应看到 iot-server（8899）、mysql（3306）、redis（6379）、minio（9000）等
```

### 2. 安装前端依赖

```powershell
cd D:\ARC\web\iot-web
pnpm install
```

> 注意：`@infoview/util` 是内部工具包，通过本地路径 `local-packages/infoview-util/` 挂载，无需私有 npm 源。

### 3. 启动开发服务器

```powershell
pnpm dev:pc
# 浏览器打开 http://localhost:8008
```

### 4. 首次启动注意事项

- 默认首页 `/dashboard/devices` 开发模式下使用了 mock 数据，如需后端真实数据，将 `src/views/dashboard/devices.vue` 第 205 行改为 `const useMockData = false`
- 开发服务器通过 Vite proxy 将 `/api` 转发到 `http://localhost:8899`（Docker 后端）

## 打包

| 命令 | 环境 | 说明 |
|------|------|------|
| `pnpm dev:pc` | dev | 本地开发，端口 8008 |
| `pnpm --dir ./packages/iot-pc build:test` | test | 内网测试服 |
| `pnpm --dir ./packages/iot-pc build:本地测试` | any | 本地 Nginx 验证 |
| `pnpm --dir ./packages/iot-pc build:远程部署` | pro | 远程生产部署 |
| `pnpm --dir ./packages/iot-pc build:debug` | debug | 保留 console 的调试包 |

构建输出到 `dist/pc/`。

## 环境变量

配置文件位于 `packages/iot-pc/envs/`，通过 Vite `--mode` 参数匹配：

| 文件 | mode | 用途 |
|------|------|------|
| `.env.dev` | dev | 本地开发 |
| `.env.test` | test | 内网测试 |
| `.env.any` | any | 本地打包验证 |
| `.env.pro` | pro | 远程部署 |
| `.env.debug` | debug | 调试排查 |

## Docker 部署

```powershell
# 构建并启动全部服务
cd D:\v0\iot\docker
docker-compose up -d --build
```

## 其他

### 文件命名

- `aiBox`相关原本指*ai盒子*，现在已更名为*算法服务器*
- `monitorCenter`原指*监控中心*，现改为*参数设置*

### 路由命名

以后命名应该：

- 驼峰式的url真的不好看，尽量使用 `monitor-center` 这样的命名，或者是直接简写也不错, `mcenter` ?
- 减少以`index`结尾的路由，如`/mcenter/index`，直接`/mcenter`即可

### 视频流

> 如果视频流无法播放，可通过以下方式在前端调试，得出问题后和后端反馈沟通

直播流播放器：

- 内网测试地址：`http://192.168.1.34:8080/preview/`

可能遇到问题：

1. 响应code 200，但是无资源返回，可能是播放插件不支持次资源的`mime`类型，不再发起请求

2. 有资源返回但是无法播放，返回资源的有问题，或是使用了不对的的播放插件

当前直播类型、响应头：`content-type: video/x-flv`，`x-flv`是普遍的 flv 类型

1. 本地找个播放器如*potplayer*播放这条链接，如果连potplayer都播不了，那基本是这条链接有问题

2. `xgplayer`：播放时可通过事件监听来获取到流的信息，查看浏览器是否支持当前`mime`类型

3. 使用内网部署的地址查看，如`http://192.168.1.34:8080/preview/34020000001320000009/34020000001320000009`；`preview`为预览地址，替换为`hdl`就是流的真实地址

4. 更多元信息，可使用*ffmpeg -> fflpay*，安装之后直接在命令行执行如：

```shell
ffplay http://192.168.1.34:8080/hdl/34020000001320000009/34020000001320000009
```

得到大概的I/O输出：

```txt
Input #0, flv, from 'http://192.168.1.34:8080/hdl/34020000001320000009/34020000001320000009':
  Metadata:
    hasMatadata     : true
    canSeekToEnd    : false
    hasVideo        : true
    hasAudio        : true
    MetaDataCreator : m7sv4.14.7
    hasKeyFrames    : 0
  Duration: 00:00:00.00, start: 0.001000, bitrate: N/A
  Stream #0:0: Video: h264 (Main), yuv420p(progressive), 1280x720, 25 fps, 25 tbr, 1k tbn
  Stream #0:1: Audio: pcm_alaw, 8000 Hz, mono, s16, 64 kb/s
 475.00 A-V: -0.005 fd=2359 aq=    8KB vq=   14KB sq=    0B
```

## 依赖

### `xgplayer`、`xgplayer-flv`

> 基础播放器，flv 扩展播放 flv 格式的直播流

文件位置：`/src/components/media/xgPlayer.vue`

- 用来在预警中心播放*flv*格式的直播流

对扩展的配置可以直接在实例化 `Player`时传入对应对象，如对*flv*插件进行配置：

```js
new Player({
    // ...
    plugins: [FlvPlugin]
    isLive: true,
    flv: {
      // 针对flv的配置
    }
})
```

- [配置文档](https://h5player.bytedance.com/plugins/extension/xgplayer-flv.html#%E6%8C%87%E5%8D%97)

### `konva`、`vue-konva`

> 绘制canvas的工具，项目仅使用到*vue-konva*，*konva*只用来做ts类型检查

文件位置：`/src/components/drawing`

- 用来绘制监控区域、屏蔽区域（获取各个绘制区域相对于当前图片的各个点的xy坐标）

每个*vue-konva*组件使用`config`对象作为组件prop来配置绘制的图形。这个对象实际上是*konva*的实例化参数，[配置文档](https://konvajs.org/api/Konva.html)

### `jessibuca`

[文档](http://www.jessibuca.com/document.html)，使用的版本为普通开源版

> 用意：支持播放 audio/mp4:codecs-g7110a 格式资源，浏览器自身并不支持此mimeType、截取直播流随机帧

```js
const mimeType = "audio/mp4;codecs=g7110a";
if (MediaSource.isTypeSupported(mimeType)) {
  console.log("Supported");
} else {
  console.log("Unsupported");
}
```

> 由于*node_module*对`.wasm`文件不友好，所以不支持 npm，需要使用静态js（public/jessibuca），此版本为开源版

### `@ffmpeg`

wasm 版本ffmpeg，从视频中截取帧，除了安装对应包外，还需要将 `ffmpeg-core.js`、`ffmpeg-core.wasm` 放在 `public` 目录下方便使用

### `@kjgl77/datav-vue3`

大屏中的边框、动画装饰

## 国密算法工具

### 概述

本项目提供了基于国密算法的加密工具方法，这些方法是现有加密方法的国密版本，后缀均带有 `Sm`。

### 方法列表

#### sha256Sm

- **功能**：使用 SM3 算法替代 SHA256 进行哈希计算
- **参数**：`str: string` - 要进行哈希计算的字符串
- **返回值**：哈希计算结果字符串

#### generateSignatureSm

- **功能**：使用国密算法生成签名
- **参数1**：包含 `method`, `url`, `params`, `body` 的对象
- **参数2**（可选）：`useSm2Sign: boolean` - 是否使用SM2签名算法，默认为false
  - `true`：使用SM2签名算法
  - `false`：使用SM3哈希算法（默认）
- **返回值**：包含 `signature`, `timestamp`, `nonce` 的对象

### 使用方法

1. 确保已在环境变量中配置了相关密钥：

   - `VITE_APP_SECRET_KEY`（用于SM3哈希）
   - `VITE_APP_SM2_PUBLIC_KEY`（用于SM2签名）
   - `VITE_APP_SM2_PRIVATE_KEY`（用于SM2签名）

2. 通过索引文件导入并使用相应的方法（推荐）：

```typescript
import { sha256Sm, generateSignatureSm } from "./util/crypto";

// 使用 SM3 哈希
const hash = sha256Sm("hello world");

// 生成国密签名（使用SM2签名算法）
const { signature, timestamp, nonce } = generateSignatureSm(
  {
    method: "POST",
    url: "/api/data",
    params: { id: 123 },
    body: { name: "test" },
  },
  true
);

// 生成国密哈希（使用SM3哈希算法）
const {
  signature: hashSignature,
  timestamp: hashTimestamp,
  nonce: hashNonce,
} = generateSignatureSm(
  {
    method: "POST",
    url: "/api/data",
    params: { id: 123 },
    body: { name: "test" },
  },
  false
);
```

或者直接从tools文件导入：

```typescript
import { sha256Sm, generateSignatureSm } from "./util/crypto/tools";
```

### 算法对照表

| 原始方法          | 国密版本            | 算法差异                   |
| ----------------- | ------------------- | -------------------------- |
| sha256            | sha256Sm            | SHA256 → SM3               |
| generateSignature | generateSignatureSm | HMAC-SHA256 → SM2/SM3+密钥 |

### 注意事项

1. 国密版本支持两种签名方式：
   - SM2签名：提供身份认证和不可否认性，安全性更高
   - SM3哈希（默认）：确保数据完整性，通过加入密钥增强安全性
2. 环境变量中的密钥需要在项目部署前正确配置
3. SM2 签名比 HMAC-SHA256 更安全，但计算复杂度也更高
4. 如果选择使用SM2签名方式，需要提供SM2密钥对；如果使用SM3哈希方式，则使用与HMAC-SHA256相同的密钥

### 测试

项目中包含了一个测试文件 `test.ts`，可以用来验证国密算法工具是否正常工作。可以通过以下方式运行测试：

```bash
# 在项目根目录下运行
npm run dev

# 然后在浏览器控制台查看输出结果
```

测试文件会输出SM3哈希、SM2密钥对生成、SM2签名和验签的结果。
