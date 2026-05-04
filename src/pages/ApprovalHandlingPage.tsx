import { Button, DatePicker, Form, Input, Select, Space, Table, Tabs, Tag } from "antd";
import type { ColumnsType } from "antd/es/table/interface";
import { Check, Filter, RotateCcw, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ApprovalDetailDrawer } from "../components/ApprovalDetailDrawer";
import { SectionPanel } from "../components/SectionPanel";
import { TableActions } from "../components/TableActions";
import {
  copiedApprovals,
  handledApprovals,
  pendingApprovals,
  type ApprovalResult,
  type ApprovalHandleType,
  type ApprovalRecord,
  type ApprovalStatus,
} from "../data/approvalFramework";
import "./ApprovalPages.css";
import "./Page.css";
import "./standards/Standards.css";

type ApprovalTabKey = "pending" | "handled" | "copied";

const handleTypeColor: Record<ApprovalHandleType, string> = {
  待办理: "gold",
  已通过: "green",
  已驳回: "red",
  已转办: "blue",
  抄送: "default",
};

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

export function ApprovalHandlingPage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<ApprovalTabKey>("pending");
  const [detailRecord, setDetailRecord] = useState<ApprovalRecord>();
  const [selectedPendingKeys, setSelectedPendingKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    const state = location.state as { approvalDetail?: ApprovalRecord } | null;

    if (state?.approvalDetail) {
      setActiveTab("handled");
      setDetailRecord(state.approvalDetail);
    }
  }, [location.state]);

  const makeColumns = (type: ApprovalTabKey): ColumnsType<ApprovalRecord> => {
    const baseColumns: ColumnsType<ApprovalRecord> = [
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
    ];

    if (type !== "pending") {
      baseColumns.push({ title: "当前节点", dataIndex: "currentNode", key: "currentNode", width: 150 });
    }

    if (type === "handled") {
      baseColumns.push(
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
      );
    }

    baseColumns.push({ title: "创建时间", dataIndex: "createdAt", key: "createdAt", width: 170 });

    if (type === "handled") {
      baseColumns.push({
        title: "办理类型",
        dataIndex: "handleType",
        key: "handleType",
        width: 110,
        render: (handleType: ApprovalHandleType) => <Tag color={handleTypeColor[handleType]}>{handleType}</Tag>,
      });
    }

    baseColumns.push({
      title: "操作",
      key: "action",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <TableActions actions={[{ key: "detail", label: "详情", onClick: () => setDetailRecord(record) }]} />
      ),
    });

    return baseColumns;
  };

  const renderFilter = (type: ApprovalTabKey) => (
    <section className="filter-panel standard-list-filter" aria-label="审批查询区">
      <Form layout="inline">
        <Form.Item name="flowName">
          <Input allowClear placeholder="流程名称" className="standard-list-filter__keyword" />
        </Form.Item>
        <Form.Item name="documentNo">
          <Input allowClear placeholder="单据号" style={{ width: 180 }} />
        </Form.Item>
        <Form.Item name="initiator">
          <Input allowClear placeholder="发起人" style={{ width: 130 }} />
        </Form.Item>
        <Form.Item name="summary">
          <Input allowClear placeholder="审批摘要" style={{ width: 200 }} />
        </Form.Item>
        {type === "handled" ? (
          <Form.Item name="handleType">
            <Select
              allowClear
              placeholder="办理类型"
              style={{ width: 150 }}
              options={[
                { value: "已通过", label: "已通过" },
                { value: "已驳回", label: "已驳回" },
                { value: "已转办", label: "已转办" },
              ]}
            />
          </Form.Item>
        ) : null}
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
            {type === "pending" ? (
              <Space wrap className="standard-list-filter__business-actions">
                <Button className="standard-list-filter__create-action" icon={<Check size={16} />}>
                  批量通过
                </Button>
                <Button className="standard-list-filter__danger-action" icon={<X size={16} />}>
                  批量驳回
                </Button>
              </Space>
            ) : null}
          </div>
        </Form.Item>
      </Form>
    </section>
  );

  const renderList = (records: ApprovalRecord[], type: ApprovalTabKey) => (
    <div className="page">
      {renderFilter(type)}
      <SectionPanel>
        <Table
          columns={makeColumns(type)}
          dataSource={records}
          pagination={{ current: 1, pageSize: 10, total: records.length, showSizeChanger: true }}
          rowKey="id"
          rowSelection={
            type === "pending"
              ? {
                  selectedRowKeys: selectedPendingKeys,
                  onChange: setSelectedPendingKeys,
                }
              : undefined
          }
          scroll={{ x: type === "pending" ? 1370 : 1480 }}
        />
      </SectionPanel>
    </div>
  );

  return (
    <main className="page">
      <SectionPanel>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as ApprovalTabKey)}
          items={[
            { key: "pending", label: "待办审批", children: renderList(pendingApprovals, "pending") },
            { key: "handled", label: "已办审批", children: renderList(handledApprovals, "handled") },
            { key: "copied", label: "抄送给我", children: renderList(copiedApprovals, "copied") },
          ]}
        />
      </SectionPanel>
      <ApprovalDetailDrawer
        record={detailRecord}
        canOperate={activeTab === "pending"}
        showHandleType={activeTab === "handled"}
        showDocumentState={activeTab === "handled"}
        onClose={() => setDetailRecord(undefined)}
      />
    </main>
  );
}
