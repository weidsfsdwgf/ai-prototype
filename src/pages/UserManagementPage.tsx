import { Button, DatePicker, Form, Input, Select, Space, Table, Tag, Tree } from "antd";
import type { ColumnsType } from "antd/es/table/interface";
import { Download, Filter, Plus, RotateCcw, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { SectionPanel } from "../components/SectionPanel";
import { TableActions } from "../components/TableActions";
import { TreeListLayout } from "../components/TreeListLayout";
import {
  departmentTree,
  type DepartmentNode,
  userRecords,
  type UserRecord,
  type UserStatus,
} from "../data/userManagement";
import "./Page.css";
import "./standards/Standards.css";
import "./UserManagementPage.css";

const statusColor: Record<UserStatus, string> = {
  启用: "green",
  停用: "default",
  锁定: "red",
};

function filterDepartmentTree(nodes: DepartmentNode[], keyword: string): DepartmentNode[] {
  const normalizedKeyword = keyword.trim();

  if (!normalizedKeyword) {
    return nodes;
  }

  const matchedNodes: DepartmentNode[] = [];

  nodes.forEach((node) => {
    const children = filterDepartmentTree(node.children ?? [], normalizedKeyword);

    if (node.title.includes(normalizedKeyword) || children.length > 0) {
      matchedNodes.push({
        ...node,
        children: children.length > 0 ? children : undefined,
      });
    }
  });

  return matchedNodes;
}

const columns: ColumnsType<UserRecord> = [
  {
    title: "序号",
    key: "index",
    width: 70,
    fixed: "left",
    align: "center",
    render: (_value, _record, index) => index + 1,
  },
  { title: "区域", dataIndex: "area", key: "area", width: 120, fixed: "left" },
  {
    title: "用户账号",
    dataIndex: "account",
    key: "account",
    width: 150,
  },
  { title: "用户姓名", dataIndex: "name", key: "name", width: 160 },
  { title: "部门", dataIndex: "department", key: "department", width: 140 },
  { title: "角色", dataIndex: "role", key: "role", width: 150 },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
    width: 100,
    render: (status: UserStatus) => <Tag color={statusColor[status]}>{status}</Tag>,
  },
  { title: "创建者", dataIndex: "creator", key: "creator", width: 130 },
  { title: "更新者", dataIndex: "updater", key: "updater", width: 130 },
  { title: "创建时间", dataIndex: "createdAt", key: "createdAt", width: 170 },
  { title: "更新时间", dataIndex: "updatedAt", key: "updatedAt", width: 170 },
  {
    title: "操作",
    key: "action",
    width: 120,
    fixed: "right",
    render: () => (
      <TableActions
        actions={[
          { key: "edit", label: "编辑" },
          { key: "assign-role", label: "分配角色" },
          { key: "menu-permission", label: "菜单权限" },
          { key: "data-permission", label: "数据权限" },
          { key: "reset-password", label: "重置密码" },
        ]}
      />
    ),
  },
];

export function UserManagementPage() {
  const [selectedDepartmentKey, setSelectedDepartmentKey] = useState("las");
  const [departmentKeyword, setDepartmentKeyword] = useState("");
  const filteredDepartmentTree = useMemo(
    () => filterDepartmentTree(departmentTree, departmentKeyword),
    [departmentKeyword],
  );

  return (
    <main className="page">
      <TreeListLayout
        className="user-management-layout"
        sidebarWidth={260}
        tree={
          <SectionPanel title="部门树">
            <Input.Search
              allowClear
              placeholder="搜索部门"
              className="tree-list-search department-tree-search"
              value={departmentKeyword}
              onChange={(event) => setDepartmentKeyword(event.target.value)}
              onSearch={setDepartmentKeyword}
            />
            <Tree
              blockNode
              defaultExpandAll
              selectedKeys={[selectedDepartmentKey]}
              treeData={filteredDepartmentTree}
              onSelect={(keys) => {
                const nextKey = keys[0];

                if (typeof nextKey === "string") {
                  setSelectedDepartmentKey(nextKey);
                }
              }}
            />
          </SectionPanel>
        }
      >
          <section className="filter-panel standard-list-filter" aria-label="用户管理筛选区">
            <Form layout="inline">
              <Form.Item name="keyword">
                <Input allowClear placeholder="用户账号、用户姓名" className="standard-list-filter__keyword" />
              </Form.Item>
              <Form.Item name="area">
                <Select
                  allowClear
                  placeholder="区域"
                  style={{ width: 140 }}
                  options={[
                    { value: "成都", label: "成都" },
                    { value: "深圳", label: "深圳" },
                    { value: "厦门", label: "厦门" },
                  ]}
                />
              </Form.Item>
              <Form.Item name="accountType">
                <Select
                  allowClear
                  placeholder="账号类型"
                  style={{ width: 140 }}
                  options={[
                    { value: "正式账号", label: "正式账号" },
                    { value: "代管账号", label: "代管账号" },
                    { value: "其他账号", label: "其他账号" },
                  ]}
                />
              </Form.Item>
              <Form.Item name="status">
                <Select
                  allowClear
                  placeholder="状态"
                  style={{ width: 120 }}
                  options={[
                    { value: "启用", label: "启用" },
                    { value: "停用", label: "停用" },
                    { value: "锁定", label: "锁定" },
                  ]}
                />
              </Form.Item>
              <Form.Item name="updatedAt">
                <DatePicker.RangePicker placeholder={["更新开始", "更新结束"]} />
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
                      新增用户
                    </Button>
                    <Button className="standard-list-filter__utility-action" icon={<Upload size={16} />}>
                      导入
                    </Button>
                    <Button className="standard-list-filter__utility-action" icon={<Download size={16} />}>
                      导出
                    </Button>
                  </Space>
                </div>
              </Form.Item>
            </Form>
          </section>
          <SectionPanel>
            <Table
              columns={columns}
              dataSource={userRecords}
              pagination={{ current: 1, pageSize: 10, total: userRecords.length, showSizeChanger: true }}
              rowKey="id"
              scroll={{ x: 1710 }}
            />
          </SectionPanel>
      </TreeListLayout>
    </main>
  );
}
