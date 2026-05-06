import { Button, Descriptions, Drawer, Empty, Form, Input, Modal, Popover, Radio, Tabs, Tag, message } from "antd";
import dayjs from "dayjs";
import { Check, Maximize2, Minimize2 } from "lucide-react";
import { useMemo, useState } from "react";
import { SectionPanel } from "../components/SectionPanel";
import { currentTodoUser, todoTasks, type TodoTask, type TodoTaskAssignee, type TodoTaskStatus } from "../data/todoTasks";
import "./ApprovalPages.css";
import "./Page.css";
import "./TodoTasksPage.css";

type TodoTabKey = "pending" | "handled" | "created";

const todoTabLabels: Record<TodoTabKey, string> = {
  pending: "待我处理",
  handled: "我已处理",
  created: "我创建的",
};

function getCurrentUserAssignee(record: TodoTask) {
  return record.assignees.find((assignee) => assignee.name === currentTodoUser);
}

function getAssigneeNamesByStatus(assignees: TodoTaskAssignee[], status: TodoTaskStatus) {
  return assignees.filter((assignee) => assignee.status === status).map((assignee) => assignee.name);
}

function getAssigneeDisplayText(assignees: TodoTaskAssignee[]) {
  const handledCount = assignees.filter((assignee) => assignee.status === "handled").length;
  const progressText = `（${handledCount}/${assignees.length}）`;

  if (assignees.length > 2) {
    return `${assignees[0].name}等${assignees.length}人${progressText}`;
  }

  return `${assignees.map((assignee) => assignee.name).join("、")}${progressText}`;
}

function AssigneePopover({ assignees }: { assignees: TodoTaskAssignee[] }) {
  const pendingNames = getAssigneeNamesByStatus(assignees, "pending");
  const handledNames = getAssigneeNamesByStatus(assignees, "handled");

  const renderNames = (names: string[]) =>
    names.length ? (
      <div className="todo-assignee-list">
        {names.map((name) => (
          <Tag key={name}>{name}</Tag>
        ))}
      </div>
    ) : (
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无人员" />
    );

  return (
    <Popover
      trigger="hover"
      placement="bottomLeft"
      content={
        <Tabs
          className="todo-assignee-popover"
          size="small"
          items={[
            { key: "pending", label: `待完成 (${pendingNames.length})`, children: renderNames(pendingNames) },
            { key: "handled", label: `已完成 (${handledNames.length})`, children: renderNames(handledNames) },
          ]}
        />
      }
    >
      <strong className="todo-assignee-trigger" onClick={(event) => event.stopPropagation()}>
        {getAssigneeDisplayText(assignees)}
      </strong>
    </Popover>
  );
}

function TodoTaskList({
  records,
  canComplete,
  canDelete,
  onOpenDetail,
  onComplete,
  onDelete,
}: {
  records: TodoTask[];
  canComplete: boolean;
  canDelete: boolean;
  onOpenDetail: (record: TodoTask) => void;
  onComplete: (record: TodoTask) => void;
  onDelete: (record: TodoTask) => void;
}) {
  if (!records.length) {
    return <Empty description="暂无待办数据" />;
  }

  return (
    <div className="todo-task-list">
      {records.map((record) => (
        <div
          className="todo-task-row"
          key={record.id}
          role="button"
          tabIndex={0}
          onClick={() => onOpenDetail(record)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onOpenDetail(record);
            }
          }}
        >
          <div className="todo-task-row__main">
            <div className="todo-task-row__title">
              <h3>{record.title}</h3>
            </div>
            <div className="todo-task-row__meta">
              <span>
                创建人：<strong>{record.creator}</strong>
              </span>
              <span>
                执行人：<AssigneePopover assignees={record.assignees} />
              </span>
              <span>
                创建时间：<strong>{record.createdAt}</strong>
              </span>
              <span>
                截止时间：<strong>{record.deadline}</strong>
              </span>
            </div>
            <p className="todo-task-row__description">{record.description}</p>
          </div>
          {canComplete && getCurrentUserAssignee(record)?.status === "pending" ? (
            <div className="todo-task-row__action">
              <Button
                type="primary"
                icon={<Check size={16} />}
                onClick={(event) => {
                  event.stopPropagation();
                  onComplete(record);
                }}
              >
                {record.kind === "resignationRiskConfirmation" ? "处理待办" : "完成待办"}
              </Button>
            </div>
          ) : canDelete ? (
            <div className="todo-task-row__action">
              <Button
                danger
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(record);
                }}
              >
                删除
              </Button>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function TodoTaskDetailDrawer({
  record,
  onClose,
  onComplete,
}: {
  record?: TodoTask;
  onClose: () => void;
  onComplete: (record: TodoTask) => void;
}) {
  const [fullscreen, setFullscreen] = useState(false);
  const currentAssignee = record ? getCurrentUserAssignee(record) : undefined;

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
      onClose={onClose}
      open={Boolean(record)}
      footer={
        record && currentAssignee?.status === "pending" ? (
          <div className="todo-detail-footer">
            <Button type="primary" icon={<Check size={16} />} onClick={() => onComplete(record)}>
              完成待办
            </Button>
          </div>
        ) : null
      }
      title="待办详情"
      width={fullscreen ? "100%" : 820}
    >
      {record ? (
        <div className="approval-drawer__content">
          <SectionPanel title="基本信息">
            <Descriptions
              bordered
              column={2}
              items={[
                { key: "title", label: "标题", children: record.title },
                { key: "status", label: "我的状态", children: currentAssignee?.status === "handled" ? "已完成" : "待处理" },
                { key: "creator", label: "创建人", children: record.creator },
                { key: "assignee", label: "执行人", children: <AssigneePopover assignees={record.assignees} /> },
                { key: "createdAt", label: "创建时间", children: record.createdAt },
                { key: "deadline", label: "截止时间", children: record.deadline },
                ...(currentAssignee?.handledAt ? [{ key: "handledAt", label: "我的完成时间", children: currentAssignee.handledAt }] : []),
              ]}
            />
          </SectionPanel>
          <SectionPanel title="描述">
            <p className="todo-detail-description">{record.description}</p>
          </SectionPanel>
        </div>
      ) : null}
    </Drawer>
  );
}

function ResignationRiskConfirmModal({
  record,
  readonly,
  onCancel,
  onSubmit,
}: {
  record?: TodoTask;
  readonly?: boolean;
  onCancel: () => void;
  onSubmit: (record: TodoTask, values: Record<string, unknown>) => void;
}) {
  const [form] = Form.useForm();
  const role = record?.riskRole;
  const initialValues = {
    completionStatus: record?.riskConclusion === "有风险" ? "未完成" : "已完成",
    completionRemark: readonly ? "已提交确认，具体信息见本确认单。" : undefined,
  };

  return (
    <Modal
      title={role ? `离职事项确认 / ${role}` : "离职事项确认"}
      open={Boolean(record)}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={async () => {
        if (!record) {
          return;
        }

        if (readonly) {
          onCancel();
          return;
        }

        const values = await form.validateFields();
        onSubmit(record, values);
        form.resetFields();
      }}
      okText={readonly ? "关闭" : "提交"}
      cancelButtonProps={readonly ? { style: { display: "none" } } : undefined}
      width={860}
      destroyOnClose
    >
      {record ? (
        <div className="todo-risk-modal">
          <Descriptions
            bordered
            column={2}
            items={[
              { key: "documentNo", label: "离职申请", children: record.sourceDocumentNo },
              { key: "version", label: "申请版本", children: record.applicationVersion },
              { key: "role", label: "确认角色", children: record.riskRole },
              { key: "deadline", label: "截止时间", children: record.deadline },
            ]}
          />
          <div className="todo-risk-modal__checklist">
            {record.riskItems?.map((item) => (
              <div className="todo-risk-item" key={item.id}>
                <h3>{item.matter}</h3>
                <p>
                  <strong>事项说明：</strong>
                  {item.requiredAction}
                </p>
              </div>
            ))}
          </div>
          <Form form={form} layout="vertical" disabled={readonly} initialValues={initialValues}>
            <Form.Item label="完成情况" name="completionStatus" rules={[{ required: true, message: "请选择完成情况" }]}>
              <Radio.Group
                options={[
                  { value: "已完成", label: "已完成" },
                  { value: "未完成", label: "未完成" },
                ]}
              />
            </Form.Item>
            <Form.Item label="情况说明" name="completionRemark" rules={[{ required: true, message: "请填写情况说明" }]}>
              <Input.TextArea rows={3} placeholder="请填写完成情况或未完成原因" />
            </Form.Item>
          </Form>
        </div>
      ) : null}
    </Modal>
  );
}

export function TodoTasksPage() {
  const [activeTab, setActiveTab] = useState<TodoTabKey>("pending");
  const [records, setRecords] = useState<TodoTask[]>(todoTasks);
  const [detailRecord, setDetailRecord] = useState<TodoTask>();
  const [deleteRecord, setDeleteRecord] = useState<TodoTask>();
  const [riskRecord, setRiskRecord] = useState<TodoTask>();

  const groupedRecords = useMemo(
    () => ({
      pending: records.filter((record) => getCurrentUserAssignee(record)?.status === "pending"),
      handled: records.filter((record) => getCurrentUserAssignee(record)?.status === "handled"),
      created: records.filter((record) => record.creator === currentTodoUser),
    }),
    [records],
  );

  const completeTodo = (target: TodoTask) => {
    const handledAt = dayjs().format("YYYY-MM-DD HH:mm");

    setRecords((current) =>
      current.map((record) =>
        record.id === target.id
          ? {
              ...record,
              assignees: record.assignees.map((assignee) =>
                assignee.name === currentTodoUser ? { ...assignee, status: "handled", handledAt } : assignee,
              ),
            }
          : record,
      ),
    );
    setDetailRecord((current) =>
      current?.id === target.id
        ? {
            ...current,
            assignees: current.assignees.map((assignee) =>
              assignee.name === currentTodoUser ? { ...assignee, status: "handled", handledAt } : assignee,
            ),
          }
        : current,
    );
    setActiveTab("handled");
    message.success("待办已完成，已更新到“我已处理”。");
  };

  const openTodo = (record: TodoTask) => {
    if (record.kind === "resignationRiskConfirmation") {
      setRiskRecord(record);
      return;
    }

    setDetailRecord(record);
  };

  const submitRiskTodo = (target: TodoTask, values: Record<string, unknown>) => {
    const riskConclusion = values.completionStatus === "未完成" ? "有风险" : "无风险";
    const handledAt = dayjs().format("YYYY-MM-DD HH:mm");

    setRecords((current) =>
      current.map((record) =>
        record.id === target.id
          ? {
              ...record,
              riskConclusion,
              description: `${record.description} 完成情况：${String(values.completionStatus ?? "")}；说明：${String(values.completionRemark ?? "")}`,
              assignees: record.assignees.map((assignee) =>
                assignee.name === currentTodoUser ? { ...assignee, status: "handled", handledAt } : assignee,
              ),
            }
          : record,
      ),
    );
    setRiskRecord(undefined);
    setActiveTab("handled");
    message.success("事项完成情况已提交，待办已完成并回写离职申请。");
  };

  const confirmDeleteTodo = () => {
    if (!deleteRecord) {
      return;
    }

    setRecords((current) => current.filter((record) => record.id !== deleteRecord.id));
    setDetailRecord((current) => (current?.id === deleteRecord.id ? undefined : current));
    setDeleteRecord(undefined);
    message.success("待办已删除。");
  };

  return (
    <main className="todo-tasks-page">
      <SectionPanel>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as TodoTabKey)}
          items={(Object.keys(todoTabLabels) as TodoTabKey[]).map((key) => ({
            key,
            label: `${todoTabLabels[key]} (${groupedRecords[key].length})`,
            children: (
              <TodoTaskList
                records={groupedRecords[key]}
                canComplete={key === "pending"}
                canDelete={key === "created"}
                onOpenDetail={openTodo}
                onComplete={(record) => (record.kind === "resignationRiskConfirmation" ? setRiskRecord(record) : completeTodo(record))}
                onDelete={setDeleteRecord}
              />
            ),
          }))}
        />
      </SectionPanel>
      <TodoTaskDetailDrawer record={detailRecord} onClose={() => setDetailRecord(undefined)} onComplete={completeTodo} />
      <ResignationRiskConfirmModal
        record={riskRecord}
        readonly={riskRecord ? getCurrentUserAssignee(riskRecord)?.status === "handled" : false}
        onCancel={() => setRiskRecord(undefined)}
        onSubmit={submitRiskTodo}
      />
      <Modal
        title="删除待办"
        open={Boolean(deleteRecord)}
        onCancel={() => setDeleteRecord(undefined)}
        onOk={confirmDeleteTodo}
        okText="确认删除"
        okButtonProps={{ danger: true }}
      >
        <p>
          确认删除 <strong>{deleteRecord?.title}</strong> 吗？删除后该待办将不再出现在列表中。
        </p>
      </Modal>
    </main>
  );
}
