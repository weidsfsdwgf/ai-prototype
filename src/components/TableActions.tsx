import { Button, Dropdown, Space, type MenuProps } from "antd";
import { ChevronDown } from "lucide-react";
import "./TableActions.css";

export type TableActionItem = {
  key: string;
  label: string;
  danger?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

type TableActionsProps = {
  actions: TableActionItem[];
  maxVisible?: number;
};

export function TableActions({ actions, maxVisible = 1 }: TableActionsProps) {
  const shouldFold = actions.length >= 2;
  const visibleActions = shouldFold ? actions.slice(0, maxVisible) : actions;
  const foldedActions = shouldFold ? actions.slice(maxVisible) : [];
  const menuItems: MenuProps["items"] = foldedActions.map((action) => ({
    key: action.key,
    label: action.label,
    danger: action.danger,
    disabled: action.disabled,
  }));

  return (
    <Space size={0} className="table-actions">
      {visibleActions.map((action) => (
        <Button
          key={action.key}
          danger={action.danger}
          disabled={action.disabled}
          onClick={action.onClick}
          type="link"
        >
          {action.label}
        </Button>
      ))}
      {foldedActions.length > 0 ? (
        <Dropdown
          menu={{
            items: menuItems,
            onClick: ({ key }) => foldedActions.find((action) => action.key === key)?.onClick?.(),
          }}
          trigger={["click"]}
        >
          <Button className="table-actions__more" type="link">
            <span>更多</span>
            <ChevronDown size={14} />
          </Button>
        </Dropdown>
      ) : null}
    </Space>
  );
}
