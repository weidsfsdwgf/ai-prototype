import { Button, Descriptions, Progress, Space, Table, Tabs, Tag, Timeline } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Edit3, MoreHorizontal, Plus } from "lucide-react";
import { MetricCard } from "../../components/MetricCard";
import { PageHeader } from "../../components/PageHeader";
import { SectionPanel } from "../../components/SectionPanel";
import { contractRecords, customerFacts, followActivities } from "../../data/frameworkPages";
import "../Page.css";
import "./Standards.css";

type ContractRecord = (typeof contractRecords)[number];

const amountFormatter = new Intl.NumberFormat("zh-CN", {
  style: "currency",
  currency: "CNY",
  maximumFractionDigits: 0,
});

const contractColumns: ColumnsType<ContractRecord> = [
  { title: "合同编号", dataIndex: "id", key: "id", width: 150 },
  { title: "合同名称", dataIndex: "name", key: "name" },
  {
    title: "金额",
    dataIndex: "amount",
    key: "amount",
    width: 140,
    align: "right",
    render: (value: number) => amountFormatter.format(value),
  },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
    width: 110,
    render: (value: string) => <Tag color={value === "履行中" ? "blue" : "default"}>{value}</Tag>,
  },
];

export function StandardDetailPage() {
  return (
    <main className="page">
      <PageHeader
        title="杭州启明供应链有限公司"
        description="客户详情页的基础结构：对象摘要、关键指标、关联数据和侧栏动态。"
        actions={
          <>
            <Button icon={<MoreHorizontal size={16} />} aria-label="更多操作" />
            <Button icon={<Edit3 size={16} />}>编辑</Button>
            <Button type="primary" icon={<Plus size={16} />}>
              新建跟进
            </Button>
          </>
        }
      />
      <section className="metric-grid" aria-label="客户指标">
        <MetricCard label="累计合同额" value="¥ 1,096,000" change="+18.6%" status="healthy" />
        <MetricCard label="未回款金额" value="¥ 126,000" change="本月到期" status="warning" />
        <MetricCard label="商机数量" value="4" change="2 项推进中" status="healthy" />
        <MetricCard label="风险事项" value="1" change="资料待补齐" status="risk" />
      </section>
      <div className="detail-layout">
        <div className="detail-layout__main">
          <SectionPanel title="基础信息">
            <Descriptions
              bordered
              column={{ xs: 1, sm: 2, xl: 3 }}
              items={customerFacts.map((item) => ({
                key: item.label,
                label: item.label,
                children: item.value,
              }))}
            />
          </SectionPanel>
          <SectionPanel title="关联业务">
            <Tabs
              items={[
                {
                  key: "contracts",
                  label: "合同",
                  children: (
                    <Table
                      columns={contractColumns}
                      dataSource={contractRecords}
                      pagination={false}
                      rowKey="id"
                      scroll={{ x: 620 }}
                    />
                  ),
                },
                {
                  key: "payment",
                  label: "回款",
                  children: (
                    <div className="payment-progress">
                      <Space direction="vertical" size={10}>
                        <strong>年度回款进度</strong>
                        <Progress percent={76} status="active" />
                      </Space>
                    </div>
                  ),
                },
              ]}
            />
          </SectionPanel>
        </div>
        <aside className="detail-layout__side">
          <SectionPanel title="关键联系人">
            <div className="contact-block">
              <strong>许佳</strong>
              <span>采购负责人</span>
              <span>jia.xu@example.com</span>
            </div>
          </SectionPanel>
          <SectionPanel title="跟进动态">
            <Timeline items={followActivities.map((activity) => ({ children: activity }))} />
          </SectionPanel>
        </aside>
      </div>
    </main>
  );
}
