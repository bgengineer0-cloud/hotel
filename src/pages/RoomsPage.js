import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../database/db";

const statusCfg = {
  available:   { lbl: "متاحة",   cls: "b-green" },
  occupied:    { lbl: "مشغولة",  cls: "b-red" },
  maintenance: { lbl: "صيانة",   cls: "b-amber" },
};
const typeColor = {
  "مفردة": "#38A0E0", "مزدوجة": "#29D87A", "جناح": "#C9A84C",
  "جناح ملكي": "#A855F7", "عائلية": "#F0A030",
};
const amenityIcon = { wifi:"📶", tv:"📺", ac:"❄️", minibar:"🍷", jacuzzi:"🛁", kitchen:"🍽️", balcony:"🌅", seaview:"🌊", butler:"🎩" };
const roomEmoji  = { 1:"🛏️", 2:"🏨", 3:"👑", 4:"🛏️", 5:"🏨", 6:"💎", 7:"👨‍👩‍👧", 8:"🛏️" };

export default function RoomsPage() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [statusF, setStatusF] = useState("all");
  const [typeF, setTypeF]     = useState("all");
  const [search, setSearch]   = useState("");
  const [rooms, setRooms]     = useState(db.getAllRooms());

  const types = [...new Set(rooms.map(r => r.type))];

  const filtered = rooms.filter(r => {
    if (statusF !== "all" && r.status !== statusF) return false;
    if (typeF !== "all" && r.type !== typeF) return false;
    if (search && !r.number.includes(search) && !r.type.includes(search)) return false;
    return true;
  });

  return (
    <div>
      <div className="ph" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div className="ph-title">🛏️ الغرف</div>
          <div className="ph-sub">استعراض وإدارة جميع غرف الفندق</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["all", "available", "occupied", "maintenance"].map(s => (
            <button key={s} onClick={() => setStatusF(s)} className="btn btn-sm"
              style={{ background: statusF === s ? "var(--gold)" : "var(--panel2)", color: statusF === s ? "var(--navy)" : "var(--muted)", border: "1px solid var(--borderl)" }}>
              {s === "all" ? "الكل" : statusCfg[s]?.lbl}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 22, flexWrap: "wrap" }}>
        <input className="fc" style={{ maxWidth: 260 }} placeholder="🔍 بحث برقم أو نوع..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="fc" style={{ maxWidth: 170 }} value={typeF} onChange={e => setTypeF(e.target.value)}>
          <option value="all">جميع الأنواع</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Quick stats */}
      <div style={{ display: "flex", gap: 10, marginBottom: 22, flexWrap: "wrap" }}>
        {[
          { lbl: "الكل", n: rooms.length, c: "var(--gold)" },
          { lbl: "متاحة", n: rooms.filter(r => r.status === "available").length, c: "var(--green)" },
          { lbl: "مشغولة", n: rooms.filter(r => r.status === "occupied").length, c: "var(--red)" },
          { lbl: "صيانة", n: rooms.filter(r => r.status === "maintenance").length, c: "var(--amber)" },
        ].map(s => (
          <div key={s.lbl} style={{ background: "var(--panel2)", border: `1px solid ${s.c}28`, borderRadius: 8, padding: "8px 16px", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: s.c }}>{s.n}</span>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>{s.lbl}</span>
          </div>
        ))}
      </div>

      {/* Room cards grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 18 }}>
        {filtered.map(room => {
          const sc = statusCfg[room.status];
          const tc = typeColor[room.type] || "#888";
          return (
            <div key={room.id} className="card" style={{ borderColor: tc + "20", transition: "transform .2s,box-shadow .2s", cursor: "default" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 10px 32px ${tc}18`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
              
              {/* Visual */}
              <div style={{ height: 100, background: `linear-gradient(135deg,${tc}18,${tc}0a)`, border: `1px solid ${tc}22`, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, marginBottom: 14 }}>
                {roomEmoji[room.id] || "🛏️"}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>غرفة {room.number}</div>
                  <div style={{ fontSize: 11, color: tc, fontWeight: 600, marginTop: 2 }}>{room.type} · طابق {room.floor}</div>
                </div>
                <span className={`badge ${sc.cls}`}>{sc.lbl}</span>
              </div>

              <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12, lineHeight: 1.6 }}>{room.description}</p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
                {room.amenities.map(a => (
                  <span key={a} style={{ fontSize: 10, background: "var(--panel2)", border: "1px solid var(--borderl)", borderRadius: 5, padding: "3px 7px" }}>
                    {amenityIcon[a] || "✓"} {a}
                  </span>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: 20, fontWeight: 800, color: "var(--gold)" }}>{room.price}</span>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}> ر.س/ليلة</span>
                </div>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>👥 {room.capacity}</span>
              </div>

              {user?.role === "guest" && room.status === "available" && (
                <Link to={`/book/${room.id}`} className="btn btn-gold btn-full" style={{ marginTop: 13, fontSize: 13 }}>📅 احجز الآن</Link>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>🔍</div>
            <p>لا توجد غرف مطابقة للبحث</p>
          </div>
        )}
      </div>
    </div>
  );
}
