import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navByRole = {
  guest: [
    { path: "/dashboard", icon: "🏠", label: "الرئيسية" },
    { path: "/rooms",     icon: "🛏️", label: "الغرف" },
    { path: "/my-bookings", icon: "📋", label: "حجوزاتي" },
  ],
  staff: [
    { path: "/staff",  icon: "📊", label: "لوحة العمليات" },
    { path: "/rooms",  icon: "🛏️", label: "الغرف" },
  ],
  admin: [
    { path: "/admin",  icon: "⚙️",  label: "الإدارة" },
    { path: "/staff",  icon: "📊", label: "العمليات" },
    { path: "/rooms",  icon: "🛏️", label: "الغرف" },
  ],
};

const roleLabel = { guest: "نزيل", staff: "موظف", admin: "مدير" };
const roleColor = { guest: "#38A0E0", staff: "#29D87A", admin: "#C9A84C" };

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  const items = navByRole[user?.role] || [];
  const rc = roleColor[user?.role] || "#888";

  const doLogout = () => { logout(); navigate("/login"); };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: open ? 240 : 64, flexShrink: 0,
        background: "var(--navy2)", borderLeft: "1px solid var(--borderl)",
        display: "flex", flexDirection: "column",
        transition: "width .28s ease", overflow: "hidden",
        position: "sticky", top: 0, height: "100vh",
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 16px", borderBottom: "1px solid var(--borderl)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,var(--gold),var(--gold-dark))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🏨</div>
          {open && (
            <div style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "var(--gold)" }}>فندق الريادة</div>
              <div style={{ fontSize: 10, color: "var(--muted)" }}>نظام الحجوزات</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "14px 10px", display: "flex", flexDirection: "column", gap: 3 }}>
          {items.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 11px", borderRadius: "var(--rs)",
                color: active ? "var(--gold)" : "var(--muted)",
                background: active ? "rgba(201,168,76,.12)" : "transparent",
                borderRight: active ? "3px solid var(--gold)" : "3px solid transparent",
                transition: "all .15s", whiteSpace: "nowrap", overflow: "hidden",
                justifyContent: open ? "flex-start" : "center",
              }}>
                <span style={{ fontSize: 17, flexShrink: 0 }}>{item.icon}</span>
                {open && <span style={{ fontSize: 13, fontWeight: active ? 700 : 400 }}>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User box */}
        <div style={{ padding: "12px 10px", borderTop: "1px solid var(--borderl)" }}>
          {open ? (
            <div style={{ background: "var(--navy3)", borderRadius: 10, padding: "12px 13px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: rc + "22", border: `2px solid ${rc}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: rc, flexShrink: 0 }}>
                  {user?.name?.[0]}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name}</div>
                  <div style={{ fontSize: 10, color: rc }}>{roleLabel[user?.role]}</div>
                </div>
              </div>
              <button onClick={doLogout} className="btn btn-ghost btn-sm btn-full" style={{ fontSize: 11 }}>🚪 خروج</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: rc + "22", border: `2px solid ${rc}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: rc }}>
                {user?.name?.[0]}
              </div>
              <button onClick={doLogout} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16 }} title="خروج">🚪</button>
            </div>
          )}
        </div>

        {/* Toggle btn */}
        <button onClick={() => setOpen(!open)} style={{
          position: "absolute", top: 22, left: -13,
          width: 26, height: 26, borderRadius: "50%",
          background: "var(--gold)", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, color: "var(--navy)", fontWeight: 800,
          boxShadow: "0 2px 8px rgba(0,0,0,.4)",
        }}>
          {open ? "›" : "‹"}
        </button>
      </aside>

      {/* ── Main content ── */}
      <main style={{ flex: 1, padding: "28px 32px", overflow: "auto", minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
