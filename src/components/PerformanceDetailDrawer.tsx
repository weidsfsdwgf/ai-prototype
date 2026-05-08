import { Button, Empty, Modal, Space, Tabs, Timeline } from "antd";
import { useMemo } from "react";
import {
  getPerformanceSubjectValues,
  getPerformanceTemplate,
  performanceLogs,
  type PerformanceRecord,
} from "../data/performanceManagement";
import { ScorecardScoringContent } from "./ScorecardScoringDrawer";
import "../pages/PerformanceManagementPage.css";

type PerformanceDetailDrawerProps = {
  record?: PerformanceRecord;
  onClose: () => void;
  actions?: (record: PerformanceRecord) => Array<{
    key: "save" | "submit" | "confirm" | "return" | "transfer";
    label: "保存修改" | "提交" | "提交确认" | "退回" | "转派";
    danger?: boolean;
    onClick: (record: PerformanceRecord) => void;
  }>;
};

export function PerformanceDetailDrawer({ record, onClose, actions }: PerformanceDetailDrawerProps) {
  const template = getPerformanceTemplate(record);
  const logs = useMemo(
    () => performanceLogs.filter((log) => log.recordId === record?.id),
    [record?.id],
  );
  const footerActions = record ? actions?.(record) ?? [] : [];

  return (
    <Modal
      className="performance-detail-modal"
      destroyOnClose
      footer={
        footerActions.length ? (
          <div className="performance-detail-footer">
            <Space>
              {footerActions.map((action) => (
                <Button
                  danger={action.danger}
                  key={action.key}
                  onClick={() => {
                    if (record) {
                      action.onClick(record);
                    }
                  }}
                  type={["submit", "confirm"].includes(action.key) ? "primary" : "default"}
                >
                  {action.label}
                </Button>
              ))}
            </Space>
          </div>
        ) : null
      }
      open={Boolean(record)}
      onCancel={onClose}
      title="绩效详情"
      width={1120}
    >
      {record ? (
        <div className="performance-detail">
          <Tabs
            className="standard-tabs performance-detail-tabs"
            items={[
              {
                key: "scorecard",
                label: "绩效表",
                children: template ? (
                  <ScorecardScoringContent
                    mode="score"
                    subjectValues={getPerformanceSubjectValues(record)}
                    template={template}
                  />
                ) : (
                  <Empty description="根据绩效表配置未匹配绩效考核表，无需考核" />
                ),
              },
              {
                key: "flow",
                label: "流程记录",
                children: logs.length ? (
                  <Timeline
                    items={logs.map((log) => ({
                      color: log.action.includes("修订") ? "orange" : "blue",
                      children: (
                        <div className="performance-flow-log">
                          <strong>{log.node}</strong>
                          <span>{log.action} / {log.handler} / {log.time}</span>
                          <p>{log.remark}</p>
                        </div>
                      ),
                    }))}
                  />
                ) : (
                  <Empty description="暂无流程记录" />
                ),
              },
            ]}
          />
        </div>
      ) : null}
    </Modal>
  );
}
