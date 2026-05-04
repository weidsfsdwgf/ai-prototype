# LAS 管理后台原型

这是一个面向 ToB 后台管理系统的前端原型底座，目标是先固定技术栈、目录边界和 UI 规范，再在后续迭代中按模块扩展业务能力。

## 技术栈

- 开发语言：TypeScript + React
- 构建工具：Vite
- 组件库：Ant Design 5
- 图标：lucide-react
- 路由：React Router
- 服务端状态：TanStack Query
- 客户端轻量状态：Zustand
- 日期处理：dayjs

## 命令

```bash
npm install
npm run dev
npm run build
npm run typecheck
```

## 目录约定

```text
src/
  app/          应用级配置、路由、Provider
  components/   可复用组件
  data/         原型阶段静态数据
  features/     后续业务模块
  layouts/      页面框架与导航
  pages/        路由页面
  styles/       全局样式与设计变量
  types/        通用类型
```

## 规范文档

- [工程地基与选型](docs/foundation.md)
- [UI 规范](docs/ui-guidelines.md)
- [页面标准](docs/page-standards.md)
- [原型页面设计方法](docs/prototype-design-method.md)
