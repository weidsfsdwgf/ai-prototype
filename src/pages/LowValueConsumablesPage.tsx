import {
  Button,
  Descriptions,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popover,
  Radio,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Tree,
} from "antd";
import type { ColumnsType } from "antd/es/table/interface";
import {
  Filter,
  MoreHorizontal,
  PackagePlus,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState, type Key, type ReactNode } from "react";
import { SectionPanel } from "../components/SectionPanel";
import { TableActions } from "../components/TableActions";
import { TreeListLayout } from "../components/TreeListLayout";
import {
  consumableAdmins,
  consumableAreas,
  consumableDepartments,
  consumableUnits,
  initialConsumableCategories,
  initialLowValueConsumables,
  type ConsumableCategory,
  type InboundRecord,
  type IssueRecord,
  type LossRecord,
  type LowValueConsumable,
  type PendingRequest,
  type ReturnRecord,
  type StockStatus,
} from "../data/lowValueConsumables";
import "./LowValueConsumablesPage.css";
import "./Page.css";
import "./standards/Standards.css";

type FilterValues = {
  code?: string;
  name?: string;
  area?: string;
  stockState?: StockStatus | "待分发" | "待归还";
};

type DetailType = "inbound" | "issued" | "loss" | "dispatch" | "return";
type DetailState = { type: DetailType; itemId: string };
type CategoryModalState =
  | { mode: "create"; parentId?: string }
  | { mode: "edit"; categoryId: string; initialName: string };
type InboundMode = "existing" | "new";
type CategoryTreeNode = {
  key: string;
  title: ReactNode;
  children?: CategoryTreeNode[];
};

const allCategoryKey = "all";
const operatorName = "陈嘉";

const stockStatusColor: Record<StockStatus, string> = {
  正常: "green",
  低于下限: "red",
  高于上限: "gold",
};

const requestTypeColor = {
  领用: "blue",
  借用: "purple",
};

function getStockStatus(item: LowValueConsumable): StockStatus {
  if (item.stock < item.safetyMin) {
    return "低于下限";
  }

  if (item.stock > item.safetyMax) {
    return "高于上限";
  }

  return "正常";
}

function formatDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

function formatNow() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function makeDocumentNo(prefix: string, count: number) {
  return `${prefix}-${formatDateKey()}-${String(count + 1).padStart(3, "0")}`;
}

function makeNextItemCode(items: LowValueConsumable[]) {
  const maxIndex = items.reduce((max, item) => {
    const parsed = Number(item.code.replace("XE-", ""));
    return Number.isFinite(parsed) ? Math.max(max, parsed) : max;
  }, 0);

  return `XE-${String(maxIndex + 1).padStart(3, "0")}`;
}

function flattenCategories(categories: ConsumableCategory[]): ConsumableCategory[] {
  return categories.flatMap((category) => [
    category,
    ...flattenCategories(category.children ?? []),
  ]);
}

function findCategoryById(categories: ConsumableCategory[], id: string): ConsumableCategory | undefined {
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

function collectCategoryNames(category: ConsumableCategory): string[] {
  return [category.name, ...(category.children ?? []).flatMap(collectCategoryNames)];
}

function collectCategoryIds(category: ConsumableCategory): string[] {
  return [category.id, ...(category.children ?? []).flatMap(collectCategoryIds)];
}

function getAllCategoryIds(categories: ConsumableCategory[]) {
  return categories.flatMap(collectCategoryIds);
}

function getCategoryNamesById(categories: ConsumableCategory[], id: string): string[] {
  const category = findCategoryById(categories, id);
  return category ? collectCategoryNames(category) : [];
}

function filterCategoryTree(categories: ConsumableCategory[], keyword: string): ConsumableCategory[] {
  const normalizedKeyword = keyword.trim();

  if (!normalizedKeyword) {
    return categories;
  }

  const matchedCategories: ConsumableCategory[] = [];

  categories.forEach((category) => {
    const children = filterCategoryTree(category.children ?? [], normalizedKeyword);

    if (category.name.includes(normalizedKeyword) || children.length > 0) {
      matchedCategories.push({
        ...category,
        children: children.length > 0 ? children : undefined,
      });
    }
  });

  return matchedCategories;
}

function addCategory(
  categories: ConsumableCategory[],
  parentId: string | undefined,
  newCategory: ConsumableCategory,
): ConsumableCategory[] {
  if (!parentId) {
    return [...categories, newCategory];
  }

  return categories.map((category) => {
    if (category.id === parentId) {
      return {
        ...category,
        children: [...(category.children ?? []), newCategory],
      };
    }

    return {
      ...category,
      children: category.children ? addCategory(category.children, parentId, newCategory) : undefined,
    };
  });
}

function renameCategory(categories: ConsumableCategory[], categoryId: string, name: string): ConsumableCategory[] {
  return categories.map((category) => {
    if (category.id === categoryId) {
      return { ...category, name };
    }

    return {
      ...category,
      children: category.children ? renameCategory(category.children, categoryId, name) : undefined,
    };
  });
}

function deleteCategory(categories: ConsumableCategory[], categoryId: string): ConsumableCategory[] {
  return categories
    .filter((category) => category.id !== categoryId)
    .map((category) => ({
      ...category,
      children: category.children ? deleteCategory(category.children, categoryId) : undefined,
    }));
}

function countRecords<T>(items: LowValueConsumable[], selector: (item: LowValueConsumable) => T[]) {
  return items.reduce((total, item) => total + selector(item).length, 0);
}

function getRemainingReturnQty(record: ReturnRecord) {
  return Math.max(0, record.dispatchQty - record.returnedQty - record.lossQty);
}

export function LowValueConsumablesPage() {
  const [items, setItems] = useState<LowValueConsumable[]>(initialLowValueConsumables);
  const [categories, setCategories] = useState<ConsumableCategory[]>(initialConsumableCategories);
  const [filters, setFilters] = useState<FilterValues>({});
  const [categoryKeyword, setCategoryKeyword] = useState("");
  const [expandedCategoryKeys, setExpandedCategoryKeys] = useState<Key[]>([
    allCategoryKey,
    ...getAllCategoryIds(initialConsumableCategories),
  ]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(allCategoryKey);
  const [detailState, setDetailState] = useState<DetailState>();
  const [safetyItemId, setSafetyItemId] = useState<string>();
  const [inboundOpen, setInboundOpen] = useState(false);
  const [inboundMode, setInboundMode] = useState<InboundMode>("existing");
  const [inboundItemId, setInboundItemId] = useState<string>();
  const [issueItemId, setIssueItemId] = useState<string>();
  const [lossItemId, setLossItemId] = useState<string>();
  const [editItemId, setEditItemId] = useState<string>();
  const [dispatchState, setDispatchState] = useState<{ itemId: string; requestId: string }>();
  const [returnState, setReturnState] = useState<{ itemId: string; recordId: string }>();
  const [categoryModal, setCategoryModal] = useState<CategoryModalState>();

  const [filterForm] = Form.useForm<FilterValues>();
  const [safetyForm] = Form.useForm();
  const [inboundForm] = Form.useForm();
  const [issueForm] = Form.useForm();
  const [lossForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [dispatchForm] = Form.useForm();
  const [returnForm] = Form.useForm();
  const [categoryForm] = Form.useForm();

  const categoryOptions = useMemo(
    () => flattenCategories(categories).map((category) => ({ value: category.name, label: category.name })),
    [categories],
  );
  const selectedCategoryNames = useMemo(
    () => (selectedCategoryId === allCategoryKey ? [] : getCategoryNamesById(categories, selectedCategoryId)),
    [categories, selectedCategoryId],
  );
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();

    flattenCategories(categories).forEach((category) => {
      const categoryNames = collectCategoryNames(category);
      counts.set(category.id, items.filter((item) => categoryNames.includes(item.category)).length);
    });

    return counts;
  }, [categories, items]);
  const visibleCategories = useMemo(
    () => filterCategoryTree(categories, categoryKeyword),
    [categories, categoryKeyword],
  );
  const visibleCategoryKeys = useMemo(() => getAllCategoryIds(visibleCategories), [visibleCategories]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const codeMatched = !filters.code || item.code.includes(filters.code.trim());
      const nameMatched = !filters.name || item.name.includes(filters.name.trim());
      const areaMatched = !filters.area || item.area === filters.area;
      const categoryMatched =
        selectedCategoryId === allCategoryKey || selectedCategoryNames.includes(item.category);
      const stateMatched =
        !filters.stockState ||
        (filters.stockState === "待分发"
          ? item.pendingDispatch > 0
          : filters.stockState === "待归还"
            ? item.pendingReturn > 0
            : getStockStatus(item) === filters.stockState);

      return codeMatched && nameMatched && areaMatched && categoryMatched && stateMatched;
    });
  }, [filters, items, selectedCategoryId, selectedCategoryNames]);

  const detailItem = detailState ? items.find((item) => item.id === detailState.itemId) : undefined;
  const safetyItem = safetyItemId ? items.find((item) => item.id === safetyItemId) : undefined;
  const issueItem = issueItemId ? items.find((item) => item.id === issueItemId) : undefined;
  const lossItem = lossItemId ? items.find((item) => item.id === lossItemId) : undefined;
  const editItem = editItemId ? items.find((item) => item.id === editItemId) : undefined;
  const dispatchItem = dispatchState ? items.find((item) => item.id === dispatchState.itemId) : undefined;
  const dispatchRequest = dispatchItem?.pendingRequests.find((request) => request.id === dispatchState?.requestId);
  const returnItem = returnState ? items.find((item) => item.id === returnState.itemId) : undefined;
  const returnRecord = returnItem?.returnRecords.find((record) => record.id === returnState?.recordId);
  const inboundSelectedItemId = Form.useWatch("itemId", inboundForm) as string | undefined;
  const inboundSelectedItem = items.find((item) => item.id === inboundSelectedItemId);

  useEffect(() => {
    if (safetyItem) {
      safetyForm.setFieldsValue({
        safetyMin: safetyItem.safetyMin,
        safetyMax: safetyItem.safetyMax,
      });
    }
  }, [safetyForm, safetyItem]);

  useEffect(() => {
    if (inboundOpen) {
      inboundForm.resetFields();
      inboundForm.setFieldsValue({
        itemId: inboundItemId ?? items[0]?.id,
        area: consumableAreas[0],
        category: categoryOptions[0]?.value,
        unit: "个",
        admin: consumableAdmins[0],
        safetyMin: 0,
        safetyMax: 10,
      });
    }
  }, [categoryOptions, inboundForm, inboundItemId, inboundMode, inboundOpen, items]);

  useEffect(() => {
    if (issueItem) {
      issueForm.resetFields();
      issueForm.setFieldsValue({
        department: consumableDepartments[0],
        requestType: "领用",
      });
    }
  }, [issueForm, issueItem]);

  useEffect(() => {
    if (lossItem) {
      lossForm.resetFields();
    }
  }, [lossForm, lossItem]);

  useEffect(() => {
    if (editItem) {
      editForm.resetFields();
      editForm.setFieldsValue(editItem);
    }
  }, [editForm, editItem]);

  useEffect(() => {
    if (dispatchRequest) {
      dispatchForm.resetFields();
      dispatchForm.setFieldsValue({ dispatchQty: dispatchRequest.quantity });
    }
  }, [dispatchForm, dispatchRequest]);

  useEffect(() => {
    if (returnRecord) {
      returnForm.resetFields();
      returnForm.setFieldsValue({
        returnedQty: getRemainingReturnQty(returnRecord),
        lossQty: 0,
      });
    }
  }, [returnForm, returnRecord]);

  useEffect(() => {
    if (categoryModal) {
      categoryForm.resetFields();
      categoryForm.setFieldsValue({
        name: categoryModal.mode === "edit" ? categoryModal.initialName : "",
      });
    }
  }, [categoryForm, categoryModal]);

  useEffect(() => {
    if (categoryKeyword.trim()) {
      setExpandedCategoryKeys([allCategoryKey, ...visibleCategoryKeys]);
    }
  }, [categoryKeyword, visibleCategoryKeys]);

  const updateItem = (itemId: string, updater: (item: LowValueConsumable) => LowValueConsumable) => {
    setItems((currentItems) => currentItems.map((item) => (item.id === itemId ? updater(item) : item)));
  };

  const openInbound = (itemId?: string) => {
    setInboundMode("existing");
    setInboundItemId(itemId);
    setInboundOpen(true);
  };

  const closeInbound = () => {
    setInboundOpen(false);
    setInboundItemId(undefined);
  };

  const handleSearch = (values: FilterValues) => {
    setFilters(values);
  };

  const handleReset = () => {
    filterForm.resetFields();
    setFilters({});
  };

  const handleSaveSafety = async () => {
    if (!safetyItem) {
      return;
    }

    const values = await safetyForm.validateFields();
    updateItem(safetyItem.id, (item) => ({
      ...item,
      safetyMin: Number(values.safetyMin),
      safetyMax: Number(values.safetyMax),
    }));
    setSafetyItemId(undefined);
  };

  const handleSaveInbound = async () => {
    const values = await inboundForm.validateFields();
    const qty = Number(values.qty);
    const description = String(values.description);

    if (inboundMode === "existing") {
      const itemId = String(values.itemId);
      const inboundRecord: InboundRecord = {
        id: makeId("in"),
        orderNo: makeDocumentNo("RK", countRecords(items, (item) => item.inboundRecords)),
        qty,
        description,
        operator: operatorName,
        operatedAt: formatNow(),
      };

      updateItem(itemId, (item) => ({
        ...item,
        stock: item.stock + qty,
        inboundQty: item.inboundQty + qty,
        inboundRecords: [...item.inboundRecords, inboundRecord],
      }));
      closeInbound();
      return;
    }

    const code = makeNextItemCode(items);
    const newItem: LowValueConsumable = {
      id: makeId("lvc"),
      area: String(values.area),
      code,
      name: String(values.name),
      category: String(values.category),
      spec: String(values.spec),
      unit: String(values.unit),
      stock: qty,
      safetyMin: Number(values.safetyMin),
      safetyMax: Number(values.safetyMax),
      inboundQty: qty,
      issuedQty: 0,
      lossQty: 0,
      pendingDispatch: 0,
      pendingReturn: 0,
      admin: String(values.admin),
      inboundRecords: [
        {
          id: makeId("in"),
          orderNo: makeDocumentNo("RK", countRecords(items, (item) => item.inboundRecords)),
          qty,
          description,
          operator: operatorName,
          operatedAt: formatNow(),
        },
      ],
      issueRecords: [],
      pendingRequests: [],
      returnRecords: [],
      lossRecords: [],
    };

    setItems((currentItems) => [...currentItems, newItem]);
    closeInbound();
  };

  const handleSubmitIssue = async () => {
    if (!issueItem) {
      return;
    }

    const values = await issueForm.validateFields();
    const quantity = Number(values.quantity);
    const pendingRequest: PendingRequest = {
      id: makeId("req"),
      requestNo: makeDocumentNo(
        "SQ",
        countRecords(items, (item) => item.pendingRequests) +
          countRecords(items, (item) => item.issueRecords) +
          countRecords(items, (item) => item.returnRecords),
      ),
      requestType: values.requestType,
      applicant: String(values.applicant),
      department: String(values.department),
      quantity,
      description: String(values.description),
      createdAt: formatNow(),
    };

    updateItem(issueItem.id, (item) => ({
      ...item,
      pendingDispatch: item.pendingDispatch + quantity,
      pendingRequests: [...item.pendingRequests, pendingRequest],
    }));
    setIssueItemId(undefined);
  };

  const handleConfirmDispatch = async () => {
    if (!dispatchItem || !dispatchRequest) {
      return;
    }

    const values = await dispatchForm.validateFields();
    const dispatchQty = Number(values.dispatchQty);

    if (dispatchQty > dispatchRequest.quantity) {
      dispatchForm.setFields([{ name: "dispatchQty", errors: ["本次分发数量不能大于申请数量"] }]);
      return;
    }

    if (dispatchQty > dispatchItem.stock) {
      dispatchForm.setFields([{ name: "dispatchQty", errors: ["本次分发数量不能大于当前库存"] }]);
      return;
    }

    updateItem(dispatchItem.id, (item) => {
      const nextPendingRequests = item.pendingRequests.filter((request) => request.id !== dispatchRequest.id);
      const baseItem = {
        ...item,
        stock: item.stock - dispatchQty,
        pendingDispatch: Math.max(0, item.pendingDispatch - dispatchRequest.quantity),
        pendingRequests: nextPendingRequests,
      };

      if (dispatchRequest.requestType === "领用") {
        const issueRecord: IssueRecord = {
          id: makeId("iss"),
          requestNo: dispatchRequest.requestNo,
          requestType: "领用",
          applicant: dispatchRequest.applicant,
          quantity: dispatchRequest.quantity,
          area: item.area,
          department: dispatchRequest.department,
          dispatchQty,
          operator: operatorName,
          operatedAt: formatNow(),
        };

        return {
          ...baseItem,
          issuedQty: item.issuedQty + dispatchQty,
          issueRecords: [...item.issueRecords, issueRecord],
        };
      }

      const returnRecordItem: ReturnRecord = {
        id: makeId("ret"),
        requestNo: dispatchRequest.requestNo,
        requestType: "借用",
        applicant: dispatchRequest.applicant,
        quantity: dispatchRequest.quantity,
        area: item.area,
        department: dispatchRequest.department,
        dispatchQty,
        returnedQty: 0,
        lossQty: 0,
        operator: operatorName,
        operatedAt: formatNow(),
      };

      return {
        ...baseItem,
        pendingReturn: item.pendingReturn + dispatchQty,
        returnRecords: [...item.returnRecords, returnRecordItem],
      };
    });
    setDispatchState(undefined);
  };

  const handleConfirmReturn = async () => {
    if (!returnItem || !returnRecord) {
      return;
    }

    const values = await returnForm.validateFields();
    const returnedQty = Number(values.returnedQty ?? 0);
    const lossQty = Number(values.lossQty ?? 0);
    const totalQty = returnedQty + lossQty;
    const remainingQty = getRemainingReturnQty(returnRecord);

    if (totalQty <= 0) {
      returnForm.setFields([{ name: "returnedQty", errors: ["归还数量与损耗数量合计必须大于 0"] }]);
      return;
    }

    if (totalQty > remainingQty) {
      returnForm.setFields([{ name: "returnedQty", errors: ["归还数量与损耗数量合计不能超过未归还数量"] }]);
      return;
    }

    updateItem(returnItem.id, (item) => {
      const updatedReturnRecords = item.returnRecords
        .map((record) =>
          record.id === returnRecord.id
            ? {
                ...record,
                returnedQty: record.returnedQty + returnedQty,
                lossQty: record.lossQty + lossQty,
              }
            : record,
        )
        .filter((record) => getRemainingReturnQty(record) > 0);
      const lossRecord: LossRecord | undefined =
        lossQty > 0
          ? {
              id: makeId("loss"),
              recordNo: makeDocumentNo("SH", countRecords(items, (currentItem) => currentItem.lossRecords)),
              type: "归还损耗",
              qty: lossQty,
              description: String(values.description),
              operator: operatorName,
              operatedAt: formatNow(),
            }
          : undefined;

      return {
        ...item,
        stock: item.stock + returnedQty,
        pendingReturn: Math.max(0, item.pendingReturn - totalQty),
        lossQty: item.lossQty + lossQty,
        returnRecords: updatedReturnRecords,
        lossRecords: lossRecord ? [...item.lossRecords, lossRecord] : item.lossRecords,
      };
    });
    setReturnState(undefined);
  };

  const handleSaveNaturalLoss = async () => {
    if (!lossItem) {
      return;
    }

    const values = await lossForm.validateFields();
    const qty = Number(values.qty);

    if (qty > lossItem.stock) {
      lossForm.setFields([{ name: "qty", errors: ["损耗数量不能大于当前库存"] }]);
      return;
    }

    const lossRecord: LossRecord = {
      id: makeId("loss"),
      recordNo: makeDocumentNo("SH", countRecords(items, (item) => item.lossRecords)),
      type: "自然损耗",
      qty,
      description: String(values.description),
      operator: operatorName,
      operatedAt: formatNow(),
    };

    updateItem(lossItem.id, (item) => ({
      ...item,
      stock: item.stock - qty,
      lossQty: item.lossQty + qty,
      lossRecords: [...item.lossRecords, lossRecord],
    }));
    setLossItemId(undefined);
  };

  const handleSaveEditItem = async () => {
    if (!editItem) {
      return;
    }

    const values = await editForm.validateFields();
    updateItem(editItem.id, (item) => ({
      ...item,
      name: String(values.name),
      area: String(values.area),
      category: String(values.category),
      spec: String(values.spec),
      unit: String(values.unit),
      admin: String(values.admin),
      safetyMin: Number(values.safetyMin),
      safetyMax: Number(values.safetyMax),
    }));
    setEditItemId(undefined);
  };

  const handleSaveCategory = async () => {
    const values = await categoryForm.validateFields();
    const nextName = String(values.name).trim();

    if (!categoryModal || !nextName) {
      return;
    }

    if (categoryModal.mode === "create") {
      const newCategory = { id: makeId("cat"), name: nextName };
      setCategories((currentCategories) => addCategory(currentCategories, categoryModal.parentId, newCategory));
      setExpandedCategoryKeys((currentKeys) =>
        Array.from(new Set([...currentKeys, allCategoryKey, categoryModal.parentId].filter(Boolean) as string[])),
      );
      setCategoryModal(undefined);
      return;
    }

    const oldName = categoryModal.initialName;
    setCategories((currentCategories) => renameCategory(currentCategories, categoryModal.categoryId, nextName));
    setItems((currentItems) =>
      currentItems.map((item) => (item.category === oldName ? { ...item, category: nextName } : item)),
    );
    setCategoryModal(undefined);
  };

  const handleDeleteCategory = (category: ConsumableCategory) => {
    Modal.confirm({
      title: "删除分类",
      content: `确认删除“${category.name}”及其下级分类？当前原型会直接删除分类节点，不校验物品引用。`,
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

  const renderCategoryTitle = (options: {
    key: string;
    name: string;
    count: number;
    category?: ConsumableCategory;
    all?: boolean;
  }) => (
    <div className="consumable-tree-node-title">
      <span className="consumable-tree-node-title__label">
        <span>
          {options.name}（{options.count}）
        </span>
      </span>
      <span className="consumable-tree-node-title__actions">
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
              <Button
                aria-label={`${options.name}分类操作`}
                icon={<MoreHorizontal size={15} />}
                size="small"
                type="text"
                onClick={(event) => event.stopPropagation()}
              />
            </Tooltip>
          </Popover>
        )}
      </span>
    </div>
  );

  const renderCategoryMenu = (category?: ConsumableCategory) => (
    <div className="consumable-category-menu">
      <Button
        icon={<Plus size={15} />}
        type="text"
        onClick={() => setCategoryModal({ mode: "create", parentId: category?.id })}
      >
        {category ? "新增下级分类" : "新增一级分类"}
      </Button>
      {category ? (
        <>
          <Button
            icon={<Pencil size={15} />}
            type="text"
            onClick={() => setCategoryModal({ mode: "edit", categoryId: category.id, initialName: category.name })}
          >
            编辑分类
          </Button>
          <Button icon={<Trash2 size={15} />} danger type="text" onClick={() => handleDeleteCategory(category)}>
            删除分类
          </Button>
        </>
      ) : null}
    </div>
  );

  const buildCategoryTreeData = (categoryList: ConsumableCategory[]): CategoryTreeNode[] =>
    categoryList.map((category) => ({
      key: category.id,
      title: renderCategoryTitle({
        key: category.id,
        name: category.name,
        count: categoryCounts.get(category.id) ?? 0,
        category,
      }),
      children: category.children?.length ? buildCategoryTreeData(category.children) : undefined,
    }));

  const categoryTreeData: CategoryTreeNode[] = [
    {
      key: allCategoryKey,
      title: renderCategoryTitle({
        key: allCategoryKey,
        name: "全部分类",
        count: items.length,
        all: true,
      }),
      children: buildCategoryTreeData(visibleCategories),
    },
  ];

  const columns: ColumnsType<LowValueConsumable> = [
    {
      title: "序号",
      key: "index",
      width: 70,
      fixed: "left",
      align: "center",
      render: (_value, _record, index) => index + 1,
    },
    { title: "区域", dataIndex: "area", key: "area", width: 120, fixed: "left" },
    { title: "名称", dataIndex: "name", key: "name", width: 140, fixed: "left" },
    { title: "编号", dataIndex: "code", key: "code", width: 110 },
    { title: "分类", dataIndex: "category", key: "category", width: 130 },
    { title: "规格", dataIndex: "spec", key: "spec", width: 150 },
    { title: "单位", dataIndex: "unit", key: "unit", width: 80 },
    { title: "库存", dataIndex: "stock", key: "stock", width: 90, align: "right" },
    {
      title: "库存状态",
      key: "stockState",
      width: 110,
      render: (_, record) => {
        const status = getStockStatus(record);
        return <Tag color={stockStatusColor[status]}>{status}</Tag>;
      },
    },
    {
      title: "安全库存",
      key: "safety",
      width: 120,
      render: (_, record) => (
        <Button className="consumable-number-button" type="link" onClick={() => setSafetyItemId(record.id)}>
          {record.safetyMin} - {record.safetyMax}
        </Button>
      ),
    },
    {
      title: "入库",
      dataIndex: "inboundQty",
      key: "inboundQty",
      width: 90,
      align: "right",
      render: (value: number, record) => (
        <Button
          className="consumable-number-button"
          type="link"
          onClick={() => setDetailState({ type: "inbound", itemId: record.id })}
        >
          {value}
        </Button>
      ),
    },
    {
      title: "已领用",
      dataIndex: "issuedQty",
      key: "issuedQty",
      width: 90,
      align: "right",
      render: (value: number, record) => (
        <Button
          className="consumable-number-button"
          type="link"
          onClick={() => setDetailState({ type: "issued", itemId: record.id })}
        >
          {value}
        </Button>
      ),
    },
    {
      title: "损耗",
      dataIndex: "lossQty",
      key: "lossQty",
      width: 80,
      align: "right",
      render: (value: number, record) => (
        <Button
          className="consumable-number-button"
          type="link"
          onClick={() => setDetailState({ type: "loss", itemId: record.id })}
        >
          {value}
        </Button>
      ),
    },
    {
      title: "待分发",
      dataIndex: "pendingDispatch",
      key: "pendingDispatch",
      width: 90,
      align: "right",
      render: (value: number, record) => (
        <Button
          className="consumable-number-button"
          type="link"
          onClick={() => setDetailState({ type: "dispatch", itemId: record.id })}
        >
          {value}
        </Button>
      ),
    },
    {
      title: "待归还",
      dataIndex: "pendingReturn",
      key: "pendingReturn",
      width: 90,
      align: "right",
      render: (value: number, record) => (
        <Button
          className="consumable-number-button"
          type="link"
          onClick={() => setDetailState({ type: "return", itemId: record.id })}
        >
          {value}
        </Button>
      ),
    },
    { title: "行政管理人员", dataIndex: "admin", key: "admin", width: 130 },
    {
      title: "操作",
      key: "action",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <TableActions
          actions={[
            { key: "inbound", label: "入库", onClick: () => openInbound(record.id) },
            { key: "issue", label: "申领", onClick: () => setIssueItemId(record.id) },
            { key: "loss", label: "损耗出库", danger: true, onClick: () => setLossItemId(record.id) },
            { key: "edit", label: "编辑", onClick: () => setEditItemId(record.id) },
          ]}
        />
      ),
    },
  ];

  const renderDetailTable = () => {
    if (!detailItem || !detailState) {
      return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }

    if (detailState.type === "inbound") {
      const inboundColumns: ColumnsType<InboundRecord> = [
        { title: "入库单号", dataIndex: "orderNo", key: "orderNo", width: 180 },
        { title: "数量", dataIndex: "qty", key: "qty", width: 90, align: "right" },
        { title: "说明", dataIndex: "description", key: "description", minWidth: 220 },
        { title: "操作人", dataIndex: "operator", key: "operator", width: 110 },
        { title: "操作日期", dataIndex: "operatedAt", key: "operatedAt", width: 160 },
      ];

      return (
        <Table
          columns={inboundColumns}
          dataSource={detailItem.inboundRecords}
          locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无入库记录" /> }}
          pagination={false}
          rowKey="id"
          scroll={{ x: 760 }}
        />
      );
    }

    if (detailState.type === "issued") {
      const issueColumns: ColumnsType<IssueRecord> = [
        { title: "申请单号", dataIndex: "requestNo", key: "requestNo", width: 180 },
        { title: "申请类型", dataIndex: "requestType", key: "requestType", width: 100, render: (value: "领用") => <Tag color={requestTypeColor[value]}>{value}</Tag> },
        { title: "申请人", dataIndex: "applicant", key: "applicant", width: 100 },
        { title: "申请数量", dataIndex: "quantity", key: "quantity", width: 100, align: "right" },
        { title: "区域", dataIndex: "area", key: "area", width: 120 },
        { title: "部门", dataIndex: "department", key: "department", width: 120 },
        { title: "分发数量", dataIndex: "dispatchQty", key: "dispatchQty", width: 100, align: "right" },
        { title: "操作人", dataIndex: "operator", key: "operator", width: 100 },
        { title: "操作日期", dataIndex: "operatedAt", key: "operatedAt", width: 160 },
      ];

      return (
        <Table
          columns={issueColumns}
          dataSource={detailItem.issueRecords}
          locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无已领用记录" /> }}
          pagination={false}
          rowKey="id"
          scroll={{ x: 1080 }}
        />
      );
    }

    if (detailState.type === "loss") {
      const lossColumns: ColumnsType<LossRecord> = [
        { title: "记录单号", dataIndex: "recordNo", key: "recordNo", width: 180 },
        { title: "类型", dataIndex: "type", key: "type", width: 110, render: (value) => <Tag color={value === "自然损耗" ? "orange" : "volcano"}>{value}</Tag> },
        { title: "损耗数量", dataIndex: "qty", key: "qty", width: 100, align: "right" },
        { title: "损耗说明", dataIndex: "description", key: "description", minWidth: 220 },
        { title: "操作人", dataIndex: "operator", key: "operator", width: 100 },
        { title: "操作时间", dataIndex: "operatedAt", key: "operatedAt", width: 160 },
      ];

      return (
        <Table
          columns={lossColumns}
          dataSource={detailItem.lossRecords}
          locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无损耗记录" /> }}
          pagination={false}
          rowKey="id"
          scroll={{ x: 870 }}
        />
      );
    }

    if (detailState.type === "dispatch") {
      const pendingColumns: ColumnsType<PendingRequest> = [
        { title: "申请单号", dataIndex: "requestNo", key: "requestNo", width: 180 },
        { title: "申请类型", dataIndex: "requestType", key: "requestType", width: 100, render: (value: "领用" | "借用") => <Tag color={requestTypeColor[value]}>{value}</Tag> },
        { title: "申请人", dataIndex: "applicant", key: "applicant", width: 100 },
        { title: "申请数量", dataIndex: "quantity", key: "quantity", width: 100, align: "right" },
        { title: "申请说明", dataIndex: "description", key: "description", minWidth: 220 },
        {
          title: "操作",
          key: "action",
          width: 120,
          fixed: "right",
          render: (_, record) => (
            <Button
              size="small"
              type="link"
              onClick={() => {
                setDetailState(undefined);
                setDispatchState({ itemId: detailItem.id, requestId: record.id });
              }}
            >
              确认分发
            </Button>
          ),
        },
      ];

      return (
        <Table
          columns={pendingColumns}
          dataSource={detailItem.pendingRequests}
          locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无待分发申请" /> }}
          pagination={false}
          rowKey="id"
          scroll={{ x: 820 }}
        />
      );
    }

    const returnColumns: ColumnsType<ReturnRecord> = [
      { title: "申请单号", dataIndex: "requestNo", key: "requestNo", width: 180 },
      { title: "申请类型", dataIndex: "requestType", key: "requestType", width: 100, render: (value: "借用") => <Tag color={requestTypeColor[value]}>{value}</Tag> },
      { title: "申请人", dataIndex: "applicant", key: "applicant", width: 100 },
      { title: "申请数量", dataIndex: "quantity", key: "quantity", width: 100, align: "right" },
      { title: "区域", dataIndex: "area", key: "area", width: 120 },
      { title: "部门", dataIndex: "department", key: "department", width: 120 },
      { title: "分发数量", dataIndex: "dispatchQty", key: "dispatchQty", width: 100, align: "right" },
      { title: "未归还", key: "remaining", width: 100, align: "right", render: (_, record) => getRemainingReturnQty(record) },
      { title: "操作人", dataIndex: "operator", key: "operator", width: 100 },
      { title: "操作日期", dataIndex: "operatedAt", key: "operatedAt", width: 160 },
      {
        title: "操作",
        key: "action",
        width: 120,
        fixed: "right",
        render: (_, record) => (
          <Button
            size="small"
            type="link"
            onClick={() => {
              setDetailState(undefined);
              setReturnState({ itemId: detailItem.id, recordId: record.id });
            }}
          >
            确认归还
          </Button>
        ),
      },
    ];

    return (
      <Table
        columns={returnColumns}
        dataSource={detailItem.returnRecords}
        locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无待归还记录" /> }}
        pagination={false}
        rowKey="id"
        scroll={{ x: 1300 }}
      />
    );
  };

  const detailTitleMap: Record<DetailType, string> = {
    inbound: "入库记录",
    issued: "已领用记录",
    loss: "损耗记录",
    dispatch: "待分发列表",
    return: "待归还列表",
  };

  return (
    <main className="page low-value-consumables-page">
      <section className="filter-panel standard-list-filter" aria-label="低值易耗品查询区">
        <Form form={filterForm} layout="inline" onFinish={handleSearch}>
          <Form.Item name="name">
            <Input allowClear placeholder="物品名称" className="standard-list-filter__keyword" />
          </Form.Item>
          <Form.Item name="code">
            <Input allowClear placeholder="物品编号" className="standard-list-filter__keyword" />
          </Form.Item>
          <Form.Item name="area">
            <Select
              allowClear
              placeholder="全部区域"
              style={{ width: 140 }}
              options={consumableAreas.map((area) => ({ value: area, label: area }))}
            />
          </Form.Item>
          <Form.Item name="stockState">
            <Select
              allowClear
              placeholder="全部状态"
              style={{ width: 140 }}
              options={["正常", "低于下限", "高于上限", "待分发", "待归还"].map((state) => ({
                value: state,
                label: state,
              }))}
            />
          </Form.Item>
          <Form.Item className="standard-list-filter__actions">
            <div className="standard-list-filter__action-row">
              <Space wrap className="standard-list-filter__query-actions">
                <Button type="primary" htmlType="submit" icon={<Filter size={16} />}>
                  查询
                </Button>
                <Button icon={<RotateCcw size={16} />} onClick={handleReset}>
                  重置
                </Button>
              </Space>
              <Space wrap className="standard-list-filter__business-actions">
                <Button
                  className="standard-list-filter__create-action"
                  icon={<PackagePlus size={16} />}
                  onClick={() => openInbound()}
                >
                  新增入库
                </Button>
              </Space>
            </div>
          </Form.Item>
        </Form>
      </section>

      <TreeListLayout
        className="low-value-consumables-layout"
        sidebarWidth={300}
        tree={
          <SectionPanel>
            <Input.Search
              allowClear
              className="tree-list-search consumable-tree-search"
              placeholder="搜索分类"
              value={categoryKeyword}
              onChange={(event) => setCategoryKeyword(event.target.value)}
              onSearch={setCategoryKeyword}
            />
            <Tree
              blockNode
              className="consumable-category-tree"
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
        <SectionPanel>
          <Table
            columns={columns}
            dataSource={filteredItems}
            pagination={{ current: 1, pageSize: 10, total: filteredItems.length, showSizeChanger: true }}
            rowKey="id"
            scroll={{ x: 1860 }}
          />
        </SectionPanel>
      </TreeListLayout>

      <Modal
        destroyOnClose
        okText="保存"
        onCancel={() => setSafetyItemId(undefined)}
        onOk={handleSaveSafety}
        open={Boolean(safetyItem)}
        title="安全库存设置"
      >
        <Form form={safetyForm} layout="vertical">
          <Descriptions
            className="consumable-modal-summary"
            column={1}
            size="small"
            items={[
              { key: "item", label: "物品", children: safetyItem ? `${safetyItem.code} ${safetyItem.name}` : "-" },
              { key: "stock", label: "当前库存", children: safetyItem?.stock ?? "-" },
            ]}
          />
          <div className="consumable-form-grid consumable-form-grid--two">
            <Form.Item
              label="下限"
              name="safetyMin"
              rules={[
                { required: true, message: "请输入安全库存下限" },
                { type: "number", min: 0, message: "下限必须大于等于 0" },
              ]}
            >
              <InputNumber min={0} precision={0} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label="上限"
              name="safetyMax"
              rules={[
                { required: true, message: "请输入安全库存上限" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (value === undefined || value >= getFieldValue("safetyMin")) {
                      return Promise.resolve();
                    }

                    return Promise.reject(new Error("上限必须大于等于下限"));
                  },
                }),
              ]}
            >
              <InputNumber min={0} precision={0} style={{ width: "100%" }} />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <Modal
        destroyOnClose
        footer={null}
        onCancel={() => setDetailState(undefined)}
        open={Boolean(detailItem && detailState)}
        title={detailState ? `${detailItem?.code ?? ""} ${detailItem?.name ?? ""} - ${detailTitleMap[detailState.type]}` : ""}
        width={1040}
      >
        {renderDetailTable()}
      </Modal>

      <Modal
        destroyOnClose
        okText="确认入库"
        onCancel={closeInbound}
        onOk={handleSaveInbound}
        open={inboundOpen}
        title="新增入库"
        width={760}
      >
        <Radio.Group
          className="consumable-mode-switch"
          optionType="button"
          buttonStyle="solid"
          value={inboundMode}
          onChange={(event) => setInboundMode(event.target.value)}
          options={[
            { value: "existing", label: "已有物品入库" },
            { value: "new", label: "新增物品入库" },
          ]}
        />
        <Form form={inboundForm} layout="vertical">
          {inboundMode === "existing" ? (
            <>
              <Form.Item label="选择物品" name="itemId" rules={[{ required: true, message: "请选择物品" }]}>
                <Select
                  showSearch
                  optionFilterProp="label"
                  options={items.map((item) => ({
                    value: item.id,
                    label: `${item.code} ${item.name}`,
                  }))}
                />
              </Form.Item>
              <Descriptions
                className="consumable-modal-summary"
                column={2}
                size="small"
                items={[
                  { key: "area", label: "区域", children: inboundSelectedItem?.area ?? "-" },
                  { key: "stock", label: "库存", children: inboundSelectedItem?.stock ?? "-" },
                ]}
              />
              <Form.Item
                label="入库数量"
                name="qty"
                rules={[
                  { required: true, message: "请输入入库数量" },
                  { type: "number", min: 1, message: "入库数量必须大于 0" },
                ]}
              >
                <InputNumber min={1} precision={0} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item label="入库说明" name="description" rules={[{ required: true, message: "请输入入库说明" }]}>
                <Input.TextArea rows={3} />
              </Form.Item>
            </>
          ) : (
            <div className="consumable-form-grid consumable-form-grid--two">
              <Form.Item label="区域" name="area" rules={[{ required: true, message: "请选择区域" }]}>
                <Select options={consumableAreas.map((area) => ({ value: area, label: area }))} />
              </Form.Item>
              <Form.Item label="分类" name="category" rules={[{ required: true, message: "请选择分类" }]}>
                <Select showSearch optionFilterProp="label" options={categoryOptions} />
              </Form.Item>
              <Form.Item label="名称" name="name" rules={[{ required: true, message: "请输入名称" }]}>
                <Input />
              </Form.Item>
              <Form.Item label="规格" name="spec" rules={[{ required: true, message: "请输入规格" }]}>
                <Input />
              </Form.Item>
              <Form.Item label="单位" name="unit" rules={[{ required: true, message: "请选择单位" }]}>
                <Select options={consumableUnits.map((unit) => ({ value: unit, label: unit }))} />
              </Form.Item>
              <Form.Item
                label="入库数量"
                name="qty"
                rules={[
                  { required: true, message: "请输入入库数量" },
                  { type: "number", min: 1, message: "入库数量必须大于 0" },
                ]}
              >
                <InputNumber min={1} precision={0} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item label="行政管理人员" name="admin" rules={[{ required: true, message: "请选择行政管理人员" }]}>
                <Select options={consumableAdmins.map((admin) => ({ value: admin, label: admin }))} />
              </Form.Item>
              <Form.Item
                label="安全库存下限"
                name="safetyMin"
                rules={[
                  { required: true, message: "请输入安全库存下限" },
                  { type: "number", min: 0, message: "下限必须大于等于 0" },
                ]}
              >
                <InputNumber min={0} precision={0} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                label="安全库存上限"
                name="safetyMax"
                rules={[
                  { required: true, message: "请输入安全库存上限" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (value === undefined || value >= getFieldValue("safetyMin")) {
                        return Promise.resolve();
                      }

                      return Promise.reject(new Error("上限必须大于等于下限"));
                    },
                  }),
                ]}
              >
                <InputNumber min={0} precision={0} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                className="consumable-form-grid__full"
                label="入库说明"
                name="description"
                rules={[{ required: true, message: "请输入入库说明" }]}
              >
                <Input.TextArea rows={3} />
              </Form.Item>
            </div>
          )}
        </Form>
      </Modal>

      <Modal
        destroyOnClose
        okText="提交申领"
        onCancel={() => setIssueItemId(undefined)}
        onOk={handleSubmitIssue}
        open={Boolean(issueItem)}
        title="发起申领"
        width={640}
      >
        <Descriptions
          className="consumable-modal-summary"
          column={2}
          size="small"
          items={[
            { key: "area", label: "区域", children: issueItem?.area ?? "-" },
            { key: "stock", label: "库存", children: issueItem?.stock ?? "-" },
            { key: "admin", label: "行政管理人员", children: issueItem?.admin ?? "-" },
          ]}
        />
        <Form form={issueForm} layout="vertical">
          <div className="consumable-form-grid consumable-form-grid--two">
            <Form.Item label="申领人" name="applicant" rules={[{ required: true, message: "请输入申领人" }]}>
              <Input />
            </Form.Item>
            <Form.Item label="所属部门" name="department" rules={[{ required: true, message: "请选择所属部门" }]}>
              <Select options={consumableDepartments.map((department) => ({ value: department, label: department }))} />
            </Form.Item>
            <Form.Item label="申请类型" name="requestType" rules={[{ required: true, message: "请选择申请类型" }]}>
              <Radio.Group
                options={[
                  { value: "领用", label: "领用" },
                  { value: "借用", label: "借用" },
                ]}
              />
            </Form.Item>
            <Form.Item
              label="申领数量"
              name="quantity"
              rules={[
                { required: true, message: "请输入申领数量" },
                { type: "number", min: 1, message: "申领数量必须大于 0" },
              ]}
            >
              <InputNumber min={1} precision={0} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              className="consumable-form-grid__full"
              label="说明"
              name="description"
              rules={[{ required: true, message: "请输入说明" }]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <Modal
        destroyOnClose
        okText="确认分发"
        onCancel={() => setDispatchState(undefined)}
        onOk={handleConfirmDispatch}
        open={Boolean(dispatchItem && dispatchRequest)}
        title="确认分发"
      >
        <Descriptions
          className="consumable-modal-summary"
          column={1}
          size="small"
          items={[
            { key: "item", label: "物品", children: dispatchItem ? `${dispatchItem.code} ${dispatchItem.name}` : "-" },
            { key: "request", label: "申请单", children: dispatchRequest?.requestNo ?? "-" },
            { key: "qty", label: "申请数量", children: dispatchRequest?.quantity ?? "-" },
            { key: "stock", label: "当前库存", children: dispatchItem?.stock ?? "-" },
          ]}
        />
        <Form form={dispatchForm} layout="vertical">
          <Form.Item
            label="本次分发数量"
            name="dispatchQty"
            rules={[
              { required: true, message: "请输入本次分发数量" },
              { type: "number", min: 1, message: "本次分发数量必须大于 0" },
            ]}
          >
            <InputNumber min={1} precision={0} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        destroyOnClose
        okText="确认归还"
        onCancel={() => setReturnState(undefined)}
        onOk={handleConfirmReturn}
        open={Boolean(returnItem && returnRecord)}
        title="确认归还"
      >
        <Descriptions
          className="consumable-modal-summary"
          column={1}
          size="small"
          items={[
            { key: "item", label: "物品", children: returnItem ? `${returnItem.code} ${returnItem.name}` : "-" },
            { key: "request", label: "借用信息", children: returnRecord ? `${returnRecord.requestNo} / ${returnRecord.applicant} / ${returnRecord.department}` : "-" },
            { key: "remaining", label: "未归还数量", children: returnRecord ? getRemainingReturnQty(returnRecord) : "-" },
          ]}
        />
        <Form form={returnForm} layout="vertical">
          <div className="consumable-form-grid consumable-form-grid--two">
            <Form.Item
              label="本次归还数量"
              name="returnedQty"
              rules={[
                { required: true, message: "请输入本次归还数量" },
                { type: "number", min: 0, message: "归还数量不能小于 0" },
              ]}
            >
              <InputNumber min={0} precision={0} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label="损耗数量"
              name="lossQty"
              rules={[
                { required: true, message: "请输入损耗数量" },
                { type: "number", min: 0, message: "损耗数量不能小于 0" },
              ]}
            >
              <InputNumber min={0} precision={0} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              className="consumable-form-grid__full"
              label="损耗说明"
              name="description"
              rules={[{ required: true, message: "请输入损耗说明；无损耗时可填写正常归还" }]}
            >
              <Input.TextArea rows={3} placeholder="无损耗时可填写：正常归还" />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <Modal
        destroyOnClose
        okText="确认出库"
        okButtonProps={{ danger: true }}
        onCancel={() => setLossItemId(undefined)}
        onOk={handleSaveNaturalLoss}
        open={Boolean(lossItem)}
        title="损耗出库"
      >
        <Descriptions
          className="consumable-modal-summary"
          column={1}
          size="small"
          items={[
            { key: "item", label: "物品", children: lossItem ? `${lossItem.code} ${lossItem.name}` : "-" },
            { key: "stock", label: "当前库存", children: lossItem?.stock ?? "-" },
          ]}
        />
        <Form form={lossForm} layout="vertical">
          <Form.Item
            label="损耗数量"
            name="qty"
            rules={[
              { required: true, message: "请输入损耗数量" },
              { type: "number", min: 1, message: "损耗数量必须大于 0" },
            ]}
          >
            <InputNumber min={1} precision={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="损耗说明" name="description" rules={[{ required: true, message: "请输入损耗说明" }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        destroyOnClose
        okText="保存"
        onCancel={() => setEditItemId(undefined)}
        onOk={handleSaveEditItem}
        open={Boolean(editItem)}
        title="编辑物品"
        width={760}
      >
        <Form form={editForm} layout="vertical">
          <div className="consumable-form-grid consumable-form-grid--two">
            <Form.Item label="编号" name="code">
              <Input disabled />
            </Form.Item>
            <Form.Item label="名称" name="name" rules={[{ required: true, message: "请输入名称" }]}>
              <Input />
            </Form.Item>
            <Form.Item label="区域" name="area" rules={[{ required: true, message: "请选择区域" }]}>
              <Select options={consumableAreas.map((area) => ({ value: area, label: area }))} />
            </Form.Item>
            <Form.Item label="分类" name="category" rules={[{ required: true, message: "请选择分类" }]}>
              <Select showSearch optionFilterProp="label" options={categoryOptions} />
            </Form.Item>
            <Form.Item label="规格" name="spec" rules={[{ required: true, message: "请输入规格" }]}>
              <Input />
            </Form.Item>
            <Form.Item label="单位" name="unit" rules={[{ required: true, message: "请选择单位" }]}>
              <Select options={consumableUnits.map((unit) => ({ value: unit, label: unit }))} />
            </Form.Item>
            <Form.Item label="行政管理人员" name="admin" rules={[{ required: true, message: "请选择行政管理人员" }]}>
              <Select options={consumableAdmins.map((admin) => ({ value: admin, label: admin }))} />
            </Form.Item>
            <Form.Item
              label="安全库存下限"
              name="safetyMin"
              rules={[
                { required: true, message: "请输入安全库存下限" },
                { type: "number", min: 0, message: "下限必须大于等于 0" },
              ]}
            >
              <InputNumber min={0} precision={0} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label="安全库存上限"
              name="safetyMax"
              rules={[
                { required: true, message: "请输入安全库存上限" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (value === undefined || value >= getFieldValue("safetyMin")) {
                      return Promise.resolve();
                    }

                    return Promise.reject(new Error("上限必须大于等于下限"));
                  },
                }),
              ]}
            >
              <InputNumber min={0} precision={0} style={{ width: "100%" }} />
            </Form.Item>
          </div>
        </Form>
      </Modal>

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
