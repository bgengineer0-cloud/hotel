import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../database/db";

const scCls = { confirmed: "b-green", pending: "b-amber", cancelled: "b-red" };
const scLbl = { confirmed: "✅ مؤكد", pending: "⏳ انتظار", cancelled: "❌ ملغي" };
const pmLbl = { credit_card: "💳 بطاقة ائتمانية", debit_card: "🏦 بطاقة مدينة", digital_wallet: "📱 محفظة رقمية", bank_transfer: "🏛️ تحويل بنكي" };

export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState(db.getBookingsByUser(user.id));
  const [msg, setMsg] = useState({ type: "", text: "" });

  const flash = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg({ type: "", text: "" }), 3000); };

  const cancel = (id) => {
    if (!window.confirm("هل أنت متأكد من إلغاء الحجز؟")) return;
    db.cancelBooking(id);
    setBookings(db.getBookingsByUser(user.id));
    flash("ok", "تم إلغاء الحجز بنجاح");
  };

  return (
    <div>
      <div className="ph">
        <div className="ph-title">📋 حجوزاتي</div>
        <div className="ph-sub">سجل جميع حجوزاتك السابقة والحالية</div>
      </div>

      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      {bookings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--muted)" }}>
          <div style={{ fontSize: 60, marginBottom: 18 }}>📭</div>
          <h3 style={{ fontSize: 18, marginBottom: 8 }}>لا توجد حجوزات</h3>
          <p style={{ fontSize: 13 }}>لم تقم بأي حجز بعد</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {bookings.map(b => {
            const room = db.findRoomById(b.room_id);
            const nights = Math.floor((new Date(b.check_out) - new Date(b.check_in)) / 86400000);
            return (
              <div key={b.id} className="card" style={{ borderColor: b.status === "confirmed" ? "rgba(41,216,122,.2)" : b.status === "cancelled" ? "rgba(240,80,80,.15)" : "var(--borderl)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700 }}>غرفة {room?.number} — {room?.type}</h3>
                      <span className={`badge ${scCls[b.status]}`}>{scLbl[b.status]}</span>
                    </div>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12, color: "var(--muted)" }}>
                      <span>📅 {b.check_in} → {b.check_out}</span>
                      <span>🌙 {nights} ليالٍ</span>
                      <span>👥 {b.guests} أشخاص</span>
                      <span>{pmLbl[b.payment_method] || b.payment_method}</span>
                    </div>
                    {b.notes && (
                      <div style={{ marginTop: 10, padding: "8px 12px", background: "var(--panel2)", borderRadius: 7, fontSize: 12, color: "var(--muted)" }}>📝 {b.notes}</div>
                    )}
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "var(--gold)" }}>{b.total_price.toLocaleString()} ر.س</div>
                    <div style={{ fontSize: 11, color: b.payment_status === "paid" ? "var(--green)" : "var(--amber)", marginTop: 2 }}>
                      {b.payment_status === "paid" ? "✅ مدفوع" : "⏳ معلق"}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>رقم الحجز: #{b.id} · {b.created_at}</span>
                  {b.status === "confirmed" && (
                    <button className="btn btn-danger btn-sm" onClick={() => cancel(b.id)}>إلغاء الحجز</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
