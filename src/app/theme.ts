import type { ThemeConfig } from "antd";

const colors = {
  primary: "#2563eb",
  primaryHover: "#1d4ed8",
  primaryActive: "#1e40af",
  success: "#16a34a",
  warning: "#d97706",
  danger: "#dc2626",
  info: "#0891b2",
  text: "#172033",
  textSecondary: "#5c667a",
  border: "#d8dee8",
  bgLayout: "#f5f7fb",
  surface: "#ffffff",
  primarySoft: "#e8f0ff",
  neutralSoft: "#f7f9fc",
  tableHover: "#f8fbff",
};

export const appTheme: ThemeConfig = {
  token: {
    colorPrimary: colors.primary,
    colorPrimaryHover: colors.primaryHover,
    colorPrimaryActive: colors.primaryActive,
    colorLink: colors.primary,
    colorLinkHover: colors.primaryHover,
    colorLinkActive: colors.primaryActive,
    colorSuccess: colors.success,
    colorWarning: colors.warning,
    colorError: colors.danger,
    colorInfo: colors.info,
    colorText: colors.text,
    colorTextSecondary: colors.textSecondary,
    colorBorder: colors.border,
    colorBgLayout: colors.bgLayout,
    colorBgContainer: colors.surface,
    borderRadius: 8,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
  },
  components: {
    Button: {
      borderRadius: 6,
      controlHeight: 36,
    },
    Card: {
      borderRadiusLG: 8,
      paddingLG: 20,
    },
    Layout: {
      headerBg: colors.surface,
      siderBg: colors.surface,
      bodyBg: colors.bgLayout,
    },
    Menu: {
      itemBorderRadius: 6,
      itemSelectedBg: colors.primarySoft,
    },
    Table: {
      headerBg: colors.neutralSoft,
      rowHoverBg: colors.tableHover,
    },
  },
};
