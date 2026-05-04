import { Button, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MetricCard } from "../../components/MetricCard";
import { PageHeader } from "../../components/PageHeader";
import { SectionPanel } from "../../components/SectionPanel";
import { standardPages } from "../../data/frameworkPages";
import "../Page.css";
import "./Standards.css";

type StandardPageRecord = (typeof standardPages)[number];

const columns: ColumnsType<StandardPageRecord> = [
  { title: "页面类型", dataIndex: "type", key: "type", width: 150 },
  { title: "覆盖对象", dataIndex: "owner", key: "owner", width: 160 },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
    width: 120,
    render: (value: string) => <Tag color="green">{value}</Tag>,
  },
  {
    title: "路由",
    dataIndex: "route",
    key: "route",
  },
];

export function StandardsOverviewPage() {
  const navigate = useNavigate();

  return (
    <main className="page">
      <PageHeader
        title="页面标准总览"
        description="后台基础页面骨架、组件密度和交互边界。"
        actions={
          <Button type="primary" icon={<ArrowRight size={16} />} onClick={() => navigate("/standards/list")}>
            查看列表框架
          </Button>
        }
      />
      <section className="metric-grid" aria-label="页面标准覆盖">
        <MetricCard label="框架页面" value="7" change="基础类型已覆盖" status="healthy" />
        <MetricCard label="公共区块" value="4" change="标题、筛选、表格、状态" status="healthy" />
        <MetricCard label="标准动作" value="12" change="查询、导出、新建、审批" status="healthy" />
        <MetricCard label="待扩展" value="3" change="权限、国际化、审计" status="warning" />
      </section>
      <SectionPanel title="框架页面">
        <Table
          columns={columns}
          dataSource={standardPages}
          pagination={false}
          rowKey="route"
          scroll={{ x: 720 }}
          onRow={(record) => ({
            onClick: () => navigate(record.route),
          })}
        />
      </SectionPanel>
    </main>
  );
}
