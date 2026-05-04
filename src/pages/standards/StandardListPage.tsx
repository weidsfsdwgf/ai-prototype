import { Button, DatePicker, Form, Input, Select, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table/interface";
import { Download, Filter, Plus, RotateCcw, Upload } from "lucide-react";
import { SectionPanel } from "../../components/SectionPanel";
import { TableActions } from "../../components/TableActions";
import { customerRecords, type CustomerRecord, type CustomerStage } from "../../data/frameworkPages";
import "../Page.css";
import "./Standards.css";

const stageColor: Record<CustomerStage, string> = {
  新增: "default",
  跟进中: "blue",
  已签约: "green",
  风险: "red",
};

const amountFormatter = new Intl.NumberFormat("zh-CN", {
  style: "currency",
  currency: "CNY",
  maximumFractionDigits: 0,
});

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
  {
    title: "合同金额",
    dataIndex: "contractValue",
    key: "contractValue",
    width: 140,
    align: "right",
    render: (value: number) => amountFormatter.format(value),
  },
  { title: "更新时间", dataIndex: "updatedAt", key: "updatedAt", width: 170 },
  {
    title: "操作",
    key: "action",
    width: 120,
    render: () => (
      <TableActions
        actions={[
          { key: "view", label: "查看" },
          { key: "edit", label: "编辑" },
          { key: "assign", label: "分配" },
          { key: "disable", label: "停用", danger: true },
        ]}
      />
    ),
  },
];

export function StandardListPage() {
  return (
    <main className="page">
      <section className="filter-panel standard-list-filter">
        <Form layout="inline">
          <Form.Item>
            <Input allowClear placeholder="客户编号、名称" className="standard-list-filter__keyword" />
          </Form.Item>
          <Form.Item>
            <Select
              allowClear
              placeholder="行业"
              style={{ width: 150 }}
              options={[
                { value: "供应链", label: "供应链" },
                { value: "智能制造", label: "智能制造" },
                { value: "医疗服务", label: "医疗服务" },
                { value: "连锁零售", label: "连锁零售" },
              ]}
            />
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
          <Form.Item>
            <DatePicker.RangePicker placeholder={["更新时间开始", "更新时间结束"]} />
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
                  新建客户
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
          dataSource={customerRecords}
          pagination={{ current: 1, pageSize: 10, total: customerRecords.length, showSizeChanger: true }}
          rowKey="id"
          scroll={{ x: 1260 }}
        />
      </SectionPanel>
    </main>
  );
}
