package utils

import (
	"beecount-backend/models"
	"fmt"
	"log"
	"time"

	"github.com/robfig/cron/v3"
)

var (
	scheduler *cron.Cron
	notificationChan chan Notification
)

// Notification 通知结构
type Notification struct {
	UserID  uint   `json:"user_id"`
	Type    string `json:"type"` // reminder, budget, transaction
	Title   string `json:"title"`
	Message string `json:"message"`
	Data    map[string]interface{} `json:"data,omitempty"`
}

// InitScheduler 初始化定时任务调度器
func InitScheduler() {
	scheduler = cron.New()
	notificationChan = make(chan Notification, 100)

	// 每分钟检查周期交易
	_, err := scheduler.AddFunc("* * * * *", checkRecurringTransactions)
	if err != nil {
		log.Printf("Failed to add recurring transaction check: %v", err)
	}

	// 每5分钟检查待处理的提醒
	_, err = scheduler.AddFunc("*/5 * * * *", checkPendingReminders)
	if err != nil {
		log.Printf("Failed to add reminder check: %v", err)
	}

	// 启动通知处理goroutine
	go processNotifications()

	scheduler.Start()
	log.Println("Scheduler started successfully")
}

// StopScheduler 停止定时任务调度器
func StopScheduler() {
	if scheduler != nil {
		scheduler.Stop()
		close(notificationChan)
	}
}

// checkRecurringTransactions 检查并生成周期交易
func checkRecurringTransactions() {
	log.Println("Checking recurring transactions...")

	var recurringTransactions []models.RecurringTransaction
	if err := DB.Where("enabled = ?", true).Find(&recurringTransactions).Error; err != nil {
		log.Printf("Failed to fetch recurring transactions: %v", err)
		return
	}

	now := time.Now()
	generatedCount := 0

	for _, rt := range recurringTransactions {
		generated, err := generateRecurringTransaction(&rt, now)
		if err != nil {
			log.Printf("Failed to generate transaction for recurring %d: %v", rt.ID, err)
			continue
		}
		if generated {
			generatedCount++
		}
	}

	if generatedCount > 0 {
		log.Printf("Generated %d recurring transactions", generatedCount)
	}
}

// generateRecurringTransaction 生成单个周期交易
func generateRecurringTransaction(rt *models.RecurringTransaction, now time.Time) (bool, error) {
	// 检查是否超过结束日期
	if !rt.EndDate.IsZero() && now.After(rt.EndDate) {
		return false, nil
	}

	// 计算下次应该生成的日期
	nextDate := calculateNextDate(rt, now)
	if nextDate.IsZero() {
		return false, nil
	}

	// 检查是否已经生成过
	if !rt.LastGeneratedDate.IsZero() && !nextDate.After(rt.LastGeneratedDate) {
		return false, nil
	}

	// 创建交易
	transaction := models.Transaction{
		LedgerID:    rt.LedgerID,
		Type:        rt.Type,
		Amount:      rt.Amount,
		CategoryID:  rt.CategoryID,
		AccountID:   rt.AccountID,
		ToAccountID: rt.ToAccountID,
		HappenedAt:  nextDate,
		Note:        rt.Note,
		RecurringID: rt.ID,
	}

	if err := DB.Create(&transaction).Error; err != nil {
		return false, err
	}

	// 更新最后生成日期
	rt.LastGeneratedDate = nextDate
	if err := DB.Save(rt).Error; err != nil {
		return false, err
	}

	// 发送通知给相关用户
	go sendTransactionNotification(transaction)

	return true, nil
}

// calculateNextDate 计算下一个应该生成的日期
func calculateNextDate(rt *models.RecurringTransaction, now time.Time) time.Time {
	if rt.StartDate.After(now) {
		return rt.StartDate
	}

	var nextDate time.Time
	if rt.LastGeneratedDate.IsZero() {
		nextDate = rt.StartDate
	} else {
		nextDate = rt.LastGeneratedDate
	}

	for nextDate.Before(now) || nextDate.Equal(now) {
		switch rt.Frequency {
		case "daily":
			nextDate = nextDate.AddDate(0, 0, rt.Interval)
		case "weekly":
			nextDate = nextDate.AddDate(0, 0, rt.Interval*7)
		case "monthly":
			nextDate = nextDate.AddDate(0, rt.Interval, 0)
		case "yearly":
			nextDate = nextDate.AddDate(rt.Interval, 0, 0)
		default:
			return time.Time{}
		}

		// 检查是否超过结束日期
		if !rt.EndDate.IsZero() && nextDate.After(rt.EndDate) {
			return time.Time{}
		}
	}

	return nextDate
}

// checkPendingReminders 检查待处理的提醒
func checkPendingReminders() {
	log.Println("Checking pending reminders...")

	now := time.Now()
	var reminders []models.Reminder

	// 查询需要通知的提醒
	err := DB.Where("enabled = ? AND reminder_date <= ? AND (notified_at IS NULL OR (frequency != 'once' AND notified_at < reminder_date))",
		true, now).Find(&reminders).Error

	if err != nil {
		log.Printf("Failed to fetch pending reminders: %v", err)
		return
	}

	notifiedCount := 0

	for _, reminder := range reminders {
		if shouldNotify(&reminder, now) {
			go sendReminderNotification(&reminder)

			// 更新通知时间
			reminder.NotifiedAt = now

			// 计算下次提醒日期（对于周期性提醒）
			if reminder.Frequency != "once" {
				reminder.ReminderDate = calculateNextReminderDate(&reminder, now)
			}

			if err := DB.Save(&reminder).Error; err != nil {
				log.Printf("Failed to update reminder %d: %v", reminder.ID, err)
				continue
			}
			notifiedCount++
		}
	}

	if notifiedCount > 0 {
		log.Printf("Sent %d reminder notifications", notifiedCount)
	}
}

// shouldNotify 检查是否应该发送通知
func shouldNotify(reminder *models.Reminder, now time.Time) bool {
	if !reminder.Enabled {
		return false
	}

	if reminder.ReminderDate.After(now) {
		return false
	}

	// 如果已经通知过，检查是否需要再次通知
	if !reminder.NotifiedAt.IsZero() {
		if reminder.Frequency == "once" {
			return false
		}

		// 对于周期性提醒，检查是否到了新的通知时间
		nextReminder := calculateNextReminderDate(reminder, reminder.NotifiedAt)
		if !nextReminder.Before(now) {
			return false
		}
	}

	return true
}

// calculateNextReminderDate 计算下次提醒日期
func calculateNextReminderDate(reminder *models.Reminder, from time.Time) time.Time {
	nextDate := from
	switch reminder.Frequency {
	case "daily":
		nextDate = nextDate.AddDate(0, 0, 1)
	case "weekly":
		nextDate = nextDate.AddDate(0, 0, 7)
	case "monthly":
		nextDate = nextDate.AddDate(0, 1, 0)
	}
	return nextDate
}

// sendReminderNotification 发送提醒通知
func sendReminderNotification(reminder *models.Reminder) {
	notification := Notification{
		UserID:  reminder.UserID,
		Type:    "reminder",
		Title:   reminder.Title,
		Message: reminder.Description,
		Data: map[string]interface{}{
			"reminder_id": reminder.ID,
			"type":        reminder.Type,
			"amount":      reminder.Amount,
		},
	}

	select {
	case notificationChan <- notification:
	default:
		log.Printf("Notification channel full, dropping reminder notification for user %d", reminder.UserID)
	}
}

// sendTransactionNotification 发送交易通知
func sendTransactionNotification(transaction models.Transaction) {
	// 获取账本的所有用户
	var userLedgers []models.UserLedger
	if err := DB.Where("ledger_id = ?", transaction.LedgerID).Find(&userLedgers).Error; err != nil {
		log.Printf("Failed to fetch ledger users: %v", err)
		return
	}

	for _, ul := range userLedgers {
		notification := Notification{
			UserID:  ul.UserID,
			Type:    "transaction",
			Title:   "新交易记录",
			Message: fmt.Sprintf("自动生成了一笔%s交易: %.2f", transaction.Type, transaction.Amount),
			Data: map[string]interface{}{
				"transaction_id": transaction.ID,
				"type":           transaction.Type,
				"amount":         transaction.Amount,
			},
		}

		select {
		case notificationChan <- notification:
		default:
			log.Printf("Notification channel full, dropping transaction notification for user %d", ul.UserID)
		}
	}
}

// processNotifications 处理通知队列
func processNotifications() {
	for notification := range notificationChan {
		// 这里可以实现多种通知方式
		// 1. 数据库通知记录
		// 2. WebSocket推送
		// 3. 邮件通知
		// 4. 手机推送
		log.Printf("Notification for user %d: %s - %s", notification.UserID, notification.Title, notification.Message)

		// 保存通知到数据库（可选）
		// 这里只做日志记录，实际项目可以根据需要实现不同的通知方式
	}
}

// GetPendingNotifications 获取待发送的通知（用于API）
func GetPendingNotifications(userID uint) ([]Notification, error) {
	// 这里可以实现从数据库或缓存获取未读通知
	// 暂时返回空数组
	return []Notification{}, nil
}

// ManualTriggerRecurringGeneration 手动触发生成周期交易
func ManualTriggerRecurringGeneration() (int, error) {
	var recurringTransactions []models.RecurringTransaction
	if err := DB.Where("enabled = ?", true).Find(&recurringTransactions).Error; err != nil {
		return 0, err
	}

	now := time.Now()
	generatedCount := 0

	for _, rt := range recurringTransactions {
		generated, err := generateRecurringTransaction(&rt, now)
		if err != nil {
			log.Printf("Failed to generate transaction for recurring %d: %v", rt.ID, err)
			continue
		}
		if generated {
			generatedCount++
		}
	}

	return generatedCount, nil
}

// ManualTriggerReminderCheck 手动触发提醒检查
func ManualTriggerReminderCheck() (int, error) {
	now := time.Now()
	var reminders []models.Reminder

	err := DB.Where("enabled = ? AND reminder_date <= ? AND (notified_at IS NULL OR (frequency != 'once' AND notified_at < reminder_date))",
		true, now).Find(&reminders).Error

	if err != nil {
		return 0, err
	}

	notifiedCount := 0

	for _, reminder := range reminders {
		if shouldNotify(&reminder, now) {
			sendReminderNotification(&reminder)
			reminder.NotifiedAt = now
			if reminder.Frequency != "once" {
				reminder.ReminderDate = calculateNextReminderDate(&reminder, now)
			}
			DB.Save(&reminder)
			notifiedCount++
		}
	}

	return notifiedCount, nil
}
