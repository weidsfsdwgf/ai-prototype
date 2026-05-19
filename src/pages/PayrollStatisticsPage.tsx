import { DatePicker, Select } from "antd";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { SectionPanel } from "../components/SectionPanel";
import { PayrollApprovalDetail } from "../components/PayrollApprovalDetail";
import { payrollApprovalInfo, type PayrollApprovalInfo } from "../data/payrollApproval";
import "./ApprovalPages.css";
import "./Page.css";
import "./PayrollStatisticsPage.css";
import "./standards/Standards.css";

function makeArchiveInfo(cycle: string, submittedAt: string, submittedBy = payrollApprovalInfo.submittedBy): PayrollApprovalInfo {
  return {
    ...payrollApprovalInfo,
    cycle,
    submittedAt,
    submittedBy,
  };
}

const payrollArchiveInfos: PayrollApprovalInfo[] = [
  makeArchiveInfo("2026-04", "2026-05-08 18:20"),
  makeArchiveInfo("2026-03", "2026-04-08 15:30", "周霖"),
  makeArchiveInfo("2026-02", "2026-03-08 13:20", "林绮"),
  makeArchiveInfo("2026-01", "2026-02-07 17:20", "林绮"),
];

export function PayrollStatisticsPage() {
  const [payrollMonth, setPayrollMonth] = useState(payrollArchiveInfos[0].cycle);

  const selectedArchiveInfo = useMemo(
    () => payrollArchiveInfos.find((archive) => archive.cycle === payrollMonth) ?? payrollArchiveInfos[0],
    [payrollMonth],
  );

  return (
    <main className="page payroll-statistics-page">
      <SectionPanel className="payroll-statistics-panel">
        <PayrollApprovalDetail
          key={selectedArchiveInfo.cycle}
          info={selectedArchiveInfo}
          showTitle={false}
          toolbarExtra={
            <>
              <DatePicker
                allowClear={false}
                className="payroll-statistics-toolbar-field"
                picker="month"
                placeholder="筛选月份"
                value={dayjs(payrollMonth)}
                onChange={(_, dateString) => {
                  const nextMonth = Array.isArray(dateString) ? dateString[0] : dateString;
                  setPayrollMonth(nextMonth || payrollArchiveInfos[0].cycle);
                }}
              />
              <Select
                className="payroll-statistics-toolbar-field"
                defaultValue="office"
                options={[
                  { value: "office", label: "办公室" },
                  { value: "factory", label: "工厂", disabled: true },
                  { value: "warehouse", label: "仓库", disabled: true },
                ]}
              />
            </>
          }
        />
      </SectionPanel>
    </main>
  );
}
