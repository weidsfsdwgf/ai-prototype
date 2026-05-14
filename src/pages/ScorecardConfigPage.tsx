import {
  Alert,
  Button,
  Checkbox,
  Collapse,
  DatePicker,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  message,
} from "antd";
import type { FormInstance } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs, { type Dayjs } from "dayjs";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  Filter,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { SectionPanel } from "../components/SectionPanel";
import { ScorecardScoringDrawer } from "../components/ScorecardScoringDrawer";
import { TableActions } from "../components/TableActions";
import {
  scorecardOwnerUsers,
  scorecardStatusOptions,
  scorecardSystemFieldCatalog,
  scorecardTemplates,
  type ScorecardCustomField,
  type ScorecardDimension,
  type ScorecardItem,
  type ScorecardRater,
  type ScorecardStandard,
  type ScorecardTemplate,
  type ScorecardTemplateStatus,
} from "../data/scorecardConfig";
import { metricLibraryItems, type MetricLibraryItem } from "../data/metricLibrary";
import "./Page.css";
import "./ScorecardConfigPage.css";
import "./standards/Standards.css";

type FilterValues = {
  keyword?: string;
  status?: ScorecardTemplateStatus;
  owner?: string;
  updatedAt?: [Dayjs, Dayjs];
};

type ScorecardFormValues = {
  name?: string;
  owner?: string;
  description?: string;
  systemFields?: string[];
  customFields?: Array<Partial<ScorecardCustomField>>;
  raters?: Array<Partial<ScorecardRater>>;
  dimensions?: Array<Partial<ScorecardDimension>>;
};

type MetricLibraryFilterValues = {
  keyword?: string;
  category?: string;
};

const statusColor: Record<ScorecardTemplateStatus, string> = {
  草稿中: "gold",
  启用中: "green",
  已停用: "default",
};

const defaultDimensionValue = {
  name: "新考核维度",
  items: [
    {
      name: "新考核事项",
      standards: [{ description: "评分标准说明", score: 10 }],
    },
  ],
};

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function getNextVersion(version?: string) {
  const matched = version?.match(/^V(\d+)\.(\d+)$/);

  if (!matched) {
    return "V0.1";
  }

  return `V${matched[1]}.${Number(matched[2]) + 1}`;
}

function generateTemplateCode(templates: ScorecardTemplate[]) {
  const prefix = `SCORE-${dayjs().format("YYYYMMDD")}`;
  const maxSerial = templates.reduce((maxValue, template) => {
    if (!template.code.startsWith(prefix)) {
      return maxValue;
    }

    const serial = Number(template.code.slice(prefix.length + 1));
    return Number.isFinite(serial) ? Math.max(maxValue, serial) : maxValue;
  }, 0);

  return `${prefix}-${String(maxSerial + 1).padStart(3, "0")}`;
}

function getItemMaxScore(item: ScorecardItem) {
  return item.standards.reduce((maxScore, standard) => Math.max(maxScore, standard.score), 0);
}

function getDimensionScore(dimension: ScorecardDimension) {
  return dimension.items.reduce((sum, item) => sum + getItemMaxScore(item), 0);
}

function getTemplateScore(template: ScorecardTemplate) {
  return template.dimensions.reduce((sum, dimension) => sum + getDimensionScore(dimension), 0);
}

function getMetricScoreTotal(metric: MetricLibraryItem) {
  return metric.standards.reduce((totalScore, standard) => totalScore + standard.score, 0);
}

function getEnabledFieldCount(template: ScorecardTemplate) {
  return template.systemFields.filter((field) => field.enabled).length + template.customFields.length;
}

function getValidationMessages(template: ScorecardTemplate, templates: ScorecardTemplate[]) {
  const warnings: string[] = [];

  if (!template.name.trim()) {
    warnings.push("评分表名称不能为空。");
  }

  if (template.code && templates.some((item) => item.id !== template.id && item.code === template.code)) {
    warnings.push("评分表编码必须保持唯一。");
  }

  if (template.raters.length < 1) {
    warnings.push("至少配置一个评分人。");
  }

  if (template.raters.length > 5) {
    warnings.push("评分人最多支持五个。");
  }

  if (template.dimensions.length < 1) {
    warnings.push("至少配置一个考核维度。");
  }

  template.customFields.forEach((field, index) => {
    if (field.required && !field.name.trim()) {
      warnings.push(`第 ${index + 1} 个必填自定义字段缺少字段名称。`);
    }
  });

  template.dimensions.forEach((dimension, dimensionIndex) => {
    if (!dimension.name.trim()) {
      warnings.push(`第 ${dimensionIndex + 1} 个考核维度缺少名称。`);
    }

    if (dimension.items.length < 1) {
      warnings.push(`${dimension.name || `第 ${dimensionIndex + 1} 个考核维度`} 至少包含一个考核事项。`);
    }

    dimension.items.forEach((item, itemIndex) => {
      if (!item.name.trim()) {
        warnings.push(`${dimension.name || `第 ${dimensionIndex + 1} 个考核维度`} 的第 ${itemIndex + 1} 个事项缺少名称。`);
      }

      if (item.standards.length < 1) {
        warnings.push(`${item.name || `第 ${itemIndex + 1} 个考核事项`} 至少包含一个评分标准。`);
      }

      item.standards.forEach((standard, standardIndex) => {
        if (!standard.description.trim()) {
          warnings.push(`${item.name || `第 ${itemIndex + 1} 个考核事项`} 的第 ${standardIndex + 1} 条标准缺少描述。`);
        }

        if (!Number.isFinite(standard.score) || standard.score < 0) {
          warnings.push(`${item.name || `第 ${itemIndex + 1} 个考核事项`} 的第 ${standardIndex + 1} 条标准分值必须为非负数字。`);
        }
      });
    });
  });

  return warnings;
}

function toFormValues(template: ScorecardTemplate): ScorecardFormValues {
  return {
    name: template.name,
    owner: template.owner,
    description: template.description,
    systemFields: template.systemFields.map((field) => field.key),
    customFields: template.customFields,
    raters: template.raters,
    dimensions: template.dimensions,
  };
}

function normalizeStandards(standards?: Array<Partial<ScorecardStandard>>) {
  return (standards ?? [])
    .filter((standard) => standard.description?.trim() || standard.score !== undefined)
    .map((standard) => ({
      id: standard.id ?? createId("standard"),
      description: standard.description?.trim() ?? "",
      score: Number(standard.score ?? 0),
    }));
}

function normalizeItems(items?: Array<Partial<ScorecardItem>>) {
  return (items ?? [])
    .filter((item) => item.name?.trim() || (item.standards?.length ?? 0) > 0)
    .map((item) => ({
      id: item.id ?? createId("item"),
      metricId: item.metricId,
      name: item.name?.trim() ?? "",
      standards: normalizeStandards(item.standards),
    }));
}

function normalizeTemplate(
  values: ScorecardFormValues,
  source?: ScorecardTemplate,
  options: { updateVersion?: boolean } = { updateVersion: true },
): ScorecardTemplate {
  const selectedSystemFieldKeys = values.systemFields ?? [];

  return {
    id: source?.id ?? createId("scorecard"),
    name: values.name?.trim() ?? "",
    code: source?.code ?? "",
    status: source?.status ?? "草稿中",
    owner: values.owner?.trim() ?? "",
    version: options.updateVersion === false ? (source?.version ?? "V0.1") : source ? getNextVersion(source.version) : "V0.1",
    updatedAt: dayjs().format("YYYY-MM-DD"),
    description: values.description?.trim() ?? "",
    systemFields: selectedSystemFieldKeys
      .map((key) => scorecardSystemFieldCatalog.find((field) => field.key === key))
      .filter((field): field is (typeof scorecardSystemFieldCatalog)[number] => Boolean(field))
      .map((field) => ({ ...field, enabled: true })),
    customFields: (values.customFields ?? [])
      .filter((field) => field.name?.trim() || field.placeholder?.trim())
      .map((field) => ({
        id: field.id ?? createId("custom-field"),
        name: field.name?.trim() ?? "",
        placeholder: field.placeholder?.trim() ?? "",
        required: Boolean(field.required),
      })),
    raters: (values.raters ?? [])
      .filter((rater) => rater.name?.trim())
      .slice(0, 5)
      .map((rater) => ({
        id: rater.id ?? createId("rater"),
        name: rater.name?.trim() ?? "",
        weight: rater.weight === undefined ? undefined : Number(rater.weight),
      })),
    dimensions: (values.dimensions ?? [])
      .filter((dimension) => dimension.name?.trim() || (dimension.items?.length ?? 0) > 0)
      .map((dimension) => ({
        id: dimension.id ?? createId("dimension"),
        name: dimension.name?.trim() ?? "",
        items: normalizeItems(dimension.items),
      })),
  };
}

function SystemFieldSelector({ form }: { form: FormInstance<ScorecardFormValues> }) {
  const [keyword, setKeyword] = useState("");
  const selectedKeys = Form.useWatch("systemFields", form) ?? [];
  const selectedKeySet = new Set(selectedKeys);
  const filteredFields = scorecardSystemFieldCatalog.filter((field) =>
    [field.label, field.key, field.source].join(" ").toLowerCase().includes(keyword.trim().toLowerCase()),
  );
  const selectedFields = selectedKeys
    .map((key) => scorecardSystemFieldCatalog.find((field) => field.key === key))
    .filter((field): field is (typeof scorecardSystemFieldCatalog)[number] => Boolean(field));

  const updateSelectedKeys = (nextKeys: string[]) => {
    form.setFieldValue("systemFields", nextKeys);
  };

  const toggleField = (key: string) => {
    updateSelectedKeys(
      selectedKeySet.has(key) ? selectedKeys.filter((item) => item !== key) : [...selectedKeys, key],
    );
  };

  const moveField = (key: string, direction: -1 | 1) => {
    const currentIndex = selectedKeys.indexOf(key);
    const nextIndex = currentIndex + direction;

    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= selectedKeys.length) {
      return;
    }

    const nextKeys = [...selectedKeys];
    const [targetKey] = nextKeys.splice(currentIndex, 1);
    nextKeys.splice(nextIndex, 0, targetKey);
    updateSelectedKeys(nextKeys);
  };

  return (
    <div className="scorecard-system-field-selector">
      <Form.Item hidden name="systemFields">
        <Select mode="multiple" />
      </Form.Item>
      <div className="scorecard-system-field-selector__available">
        <Input.Search allowClear placeholder="搜索系统字段、来源或字段 key" onChange={(event) => setKeyword(event.target.value)} />
        <div className="scorecard-system-field-list">
          {filteredFields.map((field) => (
            <button
              className={selectedKeySet.has(field.key) ? "scorecard-system-field-option scorecard-system-field-option--selected" : "scorecard-system-field-option"}
              key={field.key}
              onClick={() => toggleField(field.key)}
              type="button"
            >
              <Checkbox checked={selectedKeySet.has(field.key)} />
              <span>
                <strong>{field.label}</strong>
                <small>{field.source} · {field.key}</small>
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="scorecard-system-field-selector__selected">
        <div className="scorecard-system-field-selector__title">
          <strong>已选字段排序</strong>
          <span>{selectedFields.length} 个</span>
        </div>
        <div className="scorecard-selected-field-list">
          {selectedFields.map((field, index) => (
            <div className="scorecard-selected-field-row" key={field.key}>
              <span className="scorecard-selected-field-row__index">{index + 1}</span>
              <span className="scorecard-selected-field-row__name">
                <strong>{field.label}</strong>
                <small>{field.source}</small>
              </span>
              <Space size={4}>
                <Button aria-label="上移字段" disabled={index === 0} icon={<ArrowUp size={14} />} onClick={() => moveField(field.key, -1)} />
                <Button
                  aria-label="下移字段"
                  disabled={index === selectedFields.length - 1}
                  icon={<ArrowDown size={14} />}
                  onClick={() => moveField(field.key, 1)}
                />
                <Button danger aria-label="移除字段" icon={<Trash2 size={14} />} onClick={() => toggleField(field.key)} />
              </Space>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ScorecardConfigPage() {
  const [templates, setTemplates] = useState<ScorecardTemplate[]>(scorecardTemplates);
  const [filters, setFilters] = useState<FilterValues>({});
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(scorecardTemplates[0]?.id);
  const [editingTemplate, setEditingTemplate] = useState<ScorecardTemplate>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scoringTemplate, setScoringTemplate] = useState<ScorecardTemplate>();
  const [metricSelectorOpen, setMetricSelectorOpen] = useState(false);
  const [selectedMetricIds, setSelectedMetricIds] = useState<string[]>([]);
  const [metricLibraryFilters, setMetricLibraryFilters] = useState<MetricLibraryFilterValues>({});
  const [metricTargetDimensionIndex, setMetricTargetDimensionIndex] = useState<number>();
  const [form] = Form.useForm<ScorecardFormValues>();
  const [filterForm] = Form.useForm<FilterValues>();
  const [metricFilterForm] = Form.useForm<MetricLibraryFilterValues>();

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) ?? templates[0],
    [selectedTemplateId, templates],
  );
  const editingDimensions = Form.useWatch("dimensions", form) ?? [];
  const existingMetricIds = useMemo(
    () =>
      new Set(
        editingDimensions.flatMap((dimension) =>
          (dimension.items ?? []).map((item) => item.metricId).filter((metricId): metricId is string => Boolean(metricId)),
        ),
      ),
    [editingDimensions],
  );

  const ownerOptions = useMemo(
    () => scorecardOwnerUsers.map((user) => ({ value: user.name, label: `${user.name}（${user.department}）` })),
    [],
  );
  const metricCategoryOptions = useMemo(
    () => Array.from(new Set(metricLibraryItems.map((metric) => metric.category))).map((item) => ({ value: item, label: item })),
    [],
  );

  const filteredTemplates = useMemo(
    () =>
      templates.filter((template) => {
        const keyword = filters.keyword?.trim().toLowerCase();
        const matchedKeyword = keyword
          ? [template.name, template.code, template.owner, template.description]
              .join(" ")
              .toLowerCase()
              .includes(keyword)
          : true;
        const matchedUpdatedAt = filters.updatedAt
          ? dayjs(template.updatedAt).isSame(filters.updatedAt[0], "day") ||
            dayjs(template.updatedAt).isSame(filters.updatedAt[1], "day") ||
            (dayjs(template.updatedAt).isAfter(filters.updatedAt[0], "day") &&
              dayjs(template.updatedAt).isBefore(filters.updatedAt[1], "day"))
          : true;

        return (
          matchedKeyword &&
          (!filters.status || template.status === filters.status) &&
          (!filters.owner || template.owner === filters.owner) &&
          matchedUpdatedAt
        );
      }),
    [filters, templates],
  );

  const filteredLibraryMetrics = useMemo(
    () =>
      metricLibraryItems.filter((metric) => {
        const keyword = metricLibraryFilters.keyword?.trim().toLowerCase();
        const matchedKeyword = keyword
          ? [metric.code, metric.name, metric.description].join(" ").toLowerCase().includes(keyword)
          : true;

        return metric.status === "启用中" && matchedKeyword && (!metricLibraryFilters.category || metric.category === metricLibraryFilters.category);
      }),
    [metricLibraryFilters],
  );

  const updateTemplateStatus = (template: ScorecardTemplate, status: ScorecardTemplateStatus) => {
    if (status === "启用中") {
      const warnings = getValidationMessages(template, templates);

      if (warnings.length > 0) {
        Modal.warning({
          title: "模板暂不能发布",
          content: (
            <ul className="scorecard-validation-list">
              {warnings.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ),
        });
        return;
      }
    }

    setTemplates((currentTemplates) =>
      currentTemplates.map((item) =>
        item.id === template.id
          ? {
              ...item,
              code: status === "启用中" && !item.code ? generateTemplateCode(currentTemplates) : item.code,
              status,
              updatedAt: dayjs().format("YYYY-MM-DD"),
            }
          : item,
      ),
    );
    setSelectedTemplateId(template.id);
    message.success(status === "启用中" ? "模板已发布启用" : "模板状态已更新");
  };

  const openEditor = (template?: ScorecardTemplate) => {
    setEditingTemplate(template);
    setDrawerOpen(true);
    setSelectedMetricIds([]);
    form.resetFields();
    form.setFieldsValue(
      template
        ? toFormValues(template)
        : {
            systemFields: scorecardSystemFieldCatalog.slice(0, 4).map((field) => field.key),
            customFields: [{ name: "", placeholder: "", required: false }],
            raters: [{ name: "主评", weight: 100 }],
            dimensions: [defaultDimensionValue],
          },
    );
  };

  const openMetricSelector = (dimensionIndex: number) => {
    setSelectedMetricIds([]);
    setMetricLibraryFilters({});
    setMetricTargetDimensionIndex(dimensionIndex);
    metricFilterForm.resetFields();
    setMetricSelectorOpen(true);
  };

  const appendMetricsToCurrentTemplate = () => {
    const selectedMetrics = metricLibraryItems.filter((metric) => selectedMetricIds.includes(metric.id));

    if (selectedMetrics.length === 0) {
      message.warning("请先选择需要加入评分表的指标");
      return;
    }

    const currentDimensions = (form.getFieldValue("dimensions") ?? []) as Array<Partial<ScorecardDimension>>;
    const nextDimensions = currentDimensions.map((dimension) => ({
      ...dimension,
      items: [...(dimension.items ?? [])],
    }));
    const targetDimension = metricTargetDimensionIndex === undefined ? undefined : nextDimensions[metricTargetDimensionIndex];

    if (!targetDimension) {
      message.warning("请先选择需要加入指标的考核维度");
      return;
    }

    selectedMetrics.forEach((metric) => {
      targetDimension.items = [
        ...(targetDimension.items ?? []),
        {
          id: createId("item"),
          metricId: metric.id,
          name: metric.name,
          standards: metric.standards.map((standard) => ({
            id: createId("standard"),
            description: standard.description,
            score: standard.score,
          })),
        },
      ];
    });

    form.setFieldValue("dimensions", nextDimensions);
    setMetricSelectorOpen(false);
    setMetricTargetDimensionIndex(undefined);
    setSelectedMetricIds([]);
    message.success(`已加入 ${selectedMetrics.length} 个指标`);
  };

  const handleEditorFinish = (values: ScorecardFormValues) => {
    const normalizedTemplate = normalizeTemplate(values, editingTemplate);
    const warnings = getValidationMessages(normalizedTemplate, templates);

    if (normalizedTemplate.status === "启用中" && warnings.length > 0) {
      Modal.warning({
        title: "模板暂不能保存为启用中",
        content: (
          <ul className="scorecard-validation-list">
            {warnings.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ),
      });
      return;
    }

    const savedTemplate =
      normalizedTemplate.status === "启用中" && !normalizedTemplate.code
        ? { ...normalizedTemplate, code: generateTemplateCode(templates) }
        : normalizedTemplate;

    setTemplates((currentTemplates) =>
      editingTemplate
        ? currentTemplates.map((template) => (template.id === editingTemplate.id ? savedTemplate : template))
        : [savedTemplate, ...currentTemplates],
    );
    setSelectedTemplateId(savedTemplate.id);
    setDrawerOpen(false);
    message.success(editingTemplate ? "评分表配置已更新" : "评分表模板已新建");
  };

  const copyTemplate = (template: ScorecardTemplate) => {
    const copiedTemplate: ScorecardTemplate = {
      ...template,
      id: createId("scorecard-copy"),
      code: "",
      name: `${template.name} 副本`,
      status: "草稿中",
      version: "V0.1",
      updatedAt: dayjs().format("YYYY-MM-DD"),
    };

    setTemplates((currentTemplates) => [copiedTemplate, ...currentTemplates]);
    setSelectedTemplateId(copiedTemplate.id);
    message.success("已复制为草稿模板");
  };

  const previewCurrentFormScoring = () => {
    const draftTemplate = normalizeTemplate(form.getFieldsValue(true), editingTemplate, { updateVersion: false });

    setScoringTemplate({
      ...draftTemplate,
      code: draftTemplate.code || "发布后生成",
      name: draftTemplate.name || "未命名评分表",
      owner: draftTemplate.owner || "配置预览",
      description: draftTemplate.description || "用于验证当前配置生成的评分填写窗口。",
    });
  };

  const openScoringPreview = (template: ScorecardTemplate) => {
    const warnings = getValidationMessages(template, templates);

    if (warnings.length > 0) {
      Modal.confirm({
        title: "配置尚未完全通过校验",
        content: (
          <ul className="scorecard-validation-list">
            {warnings.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ),
        okText: "继续预览",
        cancelText: "返回配置",
        onOk: () => setScoringTemplate(template),
      });
      return;
    }

    setScoringTemplate(template);
  };

  const deleteTemplate = (template: ScorecardTemplate) => {
    if (template.status !== "草稿中") {
      Modal.warning({
        title: "当前状态不可删除",
        content: "只有未发布的草稿模板允许删除。已发布或已停用模板可保留归档或停用。",
      });
      return;
    }

    Modal.confirm({
      title: "删除评分表配置",
      content: "删除后，该草稿模板将从配置列表中移除。",
      okText: "删除",
      cancelText: "取消",
      okButtonProps: { danger: true },
      onOk: () => {
        const nextSelectedTemplate = templates.find((item) => item.id !== template.id);

        setTemplates((currentTemplates) => currentTemplates.filter((item) => item.id !== template.id));

        if (selectedTemplateId === template.id) {
          setSelectedTemplateId(nextSelectedTemplate?.id);
        }

        if (scoringTemplate?.id === template.id) {
          setScoringTemplate(undefined);
        }

        message.success("评分表配置已删除");
      },
    });
  };

  const columns: ColumnsType<ScorecardTemplate> = [
    {
      title: "序号",
      key: "index",
      width: 70,
      fixed: "left",
      align: "center",
      render: (_value, _record, index) => index + 1,
    },
    {
      title: "模板编码",
      dataIndex: "code",
      key: "code",
      width: 180,
      fixed: "left",
      render: (code: string) => code || <span className="scorecard-code-placeholder">模板发布后生成</span>,
    },
    { title: "评分表名称", dataIndex: "name", key: "name", width: 190 },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 110,
      render: (status: ScorecardTemplateStatus) => <Tag color={statusColor[status]}>{status}</Tag>,
    },
    { title: "负责人", dataIndex: "owner", key: "owner", width: 140 },
    {
      title: "字段数",
      key: "fieldCount",
      width: 100,
      align: "right",
      render: (_, record) => getEnabledFieldCount(record),
    },
    {
      title: "评分人",
      key: "raterCount",
      width: 100,
      align: "right",
      render: (_, record) => record.raters.length,
    },
    {
      title: "总分",
      key: "totalScore",
      width: 100,
      align: "right",
      render: (_, record) => `${getTemplateScore(record)} 分`,
    },
    { title: "版本", dataIndex: "version", key: "version", width: 100 },
    { title: "更新时间", dataIndex: "updatedAt", key: "updatedAt", width: 130 },
    { title: "说明", dataIndex: "description", key: "description", width: 260 },
    {
      title: "操作",
      key: "action",
      width: 130,
      fixed: "right",
      render: (_, record) => (
        <TableActions
          actions={[
            { key: "edit", label: "编辑", onClick: () => openEditor(record) },
            { key: "preview", label: "预览", onClick: () => openScoringPreview(record) },
            { key: "copy", label: "复制", onClick: () => copyTemplate(record) },
            record.status === "启用中"
              ? { key: "disable", label: "停用", danger: true, onClick: () => updateTemplateStatus(record, "已停用") }
              : { key: "enable", label: "发布", onClick: () => updateTemplateStatus(record, "启用中") },
            {
              key: "delete",
              label: "删除",
              danger: true,
              disabled: record.status !== "草稿中",
              onClick: () => deleteTemplate(record),
            },
          ]}
        />
      ),
    },
  ];

  const metricSelectorColumns: ColumnsType<MetricLibraryItem> = [
    { title: "指标编码", dataIndex: "code", key: "code", width: 150 },
    { title: "指标名称（考核事项）", dataIndex: "name", key: "name", width: 180 },
    { title: "指标分类", dataIndex: "category", key: "category", width: 120 },
    { title: "取值方式", dataIndex: "valueMode", key: "valueMode", width: 120 },
    {
      title: "分数",
      key: "score",
      width: 80,
      align: "right",
      render: (_, record) => `${getMetricScoreTotal(record)} 分`,
    },
    {
      title: "指标说明",
      dataIndex: "description",
      key: "description",
      width: 250,
    },
  ];

  return (
    <main className="page scorecard-config-page">
      <section className="filter-panel standard-list-filter" aria-label="评分表筛选区">
        <Form
          form={filterForm}
          layout="inline"
          onFinish={(values) => setFilters(values)}
        >
          <Form.Item name="keyword">
            <Input allowClear placeholder="名称、编码、负责人" className="standard-list-filter__keyword" />
          </Form.Item>
          <Form.Item name="status">
            <Select
              allowClear
              placeholder="状态"
              style={{ width: 140 }}
              options={scorecardStatusOptions.map((item) => ({ value: item, label: item }))}
            />
          </Form.Item>
          <Form.Item name="owner">
            <Select allowClear placeholder="负责人" style={{ width: 150 }} options={ownerOptions} />
          </Form.Item>
          <Form.Item name="updatedAt">
            <DatePicker.RangePicker placeholder={["更新开始", "更新结束"]} />
          </Form.Item>
          <Form.Item className="standard-list-filter__actions">
            <div className="standard-list-filter__action-row">
              <Space wrap className="standard-list-filter__query-actions">
                <Button htmlType="submit" type="primary" icon={<Filter size={16} />}>
                  查询
                </Button>
                <Button
                  icon={<RotateCcw size={16} />}
                  onClick={() => {
                    filterForm.resetFields();
                    setFilters({});
                  }}
                >
                  重置
                </Button>
              </Space>
              <Space wrap className="standard-list-filter__business-actions">
                <Button className="standard-list-filter__create-action" icon={<Plus size={16} />} onClick={() => openEditor()}>
                  新建评分表
                </Button>
              </Space>
            </div>
          </Form.Item>
        </Form>
      </section>

      <SectionPanel>
        <Table
          columns={columns}
          dataSource={filteredTemplates}
          locale={{ emptyText: <Empty description="暂无评分表模板" /> }}
          rowKey="id"
          rowClassName={(record) => (record.id === selectedTemplate?.id ? "scorecard-table-row--selected" : "")}
          scroll={{ x: 1860 }}
          pagination={{
            current: 1,
            pageSize: 10,
            total: filteredTemplates.length,
            showSizeChanger: true,
          }}
          onRow={(record) => ({
            onClick: () => setSelectedTemplateId(record.id),
          })}
        />
      </SectionPanel>

      <Drawer
        className="scorecard-config-drawer"
        destroyOnHidden
        footer={
          <Space className="scorecard-drawer-footer">
            <Button icon={<Eye size={16} />} onClick={previewCurrentFormScoring}>
              预览填写窗口
            </Button>
            <Button type="primary" icon={<Save size={16} />} onClick={() => form.submit()}>
              保存配置
            </Button>
            <Button onClick={() => setDrawerOpen(false)}>取消</Button>
          </Space>
        }
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        title={editingTemplate ? "编辑评分表配置" : "新建评分表配置"}
        width={880}
      >
        <Form form={form} layout="vertical" onFinish={handleEditorFinish}>
          <Tabs
            className="standard-tabs"
            items={[
              {
                key: "base",
                label: "基础信息",
                children: (
                  <div className="scorecard-form-grid">
                    <Form.Item label="评分表名称" name="name" rules={[{ required: true, message: "请输入评分表名称" }]}>
                      <Input placeholder="请输入评分表名称" />
                    </Form.Item>
                    <Form.Item label="负责人" name="owner" rules={[{ required: true, message: "请选择负责人" }]}>
                      <Select
                        showSearch
                        optionFilterProp="label"
                        placeholder="请选择负责人"
                        options={ownerOptions}
                      />
                    </Form.Item>
                    <Form.Item className="scorecard-form-grid__full" label="描述" name="description">
                      <Input.TextArea rows={3} placeholder="请输入评分表适用场景和业务说明" />
                    </Form.Item>
                  </div>
                ),
              },
              {
                key: "fields",
                label: "字段配置",
                children: (
                  <div className="scorecard-form-stack">
                    <div className="scorecard-form-block">
                      <h3>系统字段</h3>
                      <SystemFieldSelector form={form} />
                    </div>
                    <Form.List name="customFields">
                      {(fields, { add, remove }) => (
                        <div className="scorecard-form-block">
                          <div className="scorecard-form-block__header">
                            <h3>自定义字段</h3>
                            <Button icon={<Plus size={16} />} onClick={() => add({ name: "", placeholder: "", required: false })}>
                              新增字段
                            </Button>
                          </div>
                          <div className="scorecard-form-list">
                            {fields.map((field) => (
                              <div className="scorecard-form-row" key={field.key}>
                                <Form.Item name={[field.name, "name"]} rules={[{ required: true, message: "请输入字段名称" }]}>
                                  <Input placeholder="字段名称" />
                                </Form.Item>
                                <Form.Item name={[field.name, "placeholder"]}>
                                  <Input placeholder="填写提示" />
                                </Form.Item>
                                <Form.Item name={[field.name, "required"]} valuePropName="checked">
                                  <Checkbox>必填</Checkbox>
                                </Form.Item>
                                <Button aria-label="删除字段" icon={<Trash2 size={16} />} onClick={() => remove(field.name)} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </Form.List>
                  </div>
                ),
              },
              {
                key: "raters",
                label: "评分人",
                children: (
                  <Form.List name="raters">
                    {(fields, { add, remove }) => (
                      <div className="scorecard-form-block">
                        <div className="scorecard-form-block__header">
                          <h3>评分角色</h3>
                          <Button
                            icon={<Plus size={16} />}
                            disabled={fields.length >= 5}
                            onClick={() => add({ name: "", weight: undefined })}
                          >
                            新增评分人
                          </Button>
                        </div>
                        <Alert type="info" showIcon message="一张评分表至少保留一个评分人，最多支持五个评分人。" />
                        <div className="scorecard-form-list">
                          {fields.map((field) => (
                            <div className="scorecard-form-row scorecard-rater-form-row" key={field.key}>
                              <Form.Item name={[field.name, "name"]} rules={[{ required: true, message: "请输入评分角色" }]}>
                                <Input placeholder="例如：直属上级评分" />
                              </Form.Item>
                              <Form.Item name={[field.name, "weight"]}>
                                <InputNumber min={0} max={100} precision={0} addonAfter="%" placeholder="权重" />
                              </Form.Item>
                              <Button aria-label="删除评分人" icon={<Trash2 size={16} />} disabled={fields.length <= 1} onClick={() => remove(field.name)} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Form.List>
                ),
              },
              {
                key: "content",
                label: "考核内容",
                children: (
                  <Form.List name="dimensions">
                    {(dimensionFields, { add, remove }) => (
                      <div className="scorecard-form-stack">
                        <div className="scorecard-content-toolbar">
                          <Button icon={<Plus size={16} />} onClick={() => add(defaultDimensionValue)}>
                            新增考核维度
                          </Button>
                        </div>
                        {dimensionFields.map((dimensionField) => (
                          <Collapse
                            className="scorecard-dimension-collapse"
                            collapsible="icon"
                            defaultActiveKey={[String(dimensionField.key)]}
                            key={dimensionField.key}
                            items={[
                              {
                                key: String(dimensionField.key),
                                label: (
                                  <div className="scorecard-dimension-collapse__header">
                                    <Form.Item
                                      className="scorecard-dimension-name"
                                      label="考核维度"
                                      name={[dimensionField.name, "name"]}
                                      rules={[{ required: true, message: "请输入考核维度" }]}
                                    >
                                      <Input placeholder="考核维度" />
                                    </Form.Item>
                                    <Space wrap className="scorecard-dimension-collapse__actions">
                                      <Button icon={<Plus size={16} />} onClick={() => openMetricSelector(dimensionField.name)}>
                                        从指标库选择
                                      </Button>
                                      <Button aria-label="删除维度" icon={<Trash2 size={16} />} onClick={() => remove(dimensionField.name)} />
                                    </Space>
                                  </div>
                                ),
                                children: (
                                  <Form.List name={[dimensionField.name, "items"]}>
                                    {(itemFields, { add: addItem, remove: removeItem }) => (
                                      <div className="scorecard-form-list">
                                        {itemFields.map((itemField) => {
                                          const libraryMetricItem = editingDimensions[dimensionField.name]?.items?.[itemField.name];
                                          const isLibraryMetricItem = Boolean(libraryMetricItem?.metricId);

                                          return (
                                            <div className="scorecard-form-nested" key={itemField.key}>
                                              <Form.Item hidden name={[itemField.name, "metricId"]}>
                                                <Input />
                                              </Form.Item>
                                              <div className="scorecard-form-row scorecard-item-form-row">
                                                <Form.Item label="考核事项" name={[itemField.name, "name"]} rules={[{ required: true, message: "请输入考核事项" }]}>
                                                  <Input
                                                    disabled={isLibraryMetricItem}
                                                    placeholder="考核事项"
                                                    suffix={isLibraryMetricItem ? <Tag color="blue">指标库</Tag> : null}
                                                  />
                                                </Form.Item>
                                                <Button aria-label="删除事项" icon={<Trash2 size={16} />} onClick={() => removeItem(itemField.name)} />
                                              </div>
                                              <Form.List name={[itemField.name, "standards"]}>
                                                {(standardFields, { add: addStandard, remove: removeStandard }) => (
                                                  <div className="scorecard-standard-form-list">
                                                    {standardFields.map((standardField) => (
                                                      <div className="scorecard-form-row scorecard-standard-form-row" key={standardField.key}>
                                                        <Form.Item
                                                          label="评分标准"
                                                          name={[standardField.name, "description"]}
                                                          rules={[{ required: true, message: "请输入评分标准" }]}
                                                        >
                                                          <Input disabled={isLibraryMetricItem} placeholder="评分标准描述" />
                                                        </Form.Item>
                                                        <Form.Item
                                                          label="分值"
                                                          name={[standardField.name, "score"]}
                                                          rules={[{ required: true, message: "请输入分值" }]}
                                                        >
                                                          <InputNumber disabled={isLibraryMetricItem} min={0} precision={0} addonAfter="分" />
                                                        </Form.Item>
                                                        <Button
                                                          aria-label="删除评分标准"
                                                          disabled={isLibraryMetricItem}
                                                          icon={<Trash2 size={16} />}
                                                          onClick={() => removeStandard(standardField.name)}
                                                        />
                                                      </div>
                                                    ))}
                                                    <Button
                                                      disabled={isLibraryMetricItem}
                                                      icon={<Plus size={16} />}
                                                      onClick={() => addStandard({ description: "", score: 0 })}
                                                    >
                                                      新增评分标准
                                                    </Button>
                                                  </div>
                                                )}
                                              </Form.List>
                                            </div>
                                          );
                                        })}
                                        <Button icon={<Plus size={16} />} onClick={() => addItem({ name: "", standards: [{ description: "", score: 0 }] })}>
                                          新增考核事项
                                        </Button>
                                      </div>
                                    )}
                                  </Form.List>
                                ),
                              },
                            ]}
                          />
                        ))}
                      </div>
                    )}
                  </Form.List>
                ),
              },
            ]}
          />
        </Form>
      </Drawer>

      <Modal
        destroyOnHidden
        okText="加入评分表"
        onCancel={() => {
          setMetricSelectorOpen(false);
          setMetricTargetDimensionIndex(undefined);
        }}
        onOk={appendMetricsToCurrentTemplate}
        open={metricSelectorOpen}
        title="从指标库选择指标"
        width={920}
      >
        <div className="scorecard-metric-selector">
          <Form form={metricFilterForm} layout="inline" onFinish={(values) => setMetricLibraryFilters(values)}>
            <Form.Item name="keyword">
              <Input allowClear placeholder="指标名称、编码" className="standard-list-filter__keyword" />
            </Form.Item>
            <Form.Item name="category">
              <Select allowClear placeholder="指标分类" style={{ width: 140 }} options={metricCategoryOptions} />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button htmlType="submit" type="primary" icon={<Filter size={16} />}>
                  查询
                </Button>
                <Button
                  icon={<RotateCcw size={16} />}
                  onClick={() => {
                    metricFilterForm.resetFields();
                    setMetricLibraryFilters({});
                  }}
                >
                  重置
                </Button>
              </Space>
            </Form.Item>
          </Form>
          <Table
            columns={metricSelectorColumns}
            dataSource={filteredLibraryMetrics}
            locale={{ emptyText: <Empty description="暂无可选指标" /> }}
            pagination={{ pageSize: 6, total: filteredLibraryMetrics.length }}
            rowKey="id"
            rowSelection={{
              selectedRowKeys: selectedMetricIds,
              onChange: (keys) => setSelectedMetricIds(keys.map(String)),
              getCheckboxProps: (record) => ({
                disabled: existingMetricIds.has(record.id),
              }),
            }}
            scroll={{ x: 900 }}
          />
        </div>
      </Modal>

      <ScorecardScoringDrawer
        mode="preview"
        onClose={() => setScoringTemplate(undefined)}
        open={Boolean(scoringTemplate)}
        template={scoringTemplate}
      />
    </main>
  );
}
