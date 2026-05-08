import {
  Button,
  Drawer,
  Empty,
  Form,
  Input,
  Modal,
  Popover,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Tree,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table/interface";
import type { DataNode } from "antd/es/tree";
import { ArrowDown, ArrowUp, Building2, CheckCheck, FileCog, Filter, Mars, Plus, RotateCcw, Venus } from "lucide-react";
import { useEffect, useMemo, useState, type Key } from "react";
import { useSearchParams } from "react-router-dom";
import { PerformanceDetailDrawer } from "../components/PerformanceDetailDrawer";
import { SectionPanel } from "../components/SectionPanel";
import { TableActions } from "../components/TableActions";
import { TreeListLayout } from "../components/TreeListLayout";
import { departmentNodes, type DepartmentNode } from "../data/orgStructure";
import {
  getPerformanceFlowName,
  performanceConfigRules,
  performanceConfirmers,
  performanceFlowOptions,
  performanceRanks,
  performanceRecords,
  type PerformanceConfigRule,
  type PerformanceRecord,
  type PerformanceStatus,
} from "../data/performanceManagement";
import { scorecardTemplates } from "../data/scorecardConfig";
import "./Page.css";
import "./PerformanceManagementPage.css";
import "./standards/Standards.css";

type PerformanceFilterValues = {
  keyword?: string;
  period?: string;
  positions?: string[];
  ranks?: string[];
};

type RuleFormValues = {
  name?: string;
  objectKeys?: string[];
  ranks?: string[];
  templateId?: string;
  flowCode?: PerformanceConfigRule["flowCode"];
  confirmer?: string;
};

type ReturnFormValues = {
  reason?: string;
};

type TransferFormValues = {
  handler?: string;
};

type PerformanceActionConfirm = {
  title: string;
  content: string;
  okText: string;
  onOk: () => void;
};

const departmentObjectPrefix = "department:";
const employeeObjectPrefix = "employee:";

const currentPerformanceUser = "陈嘉";
const managedDepartments = ["运营中心", "仓储中心"];
const femalePerformanceNames = new Set(["陈嘉", "林珊", "孙悦", "高敏", "唐琪", "邹航", "宋妍", "罗佳", "许佳"]);
type StatusViewKey = "all" | "待员工自评" | "待上级评价" | "待绩效确认" | "confirmedArchived";
const statusViewOptions: Array<{ key: StatusViewKey; label: string; statuses?: PerformanceStatus[] }> = [
  { key: "all", label: "全部" },
  { key: "待员工自评", label: "待员工自评", statuses: ["待员工自评"] },
  { key: "待上级评价", label: "待上级评价", statuses: ["待上级评价"] },
  { key: "待绩效确认", label: "待绩效确认", statuses: ["待绩效确认"] },
  { key: "confirmedArchived", label: "已确认/已归档", statuses: ["已确认", "已归档"] },
];

const statusColor: Record<PerformanceStatus, string> = {
  无需考核: "default",
  待员工自评: "blue",
  待上级评价: "processing",
  待绩效确认: "purple",
  已确认: "green",
  已归档: "default",
};
const actionModalZIndex = 1300;

const performanceDemoDepartment: DepartmentNode = {
  title: "产品孵化部",
  key: "chengdu-incubation",
  area: "成都",
  code: "ORG-103",
  leader: "陈嘉",
  parentName: "成都",
  memberCount: 1,
  status: "启用",
};

function appendPerformanceDemoDepartment(nodes: DepartmentNode[]): DepartmentNode[] {
  return nodes.map((node) => {
    if (node.key === "chengdu") {
      return {
        ...node,
        children: [...(node.children ?? []), performanceDemoDepartment],
      };
    }

    return {
      ...node,
      children: node.children ? appendPerformanceDemoDepartment(node.children) : undefined,
    };
  });
}

const performanceDepartmentNodes = appendPerformanceDemoDepartment(departmentNodes);

function flattenDepartments(nodes: DepartmentNode[]): DepartmentNode[] {
  return nodes.flatMap((node) => [node, ...flattenDepartments(node.children ?? [])]);
}

function collectDepartmentKeys(nodes: DepartmentNode[], targetKey: string): string[] {
  for (const node of nodes) {
    if (node.key === targetKey) {
      return flattenDepartments([node]).map((item) => item.key);
    }

    const matched = collectDepartmentKeys(node.children ?? [], targetKey);

    if (matched.length) {
      return matched;
    }
  }

  return [];
}

function filterDepartmentTree(nodes: DepartmentNode[], keyword: string): DepartmentNode[] {
  const normalizedKeyword = keyword.trim();

  if (!normalizedKeyword) {
    return nodes;
  }

  return nodes.reduce<DepartmentNode[]>((result, node) => {
    const children = filterDepartmentTree(node.children ?? [], normalizedKeyword);

    if (node.title.includes(normalizedKeyword) || children.length) {
      result.push({ ...node, children: children.length ? children : undefined });
    }

    return result;
  }, []);
}

function getDepartmentRecordCount(node: DepartmentNode, records: PerformanceRecord[]) {
  const departmentKeys = new Set(flattenDepartments([node]).map((department) => department.key));

  return records.filter((record) => departmentKeys.has(record.departmentKey)).length;
}

function renderDepartmentTreeTitle(node: DepartmentNode, records: PerformanceRecord[]) {
  return (
    <span className="performance-tree-node">
      <Building2 className="performance-tree-node__icon performance-tree-node__icon--department" size={16} />
      <span>{node.title}</span>
      <span className="performance-tree-node__count">（{getDepartmentRecordCount(node, records)}）</span>
    </span>
  );
}

function renderEmployeeTreeTitle(record: PerformanceRecord) {
  const Icon = femalePerformanceNames.has(record.name) ? Venus : Mars;
  const genderClassName = femalePerformanceNames.has(record.name)
    ? "performance-tree-avatar--female"
    : "performance-tree-avatar--male";

  return (
    <span className="performance-tree-node">
      <span className={`performance-tree-avatar ${genderClassName}`}>
        <Icon size={13} />
      </span>
      <span>{record.name}</span>
    </span>
  );
}

function buildPerformanceTree(nodes: DepartmentNode[], records: PerformanceRecord[]): DataNode[] {
  return nodes.map((node) => {
    const childDepartments = buildPerformanceTree(node.children ?? [], records);
    const childMembers = records
      .filter((record) => record.departmentKey === node.key)
      .map((record) => ({
        key: record.id,
        title: renderEmployeeTreeTitle(record),
        isLeaf: true,
      }));

    return {
      key: node.key,
      title: renderDepartmentTreeTitle(node, records),
      children: [...childDepartments, ...childMembers],
    };
  });
}

function getCheckedRecordScope(records: PerformanceRecord[], checkedKeys: Key[]) {
  if (!checkedKeys.length) {
    return records;
  }

  const checkedRecordIds = new Set(checkedKeys.filter((key) => String(key).startsWith("PERF-")).map(String));
  const checkedDepartmentKeys = new Set(
    checkedKeys
      .filter((key) => !String(key).startsWith("PERF-"))
      .flatMap((key) => collectDepartmentKeys(performanceDepartmentNodes, String(key))),
  );

  return records.filter(
    (record) => checkedRecordIds.has(record.id) || checkedDepartmentKeys.has(record.departmentKey),
  );
}

function canCurrentUserConfirm(record: PerformanceRecord) {
  return record.status === "待绩效确认" && record.confirmer === currentPerformanceUser;
}

function canCurrentUserReview(record: PerformanceRecord) {
  return record.status === "待上级评价" && record.currentHandler === currentPerformanceUser;
}

function canCurrentUserSelfEvaluate(record: PerformanceRecord) {
  return record.status === "待员工自评" && record.name === currentPerformanceUser;
}

function canCurrentUserSee(record: PerformanceRecord) {
  return (
    record.name === currentPerformanceUser ||
    record.directManager === currentPerformanceUser ||
    record.currentHandler === currentPerformanceUser ||
    record.confirmer === currentPerformanceUser ||
    managedDepartments.includes(record.department)
  );
}

function isActionableRecord(record: PerformanceRecord) {
  return (
    canCurrentUserSelfEvaluate(record) ||
    canCurrentUserReview(record) ||
    canCurrentUserConfirm(record)
  );
}

function shouldShowModifiedBadge(record: PerformanceRecord) {
  return record.modified && record.status === "待绩效确认";
}

function getDepartmentName(departmentKey?: string) {
  return flattenDepartments(performanceDepartmentNodes).find((department) => department.key === departmentKey)?.title ?? "";
}

function getRuleObjectKeys(rule: PerformanceConfigRule) {
  return rule.objectKeys?.length
    ? rule.objectKeys
    : rule.departmentKeys.map((departmentKey) => `${departmentObjectPrefix}${departmentKey}`);
}

function getRuleObjectNames(rule: PerformanceConfigRule) {
  return rule.objectNames?.length ? rule.objectNames : rule.departments;
}

function parseRuleObjectKey(objectKey: string) {
  if (objectKey.startsWith(employeeObjectPrefix)) {
    return { type: "employee", key: objectKey.slice(employeeObjectPrefix.length) };
  }

  return { type: "department", key: objectKey.replace(departmentObjectPrefix, "") };
}

function getRuleDepartmentKeys(objectKeys: string[]) {
  return objectKeys
    .map(parseRuleObjectKey)
    .filter((item) => item.type === "department")
    .map((item) => item.key);
}

function getObjectName(objectKey: string, records: PerformanceRecord[]) {
  const object = parseRuleObjectKey(objectKey);

  if (object.type === "employee") {
    return records.find((record) => record.id === object.key)?.name ?? "";
  }

  return getDepartmentName(object.key);
}

function shouldShowPerformanceScore(record: PerformanceRecord) {
  return ["待绩效确认", "已确认", "已归档"].includes(record.status) && Number.isFinite(record.score);
}

function formatPerformanceScore(score?: number) {
  if (!Number.isFinite(score)) {
    return "-";
  }

  const normalizedScore = Number(score);

  return `${Number.isInteger(normalizedScore) ? normalizedScore : normalizedScore.toFixed(1)}分`;
}

type RuleMatchedEmployee = {
  record: PerformanceRecord;
  rule?: PerformanceConfigRule;
};

function renderConfigTextCell(value: string) {
  return (
    <Popover content={value} mouseEnterDelay={0.3}>
      <span className="performance-config-cell-ellipsis">{value || "-"}</span>
    </Popover>
  );
}

function renderConfigTags(values: string[]) {
  const displayValues = values.length ? values : ["-"];

  return (
    <Popover
      content={(
        <div className="performance-config-popover-tags">
          {displayValues.map((value) => <Tag key={value}>{value}</Tag>)}
        </div>
      )}
      mouseEnterDelay={0.3}
    >
      <div className="performance-config-tags performance-config-tags--clamped">
        {displayValues.map((value) => <Tag key={value}>{value}</Tag>)}
      </div>
    </Popover>
  );
}

function getMatchedPerformanceRule(record: PerformanceRecord, rules: PerformanceConfigRule[]) {
  return rules.find((rule) => {
    const objectKeys = getRuleObjectKeys(rule);
    const matchedObject = objectKeys.some((objectKey) => {
      const object = parseRuleObjectKey(objectKey);

      if (object.type === "employee") {
        return object.key === record.id;
      }

      return collectDepartmentKeys(performanceDepartmentNodes, object.key).includes(record.departmentKey);
    });

    return matchedObject && rule.ranks.includes(record.rank);
  });
}

function ConfigDrawer({
  open,
  rules,
  records,
  onClose,
  onRulesChange,
}: {
  open: boolean;
  rules: PerformanceConfigRule[];
  records: PerformanceRecord[];
  onClose: () => void;
  onRulesChange: (rules: PerformanceConfigRule[]) => void;
}) {
  const [editingRule, setEditingRule] = useState<PerformanceConfigRule>();
  const [editorOpen, setEditorOpen] = useState(false);
  const [deleteTargetRule, setDeleteTargetRule] = useState<PerformanceConfigRule>();
  const [selectedRuleId, setSelectedRuleId] = useState<string>();
  const [peopleTab, setPeopleTab] = useState<"matched" | "abnormal">("matched");
  const [form] = Form.useForm<RuleFormValues>();
  const objectOptions = [
    {
      label: "部门",
      options: flattenDepartments(performanceDepartmentNodes)
    .filter((department) => department.key !== "las" && !(department.children?.length))
        .map((department) => ({ value: `${departmentObjectPrefix}${department.key}`, label: department.title })),
    },
    {
      label: "人员",
      options: records.map((record) => ({
        value: `${employeeObjectPrefix}${record.id}`,
        label: `${record.name}（${record.department} / ${record.rank}）`,
      })),
    },
  ];
  const templateOptions = scorecardTemplates
    .filter((template) => template.status === "启用中")
    .map((template) => ({ value: template.id, label: template.name }));
  const flowOptions = performanceFlowOptions.map((flow) => ({
    value: flow.code,
    label: flow.name,
  }));

  const openEditor = (rule?: PerformanceConfigRule) => {
    setEditingRule(rule);
    setEditorOpen(true);
    form.setFieldsValue({
      name: rule?.name,
      objectKeys: rule ? getRuleObjectKeys(rule) : [],
      ranks: rule?.ranks ?? [],
      templateId: rule?.templateId,
      flowCode: rule?.flowCode,
      confirmer: rule?.confirmer,
    });
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditingRule(undefined);
    form.resetFields();
  };

  const closeConfigModal = () => {
    closeEditor();
    onClose();
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!rules.length) {
      setSelectedRuleId(undefined);
      return;
    }

    if (!selectedRuleId || !rules.some((rule) => rule.id === selectedRuleId)) {
      setSelectedRuleId(rules[0].id);
    }
  }, [open, rules, selectedRuleId]);

  const saveRule = async () => {
    let values: RuleFormValues;

    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    const objectKeys = values.objectKeys ?? [];
    const objectNames = objectKeys.map((objectKey) => getObjectName(objectKey, records)).filter(Boolean);
    const departmentKeys = getRuleDepartmentKeys(objectKeys);
    const nextRule: PerformanceConfigRule = {
      id: editingRule?.id ?? `rule-${Date.now()}`,
      name: values.name?.trim() || "未命名规则",
      objectKeys,
      objectNames,
      departmentKeys,
      departments: departmentKeys.map(getDepartmentName).filter(Boolean),
      ranks: values.ranks ?? [],
      templateId: values.templateId ?? "",
      flowCode: values.flowCode ?? "direct-manager",
      confirmer: values.confirmer ?? "",
    };

    onRulesChange(
      editingRule
        ? rules.map((rule) => (rule.id === editingRule.id ? nextRule : rule))
        : [nextRule, ...rules],
    );
    setSelectedRuleId(nextRule.id);
    setPeopleTab("matched");
    message.success(editingRule ? "绩效表配置已更新" : "绩效表配置已新增");
    closeEditor();
  };

  const moveRule = (ruleId: string, offset: -1 | 1) => {
    const currentIndex = rules.findIndex((rule) => rule.id === ruleId);
    const targetIndex = currentIndex + offset;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= rules.length) {
      return;
    }

    const nextRules = [...rules];
    const [targetRule] = nextRules.splice(currentIndex, 1);
    nextRules.splice(targetIndex, 0, targetRule);
    onRulesChange(nextRules);
    setSelectedRuleId(ruleId);
    setPeopleTab("matched");
  };

  const deleteRule = (ruleId: string) => {
    const targetRule = rules.find((rule) => rule.id === ruleId);

    setDeleteTargetRule(targetRule);
  };

  const confirmDeleteRule = () => {
    if (!deleteTargetRule) {
      return;
    }

    const nextRules = rules.filter((rule) => rule.id !== deleteTargetRule.id);

    onRulesChange(nextRules);
    setSelectedRuleId((current) => (current === deleteTargetRule.id ? nextRules[0]?.id : current));
    setDeleteTargetRule(undefined);
    message.success("绩效规则已删除");
  };

  const matchedEmployeeRows = useMemo<RuleMatchedEmployee[]>(
    () => records.map((record) => ({ record, rule: getMatchedPerformanceRule(record, rules) })),
    [records, rules],
  );
  const selectedRule = rules.find((rule) => rule.id === selectedRuleId);
  const selectedRuleEmployeeRows = matchedEmployeeRows.filter((row) => row.rule?.id === selectedRuleId);
  const unmatchedEmployeeRows = matchedEmployeeRows.filter((row) => !row.rule);

  const columns: ColumnsType<PerformanceConfigRule> = [
    {
      title: "优先级",
      key: "priority",
      width: 112,
      render: (_value, record, index) => (
        <div className="performance-config-priority-cell">
          <span className="performance-config-rule-priority">P{index + 1}</span>
          <div className="performance-config-priority-actions">
            <Tooltip title="上移">
              <Button
                className="performance-config-priority-action"
                disabled={index === 0}
                icon={<ArrowUp size={13} />}
                type="text"
                onClick={(event) => {
                  event.stopPropagation();
                  moveRule(record.id, -1);
                }}
              />
            </Tooltip>
            <Tooltip title="下移">
              <Button
                className="performance-config-priority-action"
                disabled={index === rules.length - 1}
                icon={<ArrowDown size={13} />}
                type="text"
                onClick={(event) => {
                  event.stopPropagation();
                  moveRule(record.id, 1);
                }}
              />
            </Tooltip>
          </div>
        </div>
      ),
    },
    {
      title: "规则名称",
      dataIndex: "name",
      key: "name",
      width: 130,
      render: (value: string) => renderConfigTextCell(value),
    },
    {
      title: "适用对象",
      key: "objects",
      width: 140,
      render: (_, record) => renderConfigTags(getRuleObjectNames(record)),
    },
    {
      title: "适用职级",
      key: "ranks",
      width: 116,
      render: (_, record) => renderConfigTags(record.ranks),
    },
    {
      title: "绩效表模板",
      key: "templateId",
      width: 140,
      render: (_, record) => renderConfigTextCell(scorecardTemplates.find((template) => template.id === record.templateId)?.name ?? "-"),
    },
    {
      title: "评价流程",
      key: "flowCode",
      width: 122,
      render: (_, record) => renderConfigTextCell(getPerformanceFlowName(record.flowCode)),
    },
    { title: "绩效确认人", dataIndex: "confirmer", key: "confirmer", width: 96, render: (value: string) => renderConfigTextCell(value) },
    {
      title: "操作",
      key: "action",
      width: 86,
      render: (_, record) => (
        <TableActions
          actions={[
            { key: "edit", label: "编辑", onClick: () => openEditor(record) },
            {
              key: "delete",
              label: "删除",
              danger: true,
              onClick: () => deleteRule(record.id),
            },
          ]}
        />
      ),
    },
  ];
  const employeeColumns: ColumnsType<RuleMatchedEmployee> = [
    {
      title: "序号",
      key: "index",
      width: 70,
      align: "center",
      render: (_value, _row, index) => index + 1,
    },
    { title: "姓名", key: "name", width: 120, render: (_, row) => row.record.name },
    { title: "区域", key: "area", width: 120, render: (_, row) => row.record.area },
    { title: "部门", key: "department", width: 140, render: (_, row) => row.record.department },
    { title: "岗位-职级", key: "positionRank", render: (_, row) => `${row.record.position}-${row.record.rank}` },
  ];

  return (
    <>
      <Drawer
        title="绩效表配置"
        open={open}
        onClose={closeConfigModal}
        width={1120}
        extra={(
          <Button type="primary" icon={<Plus size={16} />} onClick={() => openEditor()}>
            新增规则
          </Button>
        )}
      >
        <div className="performance-config-drawer">
          <div className="performance-config-layout">
            <section className="performance-config-list">
              <div className="performance-config-list-header">
                <div className="performance-config-section-title">
                  <strong>配置规则</strong>
                  <span>同一人员匹配多条规则时，适用优先级较高的规则</span>
                </div>
              </div>
              <Table
                columns={columns}
                dataSource={rules}
                pagination={false}
                rowClassName={(record) => (
                  record.id === selectedRuleId && peopleTab === "matched" ? "performance-config-rule-row--active" : "performance-config-rule-row"
                )}
                rowKey="id"
                tableLayout="fixed"
                onRow={(record) => ({
                  onClick: () => {
                    setSelectedRuleId(record.id);
                    setPeopleTab("matched");
                  },
                })}
              />
            </section>
            <section className="performance-config-people">
              <Tabs
                activeKey={peopleTab}
                className="standard-tabs performance-config-people-tabs"
                onChange={(key) => setPeopleTab(key as "matched" | "abnormal")}
                items={[
                  {
                    key: "matched",
                    label: `选中规则人员（${selectedRuleEmployeeRows.length}）`,
                    children: (
                      <div className="performance-config-people-pane">
                        <div className="performance-config-section-title">
                          <span>当前规则：{selectedRule?.name ?? "请选择上方规则"}</span>
                        </div>
                        <Table
                          columns={employeeColumns}
                          dataSource={selectedRuleEmployeeRows}
                          locale={{ emptyText: <Empty description="当前规则暂无适用人员" /> }}
                          pagination={{ pageSize: 5, showSizeChanger: false }}
                          rowKey={(row) => row.record.id}
                        />
                      </div>
                    ),
                  },
                  {
                    key: "abnormal",
                    label: <span className="performance-config-people-tab-danger">异常人员（{unmatchedEmployeeRows.length}）</span>,
                    children: (
                      <div className="performance-config-people-pane">
                        <div className="performance-config-section-title">
                          <span>有绩效薪资但未匹配到任何绩效规则的人员</span>
                        </div>
                        <Table
                          columns={employeeColumns}
                          dataSource={unmatchedEmployeeRows}
                          locale={{ emptyText: <Empty description="暂无异常人员" /> }}
                          pagination={{ pageSize: 5, showSizeChanger: false }}
                          rowKey={(row) => row.record.id}
                        />
                      </div>
                    ),
                  },
                ]}
              />
            </section>
          </div>
        </div>
      </Drawer>
      <Modal
        title={editingRule ? "编辑规则" : "新增规则"}
        open={editorOpen}
        onCancel={closeEditor}
        onOk={saveRule}
        okText={editingRule ? "保存修改" : "新增规则"}
        cancelText="取消"
        destroyOnClose
        width={680}
        zIndex={actionModalZIndex}
      >
        <div className="performance-config-editor-modal">
          <div className="performance-config-section-title">
            <span>选择适用部门和职级后配置模板、流程和确认人</span>
          </div>
          <Form form={form} layout="vertical" className="performance-config-form">
            <Form.Item
              className="performance-config-form-wide"
              name="name"
              label="规则名称"
              rules={[{ required: true, message: "请输入规则名称" }]}
            >
              <Input placeholder="如：运营一线绩效规则" />
            </Form.Item>
            <Form.Item name="objectKeys" label="适用对象" rules={[{ required: true, message: "请选择适用对象" }]}>
              <Select
                mode="multiple"
                optionFilterProp="label"
                placeholder="可选择部门或人员"
                options={objectOptions}
              />
            </Form.Item>
            <Form.Item name="ranks" label="适用职级" rules={[{ required: true, message: "请选择适用职级" }]}>
              <Select
                mode="multiple"
                placeholder="可选择多个当前职级"
                options={performanceRanks.map((item) => ({ value: item, label: item }))}
              />
            </Form.Item>
            <Form.Item name="templateId" label="绩效表模板" rules={[{ required: true, message: "请选择模板" }]}>
              <Select placeholder="选择绩效表模板" options={templateOptions} />
            </Form.Item>
            <Form.Item name="flowCode" label="评价流程" rules={[{ required: true, message: "请选择评价流程" }]}>
              <Select
                optionRender={(option) => {
                  const flow = performanceFlowOptions.find((item) => item.code === option.value);

                  return (
                    <div className="performance-flow-select-option">
                      <strong>{flow?.name ?? option.label}</strong>
                      <span>{flow?.description}</span>
                    </div>
                  );
                }}
                popupClassName="performance-flow-select-dropdown"
                placeholder="选择评价流程"
                options={flowOptions}
              />
            </Form.Item>
            <Form.Item name="confirmer" label="绩效确认人" rules={[{ required: true, message: "请选择绩效确认人" }]}>
              <Select
                placeholder="选择绩效确认人"
                options={performanceConfirmers.map((name) => ({ value: name, label: name }))}
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
      <Modal
        title="删除绩效规则"
        open={Boolean(deleteTargetRule)}
        onCancel={() => setDeleteTargetRule(undefined)}
        onOk={confirmDeleteRule}
        okButtonProps={{ danger: true }}
        okText="删除"
        cancelText="取消"
        destroyOnClose
        zIndex={actionModalZIndex}
      >
        <p>
          确认删除{deleteTargetRule ? `「${deleteTargetRule.name}」` : "该规则"}吗？删除后命中人员会按剩余规则重新匹配。
        </p>
      </Modal>
    </>
  );
}

export function PerformanceManagementPage() {
  const [records, setRecords] = useState<PerformanceRecord[]>(performanceRecords);
  const [rules, setRules] = useState<PerformanceConfigRule[]>(performanceConfigRules);
  const [filters, setFilters] = useState<PerformanceFilterValues>({ period: "2026-05" });
  const [filterForm] = Form.useForm<PerformanceFilterValues>();
  const [treeKeyword, setTreeKeyword] = useState("");
  const [checkedKeys, setCheckedKeys] = useState<Key[]>([]);
  const [onlyMyPending, setOnlyMyPending] = useState(false);
  const [activeStatusView, setActiveStatusView] = useState<StatusViewKey>("all");
  const [configOpen, setConfigOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<PerformanceRecord>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [returnRecord, setReturnRecord] = useState<PerformanceRecord>();
  const [transferRecord, setTransferRecord] = useState<PerformanceRecord>();
  const [actionConfirm, setActionConfirm] = useState<PerformanceActionConfirm>();
  const [returnForm] = Form.useForm<ReturnFormValues>();
  const [transferForm] = Form.useForm<TransferFormValues>();
  const [searchParams] = useSearchParams();

  const updateRecordById = (
    recordId: string,
    updater: (record: PerformanceRecord) => PerformanceRecord,
  ) => {
    setRecords((current) => current.map((item) => (item.id === recordId ? updater(item) : item)));
    setDetailRecord((current) => (current?.id === recordId ? updater(current) : current));
  };

  const visibleRecords = useMemo(() => records.filter(canCurrentUserSee), [records]);
  const treeData = useMemo(
    () => buildPerformanceTree(filterDepartmentTree(performanceDepartmentNodes, treeKeyword), visibleRecords),
    [treeKeyword, visibleRecords],
  );

  const statusCountRecords = useMemo(() => {
    const scopedRecords = getCheckedRecordScope(visibleRecords, checkedKeys);
    const keyword = filters.keyword?.trim().toLowerCase();

    return scopedRecords.filter((record) => {
      const matchedKeyword = keyword
        ? [record.name, record.employeeNo]
            .join(" ")
            .toLowerCase()
            .includes(keyword)
        : true;
      const matchedPosition = !filters.positions?.length || filters.positions.includes(record.position);
      const matchedRank = !filters.ranks?.length || filters.ranks.includes(record.rank);

      return (
        matchedKeyword &&
        matchedPosition &&
        matchedRank &&
        (!filters.period || record.period === filters.period) &&
        (!onlyMyPending || isActionableRecord(record))
      );
    });
  }, [checkedKeys, filters, onlyMyPending, visibleRecords]);

  const statusViewCounts = useMemo(() => {
    return statusViewOptions.reduce<Record<string, number>>((result, option) => {
      result[option.key] = option.statuses
        ? statusCountRecords.filter((record) => option.statuses?.includes(record.status)).length
        : statusCountRecords.length;
      return result;
    }, {});
  }, [statusCountRecords]);

  const transferUserOptions = useMemo(() => {
    const names = [
      ...performanceConfirmers,
      ...records.flatMap((record) => [record.name, record.directManager, record.currentHandler, record.confirmer]),
    ].filter((name): name is string => Boolean(name));

    return Array.from(new Set(names)).map((name) => ({ value: name, label: name }));
  }, [records]);

  const positionOptions = useMemo(() => {
    return Array.from(new Set(visibleRecords.map((record) => record.position)))
      .filter(Boolean)
      .map((position) => ({ value: position, label: position }));
  }, [visibleRecords]);

  const myPendingCount = useMemo(() => visibleRecords.filter(isActionableRecord).length, [visibleRecords]);

  const filteredRecords = useMemo(() => {
    const scopedRecords = getCheckedRecordScope(visibleRecords, checkedKeys);
    const keyword = filters.keyword?.trim().toLowerCase();
    const activeStatusOption = statusViewOptions.find((option) => option.key === activeStatusView);

    return scopedRecords.filter((record) => {
      const matchedKeyword = keyword
        ? [record.name, record.employeeNo]
            .join(" ")
            .toLowerCase()
            .includes(keyword)
        : true;
      const matchedPosition = !filters.positions?.length || filters.positions.includes(record.position);
      const matchedRank = !filters.ranks?.length || filters.ranks.includes(record.rank);
      const matchedStatusView = activeStatusOption?.statuses
        ? activeStatusOption.statuses.includes(record.status)
        : true;

      return (
        matchedKeyword &&
        matchedPosition &&
        matchedRank &&
        matchedStatusView &&
        (!filters.period || record.period === filters.period) &&
        (!onlyMyPending || isActionableRecord(record))
      );
    });
  }, [activeStatusView, checkedKeys, filters, onlyMyPending, visibleRecords]);

  useEffect(() => {
    const recordId = searchParams.get("record");
    const target = records.find((record) => record.id === recordId);

    if (target) {
      setDetailRecord(target);
    }
  }, [records, searchParams]);

  const openDetail = (record: PerformanceRecord) => {
    setDetailRecord(record);
  };

  const submitSelfEvaluation = (record: PerformanceRecord) => {
    if (!canCurrentUserSelfEvaluate(record)) {
      Modal.warning({
        title: "暂无自评权限",
        content: "只有员工本人在待员工自评状态下，才可以提交自评。",
      });
      return;
    }

    setActionConfirm({
      title: "提交绩效自评",
      content: `提交 ${record.period} 绩效自评后，将流转给 ${record.directManager} 评价，列表状态更新为待上级评价。`,
      okText: "提交",
      onOk: () => {
        updateRecordById(record.id, (item) => ({
          ...item,
          status: "待上级评价",
          currentHandler: item.directManager,
          submittedAt: "2026-05-07 10:10",
          selfSubmitted: true,
        }));
        setDetailRecord(undefined);
        setActionConfirm(undefined);
        message.success("自评已提交，列表状态已更新为待上级评价");
      },
    });
  };

  const submitReview = (record: PerformanceRecord) => {
    if (!canCurrentUserReview(record)) {
      Modal.warning({
        title: "暂无评价权限",
        content: "只有当前评价流程处理人，且状态为待上级评价时，才可以提交评价。",
      });
      return;
    }

    setActionConfirm({
      title: "提交绩效评价",
      content: `提交 ${record.name} / ${record.period} 的评价后，将流转给绩效确认人 ${record.confirmer ?? "未配置"}，列表状态更新为待绩效确认。`,
      okText: "提交评价",
      onOk: () => {
        updateRecordById(record.id, (item) => ({
          ...item,
          status: "待绩效确认",
          currentHandler: item.confirmer ?? "管理员",
          score: item.score ?? 82,
        }));
        setDetailRecord(undefined);
        setActionConfirm(undefined);
        message.success("评价已提交，列表状态已更新为待绩效确认");
      },
    });
  };

  const openReturnDialog = (record: PerformanceRecord) => {
    returnForm.resetFields();
    setReturnRecord(record);
  };

  const submitReturnToSelfEvaluation = async () => {
    if (!returnRecord) {
      return;
    }

    await returnForm.validateFields();
    updateRecordById(returnRecord.id, (item) => ({
      ...item,
      status: "待员工自评",
      currentHandler: item.name,
      selfSubmitted: false,
    }));
    setReturnRecord(undefined);
    setDetailRecord(undefined);
    returnForm.resetFields();
    message.success("已退回员工自评，列表状态已更新为待员工自评");
  };

  const openTransferDialog = (record: PerformanceRecord) => {
    transferForm.setFieldsValue({ handler: undefined });
    setTransferRecord(record);
  };

  const submitTransferReview = async () => {
    if (!transferRecord) {
      return;
    }

    const values = await transferForm.validateFields();
    const nextHandler = values.handler ?? transferRecord.currentHandler ?? "王越";

    updateRecordById(transferRecord.id, (item) => ({
      ...item,
      currentHandler: nextHandler,
    }));
    setTransferRecord(undefined);
    setDetailRecord(undefined);
    transferForm.resetFields();
    message.success(`已转派给${nextHandler}处理，列表当前处理人已更新`);
  };

  const confirmRecord = (record: PerformanceRecord) => {
    if (!canCurrentUserConfirm(record)) {
      Modal.warning({
        title: "暂无确认权限",
        content: "只有该绩效表的绩效确认人，且状态为待绩效确认时，才可以执行确认操作。",
      });
      return;
    }

    setActionConfirm({
      title: "提交绩效确认",
      content: `提交 ${record.name} / ${record.period} 的绩效确认吗？提交后列表状态更新为已确认。`,
      okText: "提交",
      onOk: () => {
        updateRecordById(record.id, (item) => ({
          ...item,
          status: "已确认",
          currentHandler: undefined,
          confirmedAt: "2026-05-07 10:30",
          modified: false,
        }));
        setDetailRecord(undefined);
        setActionConfirm(undefined);
        message.success("绩效确认已提交，列表状态已更新为已确认");
      },
    });
  };

  const savePerformanceModification = (record: PerformanceRecord) => {
    const shouldReturnToConfirmation = record.status === "已确认";

    setActionConfirm({
      title: "保存绩效修改",
      content: shouldReturnToConfirmation
        ? `保存 ${record.name} / ${record.period} 的绩效修改后，列表状态会从已确认退回待绩效确认。确认保存吗？`
        : `保存 ${record.name} / ${record.period} 的绩效修改吗？保存后列表仍保持待绩效确认。`,
      okText: "保存",
      onOk: () => {
        updateRecordById(record.id, (item) => ({
          ...item,
          status: shouldReturnToConfirmation ? "待绩效确认" : item.status,
          currentHandler: shouldReturnToConfirmation ? item.confirmer ?? "管理员" : item.currentHandler,
          confirmedAt: shouldReturnToConfirmation ? undefined : item.confirmedAt,
          modified: item.status === "待绩效确认" || shouldReturnToConfirmation,
        }));
        setDetailRecord(undefined);
        setActionConfirm(undefined);
        message.success(
          shouldReturnToConfirmation
            ? "绩效修改已保存，列表状态已退回待绩效确认"
            : "绩效修改已保存，列表状态已同步更新",
        );
      },
    });
  };

  const batchConfirmRecords = () => {
    if (!selectedRowKeys.length) {
      Modal.info({
        title: "请选择绩效数据",
        content: "请先勾选需要批量确认的绩效数据。",
      });
      return;
    }

    const selectedKeySet = new Set(selectedRowKeys.map(String));
    const confirmableRecords = filteredRecords.filter(
      (record) => selectedKeySet.has(record.id) && canCurrentUserConfirm(record),
    );

    if (!confirmableRecords.length) {
      Modal.info({
        title: "暂无可确认绩效",
        content: "请选择状态为待绩效确认，且当前用户为绩效确认人的数据。",
      });
      return;
    }

    setActionConfirm({
      title: "批量确认绩效",
      content: `确认所选 ${confirmableRecords.length} 条绩效数据吗？确认后列表状态更新为已确认。`,
      okText: "确认",
      onOk: () => {
        const confirmableIds = new Set(confirmableRecords.map((record) => record.id));

        setRecords((current) =>
          current.map((record) =>
            confirmableIds.has(record.id)
              ? {
                  ...record,
                  status: "已确认",
                  currentHandler: undefined,
                  confirmedAt: "2026-05-08 10:30",
                  modified: false,
                }
              : record,
          ),
        );
        setDetailRecord((current) =>
          current && confirmableIds.has(current.id)
            ? undefined
            : current,
        );
        setSelectedRowKeys([]);
        setActionConfirm(undefined);
        message.success("已批量确认绩效，列表状态已更新为已确认");
      },
    });
  };

  const getDetailActions = (record: PerformanceRecord) => {
    const actions: Array<{
      key: "save" | "submit" | "confirm" | "return" | "transfer";
      label: "保存修改" | "提交" | "提交确认" | "退回" | "转派";
      danger?: boolean;
      onClick: (target: PerformanceRecord) => void;
    }> = [];

    if (record.status === "待绩效确认" || record.status === "已确认") {
      actions.push({
        key: "save",
        label: "保存修改",
        onClick: savePerformanceModification,
      });
    }

    if (canCurrentUserSelfEvaluate(record) || canCurrentUserReview(record)) {
      actions.push({
        key: "submit",
        label: "提交",
        onClick: (target) => {
          if (canCurrentUserSelfEvaluate(target)) {
            submitSelfEvaluation(target);
            return;
          }

          if (canCurrentUserReview(target)) {
            submitReview(target);
            return;
          }
        },
      });
    }

    if (canCurrentUserConfirm(record)) {
      actions.push({
        key: "confirm",
        label: "提交确认",
        onClick: confirmRecord,
      });
    }

    if (canCurrentUserReview(record)) {
      actions.push(
        { key: "return", label: "退回", danger: true, onClick: openReturnDialog },
        { key: "transfer", label: "转派", onClick: openTransferDialog },
      );
    }

    return actions;
  };

  const columns: ColumnsType<PerformanceRecord> = [
    {
      title: "序号",
      key: "index",
      width: 70,
      fixed: "left",
      align: "center",
      render: (_value, _record, index) => index + 1,
    },
    {
      title: "姓名",
      dataIndex: "name",
      key: "name",
      width: 120,
      fixed: "left",
      render: (name: string, record) => (
        <span className="performance-name-cell">
          <span>{name}</span>
          {shouldShowModifiedBadge(record) ? <span className="performance-modified-badge">改</span> : null}
        </span>
      ),
    },
    { title: "工号", dataIndex: "employeeNo", key: "employeeNo", width: 110 },
    { title: "部门", dataIndex: "department", key: "department", width: 130 },
    { title: "岗位职级", key: "positionRank", width: 150, render: (_, record) => `${record.position}-${record.rank}` },
    { title: "考核周期", dataIndex: "period", key: "period", width: 110 },
    { title: "考核表", dataIndex: "templateName", key: "templateName", width: 190, render: (value: string) => value ?? "-" },
    { title: "评价流程", key: "flow", width: 150, render: (_, record) => getPerformanceFlowName(record.flowCode) },
    {
      title: "绩效得分",
      key: "score",
      width: 110,
      align: "right",
      render: (_, record) => (
        shouldShowPerformanceScore(record) ? (
          <span className="performance-score-cell">{formatPerformanceScore(record.score)}</span>
        ) : "-"
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status: PerformanceStatus) => <Tag color={statusColor[status]}>{status}</Tag>,
    },
    { title: "当前处理人", dataIndex: "currentHandler", key: "currentHandler", width: 120, render: (value: string) => (value === "系统" ? "" : value ?? "") },
    {
      title: "操作",
      key: "action",
      width: 100,
      fixed: "right",
      render: (_, record) => (
        <TableActions actions={[{ key: "detail", label: "详情", onClick: () => openDetail(record) }]} />
      ),
    },
  ];

  return (
    <main className="page performance-management-page">
      <section className="performance-status-views" aria-label="绩效状态视图">
        {statusViewOptions.map((option) => (
          <button
            className={activeStatusView === option.key ? "performance-status-card performance-status-card--active" : "performance-status-card"}
            key={option.key}
            type="button"
            onClick={() => setActiveStatusView(option.key)}
          >
            <span>{statusViewCounts[option.key] ?? 0}</span>
            <strong>{option.label}</strong>
          </button>
        ))}
      </section>
      <TreeListLayout
        sidebarWidth={300}
        tree={
          <SectionPanel>
            <Input.Search
              allowClear
              className="tree-list-search"
              placeholder="搜索部门"
              value={treeKeyword}
              onChange={(event) => setTreeKeyword(event.target.value)}
              onSearch={setTreeKeyword}
            />
            <Tree
              blockNode
              checkable
              defaultExpandAll
              checkedKeys={checkedKeys}
              treeData={treeData}
              onCheck={(keys) => {
                const nextKeys = Array.isArray(keys) ? keys : keys.checked;
                setCheckedKeys(nextKeys);
              }}
            />
          </SectionPanel>
        }
      >
        <section className="filter-panel standard-list-filter" aria-label="绩效管理筛选区">
          <Form
            form={filterForm}
            layout="inline"
            initialValues={{ period: "2026-05" }}
            onFinish={(values) => setFilters(values)}
          >
            <Form.Item name="keyword">
              <Input allowClear placeholder="姓名、工号" className="standard-list-filter__keyword" />
            </Form.Item>
            <Form.Item name="period">
              <Select
                allowClear
                placeholder="考核周期"
                style={{ width: 130 }}
                options={["2026-05", "2026-04"].map((item) => ({ value: item, label: item }))}
              />
            </Form.Item>
            <Form.Item name="positions">
              <Select
                allowClear
                mode="multiple"
                maxTagCount="responsive"
                placeholder="岗位"
                style={{ width: 180 }}
                options={positionOptions}
              />
            </Form.Item>
            <Form.Item name="ranks">
              <Select
                allowClear
                mode="multiple"
                maxTagCount="responsive"
                placeholder="职级"
                style={{ width: 160 }}
                options={performanceRanks.map((item) => ({ value: item, label: item }))}
              />
            </Form.Item>
            <Form.Item className="standard-list-filter__actions">
              <div className="standard-list-filter__action-row">
                <Space wrap className="standard-list-filter__query-actions">
                  <Space className="performance-pending-switch">
                    <Switch checked={onlyMyPending} onChange={setOnlyMyPending} />
                    <span>待我处理（{myPendingCount}）</span>
                  </Space>
                  <Button htmlType="submit" type="primary" icon={<Filter size={16} />}>
                    查询
                  </Button>
                  <Button
                    icon={<RotateCcw size={16} />}
                    onClick={() => {
                      filterForm.resetFields();
                      setFilters({ period: "2026-05" });
                      setActiveStatusView("all");
                      setOnlyMyPending(false);
                    }}
                  >
                    重置
                  </Button>
                </Space>
                <Space wrap className="standard-list-filter__business-actions">
                  <Button className="standard-list-filter__create-action" icon={<CheckCheck size={16} />} onClick={batchConfirmRecords}>
                    批量确认绩效
                  </Button>
                  <Button className="standard-list-filter__utility-action" icon={<FileCog size={16} />} onClick={() => setConfigOpen(true)}>
                    绩效表配置
                  </Button>
                </Space>
              </div>
            </Form.Item>
          </Form>
        </section>
        <SectionPanel>
          <Table
            columns={columns}
            dataSource={filteredRecords}
            locale={{ emptyText: <Empty description="暂无绩效数据" /> }}
            pagination={{ current: 1, pageSize: 10, total: filteredRecords.length, showSizeChanger: true }}
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
              getCheckboxProps: (record) => ({
                disabled: !canCurrentUserConfirm(record),
              }),
            }}
            rowKey="id"
            scroll={{ x: 1600 }}
          />
        </SectionPanel>
      </TreeListLayout>
      <ConfigDrawer
        open={configOpen}
        records={records}
        rules={rules}
        onClose={() => setConfigOpen(false)}
        onRulesChange={setRules}
      />
      <PerformanceDetailDrawer actions={getDetailActions} record={detailRecord} onClose={() => setDetailRecord(undefined)} />
      <Modal
        title={actionConfirm?.title}
        open={Boolean(actionConfirm)}
        onCancel={() => setActionConfirm(undefined)}
        onOk={actionConfirm?.onOk}
        okText={actionConfirm?.okText}
        destroyOnClose
        zIndex={actionModalZIndex}
      >
        <p>{actionConfirm?.content}</p>
      </Modal>
      <Modal
        title="退回员工自评"
        open={Boolean(returnRecord)}
        onCancel={() => {
          setReturnRecord(undefined);
          returnForm.resetFields();
        }}
        onOk={submitReturnToSelfEvaluation}
        okText="退回"
        okButtonProps={{ danger: true }}
        destroyOnClose
        zIndex={actionModalZIndex}
      >
        <Form form={returnForm} layout="vertical">
          <Form.Item
            label="退回原因"
            name="reason"
            rules={[{ required: true, message: "请填写退回原因" }]}
          >
            <Input.TextArea rows={4} placeholder="请说明需要员工重新修改自评的原因" />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="转派评价处理人"
        open={Boolean(transferRecord)}
        onCancel={() => {
          setTransferRecord(undefined);
          transferForm.resetFields();
        }}
        onOk={submitTransferReview}
        okText="转派"
        destroyOnClose
        zIndex={actionModalZIndex}
      >
        <Form form={transferForm} layout="vertical">
          <Form.Item
            label="新的处理人"
            name="handler"
            rules={[{ required: true, message: "请选择新的处理人" }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="请选择人员"
              options={transferUserOptions}
            />
          </Form.Item>
        </Form>
      </Modal>
    </main>
  );
}
