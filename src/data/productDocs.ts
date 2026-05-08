export type ProductMenuDoc = {
  menu: string;
  route: string;
  documentPath: string;
  status: "已建立" | "持续迭代";
  updatedAt: string;
};

export const productMenuDocs: ProductMenuDoc[] = [
  {
    menu: "展示首页",
    route: "/home",
    documentPath: "docs/product/home.md",
    status: "已建立",
    updatedAt: "2026-04-30",
  },
  {
    menu: "用户管理",
    route: "/oa/system/users",
    documentPath: "docs/product/oa/system-management/user-management.md",
    status: "持续迭代",
    updatedAt: "2026-04-30",
  },
  {
    menu: "角色管理",
    route: "/oa/system/roles",
    documentPath: "docs/product/oa/system-management/role-management.md",
    status: "已建立",
    updatedAt: "2026-04-30",
  },
  {
    menu: "岗位管理",
    route: "/oa/system/positions",
    documentPath: "docs/product/oa/system-management/position-management.md",
    status: "已建立",
    updatedAt: "2026-04-30",
  },
  {
    menu: "用户组",
    route: "/oa/system/groups",
    documentPath: "docs/product/oa/system-management/user-groups.md",
    status: "已建立",
    updatedAt: "2026-04-30",
  },
  {
    menu: "花名册",
    route: "/oa/hr/roster",
    documentPath: "docs/product/oa/hr/roster.md",
    status: "持续迭代",
    updatedAt: "2026-04-30",
  },
  {
    menu: "组织架构",
    route: "/oa/hr/org-structure",
    documentPath: "docs/product/oa/hr/org-structure.md",
    status: "持续迭代",
    updatedAt: "2026-04-30",
  },
  {
    menu: "转正管理",
    route: "/oa/hr/probation",
    documentPath: "docs/product/oa/hr/probation-management.md",
    status: "持续迭代",
    updatedAt: "2026-05-04",
  },
  {
    menu: "离职管理",
    route: "/oa/hr/resignations",
    documentPath: "docs/product/oa/hr/resignation-management.md",
    status: "持续迭代",
    updatedAt: "2026-05-05",
  },
  {
    menu: "绩效管理",
    route: "/oa/hr/performance",
    documentPath: "docs/product/oa/hr/performance-management.md",
    status: "持续迭代",
    updatedAt: "2026-05-08",
  },
  {
    menu: "OA申请",
    route: "/oa/approval/applications",
    documentPath: "docs/product/oa/approval-management/oa-application.md",
    status: "持续迭代",
    updatedAt: "2026-05-05",
  },
  {
    menu: "审批办理",
    route: "/oa/approval/handling",
    documentPath: "docs/product/oa/approval-management/approval-handling.md",
    status: "持续迭代",
    updatedAt: "2026-04-30",
  },
  {
    menu: "我发起的",
    route: "/oa/approval/initiated",
    documentPath: "docs/product/oa/approval-management/my-initiated.md",
    status: "持续迭代",
    updatedAt: "2026-04-30",
  },
  {
    menu: "待办任务",
    route: "/oa/approval/todos",
    documentPath: "docs/product/oa/approval-management/todo-tasks.md",
    status: "持续迭代",
    updatedAt: "2026-05-05",
  },
  {
    menu: "低值易耗品",
    route: "/oa/assets/low-value-consumables",
    documentPath: "docs/product/oa/asset-management/low-value-consumables.md",
    status: "持续迭代",
    updatedAt: "2026-04-30",
  },
  {
    menu: "评分表配置",
    route: "/oa/config/scorecards",
    documentPath: "docs/product/oa/config-management/scorecard-config.md",
    status: "持续迭代",
    updatedAt: "2026-05-04",
  },
];
