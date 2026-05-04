import { Button, Form, Input, Select, Switch, Table, Tabs, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Plus, Save } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { SectionPanel } from "../../components/SectionPanel";
import { approvalRules, type RuleRecord } from "../../data/frameworkPages";
import "../Page.css";
import "./Standards.css";

const columns: ColumnsType<RuleRecord> = [
  { title: "规则名称", dataIndex: "name", key: "name", width: 180 },
  { title: "适用范围", dataIndex: "scope", key: "scope", width: 130 },
  { title: "触发条件", dataIndex: "condition", key: "condition" },
  { title: "负责组织", dataIndex: "owner", key: "owner", width: 130 },
  {
    title: "状态",
    dataIndex: "enabled",
    key: "enabled",
    width: 100,
    render: (enabled: boolean) => <Tag color={enabled ? "green" : "default"}>{enabled ? "启用" : "停用"}</Tag>,
  },
  { title: "操作", key: "action", width: 120, render: () => <Button type="link">编辑</Button> },
];

export function StandardConfigPage() {
  return (
    <main className="page">
      <PageHeader
        title="审批规则"
        description="标准配置页结构：分栏配置、规则表和保存发布。"
        actions={
          <>
            <Button icon={<Plus size={16} />}>新增规则</Button>
            <Button type="primary" icon={<Save size={16} />}>
              发布配置
            </Button>
          </>
        }
      />
      <Tabs
        className="standard-tabs"
        items={[
          {
            key: "rules",
            label: "规则配置",
            children: (
              <div className="config-layout">
                <SectionPanel title="基础配置">
                  <Form layout="vertical" initialValues={{ category: "purchase", timeout: "24h", enabled: true }}>
                    <Form.Item label="审批类型" name="category">
                      <Select
                        options={[
                          { value: "purchase", label: "采购申请" },
                          { value: "expense", label: "费用报销" },
                          { value: "credit", label: "客户信用" },
                        ]}
                      />
                    </Form.Item>
                    <Form.Item label="默认处理时限" name="timeout">
                      <Select
                        options={[
                          { value: "12h", label: "12 小时" },
                          { value: "24h", label: "24 小时" },
                          { value: "48h", label: "48 小时" },
                        ]}
                      />
                    </Form.Item>
                    <Form.Item label="启用超时提醒" name="enabled" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                    <Form.Item label="通知抄送" name="cc">
                      <Input placeholder="请输入抄送组织或成员" />
                    </Form.Item>
                  </Form>
                </SectionPanel>
                <SectionPanel title="规则列表">
                  <Table
                    columns={columns}
                    dataSource={approvalRules}
                    pagination={false}
                    rowKey="id"
                    scroll={{ x: 860 }}
                  />
                </SectionPanel>
              </div>
            ),
          },
          {
            key: "roles",
            label: "角色范围",
            children: (
              <SectionPanel title="角色范围">
                <Table
                  columns={[
                    { title: "角色", dataIndex: "role", key: "role" },
                    { title: "范围", dataIndex: "scope", key: "scope" },
                    { title: "成员数", dataIndex: "count", key: "count", width: 120 },
                  ]}
                  dataSource={[
                    { role: "审批管理员", scope: "全公司", count: 8 },
                    { role: "财务审核", scope: "财务部", count: 12 },
                    { role: "业务负责人", scope: "所属部门", count: 36 },
                  ]}
                  pagination={false}
                  rowKey="role"
                />
              </SectionPanel>
            ),
          },
        ]}
      />
    </main>
  );
}
