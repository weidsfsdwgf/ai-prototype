import { Button, DatePicker, Form, Input, Select, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Download, Filter, RotateCcw } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { StatusTag } from "../components/StatusTag";
import { approvalRecords, type ApprovalRecord } from "../data/approvals";
import "./Page.css";

const formatAmount = (value: number) =>
  value === 0
    ? "-"
    : new Intl.NumberFormat("zh-CN", {
        style: "currency",
        currency: "CNY",
        maximumFractionDigits: 0,
      }).format(value);

const columns: ColumnsType<ApprovalRecord> = [
  {
    title: "审批编号",
    dataIndex: "id",
    key: "id",
    width: 170,
    fixed: "left",
  },
  {
    title: "标题",
    dataIndex: "title",
    key: "title",
    width: 220,
  },
  {
    title: "类型",
    dataIndex: "category",
    key: "category",
    width: 130,
  },
  {
    title: "申请人",
    dataIndex: "applicant",
    key: "applicant",
    width: 110,
  },
  {
    title: "部门",
    dataIndex: "department",
    key: "department",
    width: 140,
  },
  {
    title: "金额",
    dataIndex: "amount",
    key: "amount",
    width: 130,
    align: "right",
    render: formatAmount,
  },
  {
    title: "提交时间",
    dataIndex: "submittedAt",
    key: "submittedAt",
    width: 170,
  },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
    width: 110,
    render: (status: ApprovalRecord["status"]) => <StatusTag status={status} />,
  },
  {
    title: "操作",
    key: "action",
    width: 120,
    fixed: "right",
    render: () => <Button type="link">查看</Button>,
  },
];

export function ApprovalPage() {
  return (
    <main className="page">
      <PageHeader
        title="审批中心"
        description="集中处理采购、费用、供应商和客户信用类审批。"
        actions={
          <Button icon={<Download size={16} />}>导出</Button>
        }
      />
      <section className="filter-panel">
        <Form layout="inline">
          <Form.Item label="关键词">
            <Input allowClear placeholder="编号、标题、申请人" />
          </Form.Item>
          <Form.Item label="类型">
            <Select
              allowClear
              placeholder="全部类型"
              style={{ width: 160 }}
              options={[
                { value: "采购申请", label: "采购申请" },
                { value: "费用报销", label: "费用报销" },
                { value: "供应商管理", label: "供应商管理" },
                { value: "客户信用", label: "客户信用" },
              ]}
            />
          </Form.Item>
          <Form.Item label="提交日期">
            <DatePicker.RangePicker />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" icon={<Filter size={16} />}>
                筛选
              </Button>
              <Button icon={<RotateCcw size={16} />}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </section>
      <section className="panel">
        <Table
          columns={columns}
          dataSource={approvalRecords}
          rowKey="id"
          scroll={{ x: 1290 }}
          pagination={{
            current: 1,
            pageSize: 10,
            total: approvalRecords.length,
            showSizeChanger: true,
          }}
        />
      </section>
    </main>
  );
}
