import { Button, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ArrowRight, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MetricCard } from "../components/MetricCard";
import { PageHeader } from "../components/PageHeader";
import { SectionPanel } from "../components/SectionPanel";
import type { Metric } from "../data/dashboard";
import { standardPages } from "../data/frameworkPages";
import { productMenuDocs, type ProductMenuDoc } from "../data/productDocs";
import "./Page.css";

type ModuleRow = {
  system: string;
  directories: string;
  menus: string;
  owner: string;
  status: "已接入" | "规划中";
};
type StandardPageRow = (typeof standardPages)[number];

const overviewMetrics: Metric[] = [
  { label: "已规划系统", value: "4", change: "人事、供应链、运营、仓储", status: "healthy" },
  { label: "首批目录", value: "5", change: "OA 基础目录", status: "healthy" },
  { label: "首批菜单", value: "16", change: "系统、人事、绩效、审批、资产", status: "healthy" },
  { label: "待接入模块", value: "3", change: "供应链、运营、仓储", status: "warning" },
];

const moduleRows: ModuleRow[] = [
  {
    system: "OA",
    directories: "系统管理、人事管理、绩效管理、审批管理、资产管理",
    menus: "用户管理、角色管理、岗位管理、用户组、花名册、组织架构、转正管理、离职管理、绩效管理、评分表配置、指标库、OA申请、审批办理、我发起的、待办任务、低值易耗品",
    owner: "信息中心",
    status: "已接入",
  },
  {
    system: "供应链",
    directories: "采购、供应商、履约",
    menus: "待规划",
    owner: "供应链中心",
    status: "规划中",
  },
  {
    system: "运营",
    directories: "门店、巡检、工单",
    menus: "待规划",
    owner: "运营中心",
    status: "规划中",
  },
  {
    system: "仓储",
    directories: "库存、库位、出入库",
    menus: "待规划",
    owner: "仓储中心",
    status: "规划中",
  },
];

const columns: ColumnsType<ModuleRow> = [
  { title: "系统", dataIndex: "system", key: "system", width: 120 },
  { title: "目录", dataIndex: "directories", key: "directories", width: 220 },
  { title: "菜单", dataIndex: "menus", key: "menus", minWidth: 320 },
  { title: "负责人", dataIndex: "owner", key: "owner", width: 140 },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
    width: 120,
    render: (status: ModuleRow["status"]) => (
      <Tag color={status === "已接入" ? "green" : "gold"}>{status}</Tag>
    ),
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const standardColumns: ColumnsType<StandardPageRow> = [
    { title: "框架页面", dataIndex: "type", key: "type", width: 150 },
    { title: "覆盖对象", dataIndex: "owner", key: "owner", width: 160 },
    { title: "路由", dataIndex: "route", key: "route", minWidth: 240 },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 110,
      render: (status: string) => <Tag color="green">{status}</Tag>,
    },
    {
      title: "操作",
      key: "action",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Button
          type="link"
          onClick={(event) => {
            event.stopPropagation();
            navigate(record.route);
          }}
        >
          打开
        </Button>
      ),
    },
  ];
  const productDocColumns: ColumnsType<ProductMenuDoc> = [
    { title: "菜单", dataIndex: "menu", key: "menu", width: 130 },
    { title: "路由", dataIndex: "route", key: "route", width: 210 },
    { title: "产品文档", dataIndex: "documentPath", key: "documentPath", minWidth: 320 },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: ProductMenuDoc["status"]) => (
        <Tag color={status === "持续迭代" ? "blue" : "green"}>{status}</Tag>
      ),
    },
    { title: "更新日期", dataIndex: "updatedAt", key: "updatedAt", width: 130 },
  ];

  return (
    <main className="page">
      <PageHeader
        title="展示首页"
        description="人事、供应链、运营、仓储的一体化后台总览。"
        actions={
          <>
            <Button icon={<RefreshCw size={16} />}>刷新</Button>
            <Button type="primary" icon={<ArrowRight size={16} />} onClick={() => navigate("/oa/system/users")}>
              进入用户管理
            </Button>
          </>
        }
      />
      <section className="metric-grid" aria-label="系统概览">
        {overviewMetrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>
      <SectionPanel title="系统接入概览">
        <Table
          columns={columns}
          dataSource={moduleRows}
          pagination={false}
          rowKey="system"
          scroll={{ x: 920 }}
        />
      </SectionPanel>
      <SectionPanel title="框架页面入口" description="保留原有页面标准，开发新页面前先查看对应框架。">
        <Table
          columns={standardColumns}
          dataSource={standardPages}
          pagination={false}
          rowKey="route"
          scroll={{ x: 780 }}
          onRow={(record) => ({
            onClick: () => navigate(record.route),
          })}
        />
      </SectionPanel>
      <SectionPanel title="菜单产品文档" description="每个菜单对应一份可持续迭代的产品文档。">
        <Table
          columns={productDocColumns}
          dataSource={productMenuDocs}
          pagination={false}
          rowKey="route"
          scroll={{ x: 910 }}
        />
      </SectionPanel>
    </main>
  );
}
