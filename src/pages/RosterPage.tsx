import {
  Alert,
  Button,
  DatePicker,
  Drawer,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table/interface";
import dayjs from "dayjs";
import { Download, Filter, Plus, RotateCcw, Save, Upload } from "lucide-react";
import { useState } from "react";
import { SectionPanel } from "../components/SectionPanel";
import { TableActions } from "../components/TableActions";
import { rosterRecords, rosterSelectOptions, type RosterRecord, type RosterStatus } from "../data/roster";
import "./Page.css";
import "./RosterPage.css";
import "./standards/Standards.css";

type DrawerMode = "create" | "edit" | "detail";

type RosterField = {
  label: string;
  name: string;
  kind: "input" | "textarea" | "select" | "multiSelect" | "date" | "month" | "readonly";
  options?: string[];
  disabled?: boolean;
  help?: string;
  rules?: Array<Record<string, unknown>>;
};

const statusColor: Record<RosterStatus, string> = {
  试用期: "blue",
  正式: "green",
  待离职: "gold",
  已离职: "default",
};

const phoneRule = { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号码" };
const idCardRule = { pattern: /^[1-9]\d{5}(18|19|20)\d{2}\d{2}\d{2}\d{3}[\dXx]$/, message: "请输入正确的身份证号码" };
const noWhitespaceRule = { pattern: /^\S+$/, message: "银行卡号不能包含空格" };

const baseFields: RosterField[] = [
  { label: "姓名", name: "name", kind: "input", rules: [{ required: true, message: "请输入姓名" }] },
  { label: "员工编号", name: "employeeNo", kind: "readonly", help: "创建新员工时自动生成，格式 LS+四位数字，无法编辑。" },
  { label: "区域", name: "area", kind: "select", options: rosterSelectOptions.areas, rules: [{ required: true, message: "请选择区域" }] },
  { label: "手机号码", name: "phone", kind: "input", rules: [phoneRule] },
  { label: "部门", name: "departments", kind: "multiSelect", options: rosterSelectOptions.departments, disabled: true, help: "仅展示，可通过调动功能更新。" },
  { label: "主部门", name: "primaryDepartment", kind: "select", options: rosterSelectOptions.departments, disabled: true, help: "只能从已选部门中确定，可通过调动功能更新。" },
  { label: "岗位", name: "positions", kind: "multiSelect", options: rosterSelectOptions.positions, disabled: true, help: "仅展示，可通过调动功能更新。" },
  { label: "职级", name: "rank", kind: "select", options: rosterSelectOptions.ranks, disabled: true, help: "仅展示，可通过调动功能更新。" },
  { label: "直属上级", name: "directLeader", kind: "select", options: rosterSelectOptions.leaders },
  { label: "招聘渠道", name: "recruitmentChannel", kind: "select", options: rosterSelectOptions.recruitmentChannels },
  { label: "邮箱", name: "email", kind: "input", rules: [{ type: "email", message: "请输入正确的邮箱" }] },
  { label: "备注", name: "remark", kind: "textarea" },
];

const employmentFields: RosterField[] = [
  { label: "员工类型", name: "employeeType", kind: "select", options: rosterSelectOptions.employeeTypes },
  { label: "员工状态", name: "employeeStatus", kind: "select", options: rosterSelectOptions.employeeStatuses, disabled: true, help: "不可直接编辑，根据转正日期自动更新。" },
  { label: "入职日期", name: "hireDate", kind: "date", help: "可以编辑，不能晚于转正日期。" },
  { label: "预计转正日期", name: "expectedRegularDate", kind: "date" },
  { label: "转正日期", name: "regularDate", kind: "date", disabled: true, help: "「办理转正」后产生，员工将于该日期自动转正。若需修改，请前往「转正管理」办理。" },
  { label: "工龄", name: "workingYears", kind: "readonly", help: "系统根据入职时间自动计算。" },
  { label: "合同", name: "contract", kind: "select", options: rosterSelectOptions.contracts },
  { label: "社保", name: "socialSecurity", kind: "select", options: rosterSelectOptions.socialSecurity },
  { label: "公积金", name: "providentFund", kind: "select", options: rosterSelectOptions.providentFund },
  { label: "负责HR", name: "responsibleHr", kind: "select", options: rosterSelectOptions.hrUsers, help: "仅人事管理员可编辑；无权限时提示：账号暂无该字段的编辑权限，请联系人事管理员修改。" },
  { label: "推荐人", name: "referrer", kind: "input" },
];

const personalFields: RosterField[] = [
  { label: "身份证号码", name: "idCardNo", kind: "input", rules: [idCardRule] },
  { label: "出生日期", name: "birthday", kind: "date", help: "由身份证带出，可校验后回填。" },
  { label: "性别", name: "gender", kind: "select", options: rosterSelectOptions.genders, help: "由身份证带出。" },
  { label: "民族", name: "nationality", kind: "select", options: rosterSelectOptions.nationalities },
  { label: "政治面貌", name: "politicalStatus", kind: "select", options: rosterSelectOptions.politicalStatuses },
  { label: "婚姻状况", name: "maritalStatus", kind: "select", options: rosterSelectOptions.maritalStatuses },
  { label: "户口", name: "hukou", kind: "select", options: rosterSelectOptions.hukou },
  { label: "户籍类型", name: "hukouType", kind: "select", options: rosterSelectOptions.hukouTypes },
  { label: "是否有落户需求", name: "settlementNeeded", kind: "select", options: rosterSelectOptions.yesNo },
  { label: "身份证地址", name: "idCardAddress", kind: "input" },
  { label: "现地址", name: "currentAddress", kind: "input" },
];

const educationFields: RosterField[] = [
  { label: "学历水平", name: "educationLevel", kind: "select", options: rosterSelectOptions.education },
  { label: "最高学历", name: "highestEducation", kind: "select", options: rosterSelectOptions.education },
  { label: "毕业院校", name: "school", kind: "input" },
  { label: "专业", name: "major", kind: "input" },
  { label: "毕业时间", name: "graduationMonth", kind: "month", help: "格式为年/月。" },
  { label: "毕业证书编号", name: "graduationCertificateNo", kind: "input" },
  { label: "学位证书编号", name: "degreeCertificateNo", kind: "input" },
  { label: "外文水平", name: "foreignLanguageLevel", kind: "input" },
  { label: "其他资格证书", name: "qualificationCertificates", kind: "input" },
  { label: "高考省份", name: "gaokaoProvince", kind: "select", options: ["四川", "广东", "福建", "其他"] },
  { label: "高考总分", name: "gaokaoTotalScore", kind: "input" },
  { label: "语文分数", name: "chineseScore", kind: "input" },
  { label: "数学分数", name: "mathScore", kind: "input" },
  { label: "英语分数", name: "englishScore", kind: "input" },
  { label: "其他科目类别", name: "otherSubjectType", kind: "select", options: rosterSelectOptions.examSubjectTypes },
  { label: "其他科目分数", name: "otherSubjectScore", kind: "input" },
];

const financeContactFields: RosterField[] = [
  { label: "银行卡开户行", name: "bankName", kind: "input" },
  { label: "银行卡号", name: "bankCardNo", kind: "input", rules: [noWhitespaceRule] },
  { label: "银行卡开户行（备用）", name: "backupBankName", kind: "input" },
  { label: "银行卡号（备用）", name: "backupBankCardNo", kind: "input", rules: [noWhitespaceRule] },
  { label: "紧急联系人名字", name: "emergencyContactName", kind: "input" },
  { label: "与紧急联系人关系", name: "emergencyContactRelation", kind: "input" },
  { label: "紧急联系方式", name: "emergencyContactPhone", kind: "input", rules: [phoneRule] },
];

const contractFields: RosterField[] = [
  { label: "合同主体", name: "contractSubject", kind: "select", options: rosterSelectOptions.contractSubjects, help: "默认带出合同选项值。" },
  { label: "合同类型", name: "contractType", kind: "select", options: rosterSelectOptions.contractTypes },
  { label: "合同开始时间", name: "contractStartDate", kind: "date" },
  { label: "合同结束时间", name: "contractEndDate", kind: "date" },
  { label: "劳动合同签订次数", name: "laborContractCount", kind: "readonly", help: "系统根据劳动合同信息自动计算。" },
];

const rosterFieldGroups = [
  { key: "base", title: "基础信息", fields: baseFields },
  { key: "employment", title: "任职信息", fields: employmentFields },
  { key: "personal", title: "身份信息", fields: personalFields },
  { key: "education", title: "教育经历", fields: educationFields },
  { key: "finance", title: "银行卡与联系人", fields: financeContactFields },
  { key: "contract", title: "合同信息", fields: contractFields },
];

const columns: ColumnsType<RosterRecord> = [
  {
    title: "序号",
    key: "index",
    width: 70,
    fixed: "left",
    align: "center",
    render: (_value, _record, index) => index + 1,
  },
  { title: "员工编号", dataIndex: "employeeNo", key: "employeeNo", width: 130, fixed: "left" },
  { title: "姓名", dataIndex: "name", key: "name", width: 110 },
  { title: "区域", dataIndex: "area", key: "area", width: 100 },
  { title: "手机号码", dataIndex: "phone", key: "phone", width: 140 },
  { title: "主部门", dataIndex: "primaryDepartment", key: "primaryDepartment", width: 140 },
  {
    title: "岗位",
    dataIndex: "positions",
    key: "positions",
    width: 150,
    render: (value: string[]) => value.join("、"),
  },
  { title: "职级", dataIndex: "rank", key: "rank", width: 90 },
  {
    title: "员工状态",
    dataIndex: "employeeStatus",
    key: "employeeStatus",
    width: 110,
    render: (status: RosterStatus) => <Tag color={statusColor[status]}>{status}</Tag>,
  },
  { title: "入职日期", dataIndex: "hireDate", key: "hireDate", width: 120 },
  { title: "转正日期", dataIndex: "regularDate", key: "regularDate", width: 120, render: (value: string) => value || "-" },
  { title: "负责HR", dataIndex: "responsibleHr", key: "responsibleHr", width: 110 },
  { title: "更新时间", dataIndex: "updatedAt", key: "updatedAt", width: 170 },
  {
    title: "操作",
    key: "action",
    width: 120,
    fixed: "right",
    render: (_, record) => (
      <TableActions
        actions={[
          { key: "detail", label: "详情", onClick: () => openRecordDrawer("detail", record) },
          { key: "edit", label: "编辑", onClick: () => openRecordDrawer("edit", record) },
          { key: "resign", label: "离职", danger: true, onClick: () => openResignConfirm(record) },
        ]}
      />
    ),
  },
];

let drawerDispatcher: (mode: DrawerMode, record?: RosterRecord) => void = () => undefined;
let resignDispatcher: (record: RosterRecord) => void = () => undefined;

function openRecordDrawer(mode: DrawerMode, record?: RosterRecord) {
  drawerDispatcher(mode, record);
}

function openResignConfirm(record: RosterRecord) {
  resignDispatcher(record);
}

function dateValue(value?: string) {
  return value ? dayjs(value) : undefined;
}

function buildInitialValues(record?: RosterRecord) {
  return {
    name: record?.name ?? "",
    employeeNo: record?.employeeNo ?? "LS0005",
    area: record?.area ?? "成都",
    phone: record?.phone ?? "",
    departments: record?.departments ?? ["运营中心"],
    primaryDepartment: record?.primaryDepartment ?? "运营中心",
    positions: record?.positions ?? ["运营主管"],
    rank: record?.rank ?? "P2",
    directLeader: record?.directLeader ?? "陈嘉",
    recruitmentChannel: "员工推荐",
    email: record?.email ?? "",
    remark: "",
    employeeType: record?.employeeType ?? "正式员工",
    employeeStatus: record?.employeeStatus ?? "试用期",
    hireDate: dateValue(record?.hireDate),
    expectedRegularDate: dateValue(record?.expectedRegularDate),
    regularDate: dateValue(record?.regularDate),
    workingYears: record?.workingYears ?? "系统自动计算",
    contract: "固定期限劳动合同",
    socialSecurity: "已缴纳",
    providentFund: "已缴纳",
    responsibleHr: record?.responsibleHr ?? "林珊",
    referrer: "",
    idCardNo: "510105199401011234",
    birthday: dayjs("1994-01-01"),
    gender: "女",
    nationality: "汉族",
    politicalStatus: "群众",
    maritalStatus: "未婚",
    hukou: "本市",
    hukouType: "城镇",
    settlementNeeded: "否",
    idCardAddress: "四川省成都市高新区",
    currentAddress: "成都市高新区天府大道",
    educationLevel: "本科",
    highestEducation: "本科",
    school: "四川大学",
    major: "工商管理",
    graduationMonth: dayjs("2017-06"),
    graduationCertificateNo: "BY2017060001",
    degreeCertificateNo: "XW2017060001",
    foreignLanguageLevel: "CET-6",
    qualificationCertificates: "人力资源管理师",
    gaokaoProvince: "四川",
    gaokaoTotalScore: "612",
    chineseScore: "118",
    mathScore: "126",
    englishScore: "132",
    otherSubjectType: "理综",
    otherSubjectScore: "236",
    bankName: "招商银行成都分行",
    bankCardNo: "6225880012345678",
    backupBankName: "",
    backupBankCardNo: "",
    emergencyContactName: "陈明",
    emergencyContactRelation: "父亲",
    emergencyContactPhone: "13800019999",
    contractSubject: "成都拉森科技有限公司",
    contractType: "劳动合同",
    contractStartDate: dateValue(record?.hireDate),
    contractEndDate: dayjs("2027-12-31"),
    laborContractCount: "2",
  };
}

function renderField(field: RosterField) {
  const disabled = field.disabled;
  const commonProps = { disabled };

  if (field.kind === "readonly") {
    return <Input disabled />;
  }

  if (field.kind === "textarea") {
    return <Input.TextArea {...commonProps} rows={3} />;
  }

  if (field.kind === "select") {
    return (
      <Select
        {...commonProps}
        allowClear
        options={field.options?.map((option) => ({ value: option, label: option }))}
      />
    );
  }

  if (field.kind === "multiSelect") {
    return (
      <Select
        {...commonProps}
        allowClear
        mode="multiple"
        options={field.options?.map((option) => ({ value: option, label: option }))}
      />
    );
  }

  if (field.kind === "date") {
    return <DatePicker {...commonProps} style={{ width: "100%" }} />;
  }

  if (field.kind === "month") {
    return <DatePicker {...commonProps} picker="month" style={{ width: "100%" }} />;
  }

  return <Input {...commonProps} />;
}

function renderFieldGroup(fields: RosterField[]) {
  return (
    <div className="roster-form-grid">
      {fields.map((field) => (
        <Form.Item key={field.name} label={field.label} name={field.name} rules={field.rules}>
          {renderField(field)}
        </Form.Item>
      ))}
    </div>
  );
}

function formatDetailValue(field: RosterField, value: unknown) {
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join("、") : "-";
  }

  if (dayjs.isDayjs(value)) {
    return value.format(field.kind === "month" ? "YYYY-MM" : "YYYY-MM-DD");
  }

  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return "-";
}

function renderDetailGroup(fields: RosterField[], values: Record<string, unknown>) {
  return (
    <dl className="roster-detail-list">
      {fields.map((field) => (
        <div key={field.name} className="roster-detail-item">
          <dt>{field.label}</dt>
          <dd>{formatDetailValue(field, values[field.name])}</dd>
        </div>
      ))}
    </dl>
  );
}

function RosterDrawer({
  mode,
  record,
  open,
  onClose,
}: {
  mode: DrawerMode;
  record?: RosterRecord;
  open: boolean;
  onClose: () => void;
}) {
  const readonly = mode === "detail";
  const title = mode === "create" ? "添加员工" : mode === "edit" ? "编辑员工" : "员工详情";
  const initialValues = buildInitialValues(record);

  return (
    <Drawer
      className="roster-drawer"
      destroyOnClose
      extra={
        readonly ? (
          <Button onClick={onClose}>关闭</Button>
        ) : (
          <Space>
            <Button onClick={onClose}>取消</Button>
            <Button type="primary" icon={<Save size={16} />} onClick={onClose}>
              保存
            </Button>
          </Space>
        )
      }
      onClose={onClose}
      open={open}
      title={title}
      width={1040}
    >
      {readonly ? (
        <div className="roster-drawer__content">
          {rosterFieldGroups.map((group) => (
            <SectionPanel key={group.key} title={group.title}>
              {renderDetailGroup(group.fields, initialValues)}
            </SectionPanel>
          ))}
        </div>
      ) : (
        <Form className="roster-drawer__content" layout="vertical" initialValues={initialValues}>
          <Alert
            className="roster-inline-tip"
            message="部门、主部门、岗位、职级和员工状态不可直接编辑，如需调整请发起调动或转正流程。"
            action={<Button size="small">发起调动</Button>}
            type="info"
            showIcon
          />
          {rosterFieldGroups.map((group) => (
            <SectionPanel key={group.key} title={group.title}>
              {renderFieldGroup(group.fields)}
            </SectionPanel>
          ))}
        </Form>
      )}
    </Drawer>
  );
}

export function RosterPage() {
  const [drawerState, setDrawerState] = useState<{ open: boolean; mode: DrawerMode; record?: RosterRecord }>({
    open: false,
    mode: "detail",
  });
  const [batchOpen, setBatchOpen] = useState(false);
  const [resignRecord, setResignRecord] = useState<RosterRecord>();

  drawerDispatcher = (mode, record) => setDrawerState({ open: true, mode, record });
  resignDispatcher = (record) => setResignRecord(record);

  return (
    <main className="page">
      <section className="filter-panel standard-list-filter" aria-label="花名册筛选区">
        <Form layout="inline">
          <Form.Item name="keyword">
            <Input allowClear placeholder="姓名、员工编号、手机号码" className="standard-list-filter__keyword" />
          </Form.Item>
          <Form.Item name="area">
            <Select
              allowClear
              placeholder="区域"
              style={{ width: 120 }}
              options={rosterSelectOptions.areas.map((area) => ({ value: area, label: area }))}
            />
          </Form.Item>
          <Form.Item name="department">
            <Select
              allowClear
              placeholder="部门"
              style={{ width: 140 }}
              options={rosterSelectOptions.departments.map((department) => ({ value: department, label: department }))}
            />
          </Form.Item>
          <Form.Item name="employeeStatus">
            <Select
              allowClear
              placeholder="员工状态"
              style={{ width: 140 }}
              options={rosterSelectOptions.employeeStatuses.map((status) => ({ value: status, label: status }))}
            />
          </Form.Item>
          <Form.Item name="hireDate">
            <DatePicker.RangePicker placeholder={["入职开始", "入职结束"]} />
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
                <Button
                  className="standard-list-filter__create-action"
                  icon={<Plus size={16} />}
                  onClick={() => openRecordDrawer("create")}
                >
                  添加员工
                </Button>
                <Button className="standard-list-filter__utility-action" icon={<Upload size={16} />} onClick={() => setBatchOpen(true)}>
                  批量更新
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
          dataSource={rosterRecords}
          pagination={{ current: 1, pageSize: 10, total: rosterRecords.length, showSizeChanger: true }}
          rowKey="id"
          scroll={{ x: 1790 }}
        />
      </SectionPanel>
      <RosterDrawer
        mode={drawerState.mode}
        record={drawerState.record}
        open={drawerState.open}
        onClose={() => setDrawerState((current) => ({ ...current, open: false }))}
      />
      <Modal
        title="批量更新花名册"
        open={batchOpen}
        onCancel={() => setBatchOpen(false)}
        onOk={() => setBatchOpen(false)}
        okText="确认更新"
      >
        <Form layout="vertical">
          <Form.Item label="更新字段" name="field">
            <Select
              placeholder="请选择需要批量更新的字段"
              options={[
                { value: "responsibleHr", label: "负责HR" },
                { value: "contract", label: "合同" },
                { value: "socialSecurity", label: "社保" },
                { value: "providentFund", label: "公积金" },
              ]}
            />
          </Form.Item>
          <Form.Item label="更新值" name="value">
            <Input placeholder="请输入更新后的值" />
          </Form.Item>
          <Alert message="批量更新会按当前筛选结果执行，提交前请确认筛选条件。" type="warning" showIcon />
        </Form>
      </Modal>
      <Modal
        title="确认办理离职"
        open={Boolean(resignRecord)}
        onCancel={() => setResignRecord(undefined)}
        onOk={() => setResignRecord(undefined)}
        okText="确认离职"
        okButtonProps={{ danger: true }}
      >
        <p>
          将为 <strong>{resignRecord?.name}</strong> 发起离职操作，员工状态会进入待离职流程。
        </p>
      </Modal>
    </main>
  );
}
