package utils

import (
	"beecount-backend/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// PermissionCheck 检查用户对账本的权限
func PermissionCheck(minRole string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "User not authenticated"})
			c.Abort()
			return
		}

		// 获取账本ID
		ledgerIDStr := c.Param("ledger_id")
		if ledgerIDStr == "" {
			// 尝试从查询参数获取
			ledgerIDStr = c.Query("ledger_id")
		}

		if ledgerIDStr == "" {
			// 尝试从请求体获取（对于POST/PUT请求）
			var req struct {
				LedgerID uint `json:"ledger_id" form:"ledger_id"`
			}
			c.ShouldBind(&req)
			if req.LedgerID > 0 {
				ledgerIDStr = strconv.FormatUint(uint64(req.LedgerID), 10)
			}
		}

		if ledgerIDStr == "" {
			// 没有账本ID，跳过权限检查（可能是其他类型的请求）
			c.Next()
			return
		}

		ledgerID, err := strconv.ParseUint(ledgerIDStr, 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid ledger ID"})
			c.Abort()
			return
		}

		// 检查用户权限
		var userLedger models.UserLedger
		if err := DB.Where("user_id = ? AND ledger_id = ?", userID, ledgerID).First(&userLedger).Error; err != nil {
			c.JSON(http.StatusForbidden, gin.H{"success": false, "error": "You don't have access to this ledger"})
			c.Abort()
			return
		}

		// 检查权限级别
		roleLevels := map[string]int{
			"viewer": 1,
			"editor": 2,
			"owner":  3,
		}

		requiredLevel := roleLevels[minRole]
		userLevel := roleLevels[userLedger.Role]

		if userLevel < requiredLevel {
			c.JSON(http.StatusForbidden, gin.H{"success": false, "error": "Insufficient permissions"})
			c.Abort()
			return
		}

		// 将用户账本信息存储到上下文中
		c.Set("user_ledger", userLedger)
		c.Set("ledger_id", uint(ledgerID))
		c.Next()
	}
}

// HasPermission 检查用户是否对账本有指定权限
func HasPermission(userID uint, ledgerID uint, minRole string) bool {
	var userLedger models.UserLedger
	if err := DB.Where("user_id = ? AND ledger_id = ?", userID, ledgerID).First(&userLedger).Error; err != nil {
		return false
	}

	roleLevels := map[string]int{
		"viewer": 1,
		"editor": 2,
		"owner":  3,
	}

	return roleLevels[userLedger.Role] >= roleLevels[minRole]
}

// GetUserLedgerRole 获取用户在账本中的角色
func GetUserLedgerRole(userID uint, ledgerID uint) string {
	var userLedger models.UserLedger
	if err := DB.Where("user_id = ? AND ledger_id = ?", userID, ledgerID).First(&userLedger).Error; err != nil {
		return ""
	}
	return userLedger.Role
}
