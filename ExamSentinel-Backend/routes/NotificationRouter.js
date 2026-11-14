const express = require("express");
const router = express.Router();
const Notification = require("../models/notification");

// Create new notification
router.post("/", async (req, res) => {
  try {
    const data = req.body;
    const notif = await Notification.createNotification(data);

    // Optional: if you want to broadcast (later)
    // global.notificationClients?.forEach(ws => ws.send(JSON.stringify(notif)));

    res.status(201).json({ success: true, data: notif });
  } catch (err) {
    console.error("Error creating notification:", err);
    res.status(500).json({ success: false, message: "Failed to create notification" });
  }
});

// Fetch notifications
router.get("/", async (req, res) => {
  try {
    const { user_id, role_id } = req.query;
    const notifications = await Notification.getNotifications(user_id, role_id);
    res.json({ success: true, data: notifications });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
});

// Mark as read
router.patch("/:id/read", async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.markAsRead(id);
    res.json({ success: true });
  } catch (err) {
    console.error("Error marking as read:", err);
    res.status(500).json({ success: false, message: "Failed to update notification" });
  }
});

module.exports = router;
