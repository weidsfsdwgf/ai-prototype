import { Button, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { CalendarDays, Plus } from "lucide-react";
import { MetricCard } from "../components/MetricCard";
import { PageHeader } from "../components/PageHeader";
import { metrics, workItems, type WorkItem } from "../data/dashboard";
import "./Page.css";

const columns: ColumnsType<WorkItem> = [
  {
    title: "事项",
    dataIndex: "title",
    key: "title",
  },
  {
    title: "负责人",
    dataIndex: "owner",
    key: "owner",
    width: 120,
  },
  {
    title: "截止时间",
    dataIndex: "deadline",
    key: "deadline",
    width: 140,
  },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
    width: 120,
    render: (value: WorkItem["status"]) => {
      const color = value === "已完成" ? "green" : value === "待处理" ? "gold" : "blue";
      return <Tag color={color}>{value}</Tag>;
    },
  },
];

export function DashboardPage() {
  return (
    <main className="page">
      <PageHeader
        title="经营工作台"
        description="今日关键指标、待办事项和风险提醒。"
        actions={
          <>
            <Button icon={<CalendarDays size={16} />}>本月</Button>
            <Button type="primary" icon={<Plus size={16} />}>
              新建事项
            </Button>
          </>
        }
      />
      <section className="metric-grid" aria-label="核心指标">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>
      <section className="panel">
        <div className="panel__header">
          <h2>重点待办</h2>
          <Button type="link">查看全部</Button>
        </div>
        <Table
          columns={columns}
          dataSource={workItems}
          pagination={false}
          rowKey="title"
          scroll={{ x: 680 }}
        />
      </section>
    </main>
  );
}
