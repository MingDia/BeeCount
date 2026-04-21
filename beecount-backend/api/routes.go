package api

import (
	"github.com/gin-gonic/gin"
)

// RegisterRoutes 注册API路由
func RegisterRoutes(r *gin.Engine) {
	// API版本前缀
	api := r.Group("/api/v1")

	// 账本相关路由
	ledgers := api.Group("/ledgers")
	{
		ledgers.GET("", GetLedgers)
		ledgers.POST("", CreateLedger)
		ledgers.GET("/:id", GetLedger)
		ledgers.PUT("/:id", UpdateLedger)
		ledgers.DELETE("/:id", DeleteLedger)

		// 账本下的账户
		ledgers.GET("/:id/accounts", GetAccountsByLedger)

		// 账本下的交易
		ledgers.GET("/:id/transactions", GetTransactionsByLedger)

		// 账本下的预算
		ledgers.GET("/:id/budgets", GetBudgetsByLedger)
	}

	// 账户相关路由
	accounts := api.Group("/accounts")
	{
		accounts.GET("", GetAccounts)
		accounts.POST("", CreateAccount)
		accounts.GET("/:id", GetAccount)
		accounts.PUT("/:id", UpdateAccount)
		accounts.DELETE("/:id", DeleteAccount)
	}

	// 分类相关路由
	categories := api.Group("/categories")
	{
		categories.GET("", GetCategories)
		categories.POST("", CreateCategory)
		categories.GET("/:id", GetCategory)
		categories.PUT("/:id", UpdateCategory)
		categories.DELETE("/:id", DeleteCategory)
	}

	// 交易相关路由
	transactions := api.Group("/transactions")
	{
		transactions.GET("", GetTransactions)
		transactions.POST("", CreateTransaction)
		transactions.GET("/:id", GetTransaction)
		transactions.PUT("/:id", UpdateTransaction)
		transactions.DELETE("/:id", DeleteTransaction)
	}

	// 重复交易相关路由
	recurring := api.Group("/recurring")
	{
		recurring.GET("", GetRecurringTransactions)
		recurring.POST("", CreateRecurringTransaction)
		recurring.GET("/:id", GetRecurringTransaction)
		recurring.PUT("/:id", UpdateRecurringTransaction)
		recurring.DELETE("/:id", DeleteRecurringTransaction)
	}

	// 标签相关路由
	tags := api.Group("/tags")
	{
		tags.GET("", GetTags)
		tags.POST("", CreateTag)
		tags.GET("/:id", GetTag)
		tags.PUT("/:id", UpdateTag)
		tags.DELETE("/:id", DeleteTag)
	}

	// 预算相关路由
	budgets := api.Group("/budgets")
	{
		budgets.GET("", GetBudgets)
		budgets.POST("", CreateBudget)
		budgets.GET("/:id", GetBudget)
		budgets.PUT("/:id", UpdateBudget)
		budgets.DELETE("/:id", DeleteBudget)
		budgets.GET("/:id/progress", GetBudgetProgress)
		budgets.GET("/progress/all", GetAllBudgetsProgress)
	}

	// 附件相关路由
	attachments := api.Group("/attachments")
	{
		attachments.GET("", GetAttachments)
		attachments.POST("", CreateAttachment)
		attachments.POST("/upload", UploadAttachment)
		attachments.GET("/:id", GetAttachment)
		attachments.DELETE("/:id", DeleteAttachment)
	}

	// 数据导入/导出路由
	export := api.Group("/export")
	{
		export.GET("/csv/transactions", ExportTransactionsCSV)
		export.GET("/csv/accounts", ExportAccountsCSV)
		export.GET("/csv/categories", ExportCategoriesCSV)
	}

	importGroup := api.Group("/import")
	{
		importGroup.POST("/csv/transactions", ImportTransactionsCSV)
		importGroup.POST("/csv/accounts", ImportAccountsCSV)
		importGroup.POST("/csv/categories", ImportCategoriesCSV)
	}

	// 扩展重复交易路由以添加 generate 端点
	recurring.POST("/generate", GenerateRecurringTransactions)

	// AI相关路由
	ai := api.Group("/ai")
	{
		ai.POST("/chat", AIChat)
		ai.POST("/analyze-transaction", AnalyzeTransaction)
		ai.POST("/suggest-budget", SuggestBudget)
	}

	// 统计分析相关路由
	stats := api.Group("/statistics")
	{
		stats.GET("", GetStatistics)
	}
}
