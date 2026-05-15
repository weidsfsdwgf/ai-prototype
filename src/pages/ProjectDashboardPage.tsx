import { Button, Segmented, Select, Space, Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { CircleHelp, Download, RefreshCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { SectionPanel } from "../components/SectionPanel";
import "./Page.css";
import "./ProjectDashboardPage.css";

type WorkOrderView = "module" | "owner" | "applicant";
type WorkOrderStatus = "待确认" | "开发中" | "待验收" | "已完成";
type IterationState = "已结束" | "进行中" | "计划中";

type DemandWorkOrder = {
  id: string;
  title: string;
  module: string;
  itOwner: string;
  applicant: string;
  team: string;
  department: string;
  assignee: string;
  iteration: string;
  iterationStart: string;
  iterationEnd: string;
  iterationState: IterationState;
  status: WorkOrderStatus;
  estimateHours: number;
  actualHours: number;
  remainingHours: number;
};

type WorkOrderRow = {
  key: string;
  name: string;
  total: number;
  pending: number;
  developing: number;
  acceptance: number;
  completed: number;
  actualHours: number;
};

type IterationTeamRow = {
  key: string;
  team: string;
  demandTotal: number;
  unfinished: number;
  completed: number;
  estimateHours: number;
  actualHours: number;
  remainingHours: number;
};

type IterationPersonRow = {
  key: string;
  department: string;
  person: string;
  taskTotal: number;
  unfinished: number;
  completed: number;
  estimateHours: number;
  actualHours: number;
  remainingHours: number;
};

type BugOverviewRow = {
  key: string;
  team: string;
  bugTotal: number;
  pending: number;
  resolved: number;
  closing: number;
};

const today = dayjs("2026-05-15");
const currentIteration = "2026.05 标准作业流程迭代";

const workOrderViewOptions = [
  { label: "模块分类", value: "module" },
  { label: "IT负责人", value: "owner" },
  { label: "提出人", value: "applicant" },
];

const baseWorkOrders: DemandWorkOrder[] = [
  {
    id: "WO-202605-001",
    title: "审批批量撤回标准流程",
    module: "审批中心",
    itOwner: "周予安",
    applicant: "林知夏",
    team: "OA平台组",
    department: "产品研发部",
    assignee: "唐澈",
    iteration: currentIteration,
    iterationStart: "2026-05-06",
    iterationEnd: "2026-05-24",
    iterationState: "进行中",
    status: "开发中",
    estimateHours: 34,
    actualHours: 22,
    remainingHours: 12,
  },
  {
    id: "WO-202605-002",
    title: "需求工单审批后口径统计",
    module: "需求工单",
    itOwner: "陈嘉",
    applicant: "许嘉明",
    team: "研发效能组",
    department: "研发效能部",
    assignee: "赵澈",
    iteration: currentIteration,
    iterationStart: "2026-05-06",
    iterationEnd: "2026-05-24",
    iterationState: "进行中",
    status: "待验收",
    estimateHours: 28,
    actualHours: 26,
    remainingHours: 2,
  },
  {
    id: "WO-202605-003",
    title: "项目看板V2聚合视图",
    module: "项目看板",
    itOwner: "陈嘉",
    applicant: "顾南",
    team: "研发效能组",
    department: "研发效能部",
    assignee: "宋言",
    iteration: currentIteration,
    iterationStart: "2026-05-06",
    iterationEnd: "2026-05-24",
    iterationState: "进行中",
    status: "开发中",
    estimateHours: 42,
    actualHours: 25,
    remainingHours: 17,
  },
  {
    id: "WO-202605-004",
    title: "花名册导出模板配置",
    module: "人事管理",
    itOwner: "沈时序",
    applicant: "白予",
    team: "人事系统组",
    department: "HR数字化部",
    assignee: "梁悦",
    iteration: currentIteration,
    iterationStart: "2026-05-06",
    iterationEnd: "2026-05-24",
    iterationState: "进行中",
    status: "已完成",
    estimateHours: 24,
    actualHours: 25,
    remainingHours: 0,
  },
  {
    id: "WO-202605-005",
    title: "转正提醒抄送负责人",
    module: "人事管理",
    itOwner: "沈时序",
    applicant: "白予",
    team: "人事系统组",
    department: "HR数字化部",
    assignee: "梁悦",
    iteration: currentIteration,
    iterationStart: "2026-05-06",
    iterationEnd: "2026-05-24",
    iterationState: "进行中",
    status: "待验收",
    estimateHours: 18,
    actualHours: 18,
    remainingHours: 0,
  },
  {
    id: "WO-202605-006",
    title: "绩效指标权重审批",
    module: "绩效管理",
    itOwner: "许嘉明",
    applicant: "梁悦",
    team: "人事系统组",
    department: "HR数字化部",
    assignee: "宋言",
    iteration: currentIteration,
    iterationStart: "2026-05-06",
    iterationEnd: "2026-05-24",
    iterationState: "进行中",
    status: "已完成",
    estimateHours: 32,
    actualHours: 34,
    remainingHours: 0,
  },
  {
    id: "WO-202605-007",
    title: "运营日报渠道转化指标",
    module: "数据服务",
    itOwner: "唐澈",
    applicant: "宋言",
    team: "数据应用组",
    department: "数据平台部",
    assignee: "韩序",
    iteration: currentIteration,
    iterationStart: "2026-05-06",
    iterationEnd: "2026-05-24",
    iterationState: "进行中",
    status: "已完成",
    estimateHours: 30,
    actualHours: 31,
    remainingHours: 0,
  },
  {
    id: "WO-202605-008",
    title: "成本明细钻取",
    module: "数据服务",
    itOwner: "唐澈",
    applicant: "韩序",
    team: "数据应用组",
    department: "数据平台部",
    assignee: "赵澈",
    iteration: currentIteration,
    iterationStart: "2026-05-06",
    iterationEnd: "2026-05-24",
    iterationState: "进行中",
    status: "待确认",
    estimateHours: 36,
    actualHours: 10,
    remainingHours: 26,
  },
  {
    id: "WO-202604-001",
    title: "审批列表常用筛选",
    module: "审批中心",
    itOwner: "周予安",
    applicant: "陈嘉",
    team: "OA平台组",
    department: "产品研发部",
    assignee: "林知夏",
    iteration: "2026.04 体验优化迭代",
    iterationStart: "2026-04-08",
    iterationEnd: "2026-04-26",
    iterationState: "已结束",
    status: "已完成",
    estimateHours: 20,
    actualHours: 22,
    remainingHours: 0,
  },
  {
    id: "WO-202604-002",
    title: "低值易耗品损耗统计",
    module: "资产管理",
    itOwner: "唐澈",
    applicant: "赵澈",
    team: "数据应用组",
    department: "数据平台部",
    assignee: "韩序",
    iteration: "2026.04 体验优化迭代",
    iterationStart: "2026-04-08",
    iterationEnd: "2026-04-26",
    iterationState: "已结束",
    status: "已完成",
    estimateHours: 18,
    actualHours: 17,
    remainingHours: 0,
  },
  {
    id: "WO-202603-001",
    title: "审批移动端摘要字段调整",
    module: "审批中心",
    itOwner: "周予安",
    applicant: "顾南",
    team: "OA平台组",
    department: "产品研发部",
    assignee: "唐澈",
    iteration: "2026.03 移动体验迭代",
    iterationStart: "2026-03-05",
    iterationEnd: "2026-03-22",
    iterationState: "已结束",
    status: "已完成",
    estimateHours: 16,
    actualHours: 16,
    remainingHours: 0,
  },
];

const generatedModules = ["审批中心", "需求工单", "项目看板", "人事管理", "绩效管理", "数据服务", "资产管理", "移动端"];
const generatedOwners = ["周予安", "陈嘉", "沈时序", "许嘉明", "唐澈"];
const generatedApplicants = ["林知夏", "许嘉明", "顾南", "白予", "梁悦", "宋言", "韩序", "赵澈"];
const generatedTeams = [
  { team: "OA平台组", department: "产品研发部", assignees: ["唐澈", "林知夏", "顾南"] },
  { team: "研发效能组", department: "研发效能部", assignees: ["赵澈", "宋言", "陈嘉"] },
  { team: "人事系统组", department: "HR数字化部", assignees: ["梁悦", "宋言", "白予"] },
  { team: "数据应用组", department: "数据平台部", assignees: ["韩序", "赵澈", "唐澈"] },
  { team: "移动体验组", department: "产品研发部", assignees: ["顾南", "林知夏", "梁悦"] },
];
const generatedIterations = [
  { name: "2026.03 移动体验迭代", start: "2026-03-05", end: "2026-03-22", state: "已结束" as const },
  { name: "2026.04 体验优化迭代", start: "2026-04-08", end: "2026-04-26", state: "已结束" as const },
  { name: currentIteration, start: "2026-05-06", end: "2026-05-24", state: "进行中" as const },
  { name: "2026.06 数据治理迭代", start: "2026-06-04", end: "2026-06-22", state: "计划中" as const },
];
const generatedStatuses: WorkOrderStatus[] = ["待确认", "开发中", "待验收", "已完成", "开发中", "已完成"];

function makeGeneratedWorkOrders(): DemandWorkOrder[] {
  return Array.from({ length: 64 }, (_, index) => {
    const teamMeta = generatedTeams[index % generatedTeams.length];
    const iteration = generatedIterations[index % generatedIterations.length];
    const estimateHours = 12 + (index % 8) * 5;
    const status = generatedStatuses[(index + Math.floor(index / 4)) % generatedStatuses.length];
    const actualHours = status === "已完成" ? estimateHours + (index % 3) : Math.max(4, estimateHours - 5 - (index % 6));

    return {
      id: `WO-G-${String(index + 1).padStart(3, "0")}`,
      title: `${generatedModules[index % generatedModules.length]}标准作业流程-${index + 1}`,
      module: generatedModules[index % generatedModules.length],
      itOwner: generatedOwners[(index + 2) % generatedOwners.length],
      applicant: generatedApplicants[index % generatedApplicants.length],
      team: teamMeta.team,
      department: teamMeta.department,
      assignee: teamMeta.assignees[index % teamMeta.assignees.length],
      iteration: iteration.name,
      iterationStart: iteration.start,
      iterationEnd: iteration.end,
      iterationState: iteration.state,
      status,
      estimateHours,
      actualHours,
      remainingHours: Math.max(0, estimateHours - actualHours),
    };
  });
}

const workOrders = [...baseWorkOrders, ...makeGeneratedWorkOrders()];

function getWorkOrderGroupName(item: DemandWorkOrder, view: WorkOrderView) {
  if (view === "owner") {
    return item.itOwner;
  }

  if (view === "applicant") {
    return item.applicant;
  }

  return item.module;
}

function getProgressPercent(completed: number, total: number) {
  return Math.round((completed / Math.max(total, 1)) * 100);
}

function buildWorkOrderRows(view: WorkOrderView): WorkOrderRow[] {
  const groups = new Map<string, WorkOrderRow>();

  workOrders.forEach((item) => {
    const name = getWorkOrderGroupName(item, view);
    const current = groups.get(name) ?? {
      key: name,
      name,
      total: 0,
      pending: 0,
      developing: 0,
      acceptance: 0,
      completed: 0,
      actualHours: 0,
    };

    current.total += 1;
    current.pending += item.status === "待确认" ? 1 : 0;
    current.developing += item.status === "开发中" ? 1 : 0;
    current.acceptance += item.status === "待验收" ? 1 : 0;
    current.completed += item.status === "已完成" ? 1 : 0;
    current.actualHours += item.actualHours;
    groups.set(name, current);
  });

  return Array.from(groups.values()).sort((a, b) => b.total - a.total);
}

function buildTeamRows(items: DemandWorkOrder[]): IterationTeamRow[] {
  const groups = new Map<string, IterationTeamRow>();

  items.forEach((item) => {
    const current = groups.get(item.team) ?? {
      key: item.team,
      team: item.team,
      demandTotal: 0,
      unfinished: 0,
      completed: 0,
      estimateHours: 0,
      actualHours: 0,
      remainingHours: 0,
    };

    current.demandTotal += 1;
    current.completed += item.status === "已完成" ? 1 : 0;
    current.unfinished += item.status === "已完成" ? 0 : 1;
    current.estimateHours += item.estimateHours;
    current.actualHours += item.actualHours;
    current.remainingHours += item.remainingHours;
    groups.set(item.team, current);
  });

  return Array.from(groups.values()).sort((a, b) => b.demandTotal - a.demandTotal);
}

function buildPersonRows(items: DemandWorkOrder[]): IterationPersonRow[] {
  const groups = new Map<string, IterationPersonRow>();

  items.forEach((item) => {
    const current = groups.get(item.assignee) ?? {
      key: item.assignee,
      department: item.department,
      person: item.assignee,
      taskTotal: 0,
      unfinished: 0,
      completed: 0,
      estimateHours: 0,
      actualHours: 0,
      remainingHours: 0,
    };

    current.taskTotal += 1;
    current.completed += item.status === "已完成" ? 1 : 0;
    current.unfinished += item.status === "已完成" ? 0 : 1;
    current.estimateHours += item.estimateHours;
    current.actualHours += item.actualHours;
    current.remainingHours += item.remainingHours;
    groups.set(item.assignee, current);
  });

  return Array.from(groups.values()).sort((a, b) => b.taskTotal - a.taskTotal);
}

function buildBugRows(items: DemandWorkOrder[]): BugOverviewRow[] {
  const teams = Array.from(new Set(items.map((item) => item.team)));

  return teams
    .map((team, index) => {
      const teamItems = items.filter((item) => item.team === team);
      const pending = teamItems.filter((item) => item.status === "开发中").length + (index % 3);
      const resolved = teamItems.filter((item) => item.status === "已完成").length + 2 + (index % 4);
      const closing = teamItems.filter((item) => item.status === "待验收").length + (index % 2);

      return {
        key: team,
        team,
        bugTotal: pending + resolved + closing,
        pending,
        resolved,
        closing,
      };
    })
    .sort((a, b) => b.bugTotal - a.bugTotal);
}

function ProgressCell({ completed, total, maxTotal }: { completed: number; total: number; maxTotal: number }) {
  const percent = getProgressPercent(completed, total);
  const width = Math.max(96, Math.round((total / Math.max(maxTotal, 1)) * 210));

  return (
    <div className="project-dashboard-progress-cell">
      <Tooltip title={`已完成 ${completed} / 工单总数 ${total}`}>
        <div className="project-dashboard-progress" style={{ width }}>
          <span style={{ width: `${percent}%` }} />
        </div>
      </Tooltip>
      <span>{completed}/{total}</span>
    </div>
  );
}

function ProgressMeter({ completed, total, showPercentOnly = false }: { completed: number; total: number; showPercentOnly?: boolean }) {
  const percent = getProgressPercent(completed, total);

  if (showPercentOnly) {
    return <span className="project-dashboard-percent">{percent}%</span>;
  }

  return (
    <div className="project-dashboard-meter">
      <div className="project-dashboard-meter__track">
        <span style={{ width: `${percent}%` }} />
      </div>
      <span>{percent}%</span>
    </div>
  );
}

function WorkOrderTotalTitle() {
  return (
    <span className="project-dashboard-title-with-help">
      <Tooltip title="仅包含审批通过后且未被关闭的工单">
        <CircleHelp aria-label="需求工单总数说明" size={14} />
      </Tooltip>
      <span>需求工单总数</span>
    </span>
  );
}

function makeFilters(values: string[]) {
  return Array.from(new Set(values)).map((value) => ({ text: value, value }));
}

export function ProjectDashboardPage() {
  const [workOrderView, setWorkOrderView] = useState<WorkOrderView>("module");
  const [selectedIteration, setSelectedIteration] = useState<string | undefined>(currentIteration);

  const iterationOptions = useMemo(
    () =>
      Array.from(new Set(workOrders.map((item) => item.iteration))).map((iteration) => ({
        label: iteration,
        value: iteration,
      })),
    [],
  );
  const workOrderRows = useMemo(() => buildWorkOrderRows(workOrderView), [workOrderView]);
  const maxWorkOrderTotal = Math.max(...workOrderRows.map((row) => row.total), 1);
  const workOrderNameFilters = useMemo(() => makeFilters(workOrderRows.map((row) => row.name)), [workOrderRows]);

  const filteredIterationOrders = useMemo(() => {
    return workOrders.filter((item) => {
      if (selectedIteration) {
        return item.iteration === selectedIteration;
      }

      return item.iterationState === "进行中";
    });
  }, [selectedIteration]);

  const teamRows = useMemo(() => buildTeamRows(filteredIterationOrders), [filteredIterationOrders]);
  const personRows = useMemo(() => buildPersonRows(filteredIterationOrders), [filteredIterationOrders]);
  const bugRows = useMemo(() => buildBugRows(filteredIterationOrders), [filteredIterationOrders]);
  const weeklyStats = useMemo(() => {
    const currentIterationOrders = workOrders.filter((item) => item.iteration === currentIteration);

    return {
      newOrders: currentIterationOrders.filter((_, index) => index % 3 === 0).length,
      pendingOrders: workOrders.filter((item) => item.status === "待确认").length,
      developingOrders: workOrders.filter((item) => item.status === "开发中").length,
      launchedDemands: currentIterationOrders.filter((item) => item.status === "已完成").length,
    };
  }, []);
  const teamFilters = useMemo(() => makeFilters(teamRows.map((row) => row.team)), [teamRows]);
  const departmentFilters = useMemo(() => makeFilters(personRows.map((row) => row.department)), [personRows]);
  const personFilters = useMemo(() => makeFilters(personRows.map((row) => row.person)), [personRows]);
  const bugTeamFilters = useMemo(() => makeFilters(bugRows.map((row) => row.team)), [bugRows]);

  const workOrderColumns: ColumnsType<WorkOrderRow> = [
    {
      title: workOrderViewOptions.find((item) => item.value === workOrderView)?.label,
      dataIndex: "name",
      fixed: "left",
      width: 150,
      filters: workOrderNameFilters,
      filterSearch: true,
      onFilter: (value, row) => row.name === value,
      sorter: (a, b) => a.name.localeCompare(b.name, "zh-Hans-CN"),
    },
    {
      title: "完成进度（已完成/工单总数）",
      width: 260,
      render: (_, row) => <ProgressCell completed={row.completed} maxTotal={maxWorkOrderTotal} total={row.total} />,
      sorter: (a, b) => getProgressPercent(a.completed, a.total) - getProgressPercent(b.completed, b.total),
    },
    {
      title: <WorkOrderTotalTitle />,
      dataIndex: "total",
      width: 132,
      align: "right",
      sorter: (a, b) => a.total - b.total,
    },
    { title: "待确认", dataIndex: "pending", width: 82, align: "right", sorter: (a, b) => a.pending - b.pending },
    { title: "开发中", dataIndex: "developing", width: 82, align: "right", sorter: (a, b) => a.developing - b.developing },
    { title: "待验收", dataIndex: "acceptance", width: 82, align: "right", sorter: (a, b) => a.acceptance - b.acceptance },
    { title: "已完成", dataIndex: "completed", width: 90, align: "right", sorter: (a, b) => a.completed - b.completed },
    { title: "实际工时", dataIndex: "actualHours", width: 98, align: "right", render: (value: number) => `${value}h`, sorter: (a, b) => a.actualHours - b.actualHours },
  ];

  const teamColumns: ColumnsType<IterationTeamRow> = [
    { title: "团队", dataIndex: "team", fixed: "left", width: 132, filters: teamFilters, filterSearch: true, onFilter: (value, row) => row.team === value, sorter: (a, b) => a.team.localeCompare(b.team, "zh-Hans-CN") },
    { title: "进度", width: 190, render: (_, row) => <ProgressMeter completed={row.completed} total={row.demandTotal} />, sorter: (a, b) => getProgressPercent(a.completed, a.demandTotal) - getProgressPercent(b.completed, b.demandTotal) },
    { title: "需求总数", dataIndex: "demandTotal", width: 92, align: "right", sorter: (a, b) => a.demandTotal - b.demandTotal },
    { title: "未完成", dataIndex: "unfinished", width: 82, align: "right", sorter: (a, b) => a.unfinished - b.unfinished },
    { title: "已完成", dataIndex: "completed", width: 82, align: "right", sorter: (a, b) => a.completed - b.completed },
    { title: "预计工时", dataIndex: "estimateHours", width: 92, align: "right", render: (value: number) => `${value}h`, sorter: (a, b) => a.estimateHours - b.estimateHours },
    { title: "实际工时", dataIndex: "actualHours", width: 92, align: "right", render: (value: number) => `${value}h`, sorter: (a, b) => a.actualHours - b.actualHours },
    { title: "剩余工时", dataIndex: "remainingHours", width: 92, align: "right", render: (value: number) => `${value}h`, sorter: (a, b) => a.remainingHours - b.remainingHours },
  ];

  const personColumns: ColumnsType<IterationPersonRow> = [
    { title: "部门", dataIndex: "department", fixed: "left", width: 132, filters: departmentFilters, filterSearch: true, onFilter: (value, row) => row.department === value, sorter: (a, b) => a.department.localeCompare(b.department, "zh-Hans-CN") },
    { title: "人员", dataIndex: "person", width: 90, filters: personFilters, filterSearch: true, onFilter: (value, row) => row.person === value, sorter: (a, b) => a.person.localeCompare(b.person, "zh-Hans-CN") },
    { title: "进度", width: 82, align: "right", render: (_, row) => <ProgressMeter completed={row.completed} showPercentOnly total={row.taskTotal} />, sorter: (a, b) => getProgressPercent(a.completed, a.taskTotal) - getProgressPercent(b.completed, b.taskTotal) },
    { title: "任务总数", dataIndex: "taskTotal", width: 92, align: "right", sorter: (a, b) => a.taskTotal - b.taskTotal },
    { title: "未完成", dataIndex: "unfinished", width: 82, align: "right", sorter: (a, b) => a.unfinished - b.unfinished },
    { title: "已完成", dataIndex: "completed", width: 82, align: "right", sorter: (a, b) => a.completed - b.completed },
    { title: "预计工时", dataIndex: "estimateHours", width: 92, align: "right", render: (value: number) => `${value}h`, sorter: (a, b) => a.estimateHours - b.estimateHours },
    { title: "实际工时", dataIndex: "actualHours", width: 92, align: "right", render: (value: number) => `${value}h`, sorter: (a, b) => a.actualHours - b.actualHours },
    { title: "剩余工时", dataIndex: "remainingHours", width: 92, align: "right", render: (value: number) => `${value}h`, sorter: (a, b) => a.remainingHours - b.remainingHours },
  ];

  const bugColumns: ColumnsType<BugOverviewRow> = [
    { title: "团队", dataIndex: "team", fixed: "left", width: 132, filters: bugTeamFilters, filterSearch: true, onFilter: (value, row) => row.team === value, sorter: (a, b) => a.team.localeCompare(b.team, "zh-Hans-CN") },
    { title: "bug总数", dataIndex: "bugTotal", width: 98, align: "right", sorter: (a, b) => a.bugTotal - b.bugTotal },
    { title: "待处理", dataIndex: "pending", width: 92, align: "right", sorter: (a, b) => a.pending - b.pending },
    { title: "已处理", dataIndex: "resolved", width: 92, align: "right", sorter: (a, b) => a.resolved - b.resolved },
    { title: "待关闭", dataIndex: "closing", width: 92, align: "right", sorter: (a, b) => a.closing - b.closing },
  ];

  return (
    <main className="page project-dashboard-page">
      <PageHeader
        title="项目看板V2"
        description="按工单、团队迭代进度与人员任务进度汇总标准作业流程交付状态。"
        actions={
          <Space wrap>
            <Button icon={<RefreshCcw size={16} />}>刷新</Button>
            <Button icon={<Download size={16} />}>导出</Button>
          </Space>
        }
      />

      <div className="project-dashboard-stats">
        <div className="project-dashboard-stat-card">
          <span>本周新增工单数</span>
          <strong>{weeklyStats.newOrders}</strong>
        </div>
        <div className="project-dashboard-stat-card">
          <span>待确认工单</span>
          <strong>{weeklyStats.pendingOrders}</strong>
        </div>
        <div className="project-dashboard-stat-card">
          <span>开发中工单数</span>
          <strong>{weeklyStats.developingOrders}</strong>
        </div>
        <div className="project-dashboard-stat-card">
          <span>本周上线需求数</span>
          <strong>{weeklyStats.launchedDemands}</strong>
        </div>
      </div>

      <div className="project-dashboard-layout">
        <SectionPanel
          className="project-dashboard-workorders"
          title="工单概览"
          actions={
            <Segmented
              options={workOrderViewOptions}
              value={workOrderView}
              onChange={(value) => setWorkOrderView(value as WorkOrderView)}
            />
          }
        >
          <Table
            columns={workOrderColumns}
            dataSource={workOrderRows}
            pagination={false}
            rowKey="key"
            scroll={{ x: 920, y: 300 }}
            size="small"
          />
        </SectionPanel>

        <SectionPanel
          className="project-dashboard-iteration"
          title={
            <span className="project-dashboard-iteration-title">
              <span>迭代进度</span>
              <Select
                allowClear
                options={iterationOptions}
                placeholder="全部进行中迭代"
                value={selectedIteration}
                onChange={(value) => setSelectedIteration(value)}
                style={{ width: 220 }}
              />
            </span>
          }
        >
          <Table
            columns={teamColumns}
            dataSource={teamRows}
            pagination={false}
            rowKey="key"
            scroll={{ x: 860, y: 300 }}
            size="small"
          />
        </SectionPanel>

        <SectionPanel className="project-dashboard-tasks" title="任务进度">
          <Table
            columns={personColumns}
            dataSource={personRows}
            pagination={false}
            rowKey="key"
            scroll={{ x: 920, y: 300 }}
            size="small"
          />
        </SectionPanel>

        <SectionPanel className="project-dashboard-bugs" title="Bug概览">
          <Table
            columns={bugColumns}
            dataSource={bugRows}
            pagination={false}
            rowKey="key"
            scroll={{ x: 520, y: 300 }}
            size="small"
          />
        </SectionPanel>
      </div>
      <span className="project-dashboard-date-note">当前日期：{today.format("YYYY-MM-DD")}</span>
    </main>
  );
}
