import {
  Button,
  Checkbox,
  Descriptions,
  Input,
  InputNumber,
  Modal,
  Popover,
  Segmented,
  Space,
  Table,
  Tag,
  Tree,
} from "antd";
import type { ColumnsType, FilterValue } from "antd/es/table/interface";
import type { DataNode } from "antd/es/tree";
import { Building2, RotateCcw, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type {
  PayrollApprovalInfo,
  PayrollDepartmentRecord,
  PayrollEmployeeRecord,
} from "../data/payrollApproval";

type PayrollApprovalDetailProps = {
  info: PayrollApprovalInfo;
};

type PayrollView = "department" | "employee";
type DepartmentView = "tree" | "flat";
type DetailItem = { label: string; value: string };
type DepartmentDetailKind = "commission" | "kpi" | "subsidy" | "attendance";
type DetailModalState = { title: string; kind: DepartmentDetailKind; department: PayrollDepartmentRecord };
type EditableFields = Record<string, { remark: string; auditAdjustment: number }>;
type LevelFilterValue = string | number | boolean;
type TreeFilterKey = string;

const moneyFormatter = new Intl.NumberFormat("zh-CN", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const decimalFormatter = new Intl.NumberFormat("zh-CN", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

const employeeNumericKeys = [
  "salaryTotal",
  "expectedAttendance",
  "actualAttendance",
  "leaveDays",
  "lateCount",
  "clockRepairCount",
  "overtime",
  "kpiPaid",
  "commissionPaid",
  "remainingCommission",
  "bonus",
  "comprehensiveSubsidy",
  "attendanceSubsidy",
  "businessSubsidy",
  "welfareSubsidy",
  "attendanceDeduction",
  "otherDeduction",
  "withholdingDeduction",
  "previousMonthDiff",
  "auditAdjustment",
  "payableSalary",
  "actualSalary",
];

function formatMoney(value: number) {
  return moneyFormatter.format(value);
}

function formatNumber(value: number) {
  return decimalFormatter.format(value);
}

function formatPercent(value: number) {
  return `${decimalFormatter.format(value)}%`;
}

function parseNumericText(value: string) {
  return Number(value.replace(/,/g, "").replace("%", "")) || 0;
}

function flattenDepartments(departments: PayrollDepartmentRecord[]): PayrollDepartmentRecord[] {
  return departments.flatMap((department) => [
    department,
    ...(department.children ? flattenDepartments(department.children) : []),
  ]);
}

function uniqueOptions(values: string[]) {
  return Array.from(new Set(values)).map((value) => ({ text: value, value }));
}

function getEmployeeActualSalary(record: PayrollEmployeeRecord, editableFields: EditableFields) {
  return record.payableSalary + (editableFields[record.id]?.auditAdjustment ?? record.auditAdjustment);
}

function detailList(items: DetailItem[]) {
  return (
    <dl className="payroll-detail-list">
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function getDetailValue(items: DetailItem[], label: string) {
  return items.find((item) => item.label === label)?.value ?? "-";
}

function DetailValue({
  value,
  items,
  title,
}: {
  value: string | number;
  items: DetailItem[];
  title: string;
}) {
  return (
    <Popover placement="bottom" title={title} content={detailList(items)} trigger="click">
      <Button type="link" className="payroll-inline-link">
        {typeof value === "number" ? formatNumber(value) : value}
      </Button>
    </Popover>
  );
}

function makeDepartmentKey(name: string) {
  return `dept:${name}`;
}

function makeEmployeeKey(id: string) {
  return `employee:${id}`;
}

function parseDepartmentKey(key: string) {
  return key.startsWith("dept:") ? key.slice(5) : undefined;
}

function parseEmployeeKey(key: string) {
  return key.startsWith("employee:") ? key.slice(9) : undefined;
}

function DepartmentIcon() {
  return (
    <span className="payroll-tree-icon payroll-tree-icon--department">
      <Building2 size={13} />
    </span>
  );
}

function EmployeeIcon({ gender }: { gender: PayrollEmployeeRecord["gender"] }) {
  return (
    <span className={`payroll-tree-icon payroll-tree-icon--employee payroll-tree-icon--${gender === "女" ? "female" : "male"}`}>
      <UserRound size={12} />
    </span>
  );
}

function buildEmployeeTreeData(
  departments: PayrollDepartmentRecord[],
  employees: PayrollEmployeeRecord[],
  query: string,
): DataNode[] {
  const keyword = query.trim().toLowerCase();

  return departments.reduce<DataNode[]>((nodes, department) => {
      const childDepartments = buildEmployeeTreeData(department.children ?? [], employees, query);
      const directEmployees = employees.filter((employee) => employee.department === department.name);
      const visibleDirectEmployees = keyword
        ? directEmployees.filter((employee) => employee.name.toLowerCase().includes(keyword))
        : directEmployees;
      const departmentMatched = keyword ? department.name.toLowerCase().includes(keyword) : true;
      const employeeNodes = visibleDirectEmployees.map((employee) => ({
        key: makeEmployeeKey(employee.id),
        title: employee.name,
        icon: <EmployeeIcon gender={employee.gender} />,
      }));
      const children = [...childDepartments, ...employeeNodes];

      if (!departmentMatched && children.length === 0) {
        return nodes;
      }

      nodes.push({
        key: makeDepartmentKey(department.name),
        title: (
          <span className="payroll-tree-title">
            <span>{department.name}</span>
            <span className="payroll-tree-count">({countDepartmentEmployees(department, employees)})</span>
          </span>
        ),
        icon: <DepartmentIcon />,
        children,
      });

      return nodes;
    }, []);
}

function toFlatDepartmentRecord(department: PayrollDepartmentRecord): PayrollDepartmentRecord {
  const { children: _children, ...flatDepartment } = department;

  return flatDepartment;
}

function findDepartmentDescendantNames(department: PayrollDepartmentRecord) {
  return new Set(flattenDepartments([department]).map((item) => item.name));
}

function countDepartmentEmployees(department: PayrollDepartmentRecord, employees: PayrollEmployeeRecord[]) {
  const departmentScope = findDepartmentDescendantNames(department);
  return employees.filter((employee) => departmentScope.has(employee.department)).length;
}

function buildEmployeeDetailItems(record: PayrollEmployeeRecord, editableFields: EditableFields) {
  const editable = editableFields[record.id] ?? {
    remark: record.remark,
    auditAdjustment: record.auditAdjustment,
  };

  return {
    basic: [
      { key: "name", label: "姓名", children: record.name },
      { key: "area", label: "区域", children: record.area },
      { key: "department", label: "部门", children: record.department },
      { key: "position", label: "岗位", children: record.position },
      { key: "rank", label: "职级", children: record.rank },
      { key: "hireDate", label: "入职日期", children: record.hireDate },
      { key: "regularDate", label: "转正日期", children: record.regularDate },
      { key: "resignationDate", label: "离职日期", children: record.resignationDate ?? "-" },
      { key: "salaryStructure", label: "薪资结构", children: record.salaryStructure },
    ],
    attendance: [
      { key: "expectedAttendance", label: "应出勤天数", children: formatNumber(record.expectedAttendance) },
      { key: "actualAttendance", label: "实出勤天数", children: formatNumber(record.actualAttendance) },
      { key: "leaveDays", label: "请假天数", children: detailList(record.leaveDetails) },
      { key: "lateCount", label: "迟到次数", children: record.lateCount },
      { key: "clockRepairCount", label: "补卡次数", children: record.clockRepairCount },
      { key: "overtime", label: "加班", children: detailList(record.overtimeDetails) },
    ],
    kpi: [
      { key: "kpiSalary", label: "KPI 工资", children: record.kpiDetails[0]?.value ?? "-" },
      { key: "kpiScore", label: "KPI 分数", children: record.kpiDetails[1]?.value ?? "-" },
      { key: "kpiPaid", label: "实发 KPI", children: formatMoney(record.kpiPaid) },
    ],
    commission: [
      { key: "commissionPaid", label: "实发提成", children: formatMoney(record.commissionPaid) },
      { key: "remainingCommission", label: "剩余提成", children: formatMoney(record.remainingCommission) },
      ...record.commissionDetails.map((item) => ({
        key: item.label,
        label: item.label,
        children: item.value,
      })),
    ],
    bonus: record.bonusDetails.map((item) => ({
      key: item.label,
      label: item.label,
      children: item.value,
    })),
    comprehensiveSubsidy: record.comprehensiveSubsidyDetails.map((item) => ({
      key: item.label,
      label: item.label,
      children: item.value,
    })),
    settlement: [
      { key: "remark", label: "备注", children: editable.remark || "-" },
      { key: "auditAdjustment", label: "审核调整", children: formatMoney(editable.auditAdjustment) },
      { key: "payableSalary", label: "应付工资", children: formatMoney(record.payableSalary) },
      {
        key: "actualSalary",
        label: "实付工资",
        children: formatMoney(getEmployeeActualSalary(record, editableFields)),
      },
    ],
  };
}

export function PayrollApprovalDetail({ info }: PayrollApprovalDetailProps) {
  const [activeView, setActiveView] = useState<PayrollView>("department");
  const [departmentView, setDepartmentView] = useState<DepartmentView>("tree");
  const [visibleLevels, setVisibleLevels] = useState<LevelFilterValue[]>([]);
  const [expandedDepartmentRowKeys, setExpandedDepartmentRowKeys] = useState<string[]>(() =>
    flattenDepartments(info.departments).map((department) => department.id),
  );
  const [selectedTreeKeys, setSelectedTreeKeys] = useState<TreeFilterKey[]>([]);
  const [expandedTreeKeys, setExpandedTreeKeys] = useState<TreeFilterKey[]>(() =>
    flattenDepartments(info.departments).map((department) => makeDepartmentKey(department.name)),
  );
  const [treeSearch, setTreeSearch] = useState("");
  const [filteredInfo, setFilteredInfo] = useState<Record<string, FilterValue | null>>({});
  const [departmentFilteredInfo, setDepartmentFilteredInfo] = useState<Record<string, FilterValue | null>>({});
  const [detailModal, setDetailModal] = useState<DetailModalState>();
  const [employeeDetail, setEmployeeDetail] = useState<PayrollEmployeeRecord>();
  const [editableFields, setEditableFields] = useState<EditableFields>(() =>
    Object.fromEntries(
      info.employees.map((employee) => [
        employee.id,
        { remark: employee.remark, auditAdjustment: employee.auditAdjustment },
      ]),
    ),
  );

  const departments = useMemo(() => flattenDepartments(info.departments), [info.departments]);
  const allDepartmentRowKeys = useMemo(() => departments.map((department) => department.id), [departments]);
  const departmentKeys = useMemo(() => new Set(departments.map((department) => makeDepartmentKey(department.name))), [departments]);
  const employeeKeys = useMemo(() => new Set(info.employees.map((employee) => makeEmployeeKey(employee.id))), [info.employees]);
  const selectedDepartmentNames = useMemo(
    () => selectedTreeKeys.map(parseDepartmentKey).filter((name): name is string => Boolean(name)),
    [selectedTreeKeys],
  );
  const selectedEmployeeIds = useMemo(
    () => selectedTreeKeys.map(parseEmployeeKey).filter((id): id is string => Boolean(id)),
    [selectedTreeKeys],
  );
  const selectedDescendants = useMemo(() => {
    if (selectedDepartmentNames.length === 0 || selectedDepartmentNames.includes(info.organization)) {
      return new Set<string>();
    }

    const selectedNodes = departments.filter((department) => selectedDepartmentNames.includes(department.name));
    if (selectedNodes.length === 0) {
      return new Set<string>();
    }

    return new Set(selectedNodes.flatMap((department) => Array.from(findDepartmentDescendantNames(department))));
  }, [departments, info.organization, selectedDepartmentNames]);

  const visibleEmployees = useMemo(() => {
    if (selectedTreeKeys.length === 0 || selectedDepartmentNames.includes(info.organization)) {
      return info.employees;
    }

    return info.employees.filter(
      (employee) => selectedDescendants.has(employee.department) || selectedEmployeeIds.includes(employee.id),
    );
  }, [info.employees, info.organization, selectedDepartmentNames, selectedDescendants, selectedEmployeeIds, selectedTreeKeys.length]);

  const employeeTreeData = useMemo(
    () => buildEmployeeTreeData(info.departments, info.employees, treeSearch),
    [info.departments, info.employees, treeSearch],
  );
  const defaultExpandedDepartmentKeys = useMemo(
    () => departments.map((department) => makeDepartmentKey(department.name)),
    [departments],
  );
  const searchExpandedTreeKeys = useMemo(
    () => defaultExpandedDepartmentKeys,
    [defaultExpandedDepartmentKeys],
  );

  useEffect(() => {
    setExpandedTreeKeys(defaultExpandedDepartmentKeys);
  }, [defaultExpandedDepartmentKeys]);

  useEffect(() => {
    if (activeView === "department" && departmentView === "tree") {
      setExpandedDepartmentRowKeys(allDepartmentRowKeys);
    }
  }, [activeView, allDepartmentRowKeys, departmentView]);

  const getDepartmentEmployees = (department: PayrollDepartmentRecord) => {
    const sourceDepartment = departments.find((item) => item.id === department.id) ?? department;

    if (sourceDepartment.name === info.organization) {
      return info.employees;
    }

    const departmentScope = findDepartmentDescendantNames(sourceDepartment);
    return info.employees.filter((employee) => departmentScope.has(employee.department));
  };

  const getDepartmentMetrics = (department: PayrollDepartmentRecord) => {
    const employees = getDepartmentEmployees(department);
    const payrollCount = employees.length;
    const payableSalaryTotal = employees.reduce((total, employee) => total + employee.payableSalary, 0);
    const actualSalaryTotal = employees.reduce((total, employee) => total + getEmployeeActualSalary(employee, editableFields), 0);
    const commissionTotal = employees.reduce((total, employee) => total + employee.commissionPaid, 0);
    const kpiPaidTotal = employees.reduce((total, employee) => total + employee.kpiPaid, 0);
    const kpiScoreTotal = employees.reduce(
      (total, employee) => total + parseNumericText(getDetailValue(employee.kpiDetails, "KPI 分数")),
      0,
    );
    const subsidyTotal = employees.reduce(
      (total, employee) =>
        total +
        employee.bonus +
        employee.comprehensiveSubsidy +
        employee.attendanceSubsidy +
        employee.businessSubsidy +
        employee.welfareSubsidy,
      0,
    );
    const expectedAttendanceTotal = employees.reduce((total, employee) => total + employee.expectedAttendance, 0);
    const actualAttendanceTotal = employees.reduce((total, employee) => total + employee.actualAttendance, 0);
    const attendanceDeductionTotal = employees.reduce((total, employee) => total + employee.attendanceDeduction, 0);

    return {
      payrollCount,
      payableSalaryTotal,
      actualSalaryTotal,
      averageSalary: payrollCount > 0 ? actualSalaryTotal / payrollCount : 0,
      commissionTotal,
      averageCommission: payrollCount > 0 ? commissionTotal / payrollCount : 0,
      averageKpiScore: payrollCount > 0 ? kpiScoreTotal / payrollCount : 0,
      averageKpiPaid: payrollCount > 0 ? kpiPaidTotal / payrollCount : 0,
      subsidyTotal,
      attendanceRate: expectedAttendanceTotal > 0 ? (actualAttendanceTotal / expectedAttendanceTotal) * 100 : 0,
      averageAttendanceDeduction: payrollCount > 0 ? attendanceDeductionTotal / payrollCount : 0,
    };
  };

  const departmentColumns: ColumnsType<PayrollDepartmentRecord> = [
    {
      title: "部门名称",
      dataIndex: "name",
      key: "name",
      width: 220,
      fixed: "left",
      filterSearch: true,
      filters: uniqueOptions(departments.map((department) => department.name)),
      filteredValue: departmentFilteredInfo.name ?? null,
      onFilter: (value, record) => record.name === value,
      render: (name: string, record) => (
        <Button
          type="link"
          className="payroll-department-link"
          style={{ paddingLeft: departmentView === "tree" ? Math.max(record.level - 1, 0) * 12 : 0 }}
          onClick={() => {
            setSelectedTreeKeys([makeDepartmentKey(name)]);
            setActiveView("employee");
          }}
        >
          {name}
        </Button>
      ),
    },
    {
      title: "主管",
      dataIndex: "manager",
      key: "manager",
      width: 100,
      filterSearch: true,
      filters: uniqueOptions(departments.map((department) => department.manager)),
      filteredValue: departmentFilteredInfo.manager ?? null,
      onFilter: (value, record) => record.manager === value,
    },
    {
      title: "算薪人数",
      key: "payrollCount",
      width: 100,
      align: "right",
      render: (_, record) => getDepartmentMetrics(record).payrollCount,
      filters: [
        { text: "1-2 人", value: "small" },
        { text: "3-4 人", value: "medium" },
        { text: "5 人及以上", value: "large" },
      ],
      filteredValue: departmentFilteredInfo.payrollCount ?? null,
      onFilter: (value, record) => {
        const payrollCount = getDepartmentMetrics(record).payrollCount;

        if (value === "small") {
          return payrollCount <= 2;
        }

        if (value === "medium") {
          return payrollCount >= 3 && payrollCount <= 4;
        }

        return payrollCount >= 5;
      },
    },
    {
      title: "应发工资合计",
      key: "payableSalaryTotal",
      width: 130,
      align: "right",
      render: (_, record) => formatMoney(getDepartmentMetrics(record).payableSalaryTotal),
    },
    {
      title: "实发工资合计",
      key: "actualSalaryTotal",
      width: 130,
      align: "right",
      render: (_, record) => formatMoney(getDepartmentMetrics(record).actualSalaryTotal),
    },
    {
      title: "人均薪资合计",
      key: "averageSalary",
      width: 130,
      align: "right",
      render: (_, record) => formatMoney(getDepartmentMetrics(record).averageSalary),
    },
    {
      title: "提成合计",
      key: "commissionTotal",
      width: 120,
      align: "right",
      render: (_, record) => formatMoney(getDepartmentMetrics(record).commissionTotal),
    },
    {
      title: "人均提成",
      key: "averageCommission",
      width: 110,
      align: "right",
      render: (_, record) => (
        <Button
          type="link"
          className="payroll-inline-link"
          onClick={() => setDetailModal({ title: `${record.name} 提成明细`, kind: "commission", department: record })}
        >
          {formatMoney(getDepartmentMetrics(record).averageCommission)}
        </Button>
      ),
    },
    {
      title: "人均KPI分数",
      key: "averageKpiScore",
      width: 120,
      align: "right",
      render: (_, record) => formatNumber(getDepartmentMetrics(record).averageKpiScore),
    },
    {
      title: "人均绩效",
      key: "averageKpiPaid",
      width: 120,
      align: "right",
      render: (_, record) => (
        <Button
          type="link"
          className="payroll-inline-link"
          onClick={() => setDetailModal({ title: `${record.name} 绩效明细`, kind: "kpi", department: record })}
        >
          {formatMoney(getDepartmentMetrics(record).averageKpiPaid)}
        </Button>
      ),
    },
    {
      title: "奖金/补贴合计",
      key: "subsidyTotal",
      width: 130,
      align: "right",
      render: (_, record) => (
        <Button
          type="link"
          className="payroll-inline-link"
          onClick={() => setDetailModal({ title: `${record.name} 奖金/补贴明细`, kind: "subsidy", department: record })}
        >
          {formatMoney(getDepartmentMetrics(record).subsidyTotal)}
        </Button>
      ),
    },
    {
      title: "出勤率",
      key: "attendanceRate",
      width: 100,
      align: "right",
      render: (_, record) => formatPercent(getDepartmentMetrics(record).attendanceRate),
    },
    {
      title: "人均考勤扣款",
      key: "averageAttendanceDeduction",
      width: 120,
      align: "right",
      render: (_, record) => (
        <Button
          type="link"
          className="payroll-inline-link"
          onClick={() => setDetailModal({ title: `${record.name} 考勤扣款明细`, kind: "attendance", department: record })}
        >
          {formatMoney(getDepartmentMetrics(record).averageAttendanceDeduction)}
        </Button>
      ),
    },
  ];

  const employeeColumns: ColumnsType<PayrollEmployeeRecord> = [
    {
      title: "姓名",
      dataIndex: "name",
      key: "name",
      width: 92,
      fixed: "left",
      render: (name: string, record, index) => (
        <Space size={6}>
          <span className="payroll-row-index">{index + 1}</span>
          <Button
            type="link"
            className={record.resignationDate ? "payroll-resigned-name" : "payroll-inline-link"}
            title={record.resignationDate ? `离职日期：${record.resignationDate}` : undefined}
            onClick={() => setEmployeeDetail(record)}
          >
            {name}
          </Button>
        </Space>
      ),
    },
    {
      title: "区域",
      dataIndex: "area",
      key: "area",
      width: 82,
      filters: uniqueOptions(info.employees.map((employee) => employee.area)),
      filteredValue: filteredInfo.area ?? null,
      onFilter: (value, record) => record.area === value,
    },
    {
      title: "部门",
      dataIndex: "department",
      key: "department",
      width: 102,
      filters: uniqueOptions(info.employees.map((employee) => employee.department)),
      filteredValue: filteredInfo.department ?? null,
      onFilter: (value, record) => record.department === value,
    },
    {
      title: "岗位",
      dataIndex: "position",
      key: "position",
      width: 96,
      filters: uniqueOptions(info.employees.map((employee) => employee.position)),
      filteredValue: filteredInfo.position ?? null,
      onFilter: (value, record) => record.position === value,
    },
    {
      title: "职级",
      dataIndex: "rank",
      key: "rank",
      width: 62,
      filters: uniqueOptions(info.employees.map((employee) => employee.rank)),
      filteredValue: filteredInfo.rank ?? null,
      onFilter: (value, record) => record.rank === value,
    },
    { title: "入职日期", dataIndex: "hireDate", key: "hireDate", width: 94 },
    { title: "转正日期", dataIndex: "regularDate", key: "regularDate", width: 94 },
    {
      title: "薪资合计",
      dataIndex: "salaryTotal",
      key: "salaryTotal",
      width: 88,
      align: "right",
      render: formatMoney,
    },
    { title: "薪资结构", dataIndex: "salaryStructure", key: "salaryStructure", width: 150 },
    {
      title: "应出勤天数",
      dataIndex: "expectedAttendance",
      key: "expectedAttendance",
      width: 84,
      align: "right",
      render: formatNumber,
    },
    {
      title: "实出勤天数",
      dataIndex: "actualAttendance",
      key: "actualAttendance",
      width: 84,
      align: "right",
      render: formatNumber,
    },
    {
      title: "请假天数",
      dataIndex: "leaveDays",
      key: "leaveDays",
      width: 84,
      align: "right",
      render: (value: number, record) => (
        <DetailValue title={`${record.name} 假勤明细`} value={value} items={record.leaveDetails} />
      ),
    },
    { title: "迟到次数", dataIndex: "lateCount", key: "lateCount", width: 76, align: "right" },
    { title: "补卡次数", dataIndex: "clockRepairCount", key: "clockRepairCount", width: 76, align: "right" },
    {
      title: "加班",
      dataIndex: "overtime",
      key: "overtime",
      width: 64,
      align: "right",
      render: (value: number, record) => (
        <DetailValue title={`${record.name} 加班明细`} value={value} items={record.overtimeDetails} />
      ),
    },
    {
      title: "实发 KPI",
      dataIndex: "kpiPaid",
      key: "kpiPaid",
      width: 84,
      align: "right",
      render: (value: number, record) => (
        <DetailValue title={`${record.name} KPI 明细`} value={formatMoney(value)} items={record.kpiDetails} />
      ),
    },
    {
      title: "实发提成",
      dataIndex: "commissionPaid",
      key: "commissionPaid",
      width: 88,
      align: "right",
      render: (value: number, record) => (
        <DetailValue title={`${record.name} 提成明细`} value={formatMoney(value)} items={record.commissionDetails} />
      ),
    },
    {
      title: "剩余提成",
      dataIndex: "remainingCommission",
      key: "remainingCommission",
      width: 88,
      align: "right",
      render: (value: number, record) => (
        <DetailValue title={`${record.name} 剩余提成明细`} value={formatMoney(value)} items={record.commissionDetails} />
      ),
    },
    {
      title: "奖金",
      dataIndex: "bonus",
      key: "bonus",
      width: 70,
      align: "right",
      render: (value: number, record) => (
        <DetailValue title={`${record.name} 奖金明细`} value={formatMoney(value)} items={record.bonusDetails} />
      ),
    },
    {
      title: "实发综合补贴",
      dataIndex: "comprehensiveSubsidy",
      key: "comprehensiveSubsidy",
      width: 108,
      align: "right",
      render: (value: number, record) => (
        <DetailValue
          title={`${record.name} 综合补贴明细`}
          value={formatMoney(value)}
          items={record.comprehensiveSubsidyDetails}
        />
      ),
    },
    {
      title: "实发假勤补贴",
      dataIndex: "attendanceSubsidy",
      key: "attendanceSubsidy",
      width: 108,
      align: "right",
      render: (value: number, record) => (
        <DetailValue
          title={`${record.name} 假勤补贴明细`}
          value={formatMoney(value)}
          items={record.attendanceSubsidyDetails}
        />
      ),
    },
    {
      title: "实发业务奖金补贴",
      dataIndex: "businessSubsidy",
      key: "businessSubsidy",
      width: 126,
      align: "right",
      render: (value: number, record) => (
        <DetailValue
          title={`${record.name} 业务奖金补贴明细`}
          value={formatMoney(value)}
          items={record.businessSubsidyDetails}
        />
      ),
    },
    {
      title: "实发福利补贴",
      dataIndex: "welfareSubsidy",
      key: "welfareSubsidy",
      width: 108,
      align: "right",
      render: formatMoney,
    },
    {
      title: "考勤扣款",
      dataIndex: "attendanceDeduction",
      key: "attendanceDeduction",
      width: 88,
      align: "right",
      render: (value: number, record) => (
        <DetailValue
          title={`${record.name} 考勤扣款明细`}
          value={formatMoney(value)}
          items={record.attendanceDeductionDetails}
        />
      ),
    },
    { title: "其余扣款", dataIndex: "otherDeduction", key: "otherDeduction", width: 88, align: "right", render: formatMoney },
    {
      title: "代扣扣款",
      dataIndex: "withholdingDeduction",
      key: "withholdingDeduction",
      width: 88,
      align: "right",
      render: (value: number, record) => (
        <DetailValue
          title={`${record.name} 代扣扣款明细`}
          value={formatMoney(value)}
          items={record.withholdingDeductionDetails}
        />
      ),
    },
    {
      title: "上月薪资差额",
      dataIndex: "previousMonthDiff",
      key: "previousMonthDiff",
      width: 104,
      align: "right",
      render: formatMoney,
    },
    {
      title: "备注",
      key: "remark",
      width: 140,
      fixed: "right",
      render: (_, record) => (
        <Input
          size="small"
          value={editableFields[record.id]?.remark ?? record.remark}
          onChange={(event) =>
            setEditableFields((current) => ({
              ...current,
              [record.id]: {
                remark: event.target.value,
                auditAdjustment: current[record.id]?.auditAdjustment ?? record.auditAdjustment,
              },
            }))
          }
        />
      ),
    },
    {
      title: "审核调整",
      key: "auditAdjustment",
      width: 94,
      fixed: "right",
      align: "right",
      render: (_, record) => (
        <InputNumber
          size="small"
          value={editableFields[record.id]?.auditAdjustment ?? record.auditAdjustment}
          onChange={(value) =>
            setEditableFields((current) => ({
              ...current,
              [record.id]: {
                remark: current[record.id]?.remark ?? record.remark,
                auditAdjustment: Number(value ?? 0),
              },
            }))
          }
        />
      ),
    },
    {
      title: "应付工资",
      dataIndex: "payableSalary",
      key: "payableSalary",
      width: 92,
      fixed: "right",
      align: "right",
      render: formatMoney,
    },
    {
      title: "实付工资",
      key: "actualSalary",
      width: 92,
      fixed: "right",
      align: "right",
      render: (_, record) => formatMoney(getEmployeeActualSalary(record, editableFields)),
    },
  ];

  const makeDepartmentDetailColumns = (kind: DepartmentDetailKind): ColumnsType<PayrollEmployeeRecord> => {
    const baseColumns: ColumnsType<PayrollEmployeeRecord> = [
      {
        title: "姓名",
        dataIndex: "name",
        key: "name",
        width: 80,
        fixed: "left",
        render: (name: string, record) => (
          <Button type="link" className="payroll-inline-link" onClick={() => setEmployeeDetail(record)}>
            {name}
          </Button>
        ),
      },
      { title: "区域", dataIndex: "area", key: "area", width: 90 },
      { title: "部门", dataIndex: "department", key: "department", width: 110 },
      { title: "入职日期", dataIndex: "hireDate", key: "hireDate", width: 100 },
      { title: "转正日期", dataIndex: "regularDate", key: "regularDate", width: 100 },
    ];

    if (kind === "commission") {
      return [
        ...baseColumns,
        {
          title: "销售额",
          key: "sales",
          width: 90,
          align: "right",
          render: (_, record) => getDetailValue(record.commissionDetails, "销售额"),
        },
        {
          title: "增加率",
          key: "growth",
          width: 80,
          align: "right",
          render: (_, record) => getDetailValue(record.commissionDetails, "增加率"),
        },
        {
          title: "实发提成",
          dataIndex: "commissionPaid",
          key: "commissionPaid",
          width: 90,
          align: "right",
          render: formatMoney,
        },
        {
          title: "剩余提成",
          dataIndex: "remainingCommission",
          key: "remainingCommission",
          width: 90,
          align: "right",
          render: formatMoney,
        },
      ];
    }

    if (kind === "kpi") {
      return [
        ...baseColumns,
        {
          title: "绩效工资",
          key: "kpiSalary",
          width: 90,
          align: "right",
          render: (_, record) => getDetailValue(record.kpiDetails, "KPI 工资"),
        },
        {
          title: "KPI 分数",
          key: "kpiScore",
          width: 90,
          align: "right",
          render: (_, record) => getDetailValue(record.kpiDetails, "KPI 分数"),
        },
        {
          title: "实发 KPI",
          dataIndex: "kpiPaid",
          key: "kpiPaid",
          width: 90,
          align: "right",
          render: formatMoney,
        },
      ];
    }

    if (kind === "subsidy") {
      return [
        ...baseColumns,
        {
          title: "奖金",
          dataIndex: "bonus",
          key: "bonus",
          width: 80,
          align: "right",
          render: formatMoney,
        },
        {
          title: "综合补贴",
          dataIndex: "comprehensiveSubsidy",
          key: "comprehensiveSubsidy",
          width: 90,
          align: "right",
          render: formatMoney,
        },
        {
          title: "假勤补贴",
          dataIndex: "attendanceSubsidy",
          key: "attendanceSubsidy",
          width: 90,
          align: "right",
          render: formatMoney,
        },
        {
          title: "业务奖金补贴",
          dataIndex: "businessSubsidy",
          key: "businessSubsidy",
          width: 110,
          align: "right",
          render: formatMoney,
        },
        {
          title: "福利补贴",
          dataIndex: "welfareSubsidy",
          key: "welfareSubsidy",
          width: 90,
          align: "right",
          render: formatMoney,
        },
        {
          title: "合计",
          key: "subsidyTotal",
          width: 90,
          align: "right",
          render: (_, record) =>
            formatMoney(
              record.bonus +
                record.comprehensiveSubsidy +
                record.attendanceSubsidy +
                record.businessSubsidy +
                record.welfareSubsidy,
            ),
        },
      ];
    }

    return [
      ...baseColumns,
      {
        title: "应出勤",
        dataIndex: "expectedAttendance",
        key: "expectedAttendance",
        width: 80,
        align: "right",
        render: formatNumber,
      },
      {
        title: "实出勤",
        dataIndex: "actualAttendance",
        key: "actualAttendance",
        width: 80,
        align: "right",
        render: formatNumber,
      },
      { title: "迟到次数", dataIndex: "lateCount", key: "lateCount", width: 80, align: "right" },
      {
        title: "缺勤工资",
        key: "absenceWage",
        width: 90,
        align: "right",
        render: (_, record) => getDetailValue(record.attendanceDeductionDetails, "缺勤工资"),
      },
      {
        title: "考勤违规扣分",
        key: "violationDeduction",
        width: 110,
        align: "right",
        render: (_, record) => getDetailValue(record.attendanceDeductionDetails, "考勤违规扣分"),
      },
      {
        title: "考勤扣款",
        dataIndex: "attendanceDeduction",
        key: "attendanceDeduction",
        width: 90,
        align: "right",
        render: formatMoney,
      },
    ];
  };

  const renderSummaryRow = (label: string, mode: "sum" | "avg") => (
    <Table.Summary.Row>
      {employeeColumns.map((column, index) => {
        const key = String(column.key);
        const value = employeeNumericKeys.includes(key)
          ? visibleEmployees.reduce((total, employee) => {
              if (key === "actualSalary") {
                return total + getEmployeeActualSalary(employee, editableFields);
              }

              if (key === "auditAdjustment") {
                return total + (editableFields[employee.id]?.auditAdjustment ?? employee.auditAdjustment);
              }

              const rawValue = employee[key as keyof PayrollEmployeeRecord];
              return total + (typeof rawValue === "number" ? rawValue : 0);
            }, 0)
          : undefined;

        return (
          <Table.Summary.Cell key={`${label}-${key}`} index={index}>
            {index === 0 ? (
              <strong>{label}</strong>
            ) : value === undefined ? (
              ""
            ) : mode === "sum" ? (
              <span className="payroll-summary-number">{formatNumber(value)}</span>
            ) : (
              <span className="payroll-summary-number">{formatNumber(value / Math.max(visibleEmployees.length, 1))}</span>
            )}
          </Table.Summary.Cell>
        );
      })}
    </Table.Summary.Row>
  );

  const employeeDetailItems = employeeDetail ? buildEmployeeDetailItems(employeeDetail, editableFields) : undefined;
  const levelFilteredDepartments =
    visibleLevels.length === 0 ? departments : departments.filter((department) => visibleLevels.includes(department.level));

  return (
    <div className="payroll-approval">
      <div className="payroll-approval__toolbar">
        <Space wrap className="payroll-approval__primary-tools">
          <Segmented
            className="payroll-view-switch"
            value={activeView}
            onChange={(value) => setActiveView(value as PayrollView)}
            options={[
              { label: "部门视图", value: "department" },
              { label: "员工视图", value: "employee" },
            ]}
          />
          <Button
            icon={<RotateCcw size={16} />}
            onClick={() => {
              setFilteredInfo({});
              setDepartmentFilteredInfo({});
              setSelectedTreeKeys([]);
            }}
          >
            重置筛选
          </Button>
          <span className="payroll-approval__title">{info.cycle} 办公室人员</span>
        </Space>
      </div>

      {activeView === "department" ? (
        <div className="payroll-approval__stack">
          <div className="payroll-approval__subtoolbar">
            <Segmented
              className="payroll-mode-switch"
              value={departmentView}
              onChange={(value) => setDepartmentView(value as DepartmentView)}
              options={[
                { label: "树状列表", value: "tree" },
                { label: "平铺列表", value: "flat" },
              ]}
            />
            {departmentView === "flat" ? (
              <div className="payroll-level-filter">
                <span>仅展示选中层级</span>
                <Checkbox.Group
                  value={visibleLevels}
                  onChange={setVisibleLevels}
                  options={[
                    { label: "一级部门", value: 1 },
                    { label: "二级部门", value: 2 },
                    { label: "三级部门", value: 3 },
                  ]}
                />
              </div>
            ) : null}
          </div>
          <Table
            columns={departmentColumns}
            dataSource={
              departmentView === "tree" ? info.departments : levelFilteredDepartments.map(toFlatDepartmentRecord)
            }
            expandable={
              departmentView === "tree"
                ? {
                    expandedRowKeys: expandedDepartmentRowKeys,
                    expandIcon: ({ expanded, onExpand, record }) =>
                      record.children?.length ? (
                        <button
                          className="payroll-tree-expand"
                          type="button"
                          aria-label={expanded ? "收起部门" : "展开部门"}
                          onClick={(event) => onExpand(record, event)}
                        >
                          {expanded ? "▼" : "▶"}
                        </button>
                      ) : (
                        <span className="payroll-tree-expand payroll-tree-expand--empty" />
                      ),
                    onExpandedRowsChange: (keys) => setExpandedDepartmentRowKeys(keys.map((key) => String(key))),
                  }
                : undefined
            }
            pagination={false}
            rowKey="id"
            size="small"
            scroll={{ x: 1630, y: 520 }}
            onChange={(_, filters) => setDepartmentFilteredInfo(filters)}
          />
        </div>
      ) : (
        <div className="payroll-employee-layout">
          <aside className="payroll-employee-layout__tree">
            <Input.Search
              placeholder="搜索部门、员工"
              allowClear
              size="small"
              value={treeSearch}
              onChange={(event) => setTreeSearch(event.target.value)}
            />
            <Tree
              checkable
              checkStrictly
              showIcon
              autoExpandParent={Boolean(treeSearch.trim())}
              expandedKeys={treeSearch.trim() ? searchExpandedTreeKeys : expandedTreeKeys}
              checkedKeys={selectedTreeKeys}
              selectedKeys={selectedTreeKeys}
              treeData={employeeTreeData}
              onExpand={(keys) => setExpandedTreeKeys(keys.map((key) => String(key)))}
              onCheck={(keys) => {
                const checkedKeys = Array.isArray(keys) ? keys : keys.checked;
                const nextKeys = checkedKeys
                  .map((key) => String(key))
                  .filter((key) => departmentKeys.has(key) || employeeKeys.has(key));
                setSelectedTreeKeys(nextKeys);
              }}
              onSelect={(keys) => {
                const selectedKey = String(keys[0] ?? "");

                if (employeeKeys.has(selectedKey)) {
                  setSelectedTreeKeys([selectedKey]);
                }
              }}
            />
          </aside>
          <div className="payroll-employee-layout__table">
            <Table
              columns={employeeColumns}
              dataSource={visibleEmployees}
              onChange={(_, filters) => setFilteredInfo(filters)}
              pagination={false}
              rowKey="id"
              size="small"
              scroll={{ x: 2770, y: 520 }}
              summary={() => (
                <Table.Summary fixed>
                  {renderSummaryRow("合计", "sum")}
                  {renderSummaryRow("均值", "avg")}
                </Table.Summary>
              )}
            />
          </div>
        </div>
      )}

      <Modal
        className="payroll-detail-modal"
        title={detailModal?.title}
        open={Boolean(detailModal)}
        onCancel={() => setDetailModal(undefined)}
        onOk={() => setDetailModal(undefined)}
        okText="关闭"
        cancelButtonProps={{ style: { display: "none" } }}
        width={980}
      >
        {detailModal ? (
          <Table
            columns={makeDepartmentDetailColumns(detailModal.kind)}
            dataSource={getDepartmentEmployees(detailModal.department)}
            pagination={false}
            rowKey="id"
            size="small"
            scroll={{ x: 820, y: 420 }}
          />
        ) : null}
      </Modal>

      <Modal
        className="payroll-employee-modal"
        open={Boolean(employeeDetail)}
        onCancel={() => setEmployeeDetail(undefined)}
        onOk={() => setEmployeeDetail(undefined)}
        okText="关闭"
        cancelButtonProps={{ style: { display: "none" } }}
        title="员工薪资详情"
        width={1080}
      >
        {employeeDetail && employeeDetailItems ? (
          <div className="payroll-employee-modal__content">
            <Descriptions title="基本信息" bordered size="small" column={3} items={employeeDetailItems.basic} />
            <Descriptions title="考勤信息" bordered size="small" column={3} items={employeeDetailItems.attendance} />
            <Descriptions title="KPI" bordered size="small" column={3} items={employeeDetailItems.kpi} />
            <Descriptions title="提成" bordered size="small" column={4} items={employeeDetailItems.commission} />
            <Descriptions title="奖金" bordered size="small" column={4} items={employeeDetailItems.bonus} />
            <Descriptions title="综合补贴" bordered size="small" column={3} items={employeeDetailItems.comprehensiveSubsidy} />
            <Descriptions title="审批调整" bordered size="small" column={4} items={employeeDetailItems.settlement} />
            <div className="payroll-employee-modal__edit">
              <Input
                placeholder="备注"
                value={editableFields[employeeDetail.id]?.remark ?? employeeDetail.remark}
                onChange={(event) =>
                  setEditableFields((current) => ({
                    ...current,
                    [employeeDetail.id]: {
                      remark: event.target.value,
                      auditAdjustment: current[employeeDetail.id]?.auditAdjustment ?? employeeDetail.auditAdjustment,
                    },
                  }))
                }
              />
              <InputNumber
                addonBefore="审核调整"
                value={editableFields[employeeDetail.id]?.auditAdjustment ?? employeeDetail.auditAdjustment}
                onChange={(value) =>
                  setEditableFields((current) => ({
                    ...current,
                    [employeeDetail.id]: {
                      remark: current[employeeDetail.id]?.remark ?? employeeDetail.remark,
                      auditAdjustment: Number(value ?? 0),
                    },
                  }))
                }
              />
              <Tag color="blue">应付工资 {formatMoney(employeeDetail.payableSalary)}</Tag>
              <Tag color="green">实付工资 {formatMoney(getEmployeeActualSalary(employeeDetail, editableFields))}</Tag>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
