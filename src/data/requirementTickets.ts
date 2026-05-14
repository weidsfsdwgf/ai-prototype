export type RequirementTicketStatus =
  | "待提交"
  | "审批中"
  | "已撤回"
  | "已驳回"
  | "待确认"
  | "待排期"
  | "开发中"
  | "已完成";

export type RequirementTicketType = "普通需求" | "价值需求";

export type RequirementTicketPriority = "高" | "中" | "低";

export type RequirementTag = "效率提升" | "体验优化" | "风险控制" | "数据分析" | "流程规范";

export type CapabilityLeap =
  | "管理赋能"
  | "决策转型"
  | "能力复制";

export type ValueQuantification = {
  type: "营收增长" | "效率提升" | "成本降低";
  value: number;
};

export type RequirementCategory = {
  id: string;
  name: string;
  businessOwner: string;
  reviewer: string;
  itOwner: string;
  children?: RequirementCategory[];
};

export type LinkedItRequirement = {
  id: string;
  demandNo: string;
  title: string;
  status: "待开发" | "开发中" | "待测试" | "测试通过" | "待发布" | "待验收" | "已完成";
  owner: string;
  team?: string;
  category?: string;
  developers?: string[];
  plannedFinishDate?: string;
  acceptedAt?: string;
  iterationName?: string;
  iterationState?: "待确认" | "已确认" | "进行中";
  scheduleFlag?: "正常" | "插队" | "流转";
  priority?: RequirementTicketPriority;
  tags?: RequirementTag[];
  description?: string;
};

export type ApprovalNode = {
  nodeName: string;
  approver: string;
  result: "待处理" | "通过" | "驳回" | "撤回";
  operatedAt?: string;
  comment?: string;
};

export type RequirementTicket = {
  id: string;
  ticketNo: string;
  title: string;
  systemCategory: string;
  type: RequirementTicketType;
  priority: RequirementTicketPriority;
  tags: RequirementTag[];
  applicant: string;
  createdBy: string;
  businessOwner: string;
  reviewer: string;
  itOwner: string;
  status: RequirementTicketStatus;
  background: string;
  painPoint: string;
  description: string;
  expectedLaunchDate?: string;
  attachments: string[];
  acceptanceCriteria?: string;
  capabilityLeap?: CapabilityLeap[];
  valueQuantifications?: ValueQuantification[];
  comments: { id: string; author: string; content: string; createdAt: string }[];
  createdAt: string;
  updatedAt: string;
  linkedRequirements: LinkedItRequirement[];
  approvalNodes: ApprovalNode[];
};

export const requirementSystemCategories = [
  "OA-审批管理",
  "OA-人事管理",
  "OA-绩效管理",
  "中台-数据服务",
  "团队管理-需求",
];

export const requirementCategories: RequirementCategory[] = [
  {
    id: "cat-oa",
    name: "OA",
    businessOwner: "顾南",
    reviewer: "许嘉明",
    itOwner: "周予安",
    children: [
      {
        id: "cat-approval",
        name: "审批管理",
        businessOwner: "顾南",
        reviewer: "许嘉明",
        itOwner: "周予安",
      },
      {
        id: "cat-hr",
        name: "人事管理",
        businessOwner: "白予",
        reviewer: "沈时序",
        itOwner: "沈时序",
      },
      {
        id: "cat-performance",
        name: "绩效管理",
        businessOwner: "白予",
        reviewer: "许嘉明",
        itOwner: "许嘉明",
      },
    ],
  },
  {
    id: "cat-platform",
    name: "中台",
    businessOwner: "韩序",
    reviewer: "许嘉明",
    itOwner: "唐澈",
    children: [
      {
        id: "cat-data",
        name: "数据服务",
        businessOwner: "韩序",
        reviewer: "许嘉明",
        itOwner: "唐澈",
      },
    ],
  },
  {
    id: "cat-team",
    name: "团队管理",
    businessOwner: "顾南",
    reviewer: "沈时序",
    itOwner: "许嘉明",
    children: [
      {
        id: "cat-demand",
        name: "需求",
        businessOwner: "顾南",
        reviewer: "沈时序",
        itOwner: "许嘉明",
      },
    ],
  },
];

export const requirementTags: RequirementTag[] = ["效率提升", "体验优化", "风险控制", "数据分析", "流程规范"];

export const requirementItOwners = ["陈嘉", "许嘉明", "周予安", "沈时序", "唐澈"];

export const initialRequirementTickets: RequirementTicket[] = [
  {
    id: "rt-001",
    ticketNo: "REQT-20260513-001",
    title: "OA审批管理 增加批量撤回 提升异常处理效率",
    systemCategory: "OA-审批管理",
    type: "价值需求",
    priority: "高",
    tags: ["效率提升", "流程规范"],
    applicant: "林知夏",
    createdBy: "林知夏",
    businessOwner: "顾南",
    reviewer: "许嘉明",
    itOwner: "周予安",
    status: "开发中",
    background: "业务部门在活动期间会批量发起审批，发现模板配置错误后只能逐条撤回。",
    painPoint: "单据数量多时处理成本高，且错误单据停留时间过长会影响后续审批判断。",
    description: "<p>支持审批管理员按条件筛选后批量撤回进行中单据，并记录撤回原因。</p>",
    expectedLaunchDate: "2026-06-10",
    attachments: ["批量撤回场景.xlsx"],
    acceptanceCriteria: "支持按流程名称、创建时间筛选后批量撤回进行中单据，并记录撤回原因。",
    capabilityLeap: ["管理赋能", "能力复制"],
    valueQuantifications: [{ type: "效率提升", value: 12 }],
    comments: [
      { id: "c-001", author: "许嘉明", content: "建议关联审批中心批量处理能力一起评估。", createdAt: "2026-05-12 17:20" },
    ],
    createdAt: "2026-05-06 09:18",
    updatedAt: "2026-05-12 16:40",
    linkedRequirements: [
      {
        id: "it-101",
        demandNo: "ITD-20260508-018",
        title: "审批中心批量撤回能力",
        status: "已完成",
        owner: "周予安",
        team: "OA平台组",
        category: "审批中心",
        developers: ["唐澈", "沈时序"],
        plannedFinishDate: "2026-05-30",
        acceptedAt: "2026-05-30",
        iterationName: "2026.05 OA 稳定性迭代",
        iterationState: "进行中",
        scheduleFlag: "正常",
        priority: "高",
        tags: ["效率提升"],
      },
      {
        id: "it-103",
        demandNo: "ITD-20260509-021",
        title: "审批批量操作审计日志",
        status: "开发中",
        owner: "周予安",
        team: "OA平台组",
        category: "审批中心",
        developers: ["林知夏"],
        plannedFinishDate: "2026-06-08",
        iterationName: "2026.06 OA 审批迭代",
        iterationState: "已确认",
        scheduleFlag: "插队",
        priority: "中",
        tags: ["风险控制"],
      },
    ],
    approvalNodes: [
      { nodeName: "业务负责人审核", approver: "顾南", result: "通过", operatedAt: "2026-05-06 14:10" },
      { nodeName: "评审人评估审核", approver: "许嘉明", result: "通过", operatedAt: "2026-05-07 10:35" },
    ],
  },
  {
    id: "rt-002",
    ticketNo: "REQT-20260513-002",
    title: "OA人事管理 花名册导出字段支持按岗位模板配置",
    systemCategory: "OA-人事管理",
    type: "普通需求",
    priority: "中",
    tags: ["效率提升"],
    applicant: "陈嘉",
    createdBy: "陈嘉",
    businessOwner: "白予",
    reviewer: "沈时序",
    itOwner: "沈时序",
    status: "待确认",
    background: "不同岗位序列在外部报送时需要的花名册字段不同。",
    painPoint: "当前导出后需要人工删改列，容易出现字段遗漏或误删。",
    description: "<p>希望按岗位模板控制花名册导出字段。</p>",
    expectedLaunchDate: "2026-06-01",
    attachments: [],
    comments: [],
    createdAt: "2026-05-09 11:28",
    updatedAt: "2026-05-11 18:22",
    linkedRequirements: [
      {
        id: "it-102",
        demandNo: "ITD-20260511-026",
        title: "花名册导出模板配置",
        status: "待开发",
        owner: "沈时序",
        team: "人事系统组",
        category: "花名册",
        developers: ["梁悦"],
        plannedFinishDate: "2026-06-12",
        iterationName: "2026.06 人事效率迭代",
        iterationState: "已确认",
        scheduleFlag: "正常",
        priority: "中",
        tags: ["效率提升"],
      },
    ],
    approvalNodes: [
      { nodeName: "业务负责人审核", approver: "白予", result: "通过", operatedAt: "2026-05-09 15:00" },
      { nodeName: "评审人评估审核", approver: "沈时序", result: "通过", operatedAt: "2026-05-10 10:14" },
    ],
  },
  {
    id: "rt-003",
    ticketNo: "REQT-20260513-003",
    title: "中台数据服务 增加项目成本看板 追踪预算偏差",
    systemCategory: "中台-数据服务",
    type: "价值需求",
    priority: "高",
    tags: ["数据分析", "风险控制"],
    applicant: "宋言",
    createdBy: "宋言",
    businessOwner: "韩序",
    reviewer: "许嘉明",
    itOwner: "唐澈",
    status: "待确认",
    background: "项目成本按月汇总，管理层需要在月中提前识别预算偏差。",
    painPoint: "现有报表滞后，无法在项目执行中及时介入。",
    description: "<p>建设项目成本看板，展示预算、已发生、预测成本和偏差率。</p>",
    expectedLaunchDate: "2026-06-20",
    attachments: ["项目成本看板指标口径.docx"],
    acceptanceCriteria: "按项目展示预算、已发生、预测成本和偏差率，支持钻取到费用明细。",
    capabilityLeap: ["决策转型"],
    valueQuantifications: [{ type: "成本降低", value: 20 }],
    comments: [],
    createdAt: "2026-05-12 10:06",
    updatedAt: "2026-05-13 09:41",
    linkedRequirements: [],
    approvalNodes: [
      { nodeName: "业务负责人审核", approver: "韩序", result: "通过", operatedAt: "2026-05-12 13:30" },
      { nodeName: "评审人评估审核", approver: "许嘉明", result: "通过", operatedAt: "2026-05-13 09:41" },
    ],
  },
  {
    id: "rt-004",
    ticketNo: "REQT-20260513-004",
    title: "团队管理需求池 需求卡片增加来源工单字段",
    systemCategory: "团队管理-需求",
    type: "普通需求",
    priority: "低",
    tags: ["体验优化"],
    applicant: "赵澜",
    createdBy: "赵澜",
    businessOwner: "顾南",
    reviewer: "沈时序",
    itOwner: "许嘉明",
    status: "审批中",
    background: "IT 需求与业务工单关联后，需求池列表无法快速识别来源。",
    painPoint: "研发负责人需要进入详情才能判断业务上下文。",
    description: "<p>需求池列表增加来源工单字段和跳转入口。</p>",
    expectedLaunchDate: "2026-05-31",
    attachments: [],
    comments: [],
    createdAt: "2026-05-13 08:45",
    updatedAt: "2026-05-13 08:45",
    linkedRequirements: [],
    approvalNodes: [
      { nodeName: "业务负责人审核", approver: "顾南", result: "通过", operatedAt: "2026-05-13 09:20" },
      { nodeName: "评审人评估审核", approver: "沈时序", result: "待处理" },
    ],
  },
  {
    id: "rt-005",
    ticketNo: "REQT-20260510-005",
    title: "OA绩效管理 评分导入失败提示补充明细原因",
    systemCategory: "OA-绩效管理",
    type: "普通需求",
    priority: "中",
    tags: ["体验优化"],
    applicant: "梁悦",
    createdBy: "梁悦",
    businessOwner: "白予",
    reviewer: "许嘉明",
    itOwner: "许嘉明",
    status: "已驳回",
    background: "评分导入失败时仅提示失败，无法定位具体行列。",
    painPoint: "HR 需要多次试错才能修复模板数据。",
    description: "<p>导入失败后展示具体失败行、字段和失败原因。</p>",
    expectedLaunchDate: "2026-05-28",
    attachments: ["失败样例.xlsx"],
    comments: [],
    createdAt: "2026-05-10 14:12",
    updatedAt: "2026-05-10 17:36",
    linkedRequirements: [],
    approvalNodes: [
      { nodeName: "业务负责人审核", approver: "白予", result: "驳回", operatedAt: "2026-05-10 17:36", comment: "请补充影响范围和示例文件。" },
      { nodeName: "评审人评估审核", approver: "许嘉明", result: "待处理" },
    ],
  },
  {
    id: "rt-006",
    ticketNo: "REQT-20260513-006",
    title: "OA审批管理 审批意见模板支持常用语",
    systemCategory: "OA-审批管理",
    type: "普通需求",
    priority: "低",
    tags: ["体验优化"],
    applicant: "陈嘉",
    createdBy: "陈嘉",
    businessOwner: "顾南",
    reviewer: "许嘉明",
    itOwner: "周予安",
    status: "待提交",
    background: "审批人处理高频单据时，经常重复输入相似意见。",
    painPoint: "重复录入影响审批效率，也不利于意见表达规范化。",
    description: "<p>在审批意见输入框中支持选择个人常用语。</p>",
    expectedLaunchDate: "2026-06-05",
    attachments: [],
    comments: [],
    createdAt: "2026-05-13 10:30",
    updatedAt: "2026-05-13 10:30",
    linkedRequirements: [],
    approvalNodes: [
      { nodeName: "业务负责人审核", approver: "顾南", result: "待处理" },
      { nodeName: "评审人评估审核", approver: "许嘉明", result: "待处理" },
    ],
  },
  {
    id: "rt-011",
    ticketNo: "REQT-20260513-011",
    title: "OA审批管理 审批列表增加我的常用筛选",
    systemCategory: "OA-审批管理",
    type: "普通需求",
    priority: "中",
    tags: ["体验优化"],
    applicant: "陈嘉",
    createdBy: "陈嘉",
    businessOwner: "顾南",
    reviewer: "许嘉明",
    itOwner: "周予安",
    status: "已驳回",
    background: "审批列表每次都需要重复选择流程和状态筛选。",
    painPoint: "高频查询路径重复，影响审批跟进效率。",
    description: "<p>支持保存个人常用筛选并在列表快速切换。</p>",
    expectedLaunchDate: "2026-06-06",
    attachments: [],
    comments: [],
    createdAt: "2026-05-13 10:50",
    updatedAt: "2026-05-13 11:05",
    linkedRequirements: [],
    approvalNodes: [
      { nodeName: "业务负责人审核", approver: "顾南", result: "驳回", operatedAt: "2026-05-13 11:05", comment: "请补充高频筛选场景。" },
      { nodeName: "评审人评估审核", approver: "许嘉明", result: "待处理" },
    ],
  },
  {
    id: "rt-012",
    ticketNo: "REQT-20260513-012",
    title: "OA审批管理 移动端审批摘要字段调整",
    systemCategory: "OA-审批管理",
    type: "普通需求",
    priority: "低",
    tags: ["体验优化"],
    applicant: "陈嘉",
    createdBy: "陈嘉",
    businessOwner: "顾南",
    reviewer: "许嘉明",
    itOwner: "周予安",
    status: "已撤回",
    background: "移动端审批卡片摘要字段过长，关键信息不突出。",
    painPoint: "审批人需要点开详情才能判断是否紧急。",
    description: "<p>移动端摘要优先展示金额、申请人和审批事项。</p>",
    expectedLaunchDate: "2026-06-07",
    attachments: [],
    comments: [],
    createdAt: "2026-05-13 11:10",
    updatedAt: "2026-05-13 11:26",
    linkedRequirements: [],
    approvalNodes: [
      { nodeName: "业务负责人审核", approver: "顾南", result: "撤回", operatedAt: "2026-05-13 11:26" },
      { nodeName: "评审人评估审核", approver: "许嘉明", result: "待处理" },
    ],
  },
  {
    id: "rt-007",
    ticketNo: "REQT-20260513-007",
    title: "OA人事管理 转正提醒增加部门负责人抄送",
    systemCategory: "OA-人事管理",
    type: "普通需求",
    priority: "中",
    tags: ["流程规范"],
    applicant: "陈嘉",
    createdBy: "林知夏",
    businessOwner: "白予",
    reviewer: "沈时序",
    itOwner: "沈时序",
    status: "审批中",
    background: "试用期转正提醒只通知 HR，部门负责人容易漏看。",
    painPoint: "转正材料收集滞后，影响审批时效。",
    description: "<p>转正提醒发送时同步抄送员工所属部门负责人。</p>",
    expectedLaunchDate: "2026-06-08",
    attachments: [],
    comments: [],
    createdAt: "2026-05-13 11:18",
    updatedAt: "2026-05-13 11:30",
    linkedRequirements: [],
    approvalNodes: [
      { nodeName: "业务负责人审核", approver: "白予", result: "待处理" },
      { nodeName: "评审人评估审核", approver: "沈时序", result: "待处理" },
    ],
  },
  {
    id: "rt-008",
    ticketNo: "REQT-20260513-008",
    title: "中台数据服务 运营日报新增渠道转化指标",
    systemCategory: "中台-数据服务",
    type: "价值需求",
    priority: "高",
    tags: ["数据分析", "效率提升"],
    applicant: "宋言",
    createdBy: "宋言",
    businessOwner: "韩序",
    reviewer: "许嘉明",
    itOwner: "陈嘉",
    status: "待确认",
    background: "运营团队每日手工合并渠道转化数据。",
    painPoint: "指标口径不稳定，日报产出时间长。",
    description: "<p>在运营日报中新增渠道曝光、线索、转化率和有效线索成本。</p>",
    expectedLaunchDate: "2026-06-15",
    attachments: ["运营日报渠道指标.xlsx"],
    acceptanceCriteria: "日报中展示渠道转化漏斗，并支持按日期和渠道筛选。",
    capabilityLeap: ["决策转型", "能力复制"],
    valueQuantifications: [{ type: "效率提升", value: 8 }],
    comments: [],
    createdAt: "2026-05-13 13:12",
    updatedAt: "2026-05-13 14:06",
    linkedRequirements: [],
    approvalNodes: [
      { nodeName: "业务负责人审核", approver: "韩序", result: "通过", operatedAt: "2026-05-13 13:40" },
      { nodeName: "评审人评估审核", approver: "许嘉明", result: "通过", operatedAt: "2026-05-13 14:06" },
    ],
  },
  {
    id: "rt-009",
    ticketNo: "REQT-20260513-009",
    title: "团队管理需求池 迭代看板增加风险标记",
    systemCategory: "团队管理-需求",
    type: "普通需求",
    priority: "中",
    tags: ["风险控制"],
    applicant: "赵澜",
    createdBy: "赵澜",
    businessOwner: "顾南",
    reviewer: "沈时序",
    itOwner: "陈嘉",
    status: "开发中",
    background: "迭代中风险需求分散在会议纪要中，需求池无法直接识别。",
    painPoint: "项目负责人需要反复同步风险状态，跟进效率低。",
    description: "<p>需求卡片增加风险标记和风险说明字段。</p>",
    expectedLaunchDate: "2026-06-12",
    attachments: [],
    comments: [],
    createdAt: "2026-05-13 15:02",
    updatedAt: "2026-05-13 16:22",
    linkedRequirements: [
      {
        id: "it-109",
        demandNo: "ITD-20260513-109",
        title: "需求池风险标记",
        status: "已完成",
        owner: "陈嘉",
        team: "研发效能组",
        category: "需求池",
        developers: ["赵澜", "宋言"],
        plannedFinishDate: "2026-06-12",
        acceptedAt: "2026-06-12",
        iterationName: "2026.06 研发效能迭代",
        iterationState: "进行中",
        scheduleFlag: "正常",
        priority: "中",
        tags: ["风险控制"],
      },
    ],
    approvalNodes: [
      { nodeName: "业务负责人审核", approver: "顾南", result: "通过", operatedAt: "2026-05-13 15:30" },
      { nodeName: "评审人评估审核", approver: "沈时序", result: "通过", operatedAt: "2026-05-13 16:22" },
    ],
  },
  {
    id: "rt-010",
    ticketNo: "REQT-20260513-010",
    title: "OA绩效管理 指标权重修改增加审批",
    systemCategory: "OA-绩效管理",
    type: "普通需求",
    priority: "高",
    tags: ["流程规范", "风险控制"],
    applicant: "梁悦",
    createdBy: "梁悦",
    businessOwner: "白予",
    reviewer: "许嘉明",
    itOwner: "许嘉明",
    status: "审批中",
    background: "绩效周期中指标权重调整影响评分结果，需要流程留痕。",
    painPoint: "当前修改后只记录操作人，缺少业务审批确认。",
    description: "<p>指标权重修改提交审批，通过后生效。</p>",
    expectedLaunchDate: "2026-06-18",
    attachments: [],
    comments: [],
    createdAt: "2026-05-13 16:10",
    updatedAt: "2026-05-13 16:45",
    linkedRequirements: [],
    approvalNodes: [
      { nodeName: "业务负责人审核", approver: "白予", result: "待处理" },
      { nodeName: "评审人评估审核", approver: "许嘉明", result: "待处理" },
    ],
  },
];
