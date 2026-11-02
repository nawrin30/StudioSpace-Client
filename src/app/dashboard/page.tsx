import Link from "next/link";

const dashboardLinks = [
  { icon: "＋", label: "Add a studio", href: "/add-studio" },
  { icon: "▤", label: "My listings", href: "/my-listings" },
  { icon: "▣", label: "My bookings", href: "/my-bookings" },
  { icon: "⌕", label: "Explore spaces", href: "/studios" },
];

export default function DashboardPage() {
  return (
    <main className="page shell">
      <span className="eyebrow">Your StudioSpace</span>
      <h1 className="page-title">Dashboard.</h1>
      <p className="muted">Your creative workspace, all in one place.</p>

      <div className="category-grid" style={{ marginTop: 30 }}>
        {dashboardLinks.map((item) => (
          <Link className="category" href={item.href} key={item.href}>
            <span className="emoji">{item.icon}</span>
            <b>{item.label}</b>
          </Link>
        ))}
      </div>
    </main>
  );
}
