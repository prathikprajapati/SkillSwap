import { Router } from "express";
import { param } from "express-validator";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
} from "../controllers/notificationsController";
import { verifyFirebaseToken } from "../middleware/firebaseAuth";

const router = Router();

// All notification routes require Firebase authentication (includes active user check)
router.use(verifyFirebaseToken);

// GET /notifications - List notifications (with pagination)
router.get("/", getNotifications);

// GET /notifications/unread-count - Get unread count
router.get("/unread-count", getUnreadCount);

// PUT /notifications/:id/read - Mark a single notification as read
router.put("/:id/read", [param("id").isUUID()], markNotificationAsRead);

// PUT /notifications/read-all - Mark all notifications as read
router.put("/read-all", markAllNotificationsAsRead);

export default router;
