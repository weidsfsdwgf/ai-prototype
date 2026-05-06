# 产品文档目录

本目录用于沉淀后台管理系统的产品文档。每个可访问菜单必须在这里有一份对应文档，并在下方索引中登记。

## 维护规则

- 新增菜单时，同步新增产品文档，并补充到本文档索引。
- 页面需求变化时，直接更新对应菜单文档的“当前需求”和“迭代记录”。
- 尚未确认的信息放入“待确认问题”，不要从文档中删除。
- 原型页面开发前，先查看 `docs/page-standards.md` 和对应框架页面。

## 菜单文档索引

| 菜单 | 路由 | 产品文档 | 状态 |
| --- | --- | --- | --- |
| 展示首页 | `/home` | `docs/product/home.md` | 已建立 |
| 用户管理 | `/oa/system/users` | `docs/product/oa/system-management/user-management.md` | 持续迭代 |
| 角色管理 | `/oa/system/roles` | `docs/product/oa/system-management/role-management.md` | 已建立 |
| 岗位管理 | `/oa/system/positions` | `docs/product/oa/system-management/position-management.md` | 已建立 |
| 用户组 | `/oa/system/groups` | `docs/product/oa/system-management/user-groups.md` | 已建立 |
| 花名册 | `/oa/hr/roster` | `docs/product/oa/hr/roster.md` | 持续迭代 |
| 组织架构 | `/oa/hr/org-structure` | `docs/product/oa/hr/org-structure.md` | 持续迭代 |
| 转正管理 | `/oa/hr/probation` | `docs/product/oa/hr/probation-management.md` | 持续迭代 |
| 离职管理 | `/oa/hr/resignations` | `docs/product/oa/hr/resignation-management.md` | 持续迭代 |
| OA申请 | `/oa/approval/applications` | `docs/product/oa/approval-management/oa-application.md` | 持续迭代 |
| 审批办理 | `/oa/approval/handling` | `docs/product/oa/approval-management/approval-handling.md` | 持续迭代 |
| 我发起的 | `/oa/approval/initiated` | `docs/product/oa/approval-management/my-initiated.md` | 持续迭代 |
| 待办任务 | `/oa/approval/todos` | `docs/product/oa/approval-management/todo-tasks.md` | 持续迭代 |
| 低值易耗品 | `/oa/assets/low-value-consumables` | `docs/product/oa/asset-management/low-value-consumables.md` | 持续迭代 |
| 评分表配置 | `/oa/config/scorecards` | `docs/product/oa/config-management/scorecard-config.md` | 持续迭代 |

## 文档结构

每份菜单文档建议保持以下结构：

- 基本信息
- 当前需求
- 字段与操作
- 业务规则
- 原型实现记录
- 待确认问题
- 迭代记录
