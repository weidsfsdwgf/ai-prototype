import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "../layouts/AppShell";
import { AdminManagementPage } from "../pages/AdminManagementPage";
import { ApprovalHandlingPage } from "../pages/ApprovalHandlingPage";
import { HomePage } from "../pages/HomePage";
import { LowValueConsumablesPage } from "../pages/LowValueConsumablesPage";
import { MyInitiatedApprovalsPage } from "../pages/MyInitiatedApprovalsPage";
import { OaApplicationPage } from "../pages/OaApplicationPage";
import { OrgStructurePage } from "../pages/OrgStructurePage";
import { ProbationManagementPage } from "../pages/ProbationManagementPage";
import { ResignationManagementPage } from "../pages/ResignationManagementPage";
import { RosterPage } from "../pages/RosterPage";
import { ScorecardConfigPage } from "../pages/ScorecardConfigPage";
import { TodoTasksPage } from "../pages/TodoTasksPage";
import { UserManagementPage } from "../pages/UserManagementPage";
import { StandardConfigPage } from "../pages/standards/StandardConfigPage";
import { StandardDetailPage } from "../pages/standards/StandardDetailPage";
import { StandardFormPage } from "../pages/standards/StandardFormPage";
import { StandardListPage } from "../pages/standards/StandardListPage";
import { StandardStatesPage } from "../pages/standards/StandardStatesPage";
import { StandardTreeListPage } from "../pages/standards/StandardTreeListPage";
import { StandardsOverviewPage } from "../pages/standards/StandardsOverviewPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/home" replace /> },
      { path: "home", element: <HomePage /> },
      { path: "oa/system/users", element: <UserManagementPage /> },
      { path: "oa/system/roles", element: <AdminManagementPage pageKey="roles" /> },
      { path: "oa/system/positions", element: <AdminManagementPage pageKey="positions" /> },
      { path: "oa/system/groups", element: <AdminManagementPage pageKey="groups" /> },
      { path: "oa/hr/roster", element: <RosterPage /> },
      { path: "oa/hr/org-structure", element: <OrgStructurePage /> },
      { path: "oa/hr/probation", element: <ProbationManagementPage /> },
      { path: "oa/hr/resignations", element: <ResignationManagementPage /> },
      { path: "oa/approval/applications", element: <OaApplicationPage /> },
      { path: "oa/approval/handling", element: <ApprovalHandlingPage /> },
      { path: "oa/approval/initiated", element: <MyInitiatedApprovalsPage /> },
      { path: "oa/approval/todos", element: <TodoTasksPage /> },
      { path: "oa/assets/low-value-consumables", element: <LowValueConsumablesPage /> },
      { path: "oa/config/scorecards", element: <ScorecardConfigPage /> },
      { path: "standards", element: <StandardsOverviewPage /> },
      { path: "standards/list", element: <StandardListPage /> },
      { path: "standards/tree-list", element: <StandardTreeListPage /> },
      { path: "standards/detail", element: <StandardDetailPage /> },
      { path: "standards/form", element: <StandardFormPage /> },
      { path: "standards/config", element: <StandardConfigPage /> },
      { path: "standards/states", element: <StandardStatesPage /> },
      { path: "*", element: <Navigate to="/home" replace /> },
    ],
  },
]);
