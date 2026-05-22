import React, { useState } from "react";
import { db } from "../database/db";

const scCls = { confirmed: "b-green", pending: "b-amber", cancelled: "b-red" };
const scLbl = { confirmed: "مؤكد", pending: "انتظار", cancelled: "ملغي" };

export default function StaffDashboard() {
  const [rooms, setRooms]     = useState(db.getAllRooms());
  const [bookings]            = useState(db.getAllBookings());
  const [msg, setMsg]         = useState({ type: "", text: "" });
  const users                 = db.getAllUsers();

  const flash = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg({ type: "", text: "" }), 3000); };

  const changeStatus = (id, status) => {
    db.updateRoom(id, { status });
    setRooms(db.getAllRooms());
    flash("ok", "تم تحديث حالة الغرفة");
  };

  const statusOpts = [
    { v: "available",   l: "متاحة",  c: "var(--green)" },
    { v: "occupied",    l: "مشغولة", c: "var(--red)" },
    { v: "maintenance", l: "صيانة",  c: "var(--amber)" },
  ];

  return (
    <div>
      <div className="ph">
        <div className="ph-title">📊 لوحة العمليات</div>
        <div className="ph-sub">متابعة الحجوزات وإدارة حالة الغرف</div>
      </div>

      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      {/* Stats */}
      <div className="g4" style={{ marginBottom: 24 }}>
        {[
          { icon: "✅", val: rooms.filter(r => r.status === "available").length, lbl: "متاحة", c: "var(--green)" },
          { icon: "🔴", val: rooms.filter(r => r.status === "occupied").length,  lbl: "مشغولة", c: "var(--red)" },
          { icon: "🔧", val: rooms.filter(r => r.status === "maintenance").length, lbl: "صيانة", c: "var(--amber)" },
          { icon: "📋", val: bookings.filter(b => b.status === "confirmed").length, lbl: "حجوزات مؤكدة", c: "var(--blue)" },
        ].map(s => (
          <div key={s.lbl} className="stat-card">
            <div className="stat-icon" style={{ background: s.c + "18" }}>{s.icon}</div>
            <div><div className="stat-val" style={{ color: s.c }}>{s.val}</div><div className="stat-lbl">{s.lbl}</div></div>
          </div>
        ))}
      </div>

      <div className="g2">
        {/* Room status management */}
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>🛏️ إدارة حالة الغرف</div>
          <div style={{ maxHeight: 420, overflowY: "auto" }}>
            {rooms.map(room => {
              const cur = statusOpts.find(o => o.v === room.status);
              return (
                <div key={room.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: "1px solid var(--borderl)" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>غرفة {room.number}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>{room.type} — طابق {room.floor}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 20, background: cur?.c + "18", color: cur?.c, fontWeight: 600 }}>{cur?.l}</span>
                    <select value={room.status} onChange={e => changeStatus(room.id, e.target.value)}
                      style={{ background: "var(--panel2)", border: "1px solid var(--borderl)", borderRadius: 6, padding: "4px 8px", color: "var(--text)", fontSize: 11, cursor: "pointer", fontFamily: "Tajawal,sans-serif" }}>
                      {statusOpts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* All bookings */}
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>📅 جميع الحجوزات</div>
          <div style={{ maxHeight: 420, overflowY: "auto" }}>
            {bookings.map(b => {
              const room  = db.findRoomById(b.room_id);
              const guest = users.find(u => u.id === b.user_id);
              const nights = Math.floor((new Date(b.check_out) - new Date(b.check_in)) / 86400000);
              return (
                <div key={b.id} style={{ padding: "11px 0", borderBottom: "1px solid var(--borderl)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>غرفة {room?.number} — {room?.type}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>👤 {guest?.name} · {nights} ليالٍ</div>
                    </div>
                    <span className={`badge ${scCls[b.status]}`} style={{ fontSize: 10 }}>{scLbl[b.status]}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>📅 {b.check_in} → {b.check_out}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
