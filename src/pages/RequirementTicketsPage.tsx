import {
  Button,
  Checkbox,
  DatePicker,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Popover,
  Select,
  Space,
  Steps,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Tree,
  Upload,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { UploadFile } from "antd/es/upload/interface";
import dayjs from "dayjs";
import { Edit3, FileUp, Filter, GitBranchPlus, MoreHorizontal, Plus, RotateCcw, Search, Send, Trash2, UploadCloud } from "lucide-react";
import { useMemo, useState, type Key, type ReactNode } from "react";
import { SectionPanel } from "../components/SectionPanel";
import { TableActions, type TableActionItem } from "../components/TableActions";
import { TreeListLayout } from "../components/TreeListLayout";
import {
  initialRequirementTickets,
  requirementCategories,
  requirementItOwners,
  requirementTags,
  type CapabilityLeap,
  type LinkedItRequirement,
  type RequirementCategory,
  type RequirementTag,
  type RequirementTicket,
  type RequirementTicketPriority,
  type RequirementTicketStatus,
  type RequirementTicketType,
  type ValueQuantification,
} from "../data/requirementTickets";
import "./Page.css";
import "./RequirementTicketsPage.css";
import "./standards/Standards.css";

type FilterValues = {
  keyword?: string;
  ticketNo?: string;
  applicant?: string;
  status?: RequirementTicketStatus;
};

type TicketFormValues = {
  title: string;
  type: RequirementTicketType;
  priority: RequirementTicketPriority;
  tags?: RequirementTag[];
  applicant: string;
  expectedLaunchDate?: dayjs.Dayjs;
  background: string;
  painPoint: string;
  description: string;
  acceptanceCriteria?: string;
  capabilityLeap?: CapabilityLeap[];
  valueTypes?: Array<ValueQuantification["type"]>;
  revenueGrowth?: number;
  efficiencyGain?: number;
  costReduction?: number;
};

type ItDemandFormValues = {
  title: string;
  team: string;
  category: string;
  applicant: string;
  owner: string;
  plannedFinishDate?: dayjs.Dayjs;
  priority: RequirementTicketPriority;
  tags?: RequirementTag[];
  description: string;
};

type CategoryTreeNode = {
  key: string;
  title: ReactNode;
  children?: CategoryTreeNode[];
};

type FlowStep = {
  title: string;
};

const currentUser = "陈嘉";
const applicantOptions = ["陈嘉", "许嘉明", "林知夏", "宋言", "梁悦", "赵澜"];
const allCategoryKey = "all";
const pageSize = 10;
const actionDemoOrder = ["rt-006", "rt-011", "rt-012", "rt-007", "rt-008", "rt-009", "rt-010"];
const itTeams = ["OA平台组", "人事系统组", "研发效能组", "数据应用组"];
const itCategoriesByTeam: Record<string, string[]> = {
  OA平台组: ["审批中心", "消息通知", "移动端"],
  人事系统组: ["花名册", "转正管理", "绩效管理"],
  研发效能组: ["需求池", "迭代看板", "任务管理"],
  数据应用组: ["运营日报", "成本看板", "指标平台"],
};
const existingItDemands: LinkedItRequirement[] = [
  {
    id: "it-existing-001",
    demandNo: "ITD-20260512-041",
    title: "审批常用语配置",
    status: "待开发",
    owner: "陈嘉",
    team: "OA平台组",
    category: "审批中心",
    developers: ["林知夏"],
    iterationName: "2026.06 OA 审批迭代",
    iterationState: "已确认",
    scheduleFlag: "正常",
    priority: "中",
    tags: ["体验优化"],
  },
  {
    id: "it-existing-002",
    demandNo: "ITD-20260512-052",
    title: "需求池风险字段配置",
    status: "开发中",
    owner: "陈嘉",
    team: "研发效能组",
    category: "需求池",
    developers: ["赵澜", "宋言"],
    iterationName: "2026.06 研发效能迭代",
    iterationState: "进行中",
    scheduleFlag: "插队",
    priority: "高",
    tags: ["风险控制"],
  },
  {
    id: "it-existing-003",
    demandNo: "ITD-20260513-060",
    title: "运营日报渠道转化指标",
    status: "已完成",
    owner: "陈嘉",
    team: "数据应用组",
    category: "运营日报",
    developers: ["唐澈"],
    acceptedAt: "2026-06-10",
    iterationName: "2026.06 数据应用迭代",
    iterationState: "进行中",
    scheduleFlag: "流转",
    priority: "高",
    tags: ["数据分析"],
  },
];

const workOrderSteps: FlowStep[] = [
  { title: "工单审批" },
  { title: "待确认" },
  { title: "待排期" },
  { title: "开发中" },
  { title: "已完成" },
];

const statusColor: Record<RequirementTicketStatus, string> = {
  待提交: "default",
  审批中: "processing",
  已撤回: "warning",
  已驳回: "error",
  待确认: "gold",
  待排期: "cyan",
  开发中: "blue",
  已完成: "success",
};

const priorityColor: Record<RequirementTicketPriority, string> = {
  高: "red",
  中: "gold",
  低: "default",
};

const tagColor: Record<RequirementTag, string> = {
  效率提升: "blue",
  体验优化: "purple",
  风险控制: "red",
  数据分析: "cyan",
  流程规范: "green",
};

const capabilityOptions = [
  { label: "管理赋能：固化业务流程，降低人员流动带来的业务波动风险，提升组织稳定性", value: "管理赋能" },
  { label: "决策转型：提供了决策依据和提升了决策能力", value: "决策转型" },
  { label: "能力复制：将个人能力沉淀为公司能力，构建可复用、可持续迭代的数智能力", value: "能力复制" },
];

function makeNow() {
  return "2026-05-13 22:48";
}

function makeTicketNo(count: number) {
  return `REQT-20260513-${String(count + 1).padStart(3, "0")}`;
}

function flattenCategories(categories: RequirementCategory[]): RequirementCategory[] {
  return categories.flatMap((category) => [category, ...flattenCategories(category.children ?? [])]);
}

function findCategory(categories: RequirementCategory[], id: string): RequirementCategory | undefined {
  for (const category of categories) {
    if (category.id === id) {
      return category;
    }

    const found = findCategory(category.children ?? [], id);

    if (found) {
      return found;
    }
  }

  return undefined;
}

function updateCategory(categories: RequirementCategory[], id: string, values: Partial<RequirementCategory>): RequirementCategory[] {
  return categories.map((category) => ({
    ...category,
    ...(category.id === id ? values : {}),
    children: category.children ? updateCategory(category.children, id, values) : undefined,
  }));
}

function addCategory(categories: RequirementCategory[], parentId: string | undefined, newCategory: RequirementCategory): RequirementCategory[] {
  if (!parentId) {
    return [...categories, newCategory];
  }

  return categories.map((category) => ({
    ...category,
    children:
      category.id === parentId
        ? [...(category.children ?? []), newCategory]
        : category.children
          ? addCategory(category.children, parentId, newCategory)
          : undefined,
  }));
}

function deleteCategory(categories: RequirementCategory[], id: string): RequirementCategory[] {
  return categories
    .filter((category) => category.id !== id)
    .map((category) => ({
      ...category,
      children: category.children ? deleteCategory(category.children, id) : undefined,
    }));
}

function collectCategoryNames(category: RequirementCategory): string[] {
  return [category.name, ...(category.children ?? []).flatMap(collectCategoryNames)];
}

function getCategoryDisplayName(category: RequirementCategory) {
  if (category.name === "审批管理" || category.name === "人事管理" || category.name === "绩效管理") {
    return `OA-${category.name}`;
  }

  if (category.name === "数据服务") {
    return `中台-${category.name}`;
  }

  if (category.name === "需求") {
    return `团队管理-${category.name}`;
  }

  return category.name;
}

function getLinkedStatus(ticket: RequirementTicket): RequirementTicketStatus {
  if (ticket.linkedRequirements.length === 0) {
    return "待确认";
  }

  if (ticket.linkedRequirements.every((item) => item.status === "已完成")) {
    return "已完成";
  }

  if (ticket.linkedRequirements.some((item) => ["开发中", "待测试", "测试通过", "待发布", "待验收"].includes(item.status))) {
    return "开发中";
  }

  return "待确认";
}

function getStepIndex(status: RequirementTicketStatus) {
  if (["待提交", "审批中", "已撤回", "已驳回"].includes(status)) {
    return 0;
  }

  if (status === "待确认") {
    return 1;
  }

  if (status === "待排期") {
    return 2;
  }

  if (status === "开发中") {
    return 3;
  }

  return 4;
}

function getLatestDate(values: Array<string | undefined>) {
  return values.filter(Boolean).sort().at(-1) ?? "-";
}

function getApprovedAt(ticket: RequirementTicket) {
  return getLatestDate(ticket.approvalNodes.filter((node) => node.result === "通过").map((node) => node.operatedAt));
}

function getDevelopers(ticket: RequirementTicket) {
  const developers = Array.from(new Set(ticket.linkedRequirements.flatMap((item) => item.developers ?? [])));

  return developers.length > 0 ? developers.join("、") : "-";
}

function renderValueDemandPopover(ticket: RequirementTicket) {
  return (
    <Descriptions
      className="requirement-value-popover"
      column={1}
      size="small"
      items={[
        { key: "acceptance", label: "验收标准", children: ticket.acceptanceCriteria ?? "-" },
        { key: "capability", label: "核心能力跃升", children: ticket.capabilityLeap?.join("、") || "-" },
        {
          key: "value",
          label: "预计价值量化",
          children: ticket.valueQuantifications?.map((item) => `${item.type}：${item.value}`).join("；") || "-",
        },
      ]}
    />
  );
}

function buildValueQuantifications(values: TicketFormValues): ValueQuantification[] {
  const selectedTypes = values.valueTypes ?? [];

  return [
    selectedTypes.includes("营收增长") ? { type: "营收增长" as const, value: Number(values.revenueGrowth) } : undefined,
    selectedTypes.includes("效率提升") ? { type: "效率提升" as const, value: Number(values.efficiencyGain) } : undefined,
    selectedTypes.includes("成本降低") ? { type: "成本降低" as const, value: Number(values.costReduction) } : undefined,
  ].filter(Boolean) as ValueQuantification[];
}

export function RequirementTicketsPage() {
  const [tickets, setTickets] = useState<RequirementTicket[]>(initialRequirementTickets);
  const [categories, setCategories] = useState<RequirementCategory[]>(requirementCategories);
  const [filters, setFilters] = useState<FilterValues>({});
  const [categoryKeyword, setCategoryKeyword] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(allCategoryKey);
  const [expandedCategoryKeys, setExpandedCategoryKeys] = useState<Key[]>([allCategoryKey, ...flattenCategories(requirementCategories).map((item) => item.id)]);
  const [detailTicketId, setDetailTicketId] = useState<string>();
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [editingTicketId, setEditingTicketId] = useState<string>();
  const [linkedListTicketId, setLinkedListTicketId] = useState<string>();
  const [createDemandTicketId, setCreateDemandTicketId] = useState<string>();
  const [existingDemandTicketId, setExistingDemandTicketId] = useState<string>();
  const [selectedExistingDemandIds, setSelectedExistingDemandIds] = useState<string[]>([]);
  const [existingDemandFilters, setExistingDemandFilters] = useState<{ keyword?: string; team?: string }>({});
  const [assignTicketId, setAssignTicketId] = useState<string>();
  const [categoryModal, setCategoryModal] = useState<{ mode: "create"; parentId?: string } | { mode: "edit"; categoryId: string }>();
  const [descriptionHtml, setDescriptionHtml] = useState("");
  const [attachments, setAttachments] = useState<UploadFile[]>([]);
  const [commentText, setCommentText] = useState("");
  const [filterForm] = Form.useForm<FilterValues>();
  const [ticketForm] = Form.useForm<TicketFormValues>();
  const [itDemandForm] = Form.useForm<ItDemandFormValues>();
  const [existingDemandFilterForm] = Form.useForm<{ keyword?: string; team?: string }>();
  const [assignForm] = Form.useForm();
  const [categoryForm] = Form.useForm();

  const selectedCategory = selectedCategoryId === allCategoryKey ? undefined : findCategory(categories, selectedCategoryId);
  const activeCategory = selectedCategory ?? flattenCategories(categories).find((category) => !category.children?.length) ?? categories[0];
  const detailTicket = tickets.find((ticket) => ticket.id === detailTicketId);
  const editingTicket = tickets.find((ticket) => ticket.id === editingTicketId);
  const linkedListTicket = tickets.find((ticket) => ticket.id === linkedListTicketId);
  const createDemandTicket = tickets.find((ticket) => ticket.id === createDemandTicketId);
  const existingDemandTicket = tickets.find((ticket) => ticket.id === existingDemandTicketId);
  const assignTicket = tickets.find((ticket) => ticket.id === assignTicketId);
  const requirementType = Form.useWatch("type", ticketForm);
  const selectedValueTypes = Form.useWatch("valueTypes", ticketForm) ?? [];
  const selectedItTeam = Form.useWatch("team", itDemandForm);
  const modalModuleName = editingTicket?.systemCategory ?? (activeCategory ? getCategoryDisplayName(activeCategory) : "-");
  const filteredExistingDemands = useMemo(
    () =>
      existingItDemands.filter((demand) => {
        const keyword = existingDemandFilters.keyword?.trim();

        return (
          (!keyword || demand.demandNo.includes(keyword) || demand.title.includes(keyword)) &&
          (!existingDemandFilters.team || demand.team === existingDemandFilters.team)
        );
      }),
    [existingDemandFilters],
  );

  const categoryNames = useMemo(
    () => (selectedCategory ? collectCategoryNames(selectedCategory).map((name) => getCategoryDisplayName({ ...selectedCategory, name })) : []),
    [selectedCategory],
  );

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const keyword = filters.keyword?.trim();
      const ticketNo = filters.ticketNo?.trim();
      const applicant = filters.applicant?.trim();
      const categoryMatched = !selectedCategory || categoryNames.includes(ticket.systemCategory);

      return (
        categoryMatched &&
        (!keyword || ticket.title.includes(keyword) || ticket.background.includes(keyword)) &&
        (!ticketNo || ticket.ticketNo.includes(ticketNo)) &&
        (!applicant || ticket.applicant.includes(applicant)) &&
        (!filters.status || ticket.status === filters.status)
      );
    }).sort((a, b) => {
      const aIndex = actionDemoOrder.indexOf(a.id);
      const bIndex = actionDemoOrder.indexOf(b.id);

      if (aIndex !== -1 || bIndex !== -1) {
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
      }

      return b.updatedAt.localeCompare(a.updatedAt);
    });
  }, [categoryNames, filters, selectedCategory, tickets]);

  const visibleCategories = useMemo(() => {
    const keyword = categoryKeyword.trim();

    if (!keyword) {
      return categories;
    }

    const filterTree = (items: RequirementCategory[]): RequirementCategory[] =>
      items
        .map((category) => {
          const children = filterTree(category.children ?? []);

          if (category.name.includes(keyword) || children.length > 0) {
            return { ...category, children };
          }

          return undefined;
        })
        .filter(Boolean) as RequirementCategory[];

    return filterTree(categories);
  }, [categories, categoryKeyword]);

  const categoryTreeData: CategoryTreeNode[] = [
    {
      key: allCategoryKey,
      title: (
        <span className="requirement-category-node">
          <span>所有</span>
          <Tooltip title="新增一级模块">
            <Button
              className="requirement-category-node__more"
              icon={<Plus size={14} />}
              size="small"
              type="text"
              onClick={(event) => {
                event.stopPropagation();
                categoryForm.resetFields();
                setCategoryModal({ mode: "create" });
              }}
            />
          </Tooltip>
        </span>
      ),
      children: visibleCategories.map((category) => buildCategoryNode(category)),
    },
  ];

  function buildCategoryNode(category: RequirementCategory): CategoryTreeNode {
    return {
      key: category.id,
      title: (
        <span className="requirement-category-node">
          <span>{category.name}</span>
          <Popover
            content={
              <div className="requirement-category-menu">
                <Button
                  icon={<Edit3 size={14} />}
                  type="text"
                  onClick={(event) => {
                    event.stopPropagation();
                    categoryForm.setFieldsValue(category);
                    setCategoryModal({ mode: "edit", categoryId: category.id });
                  }}
                >
                  编辑模块
                </Button>
                <Button
                  icon={<Plus size={14} />}
                  type="text"
                  onClick={(event) => {
                    event.stopPropagation();
                    categoryForm.resetFields();
                    setCategoryModal({ mode: "create", parentId: category.id });
                  }}
                >
                  添加子模块
                </Button>
                <Button
                  danger
                  icon={<Trash2 size={14} />}
                  type="text"
                  onClick={(event) => {
                    event.stopPropagation();
                    Modal.confirm({
                      title: "删除模块",
                      content: "删除后该模块及其子模块会从左侧树移除，已有工单数据不会自动删除。",
                      okText: "删除",
                      okButtonProps: { danger: true },
                      onOk: () => setCategories((current) => deleteCategory(current, category.id)),
                    });
                  }}
                >
                  删除模块
                </Button>
              </div>
            }
            placement="rightTop"
            trigger="click"
          >
            <Button className="requirement-category-node__more" icon={<MoreHorizontal size={14} />} size="small" type="text" />
          </Popover>
        </span>
      ),
      children: category.children?.map((child) => buildCategoryNode(child)),
    };
  }

  const handleSearch = (values: FilterValues) => setFilters(values);

  const handleReset = () => {
    filterForm.resetFields();
    setFilters({});
  };

  const openTicketModal = () => {
    ticketForm.resetFields();
    const category = activeCategory;
    setEditingTicketId(undefined);
    setDescriptionHtml("");
    setAttachments([]);
    ticketForm.setFieldsValue({
      type: "普通需求",
      priority: "中",
      applicant: currentUser,
      tags: [],
    });
    if (!category) {
      message.warning("请先维护需求分类");
      return;
    }
    setTicketModalOpen(true);
  };

  const openEditTicket = (ticket: RequirementTicket) => {
    setEditingTicketId(ticket.id);
    setDescriptionHtml(ticket.description);
    setAttachments(ticket.attachments.map((name, index) => ({ uid: `attachment-${index}`, name, status: "done" })));
    ticketForm.resetFields();
    ticketForm.setFieldsValue({
      title: ticket.title,
      type: ticket.type,
      priority: ticket.priority,
      tags: ticket.tags,
      applicant: ticket.applicant,
      expectedLaunchDate: ticket.expectedLaunchDate ? dayjs(ticket.expectedLaunchDate) : undefined,
      background: ticket.background,
      painPoint: ticket.painPoint,
      description: ticket.description,
      acceptanceCriteria: ticket.acceptanceCriteria,
      capabilityLeap: ticket.capabilityLeap,
      valueTypes: ticket.valueQuantifications?.map((item) => item.type),
      revenueGrowth: ticket.valueQuantifications?.find((item) => item.type === "营收增长")?.value,
      efficiencyGain: ticket.valueQuantifications?.find((item) => item.type === "效率提升")?.value,
      costReduction: ticket.valueQuantifications?.find((item) => item.type === "成本降低")?.value,
    });
    setTicketModalOpen(true);
  };

  const closeTicketModal = () => {
    setTicketModalOpen(false);
    setEditingTicketId(undefined);
  };

  const saveTicket = async (submitApproval: boolean) => {
    const values = await ticketForm.validateFields();
    const category = activeCategory;

    if (values.type === "价值需求" && !values.valueTypes?.length) {
      ticketForm.setFields([{ name: "valueTypes", errors: ["请至少选择一项预计价值量化"] }]);
      return;
    }

    const valueQuantifications = buildValueQuantifications(values);
    const now = makeNow();

    if (editingTicket) {
      setTickets((current) =>
        current.map((ticket) =>
          ticket.id === editingTicket.id
            ? {
                ...ticket,
                title: values.title,
                type: values.type,
                priority: values.priority,
                tags: values.tags ?? [],
                applicant: values.applicant,
                background: values.background,
                painPoint: values.painPoint,
                description: values.description,
                expectedLaunchDate: values.expectedLaunchDate?.format("YYYY-MM-DD"),
                attachments: attachments.map((file) => file.name),
                acceptanceCriteria: values.acceptanceCriteria,
                capabilityLeap: values.capabilityLeap,
                valueQuantifications,
                status: submitApproval ? "审批中" : ticket.status,
                updatedAt: now,
              }
            : ticket,
        ),
      );
      closeTicketModal();
      message.success(submitApproval ? "需求工单已保存并提交审批" : "需求工单已保存");
      return;
    }

    const newTicket: RequirementTicket = {
      id: `rt-${Date.now()}`,
      ticketNo: makeTicketNo(tickets.length),
      title: values.title,
      systemCategory: getCategoryDisplayName(category),
      type: values.type,
      priority: values.priority,
      tags: values.tags ?? [],
      applicant: values.applicant,
      createdBy: currentUser,
      businessOwner: category.businessOwner,
      reviewer: category.reviewer,
      itOwner: category.itOwner,
      status: submitApproval ? "审批中" : "待提交",
      background: values.background,
      painPoint: values.painPoint,
      description: values.description,
      expectedLaunchDate: values.expectedLaunchDate?.format("YYYY-MM-DD"),
      attachments: attachments.map((file) => file.name),
      acceptanceCriteria: values.acceptanceCriteria,
      capabilityLeap: values.capabilityLeap,
      valueQuantifications,
      comments: [],
      createdAt: now,
      updatedAt: now,
      linkedRequirements: [],
      approvalNodes: [
        { nodeName: "业务负责人审核", approver: category.businessOwner, result: "待处理" },
        { nodeName: "评审人评估审核", approver: category.reviewer, result: "待处理" },
      ],
    };

    setTickets((current) => [newTicket, ...current]);
    closeTicketModal();
    message.success(submitApproval ? "需求工单已提交审批" : "需求工单已暂存");
  };

  const submitTicket = (ticketId: string) => {
    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === ticketId
          ? { ...ticket, status: "审批中", updatedAt: makeNow(), approvalNodes: ticket.approvalNodes.map((node) => ({ ...node, result: "待处理" })) }
          : ticket,
      ),
    );
    message.success("已提交审批");
  };

  const withdrawTicket = (ticketId: string) => {
    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              status: "已撤回",
              updatedAt: makeNow(),
              approvalNodes: ticket.approvalNodes.map((node, index) =>
                index === 0 ? { ...node, result: "撤回", operatedAt: makeNow() } : node,
              ),
            }
          : ticket,
      ),
    );
    message.success("已撤回工单");
  };

  const closeWorkOrder = (ticketId: string) => {
    Modal.confirm({
      title: "关闭工单",
      content: "关闭后工单将进入已完成状态。",
      okText: "关闭",
      onOk: () => {
        setTickets((current) =>
          current.map((ticket) =>
            ticket.id === ticketId ? { ...ticket, status: "已完成", updatedAt: makeNow() } : ticket,
          ),
        );
        message.success("工单已关闭");
      },
    });
  };

  const deleteTicket = (ticketId: string) => {
    Modal.confirm({
      title: "删除需求工单",
      content: "删除后该工单不会继续进入审批和 IT 处理流程。",
      okText: "删除",
      okButtonProps: { danger: true },
      onOk: () => setTickets((current) => current.filter((ticket) => ticket.id !== ticketId)),
    });
  };

  const openCreateDemandModal = (ticket: RequirementTicket) => {
    itDemandForm.resetFields();
    itDemandForm.setFieldsValue({
      title: ticket.title,
      team: itTeams[0],
      category: itCategoriesByTeam[itTeams[0]][0],
      applicant: ticket.applicant,
      owner: ticket.itOwner,
      priority: ticket.priority,
      tags: ticket.tags,
      description: ticket.description,
    });
    setCreateDemandTicketId(ticket.id);
  };

  const handleCreateDemand = async () => {
    if (!createDemandTicket) {
      return;
    }

    const values = await itDemandForm.validateFields();
    const linked: LinkedItRequirement = {
      id: `it-${Date.now()}`,
      demandNo: `ITD-20260514-${String(createDemandTicket.linkedRequirements.length + 1).padStart(3, "0")}`,
      title: values.title,
      status: "待开发",
      owner: values.owner,
      team: values.team,
      category: values.category,
      developers: [],
      plannedFinishDate: values.plannedFinishDate?.format("YYYY-MM-DD"),
      iterationName: values.plannedFinishDate ? `${values.plannedFinishDate.format("YYYY.MM")} ${values.team}迭代` : undefined,
      iterationState: values.plannedFinishDate ? "已确认" : "待确认",
      scheduleFlag: "正常",
      priority: values.priority,
      tags: values.tags,
      description: values.description,
    };

    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === createDemandTicket.id
          ? {
              ...ticket,
              linkedRequirements: [...ticket.linkedRequirements, linked],
              status: getLinkedStatus({ ...ticket, linkedRequirements: [...ticket.linkedRequirements, linked] }),
              updatedAt: makeNow(),
            }
          : ticket,
      ),
    );
    setCreateDemandTicketId(undefined);
    itDemandForm.resetFields();
    message.success("已创建并关联 IT 需求");
  };

  const handleBatchLinkExisting = () => {
    if (!existingDemandTicket || selectedExistingDemandIds.length === 0) {
      return;
    }

    const selectedDemands = existingItDemands.filter((demand) => selectedExistingDemandIds.includes(demand.id));
    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === existingDemandTicket.id
          ? {
              ...ticket,
              linkedRequirements: [
                ...ticket.linkedRequirements,
                ...selectedDemands.filter((demand) => !ticket.linkedRequirements.some((item) => item.id === demand.id)),
              ],
              status: getLinkedStatus({
                ...ticket,
                linkedRequirements: [
                  ...ticket.linkedRequirements,
                  ...selectedDemands.filter((demand) => !ticket.linkedRequirements.some((item) => item.id === demand.id)),
                ],
              }),
              updatedAt: makeNow(),
            }
          : ticket,
      ),
    );
    setExistingDemandTicketId(undefined);
    setSelectedExistingDemandIds([]);
    message.success("已关联已有需求");
  };

  const unlinkRequirement = (ticketId: string, requirementId: string) => {
    setTickets((current) =>
      current.map((ticket) => {
        if (ticket.id !== ticketId) {
          return ticket;
        }

        const linkedRequirements = ticket.linkedRequirements.filter((item) => item.id !== requirementId);

        return {
          ...ticket,
          linkedRequirements,
          status: getLinkedStatus({ ...ticket, linkedRequirements }),
          updatedAt: makeNow(),
        };
      }),
    );
  };

  const renderLinkedRequirements = (ticket: RequirementTicket, showHeaderActions = false) => (
    <div className="requirement-linked-section">
      {showHeaderActions && ticket.itOwner === currentUser ? (
        <div className="requirement-section-title">
          <h3>关联需求</h3>
          <Space className="requirement-section-title__actions" size={4}>
            <Button icon={<GitBranchPlus size={14} />} type="link" onClick={() => openCreateDemandModal(ticket)}>
              关联创建需求
            </Button>
            <Button
              icon={<Plus size={14} />}
              type="link"
              onClick={() => {
                setSelectedExistingDemandIds([]);
                setExistingDemandTicketId(ticket.id);
              }}
            >
              关联已有需求
            </Button>
          </Space>
        </div>
      ) : null}
      <Table
        columns={[
          { title: "需求编号", dataIndex: "demandNo", width: 132 },
          { title: "需求名称", dataIndex: "title", width: 190 },
          { title: "状态", dataIndex: "status", width: 86, render: (status) => <Tag>{status}</Tag> },
          { title: "负责/验收", dataIndex: "owner", width: 86 },
          { title: "开发人员", dataIndex: "developers", width: 130, render: (developers?: string[]) => developers?.join("、") || "-" },
          {
            title: "操作",
            width: 86,
            render: (_, requirement: LinkedItRequirement) =>
              ticket.itOwner === currentUser ? (
                <Button danger type="link" onClick={() => unlinkRequirement(ticket.id, requirement.id)}>
                  取消关联
                </Button>
              ) : null,
          },
        ]}
        dataSource={ticket.linkedRequirements}
        pagination={false}
        rowKey="id"
        size="small"
      />
    </div>
  );

  const renderFlowRecords = (ticket: RequirementTicket) => {
    const records = [
      { id: "created", title: "创建工单", actor: ticket.createdBy, time: ticket.createdAt, detail: `状态：${ticket.status}` },
      ...ticket.approvalNodes
        .filter((node) => node.operatedAt || node.result !== "待处理")
        .map((node, index) => ({
          id: `approval-${index}`,
          title: `${node.nodeName} ${node.result}`,
          actor: node.approver,
          time: node.operatedAt ?? ticket.updatedAt,
          detail: node.comment ?? "审批节点记录",
        })),
      ...ticket.linkedRequirements.map((requirement) => ({
        id: `linked-${requirement.id}`,
        title: `关联 IT 需求：${requirement.demandNo}`,
        actor: requirement.owner,
        time: requirement.plannedFinishDate ?? ticket.updatedAt,
        detail: `${requirement.title} / ${requirement.status}`,
      })),
      ...ticket.comments.map((comment) => ({
        id: `comment-${comment.id}`,
        title: "新增评论",
        actor: comment.author,
        time: comment.createdAt,
        detail: comment.content,
      })),
      { id: "updated", title: "最近更新", actor: ticket.itOwner, time: ticket.updatedAt, detail: `当前状态：${ticket.status}` },
    ];

    return (
      <ul className="requirement-flow-records">
        {records.map((record) => (
          <li key={record.id}>
            <span className="requirement-flow-records__dot" />
            <div>
              <strong>{record.title}</strong>
              <p>{record.detail}</p>
              <span>{record.actor} / {record.time}</span>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  const handleAssign = async () => {
    if (!assignTicket) {
      return;
    }

    const values = await assignForm.validateFields();
    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === assignTicket.id ? { ...ticket, itOwner: values.itOwner, updatedAt: makeNow() } : ticket,
      ),
    );
    setAssignTicketId(undefined);
    message.success("已修改 IT 负责人");
  };

  const handleSaveCategory = async () => {
    if (!categoryModal) {
      return;
    }

    const values = await categoryForm.validateFields();

    if (categoryModal.mode === "edit") {
      setCategories((current) => updateCategory(current, categoryModal.categoryId, values));
      message.success("模块信息已更新");
    } else {
      setCategories((current) =>
        addCategory(current, categoryModal.parentId, {
          id: `cat-${Date.now()}`,
          name: values.name,
          businessOwner: values.businessOwner,
          reviewer: values.reviewer,
          itOwner: values.itOwner,
        }),
      );
      message.success("模块已新增");
    }

    setCategoryModal(undefined);
  };

  const handleAddComment = () => {
    if (!detailTicket || !commentText.trim()) {
      return;
    }

    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === detailTicket.id
          ? {
              ...ticket,
              comments: [
                ...ticket.comments,
                { id: `comment-${Date.now()}`, author: currentUser, content: commentText.trim(), createdAt: makeNow() },
              ],
            }
          : ticket,
      ),
    );
    setCommentText("");
  };

  const columns: ColumnsType<RequirementTicket> = [
    { title: "序号", width: 72, fixed: "left", render: (_value, _record, index) => index + 1 },
    { title: "工单号", dataIndex: "ticketNo", width: 160 },
    { title: "需求标题", dataIndex: "title", width: 300, ellipsis: true },
    { title: "所属模块", dataIndex: "systemCategory", width: 140 },
    {
      title: "类型",
      dataIndex: "type",
      width: 100,
      render: (type: RequirementTicketType) => <Tag color={type === "价值需求" ? "blue" : "default"}>{type}</Tag>,
    },
    {
      title: "标签",
      dataIndex: "tags",
      width: 180,
      render: (tags: RequirementTag[]) => (
        <Space size={4} wrap>
          {tags.map((tag) => (
            <Tag key={tag} color={tagColor[tag]}>
              {tag}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: "优先级",
      dataIndex: "priority",
      width: 90,
      render: (priority: RequirementTicketPriority) => <Tag color={priorityColor[priority]}>{priority}</Tag>,
    },
    { title: "提出人", dataIndex: "applicant", width: 100 },
    {
      title: "IT负责人",
      dataIndex: "itOwner",
      width: 130,
      render: (owner: string, ticket) => (
        <Space size={4} onClick={(event) => event.stopPropagation()}>
          <span>{owner}</span>
          {owner === currentUser ? (
            <Tooltip title="修改负责人">
              <Button
                className="requirement-send-button"
                icon={<Send size={14} />}
                size="small"
                onClick={() => {
                  assignForm.setFieldsValue({ itOwner: ticket.itOwner });
                  setAssignTicketId(ticket.id);
                }}
              />
            </Tooltip>
          ) : null}
        </Space>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 110,
      render: (status: RequirementTicketStatus) => <Tag color={statusColor[status]}>{status}</Tag>,
    },
    {
      title: "关联需求",
      dataIndex: "linkedRequirements",
      width: 130,
      render: (items: LinkedItRequirement[], ticket) => (
        <Space className="requirement-inline-actions" size={4} onClick={(event) => event.stopPropagation()}>
          <span className="requirement-linked-ratio">
            {items.filter((item) => item.status === "已完成").length}/{items.length}
          </span>
          {ticket.itOwner === currentUser ? (
            <Tooltip title="关联需求">
              <Button
                className="requirement-send-button"
                icon={<Send size={14} />}
                size="small"
                onClick={() => setLinkedListTicketId(ticket.id)}
              />
            </Tooltip>
          ) : null}
        </Space>
      ),
    },
    { title: "期望上线", dataIndex: "expectedLaunchDate", width: 120 },
    { title: "更新时间", dataIndex: "updatedAt", width: 150 },
    {
      title: "操作",
      key: "actions",
      fixed: "right",
      width: 178,
      render: (_, ticket) => {
        const isOwner = ticket.applicant === currentUser || ticket.createdBy === currentUser;
        const canManageDraft = isOwner && ["待提交", "已驳回", "已撤回"].includes(ticket.status);
        const actions: TableActionItem[] = [];

        if (canManageDraft) {
          actions.push({ key: "edit", label: "编辑", onClick: () => openEditTicket(ticket) });
          actions.push({ key: "submit", label: "提交审批", onClick: () => submitTicket(ticket.id) });
          actions.push({ key: "delete", label: "删除", danger: true, onClick: () => deleteTicket(ticket.id) });
        }

        if (ticket.status === "审批中") {
          actions.push({ key: "approval", label: "审批详情", onClick: () => setDetailTicketId(ticket.id) });
        }

        if (isOwner && ticket.status === "审批中") {
          actions.push({ key: "withdraw", label: "撤回", onClick: () => withdrawTicket(ticket.id) });
        }

        if (ticket.itOwner === currentUser && ["待确认", "待排期", "开发中"].includes(ticket.status)) {
          actions.push({ key: "close", label: "关闭工单", onClick: () => closeWorkOrder(ticket.id) });
        }

        return actions.length > 0 ? (
          <div onClick={(event) => event.stopPropagation()}>
            <TableActions actions={actions} />
          </div>
        ) : null;
      },
    },
  ];

  return (
    <main className="page requirement-tickets-page">
      <TreeListLayout
        sidebarWidth={300}
        tree={
          <SectionPanel>
            <Input
              allowClear
              className="tree-list-search requirement-category-search"
              prefix={<Search size={14} />}
              placeholder="搜索模块"
              value={categoryKeyword}
              onChange={(event) => setCategoryKeyword(event.target.value)}
            />
            <Tree
              blockNode
              expandedKeys={expandedCategoryKeys}
              selectedKeys={[selectedCategoryId]}
              showLine
              treeData={categoryTreeData}
              onExpand={setExpandedCategoryKeys}
              onSelect={(keys) => setSelectedCategoryId(String(keys[0] ?? allCategoryKey))}
            />
          </SectionPanel>
        }
      >
        <section className="filter-panel">
          <Form form={filterForm} layout="inline" onFinish={handleSearch}>
            <Form.Item name="keyword">
              <Input allowClear placeholder="需求标题 / 背景" />
            </Form.Item>
            <Form.Item name="ticketNo">
              <Input allowClear placeholder="工单号" />
            </Form.Item>
            <Form.Item name="applicant">
              <Input allowClear placeholder="提出人" />
            </Form.Item>
            <Form.Item name="status">
              <Select
                allowClear
                placeholder="状态"
                options={Object.keys(statusColor).map((item) => ({ value: item, label: item }))}
                style={{ width: 130 }}
              />
            </Form.Item>
            <Form.Item>
              <div className="standard-list-filter__actions">
                <Space wrap>
                  <Button htmlType="submit" icon={<Filter size={16} />} type="primary">
                    查询
                  </Button>
                  <Button icon={<RotateCcw size={16} />} onClick={handleReset}>
                    重置
                  </Button>
                </Space>
                <Space wrap className="standard-list-filter__business-actions">
                  <Button className="standard-list-filter__create-action" icon={<Plus size={16} />} onClick={openTicketModal}>
                    新增需求工单
                  </Button>
                </Space>
              </div>
            </Form.Item>
          </Form>
        </section>

        <SectionPanel>
          <Table
            columns={columns}
            dataSource={filteredTickets}
            onRow={(ticket) => ({
              onClick: () => setDetailTicketId(ticket.id),
            })}
            pagination={{ current: 1, pageSize, total: filteredTickets.length, showSizeChanger: true }}
            rowKey="id"
            scroll={{ x: 2040 }}
          />
        </SectionPanel>
      </TreeListLayout>

      <Modal
        destroyOnClose
        footer={
          editingTicket
            ? [
                <Button key="cancel" onClick={closeTicketModal}>
                  取消
                </Button>,
                <Button key="save" type="primary" onClick={() => saveTicket(false)}>
                  保存
                </Button>,
              ]
            : [
                <Button key="cancel" onClick={closeTicketModal}>
                  取消
                </Button>,
                <Button key="save" onClick={() => saveTicket(false)}>
                  仅保存
                </Button>,
                <Button key="submit" type="primary" onClick={() => saveTicket(true)}>
                  提交审批
                </Button>,
              ]
        }
        onCancel={closeTicketModal}
        open={ticketModalOpen}
        title={editingTicket ? "编辑需求工单" : "新增需求工单"}
        width={860}
      >
        <Form form={ticketForm} layout="vertical">
          <div className="requirement-ticket-form-grid">
            <Form.Item className="requirement-ticket-form-grid__full" label="需求标题" name="title" rules={[{ required: true, message: "请输入需求标题" }]}>
              <Input placeholder="系统/模块 + 需求动作 + 目标结果" />
            </Form.Item>
            <Form.Item label="需求类型" name="type" rules={[{ required: true, message: "请选择需求类型" }]}>
              <Select options={["普通需求", "价值需求"].map((item) => ({ value: item, label: item }))} />
            </Form.Item>
            <Form.Item label="优先级" name="priority" rules={[{ required: true, message: "请选择优先级" }]}>
              <Select options={["高", "中", "低"].map((item) => ({ value: item, label: <Tag color={priorityColor[item as RequirementTicketPriority]}>{item}</Tag> }))} />
            </Form.Item>
            <Form.Item label="标签" name="tags">
              <Select
                mode="multiple"
                options={requirementTags.map((tag) => ({ value: tag, label: <Tag color={tagColor[tag]}>{tag}</Tag> }))}
              />
            </Form.Item>
            <Form.Item label="期望上线日期" name="expectedLaunchDate">
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="提出人" name="applicant" rules={[{ required: true, message: "请选择提出人" }]}>
              <Select showSearch options={applicantOptions.map((item) => ({ value: item, label: item }))} />
            </Form.Item>
            <Form.Item label="需求模块">
              <Input disabled value={modalModuleName} />
            </Form.Item>
            <Form.Item className="requirement-ticket-form-grid__full" label="需求背景" name="background" rules={[{ required: true, message: "请输入需求背景" }]}>
              <Input.TextArea autoSize={{ minRows: 1, maxRows: 4 }} />
            </Form.Item>
            <Form.Item className="requirement-ticket-form-grid__full" label="业务痛点" name="painPoint" rules={[{ required: true, message: "请输入业务痛点" }]}>
              <Input.TextArea autoSize={{ minRows: 1, maxRows: 4 }} />
            </Form.Item>
            <Form.Item name="description" rules={[{ required: true, message: "请输入需求描述" }]} hidden>
              <Input />
            </Form.Item>
            <div className="requirement-ticket-form-grid__full requirement-rich-editor">
              <div className="requirement-rich-editor__toolbar">
                <Button size="small">B</Button>
                <Button size="small">I</Button>
                <Button size="small">•</Button>
              </div>
              <div
                className="requirement-rich-editor__body"
                contentEditable
                onInput={(event) => {
                  const html = event.currentTarget.innerHTML;
                  setDescriptionHtml(html);
                  ticketForm.setFieldValue("description", html);
                }}
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />
            </div>
            <Form.Item className="requirement-ticket-form-grid__full" label="附件上传">
              <Upload
                beforeUpload={() => false}
                fileList={attachments}
                onChange={({ fileList }) => setAttachments(fileList)}
              >
                <Button icon={<UploadCloud size={16} />}>上传附件</Button>
              </Upload>
            </Form.Item>
            {requirementType === "价值需求" ? (
              <>
                <Form.Item className="requirement-ticket-form-grid__full" label="验收标准或成功标准" name="acceptanceCriteria" rules={[{ required: true, message: "请输入验收标准或成功标准" }]}>
                  <Input />
                </Form.Item>
                <Form.Item className="requirement-ticket-form-grid__full" label="核心能力跃升" name="capabilityLeap" rules={[{ required: true, message: "请选择核心能力跃升" }]}>
                  <Checkbox.Group className="requirement-checkbox-stack" options={capabilityOptions} />
                </Form.Item>
                <Form.Item className="requirement-ticket-form-grid__full" label="预计价值量化" name="valueTypes" rules={[{ required: true, message: "请至少选择一项预计价值量化" }]}>
                  <Checkbox.Group className="requirement-value-checks">
                    <div className="requirement-value-grid">
                      <div className="requirement-value-item">
                        <Checkbox value="营收增长">营收增长</Checkbox>
                        <Form.Item
                          name="revenueGrowth"
                          rules={[
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                if (!getFieldValue("valueTypes")?.includes("营收增长") || value !== undefined) {
                                  return Promise.resolve();
                                }

                                return Promise.reject(new Error("请填写预计带来金额"));
                              },
                            }),
                          ]}
                        >
                          <InputNumber disabled={!selectedValueTypes.includes("营收增长")} min={0} precision={0} addonAfter="元" style={{ width: "100%" }} />
                        </Form.Item>
                      </div>
                      <div className="requirement-value-item">
                        <Checkbox value="效率提升">效率提升</Checkbox>
                        <Form.Item
                          name="efficiencyGain"
                          rules={[
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                if (!getFieldValue("valueTypes")?.includes("效率提升") || value !== undefined) {
                                  return Promise.resolve();
                                }

                                return Promise.reject(new Error("请填写预计节省人天"));
                              },
                            }),
                          ]}
                        >
                          <InputNumber disabled={!selectedValueTypes.includes("效率提升")} min={0} precision={0} addonAfter="人天/月" style={{ width: "100%" }} />
                        </Form.Item>
                      </div>
                      <div className="requirement-value-item">
                        <Checkbox value="成本降低">成本降低</Checkbox>
                        <Form.Item
                          name="costReduction"
                          rules={[
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                if (!getFieldValue("valueTypes")?.includes("成本降低") || value !== undefined) {
                                  return Promise.resolve();
                                }

                                return Promise.reject(new Error("请填写预计降低金额"));
                              },
                            }),
                          ]}
                        >
                          <InputNumber disabled={!selectedValueTypes.includes("成本降低")} min={0} precision={0} addonAfter="万元/年" style={{ width: "100%" }} />
                        </Form.Item>
                      </div>
                    </div>
                  </Checkbox.Group>
                </Form.Item>
              </>
            ) : null}
          </div>
        </Form>
      </Modal>

      <Drawer
        destroyOnClose
        onClose={() => setDetailTicketId(undefined)}
        open={Boolean(detailTicket)}
        title={
          detailTicket ? (
            <div className="requirement-drawer-title">
              <Tag color={statusColor[detailTicket.status]}>{detailTicket.status}</Tag>
              {detailTicket.type === "价值需求" ? (
                <Popover content={renderValueDemandPopover(detailTicket)} placement="bottomLeft" trigger="hover">
                  <Tag className="requirement-value-tag" color="blue">价值需求</Tag>
                </Popover>
              ) : null}
              <span>工单编号：{detailTicket.ticketNo}</span>
            </div>
          ) : null
        }
        width={760}
      >
        {detailTicket ? (
          <div className="requirement-ticket-drawer">
            <div className="requirement-drawer-top">
              <h2 className="requirement-detail-title">{detailTicket.title}</h2>
              <Steps
                className="requirement-status-steps"
                current={getStepIndex(detailTicket.status)}
                items={workOrderSteps}
                labelPlacement="vertical"
                size="small"
              />
              <Descriptions
                bordered
                column={2}
                size="small"
                items={[
                  { key: "module", label: "所属模块", children: detailTicket.systemCategory },
                  { key: "applicant", label: "提出人", children: detailTicket.applicant },
                  { key: "priority", label: "优先级", children: <Tag color={priorityColor[detailTicket.priority]}>{detailTicket.priority}</Tag> },
                  { key: "tags", label: "标签", children: detailTicket.tags.length ? detailTicket.tags.map((tag) => <Tag key={tag} color={tagColor[tag]}>{tag}</Tag>) : "-" },
                  { key: "itOwner", label: "IT负责人", children: detailTicket.itOwner },
                  { key: "developers", label: "开发人员", children: getDevelopers(detailTicket) },
                  { key: "launch", label: "业务预期", children: detailTicket.expectedLaunchDate ?? "-" },
                  { key: "approvedAt", label: "审核通过", children: getApprovedAt(detailTicket) },
                  { key: "schedule", label: "IT排期", children: getLatestDate(detailTicket.linkedRequirements.map((item) => item.plannedFinishDate)) },
                  { key: "actualLaunch", label: "实际上线", children: getLatestDate(detailTicket.linkedRequirements.map((item) => item.acceptedAt)) },
                  { key: "background", label: "需求背景", span: 2, children: detailTicket.background },
                  { key: "pain", label: "业务痛点", span: 2, children: detailTicket.painPoint },
                ]}
              />
              <div className="requirement-ticket-drawer__section">
                <div className="requirement-section-title">
                  <h3>关联需求</h3>
                  {detailTicket.itOwner === currentUser ? (
                    <Space className="requirement-section-title__actions" size={4}>
                      <Button icon={<GitBranchPlus size={14} />} type="link" onClick={() => openCreateDemandModal(detailTicket)}>
                        关联创建需求
                      </Button>
                      <Button
                        icon={<Plus size={14} />}
                        type="link"
                        onClick={() => {
                          setSelectedExistingDemandIds([]);
                          setExistingDemandTicketId(detailTicket.id);
                        }}
                      >
                        关联已有需求
                      </Button>
                    </Space>
                  ) : null}
                </div>
                {renderLinkedRequirements(detailTicket)}
              </div>
            </div>
            <div className="requirement-drawer-bottom">
              <Tabs
                items={[
                  {
                    key: "detail",
                    label: "详情说明",
                    children: (
                      <div className="requirement-comments-tab">
                        <div className="requirement-comments-scroll">
                          <div className="requirement-comment requirement-comment--description">
                            <div className="requirement-comment__avatar">{detailTicket.createdBy.slice(0, 1)}</div>
                            <div className="requirement-comment__main">
                              <div className="requirement-comment__meta">
                                <strong>需求描述</strong>
                                <span>{detailTicket.createdBy} / {detailTicket.createdAt}</span>
                              </div>
                              <div dangerouslySetInnerHTML={{ __html: detailTicket.description }} />
                              {detailTicket.attachments.length > 0 ? (
                                <p>附件：{detailTicket.attachments.join("、")}</p>
                              ) : null}
                            </div>
                          </div>
                          {detailTicket.comments.map((comment) => (
                            <div className="requirement-comment" key={comment.id}>
                              <div className="requirement-comment__avatar">{comment.author.slice(0, 1)}</div>
                              <div className="requirement-comment__main">
                                <div className="requirement-comment__meta">
                                  <strong>{comment.author}</strong>
                                  <span>{comment.createdAt}</span>
                                </div>
                                <p>{comment.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="requirement-comment-composer">
                          <Input.TextArea rows={2} value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder="输入评论" />
                          <Space>
                            <Upload beforeUpload={() => false} showUploadList={false}>
                              <Button icon={<FileUp size={16} />}>附件</Button>
                            </Upload>
                            <Button type="primary" onClick={handleAddComment}>发表评论</Button>
                          </Space>
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: "flow",
                    label: "流程记录",
                    children: <div className="requirement-tab-scroll">{renderFlowRecords(detailTicket)}</div>,
                  },
                ]}
              />
            </div>
          </div>
        ) : null}
      </Drawer>

      <Modal footer={null} onCancel={() => setLinkedListTicketId(undefined)} open={Boolean(linkedListTicket)} title="关联需求" width={980}>
        {linkedListTicket ? renderLinkedRequirements(linkedListTicket, true) : null}
      </Modal>

      <Modal
        destroyOnClose
        okText="确认创建并关联"
        onCancel={() => setCreateDemandTicketId(undefined)}
        onOk={handleCreateDemand}
        open={Boolean(createDemandTicket)}
        title="关联创建需求"
        width={820}
      >
        <Form form={itDemandForm} layout="vertical">
          <div className="requirement-ticket-form-grid">
            <Form.Item className="requirement-ticket-form-grid__full" label="需求名称" name="title" rules={[{ required: true, message: "请输入需求名称" }]}>
              <Input />
            </Form.Item>
            <Form.Item label="团队" name="team" rules={[{ required: true, message: "请选择团队" }]}>
              <Select
                options={itTeams.map((team) => ({ value: team, label: team }))}
                onChange={(team) => itDemandForm.setFieldValue("category", itCategoriesByTeam[team][0])}
              />
            </Form.Item>
            <Form.Item label="分类" name="category" rules={[{ required: true, message: "请选择分类" }]}>
              <Select options={(itCategoriesByTeam[selectedItTeam] ?? []).map((category) => ({ value: category, label: category }))} />
            </Form.Item>
            <Form.Item label="提出人" name="applicant" rules={[{ required: true, message: "请选择提出人" }]}>
              <Select options={applicantOptions.map((item) => ({ value: item, label: item }))} />
            </Form.Item>
            <Form.Item label="负责/验收" name="owner" rules={[{ required: true, message: "请选择负责/验收人" }]}>
              <Select options={requirementItOwners.map((item) => ({ value: item, label: item }))} />
            </Form.Item>
            <Form.Item label="计划完成日期" name="plannedFinishDate">
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="优先级" name="priority" rules={[{ required: true, message: "请选择优先级" }]}>
              <Select options={["高", "中", "低"].map((item) => ({ value: item, label: <Tag color={priorityColor[item as RequirementTicketPriority]}>{item}</Tag> }))} />
            </Form.Item>
            <Form.Item label="标签" name="tags">
              <Select mode="multiple" options={requirementTags.map((tag) => ({ value: tag, label: <Tag color={tagColor[tag]}>{tag}</Tag> }))} />
            </Form.Item>
            <Form.Item className="requirement-ticket-form-grid__full" label="描述" name="description" rules={[{ required: true, message: "请输入描述" }]}>
              <Input.TextArea rows={5} />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <Modal
        destroyOnClose
        okText="批量关联"
        onCancel={() => setExistingDemandTicketId(undefined)}
        onOk={handleBatchLinkExisting}
        open={Boolean(existingDemandTicket)}
        title="关联已有需求"
        width={980}
      >
        <section className="filter-panel requirement-existing-filter">
          <Form form={existingDemandFilterForm} layout="inline" onFinish={setExistingDemandFilters}>
            <Form.Item name="keyword">
              <Input allowClear placeholder="需求编号 / 需求名称" />
            </Form.Item>
            <Form.Item name="team">
              <Select allowClear placeholder="团队" options={itTeams.map((team) => ({ value: team, label: team }))} style={{ width: 150 }} />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button htmlType="submit" icon={<Filter size={16} />} type="primary">查询</Button>
                <Button
                  icon={<RotateCcw size={16} />}
                  onClick={() => {
                    existingDemandFilterForm.resetFields();
                    setExistingDemandFilters({});
                  }}
                >
                  重置
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </section>
        <Table
          rowSelection={{
            selectedRowKeys: selectedExistingDemandIds,
            onChange: (keys) => setSelectedExistingDemandIds(keys.map(String)),
          }}
          columns={[
            { title: "需求编号", dataIndex: "demandNo", width: 150 },
            { title: "需求名称", dataIndex: "title" },
            { title: "状态", dataIndex: "status", width: 100, render: (status) => <Tag>{status}</Tag> },
            { title: "负责/验收", dataIndex: "owner", width: 110 },
            { title: "开发人员", dataIndex: "developers", render: (developers?: string[]) => developers?.join("、") || "-" },
          ]}
          dataSource={filteredExistingDemands}
          pagination={false}
          rowKey="id"
          size="small"
        />
      </Modal>

      <Modal destroyOnClose okText="确认修改" onCancel={() => setAssignTicketId(undefined)} onOk={handleAssign} open={Boolean(assignTicket)} title="修改 IT 负责人">
        <Form form={assignForm} layout="vertical">
          <Form.Item label="IT 负责人" name="itOwner" rules={[{ required: true, message: "请选择 IT 负责人" }]}>
            <Select options={requirementItOwners.map((item) => ({ value: item, label: item }))} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        destroyOnClose
        okText="保存"
        onCancel={() => setCategoryModal(undefined)}
        onOk={handleSaveCategory}
        open={Boolean(categoryModal)}
        title={categoryModal?.mode === "create" ? "新增模块" : "编辑模块"}
      >
        <Form form={categoryForm} layout="vertical">
          <Form.Item label="模块名称" name="name" rules={[{ required: true, message: "请输入模块名称" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="业务负责人" name="businessOwner" rules={[{ required: true, message: "请输入业务负责人" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="评审人" name="reviewer" rules={[{ required: true, message: "请输入评审人" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="IT业务负责人" name="itOwner" rules={[{ required: true, message: "请选择 IT 业务负责人" }]}>
            <Select options={requirementItOwners.map((item) => ({ value: item, label: item }))} />
          </Form.Item>
        </Form>
      </Modal>
    </main>
  );
}
