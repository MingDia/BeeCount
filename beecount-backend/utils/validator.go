package utils

import (
	"net/http"
	"reflect"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

var validate *validator.Validate

// InitValidator 初始化验证器
func InitValidator() {
	validate = validator.New()

	// 注册自定义验证规则
	validate.RegisterTagNameFunc(func(fld reflect.StructField) string {
		name := strings.SplitN(fld.Tag.Get("json"), ",", 2)[0]
		if name == "-" {
			return ""
		}
		return name
	})
}

// ValidationError 验证错误结构
type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

// ValidationErrorResponse 验证错误响应
type ValidationErrorResponse struct {
	Success bool               `json:"success"`
	Error   string             `json:"error"`
	Details []ValidationError `json:"details,omitempty"`
}

// GetErrorMessage 错误信息映射
var errorMessages = map[string]string{
	"required":  "该字段是必填的",
	"email":     "请输入有效的邮箱地址",
	"min":       "值太小",
	"max":       "值太大",
	"minLength": "长度太短",
	"maxLength": "长度太长",
	"oneof":     "值不在允许的范围内",
	"url":       "请输入有效的URL",
}

// ValidateStruct 验证结构体
func ValidateStruct(obj interface{}) []ValidationError {
	var errors []ValidationError

	err := validate.Struct(obj)
	if err != nil {
		for _, err := range err.(validator.ValidationErrors) {
			field := err.Field()
			tag := err.Tag()

			message, exists := errorMessages[tag]
			if !exists {
				message = "字段验证失败: " + tag
			}

			errors = append(errors, ValidationError{
				Field:   field,
				Message: message,
			})
		}
	}

	return errors
}

// ValidateAndBind 验证并绑定请求数据
func ValidateAndBind(c *gin.Context, obj interface{}) []ValidationError {
	if err := c.ShouldBind(obj); err != nil {
		return []ValidationError{{
			Field:   "request",
			Message: "请求数据解析失败",
		}}
	}

	return ValidateStruct(obj)
}

// RespondWithValidationError 响应验证错误
func RespondWithValidationError(c *gin.Context, errors []ValidationError) {
	c.JSON(http.StatusBadRequest, ValidationErrorResponse{
		Success: false,
		Error:   "数据验证失败",
		Details: errors,
	})
}

// ValidateTransactionType 验证交易类型
func ValidateTransactionType(transactionType string) bool {
	validTypes := map[string]bool{
		"expense":  true,
		"income":   true,
		"transfer": true,
	}
	return validTypes[transactionType]
}

// ValidateAccountType 验证账户类型
func ValidateAccountType(accountType string) bool {
	validTypes := map[string]bool{
		"cash":       true,
		"bank":       true,
		"credit":     true,
		"investment": true,
		"other":      true,
	}
	return validTypes[accountType]
}

// ValidateLedgerRole 验证账本角色
func ValidateLedgerRole(role string) bool {
	validRoles := map[string]bool{
		"owner":  true,
		"editor": true,
		"viewer": true,
	}
	return validRoles[role]
}

// ValidateReminderType 验证提醒类型
func ValidateReminderType(reminderType string) bool {
	validTypes := map[string]bool{
		"budget":    true,
		"recurring": true,
		"bill":      true,
		"custom":    true,
	}
	return validTypes[reminderType]
}

// ValidateReminderFrequency 验证提醒频率
func ValidateReminderFrequency(frequency string) bool {
	validFrequencies := map[string]bool{
		"once":    true,
		"daily":   true,
		"weekly":  true,
		"monthly": true,
	}
	return validFrequencies[frequency]
}

// ValidateBudgetPeriod 验证预算周期
func ValidateBudgetPeriod(period string) bool {
	validPeriods := map[string]bool{
		"weekly":  true,
		"monthly": true,
		"yearly":  true,
	}
	return validPeriods[period]
}
