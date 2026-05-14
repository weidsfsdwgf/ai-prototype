export type MetricValueMode = "系统取值" | "人工评分";

export type MetricStatus = "启用中" | "草稿中" | "已停用";

export type MetricCategory = {
  id: string;
  name: string;
  children?: MetricCategory[];
};

export type MetricStandard = {
  id: string;
  description: string;
  score: number;
  fieldKey?: string;
};

export type MetricLibraryItem = {
  id: string;
  code: string;
  name: string;
  category: string;
  valueMode: MetricValueMode;
  allowManualEdit: boolean;
  status: MetricStatus;
  updatedAt: string;
  description: string;
  standards: MetricStandard[];
};

export const metricValueModeOptions: MetricValueMode[] = ["人工评分", "系统取值"];

export const metricStatusOptions: MetricStatus[] = ["启用中", "草稿中", "已停用"];

export const initialMetricCategories: MetricCategory[] = [
  {
    id: "metric-cat-business",
    name: "业务结果",
    children: [
      { id: "metric-cat-ops", name: "运营履约" },
      { id: "metric-cat-warehouse", name: "仓储质量" },
    ],
  },
  {
    id: "metric-cat-process",
    name: "过程质量",
    children: [
      { id: "metric-cat-delivery", name: "交付质量" },
      { id: "metric-cat-risk", name: "风险闭环" },
    ],
  },
  {
    id: "metric-cat-people",
    name: "组织协同",
    children: [
      { id: "metric-cat-collaboration", name: "协同反馈" },
      { id: "metric-cat-learning", name: "学习成长" },
    ],
  },
];

export const metricLibraryItems: MetricLibraryItem[] = [
  {
    id: "metric-order-fulfillment",
    code: "METRIC-20260512-001",
    name: "订单准时履约率",
    category: "运营履约",
    valueMode: "系统取值",
    allowManualEdit: false,
    status: "启用中",
    updatedAt: "2026-05-12",
    description: "按考核周期统计门店订单在承诺时效内完成履约的比例。",
    standards: [
      { id: "metric-order-fulfillment-100", description: "准时履约率不低于 98%", score: 20, fieldKey: "onTimeFulfillmentRateExcellent" },
      { id: "metric-order-fulfillment-90", description: "准时履约率 95% 至 98%", score: 16, fieldKey: "onTimeFulfillmentRateQualified" },
      { id: "metric-order-fulfillment-70", description: "准时履约率低于 95%", score: 10, fieldKey: "onTimeFulfillmentRateWarning" },
    ],
  },
  {
    id: "metric-stock-accuracy",
    code: "METRIC-20260512-002",
    name: "库存准确率",
    category: "仓储质量",
    valueMode: "系统取值",
    allowManualEdit: true,
    status: "启用中",
    updatedAt: "2026-05-12",
    description: "盘点后自动计算库存账实一致比例，允许仓储管理岗确认差异原因。",
    standards: [
      { id: "metric-stock-accuracy-100", description: "库存准确率不低于 99%", score: 15, fieldKey: "stockAccuracyExcellent" },
      { id: "metric-stock-accuracy-90", description: "库存准确率 97% 至 99%", score: 12, fieldKey: "stockAccuracyQualified" },
      { id: "metric-stock-accuracy-70", description: "库存准确率低于 97%", score: 8, fieldKey: "stockAccuracyWarning" },
    ],
  },
  {
    id: "metric-quality-rework",
    code: "METRIC-20260512-003",
    name: "返工率控制",
    category: "交付质量",
    valueMode: "系统取值",
    allowManualEdit: false,
    status: "启用中",
    updatedAt: "2026-05-11",
    description: "统计被退回或要求补正的交付件占比，反映一次交付质量。",
    standards: [
      { id: "metric-quality-rework-100", description: "返工率低于 3%", score: 15, fieldKey: "reworkRateExcellent" },
      { id: "metric-quality-rework-90", description: "返工率 3% 至 8%", score: 12, fieldKey: "reworkRateQualified" },
      { id: "metric-quality-rework-70", description: "返工率高于 8%", score: 8, fieldKey: "reworkRateWarning" },
    ],
  },
  {
    id: "metric-cross-team",
    code: "METRIC-20260512-004",
    name: "跨部门协同反馈",
    category: "协同反馈",
    valueMode: "人工评分",
    allowManualEdit: true,
    status: "启用中",
    updatedAt: "2026-05-10",
    description: "由协作部门评价响应质量、风险同步和问题闭环情况。",
    standards: [
      { id: "metric-cross-team-100", description: "响应及时，关键风险提前同步并闭环", score: 10 },
      { id: "metric-cross-team-80", description: "能完成协同事项，偶有信息补充", score: 8 },
      { id: "metric-cross-team-60", description: "协同推进依赖催办，风险暴露较晚", score: 6 },
    ],
  },
  {
    id: "metric-learning-completion",
    code: "METRIC-20260512-005",
    name: "学习任务完成率",
    category: "学习成长",
    valueMode: "系统取值",
    allowManualEdit: true,
    status: "启用中",
    updatedAt: "2026-05-09",
    description: "从课程库同步必修课程完成率，用于新人转正和岗位学习考核。",
    standards: [
      { id: "metric-learning-completion-100", description: "必修课程完成率 100%", score: 10, fieldKey: "requiredCourseCompletionFull" },
      { id: "metric-learning-completion-80", description: "必修课程完成率 80% 至 100%", score: 8, fieldKey: "requiredCourseCompletionPartial" },
      { id: "metric-learning-completion-60", description: "必修课程完成率低于 80%", score: 5, fieldKey: "requiredCourseCompletionWarning" },
    ],
  },
  {
    id: "metric-attendance-discipline",
    code: "",
    name: "出勤与纪律",
    category: "风险闭环",
    valueMode: "人工评分",
    allowManualEdit: true,
    status: "草稿中",
    updatedAt: "2026-05-08",
    description: "按考勤和违规记录形成通用纪律考核事项，发布后生成指标编码。",
    standards: [
      { id: "metric-attendance-discipline-100", description: "按时出勤，无违规记录", score: 10 },
      { id: "metric-attendance-discipline-80", description: "存在轻微提醒，未形成违规", score: 8 },
      { id: "metric-attendance-discipline-60", description: "存在明确违规或多次异常", score: 5 },
    ],
  },
];
