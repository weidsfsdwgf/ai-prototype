import { Button, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Plus, UserRoundCog } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import "./Page.css";

type Member = {
  name: string;
  role: string;
  department: string;
  permission: string;
  status: "启用" | "停用";
};

const members: Member[] = [
  { name: "陈嘉", role: "运营负责人", department: "运营中心", permission: "审批管理员", status: "启用" },
  { name: "林珊", role: "客户经理", department: "销售一部", permission: "业务成员", status: "启用" },
  { name: "周霖", role: "财务专员", department: "财务部", permission: "财务审核", status: "启用" },
  { name: "王越", role: "外部顾问", department: "项目办公室", permission: "只读访客", status: "停用" },
];

const columns: ColumnsType<Member> = [
  { title: "成员", dataIndex: "name", key: "name" },
  { title: "岗位", dataIndex: "role", key: "role" },
  { title: "部门", dataIndex: "department", key: "department" },
  { title: "权限角色", dataIndex: "permission", key: "permission" },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
    render: (status: Member["status"]) => (
      <Tag color={status === "启用" ? "green" : "default"}>{status}</Tag>
    ),
  },
  { title: "操作", key: "action", render: () => <Button type="link">配置</Button> },
];

export function OrganizationPage() {
  return (
    <main className="page">
      <PageHeader
        title="组织管理"
        description="维护成员、部门和权限角色。"
        actions={
          <>
            <Button icon={<UserRoundCog size={16} />}>角色配置</Button>
            <Button type="primary" icon={<Plus size={16} />}>
              添加成员
            </Button>
          </>
        }
      />
      <section className="panel">
        <Table
          columns={columns}
          dataSource={members}
          rowKey="name"
          scroll={{ x: 820 }}
          pagination={false}
        />
      </section>
    </main>
  );
}
