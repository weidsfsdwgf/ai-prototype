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
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import type {
  PayrollApprovalInfo,
  PayrollDepartmentRecord,
  PayrollEmployeeRecord,
} from "../data/payrollApproval";

type PayrollApprovalDetailProps = {
  info: PayrollApprovalInfo;
  toolbarExtra?: ReactNode;
  showTitle?: boolean;
};

type PayrollView = "department" | "employee";
type DepartmentView = "tree" | "flat";
type DetailItem = { label: string; value: string };
type DepartmentDetailKind = "attendance" | "commission" | "kpi" | "bonus" | "welfare";
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

function findDepartmentPath(departments: PayrollDepartmentRecord[], name: string, parents: string[] = []): string[] {
  for (const department of departments) {
    const currentPath = [...parents, department.name];

    if (department.name === name) {
      return currentPath;
    }

    const childPath = findDepartmentPath(department.children ?? [], name, currentPath);

    if (childPath.length > 0) {
      return childPath;
    }
  }

  return [];
}

function uniqueOptions(values: string[]) {
  return Array.from(new Set(values)).map((value) => ({ text: value, value }));
}

function getEmployeeActualSalary(record: PayrollEmployeeRecord, editableFields: EditableFields) {
  return record.payableSalary + (editableFields[record.id]?.auditAdjustment ?? record.auditAdjustment);
}

function detailList(items: DetailItem[]) {
  if (items.length === 0) {
    return <span className="payroll-detail-empty">无明细</span>;
  }

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

function getDetailNumber(items: DetailItem[], label: string) {
  return parseNumericText(getDetailValue(items, label));
}

function moneyItem(label: string, value: number): DetailItem {
  return { label, value: formatMoney(value) };
}

function sumDetailItems(items: DetailItem[]) {
  return items.reduce((total, item) => total + parseNumericText(item.value), 0);
}

function filterNonZeroDetails(items: DetailItem[]) {
  return items.filter((item) => parseNumericText(item.value) !== 0);
}

function getKpiScore(record: PayrollEmployeeRecord) {
  return getDetailNumber(record.kpiDetails, "KPI 分数");
}

function getOvertimeDetails(record: PayrollEmployeeRecord) {
  const workday = getDetailNumber(record.overtimeDetails, "工作日加班");
  const weekend = getDetailNumber(record.overtimeDetails, "周六加班") + getDetailNumber(record.overtimeDetails, "休息日加班");
  const holiday = getDetailNumber(record.overtimeDetails, "节假日加班");

  return [
    { label: "工作日加班", value: `${formatNumber(workday)} 小时` },
    { label: "休息日加班", value: `${formatNumber(weekend)} 小时` },
    { label: "节假日加班", value: `${formatNumber(holiday)} 小时` },
    { label: "过期加班", value: "0 小时" },
  ];
}

function getCommissionPaidDetails(record: PayrollEmployeeRecord) {
  const teamPerformance = Math.round(record.commissionPaid * 0.22);
  return [
    moneyItem("单月提成", record.commissionPaid - teamPerformance),
    moneyItem("团队绩效", teamPerformance),
  ];
}

function getRemainingCommissionDetails(record: PayrollEmployeeRecord) {
  return [
    moneyItem("当月剩余提成", record.remainingCommission),
    moneyItem("累计剩余提成", record.remainingCommission + Math.max(record.previousMonthDiff, 0)),
  ];
}

function getComprehensiveSubsidyDetails(record: PayrollEmployeeRecord) {
  const guarantee = getDetailNumber(record.businessSubsidyDetails, "保底提成补贴");
  return [
    ...record.comprehensiveSubsidyDetails,
    moneyItem("保底提成补贴", guarantee),
  ];
}

function getAttendanceSubsidyDetails(record: PayrollEmployeeRecord) {
  const overtimeSubsidy =
    getDetailNumber(record.attendanceSubsidyDetails, "平时及周末加班费用") +
    getDetailNumber(record.attendanceSubsidyDetails, "节假日加班费") +
    getDetailNumber(record.attendanceSubsidyDetails, "加班补贴");
  return [
    moneyItem("加班补贴", overtimeSubsidy),
    {
      label: "病假/婚假/陪产假/产假/丧假补贴",
      value: getDetailValue(record.attendanceSubsidyDetails, "病假/婚假/陪产假/产假/丧假补贴"),
    },
  ];
}

function getBonusDetails(record: PayrollEmployeeRecord) {
  const labels = ["爆款奖金", "培训导师奖金", "老带新补贴", "内推奖金", "年会奖金", "优秀标兵"];
  return labels.map((label) => ({ label, value: getDetailValue(record.bonusDetails, label) === "-" ? "0" : getDetailValue(record.bonusDetails, label) }));
}

function getBonusTotal(record: PayrollEmployeeRecord) {
  return sumDetailItems(getBonusDetails(record));
}

function getWelfareSubsidyDetails(record: PayrollEmployeeRecord) {
  const staleReward = getDetailNumber(record.businessSubsidyDetails, "滞销奖励补贴");
  const guarantee = getDetailNumber(record.businessSubsidyDetails, "保底提成补贴");
  const seniority = record.rank === "P4" ? 160 : record.rank === "P3" ? 100 : 80;
  const parking = record.area === "华南区域" ? 80 : 0;
  const meal = 100;
  const fullAttendance = record.leaveDays === 0 && record.lateCount === 0 ? 120 : 0;
  const support = record.overtime >= 6 ? 80 : 0;
  const allocated = seniority + parking + staleReward + guarantee + meal + fullAttendance + support;
  const other = Math.max(record.welfareSubsidy - allocated, 0);

  return [
    moneyItem("工龄奖", seniority),
    moneyItem("停车费补贴", parking),
    moneyItem("滞销奖励补贴", staleReward),
    moneyItem("老带新补贴", 0),
    moneyItem("保护器差补", 0),
    moneyItem("保底提成补贴", guarantee),
    moneyItem("餐费补贴", meal),
    moneyItem("调仓补贴", 0),
    moneyItem("6天制补贴", 0),
    moneyItem("体检费报销", 0),
    moneyItem("支援补贴", support),
    moneyItem("宿舍长补贴", 0),
    moneyItem("旺季补贴", 0),
    moneyItem("结婚礼金", 0),
    moneyItem("产假补贴", 0),
    moneyItem("其余补贴", other),
    moneyItem("满勤补贴", fullAttendance),
  ];
}

function getWelfareSubsidyTotal(record: PayrollEmployeeRecord) {
  return sumDetailItems(getWelfareSubsidyDetails(record));
}

function getOtherDeductionDetails(record: PayrollEmployeeRecord) {
  return [
    moneyItem("五险（个人）", Math.round(record.otherDeduction * 0.36)),
    moneyItem("公积金（个人）", Math.round(record.otherDeduction * 0.28)),
    moneyItem("上月个税退还", 0),
    moneyItem("扣除个税", record.otherDeduction - Math.round(record.otherDeduction * 0.64)),
  ];
}

function getFixedSalaryPart(record: PayrollEmployeeRecord) {
  const kpiBase = getDetailNumber(record.kpiDetails, "KPI 工资") || getDetailNumber(record.kpiDetails, "绩效工资");

  return Math.max(record.salaryTotal - kpiBase - 100, 0);
}

function getEmployeeAttendanceText(record: PayrollEmployeeRecord) {
  return `${formatNumber(record.actualAttendance)}/${formatNumber(record.expectedAttendance)}`;
}

function getEmployeeLeaveDetails(record: PayrollEmployeeRecord) {
  const labels = ["事假", "年假", "病假", "婚嫁/陪产假/产假/丧假"];
  return filterNonZeroDetails(labels.map((label) => ({ label, value: getDetailValue(record.leaveDetails, label) })));
}

function getEmployeeCommissionDetails(record: PayrollEmployeeRecord) {
  return [
    ...getCommissionPaidDetails(record),
    ...getRemainingCommissionDetails(record),
  ];
}

function getEmployeeComprehensiveSubsidyDetails(record: PayrollEmployeeRecord) {
  return [
    { label: "实发学历补贴", value: getDetailValue(record.comprehensiveSubsidyDetails, "实发学历补贴") },
    { label: "实发管理补贴", value: getDetailValue(record.comprehensiveSubsidyDetails, "实发管理补贴") },
    { label: "实发来厦补贴", value: getDetailValue(record.comprehensiveSubsidyDetails, "实发来厦补贴") },
    moneyItem("保底提成补贴", getDetailNumber(record.businessSubsidyDetails, "保底提成补贴")),
  ];
}

function getEmployeeBonusDetails(record: PayrollEmployeeRecord) {
  const labels = ["爆款奖金", "培训导师奖金", "内推奖金", "年会奖金", "优秀标兵"];
  return filterNonZeroDetails(labels.map((label) => ({ label, value: getDetailValue(record.bonusDetails, label) })));
}

function getEmployeeBonusTotal(record: PayrollEmployeeRecord) {
  return sumDetailItems(getEmployeeBonusDetails(record));
}

function getEmployeeWelfareSubsidyDetails(record: PayrollEmployeeRecord) {
  return filterNonZeroDetails([...getWelfareSubsidyDetails(record), ...getAttendanceSubsidyDetails(record)]);
}

function getEmployeeDeductionDetails(record: PayrollEmployeeRecord, value: number) {
  const details = record.withholdingDeductionDetails.length > 0 ? record.withholdingDeductionDetails : getOtherDeductionDetails(record);

  if (details.length > 0) {
    return details;
  }

  return [
    moneyItem("五险（个人）", Math.round(value * 0.36)),
    moneyItem("公积金（个人）", Math.round(value * 0.28)),
    moneyItem("上月个税退还", 0),
    moneyItem("扣除个税", value - Math.round(value * 0.64)),
  ];
}

function getNameState(record: PayrollEmployeeRecord) {
  if (record.resignationDate) {
    return {
      className: "payroll-resigned-name",
      title: `${record.name} 离职信息`,
      content: `离职日期：${record.resignationDate}`,
    };
  }

  if (record.expectedRegularDate) {
    return {
      className: "payroll-probation-name",
      title: `${record.name} 试用期信息`,
      content: `预计转正日期：${record.expectedRegularDate}`,
    };
  }

  return { className: "payroll-inline-link" };
}

void getNameState;

function getEmployeeNameState(record: PayrollEmployeeRecord) {
  if (record.resignationDate) {
    return {
      className: "payroll-resigned-name",
      title: `${record.name} 离职信息`,
      content: `离职日期：${record.resignationDate}`,
    };
  }

  if (record.expectedRegularDate) {
    return {
      className: "payroll-probation-name",
      title: `${record.name} 试用期信息`,
      content: `预计转正日期：${record.expectedRegularDate}`,
    };
  }

  return { className: "payroll-inline-link" };
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

function buildDepartmentTreeData(
  departments: PayrollDepartmentRecord[],
  employees: PayrollEmployeeRecord[],
  query = "",
): DataNode[] {
  const keyword = query.trim().toLowerCase();

  return departments.reduce<DataNode[]>((nodes, department) => {
    const departmentMatched = keyword ? department.name.toLowerCase().includes(keyword) : true;
    const children = department.children
      ? buildDepartmentTreeData(department.children, employees, departmentMatched ? "" : query)
      : undefined;

    if (!departmentMatched && (!children || children.length === 0)) {
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

function makeDescriptionItem(key: string, label: string, children: ReactNode) {
  return { key, label, children };
}

export function PayrollApprovalDetail({ info, toolbarExtra, showTitle = true }: PayrollApprovalDetailProps) {
  const [activeView, setActiveView] = useState<PayrollView>("department");
  const [departmentView, setDepartmentView] = useState<DepartmentView>("tree");
  const [visibleLevels, setVisibleLevels] = useState<LevelFilterValue[]>([]);
  const [flatDepartmentKeys, setFlatDepartmentKeys] = useState<TreeFilterKey[]>([]);
  const [flatDepartmentSearch, setFlatDepartmentSearch] = useState("");
  const [flatExpandedDepartmentKeys, setFlatExpandedDepartmentKeys] = useState<TreeFilterKey[]>(() =>
    flattenDepartments(info.departments).map((department) => makeDepartmentKey(department.name)),
  );
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
  const flatDepartmentTreeData = useMemo(
    () => buildDepartmentTreeData(info.departments, info.employees, flatDepartmentSearch),
    [flatDepartmentSearch, info.departments, info.employees],
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
    setFlatExpandedDepartmentKeys(defaultExpandedDepartmentKeys);
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
    const kpiScoreTotal = employees.reduce((total, employee) => total + getKpiScore(employee), 0);
    const bonusTotal = employees.reduce((total, employee) => total + getBonusTotal(employee), 0);
    const welfareSubsidyTotal = employees.reduce((total, employee) => total + getWelfareSubsidyTotal(employee), 0);
    const expectedAttendanceTotal = employees.reduce((total, employee) => total + employee.expectedAttendance, 0);
    const actualAttendanceTotal = employees.reduce((total, employee) => total + employee.actualAttendance, 0);
    const leaveTotal = employees.reduce((total, employee) => total + employee.leaveDays, 0);
    const lateTotal = employees.reduce((total, employee) => total + employee.lateCount, 0);
    const clockRepairTotal = employees.reduce((total, employee) => total + employee.clockRepairCount, 0);
    const overtimeTotal = employees.reduce((total, employee) => total + employee.overtime, 0);
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
      bonusTotal,
      welfareSubsidyTotal,
      attendanceRate: expectedAttendanceTotal > 0 ? (actualAttendanceTotal / expectedAttendanceTotal) * 100 : 0,
      averageLeave: payrollCount > 0 ? leaveTotal / payrollCount : 0,
      averageLate: payrollCount > 0 ? lateTotal / payrollCount : 0,
      averageClockRepair: payrollCount > 0 ? clockRepairTotal / payrollCount : 0,
      averageOvertime: payrollCount > 0 ? overtimeTotal / payrollCount : 0,
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
      title: "出勤率",
      key: "attendanceRate",
      width: 100,
      align: "right",
      render: (_, record) => formatPercent(getDepartmentMetrics(record).attendanceRate),
    },
    {
      title: "人均请假",
      key: "averageLeave",
      width: 95,
      align: "right",
      render: (_, record) => formatNumber(getDepartmentMetrics(record).averageLeave),
    },
    {
      title: "人均迟到",
      key: "averageLate",
      width: 95,
      align: "right",
      render: (_, record) => formatNumber(getDepartmentMetrics(record).averageLate),
    },
    {
      title: "人均补卡",
      key: "averageClockRepair",
      width: 95,
      align: "right",
      render: (_, record) => formatNumber(getDepartmentMetrics(record).averageClockRepair),
    },
    {
      title: "人均加班",
      key: "averageOvertime",
      width: 95,
      align: "right",
      render: (_, record) => formatNumber(getDepartmentMetrics(record).averageOvertime),
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
      title: "奖金合计",
      key: "bonusTotal",
      width: 110,
      align: "right",
      render: (_, record) => (
        <Button
          type="link"
          className="payroll-inline-link"
          onClick={() => setDetailModal({ title: `${record.name} 奖金明细`, kind: "bonus", department: record })}
        >
          {formatMoney(getDepartmentMetrics(record).bonusTotal)}
        </Button>
      ),
    },
    {
      title: "福利补贴合计",
      key: "welfareSubsidyTotal",
      width: 130,
      align: "right",
      render: (_, record) => (
        <Button
          type="link"
          className="payroll-inline-link"
          onClick={() => setDetailModal({ title: `${record.name} 福利补贴明细`, kind: "welfare", department: record })}
        >
          {formatMoney(getDepartmentMetrics(record).welfareSubsidyTotal)}
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
      render: (name: string, record, index) => {
        const nameState = getEmployeeNameState(record);
        const nameButton = (
          <Button type="link" className={nameState.className} onClick={() => setEmployeeDetail(record)}>
            {name}
          </Button>
        );

        return (
          <Space size={6}>
            <span className="payroll-row-index">{index + 1}</span>
            {nameState.content ? (
              <Popover title={nameState.title} content={nameState.content} trigger="hover">
                {nameButton}
              </Popover>
            ) : (
              nameButton
            )}
          </Space>
        );
      },
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
      width: 112,
      filters: uniqueOptions(info.employees.map((employee) => employee.department)),
      filteredValue: filteredInfo.department ?? null,
      onFilter: (value, record) => record.department === value,
      render: (value: string) => {
        const path = findDepartmentPath(info.departments, value).join("/");

        return (
          <Popover content={path || value} trigger="hover">
            <span className="payroll-cell-ellipsis">{value}</span>
          </Popover>
        );
      },
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
    { title: "转正日期", dataIndex: "regularDate", key: "regularDate", width: 94, render: (value: string) => value || "-" },
    {
      title: "薪资合计",
      dataIndex: "salaryTotal",
      key: "salaryTotal",
      width: 88,
      align: "right",
      render: formatMoney,
    },
    {
      title: "薪资结构",
      dataIndex: "salaryStructure",
      key: "salaryStructure",
      width: 180,
      render: (value: string) => (
        <Popover content={value} trigger="hover">
          <span className="payroll-cell-ellipsis">{value}</span>
        </Popover>
      ),
    },
    {
      title: "出勤",
      key: "attendance",
      width: 76,
      align: "right",
      render: (_, record) => getEmployeeAttendanceText(record),
    },
    {
      title: "请假天数",
      dataIndex: "leaveDays",
      key: "leaveDays",
      width: 84,
      align: "right",
      render: (value: number, record) => (
        <DetailValue title={`${record.name} 请假明细`} value={value} items={getEmployeeLeaveDetails(record)} />
      ),
    },
    { title: "迟到次数", dataIndex: "lateCount", key: "lateCount", width: 76, align: "right" },
    { title: "补卡次数", dataIndex: "clockRepairCount", key: "clockRepairCount", width: 76, align: "right" },
    {
      title: "加班(H)",
      dataIndex: "overtime",
      key: "overtime",
      width: 76,
      align: "right",
      render: (value: number, record) => (
        <DetailValue title={`${record.name} 加班明细`} value={value} items={getOvertimeDetails(record)} />
      ),
    },
    {
      title: "固定部分(除绩效、餐补)",
      key: "fixedSalaryPart",
      width: 140,
      align: "right",
      render: (_, record) => formatMoney(getFixedSalaryPart(record)),
    },
    {
      title: "绩效分数",
      key: "kpiScore",
      width: 80,
      align: "right",
      render: (_, record) => formatNumber(getKpiScore(record)),
    },
    {
      title: "实发绩效",
      dataIndex: "kpiPaid",
      key: "kpiPaid",
      width: 84,
      align: "right",
      render: (value: number, record) => (
        <DetailValue title={`${record.name} 绩效明细`} value={formatMoney(value)} items={record.kpiDetails} />
      ),
    },
    {
      title: "实发提成",
      dataIndex: "commissionPaid",
      key: "commissionPaid",
      width: 88,
      align: "right",
      render: (value: number, record) => (
        <DetailValue title={`${record.name} 提成明细`} value={formatMoney(value)} items={getEmployeeCommissionDetails(record)} />
      ),
    },
    {
      title: "实发综合补贴",
      dataIndex: "comprehensiveSubsidy",
      key: "comprehensiveSubsidy",
      width: 108,
      align: "right",
      render: (_, record) => (
        <DetailValue
          title={`${record.name} 综合补贴明细`}
          value={formatMoney(sumDetailItems(getEmployeeComprehensiveSubsidyDetails(record)))}
          items={getEmployeeComprehensiveSubsidyDetails(record)}
        />
      ),
    },
    {
      title: "奖金",
      dataIndex: "bonus",
      key: "bonus",
      width: 70,
      align: "right",
      render: (_, record) => (
        <DetailValue title={`${record.name} 奖金明细`} value={formatMoney(getEmployeeBonusTotal(record))} items={getEmployeeBonusDetails(record)} />
      ),
    },
    {
      title: "福利补贴",
      dataIndex: "welfareSubsidy",
      key: "welfareSubsidy",
      width: 108,
      align: "right",
      render: (_, record) => (
        <DetailValue
          title={`${record.name} 福利补贴明细`}
          value={formatMoney(sumDetailItems(getEmployeeWelfareSubsidyDetails(record)))}
          items={getEmployeeWelfareSubsidyDetails(record)}
        />
      ),
    },
    {
      title: "考勤扣款",
      dataIndex: "attendanceDeduction",
      key: "attendanceDeduction",
      width: 88,
      align: "right",
      render: formatMoney,
    },
    {
      title: "其余扣款",
      dataIndex: "otherDeduction",
      key: "otherDeduction",
      width: 88,
      align: "right",
      render: (value: number, record) => (
        <DetailValue
          title={`${record.name} 其余扣款明细`}
          value={formatMoney(value)}
          items={getOtherDeductionDetails(record)}
        />
      ),
    },
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
          items={getEmployeeDeductionDetails(record, value)}
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
          title: "提成明细字段1",
          key: "commissionDetail1",
          width: 120,
          align: "right",
          render: (_, record) => record.commissionDetails[0]?.value ?? "-",
        },
        {
          title: "提成明细字段2",
          key: "commissionDetail2",
          width: 120,
          align: "right",
          render: (_, record) => record.commissionDetails[1]?.value ?? "-",
        },
        {
          title: "提成明细字段3",
          key: "commissionDetail3",
          width: 120,
          align: "right",
          render: (_, record) => record.commissionDetails[2]?.value ?? "-",
        },
        {
          title: "单月提成",
          key: "monthlyCommission",
          width: 90,
          align: "right",
          render: (_, record) => getDetailValue(getCommissionPaidDetails(record), "单月提成"),
        },
        {
          title: "团队绩效",
          key: "teamPerformance",
          width: 90,
          align: "right",
          render: (_, record) => getDetailValue(getCommissionPaidDetails(record), "团队绩效"),
        },
        {
          title: "当月剩余提成",
          key: "currentRemainingCommission",
          width: 120,
          align: "right",
          render: (_, record) => getDetailValue(getRemainingCommissionDetails(record), "当月剩余提成"),
        },
        {
          title: "累计剩余提成",
          key: "accumulatedRemainingCommission",
          width: 120,
          align: "right",
          render: (_, record) => getDetailValue(getRemainingCommissionDetails(record), "累计剩余提成"),
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

    if (kind === "bonus") {
      return [
        ...baseColumns,
        {
          title: "爆款奖金",
          key: "hotProductBonus",
          width: 90,
          align: "right",
          render: (_, record) => getDetailValue(getBonusDetails(record), "爆款奖金"),
        },
        {
          title: "培训导师奖金",
          key: "mentorBonus",
          width: 110,
          align: "right",
          render: (_, record) => getDetailValue(getBonusDetails(record), "培训导师奖金"),
        },
        {
          title: "老带新补贴",
          key: "referralSubsidy",
          width: 100,
          align: "right",
          render: (_, record) => getDetailValue(getBonusDetails(record), "老带新补贴"),
        },
        {
          title: "内推奖金",
          key: "internalReferralBonus",
          width: 90,
          align: "right",
          render: (_, record) => getDetailValue(getBonusDetails(record), "内推奖金"),
        },
        {
          title: "年会奖金",
          key: "annualMeetingBonus",
          width: 90,
          align: "right",
          render: (_, record) => getDetailValue(getBonusDetails(record), "年会奖金"),
        },
        {
          title: "优秀标兵",
          key: "modelEmployeeBonus",
          width: 90,
          align: "right",
          render: (_, record) => getDetailValue(getBonusDetails(record), "优秀标兵"),
        },
      ];
    }

    if (kind === "welfare") {
      const labels = [
        "工龄奖",
        "停车费补贴",
        "滞销奖励补贴",
        "老带新补贴",
        "保护器差补",
        "保底提成补贴",
        "餐费补贴",
        "调仓补贴",
        "6天制补贴",
        "体检费报销",
        "支援补贴",
        "宿舍长补贴",
        "旺季补贴",
        "结婚礼金",
        "产假补贴",
        "其余补贴",
        "满勤补贴",
      ];

      return [
        ...baseColumns,
        ...labels.map((label) => ({
          title: label,
          key: label,
          width: label.length > 4 ? 110 : 90,
          align: "right" as const,
          render: (_: unknown, record: PayrollEmployeeRecord) => getDetailValue(getWelfareSubsidyDetails(record), label),
        })),
      ];
    }

    if (kind === "attendance") {
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
        { title: "迟到", dataIndex: "lateCount", key: "lateCount", width: 70, align: "right" },
        { title: "补卡", dataIndex: "clockRepairCount", key: "clockRepairCount", width: 70, align: "right" },
        { title: "加班", dataIndex: "overtime", key: "overtime", width: 70, align: "right", render: formatNumber },
        {
          title: "事假",
          key: "personalLeave",
          width: 70,
          align: "right",
          render: (_, record) => getDetailValue(record.leaveDetails, "事假"),
        },
        {
          title: "年假",
          key: "annualLeave",
          width: 70,
          align: "right",
          render: (_, record) => getDetailValue(record.leaveDetails, "年假"),
        },
        {
          title: "病假",
          key: "sickLeave",
          width: 70,
          align: "right",
          render: (_, record) => getDetailValue(record.leaveDetails, "病假"),
        },
        {
          title: "婚嫁/陪产假/产假/丧假",
          key: "specialLeave",
          width: 170,
          align: "right",
          render: (_, record) => getDetailValue(record.leaveDetails, "婚嫁/陪产假/产假/丧假"),
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
    }

    return baseColumns;
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

              if (key === "comprehensiveSubsidy") {
                return total + sumDetailItems(getComprehensiveSubsidyDetails(employee));
              }

              if (key === "attendanceSubsidy") {
                return total + sumDetailItems(getAttendanceSubsidyDetails(employee));
              }

              if (key === "bonus") {
                return total + getBonusTotal(employee);
              }

              if (key === "welfareSubsidy") {
                return total + getWelfareSubsidyTotal(employee);
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

  const employeeDetailEditable = employeeDetail
    ? (editableFields[employeeDetail.id] ?? {
        remark: employeeDetail.remark,
        auditAdjustment: employeeDetail.auditAdjustment,
      })
    : undefined;
  const employeeDetailItems = employeeDetail
    ? {
        basic: [
          makeDescriptionItem("name", "姓名", employeeDetail.name),
          makeDescriptionItem("area", "区域", employeeDetail.area),
          makeDescriptionItem("department", "部门", employeeDetail.department),
          makeDescriptionItem("position", "岗位", employeeDetail.position),
          makeDescriptionItem("rank", "职级", employeeDetail.rank),
          makeDescriptionItem("hireDate", "入职日期", employeeDetail.hireDate),
          makeDescriptionItem("regularDate", "转正日期", employeeDetail.regularDate || "-"),
          makeDescriptionItem("expectedRegularDate", "预计转正日期", employeeDetail.expectedRegularDate ?? "-"),
          makeDescriptionItem("resignationDate", "离职日期", employeeDetail.resignationDate ?? "-"),
        ],
        salary: [
          makeDescriptionItem("salaryTotal", "薪资合计", formatMoney(employeeDetail.salaryTotal)),
          makeDescriptionItem("salaryStructure", "薪资结构", employeeDetail.salaryStructure),
          makeDescriptionItem("payableSalary", "应付工资", formatMoney(employeeDetail.payableSalary)),
          makeDescriptionItem(
            "actualSalary",
            "实付工资",
            formatMoney(getEmployeeActualSalary(employeeDetail, editableFields)),
          ),
          makeDescriptionItem("auditAdjustment", "审核调整", formatMoney(employeeDetailEditable?.auditAdjustment ?? 0)),
          makeDescriptionItem("previousMonthDiff", "上月薪资差额", formatMoney(employeeDetail.previousMonthDiff)),
        ],
        attendance: [
          makeDescriptionItem("expectedAttendance", "应出勤", formatNumber(employeeDetail.expectedAttendance)),
          makeDescriptionItem("actualAttendance", "实出勤", formatNumber(employeeDetail.actualAttendance)),
          makeDescriptionItem("leaveDays", "请假", detailList(employeeDetail.leaveDetails)),
          makeDescriptionItem("lateCount", "迟到", employeeDetail.lateCount),
          makeDescriptionItem("clockRepairCount", "补卡", employeeDetail.clockRepairCount),
          makeDescriptionItem("overtime", "加班", detailList(getOvertimeDetails(employeeDetail))),
          makeDescriptionItem("attendanceSubsidy", "假勤补贴", detailList(getAttendanceSubsidyDetails(employeeDetail))),
          makeDescriptionItem("attendanceDeduction", "考勤扣款", formatMoney(employeeDetail.attendanceDeduction)),
        ],
        performance: [
          makeDescriptionItem("kpiSalary", "KPI工资", getDetailValue(employeeDetail.kpiDetails, "KPI 工资")),
          makeDescriptionItem("kpiScore", "KPI分数", getDetailValue(employeeDetail.kpiDetails, "KPI 分数")),
          makeDescriptionItem("kpiPaid", "实发KPI", formatMoney(employeeDetail.kpiPaid)),
          makeDescriptionItem("commissionPaid", "实发提成", detailList(getCommissionPaidDetails(employeeDetail))),
          makeDescriptionItem("remainingCommission", "剩余提成", detailList(getRemainingCommissionDetails(employeeDetail))),
        ],
        allowance: [
          makeDescriptionItem("comprehensiveSubsidy", "综合补贴", detailList(getComprehensiveSubsidyDetails(employeeDetail))),
          makeDescriptionItem("bonus", "奖金", detailList(filterNonZeroDetails(getBonusDetails(employeeDetail)))),
          makeDescriptionItem("welfareSubsidy", "福利补贴", detailList(filterNonZeroDetails(getWelfareSubsidyDetails(employeeDetail)))),
          makeDescriptionItem("otherDeduction", "其余扣款", detailList(getOtherDeductionDetails(employeeDetail))),
          makeDescriptionItem("withholdingDeduction", "代扣扣款", detailList(employeeDetail.withholdingDeductionDetails)),
        ],
        settlement: [
          makeDescriptionItem("remark", "备注", employeeDetailEditable?.remark || "-"),
          makeDescriptionItem("auditAdjustment", "审核调整", formatMoney(employeeDetailEditable?.auditAdjustment ?? 0)),
          makeDescriptionItem("payableSalary", "应付工资", formatMoney(employeeDetail.payableSalary)),
          makeDescriptionItem(
            "actualSalary",
            "实付工资",
            formatMoney(getEmployeeActualSalary(employeeDetail, editableFields)),
          ),
        ],
      }
    : undefined;
  const levelFilteredDepartments =
    visibleLevels.length === 0 ? departments : departments.filter((department) => visibleLevels.includes(department.level));
  const flatSelectedDepartmentNames = flatDepartmentKeys
    .map(parseDepartmentKey)
    .filter((name): name is string => Boolean(name));
  const flatDepartments = levelFilteredDepartments.filter(
    (department) => flatSelectedDepartmentNames.length === 0 || flatSelectedDepartmentNames.includes(department.name),
  );

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
              setFlatDepartmentKeys([]);
              setFlatDepartmentSearch("");
            }}
          >
            重置筛选
          </Button>
          {toolbarExtra}
          {showTitle ? <span className="payroll-approval__title">{info.cycle} 办公室人员</span> : null}
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
          {departmentView === "flat" ? (
            <div className="payroll-department-flat-layout">
              <aside className="payroll-department-flat-layout__tree">
                <Input.Search
                  placeholder="搜索部门"
                  allowClear
                  size="small"
                  value={flatDepartmentSearch}
                  onChange={(event) => setFlatDepartmentSearch(event.target.value)}
                />
                <Tree
                  checkable
                  showIcon
                  autoExpandParent={Boolean(flatDepartmentSearch.trim())}
                  checkedKeys={flatDepartmentKeys}
                  expandedKeys={flatDepartmentSearch.trim() ? defaultExpandedDepartmentKeys : flatExpandedDepartmentKeys}
                  selectedKeys={flatDepartmentKeys}
                  treeData={flatDepartmentTreeData}
                  onExpand={(keys) => setFlatExpandedDepartmentKeys(keys.map((key) => String(key)))}
                  onCheck={(keys) => {
                    const checkedKeys = Array.isArray(keys) ? keys : [];
                    setFlatDepartmentKeys(
                      checkedKeys.map((key) => String(key)).filter((key) => departmentKeys.has(key)),
                    );
                  }}
                />
              </aside>
              <div className="payroll-department-flat-layout__table">
                <Table
                  columns={departmentColumns}
                  dataSource={flatDepartments.map(toFlatDepartmentRecord)}
                  pagination={false}
                  rowKey="id"
                  size="small"
                  scroll={{ x: 1630, y: 520 }}
                  onChange={(_, filters) => setDepartmentFilteredInfo(filters)}
                />
              </div>
            </div>
          ) : (
            <Table
              columns={departmentColumns}
              dataSource={info.departments}
              expandable={{
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
              }}
              pagination={false}
              rowKey="id"
              size="small"
              scroll={{ x: 1630, y: 520 }}
              onChange={(_, filters) => setDepartmentFilteredInfo(filters)}
            />
          )}
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
        width={980}
      >
        {employeeDetail && employeeDetailItems ? (
          <div className="payroll-employee-modal__content">
            <div className="payroll-employee-modal__grid">
              <Descriptions title="基础信息" bordered size="small" column={3} items={employeeDetailItems.basic} />
              <Descriptions title="薪资结算" bordered size="small" column={3} items={employeeDetailItems.salary} />
              <Descriptions title="考勤假勤" bordered size="small" column={2} items={employeeDetailItems.attendance} />
              <Descriptions title="绩效提成" bordered size="small" column={2} items={employeeDetailItems.performance} />
              <Descriptions title="补贴扣款" bordered size="small" column={2} items={employeeDetailItems.allowance} />
              <Descriptions title="审批调整" bordered size="small" column={4} items={employeeDetailItems.settlement} />
            </div>
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
