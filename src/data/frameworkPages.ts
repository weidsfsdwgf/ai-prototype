export type CustomerStage = "新增" | "跟进中" | "已签约" | "风险";

export type CustomerRecord = {
  id: string;
  name: string;
  industry: string;
  owner: string;
  stage: CustomerStage;
  contractValue: number;
  updatedAt: string;
};

export type RuleRecord = {
  id: string;
  name: string;
  scope: string;
  condition: string;
  owner: string;
  enabled: boolean;
};

export const customerRecords: CustomerRecord[] = [
  {
    id: "CUS-10081",
    name: "杭州启明供应链有限公司",
    industry: "供应链",
    owner: "陈嘉",
    stage: "跟进中",
    contractValue: 820000,
    updatedAt: "2026-04-29 10:18",
  },
  {
    id: "CUS-10063",
    name: "上海云岭智能科技",
    industry: "智能制造",
    owner: "林珊",
    stage: "已签约",
    contractValue: 1260000,
    updatedAt: "2026-04-28 17:22",
  },
  {
    id: "CUS-10042",
    name: "深圳微澜医疗",
    industry: "医疗服务",
    owner: "周霖",
    stage: "风险",
    contractValue: 480000,
    updatedAt: "2026-04-27 15:04",
  },
  {
    id: "CUS-10029",
    name: "成都森合零售",
    industry: "连锁零售",
    owner: "王越",
    stage: "新增",
    contractValue: 300000,
    updatedAt: "2026-04-26 09:40",
  },
];

export const customerFacts = [
  { label: "客户编号", value: "CUS-10081" },
  { label: "客户等级", value: "A 级" },
  { label: "所属行业", value: "供应链" },
  { label: "客户经理", value: "陈嘉" },
  { label: "创建时间", value: "2025-10-16" },
  { label: "最近跟进", value: "2026-04-29 10:18" },
];

export const contractRecords = [
  { id: "CT-202604-018", name: "年度系统服务合同", amount: 820000, status: "履行中" },
  { id: "CT-202601-011", name: "增值模块采购合同", amount: 180000, status: "已归档" },
  { id: "CT-202512-007", name: "数据接口服务合同", amount: 96000, status: "已归档" },
];

export const followActivities = [
  "完成年度采购预算确认",
  "补充安全合规资质材料",
  "安排项目经理进行技术澄清",
  "确认下一轮商务谈判时间",
];

export const approvalRules: RuleRecord[] = [
  {
    id: "RULE-001",
    name: "采购金额分级审批",
    scope: "采购申请",
    condition: "金额 >= 100,000",
    owner: "采购中心",
    enabled: true,
  },
  {
    id: "RULE-002",
    name: "费用超标复核",
    scope: "费用报销",
    condition: "超预算比例 > 10%",
    owner: "财务部",
    enabled: true,
  },
  {
    id: "RULE-003",
    name: "客户信用额度调整",
    scope: "客户信用",
    condition: "额度变更 >= 300,000",
    owner: "风控部",
    enabled: false,
  },
];

export const standardPages = [
  { type: "总览页", route: "/standards", owner: "全局", status: "已建立" },
  { type: "列表页", route: "/standards/list", owner: "数据管理", status: "已建立" },
  { type: "左树右表页", route: "/standards/tree-list", owner: "分层对象", status: "已建立" },
  { type: "详情页", route: "/standards/detail", owner: "业务对象", status: "已建立" },
  { type: "表单页", route: "/standards/form", owner: "录入编辑", status: "已建立" },
  { type: "配置页", route: "/standards/config", owner: "系统配置", status: "已建立" },
  { type: "状态页", route: "/standards/states", owner: "异常反馈", status: "已建立" },
];
