import { Button, DatePicker, Descriptions, Drawer, Form, Input, Modal, Select, Space, Table, Tag, Timeline } from "antd";
import type { ColumnsType } from "antd/es/table/interface";
import { Filter, Maximize2, Minimize2, RotateCcw } from "lucide-react";
import { useState } from "react";
import { SectionPanel } from "../components/SectionPanel";
import { TableActions } from "../components/TableActions";
import {
  approvalChain,
  myInitiatedApprovals,
  type ApprovalResult,
  type ApprovalStatus,
  type MyInitiatedApprovalRecord,
} from "../data/approvalFramework";
import "./ApprovalPages.css";
import "./Page.css";
import "./standards/Standards.css";

const statusColor: Record<ApprovalStatus, string> = {
  进行中: "blue",
  已结束: "default",
};

const resultColor: Record<ApprovalResult, string> = {
  处理中: "gold",
  已通过: "green",
  已驳回: "red",
  已撤回: "default",
};

export function MyInitiatedApprovalsPage() {
  const [detailRecord, setDetailRecord] = useState<MyInitiatedApprovalRecord>();
  const [revokeRecord, setRevokeRecord] = useState<MyInitiatedApprovalRecord>();
  const [fullscreen, setFullscreen] = useState(false);

  const columns: ColumnsType<MyInitiatedApprovalRecord> = [
    {
      title: "序号",
      key: "index",
      width: 70,
      fixed: "left",
      align: "center",
      render: (_value, _record, index) => index + 1,
    },
    { title: "流程名称", dataIndex: "flowName", key: "flowName", width: 160, fixed: "left" },
    { title: "单据号", dataIndex: "documentNo", key: "documentNo", width: 190 },
    { title: "发起人", dataIndex: "initiator", key: "initiator", width: 110 },
    { title: "审批摘要", dataIndex: "summary", key: "summary", minWidth: 260 },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: ApprovalStatus) => <Tag color={statusColor[status]}>{status}</Tag>,
    },
    {
      title: "结果",
      dataIndex: "result",
      key: "result",
      width: 100,
      render: (result: ApprovalResult) => <Tag color={resultColor[result]}>{result}</Tag>,
    },
    { title: "创建时间", dataIndex: "createdAt", key: "createdAt", width: 170 },
    { title: "结束时间", dataIndex: "endedAt", key: "endedAt", width: 170 },
    {
      title: "操作",
      key: "action",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <TableActions
          maxVisible={2}
          actions={[
            { key: "detail", label: "详情", onClick: () => setDetailRecord(record) },
            ...(record.status === "进行中"
              ? [{ key: "revoke", label: "撤回", danger: true, onClick: () => setRevokeRecord(record) }]
              : []),
          ]}
        />
      ),
    },
  ];

  return (
    <main className="page">
      <section className="filter-panel standard-list-filter" aria-label="我发起的审批查询区">
        <Form layout="inline">
          <Form.Item name="flowName">
            <Input allowClear placeholder="流程名称" className="standard-list-filter__keyword" />
          </Form.Item>
          <Form.Item name="documentNo">
            <Input allowClear placeholder="单据号" style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="summary">
            <Input allowClear placeholder="审批摘要" style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="status">
            <Select
              allowClear
              placeholder="状态"
              style={{ width: 130 }}
              options={[
                { value: "进行中", label: "进行中" },
                { value: "已结束", label: "已结束" },
              ]}
            />
          </Form.Item>
          <Form.Item name="result">
            <Select
              allowClear
              placeholder="结果"
              style={{ width: 130 }}
              options={[
                { value: "处理中", label: "处理中" },
                { value: "已通过", label: "已通过" },
                { value: "已驳回", label: "已驳回" },
                { value: "已撤回", label: "已撤回" },
              ]}
            />
          </Form.Item>
          <Form.Item name="initiator">
            <Input allowClear placeholder="发起人" style={{ width: 130 }} />
          </Form.Item>
          <Form.Item name="createdAt">
            <DatePicker.RangePicker placeholder={["创建开始", "创建结束"]} />
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
          dataSource={myInitiatedApprovals}
          pagination={{ current: 1, pageSize: 10, total: myInitiatedApprovals.length, showSizeChanger: true }}
          rowKey="id"
          scroll={{ x: 1450 }}
        />
      </SectionPanel>
      <Drawer
        className="approval-drawer"
        extra={
          <Button
            aria-label={fullscreen ? "退出全屏" : "全屏展示"}
            icon={fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            onClick={() => setFullscreen(!fullscreen)}
            type="text"
          />
        }
        onClose={() => {
          setDetailRecord(undefined);
          setFullscreen(false);
        }}
        open={Boolean(detailRecord)}
        title="我发起的审批详情"
        width={fullscreen ? "100%" : 880}
      >
        {detailRecord ? (
          <div className="approval-drawer__content">
            <SectionPanel title="审批信息">
              <Descriptions
                bordered
                column={2}
                items={[
                  { key: "flowName", label: "流程名称", children: detailRecord.flowName },
                  { key: "documentNo", label: "单据号", children: detailRecord.documentNo },
                  { key: "initiator", label: "发起人", children: detailRecord.initiator },
                  { key: "createdAt", label: "创建时间", children: detailRecord.createdAt },
                  { key: "status", label: "状态", children: <Tag color={statusColor[detailRecord.status]}>{detailRecord.status}</Tag> },
                  { key: "result", label: "结果", children: <Tag color={resultColor[detailRecord.result]}>{detailRecord.result}</Tag> },
                  { key: "endedAt", label: "结束时间", children: detailRecord.endedAt },
                ]}
              />
            </SectionPanel>
            <SectionPanel title="审批链路">
              <Timeline
                items={approvalChain.map((item) => ({
                  children: (
                    <div className="approval-chain-meta">
                      <strong>{item.node}</strong>
                      <span>
                        {item.operator} · {item.action} · {item.time}
                      </span>
                      <span>{item.comment}</span>
                    </div>
                  ),
                }))}
              />
            </SectionPanel>
          </div>
        ) : null}
      </Drawer>
      <Modal
        title="撤回审批"
        open={Boolean(revokeRecord)}
        onCancel={() => setRevokeRecord(undefined)}
        onOk={() => setRevokeRecord(undefined)}
        okText="确认撤回"
        okButtonProps={{ danger: true }}
      >
        <p>
          确认撤回 <strong>{revokeRecord?.documentNo}</strong> 吗？撤回后审批状态将变为已结束，结果为已撤回。
        </p>
      </Modal>
    </main>
  );
}
