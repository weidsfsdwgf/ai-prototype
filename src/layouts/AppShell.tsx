import { Avatar, Breadcrumb, Button, Layout, Menu, Tooltip, type MenuProps } from "antd";
import { Bell, ChevronLeft, ChevronRight } from "lucide-react";
import { Outlet, useLocation, useNavigate, type NavigateFunction } from "react-router-dom";
import {
  flattenNavigationItems,
  isNavigationGroupItem,
  navigationItems,
  type NavigationItem,
} from "../app/navigation";
import { useShellStore } from "../store/useShellStore";
import "./AppShell.css";

const { Header, Sider, Content } = Layout;
const defaultOpenKeys = ["oa", "oa-system", "oa-hr", "oa-approval", "oa-assets", "oa-config"];
type MenuItem = NonNullable<MenuProps["items"]>[number];
const frameworkBreadcrumbs: Record<string, string[]> = {
  "/standards": ["页面标准", "标准总览"],
  "/standards/list": ["页面标准", "列表框架"],
  "/standards/tree-list": ["页面标准", "左树右表框架"],
  "/standards/detail": ["页面标准", "详情框架"],
  "/standards/form": ["页面标准", "表单框架"],
  "/standards/config": ["页面标准", "配置框架"],
  "/standards/states": ["页面标准", "状态框架"],
};

function getSelectedKey(pathname: string) {
  const matchedItem = flattenNavigationItems()
    .sort((a, b) => b.path.length - a.path.length)
    .find((item) => pathname === item.path || pathname.startsWith(`${item.path}/`));

  return matchedItem?.key ?? "home";
}

function findNavigationTrail(pathname: string, items: NavigationItem[], parents: string[] = []): string[] {
  for (const item of items) {
    const trail = [...parents, item.label];

    if (isNavigationGroupItem(item)) {
      const childTrail = findNavigationTrail(pathname, item.children, trail);

      if (childTrail.length > 0) {
        return childTrail;
      }
    } else if (pathname === item.path || pathname.startsWith(`${item.path}/`)) {
      return trail;
    }
  }

  return [];
}

function getBreadcrumbItems(pathname: string) {
  const navigationTrail = findNavigationTrail(pathname, navigationItems);
  const labels = navigationTrail.length > 0 ? navigationTrail : (frameworkBreadcrumbs[pathname] ?? ["展示首页"]);

  return labels.map((label) => ({ title: label }));
}

function buildMenuItems(items: NavigationItem[], navigate: NavigateFunction): MenuItem[] {
  return items.map((item) => {
    if (isNavigationGroupItem(item)) {
      return {
        key: item.key,
        icon: item.icon,
        label: item.label,
        children: buildMenuItems(item.children, navigate),
      };
    }

    return {
      key: item.key,
      icon: item.icon,
      label: item.label,
      onClick: () => navigate(item.path),
    };
  });
}

export function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const collapsed = useShellStore((state) => state.collapsed);
  const setCollapsed = useShellStore((state) => state.setCollapsed);
  const menuItems = buildMenuItems(navigationItems, navigate);

  return (
    <Layout className="app-shell">
      <Sider
        className="app-shell__sider"
        width={248}
        collapsedWidth={72}
        collapsible
        collapsed={collapsed}
        trigger={null}
      >
        <div className="app-shell__brand" aria-label="LAS">
          <div className="app-shell__brand-mark">L</div>
          {!collapsed ? <span>LAS 管理后台</span> : null}
        </div>
        <Menu
          mode="inline"
          defaultOpenKeys={defaultOpenKeys}
          selectedKeys={[getSelectedKey(location.pathname)]}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header className="app-shell__header">
          <div className="app-shell__header-left">
            <Tooltip title={collapsed ? "展开导航" : "收起导航"}>
              <Button
                aria-label={collapsed ? "展开导航" : "收起导航"}
                icon={collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                onClick={() => setCollapsed(!collapsed)}
                type="text"
              />
            </Tooltip>
            <Breadcrumb className="app-shell__breadcrumb" items={getBreadcrumbItems(location.pathname)} />
          </div>
          <div className="app-shell__header-right">
            <Tooltip title="通知">
              <Button aria-label="通知" icon={<Bell size={18} />} type="text" />
            </Tooltip>
            <Avatar className="app-shell__avatar">陈</Avatar>
          </div>
        </Header>
        <Content className="app-shell__content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
