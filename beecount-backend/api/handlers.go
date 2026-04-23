package api

import (
	"beecount-backend/models"
	"beecount-backend/utils"
	"crypto/sha256"
	"encoding/csv"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// 通用响应结构
type Response struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

// --- 账本相关处理函数 ---

// GetLedgers 获取所有账本
func GetLedgers(c *gin.Context) {
	var ledgers []models.Ledger
	if err := utils.DB.Find(&ledgers).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, Response{Success: true, Data: ledgers})
}

// CreateLedger 创建新账本
func CreateLedger(c *gin.Context) {
	var ledger models.Ledger
	if err := c.ShouldBindJSON(&ledger); err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: err.Error()})
		return
	}
	if err := utils.DB.Create(&ledger).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusCreated, Response{Success: true, Data: ledger, Message: "账本创建成功"})
}

// GetLedger 获取单个账本
func GetLedger(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "无效的账本ID"})
		return
	}
	var ledger models.Ledger
	if err := utils.DB.First(&ledger, id).Error; err != nil {
		c.JSON(http.StatusNotFound, Response{Success: false, Error: "账本不存在"})
		return
	}
	c.JSON(http.StatusOK, Response{Success: true, Data: ledger})
}

// UpdateLedger 更新账本
func UpdateLedger(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "无效的账本ID"})
		return
	}
	var ledger models.Ledger
	if err := utils.DB.First(&ledger, id).Error; err != nil {
		c.JSON(http.StatusNotFound, Response{Success: false, Error: "账本不存在"})
		return
	}
	if err := c.ShouldBindJSON(&ledger); err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: err.Error()})
		return
	}
	ledger.ID = uint(id)
	if err := utils.DB.Save(&ledger).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, Response{Success: true, Data: ledger, Message: "账本更新成功"})
}

// DeleteLedger 删除账本
func DeleteLedger(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "无效的账本ID"})
		return
	}
	if err := utils.DB.Delete(&models.Ledger{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, Response{Success: true, Message: "账本删除成功"})
}

// GetAccountsByLedger 获取账本下的账户
func GetAccountsByLedger(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "无效的账本ID"})
		return
	}
	var accounts []models.Account
	if err := utils.DB.Where("ledger_id = ?", id).Find(&accounts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, Response{Success: true, Data: accounts})
}

// GetTransactionsByLedger 获取账本下的交易
func GetTransactionsByLedger(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "无效的账本ID"})
		return
	}
	var transactions []models.Transaction
	if err := utils.DB.Preload("Tags").Where("ledger_id = ?", id).Find(&transactions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, Response{Success: true, Data: transactions})
}

// GetBudgetsByLedger 获取账本下的预算
func GetBudgetsByLedger(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "无效的账本ID"})
		return
	}
	var budgets []models.Budget
	if err := utils.DB.Where("ledger_id = ?", id).Find(&budgets).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, Response{Success: true, Data: budgets})
}

// --- 账户相关处理函数 ---

// GetAccounts 获取所有账户
func GetAccounts(c *gin.Context) {
	var accounts []models.Account
	if err := utils.DB.Find(&accounts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, Response{Success: true, Data: accounts})
}

// CreateAccount 创建新账户
func CreateAccount(c *gin.Context) {
	var account models.Account
	if err := c.ShouldBindJSON(&account); err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: err.Error()})
		return
	}
	if err := utils.DB.Create(&account).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusCreated, Response{Success: true, Data: account, Message: "账户创建成功"})
}

// GetAccount 获取单个账户
func GetAccount(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "无效的账户ID"})
		return
	}
	var account models.Account
	if err := utils.DB.First(&account, id).Error; err != nil {
		c.JSON(http.StatusNotFound, Response{Success: false, Error: "账户不存在"})
		return
	}
	c.JSON(http.StatusOK, Response{Success: true, Data: account})
}

// UpdateAccount 更新账户
func UpdateAccount(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "无效的账户ID"})
		return
	}
	var account models.Account
	if err := utils.DB.First(&account, id).Error; err != nil {
		c.JSON(http.StatusNotFound, Response{Success: false, Error: "账户不存在"})
		return
	}
	if err := c.ShouldBindJSON(&account); err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: err.Error()})
		return
	}
	account.ID = uint(id)
	if err := utils.DB.Save(&account).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, Response{Success: true, Data: account, Message: "账户更新成功"})
}

// DeleteAccount 删除账户
func DeleteAccount(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "无效的账户ID"})
		return
	}
	if err := utils.DB.Delete(&models.Account{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, Response{Success: true, Message: "账户删除成功"})
}

// --- 分类相关处理函数 ---

// GetCategories 获取所有分类
func GetCategories(c *gin.Context) {
	var categories []models.Category
	if err := utils.DB.Find(&categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, Response{Success: true, Data: categories})
}

// CreateCategory 创建新分类
func CreateCategory(c *gin.Context) {
	var category models.Category
	if err := c.ShouldBindJSON(&category); err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: err.Error()})
		return
	}
	if err := utils.DB.Create(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusCreated, Response{Success: true, Data: category, Message: "分类创建成功"})
}

// GetCategory 获取单个分类
func GetCategory(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "无效的分类ID"})
		return
	}
	var category models.Category
	if err := utils.DB.First(&category, id).Error; err != nil {
		c.JSON(http.StatusNotFound, Response{Success: false, Error: "分类不存在"})
		return
	}
	c.JSON(http.StatusOK, Response{Success: true, Data: category})
}

// UpdateCategory 更新分类
func UpdateCategory(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "无效的分类ID"})
		return
	}
	var category models.Category
	if err := utils.DB.First(&category, id).Error; err != nil {
		c.JSON(http.StatusNotFound, Response{Success: false, Error: "分类不存在"})
		return
	}
	if err := c.ShouldBindJSON(&category); err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: err.Error()})
		return
	}
	category.ID = uint(id)
	if err := utils.DB.Save(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, Response{Success: true, Data: category, Message: "分类更新成功"})
}

// DeleteCategory 删除分类
func DeleteCategory(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "无效的分类ID"})
		return
	}
	if err := utils.DB.Delete(&models.Category{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, Response{Success: true, Message: "分类删除成功"})
}

// --- 交易相关处理函数 ---

// GetTransactions 获取所有交易
func GetTransactions(c *gin.Context) {
	var transactions []models.Transaction
	if err := utils.DB.Preload("Tags").Preload("Attachments").Find(&transactions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, Response{Success: true, Data: transactions})
}

// CreateTransaction 创建新交易
func CreateTransaction(c *gin.Context) {
	var transaction models.Transaction
	if err := c.ShouldBindJSON(&transaction); err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: err.Error()})
		return
	}
	// 先创建交易
	if err := utils.DB.Create(&transaction).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}
	// 重新加载交易以获取完整信息
	if err := utils.DB.Preload("Tags").First(&transaction, transaction.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusCreated, Response{Success: true, Data: transaction, Message: "交易创建成功"})
}

// GetTransaction 获取单个交易
func GetTransaction(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "无效的交易ID"})
		return
	}
	var transaction models.Transaction
	if err := utils.DB.Preload("Tags").Preload("Attachments").First(&transaction, id).Error; err != nil {
		c.JSON(http.StatusNotFound, Response{Success: false, Error: "交易不存在"})
		return
	}
	c.JSON(http.StatusOK, Response{Success: true, Data: transaction})
}

// UpdateTransaction 更新交易
func UpdateTransaction(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "无效的交易ID"})
		return
	}
	var transaction models.Transaction
	if err := utils.DB.First(&transaction, id).Error; err != nil {
		c.JSON(http.StatusNotFound, Response{Success: false, Error: "交易不存在"})
		return
	}
	if err := c.ShouldBindJSON(&transaction); err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: err.Error()})
		return
	}
	transaction.ID = uint(id)
	// 保存交易（包括标签关联）
	if err := utils.DB.Save(&transaction).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}
	// 重新加载交易以获取完整信息
	if err := utils.DB.Preload("Tags").First(&transaction, transaction.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, Response{Success: true, Data: transaction, Message: "交易更新成功"})
}

// DeleteTransaction 删除交易
func DeleteTransaction(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "无效的交易ID"})
		return
	}
	if err := utils.DB.Delete(&models.Transaction{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, Response{Success: true, Message: "交易删除成功"})
}

// --- 重复交易相关处理函数 ---

// GetRecurringTransactions 获取所有重复交易
func GetRecurringTransactions(c *gin.Context) {
	var recurring []models.RecurringTransaction
	if err := utils.DB.Find(&recurring).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, Response{Success: true, Data: recurring})
}

// CreateRecurringTransaction 创建新重复交易
func CreateRecurringTransaction(c *gin.Context) {
	var recurring models.RecurringTransaction
	if err := c.ShouldBindJSON(&recurring); err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: err.Error()})
		return
	}
	if err := utils.DB.Create(&recurring).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusCreated, Response{Success: true, Data: recurring, Message: "重复交易创建成功"})
}

// GetRecurringTransaction 获取单个重复交易
func GetRecurringTransaction(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "无效的重复交易ID"})
		return
	}
	var recurring models.RecurringTransaction
	if err := utils.DB.First(&recurring, id).Error; err != nil {
		c.JSON(http.StatusNotFound, Response{Success: false, Error: "重复交易不存在"})
		return
	}
	c.JSON(http.StatusOK, Response{Success: true, Data: recurring})
}

// UpdateRecurringTransaction 更新重复交易
func UpdateRecurringTransaction(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "无效的重复交易ID"})
		return
	}
	var recurring models.RecurringTransaction
	if err := utils.DB.First(&recurring, id).Error; err != nil {
		c.JSON(http.StatusNotFound, Response{Success: false, Error: "重复交易不存在"})
		return
	}
	if err := c.ShouldBindJSON(&recurring); err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: err.Error()})
		return
	}
	recurring.ID = uint(id)
	if err := utils.DB.Save(&recurring).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, Response{Success: true, Data: recurring, Message: "重复交易更新成功"})
}

// DeleteRecurringTransaction 删除重复交易
func DeleteRecurringTransaction(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "无效的重复交易ID"})
		return
	}
	if err := utils.DB.Delete(&models.RecurringTransaction{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, Response{Success: true, Message: "重复交易删除成功"})
}

// --- 标签相关处理函数 ---

// GetTags 获取所有标签
func GetTags(c *gin.Context) {
	var tags []models.Tag
	if err := utils.DB.Find(&tags).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, Response{Success: true, Data: tags})
}

// CreateTag 创建新标签
func CreateTag(c *gin.Context) {
	var tag models.Tag
	if err := c.ShouldBindJSON(&tag); err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: err.Error()})
		return
	}
	if err := utils.DB.Create(&tag).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusCreated, Response{Success: true, Data: tag, Message: "标签创建成功"})
}

// GetTag 获取单个标签
func GetTag(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "无效的标签ID"})
		return
	}
	var tag models.Tag
	if err := utils.DB.First(&tag, id).Error; err != nil {
		c.JSON(http.StatusNotFound, Response{Success: false, Error: "标签不存在"})
		return
	}
	c.JSON(http.StatusOK, Response{Success: true, Data: tag})
}

// UpdateTag 更新标签
func UpdateTag(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "无效的标签ID"})
		return
	}
	var tag models.Tag
	if err := utils.DB.First(&tag, id).Error; err != nil {
		c.JSON(http.StatusNotFound, Response{Success: false, Error: "标签不存在"})
		return
	}
	if err := c.ShouldBindJSON(&tag); err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: err.Error()})
		return
	}
	tag.ID = uint(id)
	if err := utils.DB.Save(&tag).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, Response{Success: true, Data: tag, Message: "标签更新成功"})
}

// DeleteTag 删除标签
func DeleteTag(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "无效的标签ID"})
		return
	}
	if err := utils.DB.Delete(&models.Tag{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, Response{Success: true, Message: "标签删除成功"})
}

// --- 预算相关处理函数 ---

// GetBudgets 获取所有预算
func GetBudgets(c *gin.Context) {
	var budgets []models.Budget
	if err := utils.DB.Find(&budgets).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, Response{Success: true, Data: budgets})
}

// CreateBudget 创建新预算
func CreateBudget(c *gin.Context) {
	var budget models.Budget
	if err := c.ShouldBindJSON(&budget); err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: err.Error()})
		return
	}
	if err := utils.DB.Create(&budget).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusCreated, Response{Success: true, Data: budget, Message: "预算创建成功"})
}

// GetBudget 获取单个预算
func GetBudget(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "无效的预算ID"})
		return
	}
	var budget models.Budget
	if err := utils.DB.First(&budget, id).Error; err != nil {
		c.JSON(http.StatusNotFound, Response{Success: false, Error: "预算不存在"})
		return
	}
	c.JSON(http.StatusOK, Response{Success: true, Data: budget})
}

// UpdateBudget 更新预算
func UpdateBudget(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "无效的预算ID"})
		return
	}
	var budget models.Budget
	if err := utils.DB.First(&budget, id).Error; err != nil {
		c.JSON(http.StatusNotFound, Response{Success: false, Error: "预算不存在"})
		return
	}
	if err := c.ShouldBindJSON(&budget); err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: err.Error()})
		return
	}
	budget.ID = uint(id)
	if err := utils.DB.Save(&budget).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, Response{Success: true, Data: budget, Message: "预算更新成功"})
}

// DeleteBudget 删除预算
func DeleteBudget(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "无效的预算ID"})
		return
	}
	if err := utils.DB.Delete(&models.Budget{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, Response{Success: true, Message: "预算删除成功"})
}

// GetBudgetProgress 获取预算使用进度
func GetBudgetProgress(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "无效的预算ID"})
		return
	}

	// 获取预算信息
	var budget models.Budget
	if err := utils.DB.First(&budget, id).Error; err != nil {
		c.JSON(http.StatusNotFound, Response{Success: false, Error: "预算不存在"})
		return
	}

	// 计算当前周期的开始和结束日期
	now := time.Now()
	var startDate, endDate time.Time

	switch budget.Period {
	case "monthly":
		// 月度预算：从 startDay 开始
		startDate = time.Date(now.Year(), now.Month(), budget.StartDay, 0, 0, 0, 0, now.Location())
		if now.Day() < budget.StartDay {
			// 如果当前日期小于开始日，则取上个月的开始日
			startDate = startDate.AddDate(0, -1, 0)
		}
		endDate = startDate.AddDate(0, 1, 0).Add(-time.Second)
	case "weekly":
		// 周度预算：从 startDay 开始（1=周一, 7=周日）
		offset := (int(now.Weekday()) - budget.StartDay + 7) % 7
		startDate = now.AddDate(0, 0, -offset)
		startDate = time.Date(startDate.Year(), startDate.Month(), startDate.Day(), 0, 0, 0, 0, startDate.Location())
		endDate = startDate.AddDate(0, 0, 7).Add(-time.Second)
	case "yearly":
		// 年度预算：从 startDay 开始
		startDate = time.Date(now.Year(), 1, budget.StartDay, 0, 0, 0, 0, now.Location())
		if now.Month() == 1 && now.Day() < budget.StartDay {
			// 如果当前是1月且日期小于开始日，则取上一年的开始日
			startDate = startDate.AddDate(-1, 0, 0)
		}
		endDate = startDate.AddDate(1, 0, 0).Add(-time.Second)
	default:
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "无效的预算周期"})
		return
	}

	// 构建查询条件
	query := utils.DB.Model(&models.Transaction{}).Where("ledger_id = ? AND type = ? AND happened_at BETWEEN ? AND ?", budget.LedgerID, "expense", startDate, endDate)

	// 如果是分类预算，添加分类过滤
	if budget.Type == "category" && budget.CategoryID > 0 {
		query = query.Where("category_id = ?", budget.CategoryID)
	}

	// 计算总支出
	var totalExpense float64
	query.Select("COALESCE(SUM(amount), 0) as total").Row().Scan(&totalExpense)

	// 计算进度百分比
	progress := 0.0
	if budget.Amount > 0 {
		progress = (totalExpense / budget.Amount) * 100
		if progress > 100 {
			progress = 100
		}
	}

	// 构建响应
	result := map[string]interface{}{
		"budget":        budget,
		"total_expense": totalExpense,
		"progress":      progress,
		"start_date":    startDate,
		"end_date":      endDate,
	}

	c.JSON(http.StatusOK, Response{Success: true, Data: result})
}

// GetAllBudgetsProgress 获取所有预算的使用进度
func GetAllBudgetsProgress(c *gin.Context) {
	// 获取所有预算
	var budgets []models.Budget
	if err := utils.DB.Find(&budgets).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}

	now := time.Now()
	results := make([]map[string]interface{}, 0, len(budgets))

	for _, budget := range budgets {
		// 计算当前周期的开始和结束日期
		var startDate, endDate time.Time

		switch budget.Period {
		case "monthly":
			startDate = time.Date(now.Year(), now.Month(), budget.StartDay, 0, 0, 0, 0, now.Location())
			if now.Day() < budget.StartDay {
				startDate = startDate.AddDate(0, -1, 0)
			}
			endDate = startDate.AddDate(0, 1, 0).Add(-time.Second)
		case "weekly":
			offset := (int(now.Weekday()) - budget.StartDay + 7) % 7
			startDate = now.AddDate(0, 0, -offset)
			startDate = time.Date(startDate.Year(), startDate.Month(), startDate.Day(), 0, 0, 0, 0, startDate.Location())
			endDate = startDate.AddDate(0, 0, 7).Add(-time.Second)
		case "yearly":
			startDate = time.Date(now.Year(), 1, budget.StartDay, 0, 0, 0, 0, now.Location())
			if now.Month() == 1 && now.Day() < budget.StartDay {
				startDate = startDate.AddDate(-1, 0, 0)
			}
			endDate = startDate.AddDate(1, 0, 0).Add(-time.Second)
		default:
			continue
		}

		// 构建查询条件
		query := utils.DB.Model(&models.Transaction{}).Where("ledger_id = ? AND type = ? AND happened_at BETWEEN ? AND ?", budget.LedgerID, "expense", startDate, endDate)

		// 如果是分类预算，添加分类过滤
		if budget.Type == "category" && budget.CategoryID > 0 {
			query = query.Where("category_id = ?", budget.CategoryID)
		}

		// 计算总支出
		var totalExpense float64
		query.Select("COALESCE(SUM(amount), 0) as total").Row().Scan(&totalExpense)

		// 计算进度百分比
		progress := 0.0
		if budget.Amount > 0 {
			progress = (totalExpense / budget.Amount) * 100
			if progress > 100 {
				progress = 100
			}
		}

		results = append(results, map[string]interface{}{
			"budget":        budget,
			"total_expense": totalExpense,
			"progress":      progress,
			"start_date":    startDate,
			"end_date":      endDate,
		})
	}

	c.JSON(http.StatusOK, Response{Success: true, Data: results})
}

// --- 附件相关处理函数 ---

// GetAttachments 获取所有附件
func GetAttachments(c *gin.Context) {
	var attachments []models.TransactionAttachment
	if err := utils.DB.Find(&attachments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, Response{Success: true, Data: attachments})
}

// UploadAttachment 上传附件
func UploadAttachment(c *gin.Context) {
	// 获取交易ID
	transactionID, err := strconv.ParseUint(c.PostForm("transaction_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "无效的交易ID"})
		return
	}

	// 检查交易是否存在
	var transaction models.Transaction
	if err := utils.DB.First(&transaction, transactionID).Error; err != nil {
		c.JSON(http.StatusNotFound, Response{Success: false, Error: "交易不存在"})
		return
	}

	// 获取上传的文件
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "文件上传失败"})
		return
	}
	defer file.Close()

	// 生成唯一文件名
	fileName := fmt.Sprintf("%d_%s", time.Now().Unix(), header.Filename)
	filePath := "uploads/" + fileName

	// 保存文件
	dst, err := os.Create(filePath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: "文件保存失败"})
		return
	}
	defer dst.Close()

	// 复制文件内容
	if _, err = io.Copy(dst, file); err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: "文件复制失败"})
		return
	}

	// 创建附件记录
	attachment := models.TransactionAttachment{
		TransactionID: uint(transactionID),
		FileName:      fileName,
		OriginalName:  header.Filename,
		FileSize:      int(header.Size),
		CreatedAt:     time.Now(),
	}

	if err := utils.DB.Create(&attachment).Error; err != nil {
		// 如果数据库操作失败，删除已上传的文件
		os.Remove(filePath)
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}

	c.JSON(http.StatusCreated, Response{Success: true, Data: attachment, Message: "附件上传成功"})
}

// CreateAttachment 创建新附件
func CreateAttachment(c *gin.Context) {
	var attachment models.TransactionAttachment
	if err := c.ShouldBindJSON(&attachment); err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: err.Error()})
		return
	}
	if err := utils.DB.Create(&attachment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusCreated, Response{Success: true, Data: attachment, Message: "附件创建成功"})
}

// GetAttachment 获取单个附件
func GetAttachment(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "无效的附件ID"})
		return
	}
	var attachment models.TransactionAttachment
	if err := utils.DB.First(&attachment, id).Error; err != nil {
		c.JSON(http.StatusNotFound, Response{Success: false, Error: "附件不存在"})
		return
	}
	c.JSON(http.StatusOK, Response{Success: true, Data: attachment})
}

// DeleteAttachment 删除附件
func DeleteAttachment(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "无效的附件ID"})
		return
	}
	if err := utils.DB.Delete(&models.TransactionAttachment{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, Response{Success: true, Message: "附件删除成功"})
}

// --- 数据导入/导出相关处理函数 --- 

// ExportTransactionsCSV 导出交易为CSV
func ExportTransactionsCSV(c *gin.Context) {
	var transactions []models.Transaction
	if err := utils.DB.Preload("Tags").Preload("Attachments").Find(&transactions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}

	// 设置响应头
	c.Header("Content-Type", "text/csv")
	c.Header("Content-Disposition", "attachment; filename=transactions.csv")

	// 写入CSV头
	c.Writer.WriteString("ID,Type,Amount,CategoryID,AccountID,ToAccountID,HappenedAt,Note,Tags\n")

	// 写入交易数据
	for _, t := range transactions {
		tags := ""
		for i, tag := range t.Tags {
			if i > 0 {
				tags += ","
			}
			tags += tag.Name
		}
		c.Writer.WriteString(fmt.Sprintf("%d,%s,%.2f,%d,%d,%d,%s,%s,%s\n",
			t.ID, t.Type, t.Amount, t.CategoryID, t.AccountID, t.ToAccountID, t.HappenedAt, t.Note, tags))
	}
}

// ExportAccountsCSV 导出账户为CSV
func ExportAccountsCSV(c *gin.Context) {
	var accounts []models.Account
	if err := utils.DB.Find(&accounts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}

	// 设置响应头
	c.Header("Content-Type", "text/csv")
	c.Header("Content-Disposition", "attachment; filename=accounts.csv")

	// 写入CSV头
	c.Writer.WriteString("ID,LedgerID,Name,Type,Currency,InitialBalance,Note\n")

	// 写入账户数据
	for _, a := range accounts {
		c.Writer.WriteString(fmt.Sprintf("%d,%d,%s,%s,%s,%.2f,%s\n",
			a.ID, a.LedgerID, a.Name, a.Type, a.Currency, a.InitialBalance, a.Note))
	}
}

// ExportCategoriesCSV 导出分类为CSV
func ExportCategoriesCSV(c *gin.Context) {
	var categories []models.Category
	if err := utils.DB.Find(&categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}

	// 设置响应头
	c.Header("Content-Type", "text/csv")
	c.Header("Content-Disposition", "attachment; filename=categories.csv")

	// 写入CSV头
	c.Writer.WriteString("ID,Name,Kind,Icon,ParentID,Level\n")

	// 写入分类数据
	for _, cat := range categories {
		c.Writer.WriteString(fmt.Sprintf("%d,%s,%s,%s,%d,%d\n",
			cat.ID, cat.Name, cat.Kind, cat.Icon, cat.ParentID, cat.Level))
	}
}

// ImportTransactionsCSV 导入交易CSV
func ImportTransactionsCSV(c *gin.Context) {
	// 处理CSV文件上传
	file, _, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "文件上传失败"})
		return
	}
	defer file.Close()

	// 解析CSV
	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "CSV解析失败"})
		return
	}

	// 跳过表头
	for i, record := range records {
		if i == 0 {
			continue
		}

		// 解析记录
		id, _ := strconv.ParseUint(record[0], 10, 32)
		amount, _ := strconv.ParseFloat(record[2], 64)
		categoryID, _ := strconv.ParseUint(record[3], 10, 32)
		accountID, _ := strconv.ParseUint(record[4], 10, 32)
		toAccountID, _ := strconv.ParseUint(record[5], 10, 32)
		happenedAt, _ := time.Parse(time.RFC3339, record[6])

		// 创建交易
		transaction := models.Transaction{
			ID:          uint(id),
			Type:        record[1],
			Amount:      amount,
			CategoryID:  uint(categoryID),
			AccountID:   uint(accountID),
			ToAccountID: uint(toAccountID),
			HappenedAt:  happenedAt,
			Note:        record[7],
		}

		// 处理标签
		tags := strings.Split(record[8], ",")
		for _, tagName := range tags {
			if tagName != "" {
				var tag models.Tag
				if err := utils.DB.Where("name = ?", tagName).First(&tag).Error; err != nil {
					// 创建新标签
					tag = models.Tag{
						Name: tagName,
					}
					utils.DB.Create(&tag)
				}
				transaction.Tags = append(transaction.Tags, tag)
			}
		}

		// 保存交易
		if err := utils.DB.Create(&transaction).Error; err != nil {
			c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, Response{Success: true, Message: "交易导入成功"})
}

// ImportAccountsCSV 导入账户CSV
func ImportAccountsCSV(c *gin.Context) {
	// 处理CSV文件上传
	file, _, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "文件上传失败"})
		return
	}
	defer file.Close()

	// 解析CSV
	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "CSV解析失败"})
		return
	}

	// 跳过表头
	for i, record := range records {
		if i == 0 {
			continue
		}

		// 解析记录
		id, _ := strconv.ParseUint(record[0], 10, 32)
		ledgerID, _ := strconv.ParseUint(record[1], 10, 32)
		initialBalance, _ := strconv.ParseFloat(record[5], 64)

		// 创建账户
		account := models.Account{
			ID:             uint(id),
			LedgerID:       uint(ledgerID),
			Name:           record[2],
			Type:           record[3],
			Currency:       record[4],
			InitialBalance: initialBalance,
			Note:           record[6],
		}

		// 保存账户
		if err := utils.DB.Create(&account).Error; err != nil {
			c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, Response{Success: true, Message: "账户导入成功"})
}

// ImportCategoriesCSV 导入分类CSV
func ImportCategoriesCSV(c *gin.Context) {
	// 处理CSV文件上传
	file, _, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "文件上传失败"})
		return
	}
	defer file.Close()

	// 解析CSV
	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "CSV解析失败"})
		return
	}

	// 跳过表头
	for i, record := range records {
		if i == 0 {
			continue
		}

		// 解析记录
		id, _ := strconv.ParseUint(record[0], 10, 32)
		parentID, _ := strconv.ParseUint(record[4], 10, 32)
		level, _ := strconv.Atoi(record[5])

		// 创建分类
		category := models.Category{
			ID:       uint(id),
			Name:     record[1],
			Kind:     record[2],
			Icon:     record[3],
			ParentID: uint(parentID),
			Level:    level,
		}

		// 保存分类
		if err := utils.DB.Create(&category).Error; err != nil {
			c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, Response{Success: true, Message: "分类导入成功"})
}

// GenerateRecurringTransactions 生成周期交易
func GenerateRecurringTransactions(c *gin.Context) {
	// 获取所有启用的周期交易
	var recurringTransactions []models.RecurringTransaction
	if err := utils.DB.Where("enabled = ?", true).Find(&recurringTransactions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}

	now := time.Now()
	generatedCount := 0

	// 遍历每个周期交易
	for _, rt := range recurringTransactions {
		// 计算下一个应该生成交易的日期
		nextDate := rt.LastGeneratedDate
		if nextDate.IsZero() {
			nextDate = rt.StartDate
		}

		// 根据频率计算下一个日期
		for nextDate.Before(now) || nextDate.Equal(now) {
			// 检查是否超过结束日期
			if !rt.EndDate.IsZero() && nextDate.After(rt.EndDate) {
				break
			}

			// 生成交易
			transaction := models.Transaction{
				LedgerID:      rt.LedgerID,
				Type:          rt.Type,
				Amount:        rt.Amount,
				CategoryID:    rt.CategoryID,
				AccountID:     rt.AccountID,
				ToAccountID:   rt.ToAccountID,
				HappenedAt:    nextDate,
				Note:          rt.Note,
				RecurringID:   rt.ID,
			}

			// 保存交易
			if err := utils.DB.Create(&transaction).Error; err != nil {
				c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
				return
			}

			generatedCount++

			// 计算下一个日期
			switch rt.Frequency {
			case "daily":
				nextDate = nextDate.AddDate(0, 0, rt.Interval)
			case "weekly":
				nextDate = nextDate.AddDate(0, 0, rt.Interval*7)
			case "monthly":
				nextDate = nextDate.AddDate(0, rt.Interval, 0)
			case "yearly":
				nextDate = nextDate.AddDate(rt.Interval, 0, 0)
			}
		}

		// 更新最后生成日期
		rt.LastGeneratedDate = now
		if err := utils.DB.Save(&rt).Error; err != nil {
			c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, Response{Success: true, Message: fmt.Sprintf("成功生成 %d 笔周期交易", generatedCount), Data: map[string]int{"generated_count": generatedCount}})
}

// --- AI相关处理函数 --- 

// AIChat AI对话
func AIChat(c *gin.Context) {
	type ChatRequest struct {
		Message string `json:"message"`
		Context []string `json:"context"`
	}

	var req ChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: err.Error()})
		return
	}

	// 这里应该调用OpenAI API
	// 为了演示，返回模拟数据
	response := map[string]interface{}{
		"response": "我是你的记账助手，有什么可以帮你的吗？",
		"suggestions": []string{"查看本月支出", "设置预算提醒", "分析消费习惯"},
	}

	c.JSON(http.StatusOK, Response{Success: true, Data: response})
}

// AnalyzeTransaction 分析交易
func AnalyzeTransaction(c *gin.Context) {
	type AnalyzeRequest struct {
		TransactionID uint `json:"transaction_id"`
	}

	var req AnalyzeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: err.Error()})
		return
	}

	// 获取交易信息
	var transaction models.Transaction
	if err := utils.DB.First(&transaction, req.TransactionID).Error; err != nil {
		c.JSON(http.StatusNotFound, Response{Success: false, Error: "交易不存在"})
		return
	}

	// 这里应该调用OpenAI API分析交易
	// 为了演示，返回模拟数据
	analysis := map[string]interface{}{
		"transaction": transaction,
		"analysis": "这笔交易属于日常消费，金额在合理范围内",
		"suggestions": []string{"可以考虑设置该分类的预算", "建议定期查看此类消费趋势"},
	}

	c.JSON(http.StatusOK, Response{Success: true, Data: analysis})
}

// SuggestBudget 预算建议
func SuggestBudget(c *gin.Context) {
	type BudgetRequest struct {
		LedgerID uint `json:"ledger_id"`
	}

	var req BudgetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: err.Error()})
		return
	}

	// 获取账本的交易数据
	var transactions []models.Transaction
	if err := utils.DB.Where("ledger_id = ?", req.LedgerID).Find(&transactions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}

	// 计算总支出
	totalExpense := 0.0
	for _, t := range transactions {
		if t.Type == "expense" {
			totalExpense += t.Amount
		}
	}

	// 这里应该调用OpenAI API生成预算建议
	// 为了演示，返回模拟数据
	suggestion := map[string]interface{}{
		"total_expense": totalExpense,
		"suggested_budget": totalExpense * 0.9, // 建议预算为总支出的90%
		"category_suggestions": []map[string]interface{}{
			{"category": "餐饮", "suggested_budget": totalExpense * 0.3},
			{"category": "交通", "suggested_budget": totalExpense * 0.15},
			{"category": "购物", "suggested_budget": totalExpense * 0.2},
			{"category": "娱乐", "suggested_budget": totalExpense * 0.1},
			{"category": "其他", "suggested_budget": totalExpense * 0.25},
		},
	}

	c.JSON(http.StatusOK, Response{Success: true, Data: suggestion})
}

// GetStatistics 获取统计数据
func GetStatistics(c *gin.Context) {
	// 获取参数
	ledgerIDStr := c.DefaultQuery("ledger_id", "1")
	scope := c.DefaultQuery("scope", "month") // month/year/all
	statType := c.DefaultQuery("type", "expense") // expense/income/balance

	ledgerID, err := strconv.ParseUint(ledgerIDStr, 10, 32)
	if err != nil {
		ledgerID = 1
	}

	now := time.Now()
	var startDate, endDate time.Time

	// 计算时间范围
	switch scope {
	case "month":
		startDate = time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
		endDate = now
	case "year":
		startDate = time.Date(now.Year(), 1, 1, 0, 0, 0, 0, now.Location())
		endDate = now
	case "all":
		startDate = time.Date(1970, 1, 1, 0, 0, 0, 0, now.Location())
		endDate = now
	}

	// 计算总收入和总支出
	var totalIncome, totalExpense float64
	var incomeCount, expenseCount int64

	// 计算收入
	utils.DB.Model(&models.Transaction{}).
		Where("ledger_id = ? AND type = ? AND happened_at BETWEEN ? AND ?", uint(ledgerID), "income", startDate, endDate).
		Select("COALESCE(SUM(amount), 0)").Row().Scan(&totalIncome)

	utils.DB.Model(&models.Transaction{}).
		Where("ledger_id = ? AND type = ? AND happened_at BETWEEN ? AND ?", uint(ledgerID), "income", startDate, endDate).
		Count(&incomeCount)

	// 计算支出
	utils.DB.Model(&models.Transaction{}).
		Where("ledger_id = ? AND type = ? AND happened_at BETWEEN ? AND ?", uint(ledgerID), "expense", startDate, endDate).
		Select("COALESCE(SUM(amount), 0)").Row().Scan(&totalExpense)

	utils.DB.Model(&models.Transaction{}).
		Where("ledger_id = ? AND type = ? AND happened_at BETWEEN ? AND ?", uint(ledgerID), "expense", startDate, endDate).
		Count(&expenseCount)

	// 获取分类统计
	var categoryTotals []map[string]interface{}
	var categories []models.Category
	if err := utils.DB.Where("kind = ? AND level = 1", statType).Find(&categories).Error; err == nil {
		for _, cat := range categories {
			var total float64
			utils.DB.Model(&models.Transaction{}).
				Where("ledger_id = ? AND type = ? AND category_id = ? AND happened_at BETWEEN ? AND ?",
					uint(ledgerID), statType, cat.ID, startDate, endDate).
				Select("COALESCE(SUM(amount), 0)").Row().Scan(&total)

			if total > 0 {
				percent := 0.0
				if statType == "expense" && totalExpense > 0 {
					percent = (total / totalExpense) * 100
				} else if statType == "income" && totalIncome > 0 {
					percent = (total / totalIncome) * 100
				}
				categoryTotals = append(categoryTotals, map[string]interface{}{
					"category": cat,
					"total":    total,
					"percent":  percent,
				})
			}
		}
	}

	// 计算趋势数据（简化版本）
	var trendData []map[string]interface{}

	// 简化趋势数据 - 按月或年分组
	if scope == "month" {
		daysInMonth := time.Date(now.Year(), now.Month()+1, 0, 0, 0, 0, 0, now.Location()).Day()
		for day := 1; day <= daysInMonth; day++ {
			date := time.Date(now.Year(), now.Month(), day, 0, 0, 0, 0, now.Location())
			if date.After(endDate) {
				break
			}
			dayStart := date
			dayEnd := date.Add(24*time.Hour - time.Second)

			var dayIncome, dayExpense float64
			utils.DB.Model(&models.Transaction{}).
				Where("ledger_id = ? AND type = ? AND happened_at BETWEEN ? AND ?", uint(ledgerID), "income", dayStart, dayEnd).
				Select("COALESCE(SUM(amount), 0)").Row().Scan(&dayIncome)
			utils.DB.Model(&models.Transaction{}).
				Where("ledger_id = ? AND type = ? AND happened_at BETWEEN ? AND ?", uint(ledgerID), "expense", dayStart, dayEnd).
				Select("COALESCE(SUM(amount), 0)").Row().Scan(&dayExpense)

			trendData = append(trendData, map[string]interface{}{
				"date":    date,
				"income":  dayIncome,
				"expense": dayExpense,
			})
		}
	} else {
		// 对于 year 或 all 范围，使用月度数据
		for month := 1; month <= 12; month++ {
			monthStart := time.Date(now.Year(), time.Month(month), 1, 0, 0, 0, 0, now.Location())
			monthEnd := monthStart.AddDate(0, 1, 0).Add(-time.Second)
			if monthEnd.After(endDate) {
				monthEnd = endDate
			}

			var monthIncome, monthExpense float64
			utils.DB.Model(&models.Transaction{}).
				Where("ledger_id = ? AND type = ? AND happened_at BETWEEN ? AND ?", uint(ledgerID), "income", monthStart, monthEnd).
				Select("COALESCE(SUM(amount), 0)").Row().Scan(&monthIncome)
			utils.DB.Model(&models.Transaction{}).
				Where("ledger_id = ? AND type = ? AND happened_at BETWEEN ? AND ?", uint(ledgerID), "expense", monthStart, monthEnd).
				Select("COALESCE(SUM(amount), 0)").Row().Scan(&monthExpense)

			trendData = append(trendData, map[string]interface{}{
				"month":   month,
				"income":  monthIncome,
				"expense": monthExpense,
			})
		}
	}

	// 构建响应
	result := map[string]interface{}{
		"summary": map[string]interface{}{
			"total_income":  totalIncome,
			"total_expense": totalExpense,
			"balance":       totalIncome - totalExpense,
			"income_count":  incomeCount,
			"expense_count": expenseCount,
		},
		"category_totals": categoryTotals,
		"trend_data":      trendData,
		"time_range": map[string]interface{}{
			"start": startDate,
			"end":   endDate,
			"scope": scope,
		},
	}

	c.JSON(http.StatusOK, Response{Success: true, Data: result})
}

// ==================== 用户认证相关API ====================

var jwtSecret = []byte("beecount-secret-key-change-in-production")

func hashPassword(password string) string {
	h := sha256.New()
	h.Write([]byte(password))
	return hex.EncodeToString(h.Sum(nil))
}

func generateToken(userID uint, username string) (string, error) {
	claims := jwt.MapClaims{
		"user_id":  userID,
		"username": username,
		"exp":      time.Now().Add(time.Hour * 720).Unix(),
		"iat":      time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, Response{Success: false, Error: "Authorization header required"})
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method")
			}
			return jwtSecret, nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, Response{Success: false, Error: "Invalid token"})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, Response{Success: false, Error: "Invalid token claims"})
			c.Abort()
			return
		}

		c.Set("user_id", uint(claims["user_id"].(float64)))
		c.Set("username", claims["username"])
		c.Next()
	}
}

// Register 用户注册
func Register(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=6"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: err.Error()})
		return
	}

	var existingUser models.User
	if err := utils.DB.Where("username = ? OR email = ?", req.Username, req.Email).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, Response{Success: false, Error: "Username or email already exists"})
		return
	}

	user := models.User{
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: hashPassword(req.Password),
		Nickname:     req.Username,
		Theme:        "light",
		Language:     "zh-CN",
	}

	if err := utils.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: "Failed to create user"})
		return
	}

	// 创建默认账本
	defaultLedger := models.Ledger{
		Name:     "我的账本",
		Currency: "CNY",
		Type:     "personal",
	}
	if err := utils.DB.Create(&defaultLedger).Error; err == nil {
		utils.DB.Create(&models.UserLedger{
			UserID:   user.ID,
			LedgerID: defaultLedger.ID,
			Role:     "owner",
		})
	}

	token, _ := generateToken(user.ID, user.Username)
	c.JSON(http.StatusCreated, Response{
		Success: true,
		Data: map[string]interface{}{
			"user":  user,
			"token": token,
		},
		Message: "Registration successful",
	})
}

// Login 用户登录
func Login(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: err.Error()})
		return
	}

	var user models.User
	if err := utils.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, Response{Success: false, Error: "Invalid credentials"})
		return
	}

	if user.PasswordHash != hashPassword(req.Password) {
		c.JSON(http.StatusUnauthorized, Response{Success: false, Error: "Invalid credentials"})
		return
	}

	token, _ := generateToken(user.ID, user.Username)
	c.JSON(http.StatusOK, Response{
		Success: true,
		Data: map[string]interface{}{
			"user":  user,
			"token": token,
		},
		Message: "Login successful",
	})
}

// GetCurrentUser 获取当前用户信息
func GetCurrentUser(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var user models.User
	if err := utils.DB.Preload("Ledgers").First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, Response{Success: false, Error: "User not found"})
		return
	}
	c.JSON(http.StatusOK, Response{Success: true, Data: user})
}

// UpdateCurrentUser 更新当前用户信息
func UpdateCurrentUser(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var user models.User
	if err := utils.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, Response{Success: false, Error: "User not found"})
		return
	}

	var updateData map[string]interface{}
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: err.Error()})
		return
	}

	delete(updateData, "password_hash")
	delete(updateData, "id")
	delete(updateData, "created_at")

	if err := utils.DB.Model(&user).Updates(updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: "Failed to update user"})
		return
	}

	c.JSON(http.StatusOK, Response{Success: true, Data: user, Message: "User updated successfully"})
}

// ==================== 提醒系统相关API ====================

// GetReminders 获取提醒列表
func GetReminders(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var reminders []models.Reminder
	if err := utils.DB.Where("user_id = ?", userID).Find(&reminders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, Response{Success: true, Data: reminders})
}

// CreateReminder 创建提醒
func CreateReminder(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var reminder models.Reminder
	if err := c.ShouldBindJSON(&reminder); err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: err.Error()})
		return
	}
	reminder.UserID = userID.(uint)
	if err := utils.DB.Create(&reminder).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusCreated, Response{Success: true, Data: reminder, Message: "Reminder created successfully"})
}

// UpdateReminder 更新提醒
func UpdateReminder(c *gin.Context) {
	userID, _ := c.Get("user_id")
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "Invalid reminder ID"})
		return
	}

	var reminder models.Reminder
	if err := utils.DB.Where("id = ? AND user_id = ?", id, userID).First(&reminder).Error; err != nil {
		c.JSON(http.StatusNotFound, Response{Success: false, Error: "Reminder not found"})
		return
	}

	if err := c.ShouldBindJSON(&reminder); err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: err.Error()})
		return
	}

	if err := utils.DB.Save(&reminder).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, Response{Success: true, Data: reminder, Message: "Reminder updated successfully"})
}

// DeleteReminder 删除提醒
func DeleteReminder(c *gin.Context) {
	userID, _ := c.Get("user_id")
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "Invalid reminder ID"})
		return
	}

	if err := utils.DB.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Reminder{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, Response{Success: true, Message: "Reminder deleted successfully"})
}

// GetPendingReminders 获取待处理的提醒
func GetPendingReminders(c *gin.Context) {
	userID, _ := c.Get("user_id")
	now := time.Now()
	var reminders []models.Reminder
	if err := utils.DB.Where("user_id = ? AND enabled = ? AND reminder_date <= ? AND (notified_at IS NULL OR notified_at < reminder_date)", userID, true, now).Find(&reminders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, Response{Success: true, Data: reminders})
}

// MarkReminderNotified 标记提醒已通知
func MarkReminderNotified(c *gin.Context) {
	userID, _ := c.Get("user_id")
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "Invalid reminder ID"})
		return
	}

	if err := utils.DB.Model(&models.Reminder{}).Where("id = ? AND user_id = ?", id, userID).Update("notified_at", time.Now()).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, Response{Success: true, Message: "Reminder marked as notified"})
}

// ==================== 智能记账相关API ====================

// SmartClassify 智能分类交易
func SmartClassify(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var req struct {
		Note      string `json:"note"`
		Type      string `json:"type" binding:"required"` // expense / income
		Amount    float64 `json:"amount"`
		AccountID uint `json:"account_id"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: err.Error()})
		return
	}

	var patterns []models.TransactionPattern
	if err := utils.DB.Where("user_id = ? AND type = ?", userID, req.Type).Order("usage_count DESC, confidence DESC").Find(&patterns).Error; err == nil {
		for _, pattern := range patterns {
			if strings.Contains(strings.ToLower(req.Note), strings.ToLower(pattern.NotePattern)) {
				var category models.Category
				utils.DB.First(&category, pattern.CategoryID)
				
				c.JSON(http.StatusOK, Response{
					Success: true,
					Data: map[string]interface{}{
						"category":   category,
						"confidence": pattern.Confidence,
						"pattern":    pattern,
					},
					Message: "Classification successful",
				})
				return
			}
		}
	}

	var categories []models.Category
	utils.DB.Where("kind = ? AND level = 1", req.Type).Find(&categories)
	if len(categories) > 0 {
		c.JSON(http.StatusOK, Response{
			Success: true,
			Data: map[string]interface{}{
				"category":   categories[0],
				"confidence": 0.5,
				"message":    "Using default category",
			},
		})
		return
	}

	c.JSON(http.StatusOK, Response{Success: false, Error: "Unable to classify"})
}

// LearnFromTransaction 从交易中学习
func LearnFromTransaction(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var req struct {
		TransactionID uint `json:"transaction_id" binding:"required"`
		CategoryID    uint `json:"category_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: err.Error()})
		return
	}

	var transaction models.Transaction
	if err := utils.DB.First(&transaction, req.TransactionID).Error; err != nil {
		c.JSON(http.StatusNotFound, Response{Success: false, Error: "Transaction not found"})
		return
	}

	note := transaction.Note
	if note == "" {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "Transaction has no note to learn from"})
		return
	}

	keywords := strings.Fields(note)
	for _, keyword := range keywords {
		if len(keyword) >= 2 {
			var existingPattern models.TransactionPattern
			err := utils.DB.Where("user_id = ? AND type = ? AND note_pattern = ?", userID, transaction.Type, keyword).First(&existingPattern).Error
			
			if err == nil {
				existingPattern.UsageCount++
				existingPattern.Confidence = 0.8 + float64(existingPattern.UsageCount)*0.02
				if existingPattern.Confidence > 1.0 {
					existingPattern.Confidence = 1.0
				}
				utils.DB.Save(&existingPattern)
			} else {
				newPattern := models.TransactionPattern{
					UserID:      userID.(uint),
					NotePattern: keyword,
					CategoryID:  req.CategoryID,
					Type:        transaction.Type,
					AccountID:   transaction.AccountID,
					Confidence:  0.8,
					UsageCount:  1,
				}
				utils.DB.Create(&newPattern)
			}
		}
	}

	c.JSON(http.StatusOK, Response{Success: true, Message: "Learned from transaction successfully"})
}

// GetTransactionPatterns 获取交易模式列表
func GetTransactionPatterns(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var patterns []models.TransactionPattern
	if err := utils.DB.Where("user_id = ?", userID).Order("usage_count DESC").Find(&patterns).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, Response{Success: true, Data: patterns})
}

// DeleteTransactionPattern 删除交易模式
func DeleteTransactionPattern(c *gin.Context) {
	userID, _ := c.Get("user_id")
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "Invalid pattern ID"})
		return
	}

	if err := utils.DB.Where("id = ? AND user_id = ?", id, userID).Delete(&models.TransactionPattern{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, Response{Success: true, Message: "Pattern deleted successfully"})
}

// ==================== 账本用户管理API ====================

// GetLedgerUsers 获取账本的所有用户
func GetLedgerUsers(c *gin.Context) {
	userID, _ := c.Get("user_id")
	id, err := strconv.ParseUint(c.Param("ledger_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "Invalid ledger ID"})
		return
	}

	// 检查权限
	if !utils.HasPermission(userID.(uint), uint(id), "viewer") {
		c.JSON(http.StatusForbidden, Response{Success: false, Error: "You don't have access to this ledger"})
		return
	}

	var userLedgers []models.UserLedger
	if err := utils.DB.Where("ledger_id = ?", id).Find(&userLedgers).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}

	// 获取用户详情
	var users []models.User
	userIDs := make([]uint, 0, len(userLedgers))
	for _, ul := range userLedgers {
		userIDs = append(userIDs, ul.UserID)
	}

	if len(userIDs) > 0 {
		utils.DB.Where("id IN ?", userIDs).Find(&users)
	}

	c.JSON(http.StatusOK, Response{Success: true, Data: map[string]interface{}{
		"user_ledgers": userLedgers,
		"users":        users,
	}})
}

// AddUserToLedger 添加用户到账本
func AddUserToLedger(c *gin.Context) {
	userID, _ := c.Get("user_id")
	ledgerID, err := strconv.ParseUint(c.Param("ledger_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "Invalid ledger ID"})
		return
	}

	// 检查是否有owner权限
	if !utils.HasPermission(userID.(uint), uint(ledgerID), "owner") {
		c.JSON(http.StatusForbidden, Response{Success: false, Error: "You don't have permission to manage users"})
		return
	}

	var req struct {
		UserID uint   `json:"user_id" binding:"required"`
		Role   string `json:"role" binding:"required,oneof=owner editor viewer"`
	}

	if errs := utils.ValidateAndBind(c, &req); errs != nil {
		utils.RespondWithValidationError(c, errs)
		return
	}

	// 验证角色
	if !utils.ValidateLedgerRole(req.Role) {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "Invalid role"})
		return
	}

	// 检查用户是否存在
	var user models.User
	if err := utils.DB.First(&user, req.UserID).Error; err != nil {
		c.JSON(http.StatusNotFound, Response{Success: false, Error: "User not found"})
		return
	}

	// 检查用户是否已经在账本中
	var existingUserLedger models.UserLedger
	if err := utils.DB.Where("user_id = ? AND ledger_id = ?", req.UserID, ledgerID).First(&existingUserLedger).Error; err == nil {
		c.JSON(http.StatusConflict, Response{Success: false, Error: "User already in ledger"})
		return
	}

	userLedger := models.UserLedger{
		UserID:   req.UserID,
		LedgerID: uint(ledgerID),
		Role:     req.Role,
	}

	if err := utils.DB.Create(&userLedger).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}

	c.JSON(http.StatusCreated, Response{Success: true, Data: userLedger, Message: "User added to ledger successfully"})
}

// UpdateUserRole 更新用户在账本中的角色
func UpdateUserRole(c *gin.Context) {
	userID, _ := c.Get("user_id")
	ledgerID, err := strconv.ParseUint(c.Param("ledger_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "Invalid ledger ID"})
		return
	}

	targetUserID, err := strconv.ParseUint(c.Param("user_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "Invalid user ID"})
		return
	}

	// 检查是否有owner权限
	if !utils.HasPermission(userID.(uint), uint(ledgerID), "owner") {
		c.JSON(http.StatusForbidden, Response{Success: false, Error: "You don't have permission to manage users"})
		return
	}

	// 不能修改自己的角色
	if userID == targetUserID {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "You can't change your own role"})
		return
	}

	var req struct {
		Role string `json:"role" binding:"required,oneof=owner editor viewer"`
	}

	if errs := utils.ValidateAndBind(c, &req); errs != nil {
		utils.RespondWithValidationError(c, errs)
		return
	}

	// 验证角色
	if !utils.ValidateLedgerRole(req.Role) {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "Invalid role"})
		return
	}

	var userLedger models.UserLedger
	if err := utils.DB.Where("user_id = ? AND ledger_id = ?", targetUserID, ledgerID).First(&userLedger).Error; err != nil {
		c.JSON(http.StatusNotFound, Response{Success: false, Error: "User not found in ledger"})
		return
	}

	userLedger.Role = req.Role
	if err := utils.DB.Save(&userLedger).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, Response{Success: true, Data: userLedger, Message: "User role updated successfully"})
}

// RemoveUserFromLedger 从账本中移除用户
func RemoveUserFromLedger(c *gin.Context) {
	userID, _ := c.Get("user_id")
	ledgerID, err := strconv.ParseUint(c.Param("ledger_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "Invalid ledger ID"})
		return
	}

	targetUserID, err := strconv.ParseUint(c.Param("user_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "Invalid user ID"})
		return
	}

	// 检查是否有owner权限
	if !utils.HasPermission(userID.(uint), uint(ledgerID), "owner") {
		c.JSON(http.StatusForbidden, Response{Success: false, Error: "You don't have permission to manage users"})
		return
	}

	// 不能移除自己
	if userID == targetUserID {
		c.JSON(http.StatusBadRequest, Response{Success: false, Error: "You can't remove yourself from ledger"})
		return
	}

	if err := utils.DB.Where("user_id = ? AND ledger_id = ?", targetUserID, ledgerID).Delete(&models.UserLedger{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, Response{Success: true, Message: "User removed from ledger successfully"})
}

// ==================== 通知和调度相关API ====================

// GetNotifications 获取用户的通知
func GetNotifications(c *gin.Context) {
	userID, _ := c.Get("user_id")

	notifications, err := utils.GetPendingNotifications(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, Response{Success: true, Data: notifications})
}

// TriggerRecurringGeneration 手动触发生成周期交易
func TriggerRecurringGeneration(c *gin.Context) {
	count, err := utils.ManualTriggerRecurringGeneration()
	if err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, Response{Success: true, Message: fmt.Sprintf("Generated %d transactions", count), Data: map[string]int{
		"generated_count": count,
	}})
}

// TriggerReminderCheck 手动触发提醒检查
func TriggerReminderCheck(c *gin.Context) {
	count, err := utils.ManualTriggerReminderCheck()
	if err != nil {
		c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, Response{Success: true, Message: fmt.Sprintf("Sent %d reminders", count), Data: map[string]int{
		"notified_count": count,
	}})
}
