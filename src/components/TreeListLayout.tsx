import type { CSSProperties, ReactNode } from "react";
import "./TreeListLayout.css";

type TreeListLayoutProps = {
  tree: ReactNode;
  children: ReactNode;
  sidebarWidth?: number;
  className?: string;
  treeClassName?: string;
  listClassName?: string;
};

export function TreeListLayout({
  tree,
  children,
  sidebarWidth = 280,
  className,
  treeClassName,
  listClassName,
}: TreeListLayoutProps) {
  return (
    <div
      className={["tree-list-layout", className].filter(Boolean).join(" ")}
      style={{ "--tree-list-sidebar-width": `${sidebarWidth}px` } as CSSProperties}
    >
      <aside className={["tree-list-layout__tree", treeClassName].filter(Boolean).join(" ")}>
        {tree}
      </aside>
      <div className={["tree-list-layout__list", listClassName].filter(Boolean).join(" ")}>
        {children}
      </div>
    </div>
  );
}
