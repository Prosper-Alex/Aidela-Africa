import AppShell from "./AppShell";

const DashboardShell = ({
  eyebrow = "Dashboard",
  title,
  description,
  actions,
  children,
}) => {
  return (
    <AppShell
      eyebrow={eyebrow}
      title={title}
      description={description}
      actions={actions}
    >
      {children}
    </AppShell>
  );
};

export default DashboardShell;
