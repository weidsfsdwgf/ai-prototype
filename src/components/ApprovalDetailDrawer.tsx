import { Button, Descriptions, Drawer, Form, Input, Modal, Select, Space, Tag, Timeline } from "antd";
import { Check, CheckCircle2, Clock3, Maximize2, Minimize2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { PayrollApprovalDetail } from "./PayrollApprovalDetail";
import {
  approvalChain,
  type ApprovalHandleType,
  type ApprovalRecord,
  type ApprovalResult,
  type ApprovalStatus,
} from "../data/approvalFramework";
import { SectionPanel } from "./SectionPanel";

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

type ApprovalDetailDrawerProps = {
  record?: ApprovalRecord;
  canOperate: boolean;
  showHandleType: boolean;
  showDocumentState: boolean;
  onClose: () => void;
};

export function ApprovalDetailDrawer({
  record,
  canOperate,
  showHandleType,
  showDocumentState,
  onClose,
}: ApprovalDetailDrawerProps) {
  const [opinion, setOpinion] = useState("");
  const [opinionInvalid, setOpinionInvalid] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferUser, setTransferUser] = useState<string>();
  const [transferUserInvalid, setTransferUserInvalid] = useState(false);

  useEffect(() => {
    setOpinion("");
    setOpinionInvalid(false);
    setFullscreen(Boolean(record?.payrollInfo));
    setTransferOpen(false);
    setTransferUser(undefined);
    setTransferUserInvalid(false);
  }, [record?.id, record?.payrollInfo]);

  const handleReject = () => {
    if (!opinion.trim()) {
      setOpinionInvalid(true);
      Modal.warning({
        title: "请补充审批意见",
        content: "驳回审批前必须填写审批意见。",
      });
      return;
    }

    onClose();
  };

  const confirmTransfer = () => {
    if (!transferUser) {
      setTransferUserInvalid(true);
      return;
    }

    setTransferOpen(false);
    onClose();
  };

  const descriptionItems = record
    ? [
        { key: "flowName", label: "流程名称", children: record.flowName },
        { key: "documentNo", label: "单据号", children: record.documentNo },
        { key: "initiator", label: "发起人", children: record.initiator },
        { key: "createdAt", label: "创建时间", children: record.createdAt },
        { key: "currentNode", label: "当前节点", children: record.currentNode },
        ...(showDocumentState
          ? [
              {
                key: "status",
                label: "状态",
                children: <Tag color={statusColor[record.status]}>{record.status}</Tag>,
              },
              {
                key: "result",
                label: "结果",
                children: <Tag color={resultColor[record.result]}>{record.result}</Tag>,
              },
            ]
          : []),
        ...(showHandleType
          ? [
              {
                key: "handleType",
                label: "办理类型",
                children: <Tag color={handleTypeColor[record.handleType]}>{record.handleType}</Tag>,
              },
            ]
          : []),
      ]
    : [];

  const getCompletionStatus = (conclusion: NonNullable<ApprovalRecord["riskConfirmations"]>[number]["conclusion"]) => {
    if (conclusion === "待确认") {
      return { color: "gold", label: "待完成" };
    }

    if (conclusion === "已作废") {
      return { color: "default", label: "已作废" };
    }

    if (conclusion === "有风险") {
      return { color: "red", label: "未完成" };
    }

    return { color: "green", label: "已完成" };
  };

  const renderResignationApprovalInfo = (target: ApprovalRecord) => {
    if (!target.resignationInfo) {
      return null;
    }

    const riskConfirmations = target.riskConfirmations ?? [];
    const completedCount = riskConfirmations.filter((item) => item.conclusion === "无风险" || item.conclusion === "有风险").length;
    const pendingCount = riskConfirmations.filter((item) => item.conclusion === "待确认").length;

    return (
      <div className="approval-resignation-info">
        <Descriptions
          bordered
          column={2}
          items={[
            { key: "name", label: "姓名", children: target.resignationInfo.name },
            { key: "area", label: "区域", children: target.resignationInfo.area },
            { key: "department", label: "部门", children: target.resignationInfo.department },
            { key: "position", label: "岗位", children: target.resignationInfo.position },
            { key: "rank", label: "职级", children: target.resignationInfo.rank },
            { key: "hireDate", label: "入职日期", children: target.resignationInfo.hireDate },
            { key: "resignationDate", label: "离职日期", children: target.resignationInfo.resignationDate },
            { key: "resignationType", label: "离职类型", children: target.resignationInfo.resignationType },
            { key: "resignationReasons", label: "离职原因", children: target.resignationInfo.resignationReasons.join("、") },
            { key: "reasonDescription", label: "原因说明", children: target.resignationInfo.reasonDescription || "-" },
          ]}
        />
        <div className="approval-resignation-matters">
          <div className="approval-resignation-matters__header">
            <div>
              <h3>离职事项</h3>
              <p>离职事项与审批并行推进，审批人可在这里查看需要完成的事项和完成情况。</p>
            </div>
            <div className="approval-resignation-matters__summary">
              <span>
                <CheckCircle2 size={16} />
                {completedCount}/{riskConfirmations.length} 已完成
              </span>
              <span>
                <Clock3 size={16} />
                {pendingCount} 待确认
              </span>
            </div>
          </div>
          <div className="approval-resignation-matter-list">
            {riskConfirmations.map((item) => {
              const status = getCompletionStatus(item.conclusion);

              return (
                <div className="approval-resignation-matter-row" key={item.documentNo}>
                  <div className="approval-resignation-matter-row__main">
                    <strong>{item.matter}</strong>
                    <span>{item.role}</span>
                  </div>
                  <p>{item.confirmationDetail}</p>
                  <Tag color={status.color}>{status.label}</Tag>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
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
      footer={
        canOperate ? (
          <div className="approval-drawer__footer">
            <Input.TextArea
              placeholder="请输入审批意见"
              rows={3}
              status={opinionInvalid ? "error" : undefined}
              value={opinion}
              onChange={(event) => {
                setOpinion(event.target.value);
                if (event.target.value.trim()) {
                  setOpinionInvalid(false);
                }
              }}
            />
            {opinionInvalid ? <span className="approval-opinion-error">驳回时请输入审批意见</span> : null}
            <Space wrap>
              <Button type="primary" icon={<Check size={16} />} onClick={onClose}>
                通过
              </Button>
              <Button type="primary" danger icon={<X size={16} />} onClick={handleReject}>
                驳回
              </Button>
              <Button type="primary" onClick={() => setTransferOpen(true)}>
                转办
              </Button>
            </Space>
          </div>
        ) : null
      }
      onClose={onClose}
      open={Boolean(record)}
      title="审批详情"
      width={fullscreen ? "100%" : 880}
    >
      {record ? (
        <div className="approval-drawer__content">
          <SectionPanel title="审批信息">
            {record.payrollInfo ? (
              <PayrollApprovalDetail info={record.payrollInfo} />
            ) : record.resignationInfo ? (
              renderResignationApprovalInfo(record)
            ) : (
              <Descriptions bordered column={2} items={descriptionItems} />
            )}
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
      <Modal
        title="转办审批"
        open={transferOpen}
        onCancel={() => setTransferOpen(false)}
        onOk={confirmTransfer}
        okText="确认转办"
      >
        <Form layout="vertical">
          <Form.Item
            label="转办用户"
            required
            validateStatus={transferUserInvalid ? "error" : undefined}
            help={transferUserInvalid ? "请选择转办用户" : undefined}
          >
            <Select
              allowClear
              placeholder="请选择转办用户"
              value={transferUser}
              onChange={(value) => {
                setTransferUser(value);
                if (value) {
                  setTransferUserInvalid(false);
                }
              }}
              options={[
                { value: "陈嘉", label: "陈嘉" },
                { value: "林珊", label: "林珊" },
                { value: "周霖", label: "周霖" },
                { value: "赵宁", label: "赵宁" },
                { value: "王越", label: "王越" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Drawer>
  );
}
