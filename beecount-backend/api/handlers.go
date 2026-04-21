package api

import (
	"beecount-backend/models"
	"beecount-backend/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
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
	if err := utils.DB.Where("ledger_id = ?", id).Find(&transactions).Error; err != nil {
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
	if err := utils.DB.Find(&transactions).Error; err != nil {
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
	if err := utils.DB.Create(&transaction).Error; err != nil {
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
	if err := utils.DB.First(&transaction, id).Error; err != nil {
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
	if err := utils.DB.Save(&transaction).Error; err != nil {
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
