import { Button, Form, Input, Modal, Popover, Select, Space, Table, Tag, Tooltip, Tree } from "antd";
import type { ColumnsType } from "antd/es/table/interface";
import { Filter, MoreHorizontal, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState, type Key, type ReactNode } from "react";
import { SectionPanel } from "../../components/SectionPanel";
import { TableActions } from "../../components/TableActions";
import { TreeListLayout } from "../../components/TreeListLayout";
import { customerRecords, type CustomerRecord, type CustomerStage } from "../../data/frameworkPages";
import "../Page.css";
import "./Standards.css";

type FrameworkTreeRecord = {
  key: string;
  name: string;
  children?: FrameworkTreeRecord[];
};

type FrameworkTreeNode = {
  key: string;
  title: ReactNode;
  children?: FrameworkTreeNode[];
};

type TreeModalState =
  | { mode: "create"; parentKey: string }
  | { mode: "edit"; key: string; initialName: string };

const rootTreeKey = "all";

const initialTreeRecords: FrameworkTreeRecord[] = [
  {
    name: "全部客户",
    key: rootTreeKey,
    children: [
      { name: "重点客户", key: "important" },
      { name: "潜在客户", key: "potential" },
      { name: "风险客户", key: "risk" },
    ],
  },
];

const stageColor: Record<CustomerStage, string> = {
  新增: "default",
  跟进中: "blue",
  已签约: "green",
  风险: "red",
};

const columns: ColumnsType<CustomerRecord> = [
  {
    title: "序号",
    key: "index",
    width: 70,
    fixed: "left",
    align: "center",
    render: (_value, _record, index) => index + 1,
  },
  { title: "客户编号", dataIndex: "id", key: "id", width: 140, fixed: "left" },
  { title: "客户名称", dataIndex: "name", key: "name", width: 240 },
  { title: "行业", dataIndex: "industry", key: "industry", width: 130 },
  { title: "负责人", dataIndex: "owner", key: "owner", width: 110 },
  {
    title: "阶段",
    dataIndex: "stage",
    key: "stage",
    width: 110,
    render: (stage: CustomerStage) => <Tag color={stageColor[stage]}>{stage}</Tag>,
  },
  { title: "更新时间", dataIndex: "updatedAt", key: "updatedAt", width: 170 },
  {
    title: "操作",
    key: "action",
    width: 120,
    fixed: "right",
    render: () => <TableActions actions={[{ key: "view", label: "查看" }, { key: "edit", label: "编辑" }]} />,
  },
];

function makeNodeKey() {
  return `node-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function collectTreeKeys(nodes: FrameworkTreeRecord[]): string[] {
  return nodes.flatMap((node) => [node.key, ...collectTreeKeys(node.children ?? [])]);
}

function filterTreeRecords(nodes: FrameworkTreeRecord[], keyword: string): FrameworkTreeRecord[] {
  const normalizedKeyword = keyword.trim();

  if (!normalizedKeyword) {
    return nodes;
  }

  const matchedNodes: FrameworkTreeRecord[] = [];

  nodes.forEach((node) => {
    const children = filterTreeRecords(node.children ?? [], normalizedKeyword);

    if (node.name.includes(normalizedKeyword) || children.length > 0) {
      matchedNodes.push({
        ...node,
        children: children.length > 0 ? children : undefined,
      });
    }
  });

  return matchedNodes;
}

function addTreeNode(
  nodes: FrameworkTreeRecord[],
  parentKey: string,
  newNode: FrameworkTreeRecord,
): FrameworkTreeRecord[] {
  return nodes.map((node) => {
    if (node.key === parentKey) {
      return {
        ...node,
        children: [...(node.children ?? []), newNode],
      };
    }

    return {
      ...node,
      children: node.children ? addTreeNode(node.children, parentKey, newNode) : undefined,
    };
  });
}

function renameTreeNode(nodes: FrameworkTreeRecord[], key: string, name: string): FrameworkTreeRecord[] {
  return nodes.map((node) => {
    if (node.key === key) {
      return { ...node, name };
    }

    return {
      ...node,
      children: node.children ? renameTreeNode(node.children, key, name) : undefined,
    };
  });
}

function deleteTreeNode(nodes: FrameworkTreeRecord[], key: string): FrameworkTreeRecord[] {
  return nodes
    .filter((node) => node.key !== key)
    .map((node) => ({
      ...node,
      children: node.children ? deleteTreeNode(node.children, key) : undefined,
    }));
}

export function StandardTreeListPage() {
  const [treeRecords, setTreeRecords] = useState<FrameworkTreeRecord[]>(initialTreeRecords);
  const [selectedKey, setSelectedKey] = useState(rootTreeKey);
  const [expandedKeys, setExpandedKeys] = useState<Key[]>(collectTreeKeys(initialTreeRecords));
  const [treeKeyword, setTreeKeyword] = useState("");
  const [treeModalState, setTreeModalState] = useState<TreeModalState>();
  const [nodeForm] = Form.useForm<{ name: string }>();
  const filteredTreeRecords = useMemo(
    () => filterTreeRecords(treeRecords, treeKeyword),
    [treeKeyword, treeRecords],
  );

  useEffect(() => {
    if (treeKeyword.trim()) {
      setExpandedKeys(collectTreeKeys(filteredTreeRecords));
    }
  }, [filteredTreeRecords, treeKeyword]);

  useEffect(() => {
    if (treeModalState) {
      nodeForm.setFieldsValue({
        name: treeModalState.mode === "edit" ? treeModalState.initialName : "",
      });
    }
  }, [nodeForm, treeModalState]);

  const openCreateNode = (parentKey: string) => {
    setTreeModalState({ mode: "create", parentKey });
  };

  const openEditNode = (node: FrameworkTreeRecord) => {
    setTreeModalState({ mode: "edit", key: node.key, initialName: node.name });
  };

  const confirmDeleteNode = (node: FrameworkTreeRecord) => {
    Modal.confirm({
      title: "删除节点",
      content: `确认删除“${node.name}”及其下级节点？`,
      okText: "确认删除",
      okButtonProps: { danger: true },
      cancelText: "取消",
      onOk: () => {
        setTreeRecords((currentRecords) => deleteTreeNode(currentRecords, node.key));

        if (selectedKey === node.key) {
          setSelectedKey(rootTreeKey);
        }
      },
    });
  };

  const saveTreeNode = async () => {
    if (!treeModalState) {
      return;
    }

    const values = await nodeForm.validateFields();
    const name = values.name.trim();

    if (treeModalState.mode === "create") {
      const newNode = { key: makeNodeKey(), name };
      setTreeRecords((currentRecords) => addTreeNode(currentRecords, treeModalState.parentKey, newNode));
      setExpandedKeys((currentKeys) => Array.from(new Set([...currentKeys, treeModalState.parentKey])));
      setTreeModalState(undefined);
      return;
    }

    setTreeRecords((currentRecords) => renameTreeNode(currentRecords, treeModalState.key, name));
    setTreeModalState(undefined);
  };

  const renderNodeMenu = (node: FrameworkTreeRecord) => (
    <div className="standard-tree-node-menu">
      <Button icon={<Plus size={15} />} type="text" onClick={() => openCreateNode(node.key)}>
        新增下级节点
      </Button>
      <Button icon={<Pencil size={15} />} type="text" onClick={() => openEditNode(node)}>
        编辑节点
      </Button>
      <Button danger icon={<Trash2 size={15} />} type="text" onClick={() => confirmDeleteNode(node)}>
        删除节点
      </Button>
    </div>
  );

  const renderNodeTitle = (node: FrameworkTreeRecord) => {
    const isRoot = node.key === rootTreeKey;

    return (
      <div className="standard-tree-node-title">
        <span className="standard-tree-node-title__label">{node.name}</span>
        <span className="standard-tree-node-title__actions">
          {isRoot ? (
            <Tooltip title="新增下级节点">
              <Button
                aria-label="新增下级节点"
                icon={<Plus size={15} />}
                size="small"
                type="text"
                onClick={(event) => {
                  event.stopPropagation();
                  openCreateNode(node.key);
                }}
              />
            </Tooltip>
          ) : (
            <Popover content={renderNodeMenu(node)} placement="rightTop" trigger="click">
              <Tooltip title="节点操作">
                <Button
                  aria-label={`${node.name}节点操作`}
                  icon={<MoreHorizontal size={15} />}
                  size="small"
                  type="text"
                  onClick={(event) => event.stopPropagation()}
                />
              </Tooltip>
            </Popover>
          )}
        </span>
      </div>
    );
  };

  const buildTreeData = (nodes: FrameworkTreeRecord[]): FrameworkTreeNode[] =>
    nodes.map((node) => ({
      key: node.key,
      title: renderNodeTitle(node),
      children: node.children?.length ? buildTreeData(node.children) : undefined,
    }));

  return (
    <main className="page">
      <TreeListLayout
        sidebarWidth={280}
        tree={
          <SectionPanel title="对象树">
            <Input.Search
              allowClear
              className="tree-list-search"
              placeholder="搜索节点"
              value={treeKeyword}
              onChange={(event) => setTreeKeyword(event.target.value)}
              onSearch={setTreeKeyword}
            />
            <Tree
              blockNode
              expandedKeys={expandedKeys}
              selectedKeys={[selectedKey]}
              showLine
              treeData={buildTreeData(filteredTreeRecords)}
              onExpand={(keys) => setExpandedKeys(keys)}
              onSelect={(keys) => setSelectedKey(String(keys[0] ?? rootTreeKey))}
            />
          </SectionPanel>
        }
      >
        <section className="filter-panel standard-list-filter" aria-label="左树右表筛选区">
          <Form layout="inline">
            <Form.Item>
              <Input allowClear placeholder="编号、名称" className="standard-list-filter__keyword" />
            </Form.Item>
            <Form.Item>
              <Select
                allowClear
                placeholder="阶段"
                style={{ width: 140 }}
                options={[
                  { value: "新增", label: "新增" },
                  { value: "跟进中", label: "跟进中" },
                  { value: "已签约", label: "已签约" },
                  { value: "风险", label: "风险" },
                ]}
              />
            </Form.Item>
            <Form.Item className="standard-list-filter__actions">
              <div className="standard-list-filter__action-row">
                <Space wrap className="standard-list-filter__query-actions">
                  <Button type="primary" icon={<Filter size={16} />}>
                    查询
                  </Button>
                  <Button icon={<RotateCcw size={16} />}>重置</Button>
                </Space>
                <Space wrap className="standard-list-filter__business-actions">
                  <Button className="standard-list-filter__create-action" icon={<Plus size={16} />}>
                    新建
                  </Button>
                </Space>
              </div>
            </Form.Item>
          </Form>
        </section>
        <SectionPanel>
          <Table
            columns={columns}
            dataSource={customerRecords}
            pagination={{ current: 1, pageSize: 10, total: customerRecords.length, showSizeChanger: true }}
            rowKey="id"
            scroll={{ x: 1090 }}
          />
        </SectionPanel>
      </TreeListLayout>
      <Modal
        destroyOnClose
        okText="保存"
        onCancel={() => setTreeModalState(undefined)}
        onOk={saveTreeNode}
        open={Boolean(treeModalState)}
        title={treeModalState?.mode === "edit" ? "编辑节点" : "新增节点"}
      >
        <Form form={nodeForm} layout="vertical">
          <Form.Item label="节点名称" name="name" rules={[{ required: true, message: "请输入节点名称" }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </main>
  );
}
