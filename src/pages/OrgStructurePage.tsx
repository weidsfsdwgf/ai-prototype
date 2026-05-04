import { Button, Form, Input, Modal, Select, Space, Table, Tag, Tree } from "antd";
import type { ColumnsType } from "antd/es/table/interface";
import { Edit3, Filter, RotateCcw, Save } from "lucide-react";
import { useMemo, useState } from "react";
import { SectionPanel } from "../components/SectionPanel";
import { TableActions } from "../components/TableActions";
import { TreeListLayout } from "../components/TreeListLayout";
import {
  departmentNodes,
  departmentOptions,
  orgMembers,
  type DepartmentNode,
  type OrgMemberRecord,
  type OrgMemberStatus,
} from "../data/orgStructure";
import "./OrgStructurePage.css";
import "./Page.css";
import "./standards/Standards.css";

const statusColor: Record<OrgMemberStatus, string> = {
  在职: "green",
  试用期: "blue",
  待离职: "gold",
};

function findDepartment(nodes: DepartmentNode[], key: string): DepartmentNode | undefined {
  for (const node of nodes) {
    if (node.key === key) {
      return node;
    }

    const matched = node.children ? findDepartment(node.children, key) : undefined;

    if (matched) {
      return matched;
    }
  }

  return undefined;
}

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

let moveMemberDispatcher: (record: OrgMemberRecord) => void = () => undefined;

function openMoveMember(record: OrgMemberRecord) {
  moveMemberDispatcher(record);
}

const columns: ColumnsType<OrgMemberRecord> = [
  {
    title: "序号",
    key: "index",
    width: 70,
    fixed: "left",
    align: "center",
    render: (_value, _record, index) => index + 1,
  },
  { title: "员工编号", dataIndex: "employeeNo", key: "employeeNo", width: 130, fixed: "left" },
  { title: "姓名", dataIndex: "name", key: "name", width: 110 },
  { title: "区域", dataIndex: "area", key: "area", width: 100 },
  { title: "所在部门", dataIndex: "department", key: "department", width: 140 },
  { title: "主部门", dataIndex: "primaryDepartment", key: "primaryDepartment", width: 140 },
  { title: "岗位", dataIndex: "position", key: "position", width: 140 },
  { title: "直属上级", dataIndex: "leader", key: "leader", width: 120 },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
    width: 100,
    render: (status: OrgMemberStatus) => <Tag color={statusColor[status]}>{status}</Tag>,
  },
  { title: "更新时间", dataIndex: "updatedAt", key: "updatedAt", width: 170 },
  {
    title: "操作",
    key: "action",
    width: 120,
    fixed: "right",
    render: (_, record) => (
      <TableActions actions={[{ key: "move", label: "调整部门", onClick: () => openMoveMember(record) }]} />
    ),
  },
];

export function OrgStructurePage() {
  const [selectedDepartmentKey, setSelectedDepartmentKey] = useState("las");
  const [departmentKeyword, setDepartmentKeyword] = useState("");
  const [departmentModalOpen, setDepartmentModalOpen] = useState(false);
  const [moveMember, setMoveMember] = useState<OrgMemberRecord>();
  const selectedDepartment = useMemo(
    () => findDepartment(departmentNodes, selectedDepartmentKey) ?? departmentNodes[0],
    [selectedDepartmentKey],
  );
  const filteredDepartmentNodes = useMemo(
    () => filterDepartmentTree(departmentNodes, departmentKeyword),
    [departmentKeyword],
  );

  moveMemberDispatcher = setMoveMember;

  return (
    <main className="page">
      <TreeListLayout
        className="org-structure-layout"
        sidebarWidth={280}
        tree={
          <SectionPanel
            title="部门树"
            actions={
              <Button icon={<Edit3 size={16} />} onClick={() => setDepartmentModalOpen(true)}>
                修改部门信息
              </Button>
            }
          >
            <Input.Search
              allowClear
              placeholder="搜索部门"
              className="tree-list-search org-tree-search"
              value={departmentKeyword}
              onChange={(event) => setDepartmentKeyword(event.target.value)}
              onSearch={setDepartmentKeyword}
            />
            <Tree
              blockNode
              defaultExpandAll
              selectedKeys={[selectedDepartmentKey]}
              treeData={filteredDepartmentNodes}
              onSelect={(keys) => {
                const nextKey = keys[0];

                if (typeof nextKey === "string") {
                  setSelectedDepartmentKey(nextKey);
                }
              }}
            />
            <div className="tree-list-summary org-tree-summary">
              <dl>
                <div>
                  <dt>部门编码</dt>
                  <dd>{selectedDepartment.code}</dd>
                </div>
                <div>
                  <dt>上级部门</dt>
                  <dd>{selectedDepartment.parentName}</dd>
                </div>
                <div>
                  <dt>负责人</dt>
                  <dd>{selectedDepartment.leader}</dd>
                </div>
                <div>
                  <dt>成员数</dt>
                  <dd>{selectedDepartment.memberCount}</dd>
                </div>
              </dl>
            </div>
          </SectionPanel>
        }
      >
          <section className="filter-panel standard-list-filter" aria-label="组织架构人员筛选区">
            <Form layout="inline">
              <Form.Item name="keyword">
                <Input allowClear placeholder="姓名、员工编号" className="standard-list-filter__keyword" />
              </Form.Item>
              <Form.Item name="department">
                <Select
                  allowClear
                  placeholder="部门"
                  style={{ width: 140 }}
                  options={departmentOptions.map((department) => ({ value: department, label: department }))}
                />
              </Form.Item>
              <Form.Item name="status">
                <Select
                  allowClear
                  placeholder="状态"
                  style={{ width: 120 }}
                  options={[
                    { value: "在职", label: "在职" },
                    { value: "试用期", label: "试用期" },
                    { value: "待离职", label: "待离职" },
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
                </div>
              </Form.Item>
            </Form>
          </section>
          <SectionPanel>
            <Table
              columns={columns}
              dataSource={orgMembers}
              pagination={{ current: 1, pageSize: 10, total: orgMembers.length, showSizeChanger: true }}
              rowKey="id"
              scroll={{ x: 1340 }}
            />
          </SectionPanel>
      </TreeListLayout>
      <Modal
        title="修改部门信息"
        open={departmentModalOpen}
        onCancel={() => setDepartmentModalOpen(false)}
        onOk={() => setDepartmentModalOpen(false)}
        okText="保存"
        okButtonProps={{ icon: <Save size={16} /> }}
      >
        <Form
          layout="vertical"
          initialValues={{
            code: selectedDepartment.code,
            title: selectedDepartment.title,
            parentName: selectedDepartment.parentName,
            leader: selectedDepartment.leader,
            status: selectedDepartment.status,
          }}
        >
          <Form.Item label="部门编码" name="code">
            <Input disabled />
          </Form.Item>
          <Form.Item label="部门名称" name="title" rules={[{ required: true, message: "请输入部门名称" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="上级部门" name="parentName">
            <Select
              options={["LAS 集团", "成都", "深圳", "厦门"].map((department) => ({
                value: department,
                label: department,
              }))}
            />
          </Form.Item>
          <Form.Item label="负责人" name="leader">
            <Select
              options={["陈嘉", "林珊", "周霖", "赵宁", "许佳", "王越"].map((leader) => ({
                value: leader,
                label: leader,
              }))}
            />
          </Form.Item>
          <Form.Item label="状态" name="status">
            <Select
              options={[
                { value: "启用", label: "启用" },
                { value: "停用", label: "停用" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="调整人员所在部门"
        open={Boolean(moveMember)}
        onCancel={() => setMoveMember(undefined)}
        onOk={() => setMoveMember(undefined)}
        okText="确认调整"
      >
        <Form
          layout="vertical"
          initialValues={{
            name: moveMember?.name,
            currentDepartment: moveMember?.department,
            targetDepartment: moveMember?.department,
            primaryDepartment: moveMember?.primaryDepartment,
          }}
        >
          <Form.Item label="员工姓名" name="name">
            <Input disabled />
          </Form.Item>
          <Form.Item label="当前部门" name="currentDepartment">
            <Input disabled />
          </Form.Item>
          <Form.Item label="调整后部门" name="targetDepartment" rules={[{ required: true, message: "请选择调整后部门" }]}>
            <Select options={departmentOptions.map((department) => ({ value: department, label: department }))} />
          </Form.Item>
          <Form.Item label="主部门" name="primaryDepartment">
            <Select options={departmentOptions.map((department) => ({ value: department, label: department }))} />
          </Form.Item>
        </Form>
      </Modal>
    </main>
  );
}
