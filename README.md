# LineNest

画一次，整组复用。一个在浏览器中处理图片的分图小工具，图片本地处理，无需注册或上传原图。

[在线使用](https://moewerry.github.io/LineNest/) · [反馈问题](https://github.com/Moewerry/LineNest/issues) · [MIT 许可证](LICENSE)

## 操作演示

![LineNest 操作演示](media/linenest.gif)

## 主要功能

- **画线分图**：添加横竖分割线或自由线条，支持矩形和不规则区域。
- **编辑与复用**：选择、编组、复制线条，支持撤销和重做。
- **模板管理**：保存常用布局，支持模板导入和备份。
- **批量裁剪**：为多张图片套用模板，预览后统一打包下载。
- **灵活导出**：勾选切片或标记区域，选择图片格式和文件命名。

## 快速上手

1. 选择或拖入 PNG、JPG、WebP、AVIF 图片。
2. 单击添加竖线，按住 W 单击添加横线；按 L 自由画线，按 V 选择和调整。
3. 通过“导出 → 按线切图”预览并下载结果。
4. 需要处理多张图片时，先保存模板，再进入“批量裁剪”套用。

目前主要支持电脑端。不规则分区需要线条围合；模板保存在当前浏览器，建议导出备份，刷新会丢失未保存的编辑内容。

## 本地运行

需要 Node.js 22.12+ 和 pnpm。

```sh
git clone https://github.com/Moewerry/LineNest.git
cd LineNest
pnpm install --frozen-lockfile
pnpm dev
```

检查、构建和预览命令：

```sh
pnpm typecheck
pnpm build
pnpm preview
```

## 部署

GitHub Pages：在仓库 **Settings → Pages** 中将 Source 设为 **GitHub Actions**，推送到 `master` 后自动构建发布。也可在 Actions 中手动运行部署工作流。

自行部署：将 `pnpm build` 生成的 `dist` 交给静态服务器托管即可，无需后端或 Docker。部署到子目录时，通过 `PAGES_BASE_PATH` 设置路径，例如 `/LineNest/`。

## 贡献与许可

欢迎提交 [Issue](https://github.com/Moewerry/LineNest/issues) 或 Pull Request，请附复现步骤或改动说明。

项目代码与文档采用 [MIT License](LICENSE)，允许修改、分发和商用，须保留版权与许可声明。第三方依赖与素材说明见 [THIRD_PARTY.md](THIRD_PARTY.md)。
