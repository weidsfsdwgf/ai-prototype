import { Button, DatePicker, Drawer, Form, Input, Modal, Popover, Select, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table/interface";
import dayjs from "dayjs";
import { CheckCircle2, Download, Filter, PencilLine, RotateCcw, Settings2 } from "lucide-react";
import { useState } from "react";
import { ApprovalDetailDrawer } from "../components/ApprovalDetailDrawer";
import { SectionPanel } from "../components/SectionPanel";
import { TableActions } from "../components/TableActions";
import {
  resignationAreaOptions,
  resignationDepartmentOptions,
  resignationHrOptions,
  resignationManagementRecords,
  resignationReasonOptions,
  resignationTypeOptions,
  toResignationApprovalRecord,
  type ResignationApprovalStatus,
  type ResignationManagementRecord,
  type ResignationManagementStatus,
  type ResignationRiskResult,
} from "../data/resignationManagement";
import {
  getResignationMatterAssignee,
  resignationMatterAssigneeConfig,
  resignationMatterNames,
  type ResignationMatterAssigneeConfig,
  type ResignationMatterName,
} from "../data/todoTasks";
import type { ApprovalRecord } from "../data/approvalFramework";
import "./ApprovalPages.css";
import "./Page.css";
import "./ResignationManagementPage.css";
import "./standards/Standards.css";

const managementStatusColor: Record<ResignationManagementStatus, string> = {
  待确认: "gold",
  已确认: "green",
};

const approvalStatusColor: Record<ResignationApprovalStatus, string> = {
  审批中: "blue",
  已通过: "green",
  已驳回: "red",
  已撤销: "default",
  无审批: "default",
};

const confirmationColor: Record<string, string> = {
  待确认: "gold",
  无风险: "green",
  有风险: "red",
  已作废: "default",
};

function getConfirmationLabel(conclusion: string) {
  if (conclusion === "无风险") {
    return "已完成";
  }

  if (conclusion === "有风险") {
    return "未完成";
  }

  if (conclusion === "已作废") {
    return "已作废";
  }

  return "待完成";
}

const resignationMatterAssigneeOptions = ["陈嘉", "林珊", "周霖", "许佳", "王越", "何敏"];

function getMatterKey(recordId: string, role: ResignationRiskResult["role"]) {
  return `${recordId}-${role}`;
}

function getMatterNameByRole(role: ResignationRiskResult["role"]): ResignationMatterName {
  if (role === "所属部门") {
    return "工作交接";
  }

  if (role === "行政部") {
    return "行政交接";
  }

  if (role === "人力资源部") {
    return "人力资源办理";
  }

  return "财务确认";
}

function ResignationConfirmationProgress({
  record,
  assigneeConfig,
  dispatchAssignees,
  onRelaunch,
  onTransfer,
}: {
  record: ResignationManagementRecord;
  assigneeConfig: ResignationMatterAssigneeConfig;
  dispatchAssignees: Record<string, string>;
  onRelaunch: (record: ResignationManagementRecord, role: ResignationRiskResult["role"]) => void;
  onTransfer: (record: ResignationManagementRecord, role: ResignationRiskResult["role"]) => void;
}) {
  const riskResults = record.riskResults ?? [];
  const completedCount = riskResults.filter((item) => item.conclusion === "无风险").length;
  const totalCount = riskResults.length || 4;

  return (
    <Popover
      trigger="hover"
      placement="bottomLeft"
      content={
        <div className="resignation-confirmation-popover">
          {riskResults.length ? (
            riskResults.map((item) => {
              const matterName = getMatterNameByRole(item.role);
              const assignee = dispatchAssignees[getMatterKey(record.id, item.role)] ?? getResignationMatterAssignee(matterName, record.area, assigneeConfig);
              const canRelaunch = item.conclusion === "无风险";
              const canTransfer = item.conclusion === "待确认";

              return (
                <div className="resignation-confirmation-popover__row" key={item.role}>
                  <div className="resignation-confirmation-popover__main">
                    <strong>{matterName}</strong>
                    <span>
                      {item.role} · 执行人：{assignee}
                    </span>
                  </div>
                  <Tag color={confirmationColor[item.conclusion]}>{getConfirmationLabel(item.conclusion)}</Tag>
                  {canRelaunch || canTransfer ? (
                    <div className="resignation-confirmation-popover__actions">
                      {canRelaunch ? (
                        <Button type="link" size="small" onClick={() => onRelaunch(record, item.role)}>
                          重新发起
                        </Button>
                      ) : null}
                      {canTransfer ? (
                        <Button type="link" size="small" onClick={() => onTransfer(record, item.role)}>
                          转派
                        </Button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })
          ) : (
            <span className="resignation-confirmation-popover__empty">暂无确认事项</span>
          )}
        </div>
      }
    >
      <Button type="link" className="resignation-confirmation-progress">
        {completedCount}/{totalCount}
      </Button>
    </Popover>
  );
}

function ConfirmResignationDrawer({
  record,
  onClose,
  onSubmit,
}: {
  record?: ResignationManagementRecord;
  onClose: () => void;
  onSubmit: (record: ResignationManagementRecord, values: { resignationDate: dayjs.Dayjs; resignationType: string; resignationReasons: string[]; reasonDescription?: string }) => void;
}) {
  const [form] = Form.useForm();

  return (
    <Drawer
      className="approval-drawer"
      destroyOnClose
      extra={
        <Space>
          <Button
            type="primary"
            icon={<CheckCircle2 size={16} />}
            onClick={async () => {
              if (!record) {
                return;
              }

              const values = await form.validateFields();
              onSubmit(record, values);
            }}
          >
            确认离职
          </Button>
          <Button onClick={onClose}>取消</Button>
        </Space>
      }
      onClose={onClose}
      open={Boolean(record)}
      title="确认离职"
      width={960}
    >
      {record ? (
        <Form
          form={form}
          className="form-layout"
          layout="vertical"
          initialValues={{
            employeeNo: record.employeeNo,
            name: record.name,
            department: record.department,
            positionRank: `${record.position}-${record.rank}`,
            hireDate: dayjs(record.hireDate),
            resignationDate: dayjs(record.resignationDate),
            resignationType: record.resignationType || "主动离职",
            resignationReasons: record.resignationReasons,
            reasonDescription: record.reasonDescription,
          }}
        >
          <SectionPanel title="员工信息">
            <div className="form-grid">
              <Form.Item label="姓名" name="name">
                <Input disabled />
              </Form.Item>
              <Form.Item label="员工编号" name="employeeNo">
                <Input disabled />
              </Form.Item>
              <Form.Item label="部门" name="department">
                <Input disabled />
              </Form.Item>
              <Form.Item label="岗位-职级" name="positionRank">
                <Input disabled />
              </Form.Item>
              <Form.Item label="入职日期" name="hireDate">
                <DatePicker disabled style={{ width: "100%" }} />
              </Form.Item>
            </div>
          </SectionPanel>
          <SectionPanel title="离职信息">
            <div className="form-grid">
              <Form.Item label="离职日期" name="resignationDate" rules={[{ required: true, message: "请选择离职日期" }]}>
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item label="离职类型" name="resignationType" rules={[{ required: true, message: "请选择离职类型" }]}>
                <Select options={resignationTypeOptions.map((item) => ({ value: item, label: item }))} />
              </Form.Item>
              <Form.Item label="离职原因" name="resignationReasons" rules={[{ required: true, message: "请选择离职原因" }]}>
                <Select mode="multiple" options={resignationReasonOptions.map((item) => ({ value: item, label: item }))} />
              </Form.Item>
              <Form.Item label="原因说明" name="reasonDescription">
                <Input.TextArea rows={3} />
              </Form.Item>
            </div>
          </SectionPanel>
        </Form>
      ) : null}
    </Drawer>
  );
}

export function ResignationManagementPage() {
  const [records, setRecords] = useState<ResignationManagementRecord[]>(resignationManagementRecords);
  const [confirmRecord, setConfirmRecord] = useState<ResignationManagementRecord>();
  const [approvalRecord, setApprovalRecord] = useState<ApprovalRecord>();
  const [matterAssigneeConfig, setMatterAssigneeConfig] = useState<ResignationMatterAssigneeConfig>(resignationMatterAssigneeConfig);
  const [matterDispatchAssignees, setMatterDispatchAssignees] = useState<Record<string, string>>({});
  const [assigneeConfigOpen, setAssigneeConfigOpen] = useState(false);
  const [selectedConfigMatter, setSelectedConfigMatter] = useState<ResignationMatterName>("工作交接");
  const [batchAssigneeOpen, setBatchAssigneeOpen] = useState(false);
  const [relaunchTarget, setRelaunchTarget] = useState<{ record: ResignationManagementRecord; role: ResignationRiskResult["role"] }>();
  const [transferTarget, setTransferTarget] = useState<{ record: ResignationManagementRecord; role: ResignationRiskResult["role"] }>();
  const [assigneeConfigForm] = Form.useForm<ResignationMatterAssigneeConfig>();
  const [batchAssigneeForm] = Form.useForm<{ assignee: string }>();
  const [relaunchForm] = Form.useForm<{ assignee: string }>();
  const [transferForm] = Form.useForm<{ assignee: string }>();

  const sortedRecords = [...records].sort((a, b) => a.resignationDate.localeCompare(b.resignationDate));

  const getDisplayAssignee = (record: ResignationManagementRecord, role: ResignationRiskResult["role"]) => {
    const matterName = getMatterNameByRole(role);

    return matterDispatchAssignees[getMatterKey(record.id, role)] ?? getResignationMatterAssignee(matterName, record.area, matterAssigneeConfig);
  };

  const openConfirm = (record: ResignationManagementRecord) => {
    if (record.approvalStatus === "审批中") {
      Modal.warning({ title: "暂不可确认", content: "离职审批中，无法确认离职。" });
      return;
    }

    setConfirmRecord(record);
  };

  const submitConfirm = (
    record: ResignationManagementRecord,
    values: { resignationDate: dayjs.Dayjs; resignationType: string; resignationReasons: string[]; reasonDescription?: string },
  ) => {
    setRecords((current) =>
      current.map((item) =>
        item.id === record.id
          ? {
              ...item,
              status: "已确认",
              resignationDate: values.resignationDate.format("YYYY-MM-DD"),
              resignationType: values.resignationType,
              resignationReasons: values.resignationReasons,
              reasonDescription: values.reasonDescription ?? "",
              updater: "林珊",
              updatedAt: dayjs().format("YYYY-MM-DD HH:mm"),
            }
          : item,
      ),
    );
    setConfirmRecord(undefined);
  };

  const openAssigneeConfig = () => {
    assigneeConfigForm.setFieldsValue(matterAssigneeConfig);
    setSelectedConfigMatter("工作交接");
    batchAssigneeForm.resetFields();
    setAssigneeConfigOpen(true);
  };

  const submitAssigneeConfig = async () => {
    const values = await assigneeConfigForm.validateFields();

    setMatterAssigneeConfig(values);
    setAssigneeConfigOpen(false);
    Modal.success({
      title: "配置已保存",
      content: "新发起的离职事项确认待办会按当前配置派发给对应人员。",
    });
  };

  const openBatchAssignee = () => {
    batchAssigneeForm.resetFields();
    setBatchAssigneeOpen(true);
  };

  const submitBatchAssignee = async () => {
    const values = await batchAssigneeForm.validateFields();

    const currentMatterConfig = assigneeConfigForm.getFieldValue(selectedConfigMatter) ?? {};
    const nextMatterConfig = resignationAreaOptions.reduce<Record<string, string>>(
      (result, area) => ({
        ...result,
        [area]: values.assignee,
      }),
      { ...currentMatterConfig },
    );

    assigneeConfigForm.setFieldsValue({
      [selectedConfigMatter]: nextMatterConfig,
    } as Partial<ResignationMatterAssigneeConfig>);
    setBatchAssigneeOpen(false);
    batchAssigneeForm.resetFields();
  };

  const openRelaunchMatter = (record: ResignationManagementRecord, role: ResignationRiskResult["role"]) => {
    relaunchForm.setFieldsValue({ assignee: getDisplayAssignee(record, role) });
    setRelaunchTarget({ record, role });
  };

  const openTransferMatter = (record: ResignationManagementRecord, role: ResignationRiskResult["role"]) => {
    transferForm.setFieldsValue({ assignee: getDisplayAssignee(record, role) });
    setTransferTarget({ record, role });
  };

  const submitRelaunchMatter = async () => {
    if (!relaunchTarget) {
      return;
    }

    const values = await relaunchForm.validateFields();
    const { record, role } = relaunchTarget;
    const nextRecords = records.map((item) =>
      item.id === record.id
        ? {
            ...item,
            riskResults: (item.riskResults ?? []).map((risk) =>
              risk.role === role
                ? {
                    ...risk,
                    conclusion: "待确认" as const,
                    handledAt: undefined,
                  }
                : risk,
            ),
            updater: "林珊",
            updatedAt: dayjs().format("YYYY-MM-DD HH:mm"),
          }
        : item,
    );
    const updatedRecord = nextRecords.find((item) => item.id === record.id);

    setRecords(nextRecords);
    setMatterDispatchAssignees((current) => ({
      ...current,
      [getMatterKey(record.id, role)]: values.assignee,
    }));

    if (approvalRecord?.id === record.id && updatedRecord) {
      setApprovalRecord(toResignationApprovalRecord(updatedRecord));
    }

    setRelaunchTarget(undefined);
    relaunchForm.resetFields();
    Modal.success({
      title: "待办已重新发起",
      content: `${record.name}的${getMatterNameByRole(role)}事项已重新生成待办，并派发给${values.assignee}。`,
    });
  };

  const submitTransferMatter = async () => {
    if (!transferTarget) {
      return;
    }

    const values = await transferForm.validateFields();
    const { record, role } = transferTarget;

    setMatterDispatchAssignees((current) => ({
      ...current,
      [getMatterKey(record.id, role)]: values.assignee,
    }));
    setRecords((current) =>
      current.map((item) =>
        item.id === record.id
          ? {
              ...item,
              updater: "林珊",
              updatedAt: dayjs().format("YYYY-MM-DD HH:mm"),
            }
          : item,
      ),
    );
    setTransferTarget(undefined);
    transferForm.resetFields();
    Modal.success({
      title: "待办已转派",
      content: `${record.name}的${getMatterNameByRole(role)}事项已转派给${values.assignee}，完成状态保持待完成。`,
    });
  };

  const columns: ColumnsType<ResignationManagementRecord> = [
    {
      title: "序号",
      key: "index",
      width: 70,
      fixed: "left",
      align: "center",
      render: (_value, _record, index) => index + 1,
    },
    { title: "姓名", dataIndex: "name", key: "name", width: 100, fixed: "left" },
    { title: "区域", dataIndex: "area", key: "area", width: 90 },
    { title: "部门", dataIndex: "department", key: "department", width: 130 },
    { title: "岗位-职级", key: "positionRank", width: 140, render: (_, record) => `${record.position}-${record.rank}` },
    { title: "入职日期", dataIndex: "hireDate", key: "hireDate", width: 120 },
    { title: "离职日期", dataIndex: "resignationDate", key: "resignationDate", width: 120 },
    {
      title: "事项确认",
      key: "confirmationProgress",
      width: 110,
      render: (_, record) => (
        <ResignationConfirmationProgress
          record={record}
          assigneeConfig={matterAssigneeConfig}
          dispatchAssignees={matterDispatchAssignees}
          onRelaunch={openRelaunchMatter}
          onTransfer={openTransferMatter}
        />
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: ResignationManagementStatus) => <Tag color={managementStatusColor[status]}>{status}</Tag>,
    },
    {
      title: "磐石审批",
      dataIndex: "approvalStatus",
      key: "approvalStatus",
      width: 140,
      render: (status: ResignationApprovalStatus, record) => (
        <Space size={4}>
          <Tag color={approvalStatusColor[status]}>{status}</Tag>
          {status !== "无审批" ? (
            <Button type="link" size="small" onClick={() => setApprovalRecord(toResignationApprovalRecord(record))}>
              详情
            </Button>
          ) : null}
        </Space>
      ),
    },
    { title: "离职类型", dataIndex: "resignationType", key: "resignationType", width: 110 },
    { title: "离职原因", dataIndex: "resignationReasons", key: "resignationReasons", width: 180, render: (value: string[]) => value.join("、") },
    { title: "原因说明", dataIndex: "reasonDescription", key: "reasonDescription", width: 220, ellipsis: true },
    { title: "手机号", dataIndex: "phone", key: "phone", width: 140 },
    { title: "负责HR", dataIndex: "responsibleHr", key: "responsibleHr", width: 100 },
    { title: "更新者", dataIndex: "updater", key: "updater", width: 100 },
    { title: "更新时间", dataIndex: "updatedAt", key: "updatedAt", width: 170 },
    {
      title: "操作",
      key: "action",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <TableActions
          actions={[
            { key: "confirm", label: "确认离职", onClick: () => openConfirm(record) },
          ]}
        />
      ),
    },
  ];

  return (
    <main className="page">
      <section className="filter-panel standard-list-filter" aria-label="离职管理筛选区">
        <Form layout="inline">
          <Form.Item name="keyword">
            <Input allowClear placeholder="姓名、员工编号和手机号" className="standard-list-filter__keyword" />
          </Form.Item>
          <Form.Item name="area">
            <Select
              allowClear
              mode="multiple"
              maxTagCount="responsive"
              placeholder="区域"
              style={{ width: 160 }}
              options={resignationAreaOptions.map((item) => ({ value: item, label: item }))}
            />
          </Form.Item>
          <Form.Item name="department">
            <Select
              allowClear
              mode="multiple"
              maxTagCount="responsive"
              placeholder="部门"
              style={{ width: 170 }}
              options={resignationDepartmentOptions.map((item) => ({ value: item, label: item }))}
            />
          </Form.Item>
          <Form.Item name="status">
            <Select
              allowClear
              mode="multiple"
              maxTagCount="responsive"
              placeholder="状态"
              style={{ width: 140 }}
              options={Object.keys(managementStatusColor).map((item) => ({ value: item, label: item }))}
            />
          </Form.Item>
          <Form.Item name="responsibleHr">
            <Select
              allowClear
              mode="multiple"
              maxTagCount="responsive"
              placeholder="负责HR"
              style={{ width: 150 }}
              options={resignationHrOptions.map((item) => ({ value: item, label: item }))}
            />
          </Form.Item>
          <Form.Item name="resignationDate">
            <DatePicker.RangePicker placeholder={["离职开始", "离职结束"]} />
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
                <Button className="standard-list-filter__utility-action" icon={<Settings2 size={16} />} onClick={openAssigneeConfig}>
                  配置事项确认人
                </Button>
                <Button className="standard-list-filter__utility-action" icon={<Download size={16} />}>
                  导出Excel
                </Button>
              </Space>
            </div>
          </Form.Item>
        </Form>
      </section>
      <SectionPanel>
        <Table
          columns={columns}
          dataSource={sortedRecords}
          pagination={{ current: 1, pageSize: 10, total: sortedRecords.length, showSizeChanger: true }}
          rowKey="id"
          scroll={{ x: "max-content" }}
        />
      </SectionPanel>
      <ConfirmResignationDrawer record={confirmRecord} onClose={() => setConfirmRecord(undefined)} onSubmit={submitConfirm} />
      <Modal
        destroyOnClose
        title="配置事项确认人"
        open={assigneeConfigOpen}
        onCancel={() => {
          setAssigneeConfigOpen(false);
          assigneeConfigForm.resetFields();
        }}
        onOk={submitAssigneeConfig}
        okText="保存配置"
        width={860}
      >
        <Form form={assigneeConfigForm} layout="vertical">
          <div className="resignation-assignee-config">
            <div className="resignation-assignee-config__toolbar">
              <Form.Item label="确认事项">
                <Select
                  value={selectedConfigMatter}
                  onChange={(value) => setSelectedConfigMatter(value)}
                  options={resignationMatterNames.map((item) => ({ value: item, label: item }))}
                />
              </Form.Item>
            </div>
            <Table
              className="resignation-assignee-config__table"
              columns={[
                {
                  title: "区域",
                  dataIndex: "area",
                  key: "area",
                  width: 180,
                  render: (area: string) => <strong>{area}</strong>,
                },
                {
                  title: (
                    <span className="resignation-assignee-config__assignee-title">
                      事项确认人
                      <Button type="link" size="small" icon={<PencilLine size={14} />} onClick={openBatchAssignee}>
                        批量编辑
                      </Button>
                    </span>
                  ),
                  dataIndex: "area",
                  key: "assignee",
                  render: (area: string) => (
                    <Form.Item className="resignation-assignee-config__cell" name={[selectedConfigMatter, area]} rules={[{ required: true, message: "请选择人员" }]}>
                      <Select options={resignationMatterAssigneeOptions.map((item) => ({ value: item, label: item }))} />
                    </Form.Item>
                  ),
                },
              ]}
              dataSource={resignationAreaOptions.map((area) => ({ area }))}
              pagination={{ pageSize: 8, showSizeChanger: false }}
              rowKey="area"
              size="small"
            />
          </div>
        </Form>
      </Modal>
      <Modal
        destroyOnClose
        title="批量设置事项确认人"
        open={batchAssigneeOpen}
        onCancel={() => {
          setBatchAssigneeOpen(false);
          batchAssigneeForm.resetFields();
        }}
        onOk={submitBatchAssignee}
        okText="应用到全部区域"
      >
        <Form form={batchAssigneeForm} layout="vertical">
          <Form.Item label="确认事项">
            <Input disabled value={selectedConfigMatter} />
          </Form.Item>
          <Form.Item label="事项确认人" name="assignee" rules={[{ required: true, message: "请选择事项确认人" }]}>
            <Select options={resignationMatterAssigneeOptions.map((item) => ({ value: item, label: item }))} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        destroyOnClose
        title="重新发起事项确认"
        open={Boolean(relaunchTarget)}
        onCancel={() => {
          setRelaunchTarget(undefined);
          relaunchForm.resetFields();
        }}
        onOk={submitRelaunchMatter}
        okText="确认发起"
      >
        {relaunchTarget ? (
          <Form form={relaunchForm} layout="vertical">
            <Form.Item label="离职事项">
              <Input disabled value={`${relaunchTarget.record.name} / ${getMatterNameByRole(relaunchTarget.role)}`} />
            </Form.Item>
            <Form.Item label="执行人" name="assignee" rules={[{ required: true, message: "请选择执行人" }]}>
              <Select options={resignationMatterAssigneeOptions.map((item) => ({ value: item, label: item }))} />
            </Form.Item>
          </Form>
        ) : null}
      </Modal>
      <Modal
        destroyOnClose
        title="转派事项确认"
        open={Boolean(transferTarget)}
        onCancel={() => {
          setTransferTarget(undefined);
          transferForm.resetFields();
        }}
        onOk={submitTransferMatter}
        okText="确认转派"
      >
        {transferTarget ? (
          <Form form={transferForm} layout="vertical">
            <Form.Item label="离职事项">
              <Input disabled value={`${transferTarget.record.name} / ${getMatterNameByRole(transferTarget.role)}`} />
            </Form.Item>
            <Form.Item label="执行人" name="assignee" rules={[{ required: true, message: "请选择执行人" }]}>
              <Select options={resignationMatterAssigneeOptions.map((item) => ({ value: item, label: item }))} />
            </Form.Item>
          </Form>
        ) : null}
      </Modal>
      <ApprovalDetailDrawer
        record={approvalRecord}
        canOperate={false}
        showHandleType={false}
        showDocumentState
        onClose={() => setApprovalRecord(undefined)}
      />
    </main>
  );
}
