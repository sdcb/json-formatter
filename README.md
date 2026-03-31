# JSON Formatter

一个简洁的单页 JSON 格式化工具。左侧输入原始 JSON，选择缩进方式后点击 `Format JSON`，右侧输出格式化结果。生产环境地址：<https://json-formatter.sdcb.ai/>，当前部署在 `Cloudflare`。

![JSON Formatter Screenshot](https://github.com/user-attachments/assets/b7d687b1-2eaf-4859-bebd-21fe425b1a30)

## 特点

- 纯前端静态页面，无服务端依赖，可直接部署到静态托管平台
- 使用 `React` + `TypeScript` 构建，代码结构直接、类型明确
- 使用 `Vite` 提供开发与构建流程，启动和打包都比较轻量
- 编辑器使用 `Monaco Editor`，提供接近 VS Code 的 JSON 编辑体验
- 左右面板桌面端支持拖拽调宽，移动端自动退化为上下布局
- 支持 `Tab`、`1`、`2`、`4` 空格缩进
- 支持 `Ctrl+Enter` / `Cmd+Enter` 快捷格式化
- 右侧结果支持一键复制
- 不使用 `localStorage`，不会在浏览器里残留输入内容

## 技术栈

- `React 19`
- `TypeScript`
- `Vite`
- `@monaco-editor/react`
- `monaco-editor`

## 本地运行

```bash
npm install
npm run dev
```

默认开发服务器由 Vite 提供。

## 构建

```bash
npm run build
```

构建产物输出到 `dist/`。

## 当前行为

- 左侧默认放置一行示例 JSON，方便直接理解使用方式
- 右侧默认为空，需要主动点击 `Format JSON` 才会生成结果
- 输入非法 JSON 时，右侧会显示解析错误信息
- Monaco 资源使用其默认加载方式，不额外保存本地静态资源副本

## License

本项目使用 [MIT License](C:/Users/sdfly/source/repos/json-formatter/LICENSE)。
