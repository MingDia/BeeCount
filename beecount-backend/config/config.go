package config

import (
	"os"
)

// Config 应用配置
type Config struct {
	ServerPort string
	DBPath     string
}

// LoadConfig 加载配置
func LoadConfig() (*Config, error) {
	return &Config{
		ServerPort: getEnv("SERVER_PORT", "8080"),
		DBPath:     getEnv("DB_PATH", "./beecount.db"),
	}, nil
}

// getEnv 获取环境变量，如果不存在则返回默认值
func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
