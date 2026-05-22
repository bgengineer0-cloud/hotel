import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../database/db";

const bStatusCls = { confirmed: "b-green", pending: "b-amber", cancelled: "b-red" };
const bStatusLbl = { confirmed: "مؤكد", pending: "انتظار", cancelled: "ملغي" };

export default function GuestDashboard() {
  const { user } = useAuth();
  const bookings  = db.getBookingsByUser(user.id);
  const available = db.getAvailableRooms();

  const upcoming = bookings.filter(b => b.status === "confirmed" && new Date(b.check_in) >= new Date());

  return (
    <div>
      {/* Hero welcome */}
      <div style={{ background: "linear-gradient(135deg,var(--panel),var(--panel2))", border: "1px solid var(--border)", borderRadius: "var(--rl)", padding: "28px 30px", marginBottom: 26, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, left: -30, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle,rgba(201,168,76,.07) 0%,transparent 70%)", pointerEvents: "none" }} />
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>مرحباً، <span style={{ color: "var(--gold)" }}>{user.name}</span> 👋</h1>
        <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 18 }}>
          {upcoming.length > 0 ? `لديك ${upcoming.length} حجز قادم — مرحباً بك في فندق الريادة` : "استكشف غرفنا الفاخرة وابدأ تجربة إقامة لا تُنسى"}
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <Link to="/rooms" className="btn btn-gold">🛏️ الغرف المتاحة</Link>
          <Link to="/my-bookings" className="btn btn-ghost">📋 حجوزاتي</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="g4" style={{ marginBottom: 24 }}>
        {[
          { icon: "📋", val: bookings.length, lbl: "إجمالي الحجوزات", c: "var(--gold)" },
          { icon: "✅", val: bookings.filter(b => b.status === "confirmed").length, lbl: "مؤكدة", c: "var(--green)" },
          { icon: "⏳", val: bookings.filter(b => b.status === "pending").length, lbl: "قيد الانتظار", c: "var(--amber)" },
          { icon: "🛏️", val: available.length, lbl: "غرف متاحة الآن", c: "var(--blue)" },
        ].map(s => (
          <div key={s.lbl} className="stat-card">
            <div className="stat-icon" style={{ background: s.c + "18" }}>{s.icon}</div>
            <div><div className="stat-val" style={{ color: s.c }}>{s.val}</div><div className="stat-lbl">{s.lbl}</div></div>
          </div>
        ))}
      </div>

      <div className="g2">
        {/* Upcoming bookings */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>📅 الحجوزات القادمة</span>
            <Link to="/my-bookings" style={{ fontSize: 11, color: "var(--gold)" }}>عرض الكل</Link>
          </div>
          {upcoming.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 0", color: "var(--muted)" }}>
              <div style={{ fontSize: 34, marginBottom: 8 }}>📭</div>
              <p style={{ fontSize: 12 }}>لا توجد حجوزات قادمة</p>
            </div>
          ) : upcoming.map(b => {
            const room = db.findRoomById(b.room_id);
            const nights = Math.floor((new Date(b.check_out) - new Date(b.check_in)) / 86400000);
            return (
              <div key={b.id} style={{ padding: "11px 0", borderBottom: "1px solid var(--borderl)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>غرفة {room?.number} — {room?.type}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>{b.check_in} → {b.check_out} · {nights} ليالٍ</div>
                  </div>
                  <span style={{ fontWeight: 700, color: "var(--gold)", fontSize: 14 }}>{b.total_price.toLocaleString()} ر.س</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Available rooms preview */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>🛏️ غرف متاحة</span>
            <Link to="/rooms" style={{ fontSize: 11, color: "var(--gold)" }}>عرض الكل</Link>
          </div>
          {available.slice(0, 5).map(room => (
            <div key={room.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--borderl)" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>غرفة {room.number} — {room.type}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>الطابق {room.floor} · 👥 {room.capacity}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: "var(--gold)", fontWeight: 700, fontSize: 14 }}>{room.price}</span>
                <Link to={`/book/${room.id}`} className="btn btn-gold btn-sm">حجز</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
