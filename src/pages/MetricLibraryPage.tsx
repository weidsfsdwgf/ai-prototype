import {
  Button,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popover,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
  Tree,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { Filter, MoreHorizontal, Pencil, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState, type Key, type ReactNode } from "react";
import { SectionPanel } from "../components/SectionPanel";
import { TableActions } from "../components/TableActions";
import { TreeListLayout } from "../components/TreeListLayout";
import {
  initialMetricCategories,
  metricLibraryItems,
  metricValueModeOptions,
  type MetricCategory,
  type MetricLibraryItem,
  type MetricStatus,
  type MetricValueMode,
} from "../data/metricLibrary";
import "./MetricLibraryPage.css";
import "./Page.css";
import "./standards/Standards.css";

type MetricFilterValues = {
  keyword?: string;
  valueMode?: MetricValueMode;
};

type MetricFormValues = {
  name?: string;
  category?: string;
  valueMode?: MetricValueMode;
  allowManualEdit?: boolean;
  description?: string;
  standards?: Array<{ description?: string; score?: number; fieldKey?: string }>;
};

type CategoryModalState =
  | { mode: "create"; parentId?: string }
  | { mode: "edit"; categoryId: string; initialName: string };

type CategoryTreeNode = {
  key: string;
  title: ReactNode;
  children?: CategoryTreeNode[];
};

const allCategoryKey = "all";

const statusColor: Record<MetricStatus, string> = {
  启用中: "green",
  草稿中: "gold",
  已停用: "default",
};

const valueModeColor: Record<MetricValueMode, string> = {
  系统取值: "blue",
  人工评分: "default",
};

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function generateMetricCode(metrics: MetricLibraryItem[]) {
  const prefix = "METRIC-20260512";
  const maxSerial = metrics.reduce((maxValue, metric) => {
    if (!metric.code.startsWith(prefix)) {
      return maxValue;
    }

    const serial = Number(metric.code.slice(prefix.length + 1));
    return Number.isFinite(serial) ? Math.max(maxValue, serial) : maxValue;
  }, 0);

  return `${prefix}-${String(maxSerial + 1).padStart(3, "0")}`;
}

function flattenCategories(categories: MetricCategory[]): MetricCategory[] {
  return categories.flatMap((category) => [category, ...flattenCategories(category.children ?? [])]);
}

function findCategoryById(categories: MetricCategory[], id: string): MetricCategory | undefined {
  for (const category of categories) {
    if (category.id === id) {
      return category;
    }

    const found = findCategoryById(category.children ?? [], id);

    if (found) {
      return found;
    }
  }

  return undefined;
}

function collectCategoryIds(category: MetricCategory): string[] {
  return [category.id, ...(category.children ?? []).flatMap(collectCategoryIds)];
}

function collectCategoryNames(category: MetricCategory): string[] {
  return [category.name, ...(category.children ?? []).flatMap(collectCategoryNames)];
}

function getAllCategoryIds(categories: MetricCategory[]) {
  return categories.flatMap(collectCategoryIds);
}

function getCategoryNamesById(categories: MetricCategory[], id: string): string[] {
  const category = findCategoryById(categories, id);
  return category ? collectCategoryNames(category) : [];
}

function filterCategoryTree(categories: MetricCategory[], keyword: string): MetricCategory[] {
  const normalizedKeyword = keyword.trim();

  if (!normalizedKeyword) {
    return categories;
  }

  return categories.reduce<MetricCategory[]>((result, category) => {
    const children = filterCategoryTree(category.children ?? [], normalizedKeyword);

    if (category.name.includes(normalizedKeyword) || children.length) {
      result.push({ ...category, children: children.length ? children : undefined });
    }

    return result;
  }, []);
}

function addCategory(categories: MetricCategory[], parentId: string | undefined, newCategory: MetricCategory): MetricCategory[] {
  if (!parentId) {
    return [...categories, newCategory];
  }

  return categories.map((category) =>
    category.id === parentId
      ? { ...category, children: [...(category.children ?? []), newCategory] }
      : { ...category, children: category.children ? addCategory(category.children, parentId, newCategory) : undefined },
  );
}

function renameCategory(categories: MetricCategory[], categoryId: string, name: string): MetricCategory[] {
  return categories.map((category) =>
    category.id === categoryId
      ? { ...category, name }
      : { ...category, children: category.children ? renameCategory(category.children, categoryId, name) : undefined },
  );
}

function deleteCategory(categories: MetricCategory[], categoryId: string): MetricCategory[] {
  return categories
    .filter((category) => category.id !== categoryId)
    .map((category) => ({
      ...category,
      children: category.children ? deleteCategory(category.children, categoryId) : undefined,
    }));
}

function toFormValues(metric: MetricLibraryItem): MetricFormValues {
  return {
    name: metric.name,
    category: metric.category,
    valueMode: metric.valueMode,
    allowManualEdit: metric.allowManualEdit,
    description: metric.description,
    standards: metric.standards.map((standard) => ({
      description: standard.description,
      score: standard.score,
      fieldKey: standard.fieldKey,
    })),
  };
}

function normalizeMetric(values: MetricFormValues, source?: MetricLibraryItem): MetricLibraryItem {
  const valueMode = values.valueMode ?? "人工评分";

  return {
    id: source?.id ?? makeId("metric"),
    code: source?.code ?? "",
    name: values.name?.trim() ?? "",
    category: values.category ?? "",
    valueMode,
    allowManualEdit: valueMode === "系统取值" ? Boolean(values.allowManualEdit) : true,
    status: source?.status ?? "草稿中",
    updatedAt: "2026-05-12",
    description: values.description?.trim() ?? "",
    standards: (values.standards ?? [])
      .filter((standard) => standard.description?.trim() || standard.score !== undefined || standard.fieldKey?.trim())
      .map((standard, index) => ({
        id: source?.standards[index]?.id ?? makeId("standard"),
        description: standard.description?.trim() ?? "",
        score: Number(standard.score ?? 0),
        fieldKey: valueMode === "系统取值" ? standard.fieldKey?.trim() : undefined,
      })),
  };
}

function getMetricScoreTotal(metric: MetricLibraryItem) {
  return metric.standards.reduce((totalScore, standard) => totalScore + standard.score, 0);
}

function validatePublish(metric: MetricLibraryItem) {
  const warnings: string[] = [];

  if (!metric.name.trim()) {
    warnings.push("指标名称不能为空。");
  }

  if (!metric.category.trim()) {
    warnings.push("指标分类不能为空。");
  }

  if (metric.standards.length < 1) {
    warnings.push("至少配置一条评分标准。");
  }

  metric.standards.forEach((standard, index) => {
    if (!standard.description.trim()) {
      warnings.push(`第 ${index + 1} 条评分标准缺少描述。`);
    }

    if (!Number.isFinite(standard.score) || standard.score < 0) {
      warnings.push(`第 ${index + 1} 条评分标准分值必须为非负数字。`);
    }

    if (metric.valueMode === "系统取值" && !standard.fieldKey?.trim()) {
      warnings.push(`第 ${index + 1} 条评分标准缺少字段key。`);
    }
  });

  return warnings;
}

export function MetricLibraryPage() {
  const [metrics, setMetrics] = useState<MetricLibraryItem[]>(metricLibraryItems);
  const [categories, setCategories] = useState<MetricCategory[]>(initialMetricCategories);
  const [filters, setFilters] = useState<MetricFilterValues>({});
  const [categoryKeyword, setCategoryKeyword] = useState("");
  const [expandedCategoryKeys, setExpandedCategoryKeys] = useState<Key[]>([allCategoryKey, ...getAllCategoryIds(initialMetricCategories)]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(allCategoryKey);
  const [editingMetric, setEditingMetric] = useState<MetricLibraryItem>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [categoryModal, setCategoryModal] = useState<CategoryModalState>();
  const [form] = Form.useForm<MetricFormValues>();
  const [filterForm] = Form.useForm<MetricFilterValues>();
  const [categoryForm] = Form.useForm<{ name?: string }>();
  const valueMode = Form.useWatch("valueMode", form);

  const categoryOptions = useMemo(
    () => flattenCategories(categories).map((category) => ({ value: category.name, label: category.name })),
    [categories],
  );
  const selectedCategoryNames = useMemo(
    () => (selectedCategoryId === allCategoryKey ? [] : getCategoryNamesById(categories, selectedCategoryId)),
    [categories, selectedCategoryId],
  );
  const visibleCategories = useMemo(() => filterCategoryTree(categories, categoryKeyword), [categories, categoryKeyword]);
  const visibleCategoryKeys = useMemo(() => getAllCategoryIds(visibleCategories), [visibleCategories]);
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();

    flattenCategories(categories).forEach((category) => {
      const categoryNames = collectCategoryNames(category);
      counts.set(category.id, metrics.filter((metric) => categoryNames.includes(metric.category)).length);
    });

    return counts;
  }, [categories, metrics]);

  useEffect(() => {
    if (categoryKeyword.trim()) {
      setExpandedCategoryKeys([allCategoryKey, ...visibleCategoryKeys]);
    }
  }, [categoryKeyword, visibleCategoryKeys]);

  useEffect(() => {
    if (categoryModal) {
      categoryForm.resetFields();
      categoryForm.setFieldsValue({ name: categoryModal.mode === "edit" ? categoryModal.initialName : "" });
    }
  }, [categoryForm, categoryModal]);

  const filteredMetrics = useMemo(
    () =>
      metrics.filter((metric) => {
        const keyword = filters.keyword?.trim().toLowerCase();
        const matchedKeyword = keyword
          ? [metric.code, metric.name, metric.description].join(" ").toLowerCase().includes(keyword)
          : true;
        const categoryMatched = selectedCategoryId === allCategoryKey || selectedCategoryNames.includes(metric.category);

        return matchedKeyword && categoryMatched && (!filters.valueMode || metric.valueMode === filters.valueMode);
      }),
    [filters, metrics, selectedCategoryId, selectedCategoryNames],
  );

  const openEditor = (metric?: MetricLibraryItem) => {
    setEditingMetric(metric);
    setDrawerOpen(true);
    form.resetFields();
    form.setFieldsValue(
      metric
        ? toFormValues(metric)
        : {
            category: selectedCategoryId === allCategoryKey ? categoryOptions[0]?.value : selectedCategoryNames[0],
            valueMode: "人工评分",
            allowManualEdit: true,
            standards: [{ description: "", score: 0, fieldKey: "" }],
          },
    );
  };

  const saveMetric = (values: MetricFormValues, publish: boolean) => {
    const savedMetric = normalizeMetric(values, editingMetric);
    const nextMetric = publish
      ? {
          ...savedMetric,
          code: savedMetric.code || generateMetricCode(metrics),
          status: "启用中" as const,
        }
      : savedMetric;
    const warnings = publish ? validatePublish(nextMetric) : [];

    if (warnings.length) {
      Modal.warning({
        title: "指标暂不能发布",
        content: (
          <ul className="metric-library-validation-list">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        ),
      });
      return;
    }

    setMetrics((currentMetrics) =>
      editingMetric
        ? currentMetrics.map((metric) => (metric.id === editingMetric.id ? nextMetric : metric))
        : [nextMetric, ...currentMetrics],
    );
    setDrawerOpen(false);
    message.success(publish ? "指标已保存并发布" : editingMetric ? "指标配置已保存" : "指标已新增");
  };

  const handleSaveMetric = async (publish: boolean) => {
    const values = await form.validateFields();
    saveMetric(values, publish);
  };

  const updateMetricStatus = (metric: MetricLibraryItem, status: MetricStatus) => {
    if (status === "启用中") {
      const warnings = validatePublish(metric);

      if (warnings.length) {
        Modal.warning({
          title: "指标暂不能发布",
          content: (
            <ul className="metric-library-validation-list">
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          ),
        });
        return;
      }
    }

    setMetrics((currentMetrics) =>
      currentMetrics.map((item) =>
        item.id === metric.id
          ? {
              ...item,
              code: status === "启用中" && !item.code ? generateMetricCode(currentMetrics) : item.code,
              status,
              updatedAt: "2026-05-12",
            }
          : item,
      ),
    );
    message.success(status === "启用中" ? "指标已发布启用" : "指标状态已更新");
  };

  const deleteMetric = (metric: MetricLibraryItem) => {
    if (metric.status !== "草稿中") {
      Modal.warning({
        title: "当前状态不可删除",
        content: "只有未发布的草稿指标允许删除。已发布或已停用指标可保留归档或停用。",
      });
      return;
    }

    Modal.confirm({
      title: "删除指标",
      content: "删除后，该草稿指标将从指标库中移除。",
      okText: "删除",
      cancelText: "取消",
      okButtonProps: { danger: true },
      onOk: () => {
        setMetrics((currentMetrics) => currentMetrics.filter((item) => item.id !== metric.id));
        message.success("指标已删除");
      },
    });
  };

  const handleSaveCategory = async () => {
    const values = await categoryForm.validateFields();
    const nextName = values.name?.trim();

    if (!categoryModal || !nextName) {
      return;
    }

    if (categoryModal.mode === "create") {
      setCategories((currentCategories) => addCategory(currentCategories, categoryModal.parentId, { id: makeId("metric-cat"), name: nextName }));
      setExpandedCategoryKeys((currentKeys) =>
        Array.from(new Set([...currentKeys, allCategoryKey, categoryModal.parentId].filter(Boolean) as string[])),
      );
      setCategoryModal(undefined);
      return;
    }

    const oldName = categoryModal.initialName;
    setCategories((currentCategories) => renameCategory(currentCategories, categoryModal.categoryId, nextName));
    setMetrics((currentMetrics) => currentMetrics.map((metric) => (metric.category === oldName ? { ...metric, category: nextName } : metric)));
    setCategoryModal(undefined);
  };

  const handleDeleteCategory = (category: MetricCategory) => {
    Modal.confirm({
      title: "删除分类",
      content: `确认删除“${category.name}”及其下级分类？当前原型会直接删除分类节点，不校验指标引用。`,
      okText: "确认删除",
      okButtonProps: { danger: true },
      cancelText: "取消",
      onOk: () => {
        const deletedIds = collectCategoryIds(category);
        setCategories((currentCategories) => deleteCategory(currentCategories, category.id));

        if (deletedIds.includes(selectedCategoryId)) {
          setSelectedCategoryId(allCategoryKey);
        }

        setExpandedCategoryKeys((currentKeys) => currentKeys.filter((key) => !deletedIds.includes(String(key))));
      },
    });
  };

  const renderCategoryMenu = (category?: MetricCategory) => (
    <div className="metric-library-category-menu">
      <Button icon={<Plus size={15} />} type="text" onClick={() => setCategoryModal({ mode: "create", parentId: category?.id })}>
        {category ? "新增下级分类" : "新增一级分类"}
      </Button>
      {category ? (
        <>
          <Button icon={<Pencil size={15} />} type="text" onClick={() => setCategoryModal({ mode: "edit", categoryId: category.id, initialName: category.name })}>
            编辑分类
          </Button>
          <Button icon={<Trash2 size={15} />} danger type="text" onClick={() => handleDeleteCategory(category)}>
            删除分类
          </Button>
        </>
      ) : null}
    </div>
  );

  const renderCategoryTitle = (options: { name: string; count: number; category?: MetricCategory; all?: boolean }) => (
    <div className="metric-library-tree-node-title">
      <span className="metric-library-tree-node-title__label">
        <span>
          {options.name}（{options.count}）
        </span>
      </span>
      <span className="metric-library-tree-node-title__actions">
        {options.all ? (
          <Tooltip title="新增一级分类">
            <Button
              aria-label="新增一级分类"
              icon={<Plus size={15} />}
              size="small"
              type="text"
              onClick={(event) => {
                event.stopPropagation();
                setCategoryModal({ mode: "create" });
              }}
            />
          </Tooltip>
        ) : (
          <Popover content={renderCategoryMenu(options.category)} placement="rightTop" trigger="click">
            <Tooltip title="分类操作">
              <Button aria-label={`${options.name}分类操作`} icon={<MoreHorizontal size={15} />} size="small" type="text" onClick={(event) => event.stopPropagation()} />
            </Tooltip>
          </Popover>
        )}
      </span>
    </div>
  );

  const buildCategoryTreeData = (categoryList: MetricCategory[]): CategoryTreeNode[] =>
    categoryList.map((category) => ({
      key: category.id,
      title: renderCategoryTitle({
        name: category.name,
        count: categoryCounts.get(category.id) ?? 0,
        category,
      }),
      children: category.children?.length ? buildCategoryTreeData(category.children) : undefined,
    }));

  const categoryTreeData: CategoryTreeNode[] = [
    {
      key: allCategoryKey,
      title: renderCategoryTitle({ name: "全部分类", count: metrics.length, all: true }),
      children: buildCategoryTreeData(visibleCategories),
    },
  ];

  const columns: ColumnsType<MetricLibraryItem> = [
    {
      title: "序号",
      key: "index",
      width: 70,
      fixed: "left",
      align: "center",
      render: (_value, _record, index) => index + 1,
    },
    {
      title: "指标编码",
      dataIndex: "code",
      key: "code",
      width: 180,
      fixed: "left",
      render: (code: string) => code || <span className="metric-library-muted">指标发布后生成</span>,
    },
    { title: "指标名称（考核事项）", dataIndex: "name", key: "name", width: 220 },
    { title: "指标分类", dataIndex: "category", key: "category", width: 140 },
    {
      title: "取值方式",
      dataIndex: "valueMode",
      key: "valueMode",
      width: 130,
      render: (currentValueMode: MetricValueMode) => <Tag color={valueModeColor[currentValueMode]}>{currentValueMode}</Tag>,
    },
    {
      title: "允许人工修改",
      key: "allowManualEdit",
      width: 120,
    render: (_, record) => (record.valueMode === "系统取值" ? (record.allowManualEdit ? "是" : "否") : "-"),
    },
    {
      title: "分数",
      key: "scoreField",
      width: 110,
      align: "right",
      render: (_, record) => `${getMetricScoreTotal(record)} 分`,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: MetricStatus) => <Tag color={statusColor[status]}>{status}</Tag>,
    },
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
            record.status === "启用中"
              ? { key: "disable", label: "停用", danger: true, onClick: () => updateMetricStatus(record, "已停用") }
              : { key: "enable", label: "发布", onClick: () => updateMetricStatus(record, "启用中") },
            {
              key: "delete",
              label: "删除",
              danger: true,
              disabled: record.status !== "草稿中",
              onClick: () => deleteMetric(record),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <main className="page metric-library-page">
      <TreeListLayout
        className="metric-library-layout"
        sidebarWidth={300}
        tree={
          <SectionPanel>
            <Input.Search
              allowClear
              className="tree-list-search metric-library-tree-search"
              placeholder="搜索指标分类"
              value={categoryKeyword}
              onChange={(event) => setCategoryKeyword(event.target.value)}
              onSearch={setCategoryKeyword}
            />
            <Tree
              blockNode
              className="metric-library-category-tree"
              expandedKeys={expandedCategoryKeys}
              selectedKeys={[selectedCategoryId]}
              showLine
              treeData={categoryTreeData}
              onExpand={(keys) => setExpandedCategoryKeys(keys)}
              onSelect={(keys) => setSelectedCategoryId(String(keys[0] ?? allCategoryKey))}
            />
          </SectionPanel>
        }
      >
        <section className="filter-panel standard-list-filter" aria-label="指标库筛选区">
          <Form form={filterForm} layout="inline" onFinish={(values) => setFilters(values)}>
            <Form.Item name="keyword">
              <Input allowClear placeholder="指标名称、编码" className="standard-list-filter__keyword" />
            </Form.Item>
            <Form.Item name="valueMode">
              <Select allowClear placeholder="取值方式" style={{ width: 150 }} options={metricValueModeOptions.map((item) => ({ value: item, label: item }))} />
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
                    新建指标
                  </Button>
                </Space>
              </div>
            </Form.Item>
          </Form>
        </section>
        <SectionPanel>
          <Table
            columns={columns}
            dataSource={filteredMetrics}
            locale={{ emptyText: <Empty description="暂无指标" /> }}
            pagination={{ current: 1, pageSize: 10, total: filteredMetrics.length, showSizeChanger: true }}
            rowKey="id"
            scroll={{ x: 1740 }}
          />
        </SectionPanel>
      </TreeListLayout>

      <Drawer
        className="metric-library-drawer"
        destroyOnHidden
        footer={
          <Space className="metric-library-drawer__footer">
            <Button type="primary" icon={<Save size={16} />} onClick={() => handleSaveMetric(true)}>
              保存发布
            </Button>
            {!editingMetric || editingMetric.status === "草稿中" ? (
              <Button icon={<Save size={16} />} onClick={() => handleSaveMetric(false)}>
                仅保存
              </Button>
            ) : null}
            <Button onClick={() => setDrawerOpen(false)}>取消</Button>
          </Space>
        }
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        title={editingMetric ? "编辑指标" : "新建指标"}
        width={820}
      >
        <Form form={form} layout="vertical">
          <div className="metric-library-form-grid">
            <Form.Item label="指标名称（考核事项）" name="name" rules={[{ required: true, message: "请输入指标名称" }]}>
              <Input placeholder="请输入指标名称" />
            </Form.Item>
            <Form.Item label="指标分类" name="category" rules={[{ required: true, message: "请选择指标分类" }]}>
              <Select showSearch optionFilterProp="label" options={categoryOptions} />
            </Form.Item>
            <Form.Item label="取值方式" name="valueMode" rules={[{ required: true, message: "请选择取值方式" }]}>
              <Select
                disabled={editingMetric?.status === "启用中" && editingMetric.valueMode === "系统取值"}
                options={metricValueModeOptions.map((item) => ({ value: item, label: item }))}
              />
            </Form.Item>
            {valueMode === "系统取值" ? (
              <Form.Item label="允许人工修改" name="allowManualEdit" valuePropName="checked">
                <Switch checkedChildren="允许" unCheckedChildren="不允许" />
              </Form.Item>
            ) : null}
            <Form.Item className="metric-library-form-grid__full" label="说明" name="description">
              <Input.TextArea rows={3} placeholder="请输入指标口径说明" />
            </Form.Item>
          </div>

          <Form.List name="standards">
            {(fields, { add, remove }) => (
              <div className="metric-library-form-block">
                <div className="metric-library-form-block__header">
                  <h3>评分标准</h3>
                  <Button icon={<Plus size={16} />} onClick={() => add({ description: "", score: 0, fieldKey: "" })}>
                    新增标准
                  </Button>
                </div>
                <div className="metric-library-standard-list">
                  {fields.map((field) => (
                    <div
                      className={
                        valueMode === "系统取值"
                          ? "metric-library-standard-row metric-library-standard-row--auto"
                          : "metric-library-standard-row"
                      }
                      key={field.key}
                    >
                      <Form.Item name={[field.name, "description"]} rules={[{ required: true, message: "请输入评分标准" }]}>
                        <Input placeholder="评分标准描述" />
                      </Form.Item>
                      <Form.Item name={[field.name, "score"]} rules={[{ required: true, message: "请输入分值" }]}>
                        <InputNumber min={0} precision={0} addonAfter="分" />
                      </Form.Item>
                      {valueMode === "系统取值" ? (
                        <Form.Item name={[field.name, "fieldKey"]} rules={[{ required: true, message: "请输入字段key" }]}>
                          <Input placeholder="字段key" />
                        </Form.Item>
                      ) : null}
                      <Button aria-label="删除评分标准" icon={<Trash2 size={16} />} disabled={fields.length <= 1} onClick={() => remove(field.name)} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Form.List>
        </Form>
      </Drawer>

      <Modal
        destroyOnClose
        okText="保存"
        onCancel={() => setCategoryModal(undefined)}
        onOk={handleSaveCategory}
        open={Boolean(categoryModal)}
        title={categoryModal?.mode === "edit" ? "编辑分类" : "新增分类"}
      >
        <Form form={categoryForm} layout="vertical">
          <Form.Item label="分类名称" name="name" rules={[{ required: true, message: "请输入分类名称" }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </main>
  );
}
