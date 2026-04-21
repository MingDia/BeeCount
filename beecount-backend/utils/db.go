package utils

import (
	"beecount-backend/config"
	"beecount-backend/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

// InitDB 初始化数据库连接
func InitDB(cfg *config.Config) error {
	var err error
	DB, err = gorm.Open(sqlite.Open(cfg.DBPath), &gorm.Config{})
	if err != nil {
		return err
	}
	return nil
}

// AutoMigrate 自动迁移数据库表结构
func AutoMigrate() error {
	return DB.AutoMigrate(
		&models.Ledger{},
		&models.Account{},
		&models.Category{},
		&models.Transaction{},
		&models.RecurringTransaction{},
		&models.Tag{},
		&models.TransactionTag{},
		&models.Budget{},
		&models.TransactionAttachment{},
	)
}
