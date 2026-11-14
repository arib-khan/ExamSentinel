const db = require("../config/db"); // by sunil

// Create a new notification
exports.createNotification = async (data) => {
  const { type, title, message, user_role_id, receiver_id, triggered_by } = data;

  const [result] = await db.query(
    `INSERT INTO notifications (type, title, message, user_role_id, receiver_id, triggered_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [type, title, message, user_role_id || null, receiver_id || null, triggered_by || null]
  );

  // Return inserted record
  const [rows] = await db.query("SELECT * FROM notifications WHERE id = ?", [result.insertId]);
  return rows[0];
};

// Get notifications for user or role
exports.getNotifications = async (user_id, role_id) => {
  const [rows] = await db.query(
    `SELECT n.*, ur.user_role_name, u.user_name AS triggered_by_name
     FROM notifications n
     LEFT JOIN user_roles ur ON n.user_role_id = ur.user_role_id
     LEFT JOIN user u ON n.triggered_by = u.user_id
     WHERE (n.receiver_id = ? OR n.user_role_id = ? OR n.user_role_id IS NULL)
     ORDER BY n.created_at DESC`,
    [user_id, role_id]
  );
  return rows;
};

// Mark notification as read
exports.markAsRead = async (id) => {
  await db.query("UPDATE notifications SET is_read = TRUE WHERE id = ?", [id]);
};
