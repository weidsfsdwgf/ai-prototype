import {
  Archive,
  Boxes,
  BriefcaseBusiness,
  Building2,
  ClipboardCheck,
  ContactRound,
  Home,
  IdCard,
  ListChecks,
  Network,
  Send,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  UsersRound,
} from "lucide-react";
import type { ReactNode } from "react";

export type NavigationLeafItem = {
  key: string;
  label: string;
  path: string;
  icon: ReactNode;
};

export type NavigationGroupItem = {
  key: string;
  label: string;
  icon: ReactNode;
  children: NavigationItem[];
};

export type NavigationItem = NavigationLeafItem | NavigationGroupItem;

export const navigationItems: NavigationItem[] = [
  {
    key: "home",
    label: "展示首页",
    path: "/home",
    icon: <Home size={18} />,
  },
  {
    key: "oa",
    label: "OA",
    icon: <BriefcaseBusiness size={18} />,
    children: [
      {
        key: "oa-system",
        label: "系统管理",
        icon: <Settings size={18} />,
        children: [
          {
            key: "oa-system-users",
            label: "用户管理",
            path: "/oa/system/users",
            icon: <Users size={18} />,
          },
          {
            key: "oa-system-roles",
            label: "角色管理",
            path: "/oa/system/roles",
            icon: <ShieldCheck size={18} />,
          },
          {
            key: "oa-system-positions",
            label: "岗位管理",
            path: "/oa/system/positions",
            icon: <IdCard size={18} />,
          },
          {
            key: "oa-system-groups",
            label: "用户组",
            path: "/oa/system/groups",
            icon: <UsersRound size={18} />,
          },
        ],
      },
      {
        key: "oa-hr",
        label: "人事管理",
        icon: <Building2 size={18} />,
        children: [
          {
            key: "oa-hr-roster",
            label: "花名册",
            path: "/oa/hr/roster",
            icon: <ContactRound size={18} />,
          },
          {
            key: "oa-hr-org-structure",
            label: "组织架构",
            path: "/oa/hr/org-structure",
            icon: <Network size={18} />,
          },
          {
            key: "oa-hr-probation",
            label: "转正管理",
            path: "/oa/hr/probation",
            icon: <ContactRound size={18} />,
          },
        ],
      },
      {
        key: "oa-approval",
        label: "审批管理",
        icon: <ClipboardCheck size={18} />,
        children: [
          {
            key: "oa-approval-applications",
            label: "OA申请",
            path: "/oa/approval/applications",
            icon: <Send size={18} />,
          },
          {
            key: "oa-approval-handling",
            label: "审批办理",
            path: "/oa/approval/handling",
            icon: <ClipboardCheck size={18} />,
          },
          {
            key: "oa-approval-initiated",
            label: "我发起的",
            path: "/oa/approval/initiated",
            icon: <Send size={18} />,
          },
        ],
      },
      {
        key: "oa-assets",
        label: "资产管理",
        icon: <Archive size={18} />,
        children: [
          {
            key: "oa-assets-low-value-consumables",
            label: "低值易耗品",
            path: "/oa/assets/low-value-consumables",
            icon: <Boxes size={18} />,
          },
        ],
      },
      {
        key: "oa-config",
        label: "配置管理",
        icon: <SlidersHorizontal size={18} />,
        children: [
          {
            key: "oa-config-scorecards",
            label: "评分表配置",
            path: "/oa/config/scorecards",
            icon: <ListChecks size={18} />,
          },
        ],
      },
    ],
  },
];

export function isNavigationGroupItem(item: NavigationItem): item is NavigationGroupItem {
  return "children" in item;
}

export function flattenNavigationItems(items = navigationItems): NavigationLeafItem[] {
  return items.flatMap((item) =>
    isNavigationGroupItem(item) ? flattenNavigationItems(item.children) : [item],
  );
}
