import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [err, setErr] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const ch = e => setF({ ...f, [e.target.name]: e.target.value });

  const submit = e => {
    e.preventDefault();
    if (f.password !== f.confirm) { setErr("كلمتا المرور غير متطابقتين"); return; }
    if (f.password.length < 6) { setErr("كلمة المرور يجب ألا تقل عن 6 أحرف"); return; }
    const res = register(f);
    if (res.ok) navigate("/dashboard");
    else setErr(res.error);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--navy)", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg,var(--gold),var(--gold-dark))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, margin: "0 auto 14px", boxShadow: "0 6px 22px rgba(201,168,76,.28)" }}>🏨</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--gold)" }}>إنشاء حساب جديد</h1>
          <p style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>فندق الريادة</p>
        </div>
        <div className="card card-gold" style={{ padding: 26 }}>
          {err && <div className="alert alert-err">{err}</div>}
          <form onSubmit={submit}>
            <div className="g2">
              <div className="fgroup">
                <label className="flabel">الاسم الكامل</label>
                <input className="fc" name="name" value={f.name} onChange={ch} placeholder="أحمد محمد" required />
              </div>
              <div className="fgroup">
                <label className="flabel">رقم الهاتف</label>
                <input className="fc" name="phone" value={f.phone} onChange={ch} placeholder="05XXXXXXXX" />
              </div>
            </div>
            <div className="fgroup">
              <label className="flabel">البريد الإلكتروني</label>
              <input className="fc" type="email" name="email" value={f.email} onChange={ch} placeholder="example@email.com" required />
            </div>
            <div className="g2">
              <div className="fgroup">
                <label className="flabel">كلمة المرور</label>
                <input className="fc" type="password" name="password" value={f.password} onChange={ch} placeholder="••••••••" required />
              </div>
              <div className="fgroup">
                <label className="flabel">تأكيد كلمة المرور</label>
                <input className="fc" type="password" name="confirm" value={f.confirm} onChange={ch} placeholder="••••••••" required />
              </div>
            </div>
            <button type="submit" className="btn btn-gold btn-full">✨ إنشاء الحساب</button>
          </form>
          <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "var(--muted)" }}>
            لديك حساب؟{" "}
            <Link to="/login" style={{ color: "var(--gold)", fontWeight: 700 }}>تسجيل الدخول</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
