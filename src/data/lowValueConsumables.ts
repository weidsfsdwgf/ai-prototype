export type StockStatus = "正常" | "低于下限" | "高于上限";
export type RequestType = "领用" | "借用";
export type LossType = "自然损耗" | "归还损耗";

export type ConsumableCategory = {
  id: string;
  name: string;
  children?: ConsumableCategory[];
};

export type InboundRecord = {
  id: string;
  orderNo: string;
  qty: number;
  description: string;
  operator: string;
  operatedAt: string;
};

export type IssueRecord = {
  id: string;
  requestNo: string;
  requestType: "领用";
  applicant: string;
  quantity: number;
  area: string;
  department: string;
  dispatchQty: number;
  operator: string;
  operatedAt: string;
};

export type PendingRequest = {
  id: string;
  requestNo: string;
  requestType: RequestType;
  applicant: string;
  department: string;
  quantity: number;
  description: string;
  createdAt: string;
};

export type ReturnRecord = {
  id: string;
  requestNo: string;
  requestType: "借用";
  applicant: string;
  quantity: number;
  area: string;
  department: string;
  dispatchQty: number;
  returnedQty: number;
  lossQty: number;
  operator: string;
  operatedAt: string;
};

export type LossRecord = {
  id: string;
  recordNo: string;
  type: LossType;
  qty: number;
  description: string;
  operator: string;
  operatedAt: string;
};

export type LowValueConsumable = {
  id: string;
  area: string;
  code: string;
  name: string;
  category: string;
  spec: string;
  unit: string;
  stock: number;
  safetyMin: number;
  safetyMax: number;
  inboundQty: number;
  issuedQty: number;
  lossQty: number;
  pendingDispatch: number;
  pendingReturn: number;
  admin: string;
  inboundRecords: InboundRecord[];
  issueRecords: IssueRecord[];
  pendingRequests: PendingRequest[];
  returnRecords: ReturnRecord[];
  lossRecords: LossRecord[];
};

export const consumableAreas = ["成都拉森", "广州拉森", "厦门岛内"];
export const consumableDepartments = ["行政部", "运营中心", "研发中心", "市场部", "财务部"];
export const consumableAdmins = ["陈嘉", "林珊", "周霖", "赵宁", "王越"];
export const consumableUnits = ["个", "盒", "包", "瓶", "粒", "套", "卷"];

export const initialConsumableCategories: ConsumableCategory[] = [
  {
    id: "cat-office",
    name: "办公用品",
    children: [
      { id: "cat-office-paper", name: "办公文具" },
      { id: "cat-office-write", name: "书写工具" },
      { id: "cat-office-file", name: "文件收纳" },
    ],
  },
  {
    id: "cat-meeting",
    name: "会议物资",
    children: [
      { id: "cat-meeting-device", name: "会议耗材" },
      { id: "cat-meeting-display", name: "展示用品" },
    ],
  },
  {
    id: "cat-logistics",
    name: "后勤物资",
    children: [
      { id: "cat-logistics-daily", name: "日常耗材" },
      { id: "cat-logistics-clean", name: "清洁耗材" },
    ],
  },
];

export const initialLowValueConsumables: LowValueConsumable[] = [
  {
    id: "lvc-001",
    area: "成都拉森",
    code: "XE-001",
    name: "复印纸",
    category: "办公文具",
    spec: "A4 80g",
    unit: "包",
    stock: 62,
    safetyMin: 20,
    safetyMax: 80,
    inboundQty: 160,
    issuedQty: 84,
    lossQty: 4,
    pendingDispatch: 6,
    pendingReturn: 0,
    admin: "陈嘉",
    inboundRecords: [
      { id: "in-001-1", orderNo: "RK-20260412-001", qty: 100, description: "月度办公补库", operator: "陈嘉", operatedAt: "2026-04-12 10:20" },
      { id: "in-001-2", orderNo: "RK-20260422-002", qty: 60, description: "会议资料打印备货", operator: "陈嘉", operatedAt: "2026-04-22 15:45" },
    ],
    issueRecords: [
      { id: "iss-001-1", requestNo: "SQ-20260418-001", requestType: "领用", applicant: "何敏", quantity: 24, area: "成都拉森", department: "运营中心", dispatchQty: 24, operator: "陈嘉", operatedAt: "2026-04-18 16:10" },
      { id: "iss-001-2", requestNo: "SQ-20260424-002", requestType: "领用", applicant: "唐沐", quantity: 60, area: "成都拉森", department: "研发中心", dispatchQty: 60, operator: "陈嘉", operatedAt: "2026-04-24 11:30" },
    ],
    pendingRequests: [
      { id: "req-001-1", requestNo: "SQ-20260429-001", requestType: "领用", applicant: "徐晴", department: "市场部", quantity: 6, description: "新项目资料打印", createdAt: "2026-04-29 09:15" },
    ],
    returnRecords: [],
    lossRecords: [
      { id: "loss-001-1", recordNo: "SH-20260425-001", type: "自然损耗", qty: 4, description: "外包装破损无法正常发放", operator: "陈嘉", operatedAt: "2026-04-25 17:20" },
    ],
  },
  {
    id: "lvc-002",
    area: "广州拉森",
    code: "XE-002",
    name: "中性笔",
    category: "书写工具",
    spec: "0.5mm 黑色",
    unit: "盒",
    stock: 8,
    safetyMin: 10,
    safetyMax: 60,
    inboundQty: 70,
    issuedQty: 50,
    lossQty: 2,
    pendingDispatch: 4,
    pendingReturn: 0,
    admin: "林珊",
    inboundRecords: [
      { id: "in-002-1", orderNo: "RK-20260405-003", qty: 70, description: "季度办公用品采购", operator: "林珊", operatedAt: "2026-04-05 13:05" },
    ],
    issueRecords: [
      { id: "iss-002-1", requestNo: "SQ-20260417-003", requestType: "领用", applicant: "梁乔", quantity: 50, area: "广州拉森", department: "财务部", dispatchQty: 50, operator: "林珊", operatedAt: "2026-04-17 14:22" },
    ],
    pendingRequests: [
      { id: "req-002-1", requestNo: "SQ-20260428-004", requestType: "领用", applicant: "黄悦", department: "行政部", quantity: 4, description: "前台接待台补充", createdAt: "2026-04-28 16:40" },
    ],
    returnRecords: [],
    lossRecords: [
      { id: "loss-002-1", recordNo: "SH-20260420-002", type: "自然损耗", qty: 2, description: "运输挤压漏墨", operator: "林珊", operatedAt: "2026-04-20 09:50" },
    ],
  },
  {
    id: "lvc-003",
    area: "厦门岛内",
    code: "XE-003",
    name: "文件夹",
    category: "文件收纳",
    spec: "A4 蓝色",
    unit: "个",
    stock: 36,
    safetyMin: 15,
    safetyMax: 90,
    inboundQty: 90,
    issuedQty: 49,
    lossQty: 0,
    pendingDispatch: 0,
    pendingReturn: 5,
    admin: "周霖",
    inboundRecords: [
      { id: "in-003-1", orderNo: "RK-20260409-004", qty: 90, description: "档案整理专项采购", operator: "周霖", operatedAt: "2026-04-09 11:35" },
    ],
    issueRecords: [
      { id: "iss-003-1", requestNo: "SQ-20260419-005", requestType: "领用", applicant: "孙然", quantity: 49, area: "厦门岛内", department: "运营中心", dispatchQty: 49, operator: "周霖", operatedAt: "2026-04-19 17:05" },
    ],
    pendingRequests: [],
    returnRecords: [
      { id: "ret-003-1", requestNo: "SQ-20260426-006", requestType: "借用", applicant: "叶宁", quantity: 5, area: "厦门岛内", department: "行政部", dispatchQty: 5, returnedQty: 0, lossQty: 0, operator: "周霖", operatedAt: "2026-04-26 10:18" },
    ],
    lossRecords: [],
  },
  {
    id: "lvc-004",
    area: "成都拉森",
    code: "XE-004",
    name: "投影转接头",
    category: "会议耗材",
    spec: "Type-C 转 HDMI",
    unit: "个",
    stock: 5,
    safetyMin: 4,
    safetyMax: 12,
    inboundQty: 12,
    issuedQty: 3,
    lossQty: 2,
    pendingDispatch: 0,
    pendingReturn: 2,
    admin: "赵宁",
    inboundRecords: [
      { id: "in-004-1", orderNo: "RK-20260403-005", qty: 12, description: "会议室基础配件补齐", operator: "赵宁", operatedAt: "2026-04-03 16:16" },
    ],
    issueRecords: [
      { id: "iss-004-1", requestNo: "SQ-20260410-007", requestType: "领用", applicant: "陆洋", quantity: 3, area: "成都拉森", department: "市场部", dispatchQty: 3, operator: "赵宁", operatedAt: "2026-04-10 15:08" },
    ],
    pendingRequests: [],
    returnRecords: [
      { id: "ret-004-1", requestNo: "SQ-20260423-008", requestType: "借用", applicant: "赵蕾", quantity: 2, area: "成都拉森", department: "研发中心", dispatchQty: 2, returnedQty: 0, lossQty: 0, operator: "赵宁", operatedAt: "2026-04-23 09:30" },
    ],
    lossRecords: [
      { id: "loss-004-1", recordNo: "SH-20260412-003", type: "归还损耗", qty: 2, description: "接口断裂，借用归还时登记损耗", operator: "赵宁", operatedAt: "2026-04-12 18:20" },
    ],
  },
  {
    id: "lvc-005",
    area: "广州拉森",
    code: "XE-005",
    name: "电池",
    category: "日常耗材",
    spec: "5号 碱性",
    unit: "粒",
    stock: 128,
    safetyMin: 30,
    safetyMax: 120,
    inboundQty: 180,
    issuedQty: 52,
    lossQty: 0,
    pendingDispatch: 0,
    pendingReturn: 0,
    admin: "王越",
    inboundRecords: [
      { id: "in-005-1", orderNo: "RK-20260411-006", qty: 180, description: "遥控器和门禁备用", operator: "王越", operatedAt: "2026-04-11 10:45" },
    ],
    issueRecords: [
      { id: "iss-005-1", requestNo: "SQ-20260421-009", requestType: "领用", applicant: "郑苒", quantity: 52, area: "广州拉森", department: "行政部", dispatchQty: 52, operator: "王越", operatedAt: "2026-04-21 13:30" },
    ],
    pendingRequests: [],
    returnRecords: [],
    lossRecords: [],
  },
  {
    id: "lvc-006",
    area: "成都拉森",
    code: "XE-006",
    name: "洗手液",
    category: "清洁耗材",
    spec: "500ml",
    unit: "瓶",
    stock: 18,
    safetyMin: 12,
    safetyMax: 50,
    inboundQty: 60,
    issuedQty: 38,
    lossQty: 4,
    pendingDispatch: 0,
    pendingReturn: 0,
    admin: "陈嘉",
    inboundRecords: [
      { id: "in-006-1", orderNo: "RK-20260407-007", qty: 60, description: "公共区域清洁补货", operator: "陈嘉", operatedAt: "2026-04-07 09:10" },
    ],
    issueRecords: [
      { id: "iss-006-1", requestNo: "SQ-20260413-010", requestType: "领用", applicant: "姜一", quantity: 38, area: "成都拉森", department: "行政部", dispatchQty: 38, operator: "陈嘉", operatedAt: "2026-04-13 11:55" },
    ],
    pendingRequests: [],
    returnRecords: [],
    lossRecords: [
      { id: "loss-006-1", recordNo: "SH-20260418-004", type: "自然损耗", qty: 4, description: "仓储瓶口渗漏", operator: "陈嘉", operatedAt: "2026-04-18 15:12" },
    ],
  },
];
