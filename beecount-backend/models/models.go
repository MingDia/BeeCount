package models

import (
	"time"

	"gorm.io/gorm"
)

// User 用户模型
type User struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	Username     string         `json:"username" gorm:"unique;not null"`
	Email        string         `json:"email" gorm:"unique;not null"`
	PasswordHash string         `json:"-" gorm:"not null"` // 不返回密码
	Nickname     string         `json:"nickname" gorm:"default:null"`
	Avatar       string         `json:"avatar" gorm:"default:null"`
	Theme        string         `json:"theme" gorm:"default:light"`
	Language     string         `json:"language" gorm:"default:zh-CN"`
	FontScale    float64        `json:"font_scale" gorm:"default:1.0"`
	CreatedAt    time.Time      `json:"created_at" gorm:"default:CURRENT_TIMESTAMP"`
	UpdatedAt    time.Time      `json:"updated_at" gorm:"default:CURRENT_TIMESTAMP"`
	Ledgers      []Ledger       `json:"ledgers,omitempty" gorm:"many2many:user_ledgers;"`
	Reminders    []Reminder     `json:"reminders,omitempty" gorm:"foreignKey:UserID"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`
}

// UserLedger 用户-账本关联模型
type UserLedger struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	UserID    uint           `json:"user_id" gorm:"index"`
	LedgerID  uint           `json:"ledger_id" gorm:"index"`
	Role      string         `json:"role" gorm:"default:owner"` // owner / editor / viewer
	CreatedAt time.Time      `json:"created_at" gorm:"default:CURRENT_TIMESTAMP"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

// Ledger 账本模型
type Ledger struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Name      string         `json:"name" gorm:"not null"`
	Currency  string         `json:"currency" gorm:"default:CNY"`
	Type      string         `json:"type" gorm:"default:personal"` // personal / shared
	CreatedAt time.Time      `json:"created_at" gorm:"default:CURRENT_TIMESTAMP"`
	SyncID    string         `json:"sync_id" gorm:"index"`
	Accounts  []Account      `json:"accounts,omitempty" gorm:"foreignKey:LedgerID"`
	Users     []User         `json:"users,omitempty" gorm:"many2many:user_ledgers;"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

// Account 账户模型
type Account struct {
	ID             uint           `json:"id" gorm:"primaryKey"`
	LedgerID       uint           `json:"ledger_id" gorm:"index"`
	Name           string         `json:"name" gorm:"not null"`
	Type           string         `json:"type" gorm:"default:cash"`
	Currency       string         `json:"currency" gorm:"default:CNY"`
	InitialBalance float64        `json:"initial_balance" gorm:"default:0.0"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	SortOrder      int            `json:"sort_order" gorm:"default:0"`
	CreditLimit    float64        `json:"credit_limit" gorm:"default:null"`
	BillingDay     int            `json:"billing_day" gorm:"default:null"`
	PaymentDueDay  int            `json:"payment_due_day" gorm:"default:null"`
	BankName       string         `json:"bank_name" gorm:"default:null"`
	CardLastFour   string         `json:"card_last_four" gorm:"default:null"`
	Note           string         `json:"note" gorm:"default:null"`
	SyncID         string         `json:"sync_id" gorm:"index"`
	DeletedAt      gorm.DeletedAt `json:"-" gorm:"index"`
}

// Category 分类模型
type Category struct {
	ID              uint           `json:"id" gorm:"primaryKey"`
	Name            string         `json:"name" gorm:"not null"`
	Kind            string         `json:"kind" gorm:"not null"` // expense / income
	Icon            string         `json:"icon" gorm:"default:null"`
	SortOrder       int            `json:"sort_order" gorm:"default:0"`
	ParentID        uint           `json:"parent_id" gorm:"default:null"`
	Level           int            `json:"level" gorm:"default:1"`
	IconType        string         `json:"icon_type" gorm:"default:material"` // material / custom / community
	CustomIconPath  string         `json:"custom_icon_path" gorm:"default:null"`
	CommunityIconID string         `json:"community_icon_id" gorm:"default:null"`
	SyncID          string         `json:"sync_id" gorm:"index"`
	DeletedAt       gorm.DeletedAt `json:"-" gorm:"index"`
}

// Transaction 交易模型
type Transaction struct {
	ID            uint           `json:"id" gorm:"primaryKey"`
	LedgerID      uint           `json:"ledger_id" gorm:"index"`
	Type          string         `json:"type" gorm:"not null"` // expense / income / transfer
	Amount        float64        `json:"amount" gorm:"not null"`
	CategoryID    uint           `json:"category_id" gorm:"default:null"`
	AccountID     uint           `json:"account_id" gorm:"default:null"`
	ToAccountID   uint           `json:"to_account_id" gorm:"default:null"`
	HappenedAt    time.Time      `json:"happened_at" gorm:"not null;default:CURRENT_TIMESTAMP"`
	Note          string         `json:"note" gorm:"default:null"`
	RecurringID   uint           `json:"recurring_id" gorm:"default:null"`
	SyncID        string         `json:"sync_id" gorm:"index"`
	Tags          []Tag          `json:"tags,omitempty" gorm:"many2many:transaction_tags;"`
	Attachments   []TransactionAttachment `json:"attachments,omitempty" gorm:"foreignKey:TransactionID"`
	DeletedAt     gorm.DeletedAt `json:"-" gorm:"index"`
}

// RecurringTransaction 重复交易模型
type RecurringTransaction struct {
	ID              uint           `json:"id" gorm:"primaryKey"`
	LedgerID        uint           `json:"ledger_id" gorm:"index"`
	Type            string         `json:"type" gorm:"not null"` // expense / income / transfer
	Amount          float64        `json:"amount" gorm:"not null"`
	CategoryID      uint           `json:"category_id" gorm:"default:null"`
	AccountID       uint           `json:"account_id" gorm:"default:null"`
	ToAccountID     uint           `json:"to_account_id" gorm:"default:null"`
	Note            string         `json:"note" gorm:"default:null"`
	Frequency       string         `json:"frequency" gorm:"not null"` // daily / weekly / monthly / yearly
	Interval        int            `json:"interval" gorm:"default:1"`
	DayOfMonth      int            `json:"day_of_month" gorm:"default:null"`
	DayOfWeek       int            `json:"day_of_week" gorm:"default:null"`
	MonthOfYear     int            `json:"month_of_year" gorm:"default:null"`
	StartDate       time.Time      `json:"start_date" gorm:"not null"`
	EndDate         time.Time      `json:"end_date" gorm:"default:null"`
	LastGeneratedDate time.Time    `json:"last_generated_date" gorm:"default:null"`
	Enabled         bool           `json:"enabled" gorm:"default:true"`
	CreatedAt       time.Time      `json:"created_at" gorm:"default:CURRENT_TIMESTAMP"`
	UpdatedAt       time.Time      `json:"updated_at" gorm:"default:CURRENT_TIMESTAMP"`
	DeletedAt       gorm.DeletedAt `json:"-" gorm:"index"`
}

// Tag 标签模型
type Tag struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Name      string         `json:"name" gorm:"not null"`
	Color     string         `json:"color" gorm:"default:null"`
	SortOrder int            `json:"sort_order" gorm:"default:0"`
	CreatedAt time.Time      `json:"created_at" gorm:"default:CURRENT_TIMESTAMP"`
	SyncID    string         `json:"sync_id" gorm:"index"`
	Transactions []Transaction `json:"transactions,omitempty" gorm:"many2many:transaction_tags;"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

// TransactionTag 交易-标签关联模型
type TransactionTag struct {
	ID            uint           `json:"id" gorm:"primaryKey"`
	TransactionID uint           `json:"transaction_id" gorm:"index"`
	TagID         uint           `json:"tag_id" gorm:"index"`
	DeletedAt     gorm.DeletedAt `json:"-" gorm:"index"`
}

// Budget 预算模型
type Budget struct {
	ID         uint           `json:"id" gorm:"primaryKey"`
	SyncID     string         `json:"sync_id" gorm:"index"`
	LedgerID   uint           `json:"ledger_id" gorm:"index"`
	Type       string         `json:"type" gorm:"default:total"` // total-总预算, category-分类预算
	CategoryID uint           `json:"category_id" gorm:"default:null"`
	Amount     float64        `json:"amount" gorm:"not null"`
	Period     string         `json:"period" gorm:"default:monthly"` // monthly-月度, weekly-周度, yearly-年度
	StartDay   int            `json:"start_day" gorm:"default:1"`
	Enabled    bool           `json:"enabled" gorm:"default:true"`
	CreatedAt  time.Time      `json:"created_at" gorm:"default:CURRENT_TIMESTAMP"`
	UpdatedAt  time.Time      `json:"updated_at" gorm:"default:CURRENT_TIMESTAMP"`
	DeletedAt  gorm.DeletedAt `json:"-" gorm:"index"`
}

// TransactionAttachment 交易附件模型
type TransactionAttachment struct {
	ID             uint           `json:"id" gorm:"primaryKey"`
	TransactionID  uint           `json:"transaction_id" gorm:"index"`
	FileName       string         `json:"file_name" gorm:"not null"`
	OriginalName   string         `json:"original_name" gorm:"default:null"`
	FileSize       int            `json:"file_size" gorm:"default:null"`
	Width          int            `json:"width" gorm:"default:null"`
	Height         int            `json:"height" gorm:"default:null"`
	SortOrder      int            `json:"sort_order" gorm:"default:0"`
	CloudFileID    string         `json:"cloud_file_id" gorm:"default:null"`
	CloudSha256    string         `json:"cloud_sha256" gorm:"default:null"`
	CreatedAt      time.Time      `json:"created_at" gorm:"default:CURRENT_TIMESTAMP"`
	DeletedAt      gorm.DeletedAt `json:"-" gorm:"index"`
}

// Reminder 提醒模型
type Reminder struct {
	ID             uint           `json:"id" gorm:"primaryKey"`
	UserID         uint           `json:"user_id" gorm:"index"`
	LedgerID       uint           `json:"ledger_id" gorm:"default:null"`
	Type           string         `json:"type" gorm:"not null"` // budget-预算提醒, recurring-周期交易提醒, bill-账单提醒, custom-自定义提醒
	Title          string         `json:"title" gorm:"not null"`
	Description    string         `json:"description" gorm:"default:null"`
	Amount         float64        `json:"amount" gorm:"default:null"`
	ReminderDate   time.Time      `json:"reminder_date" gorm:"not null"`
	Frequency      string         `json:"frequency" gorm:"default:once"` // once-一次性, daily-每日, weekly-每周, monthly-每月
	Enabled        bool           `json:"enabled" gorm:"default:true"`
	NotifiedAt     time.Time      `json:"notified_at" gorm:"default:null"`
	CreatedAt      time.Time      `json:"created_at" gorm:"default:CURRENT_TIMESTAMP"`
	UpdatedAt      time.Time      `json:"updated_at" gorm:"default:CURRENT_TIMESTAMP"`
	DeletedAt      gorm.DeletedAt `json:"-" gorm:"index"`
}

// TransactionPattern 交易模式模型（用于智能分类）
type TransactionPattern struct {
	ID            uint           `json:"id" gorm:"primaryKey"`
	UserID        uint           `json:"user_id" gorm:"index"`
	NotePattern   string         `json:"note_pattern" gorm:"not null"` // 备注模式（关键词）
	CategoryID    uint           `json:"category_id" gorm:"not null"`
	Type          string         `json:"type" gorm:"not null"` // expense / income
	AccountID     uint           `json:"account_id" gorm:"default:null"`
	Confidence    float64        `json:"confidence" gorm:"default:0.8"`
	UsageCount    int            `json:"usage_count" gorm:"default:0"`
	CreatedAt     time.Time      `json:"created_at" gorm:"default:CURRENT_TIMESTAMP"`
	UpdatedAt     time.Time      `json:"updated_at" gorm:"default:CURRENT_TIMESTAMP"`
	DeletedAt     gorm.DeletedAt `json:"-" gorm:"index"`
}
