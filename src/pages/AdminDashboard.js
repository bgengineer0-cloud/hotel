import React, { useState } from "react";
import { db } from "../database/db";

const TABS = ["📊 الإحصائيات", "🛏️ الغرف", "📋 الحجوزات", "👥 المستخدمون"];
const roomTypes = ["مفردة", "مزدوجة", "جناح", "جناح ملكي", "عائلية"];
const roleColor = { admin: "var(--gold)", staff: "var(--green)", guest: "var(--blue)" };
const roleLbl   = { admin: "مدير", staff: "موظف", guest: "نزيل" };
const scCls = { confirmed: "b-green", pending: "b-amber", cancelled: "b-red" };
const scLbl = { confirmed: "مؤكد", pending: "انتظار", cancelled: "ملغي" };

const emptyRoom = { number: "", type: "مفردة", floor: 1, price: "", capacity: 1, description: "", status: "available" };

export default function AdminDashboard() {
  const [tab, setTab]         = useState(0);
  const [rooms, setRooms]     = useState(db.getAllRooms());
  const [users, setUsers]     = useState(db.getAllUsers());
  const [bookings]            = useState(db.getAllBookings());
  const [msg, setMsg]         = useState({ type: "", text: "" });
  const [modal, setModal]     = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [rForm, setRForm]     = useState(emptyRoom);

  const stats = db.getStats();

  const flash = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg({ type: "", text: "" }), 3000); };

  const openAdd  = () => { setEditRoom(null); setRForm(emptyRoom); setModal(true); };
  const openEdit = (r)  => { setEditRoom(r); setRForm({ ...r }); setModal(true); };

  const saveRoom = () => {
    if (!rForm.number || !rForm.price) { flash("err", "يرجى تعبئة الحقول المطلوبة"); return; }
    if (editRoom) db.updateRoom(editRoom.id, rForm);
    else db.createRoom({ ...rForm, amenities: ["wifi", "ac", "tv"] });
    setRooms(db.getAllRooms());
    setModal(false);
    flash("ok", editRoom ? "تم تحديث الغرفة بنجاح" : "تمت إضافة الغرفة بنجاح");
  };

  const deleteRoom = (id) => {
    if (!window.confirm("حذف الغرفة نهائياً؟")) return;
    db.deleteRoom(id); setRooms(db.getAllRooms()); flash("ok", "تم حذف الغرفة");
  };

  const deleteUser = (id) => {
    if (!window.confirm("حذف المستخدم؟")) return;
    db.deleteUser(id); setUsers(db.getAllUsers()); flash("ok", "تم حذف المستخدم");
  };

  return (
    <div>
      <div className="ph">
        <div className="ph-title">⚙️ لوحة الإدارة</div>
        <div className="ph-sub">إدارة شاملة لجميع عمليات الفندق</div>
      </div>

      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 3, background: "var(--panel)", borderRadius: "var(--rs)", padding: 4, marginBottom: 26, width: "fit-content" }}>
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} style={{ padding: "8px 18px", borderRadius: 6, border: "none", cursor: "pointer", fontFamily: "Tajawal,sans-serif", fontSize: 13, fontWeight: 500, transition: "all .15s", background: tab === i ? "var(--gold)" : "transparent", color: tab === i ? "var(--navy)" : "var(--muted)" }}>
            {t}
          </button>
        ))}
      </div>

      {/* ── Tab 0: Stats ── */}
      {tab === 0 && (
        <div>
          <div className="g4" style={{ marginBottom: 22 }}>
            {[
              { icon: "🛏️", val: stats.totalRooms,       lbl: "إجمالي الغرف",   c: "var(--gold)" },
              { icon: "✅", val: stats.availableRooms,    lbl: "متاحة",          c: "var(--green)" },
              { icon: "👥", val: stats.guestCount,        lbl: "النزلاء",        c: "var(--blue)" },
              { icon: "💰", val: `${stats.totalRevenue.toLocaleString()} ر.س`, lbl: "الإيرادات", c: "var(--gold)" },
            ].map(s => (
              <div key={s.lbl} className="stat-card">
                <div className="stat-icon" style={{ background: s.c + "18" }}>{s.icon}</div>
                <div>
                  <div className="stat-val" style={{ color: s.c, fontSize: typeof s.val === "string" && s.val.length > 8 ? 16 : 26 }}>{s.val}</div>
                  <div className="stat-lbl">{s.lbl}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="g2">
            {/* Occupancy gauge */}
            <div className="card">
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 18 }}>📊 نسبة الإشغال</div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 56, fontWeight: 800, color: stats.occupancyRate > 60 ? "var(--green)" : "var(--amber)" }}>{stats.occupancyRate}%</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 14 }}>معدل إشغال الغرف</div>
                <div style={{ background: "var(--panel2)", borderRadius: 8, height: 10, overflow: "hidden" }}>
                  <div style={{ width: `${stats.occupancyRate}%`, height: "100%", background: "linear-gradient(90deg,var(--gold),var(--green))", transition: "width .6s" }} />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-around", marginTop: 18 }}>
                {[
                  { c: "var(--green)", l: "متاحة",  n: stats.availableRooms },
                  { c: "var(--red)",   l: "مشغولة", n: stats.occupiedRooms },
                  { c: "var(--amber)", l: "صيانة",  n: stats.maintenanceRooms },
                ].map(s => (
                  <div key={s.l} style={{ textAlign: "center" }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.c, margin: "0 auto 5px" }} />
                    <div style={{ fontSize: 18, fontWeight: 800, color: s.c }}>{s.n}</div>
                    <div style={{ fontSize: 10, color: "var(--muted)" }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue summary */}
            <div className="card">
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>💰 ملخص مالي</div>
              {[
                ["إجمالي الحجوزات", stats.totalBookings],
                ["مؤكدة", stats.confirmedBookings],
                ["قيد الانتظار", stats.pendingBookings],
                ["ملغية", stats.cancelledBookings],
                ["إجمالي الإيرادات", `${stats.totalRevenue.toLocaleString()} ر.س`],
                ["متوسط الإيراد/حجز", stats.confirmedBookings ? `${Math.round(stats.totalRevenue / stats.confirmedBookings).toLocaleString()} ر.س` : "—"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--borderl)", fontSize: 13 }}>
                  <span style={{ color: "var(--muted)" }}>{k}</span>
                  <span style={{ fontWeight: 700, color: typeof v === "string" && v.includes("ر.س") ? "var(--gold)" : "var(--text)" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 1: Rooms ── */}
      {tab === 1 && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
            <span style={{ fontSize: 16, fontWeight: 700 }}>الغرف ({rooms.length})</span>
            <button className="btn btn-gold btn-sm" onClick={openAdd}>➕ إضافة غرفة</button>
          </div>

          {/* Modal */}
          {modal && (
            <div className="overlay">
              <div className="modal">
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>{editRoom ? "✏️ تعديل الغرفة" : "➕ إضافة غرفة جديدة"}</div>
                <div className="g2">
                  <div className="fgroup"><label className="flabel">رقم الغرفة *</label><input className="fc" value={rForm.number} onChange={e => setRForm({ ...rForm, number: e.target.value })} placeholder="مثال: 501" /></div>
                  <div className="fgroup"><label className="flabel">نوع الغرفة</label>
                    <select className="fc" value={rForm.type} onChange={e => setRForm({ ...rForm, type: e.target.value })}>
                      {roomTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="fgroup"><label className="flabel">الطابق</label><input className="fc" type="number" min={1} value={rForm.floor} onChange={e => setRForm({ ...rForm, floor: Number(e.target.value) })} /></div>
                  <div className="fgroup"><label className="flabel">السعر (ر.س/ليلة) *</label><input className="fc" type="number" value={rForm.price} onChange={e => setRForm({ ...rForm, price: Number(e.target.value) })} placeholder="0" /></div>
                  <div className="fgroup"><label className="flabel">السعة (أشخاص)</label><input className="fc" type="number" min={1} max={10} value={rForm.capacity} onChange={e => setRForm({ ...rForm, capacity: Number(e.target.value) })} /></div>
                  <div className="fgroup"><label className="flabel">الحالة</label>
                    <select className="fc" value={rForm.status} onChange={e => setRForm({ ...rForm, status: e.target.value })}>
                      <option value="available">متاحة</option>
                      <option value="occupied">مشغولة</option>
                      <option value="maintenance">صيانة</option>
                    </select>
                  </div>
                </div>
                <div className="fgroup"><label className="flabel">الوصف</label><textarea className="fc" rows={2} value={rForm.description} onChange={e => setRForm({ ...rForm, description: e.target.value })} /></div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setModal(false)}>إلغاء</button>
                  <button className="btn btn-gold" style={{ flex: 2 }} onClick={saveRoom}>💾 حفظ</button>
                </div>
              </div>
            </div>
          )}

          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="tbl-wrap">
              <table>
                <thead><tr>
                  <th>الغرفة</th><th>النوع</th><th>الطابق</th><th>السعة</th><th>السعر</th><th>الحالة</th><th>إجراءات</th>
                </tr></thead>
                <tbody>
                  {rooms.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 600 }}>غرفة {r.number}</td>
                      <td>{r.type}</td>
                      <td>طابق {r.floor}</td>
                      <td>👥 {r.capacity}</td>
                      <td style={{ color: "var(--gold)", fontWeight: 600 }}>{r.price.toLocaleString()} ر.س</td>
                      <td>
                        <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 20, background: r.status === "available" ? "rgba(41,216,122,.12)" : r.status === "occupied" ? "rgba(240,80,80,.12)" : "rgba(240,160,48,.12)", color: r.status === "available" ? "var(--green)" : r.status === "occupied" ? "var(--red)" : "var(--amber)", fontWeight: 600 }}>
                          {r.status === "available" ? "متاحة" : r.status === "occupied" ? "مشغولة" : "صيانة"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(r)}>✏️</button>
                          <button className="btn btn-danger btn-sm" onClick={() => deleteRoom(r.id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: Bookings ── */}
      {tab === 2 && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>الحجوزات ({bookings.length})</div>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="tbl-wrap">
              <table>
                <thead><tr>
                  <th>#</th><th>النزيل</th><th>الغرفة</th><th>الوصول</th><th>المغادرة</th><th>المبلغ</th><th>الحالة</th><th>الدفع</th>
                </tr></thead>
                <tbody>
                  {bookings.map(b => {
                    const room  = db.findRoomById(b.room_id);
                    const guest = db.findUserById(b.user_id);
                    return (
                      <tr key={b.id}>
                        <td style={{ color: "var(--muted)" }}>#{b.id}</td>
                        <td style={{ fontWeight: 500 }}>{guest?.name}</td>
                        <td>{room?.number} — {room?.type}</td>
                        <td style={{ fontSize: 12 }}>{b.check_in}</td>
                        <td style={{ fontSize: 12 }}>{b.check_out}</td>
                        <td style={{ color: "var(--gold)", fontWeight: 700 }}>{b.total_price.toLocaleString()} ر.س</td>
                        <td><span className={`badge ${scCls[b.status]}`} style={{ fontSize: 10 }}>{scLbl[b.status]}</span></td>
                        <td><span className={`badge ${b.payment_status === "paid" ? "b-green" : "b-amber"}`} style={{ fontSize: 10 }}>{b.payment_status === "paid" ? "مدفوع" : "معلق"}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 3: Users ── */}
      {tab === 3 && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>المستخدمون ({users.length})</div>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="tbl-wrap">
              <table>
                <thead><tr>
                  <th>#</th><th>الاسم</th><th>البريد</th><th>الهاتف</th><th>الدور</th><th>تاريخ التسجيل</th><th>إجراءات</th>
                </tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td style={{ color: "var(--muted)" }}>{u.id}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <div style={{ width: 30, height: 30, borderRadius: "50%", background: roleColor[u.role] + "20", border: `1.5px solid ${roleColor[u.role]}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: roleColor[u.role] }}>
                            {u.name[0]}
                          </div>
                          <span style={{ fontWeight: 500 }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: "var(--muted)" }}>{u.email}</td>
                      <td style={{ fontSize: 12 }}>{u.phone || "—"}</td>
                      <td>
                        <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 20, background: roleColor[u.role] + "18", color: roleColor[u.role], fontWeight: 600 }}>
                          {roleLbl[u.role]}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: "var(--muted)" }}>{u.created_at}</td>
                      <td>
                        {u.role !== "admin" && (
                          <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u.id)}>🗑️</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
