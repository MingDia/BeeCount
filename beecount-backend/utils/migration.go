package utils

import (
	"beecount-backend/models"
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

// MigrateFromOldDB 从旧的Flutter数据库迁移数据
func MigrateFromOldDB(oldDBPath string) error {
	// 检查旧数据库文件是否存在
	if _, err := os.Stat(oldDBPath); os.IsNotExist(err) {
		log.Printf("旧数据库文件不存在: %s，创建默认数据", oldDBPath)
		return createDefaultData()
	}

	// 打开旧数据库
	oldDB, err := sql.Open("sqlite3", oldDBPath)
	if err != nil {
		return fmt.Errorf("打开旧数据库失败: %v", err)
	}
	defer oldDB.Close()

	// 测试旧数据库连接
	if err := oldDB.Ping(); err != nil {
		return fmt.Errorf("旧数据库连接失败: %v", err)
	}

	log.Println("开始从旧数据库迁移数据...")

	// 迁移分类数据
	if err := migrateCategories(oldDB); err != nil {
		return fmt.Errorf("迁移分类数据失败: %v", err)
	}

	// 迁移账户数据
	if err := migrateAccounts(oldDB); err != nil {
		return fmt.Errorf("迁移账户数据失败: %v", err)
	}

	// 迁移交易数据
	if err := migrateTransactions(oldDB); err != nil {
		return fmt.Errorf("迁移交易数据失败: %v", err)
	}

	// 迁移标签数据
	if err := migrateTags(oldDB); err != nil {
		return fmt.Errorf("迁移标签数据失败: %v", err)
	}

	// 迁移预算数据
	if err := migrateBudgets(oldDB); err != nil {
		return fmt.Errorf("迁移预算数据失败: %v", err)
	}

	log.Println("数据迁移完成！")
	return nil
}

// 迁移分类数据
func migrateCategories(oldDB *sql.DB) error {
	rows, err := oldDB.Query(`
		SELECT id, name, kind, icon, sort_order, parent_id, level, icon_type, custom_icon_path, community_icon_id, sync_id
		FROM categories
	`)
	if err != nil {
		return err
	}
	defer rows.Close()

	for rows.Next() {
		var category models.Category
		var parentID sql.NullInt64
		var customIconPath, communityIconId, syncId sql.NullString

		err := rows.Scan(
			&category.ID,
			&category.Name,
			&category.Kind,
			&category.Icon,
			&category.SortOrder,
			&parentID,
			&category.Level,
			&category.IconType,
			&customIconPath,
			&communityIconId,
			&syncId,
		)
		if err != nil {
			return err
		}

		if parentID.Valid {
			category.ParentID = uint(parentID.Int64)
		}
		if customIconPath.Valid {
			category.CustomIconPath = customIconPath.String
		}
		if communityIconId.Valid {
			category.CommunityIconID = communityIconId.String
		}
		if syncId.Valid {
			category.SyncID = syncId.String
		}

		// 检查是否已存在
		var count int64
		DB.Model(&models.Category{}).Where("id = ?", category.ID).Count(&count)
		if count == 0 {
			if err := DB.Create(&category).Error; err != nil {
				return err
			}
		}
	}

	return rows.Err()
}

// 迁移账户数据
func migrateAccounts(oldDB *sql.DB) error {
	rows, err := oldDB.Query(`
		SELECT id, ledger_id, name, type, currency, initial_balance, created_at, updated_at, sort_order, 
		       credit_limit, billing_day, payment_due_day, bank_name, card_last_four, note, sync_id
		FROM accounts
	`)
	if err != nil {
		return err
	}
	defer rows.Close()

	for rows.Next() {
		var account models.Account
		var createdAt, updatedAt sql.NullInt64
		var creditLimit, billingDay, paymentDueDay sql.NullFloat64
		var bankName, cardLastFour, note, syncId sql.NullString

		err := rows.Scan(
			&account.ID,
			&account.LedgerID,
			&account.Name,
			&account.Type,
			&account.Currency,
			&account.InitialBalance,
			&createdAt,
			&updatedAt,
			&account.SortOrder,
			&creditLimit,
			&billingDay,
			&paymentDueDay,
			&bankName,
			&cardLastFour,
			&note,
			&syncId,
		)
		if err != nil {
			return err
		}

		if createdAt.Valid {
			account.CreatedAt = time.Unix(createdAt.Int64, 0)
		}
		if updatedAt.Valid {
			account.UpdatedAt = time.Unix(updatedAt.Int64, 0)
		}
		if creditLimit.Valid {
			account.CreditLimit = creditLimit.Float64
		}
		if billingDay.Valid {
			account.BillingDay = int(billingDay.Float64)
		}
		if paymentDueDay.Valid {
			account.PaymentDueDay = int(paymentDueDay.Float64)
		}
		if bankName.Valid {
			account.BankName = bankName.String
		}
		if cardLastFour.Valid {
			account.CardLastFour = cardLastFour.String
		}
		if note.Valid {
			account.Note = note.String
		}
		if syncId.Valid {
			account.SyncID = syncId.String
		}

		// 检查是否已存在
		var count int64
		DB.Model(&models.Account{}).Where("id = ?", account.ID).Count(&count)
		if count == 0 {
			if err := DB.Create(&account).Error; err != nil {
				return err
			}
		}
	}

	return rows.Err()
}

// 迁移交易数据
func migrateTransactions(oldDB *sql.DB) error {
	rows, err := oldDB.Query(`
		SELECT id, ledger_id, type, amount, category_id, account_id, to_account_id, 
		       happened_at, note, recurring_id, sync_id
		FROM transactions
	`)
	if err != nil {
		return err
	}
	defer rows.Close()

	for rows.Next() {
		var transaction models.Transaction
		var categoryID, accountID, toAccountID, recurringID sql.NullInt64
		var happenedAt sql.NullInt64
		var note, syncId sql.NullString

		err := rows.Scan(
			&transaction.ID,
			&transaction.LedgerID,
			&transaction.Type,
			&transaction.Amount,
			&categoryID,
			&accountID,
			&toAccountID,
			&happenedAt,
			&note,
			&recurringID,
			&syncId,
		)
		if err != nil {
			return err
		}

		if categoryID.Valid {
			transaction.CategoryID = uint(categoryID.Int64)
		}
		if accountID.Valid {
			transaction.AccountID = uint(accountID.Int64)
		}
		if toAccountID.Valid {
			transaction.ToAccountID = uint(toAccountID.Int64)
		}
		if happenedAt.Valid {
			transaction.HappenedAt = time.Unix(happenedAt.Int64, 0)
		}
		if note.Valid {
			transaction.Note = note.String
		}
		if recurringID.Valid {
			transaction.RecurringID = uint(recurringID.Int64)
		}
		if syncId.Valid {
			transaction.SyncID = syncId.String
		}

		// 检查是否已存在
		var count int64
		DB.Model(&models.Transaction{}).Where("id = ?", transaction.ID).Count(&count)
		if count == 0 {
			if err := DB.Create(&transaction).Error; err != nil {
				return err
			}
		}
	}

	return rows.Err()
}

// 迁移标签数据
func migrateTags(oldDB *sql.DB) error {
	rows, err := oldDB.Query(`
		SELECT id, name, color, sort_order, created_at, sync_id
		FROM tags
	`)
	if err != nil {
		return err
	}
	defer rows.Close()

	for rows.Next() {
		var tag models.Tag
		var createdAt sql.NullInt64
		var color, syncId sql.NullString

		err := rows.Scan(
			&tag.ID,
			&tag.Name,
			&color,
			&tag.SortOrder,
			&createdAt,
			&syncId,
		)
		if err != nil {
			return err
		}

		if createdAt.Valid {
			tag.CreatedAt = time.Unix(createdAt.Int64, 0)
		}
		if color.Valid {
			tag.Color = color.String
		}
		if syncId.Valid {
			tag.SyncID = syncId.String
		}

		// 检查是否已存在
		var count int64
		DB.Model(&models.Tag{}).Where("id = ?", tag.ID).Count(&count)
		if count == 0 {
			if err := DB.Create(&tag).Error; err != nil {
				return err
			}
		}
	}

	return rows.Err()
}

// 迁移预算数据
func migrateBudgets(oldDB *sql.DB) error {
	rows, err := oldDB.Query(`
		SELECT id, sync_id, ledger_id, type, category_id, amount, period, start_day, 
		       enabled, created_at, updated_at
		FROM budgets
	`)
	if err != nil {
		return err
	}
	defer rows.Close()

	for rows.Next() {
		var budget models.Budget
		var categoryID sql.NullInt64
		var createdAt, updatedAt sql.NullInt64
		var syncId sql.NullString

		err := rows.Scan(
			&budget.ID,
			&syncId,
			&budget.LedgerID,
			&budget.Type,
			&categoryID,
			&budget.Amount,
			&budget.Period,
			&budget.StartDay,
			&budget.Enabled,
			&createdAt,
			&updatedAt,
		)
		if err != nil {
			return err
		}

		if categoryID.Valid {
			budget.CategoryID = uint(categoryID.Int64)
		}
		if createdAt.Valid {
			budget.CreatedAt = time.Unix(createdAt.Int64, 0)
		}
		if updatedAt.Valid {
			budget.UpdatedAt = time.Unix(updatedAt.Int64, 0)
		}
		if syncId.Valid {
			budget.SyncID = syncId.String
		}

		// 检查是否已存在
		var count int64
		DB.Model(&models.Budget{}).Where("id = ?", budget.ID).Count(&count)
		if count == 0 {
			if err := DB.Create(&budget).Error; err != nil {
				return err
			}
		}
	}

	return rows.Err()
}

// createDefaultData 创建默认数据
func createDefaultData() error {
	log.Println("创建默认数据...")

	// 创建默认账本
	defaultLedger := models.Ledger{
		Name:     "个人账本",
		Currency: "CNY",
		Type:     "personal",
		SyncID:   "default-ledger",
	}
	if err := DB.Create(&defaultLedger).Error; err != nil {
		return err
	}

	// 创建默认账户
	defaultAccounts := []models.Account{
		{
			LedgerID:       defaultLedger.ID,
			Name:           "现金",
			Type:           "cash",
			Currency:       "CNY",
			InitialBalance: 1000.0,
			SortOrder:      0,
			SyncID:         "default-cash",
		},
		{
			LedgerID:       defaultLedger.ID,
			Name:           "银行卡",
			Type:           "bank",
			Currency:       "CNY",
			InitialBalance: 5000.0,
			SortOrder:      1,
			SyncID:         "default-bank",
		},
	}
	for _, account := range defaultAccounts {
		if err := DB.Create(&account).Error; err != nil {
			return err
		}
	}

	// 创建默认分类
	defaultCategories := []models.Category{
		{Name: "餐饮", Kind: "expense", Icon: "restaurant", SortOrder: 0, Level: 1, SyncID: "cat-food"},
		{Name: "交通", Kind: "expense", Icon: "directions_car", SortOrder: 1, Level: 1, SyncID: "cat-transport"},
		{Name: "购物", Kind: "expense", Icon: "shopping_cart", SortOrder: 2, Level: 1, SyncID: "cat-shopping"},
		{Name: "娱乐", Kind: "expense", Icon: "sports_esports", SortOrder: 3, Level: 1, SyncID: "cat-entertainment"},
		{Name: "工资", Kind: "income", Icon: "account_balance_wallet", SortOrder: 0, Level: 1, SyncID: "cat-salary"},
		{Name: "奖金", Kind: "income", Icon: "card_giftcard", SortOrder: 1, Level: 1, SyncID: "cat-bonus"},
	}
	for _, category := range defaultCategories {
		if err := DB.Create(&category).Error; err != nil {
			return err
		}
	}

	// 创建默认标签
	defaultTags := []models.Tag{
		{Name: "必要", Color: "#4CAF50", SortOrder: 0, SyncID: "tag-necessary"},
		{Name: "可选", Color: "#2196F3", SortOrder: 1, SyncID: "tag-optional"},
		{Name: "紧急", Color: "#F44336", SortOrder: 2, SyncID: "tag-urgent"},
	}
	for _, tag := range defaultTags {
		if err := DB.Create(&tag).Error; err != nil {
			return err
		}
	}

	// 创建默认预算
	defaultBudget := models.Budget{
		SyncID:   "default-budget",
		LedgerID: defaultLedger.ID,
		Type:     "total",
		Amount:   3000.0,
		Period:   "monthly",
		StartDay: 1,
		Enabled:  true,
	}
	if err := DB.Create(&defaultBudget).Error; err != nil {
		return err
	}

	// 创建默认交易
	defaultTransactions := []models.Transaction{
		{
			LedgerID:    defaultLedger.ID,
			Type:       "expense",
			Amount:     100.0,
			CategoryID: 1, // 餐饮
			AccountID:  1, // 现金
			HappenedAt: time.Now().Add(-24 * time.Hour),
			Note:       "午餐",
			SyncID:     "tx-1",
		},
		{
			LedgerID:    defaultLedger.ID,
			Type:       "expense",
			Amount:     50.0,
			CategoryID: 2, // 交通
			AccountID:  1, // 现金
			HappenedAt: time.Now().Add(-48 * time.Hour),
			Note:       "打车",
			SyncID:     "tx-2",
		},
		{
			LedgerID:    defaultLedger.ID,
			Type:       "income",
			Amount:     5000.0,
			CategoryID: 5, // 工资
			AccountID:  2, // 银行卡
			HappenedAt: time.Now().Add(-7 * 24 * time.Hour),
			Note:       "月薪",
			SyncID:     "tx-3",
		},
	}
	for _, transaction := range defaultTransactions {
		if err := DB.Create(&transaction).Error; err != nil {
			return err
		}
	}

	log.Println("默认数据创建完成！")
	return nil
}
