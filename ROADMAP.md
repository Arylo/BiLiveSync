# BiBiPhoto Roadmap

> 私有化相册同步系统（Live Photo 完整支持）
>
> 技术栈：**TypeScript · Hono · Drizzle ORM · React Native · Tauri v2**
>
> 当前状态：骨架完成 ~20%，推进 MVP 中

---

## 🏗️ 架构

```
┌──────────────────────────────────────────────────┐
│  客户端 (Mobile / Desktop)                        │
│  · 同内网 → 直连存储端（全接口）                  │
│  · 公网   → 经公开端 GET 代理                     │
│  · API 认证: pool_id_hash（公网/公开端）；storage_id_hash（仅内网直连存储端有效）      │
└──────┬────────────────────┬──────────────────────┘
       │ 内网直连            │ 公网 HTTP
       ▼                     ▼
┌──────────────┐  ┌─────────────────────────────────┐
│  存储端       │  │  公开端 (Public API)             │
│  · POST 上传  │  │  · 仅 GET 代理 · 公网暴露        │
│  · GET 查询   │◄─┤  · Hono · Docker / CF           │
│  · 版本 hash  │  │  · DB: 存储注册信息 + hash       │
│  · 页面: React│  │  · 热数据: Redis / KV / 内存    │
│  · Hono       │  └──────────┬──────────────────────┘
│  · Drizzle    │             │
│  · DB 多适配   │             │ HTTPS GET
│  · 存储多后端  │◄────────────┘
│  · 定时扫描    │             │ 心跳 ping
│  · 外网 HTTPS  │─────────────►│
│    (仅限 GET)  │
│  · Docker / CF │
│                            
│  · STORAGE_ID    (自身生成, UUID v7)
│  · STORAGE_POOL_ID (公开端分配, UUID v7)
└──────────────┘
```

## 🔄 使用流程

### 1. 存储端注册到公开端

```
存储端启动
  │
  ├─ 自身生成 STORAGE_ID (UUID v7, 不可配置) → 持久化到本地
  │
  ├─ 读取环境变量:
  │   · API_KEY
  │   · API_BASE_URL
  │   · STORAGE_BASE_URL
  │
  ├─ POST {API_BASE_URL}/api/storages/register
  │   携带: { storage_id, storage_base_url }
  │
  │   公开端:
  │   · 分配 STORAGE_POOL_ID (UUID v7) → 返回给存储端
  │   · { storage_id, storage_pool_id, ... } 写入 DB
  │
  └─ 注册后定时心跳 ──→  POST {API_BASE_URL}/api/storages/ping
      公开端更新热数据 (Redis / Cloudflare KV / 内存)
      超时标记离线
```

### 2. 应用端关联存储端

**前置条件**: 应用端与存储端处于同一内网

#### Method A — 存储端页面扫码

```
1. 用户在 PC / 手机浏览器打开存储端内网页面（React 构建）
2. 页面展示关联二维码，格式: id|storage_id

   应用端扫码解析后：
   → 用 storage_id_hash 调公开端 API
   → 获取 storage_pool_id + public_api_url + storage_base_url

3. 若已有同 storage_id 的关联 && id 的 timestamp 更新 → 更新数据
4. 本地持久化关联关系 → 完成
```

#### Method B — 已关联应用端分享

```
1. 已关联应用端 → 生成分享二维码
   格式: id|storage_pool_id|public_api_url（已有注册信息时，不含 storage_id）
   或:   id|storage_id（未注册时，回退到 Method A 格式）

2. 新应用端扫码：
   · 有 storage_pool_id + public_api_url → 直接使用
   · 仅有 id|storage_id → 同 Method A 流程
3. 本地持久化关联关系 → 完成
```

#### Method C — 粘贴文本关联

```
1. 复制二维码中的文本数据
2. 在应用端粘贴
3. 应用端解析 (同 Method A 流程)
```

---

## 🗺️ 总览

```
骨架 20% ──→ Phase 1 ──→ Phase 2+3 ──→ Phase 4 ──→ 🎯 MVP
```

| 阶段 | 目标 | 状态 | 可并行 |
|------|------|------|--------|
| **1** | 公开端 + 存储端 端到端打通 | ⬜ | — |
| **2** | Mobile iOS/Android 原生模块 | ⬜ | 3 |
| **3** | Desktop Tauri v2 可运行 | ⬜ | 2 |
| **4** | CI + 端到端验证 | ⬜ | 依赖 1-3 |

---

## Phase 1 — 公开端 + 存储端

**目标**：存储端注册 + 心跳 → 应用端关联 → 上传/拉取 → 定时扫描

### 1.1 存储端（Storage Server）

- [ ] Hono + Drizzle ORM 初始化，支持多 DB 适配（SQLite / PG / MySQL / D1）
- [ ] Drizzle Schema 定义（`media_items` 表，ID 使用 UUID v7）+ 迁移
- [ ] 多存储后端抽象层：本地磁盘 / 夸克网盘 / aList / S3 / MinIO
- [ ] `GET /api/media/:id` — 媒体详情（认证: pool_id_hash 或 storage_id_hash）
- [ ] `GET /api/media/list` — 媒体列表（认证同上）
- [ ] `POST /api/media/upload` — multipart 上传
- [ ] 定时扫描任务：按可配置间隔扫描存储介质，新增文件入库、已删除文件同步标记，「文件数量变更时更新 version」
- [ ] **自身生成 STORAGE_ID**（UUID v7，不可配置）→ 持久化到本地，重启复用
- [ ] **启动注册**：携带 storage_id → 公开端分配 STORAGE_POOL_ID
- [ ] **定时心跳**：注册后按可配置间隔 ping 公开端，携带 version（文件变更时自动更新）
- [ ] **关联二维码页面**：内网 React 页面，展示关联二维码（格式: id|storage_id）
- [ ] 外网 HTTPS 暴露（仅限 GET 接口）
- [ ] **React Web 页面（SSR）**：内网 Web 界面，环境变量 `STORAGE_WEB_ENABLED` 控制（默认 true），仅限 IP 直连访问：
  - SSR 渲染，自动注入 `storage_id_hash`（无需手动认证）
  - 关联二维码页（扫码关联入口）
  - 媒体瀑布流列表（`GET /api/media/list`，无限滚动）
  - 媒体详情页（点击打开，`GET /api/media/:id`，查看大图/视频、元信息）
  - 状态查看 & 基础配置页

### 1.2 公开端（Public API Server）

- [ ] Hono + Drizzle ORM 初始化，公网 HTTP 暴露，**仅 GET 接口**，无 UI
- [ ] **公开端 DB**：`storage_registry` 表 — {storage_id, storage_pool_id, storage_base_url, version_hash, ...}
- [ ] ` POST /api/storages/register` — 接收注册 → 分配 STORAGE_POOL_ID (UUID v7) → 写入 DB
- [ ] ` POST /api/storages/ping` — 接收心跳 → 更新热数据 + 更新 version_hash（携带 version）
- [ ] 心跳超时检测（超过阈值标记离线）
- [ ] `GET /api/storages` — 查询所有已注册存储端列表（含在线状态）
- [ ] `GET /api/media/:id` — 代理至存储端（携带 pool_id_hash）
- [ ] `GET /api/media/list` — 代理至存储端（携带 pool_id_hash）

### 1.3 客户端网络策略

- [ ] 同网段检测（复用 `lanPolicy.ts`），内网直连存储端（全接口可用）
- [ ] 非内网自动切换公开端 GET 代理模式
- [ ] 连接失败自动降级（存储端不可达 → 切公开端）
- [ ] **API 认证**：访问公开端 `/api/media/*` 带 pool_id_hash；访问存储端 `/api/media/*` 内网用 storage_id_hash，外网/代理用 pool_id_hash

### 1.4 应用端关联流程

- [ ] 扫码解析 / 粘贴文本解析 → 提取二维码数据（id|storage_id 或 id|pool_id|url）
- [ ] 仅有 id+storage_id → 用 storage_id_hash 调公开端获取 pool_id + public_api_url + storage_base_url
- [ ] 已有 pool_id + public_api_url → 直接使用
- [ ] storage_id 一致 && id timestamp 更新 → 覆盖旧数据
- [ ] 本地持久化关联关系
- [ ] Method B 分享二维码生成（已关联设备）

---

## Phase 2 — Mobile 原生模块

**目标**：iOS / Android 原生 Live Photo 保存 + 系统分享 + 扫码/粘贴关联

- [ ] iOS：PHPhotoLibrary 保存 Live Photo + UIActivityViewController 分享
- [ ] Android：MediaStore 保存 + Intent 分享
- [ ] TS Bridge 与原生方法签名对齐
- [ ] 对接存储端 API（内网全接口 / 公开端 GET 代理双模式 + pool_id_hash 认证）
- [ ] 扫码 / 粘贴文本关联存储端（Method A + B + C，含 UUID v7 时间戳比较）

---

## Phase 3 — Desktop（Tauri v2 + React）

**目标**：桌面端预览 Live Photo + 扫码/粘贴关联

- [ ] 初始化 Tauri v2 + React + TS 项目
- [ ] Live Photo 预览组件
- [ ] 对接存储端 API（内网全接口 / 公开端 GET 代理双模式 + pool_id_hash 认证）
- [ ] 扫码 / 粘贴文本关联存储端（Method A + B + C，UUID v7 更新逻辑）
- [ ] Monorepo 共享包引用打通

---

## Phase 4 — CI & 端到端验证

**目标**：自动化质量 + 全栈集成

- [ ] GitHub Actions（固定）：lint + test
- [ ] Docker Compose 一键启动全栈（公开端 + 存储端 + DB + Redis/MinIO）
- [ ] 端到端测试：注册 + 分配 pool_id → 心跳 → 扫码/粘贴关联（含 UUID v7 更新）→ 上传 → 拉取
- [ ] 版本 hash 对比测试
- [ ] 心跳超时测试：停存储端 → 公开端标记离线 → 应用端无法关联
- [ ] 公网回退 + pool_id_hash / storage_id_hash 认证测试

---

## 🔑 架构决策

| # | 决策 | 理由 |
|----|------|------|
| 1 | **公开端 / 存储端分离** | 公网仅暴露无状态 API；存储端内网部署、有状态 |
| 2 | **公开端仅 GET 代理** | 所有 POST 写操作统一走存储端内网直连 |
| 3 | **公开端有独立 DB** | 存储注册信息、version_hash，支持多存储端管理 |
| 4 | **所有 ID 统一 UUID v7** | 时间有序、全局唯一、适合分布式 |
| 5 | **STORAGE_ID 自身生成 + 持久化** | 不可配置，重启复用 |
| 6 | **STORAGE_POOL_ID 由公开端分配** | 公开端统一管理，客户端以 pool 维度关联 |
| 7 | **心跳数据存热层（Redis/KV/内存）** | 高频写入不适合 DB；超时自动清除 |
| 8 | **版本随心跳上报** | ping 时携带 version；定时扫描后文件数量变更 → version 更新 → 下次 ping 同步至公开端 |
| 9 | **二维码格式分级** | 存储端页面最小化（id\|storage_id）；分享带完整数据（id\|pool_id\|url） |
| 10 | **粘贴文本关联** | 除扫码外支持粘贴，应对无摄像头/同设备场景 |
| 11 | **存储端 Web 页面可配置开关** | 环境变量 `STORAGE_WEB_ENABLED` 控制，默认开启；纯 API 模式可关闭 |
| 12 | **扫码更新逻辑（storage_id + id timestamp）** | 同 storage_id 且 id 更新 → 覆盖 |
| 13 | **API 认证 (pool_id_hash / storage_id_hash)** | pool_id_hash 公网通用；storage_id_hash 仅内网直连存储端有效 |
| 14 | **客户端内网直连存储端** | 同网段全接口可用，性能最优 |
| 15 | **CI 固定 lint + test** | 不绑定具体测试框架 |
| 16 | **Hono** 做后端 | 轻量、多运行时、Cloudflare Workers 原生支持 |
| 17 | **Drizzle ORM** | 类型安全、零运行时、多 DB 适配 |
| 18 | **多存储后端** | 抽象层支持本地/夸克/aList/S3/MinIO |
| 19 | **定时扫描同步** | Cron 扫描存储介质，自动增删 DB |
| 20 | **Docker + Cloudflare 双部署** | Docker 自托管，Cloudflare 零运维 |
| 22 | **存储端 React 页面** | 内网 Web 管理界面（二维码关联、状态查看），技术栈与 Desktop 复用 |
| 23 | **Tauri v2** 做桌面 | 体积小、性能好、Rust 安全 |

---

## 📊 进度

| 阶段 | 开始 | 完成 |
|------|------|------|
| Phase 1 | — | — |
| Phase 2 | — | — |
| Phase 3 | — | — |
| Phase 4 | — | — |

> 最后更新：2026-06-04
