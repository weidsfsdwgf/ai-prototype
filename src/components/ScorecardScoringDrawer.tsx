import { Alert, Drawer, Form, Input, InputNumber, Statistic, Tag } from "antd";
import { useEffect, useMemo } from "react";
import type {
  ScorecardCustomField,
  ScorecardDimension,
  ScorecardRater,
  ScorecardStandard,
  ScorecardSystemField,
  ScorecardTemplate,
} from "../data/scorecardConfig";
import "./ScorecardScoringDrawer.css";

type ScorecardFieldDefinition = {
  id: string;
  label: string;
  placeholder: string;
  required: boolean;
  source?: string;
  readonly?: boolean;
};

type ScorecardScoringFormValues = {
  fields?: Record<string, string>;
  scores?: Record<string, Record<string, number>>;
  remarks?: Record<string, string>;
};

export type ScorecardScoringResult = {
  templateId: string;
  templateCode: string;
  templateVersion: string;
  fieldValues: Record<string, string>;
  raterScores: Record<string, number>;
  comprehensiveScore: number;
  scores: Record<string, Record<string, number>>;
  remarks: Record<string, string>;
};

type ScorecardScoringDrawerProps = {
  open: boolean;
  template?: ScorecardTemplate;
  mode?: "preview" | "score";
  subjectValues?: Record<string, string>;
  onClose: () => void;
};

const statusColor = {
  草稿中: "gold",
  启用中: "green",
  已停用: "default",
} as const;

function getEnabledSystemFields(fields: ScorecardSystemField[]) {
  return fields.filter((field) => field.enabled);
}

function getFieldDefinitions(template: ScorecardTemplate): ScorecardFieldDefinition[] {
  const systemFields = getEnabledSystemFields(template.systemFields).map((field) => ({
    id: field.key,
    label: field.label,
    placeholder: `由${field.source}带出`,
    required: false,
    source: field.source,
    readonly: true,
  }));
  const customFields = template.customFields.map((field: ScorecardCustomField) => ({
    id: field.id,
    label: field.name,
    placeholder: field.placeholder || `请输入${field.name}`,
    required: field.required,
  }));

  return [...systemFields, ...customFields];
}

function getTemplateStandards(dimensions: ScorecardDimension[]) {
  return dimensions.flatMap((dimension) => dimension.items.flatMap((item) => item.standards));
}

function getSystemFieldValue(fieldId: string) {
  const defaultSystemValues: Record<string, string> = {
    employeeName: "陈嘉",
    employeeNo: "EMP-5001",
    department: "运营中心",
    position: "运营主管",
    entryDate: "2026-02-03",
    rank: "M2",
    directManager: "林珊",
    mentor: "周霖",
    projectName: "华东门店标准化试点",
    courseName: "门店运营标准课",
    courseSession: "第 3 期",
    assessmentPeriod: "2026 Q2",
    fillDate: "2026-05-05",
  };

  return defaultSystemValues[fieldId] ?? "";
}

function getRaterScore(
  scores: Record<string, Record<string, number>> | undefined,
  rater: ScorecardRater,
  standards: ScorecardStandard[],
) {
  const raterScores = scores?.[rater.id] ?? {};

  return standards.reduce((sum, standard) => sum + Number(raterScores[standard.id] ?? 0), 0);
}

function buildResult(
  template: ScorecardTemplate,
  values: ScorecardScoringFormValues,
  raterScores: Record<string, number>,
) {
  const weights = template.raters.map((rater) => rater.weight ?? 0);
  const weightTotal = weights.reduce((sum, weight) => sum + weight, 0);
  const comprehensiveScore =
    weightTotal > 0
      ? template.raters.reduce((sum, rater) => sum + (raterScores[rater.id] ?? 0) * ((rater.weight ?? 0) / weightTotal), 0)
      : template.raters.reduce((sum, rater) => sum + (raterScores[rater.id] ?? 0), 0) / Math.max(template.raters.length, 1);

  return {
    templateId: template.id,
    templateCode: template.code,
    templateVersion: template.version,
    fieldValues: values.fields ?? {},
    raterScores,
    comprehensiveScore: Number(comprehensiveScore.toFixed(1)),
    scores: values.scores ?? {},
    remarks: values.remarks ?? {},
  };
}

function getDimensionRowSpan(dimension: ScorecardDimension) {
  return dimension.items.reduce((sum, item) => sum + item.standards.length, 0);
}

function formatRaterColumnTitle(rater: ScorecardRater) {
  return rater.weight === undefined ? `${rater.name}（等权重）` : `${rater.name}（权重${rater.weight}%）`;
}

export function ScorecardScoringDrawer({
  open,
  template,
  mode = "score",
  subjectValues,
  onClose,
}: ScorecardScoringDrawerProps) {
  const [form] = Form.useForm<ScorecardScoringFormValues>();
  const scores = Form.useWatch("scores", form);
  const standards = useMemo(() => (template ? getTemplateStandards(template.dimensions) : []), [template]);
  const fields = useMemo(() => (template ? getFieldDefinitions(template) : []), [template]);
  const raterScores = useMemo(() => {
    if (!template) {
      return {};
    }

    return template.raters.reduce<Record<string, number>>((result, rater) => {
      result[rater.id] = getRaterScore(scores, rater, standards);
      return result;
    }, {});
  }, [scores, standards, template]);
  const scoringResult = useMemo(() => {
    if (!template) {
      return undefined;
    }

    return buildResult(template, form.getFieldsValue(true), raterScores);
  }, [form, raterScores, template]);
  const completionText = useMemo(() => {
    if (!template) {
      return "0/0";
    }

    const requiredCount = standards.length * template.raters.length;
    const completedCount = template.raters.reduce((sum, rater) => {
      const raterScoresValue = scores?.[rater.id] ?? {};
      return sum + standards.filter((standard) => Number.isFinite(raterScoresValue[standard.id])).length;
    }, 0);

    return `${completedCount}/${requiredCount}`;
  }, [scores, standards, template]);

  useEffect(() => {
    if (!open || !template) {
      return;
    }

    const fieldValues = fields.reduce<Record<string, string>>((values, field) => {
      values[field.id] = subjectValues?.[field.id] ?? (field.readonly ? getSystemFieldValue(field.id) : "");
      return values;
    }, {});

    form.resetFields();
    form.setFieldsValue({ fields: fieldValues, scores: {}, remarks: {} });
  }, [fields, form, open, subjectValues, template]);

  return (
    <Drawer
      className="scorecard-scoring-drawer"
      destroyOnHidden
      footer={null}
      onClose={onClose}
      open={open}
      title={mode === "preview" ? "评分填写预览" : "评分填写"}
      width={1080}
    >
      {template ? (
        <Form form={form} layout="vertical">
          <div className="scorecard-scoring">
            <div className="scorecard-scoring__header">
              <div>
                <h2>{template.name}</h2>
                <p>{template.code || "发布后生成"} · {template.version}</p>
              </div>
              <Tag color={statusColor[template.status]}>{template.status}</Tag>
            </div>
            {mode === "preview" ? (
              <Alert
                type="info"
                showIcon
                message="当前为配置效果预览，系统字段自动带出；评分明细按每条评分标准填写分数和备注。"
              />
            ) : null}
            <div className="scorecard-scoring__summary">
              <Statistic title="填写进度" value={completionText} />
              <Statistic title="综合得分" value={scoringResult?.comprehensiveScore ?? 0} precision={1} suffix="分" />
              <Statistic title="评分角色" value={template.raters.length} suffix="个" />
              <Statistic title="评分标准" value={standards.length} suffix="条" />
            </div>
            <section className="scorecard-fill-section">
              <div className="scorecard-fill-section__title">
                <h3>基础信息</h3>
              </div>
              <div className="scorecard-fill-grid">
                {fields.map((field) => (
                  <Form.Item
                    key={field.id}
                    label={field.label}
                    name={["fields", field.id]}
                    rules={field.required ? [{ required: true, message: `请填写${field.label}` }] : undefined}
                  >
                    <Input disabled={field.readonly} placeholder={field.placeholder} />
                  </Form.Item>
                ))}
              </div>
            </section>
            <section className="scorecard-fill-section">
              <div className="scorecard-fill-section__title">
                <h3>评分明细</h3>
              </div>
              <div className="scorecard-rater-score-strip">
                {template.raters.map((rater) => (
                  <Tag color="blue" key={rater.id}>
                    {rater.name}：{raterScores[rater.id] ?? 0} 分
                  </Tag>
                ))}
              </div>
              <div className="scorecard-excel-wrap">
                <table
                  className="scorecard-excel-table"
                  style={{ minWidth: 650 + template.raters.length * 150 }}
                >
                  <thead>
                    <tr>
                      <th>考核维度</th>
                      <th>考核事项</th>
                      <th>评分标准</th>
                      <th>标准分</th>
                      {template.raters.map((rater) => (
                        <th className="scorecard-excel-table__rater-heading" key={rater.id}>
                          {formatRaterColumnTitle(rater)}
                        </th>
                      ))}
                      <th>备注</th>
                    </tr>
                  </thead>
                  <tbody>
                    {template.dimensions.map((dimension) => {
                      const dimensionRowSpan = getDimensionRowSpan(dimension);
                      let dimensionRendered = false;

                      return dimension.items.flatMap((item) =>
                        item.standards.map((standard, standardIndex) => {
                          const showDimension = !dimensionRendered;
                          const showItem = standardIndex === 0;

                          if (showDimension) {
                            dimensionRendered = true;
                          }

                          return (
                            <tr key={`${dimension.id}-${item.id}-${standard.id}`}>
                              {showDimension ? (
                                <td className="scorecard-excel-table__merged" rowSpan={dimensionRowSpan}>
                                  <strong>{dimension.name}</strong>
                                </td>
                              ) : null}
                              {showItem ? (
                                <td className="scorecard-excel-table__merged" rowSpan={item.standards.length}>
                                  {item.name}
                                </td>
                              ) : null}
                              <td>{standard.description}</td>
                              <td className="scorecard-excel-table__number">{standard.score}</td>
                              {template.raters.map((rater) => (
                                <td className="scorecard-excel-table__score" key={rater.id}>
                                  <Form.Item
                                    name={["scores", rater.id, standard.id]}
                                    rules={[{ required: true, message: "请输入评分" }]}
                                  >
                                    <InputNumber min={0} max={standard.score} precision={0} />
                                  </Form.Item>
                                </td>
                              ))}
                              <td>
                                <Form.Item name={["remarks", standard.id]}>
                                  <Input placeholder="填写备注" />
                                </Form.Item>
                              </td>
                            </tr>
                          );
                        }),
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </Form>
      ) : null}
    </Drawer>
  );
}
