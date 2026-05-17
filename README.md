# BiBiPhoto

私有化相册同步系统（Live Photo 完整支持）初始化骨架，基于 **TypeScript + npm workspaces + TurboRepo**。

## 1. 项目初始化步骤

1. 安装依赖
   ```bash
   npm install
   ```
2. 类型检查（strict）
   ```bash
   npm run typecheck
   ```
3. 本地开发（并行）
   ```bash
   npm run dev
   ```
4. 使用 Docker 启动基础依赖（HTTP server + MinIO + Admin）
   ```bash
   docker compose up
   ```

## 2. Monorepo 结构

```text
/
├── package.json
├── turbo.json
├── tsconfig.base.json
├── docker-compose.yml
├── apps/
│   ├── mobile/
│   ├── desktop/
│   ├── admin/
│   └── server/
└── packages/
    ├── shared-api/
    ├── shared-utils/
    └── ui-components/
```

## 3. 关键约束对应实现

### 3.1 Live Photo 数据结构（共享类型）

文件：`packages/shared-api/src/index.ts`

- `MediaItem` 包含 `video_url` / `video_compatible_url`
- 上传响应 `UploadMediaResponse`

### 3.2 服务端上传与转码（TypeScript）

文件：

- `apps/server/src/media/upload.controller.ts`
- `apps/server/src/media/media.service.ts`
- `apps/server/src/database/schema.sql`

覆盖点：

- 上传接口字段：`image`, `video`, `album_id`
- Live Photo 关联落库字段：`image_path`, `video_path`
- 兼容视频字段：`video_compatible_path`
- SQLite WAL 模式
- 转码任务：`ffmpeg` 异步任务占位（HEVC MOV -> H.264 MP4）

### 3.3 React Native 关键模块（TypeScript）

文件：

- `apps/mobile/metro.config.js`
- `apps/mobile/src/modules/livePhotoModule.ts`
- `apps/mobile/src/share/livePhotoShare.ts`
- `apps/mobile/src/network/lanPolicy.ts`

覆盖点：

- Metro `watchFolders` 指向 root `node_modules` 和 `packages`
- iOS 原生能力 TS Bridge：保存 Live Photo、动态分享调用
- 动态分享失败自动降级静态图（`react-native-wechat-lib`）
- 上传仅同网段可用（LAN 子网判断）

### 3.4 桌面/后台 Shadcn + Tailwind 复用基础

文件：

- `packages/ui-components/src/index.tsx`
- `apps/admin/tailwind.config.ts`
- `apps/admin/postcss.config.js`

### 3.5 服务端 HTTP + 反向代理 HTTPS

文件：`docker-compose.yml`

当前仅暴露 HTTP（3000）；公网 HTTPS 终止由外部 Nginx/Caddy/CDN 负责。

### 3.6 平台标识头

文件：`apps/admin/src/platformHeader.ts` 与 `apps/server/src/common/platform-header.ts`

统一使用 `X-Platform: ios | android | desktop | web`。

## 4. 后续落地建议（最小骨架之外）

1. 在 `apps/server` 引入 Nest.js 实际模块（Controller/Service/Guard/JWT）。
2. 在 `apps/mobile/ios` 实现 `PHLivePhotoView` / `PHPhotoLibrary` / `UIActivityViewController` 原生模块，并与 TS Bridge 对齐。
3. 在 `apps/mobile/android` 补充 `MediaStore` 保存实现和动态预览组件。
4. 补充动态播放 Web 页面（用于 iOS 动态分享链接回退场景）。
5. 补充 CI：typecheck + unit test + e2e + CodeQL。
