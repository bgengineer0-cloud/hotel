import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../database/db";

const payMethods = [
  { id: "credit_card",    label: "بطاقة ائتمانية", icon: "💳" },
  { id: "debit_card",     label: "بطاقة مدينة",    icon: "🏦" },
  { id: "digital_wallet", label: "محفظة رقمية",    icon: "📱" },
  { id: "bank_transfer",  label: "تحويل بنكي",     icon: "🏛️" },
];

export default function BookingPage() {
  const { roomId } = useParams();
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const room      = db.findRoomById(Number(roomId));

  const today = new Date().toISOString().split("T")[0];
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ check_in: today, check_out: "", guests: 1, payment_method: "credit_card", notes: "" });
  const [done, setDone]     = useState(false);
  const [booking, setBooking] = useState(null);

  if (!room) return <div style={{ textAlign: "center", padding: 60 }}>❌ الغرفة غير موجودة</div>;

  const nights  = form.check_out && form.check_in
    ? Math.max(0, Math.floor((new Date(form.check_out) - new Date(form.check_in)) / 86400000)) : 0;
  const total = nights * room.price;

  const confirm = () => {
    const bk = db.createBooking({ user_id: user.id, room_id: room.id, check_in: form.check_in, check_out: form.check_out, guests: Number(form.guests), total_price: total, status: "confirmed", payment_method: form.payment_method, payment_status: "paid", notes: form.notes });
    db.createPayment({ booking_id: bk.id, amount: total, method: form.payment_method, status: "completed" });
    setBooking(bk); setDone(true);
  };

  if (done) return (
    <div style={{ maxWidth: 480, margin: "60px auto", textAlign: "center" }}>
      <div style={{ fontSize: 74, marginBottom: 20 }}>✅</div>
      <h2 style={{ fontSize: 26, fontWeight: 800, color: "var(--gold)", marginBottom: 10 }}>تم الحجز بنجاح!</h2>
      <p style={{ color: "var(--muted)", marginBottom: 24 }}>رقم الحجز: <strong style={{ color: "var(--gold)" }}>#{booking?.id}</strong></p>
      <div className="card" style={{ textAlign: "right", marginBottom: 22 }}>
        {[
          ["الغرفة", `${room.number} — ${room.type}`],
          ["تسجيل الوصول", form.check_in],
          ["المغادرة", form.check_out],
          ["عدد الليالي", `${nights} ليالٍ`],
          ["طريقة الدفع", payMethods.find(m => m.id === form.payment_method)?.label],
          ["المبلغ الإجمالي", `${total.toLocaleString()} ر.س`],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--borderl)" }}>
            <span style={{ color: "var(--muted)", fontSize: 13 }}>{k}</span>
            <span style={{ fontWeight: 600, fontSize: 13, color: k === "المبلغ الإجمالي" ? "var(--gold)" : "var(--text)" }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <button className="btn btn-gold" onClick={() => navigate("/my-bookings")}>📋 حجوزاتي</button>
        <button className="btn btn-ghost" onClick={() => navigate("/rooms")}>🛏️ الغرف</button>
      </div>
    </div>
  );

  const stepBar = ["التفاصيل", "الدفع", "التأكيد"];

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <div className="ph">
        <div className="ph-title">📅 حجز غرفة {room.number}</div>
        <div className="ph-sub">{room.type} — {room.price} ر.س / ليلة</div>
      </div>

      {/* Step bar */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 30 }}>
        {stepBar.map((s, i) => (
          <React.Fragment key={s}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, border: `2px solid ${step > i + 1 ? "var(--green)" : step === i + 1 ? "var(--gold)" : "var(--borderl)"}`, background: step > i + 1 ? "var(--green)" : step === i + 1 ? "var(--gold)" : "transparent", color: step >= i + 1 ? "var(--navy)" : "var(--muted)" }}>
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <span style={{ fontSize: 12, color: step === i + 1 ? "var(--gold)" : "var(--muted)", fontWeight: step === i + 1 ? 700 : 400 }}>{s}</span>
            </div>
            {i < 2 && <div style={{ flex: 1, height: 2, background: step > i + 1 ? "var(--green)" : "var(--borderl)", margin: "0 8px" }} />}
          </React.Fragment>
        ))}
      </div>

      {step === 1 && (
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>تفاصيل الإقامة</h3>
          <div className="g2">
            <div className="fgroup">
              <label className="flabel">تاريخ الوصول</label>
              <input className="fc" type="date" min={today} value={form.check_in} onChange={e => setForm({ ...form, check_in: e.target.value })} />
            </div>
            <div className="fgroup">
              <label className="flabel">تاريخ المغادرة</label>
              <input className="fc" type="date" min={form.check_in || today} value={form.check_out} onChange={e => setForm({ ...form, check_out: e.target.value })} />
            </div>
          </div>
          <div className="fgroup">
            <label className="flabel">عدد الضيوف (أقصى: {room.capacity})</label>
            <select className="fc" value={form.guests} onChange={e => setForm({ ...form, guests: e.target.value })}>
              {[...Array(room.capacity)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1} {i === 0 ? "شخص" : "أشخاص"}</option>)}
            </select>
          </div>
          <div className="fgroup">
            <label className="flabel">ملاحظات خاصة (اختياري)</label>
            <textarea className="fc" rows={3} style={{ resize: "vertical" }} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="أي طلبات إضافية..." />
          </div>
          {nights > 0 && (
            <div style={{ background: "rgba(201,168,76,.07)", border: "1px solid var(--border)", borderRadius: 9, padding: 14, marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                <span style={{ color: "var(--muted)" }}>{room.price} ر.س × {nights} ليالٍ</span>
                <span>{total.toLocaleString()} ر.س</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 18 }}>
                <span>الإجمالي</span><span style={{ color: "var(--gold)" }}>{total.toLocaleString()} ر.س</span>
              </div>
            </div>
          )}
          <button className="btn btn-gold btn-full" disabled={!form.check_in || !form.check_out || nights <= 0} onClick={() => setStep(2)}>التالي →</button>
        </div>
      )}

      {step === 2 && (
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>طريقة الدفع</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 22 }}>
            {payMethods.map(m => (
              <div key={m.id} onClick={() => setForm({ ...form, payment_method: m.id })}
                style={{ background: form.payment_method === m.id ? "rgba(201,168,76,.1)" : "var(--panel2)", border: `2px solid ${form.payment_method === m.id ? "var(--gold)" : "var(--borderl)"}`, borderRadius: 9, padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, transition: "all .15s" }}>
                <span style={{ fontSize: 24 }}>{m.icon}</span>
                <span style={{ fontSize: 13, fontWeight: form.payment_method === m.id ? 700 : 400 }}>{m.label}</span>
              </div>
            ))}
          </div>
          {(form.payment_method === "credit_card" || form.payment_method === "debit_card") && (
            <>
              <div className="fgroup">
                <label className="flabel">رقم البطاقة</label>
                <input className="fc" placeholder="XXXX XXXX XXXX XXXX" maxLength={19} />
              </div>
              <div className="g2">
                <div className="fgroup"><label className="flabel">تاريخ الانتهاء</label><input className="fc" placeholder="MM/YY" maxLength={5} /></div>
                <div className="fgroup"><label className="flabel">CVV</label><input className="fc" type="password" placeholder="XXX" maxLength={3} /></div>
              </div>
            </>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setStep(1)}>← السابق</button>
            <button className="btn btn-gold" style={{ flex: 2 }} onClick={() => setStep(3)}>مراجعة الحجز →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>تأكيد الحجز</h3>
          {[
            ["الغرفة", `${room.number} — ${room.type}`],
            ["تسجيل الوصول", form.check_in],
            ["المغادرة", form.check_out],
            ["عدد الليالي", `${nights} ليالٍ`],
            ["الضيوف", `${form.guests} أشخاص`],
            ["طريقة الدفع", payMethods.find(m => m.id === form.payment_method)?.label],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid var(--borderl)", fontSize: 13 }}>
              <span style={{ color: "var(--muted)" }}>{k}</span><span style={{ fontWeight: 500 }}>{v}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", fontSize: 20, fontWeight: 800 }}>
            <span>الإجمالي</span><span style={{ color: "var(--gold)" }}>{total.toLocaleString()} ر.س</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setStep(2)}>← السابق</button>
            <button className="btn btn-gold" style={{ flex: 2 }} onClick={confirm}>✅ تأكيد ودفع</button>
          </div>
        </div>
      )}
    </div>
  );
}
