import {
  Button,
  DatePicker,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Timeline,
  Upload,
} from "antd";
import type { ColumnsType } from "antd/es/table/interface";
import dayjs from "dayjs";
import { Bell, Download, Edit3, FileCog, Filter, Maximize2, Minimize2, Plus, RotateCcw, UploadCloud } from "lucide-react";
import { useState } from "react";
import { SectionPanel } from "../components/SectionPanel";
import { TableActions } from "../components/TableActions";
import {
  areaOptions,
  hrOptions,
  probationFileTemplates,
  probationManagementRecords,
  type ProbationApprovalStatus,
  type ProbationManagementRecord,
  type RegularizationFileTemplate,
} from "../data/probationManagement";
import "./ApprovalPages.css";
import "./Page.css";
import "./ProbationManagementPage.css";
import "./standards/Standards.css";

const referenceDate = dayjs("2026-05-04");

const approvalStatusColor: Record<ProbationApprovalStatus, string> = {
  待提交: "gold",
  审批中: "blue",
  已驳回: "red",
  已通过: "green",
};

function getRemainingDays(record: ProbationManagementRecord) {
  if (!record.expectedRegularDate) {
    return undefined;
  }

  return dayjs(record.expectedRegularDate).diff(referenceDate, "day");
}

function shouldHighlightExpectedRegularDate(record: ProbationManagementRecord) {
  if (!record.expectedRegularDate) {
    return true;
  }

  const remainingDays = getRemainingDays(record);

  return remainingDays !== undefined && remainingDays <= 10;
}

function getTemplateByDepartment(department: string) {
  return probationFileTemplates.find((template) => template.mainDepartment === department);
}

function ApprovalDetailDrawer({
  record,
  onClose,
}: {
  record?: ProbationManagementRecord;
  onClose: () => void;
}) {
  const [fullscreen, setFullscreen] = useState(false);
  const approvalStatus = record?.approvalStatus;
  const status = approvalStatus === "待提交" || approvalStatus === "审批中" ? "进行中" : "已结束";
  const result = approvalStatus === "待提交" || approvalStatus === "审批中" ? "处理中" : approvalStatus;
  const currentNode = approvalStatus === "待提交" ? "员工提交申请" : approvalStatus === "审批中" ? "直属主管审批" : "流程结束";
  const flowNodes = ["员工提交申请", "负责区域SSC会签", "直属主管审批", "部门负责人审批", "流程结束"];
  const currentIndex = flowNodes.indexOf(currentNode);

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
      onClose={() => {
        setFullscreen(false);
        onClose();
      }}
      open={Boolean(record)}
      title="审批详情"
      width={fullscreen ? "100%" : 880}
    >
      {record ? (
        <div className="approval-drawer__content">
          <SectionPanel title="审批信息">
            <Descriptions
              bordered
              column={2}
              items={[
                { key: "flowName", label: "流程名称", children: "转正申请" },
                { key: "documentNo", label: "单据号", children: `HR-REG-${record.employeeNo}` },
                { key: "initiator", label: "发起人", children: record.name },
                { key: "createdAt", label: "创建时间", children: record.updatedAt },
                { key: "currentNode", label: "当前节点", children: currentNode },
                { key: "status", label: "状态", children: <Tag color={status === "进行中" ? "blue" : "default"}>{status}</Tag> },
                { key: "result", label: "结果", children: result ? <Tag color={approvalStatusColor[approvalStatus ?? "待提交"]}>{result}</Tag> : "-" },
              ]}
            />
          </SectionPanel>
          <SectionPanel title="审批链路">
            <Timeline
              items={flowNodes.map((node, index) => {
                const finished = status === "已结束" || index < currentIndex;
                const current = node === currentNode;

                return {
                  color: finished ? "green" : current ? "blue" : "gray",
                  children: (
                    <div className="approval-chain-meta">
                      <strong>{node}</strong>
                      <span>{finished ? "已完成" : current ? "当前节点" : "待流转"}</span>
                    </div>
                  ),
                };
              })}
            />
          </SectionPanel>
        </div>
      ) : null}
    </Drawer>
  );
}

function NoticeDrawer({
  record,
  onClose,
  onSubmit,
}: {
  record?: ProbationManagementRecord;
  onClose: () => void;
  onSubmit: (record: ProbationManagementRecord) => void;
}) {
  const template = record ? getTemplateByDepartment(record.department) : undefined;

  return (
    <Drawer
      className="approval-drawer"
      destroyOnClose
      extra={
        <Space>
          <Button
            type="primary"
            icon={<Bell size={16} />}
            onClick={() => {
              if (!record) {
                return;
              }

              Modal.success({
                title: "转正通知已提交",
                content: "员工页面将展示“转正申请待发起”待办通知，磐石审批同步为待提交状态。",
              });
              onSubmit(record);
              onClose();
            }}
          >
            提交通知
          </Button>
          <Button onClick={onClose}>取消</Button>
        </Space>
      }
      onClose={onClose}
      open={Boolean(record)}
      title="通知转正"
      width={1040}
    >
      {record ? (
        <Form
          className="form-layout"
          layout="vertical"
          initialValues={{
            employeeNo: record.employeeNo,
            name: record.name,
            department: record.department,
            hireDate: record.hireDate ? dayjs(record.hireDate) : undefined,
            positionRank: `${record.position}-${record.rank}`,
            expectedRegularDate: record.expectedRegularDate ? dayjs(record.expectedRegularDate) : undefined,
            actualRegularDate: record.expectedRegularDate ? dayjs(record.expectedRegularDate) : undefined,
            probationSalary: record.probationSalary,
            salaryByOffer: record.salaryByOffer ?? true,
            regularSalary: record.regularSalary,
            effectiveDate: record.effectiveDate ? dayjs(record.effectiveDate) : record.expectedRegularDate ? dayjs(record.expectedRegularDate) : undefined,
          }}
        >
          <SectionPanel title="员工信息">
            <div className="form-grid">
              <Form.Item label="姓名" name="name">
                <Input disabled />
              </Form.Item>
              <Form.Item label="部门" name="department">
                <Input disabled />
              </Form.Item>
              <Form.Item label="入职日期" name="hireDate">
                <DatePicker disabled style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item label="岗位-职级" name="positionRank">
                <Input disabled />
              </Form.Item>
              <Form.Item label="预计转正日期" name="expectedRegularDate">
                <DatePicker disabled style={{ width: "100%" }} />
              </Form.Item>
            </div>
          </SectionPanel>
          <SectionPanel title="转正信息">
            <div className="form-grid">
              <Form.Item label="实际转正日期" name="actualRegularDate" rules={[{ required: true, message: "请选择实际转正日期" }]}>
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item label="试用期薪资" name="probationSalary" rules={[{ required: true, message: "请输入试用期薪资" }]}>
                <InputNumber min={0} precision={0} prefix="¥" style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item label="转正薪资是否按原录用核定" name="salaryByOffer" valuePropName="checked">
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>
              <Form.Item label="转正薪资" name="regularSalary" rules={[{ required: true, message: "请输入转正薪资" }]}>
                <InputNumber min={0} precision={0} prefix="¥" style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item label="生效日期" name="effectiveDate" rules={[{ required: true, message: "请选择生效日期" }]}>
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </div>
          </SectionPanel>
          <SectionPanel title="转正文件">
            <div className="form-grid">
              <Form.Item label="转正评估表模板">
                <Upload.Dragger beforeUpload={() => false} defaultFileList={template?.assessmentTemplate ? [{ uid: "assessment", name: template.assessmentTemplate }] : []}>
                  <p className="upload-icon">
                    <UploadCloud size={28} />
                  </p>
                  <p>可删除默认模板后自行上传</p>
                </Upload.Dragger>
              </Form.Item>
              <Form.Item label="转正考试">
                <Upload.Dragger beforeUpload={() => false} defaultFileList={template?.examTemplate ? [{ uid: "exam", name: template.examTemplate }] : []}>
                  <p className="upload-icon">
                    <UploadCloud size={28} />
                  </p>
                  <p>上传或替换考试文件</p>
                </Upload.Dragger>
              </Form.Item>
            </div>
          </SectionPanel>
        </Form>
      ) : null}
    </Drawer>
  );
}

function FileSettingsModal({
  open,
  onClose,
  templates,
  onTemplatesChange,
}: {
  open: boolean;
  onClose: () => void;
  templates: RegularizationFileTemplate[];
  onTemplatesChange: (templates: RegularizationFileTemplate[]) => void;
}) {
  type FileTemplateFormValues = {
    id?: string;
    mainDepartment?: string;
    assessmentTemplate?: string | Array<{ name?: string }>;
  };
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<RegularizationFileTemplate>();
  const [form] = Form.useForm<FileTemplateFormValues>();

  const openEditor = (record?: RegularizationFileTemplate) => {
    setEditingTemplate(record);
    form.setFieldsValue(
      record ?? {
        id: `TPL-${templates.length + 1}`,
        mainDepartment: "",
        assessmentTemplate: [],
      },
    );
    if (record) {
      form.setFieldValue("assessmentTemplate", [{ uid: record.id, name: record.assessmentTemplate }]);
    }
    setEditorOpen(true);
  };

  const saveTemplate = async () => {
    const values = await form.validateFields();
    const rawTemplate = values.assessmentTemplate;
    const templateName =
      typeof rawTemplate === "string"
        ? rawTemplate
        : rawTemplate?.[0]?.name ?? editingTemplate?.assessmentTemplate ?? "转正评估表模板.docx";

    const nextTemplates = (() => {
      if (editingTemplate) {
        return templates.map((item) =>
          item.id === editingTemplate.id
            ? {
                ...item,
                mainDepartment: values.mainDepartment ?? item.mainDepartment,
                assessmentTemplate: templateName,
              }
            : item,
        );
      }

      return [
        ...templates,
        {
          mainDepartment: values.mainDepartment ?? "",
          assessmentTemplate: templateName,
          id: values.id || `TPL-${templates.length + 1}`,
          examTemplate: "",
          updater: "林珊",
          updatedAt: "2026-05-04 15:40",
        },
      ];
    })();

    onTemplatesChange(nextTemplates);
    setEditorOpen(false);
    setEditingTemplate(undefined);
  };

  const confirmDelete = (record: RegularizationFileTemplate) => {
    Modal.confirm({
      title: "删除转正文件配置",
      content: `确认删除 ${record.mainDepartment} 的转正文件配置吗？`,
      okText: "确认删除",
      okButtonProps: { danger: true },
      onOk: () => onTemplatesChange(templates.filter((item) => item.id !== record.id)),
    });
  };

  const columns: ColumnsType<RegularizationFileTemplate> = [
    { title: "适用部门", dataIndex: "mainDepartment", key: "mainDepartment", width: 140 },
    { title: "转正评估表模板", dataIndex: "assessmentTemplate", key: "assessmentTemplate", minWidth: 220 },
    {
      title: "操作",
      key: "action",
      width: 140,
      render: (_, record) => (
        <TableActions
          maxVisible={2}
          actions={[
            { key: "edit", label: "编辑", onClick: () => openEditor(record) },
            { key: "delete", label: "删除", danger: true, onClick: () => confirmDelete(record) },
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <Modal
        title="设置转正文件"
        open={open}
        onCancel={onClose}
        footer={<Button onClick={onClose}>关闭</Button>}
        width={920}
      >
        <Space style={{ marginBottom: 12 }}>
          <Button className="standard-list-filter__create-action" icon={<Plus size={16} />} onClick={() => openEditor()}>
            新增配置
          </Button>
        </Space>
        <Table columns={columns} dataSource={templates} pagination={false} rowKey="id" scroll={{ x: 560 }} />
      </Modal>
      <Modal
        title={editingTemplate ? "编辑转正文件配置" : "新增转正文件配置"}
        open={editorOpen}
        onCancel={() => setEditorOpen(false)}
        onOk={saveTemplate}
        okText="保存"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
          <Form.Item label="适用部门" name="mainDepartment" rules={[{ required: true, message: "请选择适用部门" }]}>
            <Select options={["财务部", "供应链中心", "信息中心", "运营中心", "仓储中心", "人事部"].map((item) => ({ value: item, label: item }))} />
          </Form.Item>
          <Form.Item
            label="转正评估表模板"
            name="assessmentTemplate"
            rules={[{ required: true, message: "请上传转正评估表模板" }]}
            valuePropName="fileList"
            getValueFromEvent={(event) => (Array.isArray(event) ? event : event?.fileList)}
          >
            <Upload.Dragger beforeUpload={() => false} maxCount={1}>
              <p className="upload-icon">
                <UploadCloud size={28} />
              </p>
              <p>上传转正评估表模板</p>
            </Upload.Dragger>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export function ProbationManagementPage() {
  const [records, setRecords] = useState<ProbationManagementRecord[]>(probationManagementRecords);
  const [fileTemplates, setFileTemplates] = useState<RegularizationFileTemplate[]>(probationFileTemplates);
  const [noticeRecord, setNoticeRecord] = useState<ProbationManagementRecord>();
  const [approvalDetailRecord, setApprovalDetailRecord] = useState<ProbationManagementRecord>();
  const [regularizeRecord, setRegularizeRecord] = useState<ProbationManagementRecord>();
  const [fileSettingsOpen, setFileSettingsOpen] = useState(false);
  const [editingExpectedDateId, setEditingExpectedDateId] = useState<string>();
  const [employeeFileState, setEmployeeFileState] = useState<{
    record: ProbationManagementRecord;
    mode: "preview" | "edit";
  }>();
  const [employeeFileForm] = Form.useForm<{ assessmentTemplate: string }>();
  const [regularizeForm] = Form.useForm();

  const sortedRecords = [...records].sort((a, b) => {
    if (!a.expectedRegularDate && b.expectedRegularDate) {
      return -1;
    }

    if (a.expectedRegularDate && !b.expectedRegularDate) {
      return 1;
    }

    if (a.expectedRegularDate !== b.expectedRegularDate) {
      return a.expectedRegularDate.localeCompare(b.expectedRegularDate);
    }

    return a.employeeCreatedAt.localeCompare(b.employeeCreatedAt);
  });

  const getMaintainedTemplateByDepartment = (department: string) =>
    fileTemplates.find((template) => template.mainDepartment === department);

  const getMaintainedRegularizationFileName = (record: ProbationManagementRecord) => {
    const templateName = record.assessmentTemplate ?? getMaintainedTemplateByDepartment(record.department)?.assessmentTemplate ?? "转正评估表.docx";

    return `${record.name}-${templateName}`;
  };

  const openNotice = (record?: ProbationManagementRecord) => {
    const target = record ?? records.find((item) => !item.actualRegularDate && item.noticeStatus === "未通知");

    if (!target) {
      Modal.info({ title: "暂无可通知员工", content: "当前筛选范围内没有未通知转正的员工。" });
      return;
    }

    if (!target.hasFormalAccount) {
      Modal.error({ title: "无法发起该操作", content: "当前员工无关联的正式账号，无法发起该操作。" });
      return;
    }

    if (target.actualRegularDate) {
      Modal.warning({ title: "无需通知", content: "当前员工已完成转正办理，无需再次通知。" });
      return;
    }

    setNoticeRecord(target);
  };

  const submitNotice = (record: ProbationManagementRecord) => {
    setRecords((current) =>
      current.map((item) =>
        item.id === record.id
          ? {
              ...item,
              noticeStatus: "已通知",
              approvalStatus: "待提交",
              updater: "林珊",
              updatedAt: "2026-05-04 15:20",
            }
          : item,
      ),
    );
  };

  const updateExpectedRegularDate = (recordId: string, value?: string) => {
    setRecords((current) =>
      current.map((item) =>
        item.id === recordId
          ? {
              ...item,
              expectedRegularDate: value ?? "",
              updater: "林珊",
              updatedAt: "2026-05-04 15:25",
            }
          : item,
      ),
    );
    setEditingExpectedDateId(undefined);
  };

  const openRegularize = (record: ProbationManagementRecord) => {
    if (record.approvalStatus === "审批中") {
      Modal.warning({ title: "暂不可办理", content: "请审批流程结束后(通过、驳回或撤销)，再进行手动办理。" });
      return;
    }

    regularizeForm.setFieldsValue({
      actualRegularDate: record.actualRegularDate
        ? dayjs(record.actualRegularDate)
        : record.expectedRegularDate
          ? dayjs(record.expectedRegularDate)
          : referenceDate,
    });
    setRegularizeRecord(record);
  };

  const submitRegularize = async () => {
    if (!regularizeRecord) {
      return;
    }

    const values = await regularizeForm.validateFields();
    const actualRegularDate = values.actualRegularDate.format("YYYY-MM-DD");

    setRecords((current) =>
      current.map((item) =>
        item.id === regularizeRecord.id
          ? {
              ...item,
              actualRegularDate,
              updater: "林珊",
              updatedAt: dayjs().format("YYYY-MM-DD HH:mm"),
            }
          : item,
      ),
    );
    setRegularizeRecord(undefined);
    regularizeForm.resetFields();
  };

  const openEmployeeFileEditor = (record: ProbationManagementRecord) => {
    employeeFileForm.setFieldsValue({
      assessmentTemplate: record.assessmentTemplate ?? getMaintainedTemplateByDepartment(record.department)?.assessmentTemplate ?? "转正评估表.docx",
    });
    setEmployeeFileState({ record, mode: "edit" });
  };

  const saveEmployeeFileTemplate = async () => {
    if (!employeeFileState || employeeFileState.mode !== "edit") {
      setEmployeeFileState(undefined);
      return;
    }

    const values = await employeeFileForm.validateFields();

    setRecords((current) =>
      current.map((item) =>
        item.id === employeeFileState.record.id
          ? {
              ...item,
              assessmentTemplate: values.assessmentTemplate,
              updater: "林珊",
              updatedAt: "2026-05-04 15:35",
            }
          : item,
      ),
    );
    setEmployeeFileState(undefined);
  };

  const columns: ColumnsType<ProbationManagementRecord> = [
    {
      title: "序号",
      key: "index",
      width: 70,
      fixed: "left",
      align: "center",
      render: (_value, _record, index) => index + 1,
    },
    { title: "员工编号", dataIndex: "employeeNo", key: "employeeNo", width: 120, fixed: "left" },
    { title: "姓名", dataIndex: "name", key: "name", width: 100 },
    { title: "区域", dataIndex: "area", key: "area", width: 90 },
    { title: "部门", dataIndex: "department", key: "department", width: 130 },
    { title: "岗位-职级", key: "positionRank", width: 140, render: (_, record) => `${record.position}-${record.rank}` },
    { title: "入职日期", dataIndex: "hireDate", key: "hireDate", width: 120 },
    {
      title: "预计转正日期",
      dataIndex: "expectedRegularDate",
      key: "expectedRegularDate",
      width: 140,
      onCell: (record) => ({
        className: shouldHighlightExpectedRegularDate(record) ? "probation-date-cell--warning" : "",
      }),
      render: (value: string, record) =>
        editingExpectedDateId === record.id ? (
          <DatePicker
            autoFocus
            size="small"
            value={value ? dayjs(value) : undefined}
            placeholder="未维护"
            onBlur={() => setEditingExpectedDateId(undefined)}
            onChange={(date) => updateExpectedRegularDate(record.id, date?.format("YYYY-MM-DD"))}
            style={{ width: 120 }}
          />
        ) : (
          <button
            className="probation-date-preview"
            type="button"
            onClick={() => setEditingExpectedDateId(record.id)}
          >
            {value || "未维护"}
          </button>
        ),
    },
    { title: "实际转正日期", dataIndex: "actualRegularDate", key: "actualRegularDate", width: 130, render: (value: string) => value || "-" },
    {
      title: "审批状态",
      dataIndex: "approvalStatus",
      key: "approvalStatus",
      width: 150,
      render: (status: ProbationApprovalStatus | undefined, record) => (
        <Space size={4}>
          {status ? <Tag color={approvalStatusColor[status]}>{status}</Tag> : <span>-</span>}
          {status ? (
            <Button
              type="link"
              size="small"
              onClick={() => setApprovalDetailRecord(record)}
            >
              详情
            </Button>
          ) : null}
        </Space>
      ),
    },
    {
      title: "转正文件",
      key: "regularizationFiles",
      width: 260,
      render: (_, record) => (
        <Space size={8} className="probation-file-cell">
          <Button
            aria-label="编辑转正文件模板"
            icon={<Edit3 size={15} />}
            onClick={() => openEmployeeFileEditor(record)}
            type="text"
          />
          <Button
            className="probation-file-name"
            type="link"
            onClick={() => setEmployeeFileState({ record, mode: "preview" })}
          >
            {getMaintainedRegularizationFileName(record)}
          </Button>
        </Space>
      ),
    },
    { title: "手机号码", dataIndex: "phone", key: "phone", width: 140 },
    { title: "负责HR", dataIndex: "responsibleHr", key: "responsibleHr", width: 100 },
    { title: "更新者", dataIndex: "updater", key: "updater", width: 100 },
    { title: "更新时间", dataIndex: "updatedAt", key: "updatedAt", width: 170 },
    {
      title: "操作",
      key: "action",
      width: 180,
      fixed: "right",
      render: (_, record) => (
        <TableActions
          maxVisible={2}
          actions={[
            ...(!record.actualRegularDate && record.noticeStatus === "未通知"
              ? [
                  {
                    key: "notice",
                    label: "转正通知",
                    onClick: () => openNotice(record),
                  },
                ]
              : []),
            {
              key: "regularize",
              label: "办理转正",
              onClick: () => openRegularize(record),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <main className="page">
      <section className="filter-panel standard-list-filter" aria-label="转正管理筛选区">
        <Form layout="inline">
          <Form.Item name="keyword">
            <Input allowClear placeholder="姓名和手机号" className="standard-list-filter__keyword" />
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
          <Form.Item name="position">
            <Input allowClear placeholder="岗位" style={{ width: 130 }} />
          </Form.Item>
          <Form.Item name="approvalStatus">
            <Select
              allowClear
              mode="multiple"
              maxTagCount="responsive"
              placeholder="审批状态"
              style={{ width: 170 }}
              options={["待提交", "审批中", "已驳回", "已通过"].map((item) => ({ value: item, label: item }))}
            />
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
          <Form.Item name="hireDate">
            <DatePicker.RangePicker placeholder={["入职开始", "入职结束"]} />
          </Form.Item>
          <Form.Item name="expectedRegularDate">
            <DatePicker.RangePicker placeholder={["预计转正开始", "预计转正结束"]} />
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
                <Button className="standard-list-filter__utility-action" icon={<FileCog size={16} />} onClick={() => setFileSettingsOpen(true)}>
                  设置转正文件
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
      <NoticeDrawer record={noticeRecord} onClose={() => setNoticeRecord(undefined)} onSubmit={submitNotice} />
      <ApprovalDetailDrawer record={approvalDetailRecord} onClose={() => setApprovalDetailRecord(undefined)} />
      <FileSettingsModal
        open={fileSettingsOpen}
        onClose={() => setFileSettingsOpen(false)}
        templates={fileTemplates}
        onTemplatesChange={setFileTemplates}
      />
      <Modal
        title={employeeFileState?.mode === "edit" ? "在线编辑转正文件" : "预览转正文件"}
        open={Boolean(employeeFileState)}
        onCancel={() => setEmployeeFileState(undefined)}
        onOk={employeeFileState?.mode === "edit" ? saveEmployeeFileTemplate : () => setEmployeeFileState(undefined)}
        okText={employeeFileState?.mode === "edit" ? "保存" : "关闭"}
        destroyOnClose
        width={760}
      >
        {employeeFileState ? (
          employeeFileState.mode === "preview" ? (
            <div className="probation-file-preview">
              <h3>{getMaintainedRegularizationFileName(employeeFileState.record)}</h3>
              <Descriptions
                bordered
                column={1}
                items={[
                  { key: "employee", label: "员工", children: `${employeeFileState.record.name}（${employeeFileState.record.employeeNo}）` },
                  { key: "department", label: "主部门", children: employeeFileState.record.department },
                  { key: "assessmentTemplate", label: "转正评估表模板", children: employeeFileState.record.assessmentTemplate || getMaintainedTemplateByDepartment(employeeFileState.record.department)?.assessmentTemplate || "未配置" },
                  { key: "examFile", label: "转正考试", children: employeeFileState.record.examFile || "未配置" },
                ]}
              />
              <div className="probation-file-preview__body">
                <strong>文件预览</strong>
                <p>这里展示员工转正评估表的在线预览内容，包含试用期表现、主管评价、转正薪资和附件信息。</p>
              </div>
            </div>
          ) : (
            <Form
              form={employeeFileForm}
              layout="vertical"
              initialValues={{
                assessmentTemplate: employeeFileState.record.assessmentTemplate,
              }}
            >
              <Form.Item label="转正评估表模板" name="assessmentTemplate" rules={[{ required: true, message: "请输入转正评估表模板" }]}>
                <Select
                  showSearch
                  options={fileTemplates.map((template) => ({
                    value: template.assessmentTemplate,
                    label: `${template.mainDepartment} / ${template.assessmentTemplate}`,
                  }))}
                />
              </Form.Item>
            </Form>
          )
        ) : null}
      </Modal>
      <Modal
        title="办理转正"
        open={Boolean(regularizeRecord)}
        onCancel={() => {
          setRegularizeRecord(undefined);
          regularizeForm.resetFields();
        }}
        onOk={submitRegularize}
        okText="确认办理"
      >
        <Form form={regularizeForm} layout="vertical">
          <Form.Item label="员工">
            <Input disabled value={regularizeRecord ? `${regularizeRecord.name}（${regularizeRecord.employeeNo}）` : ""} />
          </Form.Item>
          <Form.Item label="实际转正日期" name="actualRegularDate" rules={[{ required: true, message: "请选择实际转正日期" }]}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </main>
  );
}
