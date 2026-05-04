import { Button, DatePicker, Form, Input, InputNumber, Radio, Select, Steps, Upload } from "antd";
import { Save, UploadCloud } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { SectionPanel } from "../../components/SectionPanel";
import "../Page.css";
import "./Standards.css";

export function StandardFormPage() {
  return (
    <main className="page">
      <PageHeader
        title="新建合同"
        description="标准录入页结构：步骤、分组表单、附件和提交动作。"
        actions={
          <>
            <Button>取消</Button>
            <Button type="primary" icon={<Save size={16} />}>
              保存
            </Button>
          </>
        }
      />
      <SectionPanel>
        <Steps
          current={0}
          items={[
            { title: "基础信息" },
            { title: "商务条款" },
            { title: "审批确认" },
          ]}
        />
      </SectionPanel>
      <Form
        className="form-layout"
        layout="vertical"
        initialValues={{ type: "service", currency: "CNY", autoRenewal: "no" }}
      >
        <SectionPanel title="基础信息">
          <div className="form-grid">
            <Form.Item label="合同名称" name="name" rules={[{ required: true }]}>
              <Input placeholder="请输入合同名称" />
            </Form.Item>
            <Form.Item label="客户名称" name="customer" rules={[{ required: true }]}>
              <Select
                showSearch
                placeholder="请选择客户"
                options={[
                  { value: "杭州启明供应链有限公司", label: "杭州启明供应链有限公司" },
                  { value: "上海云岭智能科技", label: "上海云岭智能科技" },
                ]}
              />
            </Form.Item>
            <Form.Item label="合同类型" name="type">
              <Radio.Group
                options={[
                  { value: "service", label: "服务合同" },
                  { value: "purchase", label: "采购合同" },
                  { value: "framework", label: "框架合同" },
                ]}
              />
            </Form.Item>
            <Form.Item label="负责人" name="owner">
              <Select
                placeholder="请选择负责人"
                options={[
                  { value: "陈嘉", label: "陈嘉" },
                  { value: "林珊", label: "林珊" },
                  { value: "周霖", label: "周霖" },
                ]}
              />
            </Form.Item>
          </div>
        </SectionPanel>
        <SectionPanel title="商务条款">
          <div className="form-grid">
            <Form.Item label="合同金额" name="amount" rules={[{ required: true }]}>
              <InputNumber min={0} precision={0} prefix="¥" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="币种" name="currency">
              <Select options={[{ value: "CNY", label: "人民币" }]} />
            </Form.Item>
            <Form.Item label="合同周期" name="period">
              <DatePicker.RangePicker style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="自动续约" name="autoRenewal">
              <Radio.Group
                options={[
                  { value: "yes", label: "是" },
                  { value: "no", label: "否" },
                ]}
              />
            </Form.Item>
          </div>
        </SectionPanel>
        <SectionPanel title="附件">
          <Upload.Dragger>
            <p className="upload-icon">
              <UploadCloud size={28} />
            </p>
            <p>上传合同扫描件或商务附件</p>
          </Upload.Dragger>
        </SectionPanel>
      </Form>
    </main>
  );
}
