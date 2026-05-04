import { Button, Empty, Result, Spin } from "antd";
import { RefreshCw } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { SectionPanel } from "../../components/SectionPanel";
import "../Page.css";
import "./Standards.css";

export function StandardStatesPage() {
  return (
    <main className="page">
      <PageHeader
        title="状态页面"
        description="空数据、无权限、异常和加载状态的基础框架。"
        actions={
          <Button icon={<RefreshCw size={16} />}>
            刷新
          </Button>
        }
      />
      <div className="state-grid">
        <SectionPanel title="空数据">
          <div className="state-box">
            <Empty description="暂无客户数据" />
          </div>
        </SectionPanel>
        <SectionPanel title="无权限">
          <Result status="403" title="无访问权限" subTitle="当前账号未开通该模块权限。" extra={<Button>申请权限</Button>} />
        </SectionPanel>
        <SectionPanel title="异常">
          <Result status="500" title="服务暂不可用" subTitle="请求处理失败，请稍后重试。" extra={<Button type="primary">重试</Button>} />
        </SectionPanel>
        <SectionPanel title="加载中">
          <div className="state-box">
            <Spin size="large" />
          </div>
        </SectionPanel>
      </div>
    </main>
  );
}
