import {
  Button,
  DatePicker,
  Descriptions,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Timeline,
  Upload,
} from "antd";
import type { ColumnsType } from "antd/es/table/interface";
import dayjs from "dayjs";
import {
  BriefcaseBusiness,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Download,
  FileText,
  Landmark,
  ReceiptText,
  RotateCcw,
  Search,
  Send,
  UploadCloud,
  UsersRound,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { ApprovalDetailDrawer } from "../components/ApprovalDetailDrawer";
import { SectionPanel } from "../components/SectionPanel";
import { TableActions } from "../components/TableActions";
import {
  oaApplicationRecords,
  oaApplicationTypes,
  type OaApplicationCategory,
  type OaApplicationField,
  type OaApplicationRecord,
  type OaApplicationType,
  type OaDocumentResult,
  type OaDocumentStatus,
} from "../data/oaApplicationCenter";
import type { ApprovalHandleType, ApprovalRecord, ApprovalResult, ApprovalStatus } from "../data/approvalFramework";
import {
  areaOptions,
  departmentOptions,
  hrOptions,
  regularizationApplications,
  type RegularizationApplicationRecord,
  type RegularizationApplicationStatus,
} from "../data/probationManagement";
import "./ApprovalPages.css";
import "./OaApplicationPage.css";
import "./Page.css";
import "./standards/Standards.css";

type MainTabKey = "launch" | "records";

const currentUserName = "周霖";
const currentUserDepartment = "信息中心";

const documentStatusColor: Record<OaDocumentStatus, string> = {
  进行中: "blue",
  已结束: "default",
};

const documentResultColor: Record<OaDocumentResult, string> = {
  处理中: "gold",
  已通过: "green",
  已驳回: "red",
  已撤回: "default",
};

const regularizationStatusColor: Record<RegularizationApplicationStatus, string> = {
  审批中: "blue",
  已通过: "green",
  已驳回: "red",
  已撤销: "default",
};

const categoryIcons: Record<OaApplicationCategory, ReactNode> = {
  人事: <UsersRound size={18} />,
  行政: <BriefcaseBusiness size={18} />,
  财务: <ReceiptText size={18} />,
  采购: <Landmark size={18} />,
  合同: <FileText size={18} />,
};

const categoryOrder: OaApplicationCategory[] = ["人事", "行政", "财务", "采购", "合同"];

function getHandleTypeByResult(result: OaDocumentResult | ApprovalResult): ApprovalHandleType {
  if (result === "已通过") {
    return "已通过";
  }

  if (result === "已驳回") {
    return "已驳回";
  }

  return "待办理";
}

function toApprovalRecord(record: OaApplicationRecord): ApprovalRecord {
  return {
    id: record.id,
    flowName: record.flowName,
    documentNo: record.documentNo,
    initiator: record.initiator,
    summary: record.summary,
    status: record.status as ApprovalStatus,
    result: record.result as ApprovalResult,
    createdAt: record.createdAt,
    currentNode: record.currentNode,
    handleType: getHandleTypeByResult(record.result),
  };
}

function toRegularizationApprovalRecord(record: RegularizationApplicationRecord): ApprovalRecord {
  const resultMap: Record<RegularizationApplicationStatus, ApprovalResult> = {
    审批中: "处理中",
    已通过: "已通过",
    已驳回: "已驳回",
    已撤销: "已撤回",
  };
  const status: ApprovalStatus = record.status === "审批中" ? "进行中" : "已结束";
  const result = resultMap[record.status];

  return {
    id: record.id,
    flowName: "转正申请",
    documentNo: record.approvalNo,
    initiator: record.name,
    summary: `员工：${record.name} | 部门：${record.department} | 预计转正日期：${record.expectedRegularDate}`,
    status,
    result,
    createdAt: record.submitTime,
    currentNode: record.currentNode,
    handleType: getHandleTypeByResult(result),
  };
}

function renderFormControl(field: OaApplicationField) {
  switch (field.kind) {
    case "textarea":
      return <Input.TextArea rows={4} placeholder={`请输入${field.label}`} />;
    case "select":
      return (
        <Select
          placeholder={`请选择${field.label}`}
          options={(field.options ?? []).map((item) => ({ value: item, label: item }))}
        />
      );
    case "dateRange":
      return <DatePicker.RangePicker style={{ width: "100%" }} />;
    case "number":
      return <InputNumber min={0} precision={2} style={{ width: "100%" }} placeholder={`请输入${field.label}`} />;
    case "upload":
      return (
        <Upload.Dragger beforeUpload={() => false} maxCount={3}>
          <p className="upload-icon">
            <UploadCloud size={28} />
          </p>
          <p>上传附件</p>
        </Upload.Dragger>
      );
    default:
      return <Input placeholder={`请输入${field.label}`} />;
  }
}

function ApplicationFormDrawer({
  application,
  onClose,
  onSubmit,
}: {
  application?: OaApplicationType;
  onClose: () => void;
  onSubmit: (application: OaApplicationType) => void;
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
            icon={<Send size={16} />}
            onClick={async () => {
              if (!application) {
                return;
              }

              await form.validateFields();
              onSubmit(application);
              form.resetFields();
            }}
          >
            提交审批
          </Button>
          <Button onClick={onClose}>取消</Button>
        </Space>
      }
      onClose={() => {
        form.resetFields();
        onClose();
      }}
      open={Boolean(application)}
      title={application?.flowName ?? "发起申请"}
      width={960}
    >
      {application ? (
        <div className="approval-drawer__content">
          <SectionPanel title="流程信息">
            <Descriptions
              bordered
              column={2}
              items={[
                { key: "category", label: "申请分类", children: application.category },
                { key: "ownerDept", label: "归口部门", children: application.ownerDept },
                { key: "sla", label: "默认时效", children: application.defaultSla },
                { key: "rule", label: "审批规则", children: application.approvalRule },
              ]}
            />
          </SectionPanel>
          <SectionPanel title="申请表单">
            <Form form={form} className="form-layout" layout="vertical">
              <div className="form-grid">
                {application.formFields.map((field) => (
                  <Form.Item
                    key={field.name}
                    label={field.label}
                    name={field.name}
                    rules={field.required ? [{ required: true, message: `请填写${field.label}` }] : undefined}
                  >
                    {renderFormControl(field)}
                  </Form.Item>
                ))}
              </div>
            </Form>
          </SectionPanel>
          <SectionPanel title="审批链路">
            <Timeline
              items={application.flowNodes.map((node, index) => ({
                color: index === 0 ? "blue" : "gray",
                children: (
                  <div className="approval-chain-meta">
                    <strong>{node}</strong>
                    <span>{index === 0 ? "提交后进入" : "待流转"}</span>
                  </div>
                ),
              }))}
            />
          </SectionPanel>
        </div>
      ) : null}
    </Drawer>
  );
}

function LaunchApplications({
  onOpenApplication,
}: {
  onOpenApplication: (application: OaApplicationType) => void;
}) {
  const enabledCount = oaApplicationTypes.filter((item) => item.status === "启用").length;
  const latestUpdatedAt = oaApplicationTypes
    .map((item) => item.updatedAt)
    .sort((a, b) => b.localeCompare(a))[0];

  return (
    <section className="oa-launch" aria-label="发起申请">
      <div className="oa-launch__summary">
        <div>
          <span className="oa-launch__eyebrow">OA Application</span>
          <h1>发起申请</h1>
        </div>
        <Input
          className="oa-launch__search"
          allowClear
          prefix={<Search size={16} />}
          placeholder="搜索申请名称"
        />
        <div className="oa-launch__stats" aria-label="申请入口概览">
          <div>
            <strong>{enabledCount}</strong>
            <span>启用中</span>
          </div>
          <div>
            <strong>{oaApplicationTypes.length}</strong>
            <span>全部类型</span>
          </div>
          <div>
            <strong>{latestUpdatedAt}</strong>
            <span>最近更新</span>
          </div>
        </div>
      </div>

      {categoryOrder.map((category) => {
        const applications = oaApplicationTypes.filter((item) => item.category === category);

        if (!applications.length) {
          return null;
        }

        return (
          <section className="oa-launch__category" key={category}>
            <div className="oa-launch__category-title">
              <span>{categoryIcons[category]}</span>
              <h2>{category}</h2>
            </div>
            <div className="oa-application-grid">
              {applications.map((application) => (
                <button
                  aria-label={`发起${application.flowName}`}
                  className="oa-application-card"
                  disabled={application.status !== "启用"}
                  key={application.id}
                  type="button"
                  onClick={() => onOpenApplication(application)}
                >
                  <span className="oa-application-card__icon">{categoryIcons[application.category]}</span>
                  <h3>{application.flowName}</h3>
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </section>
  );
}

function ApplicationRecords({
  records,
  regularizationRecords,
  selectedFlowName,
  expandedCategories,
  onToggleCategory,
  onSelectFlowName,
  onViewDetail,
  onRevoke,
  onRevokeRegularization,
}: {
  records: OaApplicationRecord[];
  regularizationRecords: RegularizationApplicationRecord[];
  selectedFlowName?: string;
  expandedCategories: OaApplicationCategory[];
  onToggleCategory: (category: OaApplicationCategory) => void;
  onSelectFlowName: (flowName: string) => void;
  onViewDetail: (record: ApprovalRecord) => void;
  onRevoke: (record: OaApplicationRecord) => void;
  onRevokeRegularization: (record: RegularizationApplicationRecord) => void;
}) {
  const selectedApplication = oaApplicationTypes.find((application) => application.flowName === selectedFlowName);
  const genericVisibleRecords = selectedFlowName ? records.filter((record) => record.flowName === selectedFlowName) : [];

  const regularizationColumns: ColumnsType<RegularizationApplicationRecord> = [
    {
      title: "序号",
      key: "index",
      width: 70,
      fixed: "left",
      align: "center",
      render: (_value, _record, index) => index + 1,
    },
    { title: "员工编号", dataIndex: "employeeNo", key: "employeeNo", width: 120, fixed: "left" },
    { title: "姓名", dataIndex: "name", key: "name", width: 100, fixed: "left" },
    { title: "区域", dataIndex: "area", key: "area", width: 90 },
    { title: "部门", dataIndex: "department", key: "department", width: 130 },
    { title: "岗位-职级", key: "positionRank", width: 140, render: (_, record) => `${record.position}-${record.rank}` },
    { title: "入职日期", dataIndex: "hireDate", key: "hireDate", width: 120 },
    { title: "预计转正日期", dataIndex: "expectedRegularDate", key: "expectedRegularDate", width: 130 },
    {
      title: "实际转正日期",
      dataIndex: "actualRegularDate",
      key: "actualRegularDate",
      width: 130,
      render: (value: string) => value || "-",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: RegularizationApplicationStatus) => <Tag color={regularizationStatusColor[status]}>{status}</Tag>,
    },
    { title: "负责HR", dataIndex: "responsibleHr", key: "responsibleHr", width: 100 },
    { title: "提交时间", dataIndex: "submitTime", key: "submitTime", width: 170 },
    { title: "更新时间", dataIndex: "updatedAt", key: "updatedAt", width: 170 },
    {
      title: "操作",
      key: "action",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <TableActions
          maxVisible={2}
          actions={[
            { key: "detail", label: "详情", onClick: () => onViewDetail(toRegularizationApprovalRecord(record)) },
            ...(record.status === "审批中" ? [{ key: "revoke", label: "撤销", danger: true, onClick: () => onRevokeRegularization(record) }] : []),
          ]}
        />
      ),
    },
  ];

  const genericColumns: ColumnsType<OaApplicationRecord> = [
    {
      title: "序号",
      key: "index",
      width: 70,
      fixed: "left",
      align: "center",
      render: (_value, _record, index) => index + 1,
    },
    { title: "审批单号", dataIndex: "documentNo", key: "documentNo", width: 170, fixed: "left" },
    { title: "流程名称", dataIndex: "flowName", key: "flowName", width: 130 },
    { title: "分类", dataIndex: "category", key: "category", width: 90 },
    { title: "发起人", dataIndex: "initiator", key: "initiator", width: 100 },
    { title: "部门", dataIndex: "department", key: "department", width: 130 },
    { title: "摘要", dataIndex: "summary", key: "summary", width: 320 },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: OaDocumentStatus) => <Tag color={documentStatusColor[status]}>{status}</Tag>,
    },
    {
      title: "结果",
      dataIndex: "result",
      key: "result",
      width: 100,
      render: (result: OaDocumentResult) => <Tag color={documentResultColor[result]}>{result}</Tag>,
    },
    { title: "当前节点", dataIndex: "currentNode", key: "currentNode", width: 140 },
    { title: "发起时间", dataIndex: "createdAt", key: "createdAt", width: 170 },
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
            { key: "detail", label: "详情", onClick: () => onViewDetail(toApprovalRecord(record)) },
            ...(record.status === "进行中" ? [{ key: "revoke", label: "撤销", danger: true, onClick: () => onRevoke(record) }] : []),
          ]}
        />
      ),
    },
  ];

  return (
    <div className="oa-records">
      <aside className="oa-records__side" aria-label="申请分类">
        <div className="oa-records__side-title">
          <ClipboardList size={18} />
          <span>申请分类</span>
        </div>
        <div className="oa-records__category-list">
          {categoryOrder.map((item) => {
            const applicationTypes = oaApplicationTypes.filter((application) => application.category === item);
            const expanded = expandedCategories.includes(item);

            return (
              <div className="oa-records__category-group" key={item}>
                <button
                  className={expanded ? "oa-records__category oa-records__category--expanded" : "oa-records__category"}
                  type="button"
                  onClick={() => onToggleCategory(item)}
                >
                  <span className="oa-records__category-label">
                    {categoryIcons[item]}
                    {item}
                  </span>
                  {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                {expanded ? (
                  <div className="oa-records__subcategory-list">
                    {applicationTypes.map((application) => (
                      <button
                        className={selectedFlowName === application.flowName ? "oa-records__subcategory oa-records__subcategory--active" : "oa-records__subcategory"}
                        key={application.id}
                        type="button"
                        onClick={() => onSelectFlowName(application.flowName)}
                      >
                        <span>{application.flowName}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </aside>
      <div className="oa-records__main">
        {!selectedApplication ? (
          <SectionPanel>
            <div className="oa-records__empty">
              <Empty description="请选择左侧具体申请表单查看数据" />
            </div>
          </SectionPanel>
        ) : selectedFlowName === "转正申请" ? (
          <>
            <section className="filter-panel standard-list-filter" aria-label="转正申请数据查询区">
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
                    options={areaOptions.map((item) => ({ value: item, label: item }))}
                  />
                </Form.Item>
                <Form.Item name="department">
                  <Select
                    allowClear
                    mode="multiple"
                    maxTagCount="responsive"
                    placeholder="部门"
                    style={{ width: 170 }}
                    options={departmentOptions.map((item) => ({ value: item, label: item }))}
                  />
                </Form.Item>
                <Form.Item name="position">
                  <Input allowClear placeholder="岗位" style={{ width: 130 }} />
                </Form.Item>
                <Form.Item name="responsibleHr">
                  <Select
                    allowClear
                    mode="multiple"
                    maxTagCount="responsive"
                    placeholder="负责HR"
                    style={{ width: 150 }}
                    options={hrOptions.map((item) => ({ value: item, label: item }))}
                  />
                </Form.Item>
                <Form.Item name="status">
                  <Select
                    allowClear
                    mode="multiple"
                    maxTagCount="responsive"
                    placeholder="状态"
                    style={{ width: 160 }}
                    options={Object.keys(regularizationStatusColor).map((item) => ({ value: item, label: item }))}
                  />
                </Form.Item>
                <Form.Item name="hireDate">
                  <DatePicker.RangePicker placeholder={["入职开始", "入职结束"]} />
                </Form.Item>
                <Form.Item name="actualRegularDate">
                  <DatePicker.RangePicker placeholder={["实际转正开始", "实际转正结束"]} />
                </Form.Item>
                <Form.Item className="standard-list-filter__actions">
                  <div className="standard-list-filter__action-row">
                    <Space wrap className="standard-list-filter__query-actions">
                      <Button type="primary" icon={<Search size={16} />}>
                        查询
                      </Button>
                      <Button icon={<RotateCcw size={16} />}>重置</Button>
                    </Space>
                    <Space wrap className="standard-list-filter__business-actions">
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
                columns={regularizationColumns}
                dataSource={regularizationRecords}
                pagination={{ current: 1, pageSize: 10, total: regularizationRecords.length, showSizeChanger: true }}
                rowKey="id"
                scroll={{ x: "max-content" }}
              />
            </SectionPanel>
          </>
        ) : (
          <>
            <section className="filter-panel standard-list-filter" aria-label={`${selectedFlowName}数据查询区`}>
              <Form layout="inline">
                <Form.Item name="keyword">
                  <Input allowClear placeholder="审批单号、流程名称和发起人" className="standard-list-filter__keyword" />
                </Form.Item>
                <Form.Item name="status">
                  <Select
                    allowClear
                    mode="multiple"
                    maxTagCount="responsive"
                    placeholder="状态"
                    style={{ width: 160 }}
                    options={Object.keys(documentStatusColor).map((item) => ({ value: item, label: item }))}
                  />
                </Form.Item>
                <Form.Item name="result">
                  <Select
                    allowClear
                    mode="multiple"
                    maxTagCount="responsive"
                    placeholder="结果"
                    style={{ width: 160 }}
                    options={Object.keys(documentResultColor).map((item) => ({ value: item, label: item }))}
                  />
                </Form.Item>
                <Form.Item name="createdAt">
                  <DatePicker.RangePicker placeholder={["发起开始", "发起结束"]} />
                </Form.Item>
                <Form.Item className="standard-list-filter__actions">
                  <div className="standard-list-filter__action-row">
                    <Space wrap className="standard-list-filter__query-actions">
                      <Button type="primary" icon={<Search size={16} />}>
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
                columns={genericColumns}
                dataSource={genericVisibleRecords}
                pagination={{ current: 1, pageSize: 10, total: genericVisibleRecords.length, showSizeChanger: true }}
                rowKey="id"
                scroll={{ x: "max-content" }}
              />
            </SectionPanel>
          </>
        )}
      </div>
    </div>
  );
}

export function OaApplicationPage() {
  const [activeTab, setActiveTab] = useState<MainTabKey>("launch");
  const [records, setRecords] = useState<OaApplicationRecord[]>(oaApplicationRecords);
  const [regularizationRecords, setRegularizationRecords] = useState<RegularizationApplicationRecord[]>(regularizationApplications);
  const [selectedFlowName, setSelectedFlowName] = useState<string>();
  const [expandedCategories, setExpandedCategories] = useState<OaApplicationCategory[]>(categoryOrder);
  const [activeApplication, setActiveApplication] = useState<OaApplicationType>();
  const [approvalDetailRecord, setApprovalDetailRecord] = useState<ApprovalRecord>();
  const [revokeRecord, setRevokeRecord] = useState<OaApplicationRecord>();
  const [revokeRegularizationRecord, setRevokeRegularizationRecord] = useState<RegularizationApplicationRecord>();

  const toggleCategory = (category: OaApplicationCategory) => {
    setExpandedCategories((current) =>
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category],
    );
  };

  const submitApplication = (application: OaApplicationType) => {
    const serial = records.length + 1;
    const nextRecord: OaApplicationRecord = {
      id: `OA-${Date.now()}`,
      flowName: application.flowName,
      documentNo: `OA-${dayjs().format("YYYYMM")}-${String(serial).padStart(3, "0")}`,
      initiator: currentUserName,
      department: currentUserDepartment,
      category: application.category,
      summary: `${application.flowName} | ${application.description}`,
      status: "进行中",
      result: "处理中",
      currentNode: application.flowNodes[1] ?? application.flowNodes[0],
      createdAt: dayjs().format("YYYY-MM-DD HH:mm"),
      endedAt: "-",
      flowNodes: application.flowNodes,
    };

    setRecords((current) => [nextRecord, ...current]);
    setActiveApplication(undefined);
    setActiveTab("records");
    setSelectedFlowName(application.flowName);
    Modal.success({ title: "申请已提交", content: `已生成 ${nextRecord.documentNo}，可在数据记录中查看审批进度。` });
  };

  const confirmRevoke = () => {
    if (!revokeRecord) {
      return;
    }

    setRecords((current) =>
      current.map((record) =>
        record.id === revokeRecord.id
          ? {
              ...record,
              status: "已结束",
              result: "已撤回",
              currentNode: "流程结束",
              endedAt: dayjs().format("YYYY-MM-DD HH:mm"),
            }
          : record,
      ),
    );
    setRevokeRecord(undefined);
  };

  const confirmRegularizationRevoke = () => {
    if (!revokeRegularizationRecord) {
      return;
    }

    setRegularizationRecords((current) =>
      current.map((record) =>
        record.id === revokeRegularizationRecord.id
          ? {
              ...record,
              status: "已撤销",
              currentNode: "审批结束",
              updatedAt: dayjs().format("YYYY-MM-DD HH:mm"),
            }
          : record,
      ),
    );
    setRevokeRegularizationRecord(undefined);
  };

  return (
    <main className="oa-application-page">
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as MainTabKey)}
        items={[
          {
            key: "launch",
            label: "发起申请",
            children: <LaunchApplications onOpenApplication={setActiveApplication} />,
          },
          {
            key: "records",
            label: "数据记录",
            children: (
              <ApplicationRecords
                records={records}
                regularizationRecords={regularizationRecords}
                selectedFlowName={selectedFlowName}
                expandedCategories={expandedCategories}
                onToggleCategory={toggleCategory}
                onSelectFlowName={setSelectedFlowName}
                onViewDetail={setApprovalDetailRecord}
                onRevoke={setRevokeRecord}
                onRevokeRegularization={setRevokeRegularizationRecord}
              />
            ),
          },
        ]}
      />
      <ApplicationFormDrawer
        application={activeApplication}
        onClose={() => setActiveApplication(undefined)}
        onSubmit={submitApplication}
      />
      <ApprovalDetailDrawer
        record={approvalDetailRecord}
        canOperate={false}
        showHandleType={false}
        showDocumentState
        onClose={() => setApprovalDetailRecord(undefined)}
      />
      <Modal
        title="撤销申请"
        open={Boolean(revokeRecord)}
        onCancel={() => setRevokeRecord(undefined)}
        onOk={confirmRevoke}
        okText="确认撤销"
        okButtonProps={{ danger: true }}
      >
        <p>
          确认撤销 <strong>{revokeRecord?.documentNo}</strong> 吗？撤销后本条申请将更新为“已撤回”。
        </p>
      </Modal>
      <Modal
        title="撤销转正申请"
        open={Boolean(revokeRegularizationRecord)}
        onCancel={() => setRevokeRegularizationRecord(undefined)}
        onOk={confirmRegularizationRevoke}
        okText="确认撤销"
        okButtonProps={{ danger: true }}
      >
        <p>
          确认撤销 <strong>{revokeRegularizationRecord?.approvalNo}</strong> 吗？撤销后本条申请状态将更新为“已撤销”。
        </p>
      </Modal>
    </main>
  );
}
