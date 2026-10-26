# 第三方依赖与素材说明

LineNest 自行编写的代码与文档采用根目录的 [MIT License](LICENSE)。第三方组件继续适用其自身许可证，不能统一改标为 LineNest 的 MIT。

以下根据 2026-10-27 本地已安装直接依赖的 `package.json` 中的版本与许可元数据整理。它是来源索引，不是完整的传递依赖审计，也不替代上游许可证全文、版权声明或 NOTICE 文件；实际安装版本以 `pnpm-lock.yaml` 为准。

## 运行时直接依赖

| 包 | 本地版本 | 声明的许可证 |
| --- | --- | --- |
| @radix-ui/react-slot | 1.5.0 | MIT |
| class-variance-authority | 0.7.1 | Apache-2.0 |
| clsx | 2.1.1 | MIT |
| cn | 0.5.0 | MIT |
| dexie | 4.4.7 | Apache-2.0 |
| fflate | 0.8.3 | MIT |
| jsts | 2.12.1 | EDL-1.0 OR EPL-1.0 |
| konva | 10.9.0 | MIT |
| lucide-react | 0.468.0 | ISC |
| radix-ui | 1.8.1 | MIT |
| react | 19.2.9 | MIT |
| react-dom | 19.2.9 | MIT |
| react-konva | 19.2.7 | MIT |
| react-router-dom | 7.18.4 | MIT |
| sonner | 2.0.8 | MIT |
| tailwind-merge | 3.7.0 | MIT |
| zustand | 5.0.16 | MIT |

包的上游来源及完整许可可从对应的 [npm 包页面](https://www.npmjs.com/)与安装目录中的 `package.json`、许可证文件核对。JSTS 是 [JTS](https://github.com/locationtech/jts) 的 JavaScript 移植项目，其上游为 [bjornharrtell/jsts](https://github.com/bjornharrtell/jsts)。它声明的是二选一许可，不是 MIT；此处仅记录上游声明，实际再分发时应遵守所采用的许可分支及适用声明要求。

## 开发与构建直接依赖

| 包 | 本地版本 | 声明的许可证 |
| --- | --- | --- |
| @tailwindcss/vite | 4.3.3 | MIT |
| @types/node | 22.20.5 | MIT |
| @types/react | 19.3.0 | MIT |
| @types/react-dom | 19.3.0 | MIT |
| @vitejs/plugin-react | 5.2.0 | MIT |
| tailwindcss | 4.3.3 | MIT |
| tw-animate-css | 1.4.0 | MIT |
| typescript | 5.9.3 | Apache-2.0 |
| vite | 7.3.7 | MIT |

升级、替换依赖或再分发构建产物时，应重新核对实际打包的直接与传递依赖，保留各自要求的版权声明、许可文本及适用的 NOTICE。此文件不表示已经完成构建产物的许可证检查。

## UI、图标与字体

- `src/components/ui/` 沿用 [shadcn/ui](https://github.com/shadcn-ui/ui) 的组件方案，该上游采用 MIT；交互基础使用 Radix UI。
- 界面图标使用 Lucide React，其包声明 ISC 许可。具体图标版权及上游来源以 [Lucide 的许可说明](https://lucide.dev/license)为准。
- CSS 声明 Inter、Segoe UI、PingFang SC、Microsoft YaHei 等字体族作为回退列表；当前 `public/` 未分发字体文件。字体名称的引用不代表重新授权字体。

## 项目静态素材

| 文件 | 已知来源与用途 |
| --- | --- |
| `public/linenest.svg` | LineNest 当前品牌图标 |
| `public/linenest-black.svg` | 品牌图标黑色变体 |
| `public/linenest-favicon-backup.svg` | 品牌图标备份 |
| `public/images/bakery-cat-sticker-sheet.png` | 本项目开发时使用 imagegen 生成的猫咪烘焙主题贴纸示意图 |

贴纸图的现有制作记录说明：用户图片仅用于五列两排的布局参考，没有复制、修改或发布用户原图。AI 生成素材的说明仅记录制作过程，不作独占版权或不存在相似作品的保证。

根目录 MIT 许可证明确覆盖本项目自行编写的代码和文档；此处的素材来源记录本身不构成对第三方素材、字体、商标或用户图片的额外授权。若需单独使用品牌标识或示意图，可先向维护者确认具体授权范围。

## 文档参考

README 的信息组织参考 [Timiocoisin/Lunelle](https://github.com/Timiocoisin/Lunelle)。没有引入该项目的应用代码、角色插画或字体文件，也未将该项目的作者版权声明作为 LineNest 的版权声明。
