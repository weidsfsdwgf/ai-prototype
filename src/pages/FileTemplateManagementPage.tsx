import { Button, Dropdown, Empty, Form, Input, Modal, Select, Space, Upload } from "antd";
import dayjs from "dayjs";
import {
  Check,
  ChevronDown,
  Copy,
  FilePlus2,
  FileText,
  GripVertical,
  Library,
  Plus,
  Search,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useMemo, useState } from "react";
import { SectionPanel } from "../components/SectionPanel";
import {
  fileTemplateBusinesses,
  type FileTemplate,
  type FileTemplateBusiness,
  type FileTemplateBusinessId,
  type StandardCharacter,
} from "../data/fileTemplateManagement";
import "./FileTemplateManagementPage.css";
import "./Page.css";

type CreateTemplateForm = {
  name: string;
  fileName: string;
};

function formatNow() {
  return dayjs().format("YYYY-MM-DD HH:mm");
}

function findCharacter(characters: StandardCharacter[], id: string) {
  return characters.find((character) => character.id === id);
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
    return items;
  }

  const nextItems = [...items];
  const [movedItem] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, movedItem);

  return nextItems;
}

function inferPlaceholdersFromFile(fileName: string, business: FileTemplateBusiness) {
  const presets: Record<FileTemplateBusinessId, string[]> = {
    "hr-contract": ["file_no", "company_name", "employee_name", "id_card_no", "department", "position", "hire_date"],
    offer: ["candidate_name", "offer_department", "offer_position", "probation_salary", "regular_salary", "report_date"],
    "resignation-certificate": ["employee_name", "employee_no", "department", "position", "hire_date", "resignation_date", "company_name"],
  };
  const normalizedFileName = fileName.toLowerCase();
  const priorityIds = normalizedFileName.includes("英文")
    ? ["employee_name", "working_period", "resignation_date", "seal_name", "file_date"]
    : presets[business.id];
  const knownIds = new Set(business.characters.map((character) => character.id));

  return priorityIds.filter((id) => knownIds.has(id));
}

function FilePreview({ template, characters }: { template: FileTemplate; characters: StandardCharacter[] }) {
  const previewCharacters = template.placeholders
    .map((id) => findCharacter(characters, id))
    .filter((character): character is StandardCharacter => Boolean(character))
    .slice(0, 7);

  if (!template.fileName) {
    return (
      <div className="file-template-empty-state">
        <FileText size={42} />
        <h3>等待文件解析</h3>
        <p>上传文件后系统会自动解析填充符</p>
      </div>
    );
  }

  return (
    <div className="file-template-preview">
      <div className="file-template-preview__paper">
        <div className="file-template-preview__title">{template.name}</div>
        <p>
          文件名称：<strong>{template.fileName}</strong>
        </p>
        <p>
          文件编号：<mark>{"{{file_no}}"}</mark>
        </p>
        <p>
          文件主体：<mark>{"{{company_name}}"}</mark>
        </p>
        <p>
          解析填充符：
          {previewCharacters.map((character) => (
            <mark key={character.id}>{character.token}</mark>
          ))}
        </p>
        <p>
          签发日期：<mark>{"{{file_date}}"}</mark>
        </p>
      </div>
    </div>
  );
}

function PlaceholderLibraryModal({
  open,
  characters,
  copiedToken,
  onCancel,
  onCopy,
}: {
  open: boolean;
  characters: StandardCharacter[];
  copiedToken: string;
  onCancel: () => void;
  onCopy: (token: string) => void;
}) {
  const [keyword, setKeyword] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const sourceOptions = useMemo(() => Array.from(new Set(characters.map((character) => character.source))), [characters]);
  const filteredCharacters = useMemo(
    () =>
      characters.filter((character) => {
        const matchedKeyword =
          !keyword.trim() || character.name.includes(keyword.trim()) || character.token.includes(keyword.trim());
        const matchedSource = sources.length === 0 || sources.includes(character.source);

        return matchedKeyword && matchedSource;
      }),
    [characters, keyword, sources],
  );

  return (
    <Modal
      destroyOnClose
      title="填充符列表"
      open={open}
      onCancel={onCancel}
      footer={<Button onClick={onCancel}>关闭</Button>}
      width={860}
    >
      <div className="file-template-library">
        <div className="file-template-library__filters">
          <Input
            allowClear
            prefix={<Search size={15} />}
            placeholder="搜索填充符名称或编码"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <Select
            allowClear
            maxTagCount="responsive"
            mode="multiple"
            placeholder="来源"
            value={sources}
            options={sourceOptions.map((item) => ({ value: item, label: item }))}
            onChange={setSources}
          />
        </div>
        <div className="file-template-library__list">
          {filteredCharacters.length ? (
            filteredCharacters.map((character) => (
              <div className="file-template-library-row" key={character.id}>
                <div className="file-template-library-row__main">
                  <strong>{character.name}</strong>
                  <code>{character.token}</code>
                  <small>{character.source}</small>
                </div>
                <Button
                  aria-label="复制填充符"
                  type="text"
                  icon={copiedToken === character.token ? <Check size={15} /> : <Copy size={15} />}
                  onClick={() => onCopy(character.token)}
                />
              </div>
            ))
          ) : (
            <Empty description="暂无匹配填充符" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </div>
      </div>
    </Modal>
  );
}

export function FileTemplateManagementPage() {
  const [businesses, setBusinesses] = useState<FileTemplateBusiness[]>(fileTemplateBusinesses);
  const [selectedBusinessId, setSelectedBusinessId] = useState<FileTemplateBusinessId>("hr-contract");
  const [selectedTemplateId, setSelectedTemplateId] = useState("FT-HC-1");
  const [templateKeyword, setTemplateKeyword] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [copiedToken, setCopiedToken] = useState("");
  const [draggedTemplateId, setDraggedTemplateId] = useState<string>();
  const [selectedUploadName, setSelectedUploadName] = useState("");
  const [createForm] = Form.useForm<CreateTemplateForm>();

  const selectedBusiness = businesses.find((business) => business.id === selectedBusinessId) ?? businesses[0];
  const selectedTemplate =
    selectedBusiness.templates.find((template) => template.id === selectedTemplateId) ?? selectedBusiness.templates[0];
  const filteredTemplates = selectedBusiness.templates.filter(
    (template) => template.name.includes(templateKeyword.trim()) || template.fileName.includes(templateKeyword.trim()),
  );
  const parsedCharacters =
    selectedTemplate?.placeholders
      .map((id) => findCharacter(selectedBusiness.characters, id))
      .filter((character): character is StandardCharacter => Boolean(character)) ?? [];

  const updateSelectedBusiness = (updater: (business: FileTemplateBusiness) => FileTemplateBusiness) => {
    setBusinesses((current) => current.map((business) => (business.id === selectedBusiness.id ? updater(business) : business)));
  };

  const updateSelectedTemplate = (updater: (template: FileTemplate) => FileTemplate) => {
    if (!selectedTemplate) {
      return;
    }

    updateSelectedBusiness((business) => ({
      ...business,
      templates: business.templates.map((template) => (template.id === selectedTemplate.id ? updater(template) : template)),
    }));
  };

  const selectBusiness = (businessId: FileTemplateBusinessId) => {
    const nextBusiness = businesses.find((business) => business.id === businessId);

    if (!nextBusiness) {
      return;
    }

    setSelectedBusinessId(businessId);
    setSelectedTemplateId(nextBusiness.templates[0]?.id ?? "");
    setTemplateKeyword("");
  };

  const submitCreateTemplate = async () => {
    const values = await createForm.validateFields();
    const fileName = values.fileName.trim();
    const nextTemplate: FileTemplate = {
      id: `FT-${Date.now()}`,
      name: values.name.trim(),
      fileName,
      businessId: selectedBusiness.id,
      owner: selectedBusiness.owner,
      version: "V1.0",
      updatedAt: formatNow(),
      placeholders: inferPlaceholdersFromFile(fileName, selectedBusiness),
    };

    updateSelectedBusiness((business) => ({
      ...business,
      templates: [nextTemplate, ...business.templates],
    }));
    setSelectedTemplateId(nextTemplate.id);
    setCreateOpen(false);
    setSelectedUploadName("");
    createForm.resetFields();
  };

  const deleteTemplate = (template: FileTemplate) => {
    Modal.confirm({
      title: "删除文件模板",
      content: `确认删除「${template.name}」？`,
      okText: "确认删除",
      okButtonProps: { danger: true },
      cancelText: "取消",
      onOk: () => {
        const nextTemplates = selectedBusiness.templates.filter((item) => item.id !== template.id);

        updateSelectedBusiness((business) => ({
          ...business,
          templates: nextTemplates,
        }));
        setSelectedTemplateId(nextTemplates[0]?.id ?? "");
      },
    });
  };

  const simulateUpload = () => {
    if (!selectedTemplate) {
      return;
    }

    const fileName = selectedTemplate.fileName || `${selectedTemplate.name}.docx`;

    updateSelectedTemplate((template) => ({
      ...template,
      fileName,
      version: template.version === "草稿" ? "V1.0" : template.version,
      placeholders: inferPlaceholdersFromFile(fileName, selectedBusiness),
      updatedAt: formatNow(),
    }));
  };

  const copyToken = async (token: string) => {
    await navigator.clipboard?.writeText(token);
    setCopiedToken(token);
    window.setTimeout(() => setCopiedToken(""), 1200);
  };

  const businessMenuItems = businesses.map((business) => ({
    key: business.id,
    label: (
      <div className="file-template-business-menu-item">
        <span>{business.name.slice(0, 1)}</span>
        <div>
          <strong>{business.name}</strong>
          <small>{business.description}</small>
        </div>
      </div>
    ),
  }));

  return (
    <main className="page file-template-page">
      <section className="file-template-config" aria-label={`${selectedBusiness.name}配置页面`}>
        <div className="file-template-config__header">
          <div>
            <h1>文件模板管理</h1>
            <p>{selectedBusiness.name}配置页面</p>
          </div>
          <Dropdown
            menu={{
              items: businessMenuItems,
              selectedKeys: [selectedBusiness.id],
              onClick: ({ key }) => selectBusiness(key as FileTemplateBusinessId),
            }}
            placement="bottomRight"
            trigger={["click"]}
          >
            <Button className="file-template-business-switcher">
              <span className="file-template-business-switcher__avatar">{selectedBusiness.name.slice(0, 1)}</span>
              <span>
                <strong>{selectedBusiness.name}</strong>
                <small>切换业务项</small>
              </span>
              <ChevronDown size={16} />
            </Button>
          </Dropdown>
        </div>
        <div className="file-template-layout">
          <SectionPanel
            className="file-template-list-panel"
            title="文件模板"
            actions={
              <Space>
                <Button icon={<Library size={16} />} onClick={() => setLibraryOpen(true)}>
                  填充符列表
                </Button>
                <Button type="primary" icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
                  新增模板
                </Button>
              </Space>
            }
          >
            <Input
              allowClear
              prefix={<Search size={15} />}
              placeholder="搜索模板名称"
              value={templateKeyword}
              onChange={(event) => setTemplateKeyword(event.target.value)}
            />
            <div className="file-template-list">
              {filteredTemplates.length ? (
                filteredTemplates.map((template, index) => (
                  <div
                    className={["file-template-list-item", template.id === selectedTemplate?.id ? "is-active" : ""].join(" ")}
                    draggable
                    key={template.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedTemplateId(template.id)}
                    onDragStart={() => setDraggedTemplateId(template.id)}
                    onDragEnd={() => setDraggedTemplateId(undefined)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => {
                      if (!draggedTemplateId || draggedTemplateId === template.id) {
                        return;
                      }

                      updateSelectedBusiness((business) => ({
                        ...business,
                        templates: moveItem(
                          business.templates,
                          business.templates.findIndex((item) => item.id === draggedTemplateId),
                          business.templates.findIndex((item) => item.id === template.id),
                        ),
                      }));
                      setDraggedTemplateId(undefined);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        setSelectedTemplateId(template.id);
                      }
                    }}
                    >
                      <GripVertical className="file-template-list-item__drag" size={16} />
                      <span className="file-template-list-item__index">{index + 1}</span>
                      <span className="file-template-list-item__main">
                        <strong>{template.fileName}</strong>
                      </span>
                      <Button
                        aria-label="删除模板"
                        type="text"
                      danger
                      icon={<Trash2 size={15} />}
                      onClick={(event) => {
                        event.stopPropagation();
                        deleteTemplate(template);
                      }}
                    />
                  </div>
                ))
              ) : (
                <Empty description="暂无匹配模板" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </div>
          </SectionPanel>
          <SectionPanel
            className="file-template-preview-panel"
            title={selectedTemplate?.fileName || "标准文件预览"}
            description={selectedTemplate ? `${selectedTemplate.name} / ${selectedTemplate.version}` : undefined}
            actions={
              selectedTemplate ? (
                <Button icon={<UploadCloud size={16} />} onClick={simulateUpload}>
                  {selectedTemplate.fileName ? "重新上传并解析" : "上传并解析"}
                </Button>
              ) : null
            }
          >
            {selectedTemplate ? (
              <FilePreview template={selectedTemplate} characters={selectedBusiness.characters} />
            ) : (
              <Empty description="暂无模板，请新增模板" />
            )}
          </SectionPanel>
          <SectionPanel
            className="file-template-character-panel"
            title="解析填充符"
            description={`已从文件中解析出 ${parsedCharacters.length} 个填充符`}
          >
            <div className="file-template-selected-list">
              {parsedCharacters.length ? (
                parsedCharacters.map((character, index) => (
                  <div className="file-template-selected-card" key={character.id}>
                    <span className="file-template-selected-card__index">{index + 1}</span>
                    <div className="file-template-selected-card__main">
                      <strong>{character.name}</strong>
                      <code>{character.token}</code>
                      <small>{character.source}</small>
                    </div>
                    <Button
                      aria-label="复制编码"
                      type="text"
                      icon={copiedToken === character.token ? <Check size={15} /> : <Copy size={15} />}
                      onClick={() => copyToken(character.token)}
                    />
                  </div>
                ))
              ) : (
                <Empty description="上传文件后展示自动解析的填充符" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </div>
          </SectionPanel>
        </div>
      </section>
      <Modal
        destroyOnClose
        title="新增文件模板"
        open={createOpen}
        onCancel={() => {
          setCreateOpen(false);
          setSelectedUploadName("");
          createForm.resetFields();
        }}
        onOk={submitCreateTemplate}
        okText="保存并解析"
      >
        <Form form={createForm} layout="vertical">
          <Form.Item label="文件模板名称" name="name" rules={[{ required: true, message: "请输入文件模板名称" }]}>
            <Input placeholder="请输入文件模板名称" />
          </Form.Item>
          <Form.Item name="fileName" rules={[{ required: true, message: "请上传文件" }]} hidden>
            <Input />
          </Form.Item>
          <Form.Item label="上传文件" required>
            <div className="file-template-upload-box">
              <div>
                <strong>{selectedUploadName || "请选择文件"}</strong>
                <span>支持 .doc、.docx、.pdf，保存后自动解析填充符。</span>
              </div>
              <Upload
                accept=".doc,.docx,.pdf"
                beforeUpload={(file) => {
                  createForm.setFieldValue("fileName", file.name);
                  setSelectedUploadName(file.name);

                  if (!createForm.getFieldValue("name")) {
                    createForm.setFieldValue("name", file.name.replace(/\.(docx?|pdf)$/i, ""));
                  }

                  return false;
                }}
                maxCount={1}
                showUploadList={false}
              >
                <Button icon={<FilePlus2 size={16} />}>选择文件</Button>
              </Upload>
            </div>
          </Form.Item>
        </Form>
      </Modal>
      <PlaceholderLibraryModal
        open={libraryOpen}
        characters={selectedBusiness.characters}
        copiedToken={copiedToken}
        onCancel={() => setLibraryOpen(false)}
        onCopy={copyToken}
      />
    </main>
  );
}
