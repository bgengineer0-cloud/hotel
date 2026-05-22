import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const demos = [
  { label: "🔑 مدير", email: "admin@hotel.com", pass: "admin123", desc: "صلاحيات كاملة" },
  { label: "👔 موظف", email: "staff@hotel.com", pass: "staff123", desc: "متابعة العمليات" },
  { label: "🛎️ نزيل", email: "guest@hotel.com", pass: "guest123", desc: "حجز وعرض" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const { login, authError } = useAuth();
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    const res = login(email, pass);
    if (res.ok) {
      if (res.user.role === "admin") navigate("/admin");
      else if (res.user.role === "staff") navigate("/staff");
      else navigate("/dashboard");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--navy)", padding: 20 }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", opacity: 0.04, background: "radial-gradient(ellipse 60% 80% at 20% 50%, #C9A84C 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 50%, #C9A84C 0%, transparent 60%)" }} />

      <div style={{ width: "100%", maxWidth: 440, position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: "linear-gradient(135deg,var(--gold),var(--gold-dark))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 16px", boxShadow: "0 8px 28px rgba(201,168,76,.3)" }}>🏨</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--gold)" }}>فندق الريادة</h1>
          <p style={{ color: "var(--muted)", marginTop: 6, fontSize: 13 }}>نظام إدارة الحجوزات الإلكتروني</p>
        </div>

        <div className="card card-gold" style={{ padding: 28 }}>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 22, textAlign: "center" }}>تسجيل الدخول</h2>
          {authError && <div className="alert alert-err">{authError}</div>}
          <form onSubmit={submit}>
            <div className="fgroup">
              <label className="flabel">البريد الإلكتروني</label>
              <input className="fc" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@email.com" required />
            </div>
            <div className="fgroup">
              <label className="flabel">كلمة المرور</label>
              <input className="fc" type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn btn-gold btn-full" style={{ marginTop: 4 }}>🔑 دخول</button>
          </form>
          <p style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: "var(--muted)" }}>
            ليس لديك حساب؟{" "}
            <Link to="/register" style={{ color: "var(--gold)", fontWeight: 700 }}>إنشاء حساب</Link>
          </p>
        </div>

        <div style={{ marginTop: 20, padding: "14px 16px", background: "var(--panel)", border: "1px dashed var(--border)", borderRadius: "var(--rs)" }}>
          <p style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", marginBottom: 10 }}>حسابات تجريبية للعرض</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {demos.map(d => (
              <button key={d.email} onClick={() => { setEmail(d.email); setPass(d.pass); }}
                style={{ background: "var(--panel2)", border: "1px solid var(--borderl)", borderRadius: 7, padding: "8px 12px", color: "var(--text)", cursor: "pointer", fontFamily: "Tajawal,sans-serif", fontSize: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 600 }}>{d.label}</span>
                <span style={{ color: "var(--muted)" }}>{d.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
