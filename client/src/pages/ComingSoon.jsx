import DashboardLayout from "../layouts/DashboardLayout.jsx";

export default function ComingSoon({ title }) {
  return (
    <DashboardLayout>
      <div style={{ padding: "8px 4px" }}>
        <h1 style={{ fontSize: 26, marginBottom: 8 }}>{title}</h1>
        <p style={{ color: "var(--color-ink-soft)", maxWidth: 480, lineHeight: 1.6 }}>
          This section isn't built yet — ask Gungun (bottom-right) in the meantime,
          it already has this context.
        </p>
      </div>
    </DashboardLayout>
  );
}
