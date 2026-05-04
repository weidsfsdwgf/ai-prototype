export type DepartmentStatus = "启用" | "停用";
export type OrgMemberStatus = "在职" | "试用期" | "待离职";

export type DepartmentNode = {
  title: string;
  key: string;
  area: string;
  code: string;
  leader: string;
  parentName: string;
  memberCount: number;
  status: DepartmentStatus;
  children?: DepartmentNode[];
};

export type OrgMemberRecord = {
  id: string;
  employeeNo: string;
  name: string;
  area: string;
  department: string;
  primaryDepartment: string;
  position: string;
  leader: string;
  status: OrgMemberStatus;
  updatedAt: string;
};

export const departmentNodes: DepartmentNode[] = [
  {
    title: "LAS 集团",
    key: "las",
    area: "全国",
    code: "ORG-000",
    leader: "陈嘉",
    parentName: "-",
    memberCount: 128,
    status: "启用",
    children: [
      {
        title: "成都",
        key: "chengdu",
        area: "成都",
        code: "ORG-100",
        leader: "陈嘉",
        parentName: "LAS 集团",
        memberCount: 48,
        status: "启用",
        children: [
          {
            title: "运营中心",
            key: "chengdu-operations",
            area: "成都",
            code: "ORG-101",
            leader: "许佳",
            parentName: "成都",
            memberCount: 18,
            status: "启用",
          },
          {
            title: "仓储中心",
            key: "chengdu-warehouse",
            area: "成都",
            code: "ORG-102",
            leader: "赵宁",
            parentName: "成都",
            memberCount: 16,
            status: "启用",
          },
        ],
      },
      {
        title: "深圳",
        key: "shenzhen",
        area: "深圳",
        code: "ORG-200",
        leader: "林珊",
        parentName: "LAS 集团",
        memberCount: 36,
        status: "启用",
        children: [
          {
            title: "人事部",
            key: "shenzhen-hr",
            area: "深圳",
            code: "ORG-201",
            leader: "林珊",
            parentName: "深圳",
            memberCount: 8,
            status: "启用",
          },
          {
            title: "供应链中心",
            key: "shenzhen-supply-chain",
            area: "深圳",
            code: "ORG-202",
            leader: "王越",
            parentName: "深圳",
            memberCount: 14,
            status: "启用",
          },
        ],
      },
      {
        title: "厦门",
        key: "xiamen",
        area: "厦门",
        code: "ORG-300",
        leader: "周霖",
        parentName: "LAS 集团",
        memberCount: 24,
        status: "启用",
        children: [
          {
            title: "财务部",
            key: "xiamen-finance",
            area: "厦门",
            code: "ORG-301",
            leader: "周霖",
            parentName: "厦门",
            memberCount: 10,
            status: "启用",
          },
          {
            title: "信息中心",
            key: "xiamen-it",
            area: "厦门",
            code: "ORG-302",
            leader: "陈嘉",
            parentName: "厦门",
            memberCount: 9,
            status: "启用",
          },
        ],
      },
    ],
  },
];

export const orgMembers: OrgMemberRecord[] = [
  {
    id: "M-1001",
    employeeNo: "LS0001",
    name: "陈嘉",
    area: "成都",
    department: "运营中心",
    primaryDepartment: "运营中心",
    position: "运营主管",
    leader: "许佳",
    status: "在职",
    updatedAt: "2026-04-29 16:20",
  },
  {
    id: "M-1002",
    employeeNo: "LS0002",
    name: "林珊",
    area: "深圳",
    department: "人事部",
    primaryDepartment: "人事部",
    position: "人事专员",
    leader: "陈嘉",
    status: "在职",
    updatedAt: "2026-04-28 11:08",
  },
  {
    id: "M-1003",
    employeeNo: "LS0003",
    name: "周霖",
    area: "厦门",
    department: "财务部",
    primaryDepartment: "财务部",
    position: "财务专员",
    leader: "赵宁",
    status: "试用期",
    updatedAt: "2026-04-27 17:40",
  },
  {
    id: "M-1004",
    employeeNo: "LS0004",
    name: "赵宁",
    area: "成都",
    department: "仓储中心",
    primaryDepartment: "仓储中心",
    position: "仓储专员",
    leader: "陈嘉",
    status: "待离职",
    updatedAt: "2026-04-25 15:16",
  },
];

export const departmentOptions = [
  "运营中心",
  "仓储中心",
  "人事部",
  "供应链中心",
  "财务部",
  "信息中心",
];
