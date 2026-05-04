import { Button, Form, Input, Select, Switch } from "antd";
import { Save } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import "./Page.css";

export function SettingsPage() {
  return (
    <main className="page">
      <PageHeader
        title="系统设置"
        description="配置租户基础信息、通知策略和审批偏好。"
        actions={
          <Button type="primary" icon={<Save size={16} />}>
            保存
          </Button>
        }
      />
      <section className="settings-panel">
        <Form layout="vertical" initialValues={{ tenant: "LAS", timezone: "Asia/Shanghai", notify: true }}>
          <Form.Item label="租户名称" name="tenant">
            <Input />
          </Form.Item>
          <Form.Item label="默认时区" name="timezone">
            <Select
              options={[
                { value: "Asia/Shanghai", label: "Asia/Shanghai" },
                { value: "UTC", label: "UTC" },
              ]}
            />
          </Form.Item>
          <Form.Item label="审批超时通知" name="notify" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </section>
    </main>
  );
}
