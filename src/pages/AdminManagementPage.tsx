import { Button, DatePicker, Form, Input, Select, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table/interface";
import { Download, Filter, Plus, RotateCcw, Upload } from "lucide-react";
import { SectionPanel } from "../components/SectionPanel";
import { TableActions } from "../components/TableActions";
import "./Page.css";
import "./standards/Standards.css";

export type AdminManagementPageKey =
  | "users"
  | "roles"
  | "positions"
  | "groups"
  | "roster"
  | "orgStructure";

type AdminRecordStatus = "启用" | "停用" | "待完善";

type AdminRecord = {
  id: string;
  name: string;
  owner: string;
  scope: string;
  status: AdminRecordStatus;
  updatedAt: string;
  description: string;
};

type AdminPageConfig = {
  title: string;
  description: string;
  directory: [string, string, string];
  primaryAction: string;
  keywordPlaceholder: string;
  rows: AdminRecord[];
};

const statusColor: Record<AdminRecordStatus, string> = {
  启用: "green",
  停用: "default",
  待完善: "gold",
};

const pageConfigs: Record<AdminManagementPageKey, AdminPageConfig> = {
  users: {
    title: "用户管理",
    description: "维护后台账号、登录状态和人员归属。",
    directory: ["OA", "系统管理", "用户管理"],
    primaryAction: "新增用户",
    keywordPlaceholder: "姓名、手机号、账号",
    rows: [
      {
        id: "USR-1001",
        name: "陈嘉",
        owner: "运营中心",
        scope: "后台管理员",
        status: "启用",
        updatedAt: "2026-04-29",
        description: "负责运营、仓储相关配置。",
      },
      {
        id: "USR-1002",
        name: "林珊",
        owner: "人事部",
        scope: "人事专员",
        status: "启用",
        updatedAt: "2026-04-28",
        description: "维护花名册与入转调离资料。",
      },
      {
        id: "USR-1003",
        name: "王越",
        owner: "供应链中心",
        scope: "只读访客",
        status: "停用",
        updatedAt: "2026-04-25",
        description: "外部协同账号，已暂停访问。",
      },
    ],
  },
  roles: {
    title: "角色管理",
    description: "维护权限角色、菜单范围和数据边界。",
    directory: ["OA", "系统管理", "角色管理"],
    primaryAction: "新增角色",
    keywordPlaceholder: "角色名称、权限范围",
    rows: [
      {
        id: "ROL-2001",
        name: "系统管理员",
        owner: "信息中心",
        scope: "全部菜单",
        status: "启用",
        updatedAt: "2026-04-27",
        description: "具备系统配置、组织和权限维护能力。",
      },
      {
        id: "ROL-2002",
        name: "人事管理员",
        owner: "人事部",
        scope: "人事管理",
        status: "启用",
        updatedAt: "2026-04-26",
        description: "可维护人员档案、岗位和组织架构。",
      },
      {
        id: "ROL-2003",
        name: "审计查看",
        owner: "风控部",
        scope: "只读范围",
        status: "待完善",
        updatedAt: "2026-04-22",
        description: "只读权限待补齐数据范围规则。",
      },
    ],
  },
  positions: {
    title: "岗位管理",
    description: "维护岗位编码、职级序列和任职归属。",
    directory: ["OA", "系统管理", "岗位管理"],
    primaryAction: "新增岗位",
    keywordPlaceholder: "岗位名称、岗位编码",
    rows: [
      {
        id: "POS-3001",
        name: "运营主管",
        owner: "运营中心",
        scope: "M2",
        status: "启用",
        updatedAt: "2026-04-26",
        description: "负责区域运营计划、巡检和异常闭环。",
      },
      {
        id: "POS-3002",
        name: "仓储专员",
        owner: "仓储中心",
        scope: "P2",
        status: "启用",
        updatedAt: "2026-04-24",
        description: "负责入库、出库、盘点和货位维护。",
      },
      {
        id: "POS-3003",
        name: "供应链计划",
        owner: "供应链中心",
        scope: "P3",
        status: "待完善",
        updatedAt: "2026-04-20",
        description: "岗位说明书待业务负责人确认。",
      },
    ],
  },
  groups: {
    title: "用户组",
    description: "按项目、部门和协作场景维护用户集合。",
    directory: ["OA", "系统管理", "用户组"],
    primaryAction: "新增用户组",
    keywordPlaceholder: "用户组名称、成员",
    rows: [
      {
        id: "GRP-4001",
        name: "华东运营组",
        owner: "运营中心",
        scope: "18 人",
        status: "启用",
        updatedAt: "2026-04-29",
        description: "覆盖华东门店运营、巡检和异常处理。",
      },
      {
        id: "GRP-4002",
        name: "仓储协同组",
        owner: "仓储中心",
        scope: "12 人",
        status: "启用",
        updatedAt: "2026-04-28",
        description: "用于库存盘点、调拨和补货协同。",
      },
      {
        id: "GRP-4003",
        name: "供应商接入组",
        owner: "供应链中心",
        scope: "7 人",
        status: "待完善",
        updatedAt: "2026-04-23",
        description: "供应商资料维护流程尚未绑定。",
      },
    ],
  },
  roster: {
    title: "花名册",
    description: "集中维护员工档案、部门、岗位和在职状态。",
    directory: ["OA", "人事管理", "花名册"],
    primaryAction: "新增员工",
    keywordPlaceholder: "姓名、工号、部门",
    rows: [
      {
        id: "EMP-5001",
        name: "陈嘉",
        owner: "运营中心",
        scope: "运营主管",
        status: "启用",
        updatedAt: "2026-04-29",
        description: "上海区域，正式员工。",
      },
      {
        id: "EMP-5002",
        name: "林珊",
        owner: "人事部",
        scope: "人事专员",
        status: "启用",
        updatedAt: "2026-04-29",
        description: "负责员工关系与档案维护。",
      },
      {
        id: "EMP-5003",
        name: "周霖",
        owner: "财务部",
        scope: "财务专员",
        status: "启用",
        updatedAt: "2026-04-27",
        description: "对接费用、薪资和成本核算。",
      },
    ],
  },
  orgStructure: {
    title: "组织架构",
    description: "维护组织层级、部门负责人和编制状态。",
    directory: ["OA", "人事管理", "组织架构"],
    primaryAction: "新增部门",
    keywordPlaceholder: "部门名称、负责人",
    rows: [
      {
        id: "ORG-6001",
        name: "运营中心",
        owner: "陈嘉",
        scope: "56 人",
        status: "启用",
        updatedAt: "2026-04-29",
        description: "负责门店运营、客服和现场交付。",
      },
      {
        id: "ORG-6002",
        name: "供应链中心",
        owner: "王越",
        scope: "34 人",
        status: "启用",
        updatedAt: "2026-04-28",
        description: "负责采购计划、供应商和履约协同。",
      },
      {
        id: "ORG-6003",
        name: "仓储中心",
        owner: "赵宁",
        scope: "42 人",
        status: "启用",
        updatedAt: "2026-04-26",
        description: "负责库存、库位、出入库和盘点。",
      },
    ],
  },
};

const columns: ColumnsType<AdminRecord> = [
  {
    title: "序号",
    key: "index",
    width: 70,
    fixed: "left",
    align: "center",
    render: (_value, _record, index) => index + 1,
  },
  { title: "编号", dataIndex: "id", key: "id", width: 130, fixed: "left" },
  { title: "名称", dataIndex: "name", key: "name", width: 160 },
  { title: "归属", dataIndex: "owner", key: "owner", width: 150 },
  { title: "范围", dataIndex: "scope", key: "scope", width: 140 },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
    width: 110,
    render: (status: AdminRecordStatus) => <Tag color={statusColor[status]}>{status}</Tag>,
  },
  { title: "更新日期", dataIndex: "updatedAt", key: "updatedAt", width: 130 },
  { title: "说明", dataIndex: "description", key: "description", minWidth: 260 },
  {
    title: "操作",
    key: "action",
    width: 120,
    fixed: "right",
    render: () => (
      <TableActions
        actions={[
          { key: "view", label: "查看" },
          { key: "edit", label: "编辑" },
          { key: "permission", label: "权限" },
          { key: "disable", label: "停用", danger: true },
        ]}
      />
    ),
  },
];

export function AdminManagementPage({ pageKey }: { pageKey: AdminManagementPageKey }) {
  const config = pageConfigs[pageKey];

  return (
    <main className="page">
      <section className="filter-panel standard-list-filter" aria-label={`${config.title}筛选区`}>
        <Form layout="inline">
          <Form.Item name="keyword">
            <Input allowClear placeholder={config.keywordPlaceholder} className="standard-list-filter__keyword" />
          </Form.Item>
          <Form.Item name="directory">
            <Select
              value={config.directory.join(" / ")}
              style={{ width: 220 }}
              options={[{ value: config.directory.join(" / "), label: config.directory.join(" / ") }]}
            />
          </Form.Item>
          <Form.Item name="status">
            <Select
              allowClear
              placeholder="全部状态"
              style={{ width: 140 }}
              options={[
                { value: "启用", label: "启用" },
                { value: "停用", label: "停用" },
                { value: "待完善", label: "待完善" },
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
                  {config.primaryAction}
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
          dataSource={config.rows}
          rowKey="id"
          scroll={{ x: 1120 }}
          pagination={{
            current: 1,
            pageSize: 10,
            total: config.rows.length,
            showSizeChanger: true,
          }}
        />
      </SectionPanel>
    </main>
  );
}
