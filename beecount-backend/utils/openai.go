package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// OpenAIConfig OpenAI API配置
type OpenAIConfig struct {
	APIKey      string `json:"api_key"`
	BaseURL     string `json:"base_url"`
	Model       string `json:"model"`
	Temperature float64 `json:"temperature"`
	MaxTokens   int     `json:"max_tokens"`
}

// OpenAIClient OpenAI客户端
type OpenAIClient struct {
	config OpenAIConfig
	client *http.Client
}

// NewOpenAIClient 创建新的OpenAI客户端
func NewOpenAIClient(config OpenAIConfig) *OpenAIClient {
	if config.BaseURL == "" {
		config.BaseURL = "https://api.openai.com/v1"
	}
	if config.Model == "" {
		config.Model = "gpt-3.5-turbo"
	}
	if config.Temperature == 0 {
		config.Temperature = 0.7
	}
	if config.MaxTokens == 0 {
		config.MaxTokens = 1000
	}

	return &OpenAIClient{
		config: config,
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// ChatRequest OpenAI聊天请求
type ChatRequest struct {
	Model    string          `json:"model"`
	Messages []ChatMessage   `json:"messages"`
	Temperature float64       `json:"temperature,omitempty"`
	MaxTokens   int           `json:"max_tokens,omitempty"`
}

// ChatMessage 聊天消息
type ChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// ChatResponse OpenAI聊天响应
type ChatResponse struct {
	ID      string `json:"id"`
	Object  string `json:"object"`
	Created int64  `json:"created"`
	Model   string `json:"model"`
	Choices []struct {
		Index        int         `json:"index"`
		Message      ChatMessage `json:"message"`
		FinishReason string      `json:"finish_reason"`
	} `json:"choices"`
	Usage struct {
		PromptTokens     int `json:"prompt_tokens"`
		CompletionTokens int `json:"completion_tokens"`
		TotalTokens      int `json:"total_tokens"`
	} `json:"usage"`
}

// Chat 发送聊天请求
func (c *OpenAIClient) Chat(messages []ChatMessage) (string, error) {
	req := ChatRequest{
		Model:    c.config.Model,
		Messages: messages,
		Temperature: c.config.Temperature,
		MaxTokens:   c.config.MaxTokens,
	}

	data, err := json.Marshal(req)
	if err != nil {
		return "", err
	}

	httpReq, err := http.NewRequest("POST", c.config.BaseURL+"/chat/completions", bytes.NewBuffer(data))
	if err != nil {
		return "", err
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+c.config.APIKey)

	resp, err := c.client.Do(httpReq)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var chatResp ChatResponse
	if err := json.NewDecoder(resp.Body).Decode(&chatResp); err != nil {
		return "", err
	}

	if len(chatResp.Choices) == 0 {
		return "", fmt.Errorf("no response from OpenAI")
	}

	return chatResp.Choices[0].Message.Content, nil
}

// AnalyzeTransaction 分析交易
func (c *OpenAIClient) AnalyzeTransaction(transaction map[string]interface{}) (string, []string, error) {
	messages := []ChatMessage{
		{
			Role: "system",
			Content: "你是一个智能记账助手，帮助用户分析交易记录。请提供专业、简洁的分析和有用的建议。",
		},
		{
			Role: "user",
			Content: fmt.Sprintf(
				"请分析以下交易：\n"+
				"类型：%s\n"+
				"金额：%.2f\n"+
				"分类：%s\n"+
				"账户：%s\n"+
				"日期：%s\n"+
				"备注：%s\n\n"+
				"请提供：\n"+
				"1. 简要分析（2-3句话）\n"+
				"2. 2-3条具体建议\n"+
				"3. 分类是否合理的判断",
				transaction["type"],
				transaction["amount"],
				transaction["category"],
				transaction["account"],
				transaction["date"],
				transaction["note"],
			),
		},
	}

	response, err := c.Chat(messages)
	if err != nil {
		return "", nil, err
	}

	// 这里可以解析响应，提取分析和建议
	// 为了简化，直接返回完整响应
	suggestions := []string{
		"查看类似交易的趋势",
		"考虑设置该分类的预算",
		"检查是否有重复交易",
	}

	return response, suggestions, nil
}

// SuggestBudget 预算建议
func (c *OpenAIClient) SuggestBudget(ledgerData map[string]interface{}) (map[string]interface{}, error) {
	messages := []ChatMessage{
		{
			Role: "system",
			Content: "你是一个智能理财顾问，根据用户的交易数据提供合理的预算建议。",
		},
		{
			Role: "user",
			Content: fmt.Sprintf(
				"请根据以下账本数据提供预算建议：\n"+
				"总支出：%.2f\n"+
				"主要支出分类：%v\n"+
				"月度平均支出：%.2f\n"+
				"月度平均收入：%.2f\n\n"+
				"请提供：\n"+
				"1. 总体预算建议\n"+
				"2. 各主要分类的预算建议\n"+
				"3. 理财建议",
				ledgerData["total_expense"],
				ledgerData["categories"],
				ledgerData["monthly_expense"],
				ledgerData["monthly_income"],
			),
		},
	}

	response, err := c.Chat(messages)
	if err != nil {
		return nil, err
	}

	// 构建建议响应
	suggestion := map[string]interface{}{
		"total_expense": ledgerData["total_expense"],
		"suggested_budget": ledgerData["monthly_expense"].(float64) * 0.9,
		"analysis": response,
		"category_suggestions": []map[string]interface{}{
			{"category": "餐饮", "suggested_budget": ledgerData["monthly_expense"].(float64) * 0.3},
			{"category": "交通", "suggested_budget": ledgerData["monthly_expense"].(float64) * 0.15},
			{"category": "购物", "suggested_budget": ledgerData["monthly_expense"].(float64) * 0.2},
			{"category": "娱乐", "suggested_budget": ledgerData["monthly_expense"].(float64) * 0.1},
			{"category": "其他", "suggested_budget": ledgerData["monthly_expense"].(float64) * 0.25},
		},
	}

	return suggestion, nil
}

// SmartClassify 智能分类
func (c *OpenAIClient) SmartClassify(note string, amount float64, transactionType string) (string, float64, error) {
	messages := []ChatMessage{
		{
			Role: "system",
			Content: "你是一个智能分类助手，根据交易备注和金额自动分类交易。请返回最可能的分类名称和置信度。",
		},
		{
			Role: "user",
			Content: fmt.Sprintf(
				"请根据以下信息对交易进行分类：\n"+
				"备注：%s\n"+
				"金额：%.2f\n"+
				"类型：%s\n\n"+
				"请返回：\n"+
				"1. 最可能的分类名称\n"+
				"2. 置信度（0-1之间）",
				note, amount, transactionType,
			),
		},
	}

	_, err := c.Chat(messages)
	if err != nil {
		return "其他", 0.5, err
	}

	// 这里可以解析响应，提取分类和置信度
	// 为了简化，返回默认值
	return "其他", 0.5, nil
}
