// ===================================================
// MySQL Schema Simulation (In-Memory JavaScript DB)
// In production: connect to MySQL via Express + mysql2
// ===================================================
// Tables: users, rooms, bookings, payments

const DB = {
  users: [
    { id: 1, name: "أحمد محمد", email: "admin@hotel.com", password: "admin123", role: "admin", phone: "0501234567", created_at: "2024-01-01" },
    { id: 2, name: "سارة الأحمدي", email: "staff@hotel.com", password: "staff123", role: "staff", phone: "0507654321", created_at: "2024-02-01" },
    { id: 3, name: "خالد العمري", email: "guest@hotel.com", password: "guest123", role: "guest", phone: "0509871234", created_at: "2024-03-01" },
    { id: 4, name: "نورة السالم", email: "nora@hotel.com", password: "nora123", role: "guest", phone: "0503456789", created_at: "2024-03-15" },
  ],
  rooms: [
    { id: 1, number: "101", type: "مفردة", floor: 1, price: 250, status: "available", capacity: 1, description: "غرفة مفردة بإطلالة على الحديقة", amenities: ["wifi", "tv", "ac"] },
    { id: 2, number: "102", type: "مزدوجة", floor: 1, price: 420, status: "occupied", capacity: 2, description: "غرفة مزدوجة فسيحة مع سرير كينج", amenities: ["wifi", "tv", "ac", "minibar"] },
    { id: 3, number: "201", type: "جناح", floor: 2, price: 850, status: "available", capacity: 3, description: "جناح فاخر مع صالة جلوس وجاكوزي", amenities: ["wifi", "tv", "ac", "minibar", "jacuzzi"] },
    { id: 4, number: "202", type: "مفردة", floor: 2, price: 280, status: "maintenance", capacity: 1, description: "غرفة مفردة بإطلالة بانورامية", amenities: ["wifi", "tv", "ac"] },
    { id: 5, number: "301", type: "مزدوجة", floor: 3, price: 460, status: "available", capacity: 2, description: "غرفة مزدوجة مع شرفة خاصة", amenities: ["wifi", "tv", "ac", "minibar", "balcony"] },
    { id: 6, number: "302", type: "جناح ملكي", floor: 3, price: 1600, status: "available", capacity: 5, description: "الجناح الملكي الأفخم مع خدمة كونسيرج", amenities: ["wifi", "tv", "ac", "minibar", "jacuzzi", "kitchen", "butler"] },
    { id: 7, number: "401", type: "عائلية", floor: 4, price: 680, status: "available", capacity: 5, description: "غرفة عائلية واسعة بغرفتي نوم ومطبخ", amenities: ["wifi", "tv", "ac", "kitchen"] },
    { id: 8, number: "402", type: "مفردة", floor: 4, price: 310, status: "occupied", capacity: 1, description: "غرفة مفردة فاخرة بإطلالة البحر", amenities: ["wifi", "tv", "ac", "seaview"] },
  ],
  bookings: [
    { id: 1, user_id: 3, room_id: 2, check_in: "2025-05-08", check_out: "2025-05-11", guests: 2, total_price: 1260, status: "confirmed", payment_method: "credit_card", payment_status: "paid", notes: "", created_at: "2025-04-28" },
    { id: 2, user_id: 4, room_id: 8, check_in: "2025-05-12", check_out: "2025-05-14", guests: 1, total_price: 620, status: "confirmed", payment_method: "digital_wallet", payment_status: "paid", notes: "طلب تسجيل وصول مبكر", created_at: "2025-05-01" },
    { id: 3, user_id: 3, room_id: 3, check_in: "2025-06-01", check_out: "2025-06-04", guests: 2, total_price: 2550, status: "pending", payment_method: "credit_card", payment_status: "pending", notes: "", created_at: "2025-05-14" },
  ],
  payments: [
    { id: 1, booking_id: 1, amount: 1260, method: "credit_card", status: "completed", transaction_id: "TXN-8821", created_at: "2025-04-28" },
    { id: 2, booking_id: 2, amount: 620, method: "digital_wallet", status: "completed", transaction_id: "TXN-8934", created_at: "2025-05-01" },
  ],
  _next: { users: 5, rooms: 9, bookings: 4, payments: 3 },
};

export const db = {
  // --- USERS ---
  findUserByEmail: (email) => DB.users.find(u => u.email === email) || null,
  findUserById: (id) => DB.users.find(u => u.id === id) || null,
  getAllUsers: () => [...DB.users],
  createUser: (data) => {
    const row = { id: DB._next.users++, ...data, role: "guest", created_at: new Date().toISOString().split("T")[0] };
    DB.users.push(row); return row;
  },
  updateUser: (id, data) => {
    const i = DB.users.findIndex(u => u.id === id);
    if (i < 0) return null;
    DB.users[i] = { ...DB.users[i], ...data };
    return DB.users[i];
  },
  deleteUser: (id) => {
    const i = DB.users.findIndex(u => u.id === id);
    if (i < 0) return false;
    DB.users.splice(i, 1); return true;
  },

  // --- ROOMS ---
  getAllRooms: () => [...DB.rooms],
  findRoomById: (id) => DB.rooms.find(r => r.id === id) || null,
  getAvailableRooms: () => DB.rooms.filter(r => r.status === "available"),
  createRoom: (data) => {
    const row = { id: DB._next.rooms++, amenities: [], ...data };
    DB.rooms.push(row); return row;
  },
  updateRoom: (id, data) => {
    const i = DB.rooms.findIndex(r => r.id === id);
    if (i < 0) return null;
    DB.rooms[i] = { ...DB.rooms[i], ...data };
    return DB.rooms[i];
  },
  deleteRoom: (id) => {
    const i = DB.rooms.findIndex(r => r.id === id);
    if (i < 0) return false;
    DB.rooms.splice(i, 1); return true;
  },

  // --- BOOKINGS ---
  getAllBookings: () => [...DB.bookings],
  findBookingById: (id) => DB.bookings.find(b => b.id === id) || null,
  getBookingsByUser: (uid) => DB.bookings.filter(b => b.user_id === uid),
  createBooking: (data) => {
    const row = { id: DB._next.bookings++, ...data, created_at: new Date().toISOString().split("T")[0] };
    DB.bookings.push(row);
    db.updateRoom(data.room_id, { status: "occupied" });
    return row;
  },
  updateBooking: (id, data) => {
    const i = DB.bookings.findIndex(b => b.id === id);
    if (i < 0) return null;
    DB.bookings[i] = { ...DB.bookings[i], ...data };
    return DB.bookings[i];
  },
  cancelBooking: (id) => {
    const b = DB.bookings.find(bk => bk.id === id);
    if (!b) return false;
    b.status = "cancelled";
    const room = DB.rooms.find(r => r.id === b.room_id);
    if (room && room.status === "occupied") room.status = "available";
    return true;
  },

  // --- PAYMENTS ---
  getAllPayments: () => [...DB.payments],
  createPayment: (data) => {
    const row = { id: DB._next.payments++, ...data, transaction_id: "TXN-" + Math.floor(Math.random() * 90000 + 10000), created_at: new Date().toISOString().split("T")[0] };
    DB.payments.push(row); return row;
  },

  // --- STATISTICS (aggregate queries) ---
  getStats: () => {
    const { rooms, bookings, payments, users } = DB;
    return {
      totalRooms: rooms.length,
      availableRooms: rooms.filter(r => r.status === "available").length,
      occupiedRooms: rooms.filter(r => r.status === "occupied").length,
      maintenanceRooms: rooms.filter(r => r.status === "maintenance").length,
      totalBookings: bookings.length,
      confirmedBookings: bookings.filter(b => b.status === "confirmed").length,
      pendingBookings: bookings.filter(b => b.status === "pending").length,
      cancelledBookings: bookings.filter(b => b.status === "cancelled").length,
      totalRevenue: payments.filter(p => p.status === "completed").reduce((s, p) => s + p.amount, 0),
      guestCount: users.filter(u => u.role === "guest").length,
      occupancyRate: rooms.length ? Math.round((rooms.filter(r => r.status === "occupied").length / rooms.length) * 100) : 0,
    };
  },
};

export default DB;
