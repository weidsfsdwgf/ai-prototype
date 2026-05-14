export type FileTemplateBusinessId = "hr-contract" | "offer" | "resignation-certificate";

export type StandardCharacter = {
  id: string;
  name: string;
  token: string;
  source: string;
  description: string;
};

export type FileTemplate = {
  id: string;
  name: string;
  fileName: string;
  businessId: FileTemplateBusinessId;
  owner: string;
  version: string;
  updatedAt: string;
  placeholders: string[];
};

export type FileTemplateBusiness = {
  id: FileTemplateBusinessId;
  name: string;
  enabled: boolean;
  owner: string;
  description: string;
  templates: FileTemplate[];
  characters: StandardCharacter[];
};

const employeeCharacters: StandardCharacter[] = [
  { id: "employee_name", name: "员工姓名", token: "{{employee_name}}", source: "员工基础信息", description: "员工真实姓名。" },
  { id: "employee_no", name: "员工编号", token: "{{employee_no}}", source: "员工基础信息", description: "系统生成的员工编号。" },
  { id: "id_card_no", name: "身份证号码", token: "{{id_card_no}}", source: "身份信息", description: "员工身份证号码。" },
  { id: "phone", name: "手机号码", token: "{{phone}}", source: "联系方式", description: "员工手机号。" },
  { id: "department", name: "部门", token: "{{department}}", source: "任职信息", description: "员工所在部门。" },
  { id: "position", name: "岗位", token: "{{position}}", source: "任职信息", description: "员工岗位。" },
  { id: "rank", name: "职级", token: "{{rank}}", source: "任职信息", description: "员工职级。" },
  { id: "hire_date", name: "入职日期", token: "{{hire_date}}", source: "任职信息", description: "员工入职日期。" },
  { id: "company_name", name: "公司名称", token: "{{company_name}}", source: "组织信息", description: "签发文件的公司主体。" },
  { id: "hr_owner", name: "负责 HR", token: "{{hr_owner}}", source: "人事办理", description: "负责当前业务的 HR。" },
];

const fileCharacters: StandardCharacter[] = [
  { id: "file_no", name: "文件编号", token: "{{file_no}}", source: "文件信息", description: "系统生成的文件编号。" },
  { id: "file_date", name: "文件日期", token: "{{file_date}}", source: "文件信息", description: "文件生成或签发日期。" },
  { id: "file_title", name: "文件标题", token: "{{file_title}}", source: "文件信息", description: "文件显示标题。" },
  { id: "seal_name", name: "用印主体", token: "{{seal_name}}", source: "用印信息", description: "文件用印主体。" },
];

const offerCharacters: StandardCharacter[] = [
  { id: "candidate_name", name: "候选人姓名", token: "{{candidate_name}}", source: "候选人信息", description: "候选人姓名。" },
  { id: "offer_position", name: "拟聘岗位", token: "{{offer_position}}", source: "录用信息", description: "拟录用岗位。" },
  { id: "offer_department", name: "拟入部门", token: "{{offer_department}}", source: "录用信息", description: "拟入职部门。" },
  { id: "probation_salary", name: "试用期薪资", token: "{{probation_salary}}", source: "薪酬信息", description: "试用期薪资。" },
  { id: "regular_salary", name: "转正薪资", token: "{{regular_salary}}", source: "薪酬信息", description: "转正后薪资。" },
  { id: "report_date", name: "报到日期", token: "{{report_date}}", source: "入职安排", description: "候选人报到日期。" },
  { id: "report_location", name: "报到地点", token: "{{report_location}}", source: "入职安排", description: "候选人报到地点。" },
];

const resignationCharacters: StandardCharacter[] = [
  { id: "resignation_date", name: "离职日期", token: "{{resignation_date}}", source: "离职信息", description: "员工最后工作日期。" },
  { id: "resignation_type", name: "离职类型", token: "{{resignation_type}}", source: "离职信息", description: "主动离职、协商解除等类型。" },
  { id: "working_period", name: "工作期间", token: "{{working_period}}", source: "离职信息", description: "员工在职起止时间。" },
  { id: "certificate_reason", name: "证明用途", token: "{{certificate_reason}}", source: "证明信息", description: "离职证明用途。" },
];

export const fileTemplateBusinesses: FileTemplateBusiness[] = [
  {
    id: "hr-contract",
    name: "人事合同",
    enabled: true,
    owner: "林珊",
    description: "劳动用工相关文件配置。",
    characters: [...fileCharacters, ...employeeCharacters],
    templates: [
      {
        id: "FT-HC-1",
        name: "固定期限劳动文件",
        fileName: "固定期限劳动文件标准版.docx",
        businessId: "hr-contract",
        owner: "林珊",
        version: "V1.2",
        updatedAt: "2026-05-06 14:20",
        placeholders: ["file_no", "company_name", "employee_name", "id_card_no", "department", "position", "hire_date"],
      },
      {
        id: "FT-HC-2",
        name: "保密协议文件",
        fileName: "员工保密协议标准版.docx",
        businessId: "hr-contract",
        owner: "何敏",
        version: "V1.0",
        updatedAt: "2026-05-02 11:30",
        placeholders: ["company_name", "employee_name", "employee_no"],
      },
    ],
  },
  {
    id: "offer",
    name: "Offer",
    enabled: true,
    owner: "周然",
    description: "候选人录用通知文件配置。",
    characters: [...fileCharacters, ...offerCharacters, employeeCharacters[8], employeeCharacters[9]],
    templates: [
      {
        id: "FT-OF-1",
        name: "校招 Offer 文件",
        fileName: "校招Offer标准文件.pdf",
        businessId: "offer",
        owner: "周然",
        version: "V1.0",
        updatedAt: "2026-05-03 09:45",
        placeholders: ["candidate_name", "offer_department", "offer_position", "probation_salary", "report_date", "report_location"],
      },
      {
        id: "FT-OF-2",
        name: "社招 Offer 文件",
        fileName: "社招Offer标准文件.docx",
        businessId: "offer",
        owner: "周然",
        version: "V1.1",
        updatedAt: "2026-05-05 16:10",
        placeholders: ["candidate_name", "offer_position", "regular_salary", "report_date", "company_name"],
      },
    ],
  },
  {
    id: "resignation-certificate",
    name: "离职证明",
    enabled: true,
    owner: "何敏",
    description: "离职证明文件配置。",
    characters: [...fileCharacters, ...employeeCharacters, ...resignationCharacters],
    templates: [
      {
        id: "FT-RC-1",
        name: "标准离职证明文件",
        fileName: "标准离职证明文件.docx",
        businessId: "resignation-certificate",
        owner: "何敏",
        version: "V1.3",
        updatedAt: "2026-05-04 10:00",
        placeholders: ["employee_name", "employee_no", "department", "position", "hire_date", "resignation_date", "company_name"],
      },
      {
        id: "FT-RC-2",
        name: "英文离职证明文件",
        fileName: "英文离职证明文件.docx",
        businessId: "resignation-certificate",
        owner: "何敏",
        version: "V1.0",
        updatedAt: "2026-05-01 15:35",
        placeholders: ["employee_name", "working_period", "resignation_date", "seal_name"],
      },
    ],
  },
];
