import { Avatar, Breadcrumb, Button, Layout, Menu, Modal, Space, Tabs, Tooltip, message, type MenuProps } from "antd";
import { Bell, BookOpenText, ChevronLeft, ChevronRight, Copy } from "lucide-react";
import { useState } from "react";
import { Outlet, useLocation, useNavigate, type NavigateFunction } from "react-router-dom";
import {
  flattenNavigationItems,
  isNavigationGroupItem,
  navigationItems,
  type NavigationItem,
} from "../app/navigation";
import { productMenuDocs, type ProductMenuDoc } from "../data/productDocs";
import { useShellStore } from "../store/useShellStore";
import "./AppShell.css";

const { Header, Sider, Content } = Layout;
const documentModules = import.meta.glob("../../docs/**/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
}) as Record<string, string>;
const defaultOpenKeys = [
  "oa",
  "oa-system",
  "oa-hr",
  "oa-performance",
  "project",
  "project-management",
  "todo",
  "todo-approval",
  "finance",
  "finance-assets",
];
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
const frameworkDocs: Record<string, ProductMenuDoc> = {
  "/standards": {
    menu: "标准总览",
    route: "/standards",
    documentPath: "docs/page-standards.md",
    status: "持续迭代",
    updatedAt: "2026-05-15",
  },
  "/standards/list": {
    menu: "列表框架",
    route: "/standards/list",
    documentPath: "docs/page-standards.md",
    status: "持续迭代",
    updatedAt: "2026-05-15",
  },
  "/standards/tree-list": {
    menu: "左树右表框架",
    route: "/standards/tree-list",
    documentPath: "docs/page-standards.md",
    status: "持续迭代",
    updatedAt: "2026-05-15",
  },
  "/standards/detail": {
    menu: "详情框架",
    route: "/standards/detail",
    documentPath: "docs/page-standards.md",
    status: "持续迭代",
    updatedAt: "2026-05-15",
  },
  "/standards/form": {
    menu: "表单框架",
    route: "/standards/form",
    documentPath: "docs/page-standards.md",
    status: "持续迭代",
    updatedAt: "2026-05-15",
  },
  "/standards/config": {
    menu: "配置框架",
    route: "/standards/config",
    documentPath: "docs/page-standards.md",
    status: "持续迭代",
    updatedAt: "2026-05-15",
  },
  "/standards/states": {
    menu: "状态框架",
    route: "/standards/states",
    documentPath: "docs/page-standards.md",
    status: "持续迭代",
    updatedAt: "2026-05-15",
  },
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

function getCurrentPageDoc(pathname: string) {
  const matchedProductDoc = [...productMenuDocs]
    .sort((a, b) => b.route.length - a.route.length)
    .find((item) => pathname === item.route || pathname.startsWith(`${item.route}/`));

  return matchedProductDoc ?? frameworkDocs[pathname] ?? productMenuDocs.find((item) => item.route === "/home");
}

function getDocumentContent(documentPath: string) {
  return documentModules[`../../${documentPath}`] ?? "暂未读取到文档内容，请按文档路径查看文件。";
}

function getDocumentPaths(pageDoc?: ProductMenuDoc) {
  if (!pageDoc) {
    return [];
  }

  return Array.from(new Set([pageDoc.documentPath, ...(pageDoc.relatedDocumentPaths ?? [])]));
}

function getDocumentLabel(documentPath: string) {
  return documentPath.split("/").at(-1) ?? documentPath;
}

async function copyText(text: string) {
  await navigator.clipboard?.writeText(text);
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
  const [docModalOpen, setDocModalOpen] = useState(false);
  const collapsed = useShellStore((state) => state.collapsed);
  const setCollapsed = useShellStore((state) => state.setCollapsed);
  const menuItems = buildMenuItems(navigationItems, navigate);
  const currentPageDoc = getCurrentPageDoc(location.pathname);
  const currentDocumentPaths = getDocumentPaths(currentPageDoc);
  const [activeDocumentPath, setActiveDocumentPath] = useState<string>();
  const selectedDocumentPath =
    activeDocumentPath && currentDocumentPaths.includes(activeDocumentPath)
      ? activeDocumentPath
      : currentDocumentPaths[0];

  const copyCurrentDocument = async () => {
    if (!selectedDocumentPath) {
      return;
    }

    await copyText(getDocumentContent(selectedDocumentPath));
    message.success("已复制当前文档");
  };

  const copyAllDocuments = async () => {
    const allDocumentContent = currentDocumentPaths
      .map((documentPath) => `# ${getDocumentLabel(documentPath)}\n\n${getDocumentContent(documentPath)}`)
      .join("\n\n---\n\n");

    await copyText(allDocumentContent);
    message.success("已复制全部文档");
  };

  const openCurrentPageDoc = () => {
    setDocModalOpen(true);
  };

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
            <Tooltip title="查看当前页面文档">
              <Button
                aria-label="查看当前页面文档"
                icon={<BookOpenText size={18} />}
                onClick={openCurrentPageDoc}
                type="text"
              >
                文档
              </Button>
            </Tooltip>
            <Tooltip title="通知">
              <Button aria-label="通知" icon={<Bell size={18} />} type="text" />
            </Tooltip>
            <Avatar className="app-shell__avatar">陈</Avatar>
          </div>
        </Header>
        <Content className="app-shell__content">
          <Outlet />
        </Content>
        <Modal
          title="文档"
          open={docModalOpen}
          width={860}
          footer={
            <Space>
              <Button icon={<Copy size={14} />} onClick={copyCurrentDocument}>
                复制当前文档
              </Button>
              {currentDocumentPaths.length > 1 ? (
                <Button icon={<Copy size={14} />} onClick={copyAllDocuments}>
                  复制全部文档
                </Button>
              ) : null}
              <Button onClick={() => setDocModalOpen(false)}>关闭</Button>
            </Space>
          }
          onCancel={() => setDocModalOpen(false)}
        >
          {currentDocumentPaths.length ? (
            <Tabs
              activeKey={selectedDocumentPath}
              className="app-shell-doc-tabs"
              items={currentDocumentPaths.map((documentPath) => ({
                key: documentPath,
                label: getDocumentLabel(documentPath),
                children: (
                  <div className="app-shell-doc-modal__preview" aria-label="当前页面文档内容">
                    <pre>{getDocumentContent(documentPath)}</pre>
                  </div>
                ),
              }))}
              onChange={setActiveDocumentPath}
            />
          ) : null}
        </Modal>
      </Layout>
    </Layout>
  );
}
