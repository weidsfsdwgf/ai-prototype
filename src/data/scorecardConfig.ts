import type { Metric } from "./dashboard";

export type ScorecardTemplateStatus = "草稿中" | "启用中" | "已停用";

export type ScorecardOwnerUser = {
  id: string;
  name: string;
  department: string;
};

export type ScorecardSystemField = {
  key: string;
  label: string;
  source: string;
  required: boolean;
  enabled: boolean;
};

export type ScorecardCustomField = {
  id: string;
  name: string;
  placeholder: string;
  required: boolean;
};

export type ScorecardRater = {
  id: string;
  name: string;
  weight?: number;
};

export type ScorecardStandard = {
  id: string;
  description: string;
  score: number;
};

export type ScorecardItem = {
  id: string;
  name: string;
  standards: ScorecardStandard[];
};

export type ScorecardDimension = {
  id: string;
  name: string;
  items: ScorecardItem[];
};

export type ScorecardTemplate = {
  id: string;
  code: string;
  name: string;
  status: ScorecardTemplateStatus;
  owner: string;
  version: string;
  updatedAt: string;
  description: string;
  systemFields: ScorecardSystemField[];
  customFields: ScorecardCustomField[];
  raters: ScorecardRater[];
  dimensions: ScorecardDimension[];
};

export const scorecardStatusOptions: ScorecardTemplateStatus[] = ["草稿中", "启用中", "已停用"];

export const scorecardOwnerUsers: ScorecardOwnerUser[] = [
  { id: "u-hrbp-chen", name: "陈嘉", department: "HRBP 组" },
  { id: "u-ld-lin", name: "林珊", department: "学习发展中心" },
  { id: "u-hr-wang", name: "王越", department: "人事部" },
  { id: "u-pmo-zhao", name: "赵宁", department: "项目管理办公室" },
  { id: "u-ops-zhou", name: "周霖", department: "运营中心" },
];

export const scorecardSystemFieldCatalog: ScorecardSystemField[] = [
  { key: "employeeName", label: "姓名", source: "花名册", required: true, enabled: true },
  { key: "employeeNo", label: "工号", source: "花名册", required: true, enabled: true },
  { key: "department", label: "部门", source: "花名册", required: true, enabled: true },
  { key: "position", label: "岗位", source: "花名册", required: true, enabled: true },
  { key: "entryDate", label: "入职日期", source: "花名册", required: false, enabled: true },
  { key: "rank", label: "职级", source: "岗位体系", required: false, enabled: true },
  { key: "directManager", label: "直属上级", source: "组织架构", required: false, enabled: true },
  { key: "mentor", label: "导师", source: "带教关系", required: false, enabled: true },
  { key: "projectName", label: "项目名称", source: "项目台账", required: false, enabled: true },
  { key: "courseName", label: "课程名称", source: "课程库", required: false, enabled: true },
  { key: "courseSession", label: "课程期次", source: "课程库", required: false, enabled: true },
  { key: "assessmentPeriod", label: "考核周期", source: "业务单据", required: false, enabled: true },
  { key: "fillDate", label: "填表日期", source: "系统日期", required: false, enabled: true },
];

function selectSystemFields(keys: string[]) {
  return keys
    .map((key) => scorecardSystemFieldCatalog.find((field) => field.key === key))
    .filter((field): field is ScorecardSystemField => Boolean(field))
    .map((field) => ({ ...field, enabled: true }));
}

export const scorecardTemplates: ScorecardTemplate[] = [
  {
    id: "scorecard-probation-v1",
    code: "SCORE-20260504-001",
    name: "试用期转正考核表",
    status: "启用中",
    owner: "陈嘉",
    version: "V1.0",
    updatedAt: "2026-05-04",
    description: "用于新人试用期转正，评价过程表现、业务成果和协作反馈。",
    systemFields: selectSystemFields([
      "employeeName",
      "employeeNo",
      "department",
      "position",
      "entryDate",
      "directManager",
      "mentor",
      "assessmentPeriod",
    ]),
    customFields: [
      { id: "cf-project", name: "主带教项目", placeholder: "请输入主带教项目", required: false },
      { id: "cf-result", name: "阶段成果说明", placeholder: "概述试用期阶段性成果", required: true },
    ],
    raters: [
      { id: "r-probation-manager", name: "直属上级评分", weight: 60 },
      { id: "r-probation-mentor", name: "导师评分", weight: 40 },
    ],
    dimensions: [
      {
        id: "d-probation-basic",
        name: "基础表现",
        items: [
          {
            id: "i-attendance",
            name: "出勤与纪律",
            standards: [
              {
                id: "s-attendance-full",
                description: "按时出勤，遵守组织纪律，无明显违规记录",
                score: 10,
              },
              { id: "s-attendance-good", description: "偶有提醒，但整体符合要求", score: 8 },
            ],
          },
          {
            id: "i-learning",
            name: "学习吸收",
            standards: [
              { id: "s-learning-full", description: "能快速吸收流程和岗位知识，并主动复盘", score: 10 },
              { id: "s-learning-good", description: "能完成基础学习，少量场景仍需辅导", score: 8 },
            ],
          },
        ],
      },
      {
        id: "d-probation-result",
        name: "业务结果",
        items: [
          {
            id: "i-task",
            name: "阶段任务完成度",
            standards: [
              { id: "s-task-full", description: "阶段目标全部完成，关键交付稳定", score: 15 },
              { id: "s-task-partial", description: "主体目标完成，个别交付存在延期", score: 12 },
            ],
          },
          {
            id: "i-quality",
            name: "质量与准确性",
            standards: [
              { id: "s-quality-full", description: "交付质量稳定，返工和纠错成本低", score: 15 },
              { id: "s-quality-partial", description: "整体质量可接受，局部需要复核", score: 12 },
            ],
          },
          {
            id: "i-solving",
            name: "问题解决能力",
            standards: [
              { id: "s-solving-full", description: "能主动定位问题并推进闭环", score: 15 },
              { id: "s-solving-partial", description: "能在指导下完成问题处理", score: 12 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "scorecard-course-v1",
    code: "SCORE-20260504-002",
    name: "课程质量评估表",
    status: "启用中",
    owner: "林珊",
    version: "V1.0",
    updatedAt: "2026-05-03",
    description: "用于课程结束后评价课程准备、授课过程和结果反馈。",
    systemFields: selectSystemFields(["courseName", "courseSession", "department", "fillDate", "assessmentPeriod"]),
    customFields: [
      { id: "cf-course-feedback", name: "学员反馈摘要", placeholder: "请输入学员反馈摘要", required: false },
    ],
    raters: [
      { id: "r-course-owner", name: "课程负责人评分", weight: 60 },
      { id: "r-course-business", name: "业务方评分", weight: 40 },
    ],
    dimensions: [
      {
        id: "d-course-prepare",
        name: "课前准备",
        items: [
          {
            id: "i-material",
            name: "资料准备",
            standards: [
              { id: "s-material-full", description: "资料完整、结构清晰，能支撑课堂目标", score: 15 },
              { id: "s-material-good", description: "资料基本齐备，少量内容需补充", score: 12 },
            ],
          },
          {
            id: "i-schedule",
            name: "排期组织",
            standards: [
              { id: "s-schedule-full", description: "排期合理，通知和场地准备及时", score: 10 },
              { id: "s-schedule-good", description: "排期可执行，个别信息同步较晚", score: 8 },
            ],
          },
        ],
      },
      {
        id: "d-course-result",
        name: "课堂结果",
        items: [
          {
            id: "i-expression",
            name: "内容表达",
            standards: [
              { id: "s-expression-full", description: "表达清晰，案例贴合业务，互动充分", score: 15 },
              { id: "s-expression-good", description: "表达完整，重点内容仍可加强互动", score: 12 },
            ],
          },
          {
            id: "i-satisfaction",
            name: "满意度",
            standards: [
              { id: "s-satisfaction-full", description: "学员满意度高，反馈集中正向", score: 10 },
              { id: "s-satisfaction-good", description: "整体满意，少量意见集中在节奏或案例", score: 8 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "scorecard-stage-v1",
    code: "",
    name: "阶段性目标考核表",
    status: "草稿中",
    owner: "王越",
    version: "V0.8",
    updatedAt: "2026-05-02",
    description: "用于按周期跟进员工在阶段目标下的表现，评分项仍在补齐。",
    systemFields: selectSystemFields(["employeeName", "employeeNo", "department", "position", "assessmentPeriod"]),
    customFields: [
      { id: "cf-stage-goal", name: "阶段目标", placeholder: "请输入阶段目标", required: true },
    ],
    raters: [{ id: "r-stage-main", name: "主评", weight: 70 }],
    dimensions: [
      {
        id: "d-stage-goal",
        name: "目标达成",
        items: [
          {
            id: "i-stage-delivery",
            name: "交付完成度",
            standards: [{ id: "s-stage-delivery", description: "按计划完成阶段目标", score: 30 }],
          },
        ],
      },
    ],
  },
  {
    id: "scorecard-project-v1",
    code: "SCORE-20260426-001",
    name: "项目复盘评估表",
    status: "已停用",
    owner: "赵宁",
    version: "V1.0",
    updatedAt: "2026-04-26",
    description: "历史项目复盘模板，保留查询和归档，不再用于新建评分。",
    systemFields: selectSystemFields(["projectName", "department", "directManager", "fillDate"]),
    customFields: [
      { id: "cf-project-stage", name: "项目阶段", placeholder: "请输入项目阶段", required: true },
    ],
    raters: [
      { id: "r-project-leader", name: "项目负责人评分", weight: 50 },
      { id: "r-project-member", name: "协作方评分", weight: 50 },
    ],
    dimensions: [
      {
        id: "d-project-result",
        name: "目标达成",
        items: [
          {
            id: "i-project-target",
            name: "目标完成质量",
            standards: [{ id: "s-project-target", description: "目标达成且复盘结论可沉淀", score: 30 }],
          },
          {
            id: "i-project-collaboration",
            name: "协作过程",
            standards: [{ id: "s-project-collaboration", description: "协作顺畅，风险同步及时", score: 20 }],
          },
        ],
      },
    ],
  },
];

export const scorecardMetrics: Metric[] = [
  { label: "模板总数", value: String(scorecardTemplates.length), change: "业务按模板编码引用", status: "healthy" },
  {
    label: "已发布模板",
    value: String(scorecardTemplates.filter((template) => template.status === "启用中").length),
    change: "已生成模板编码",
    status: "healthy",
  },
  {
    label: "草稿模板",
    value: String(scorecardTemplates.filter((template) => template.status === "草稿中").length),
    change: "发布时生成编码",
    status: "warning",
  },
  {
    label: "评分角色上限",
    value: "5",
    change: "按模板灵活配置",
    status: "healthy",
  },
];
