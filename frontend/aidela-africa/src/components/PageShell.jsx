import AppShell from "./AppShell";

const PageShell = ({ title, description, actions, children }) => (
  <AppShell
    eyebrow="Aidela Africa"
    title={title}
    description={description}
    actions={actions}
  >
    {children}
  </AppShell>
);

export default PageShell;
