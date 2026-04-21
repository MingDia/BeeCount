import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  TextField,
  Divider,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Message,
  AccountBalance,
  Receipt,
  BrainCircuit,
  Send,
  RefreshCw } from '@mui/icons-material';
import { useApp } from '../contexts/AppContext';

function AI() {
  const { transactions, ledgers, selectedLedger } = useApp();
  const [activeTab, setActiveTab] = useState('chat');
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [budgetSuggestion, setBudgetSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // AI对话功能
  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setError(null);

    // 添加用户消息到聊天历史
    setChatHistory(prev => [...prev, { role: 'user', content: message }]);
    setMessage('');

    try {
      const response = await fetch('http://localhost:8080/api/v1/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          context: chatHistory.map(msg => msg.content),
        }),
      });

      if (!response.ok) {
        throw new Error('对话失败');
      }

      const data = await response.json();
      if (data.success) {
        // 添加AI回复到聊天历史
        setChatHistory(prev => [...prev, { role: 'ai', content: data.data.response }]);
      } else {
        throw new Error(data.error || '对话失败');
      }
    } catch (err) {
      setError(err.message);
      setChatHistory(prev => [...prev, { role: 'ai', content: '抱歉，我暂时无法回答你的问题。' }]);
    } finally {
      setLoading(false);
    }
  };

  // 交易分析功能
  const handleAnalyzeTransaction = async () => {
    if (!selectedTransaction) return;

    setLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const response = await fetch('http://localhost:8080/api/v1/ai/analyze-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transaction_id: selectedTransaction.id,
        }),
      });

      if (!response.ok) {
        throw new Error('分析失败');
      }

      const data = await response.json();
      if (data.success) {
        setAnalysisResult(data.data);
      } else {
        throw new Error(data.error || '分析失败');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 预算建议功能
  const handleSuggestBudget = async () => {
    if (!selectedLedger) return;

    setLoading(true);
    setError(null);
    setBudgetSuggestion(null);

    try {
      const response = await fetch('http://localhost:8080/api/v1/ai/suggest-budget', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ledger_id: selectedLedger.id,
        }),
      });

      if (!response.ok) {
        throw new Error('预算建议失败');
      }

      const data = await response.json();
      if (data.success) {
        setBudgetSuggestion(data.data);
      } else {
        throw new Error(data.error || '预算建议失败');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">AI记账助手</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Button
          variant={activeTab === 'chat' ? 'contained' : 'outlined'}
          startIcon={<Message />}
          onClick={() => setActiveTab('chat')}
          sx={{ mr: 1 }}
        >
          AI对话
        </Button>
        <Button
          variant={activeTab === 'analyze' ? 'contained' : 'outlined'}
          startIcon={<Receipt />}
          onClick={() => setActiveTab('analyze')}
          sx={{ mr: 1 }}
        >
          交易分析
        </Button>
        <Button
          variant={activeTab === 'budget' ? 'contained' : 'outlined'}
          startIcon={<AccountBalance />}
          onClick={() => setActiveTab('budget')}
        >
          预算建议
        </Button>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* AI对话 */}
      {activeTab === 'chat' && (
        <Box sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
          <Paper
            elevation={2}
            sx={{
              flex: 1,
              p: 2,
              overflow: 'auto',
              mb: 2,
              backgroundColor: '#f5f5f5',
            }}
          >
            {chatHistory.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography variant="body1" color="text.secondary">
                  开始与AI助手对话吧！
                </Typography>
              </Box>
            ) : (
              <List>
                {chatHistory.map((msg, index) => (
                  <ListItem key={index} sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        maxWidth: '80%',
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: msg.role === 'user' ? '#e3f2fd' : '#f1f8e9',
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <Typography variant="body1">
                        {msg.content}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" sx={{ ml: 2 }}>
                  AI正在思考...
                </Typography>
              </Box>
            )}
          </Paper>
          <Box sx={{ display: 'flex' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="输入消息..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              sx={{ mr: 1 }}
            />
            <Button
              variant="contained"
              startIcon={<Send />}
              onClick={handleSendMessage}
              disabled={loading || !message.trim()}
            >
              发送
            </Button>
          </Box>
        </Box>
      )}

      {/* 交易分析 */}
      {activeTab === 'analyze' && (
        <Box>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                选择交易进行分析
              </Typography>
              <TextField
                select
                fullWidth
                label="选择交易"
                value={selectedTransaction?.id || ''}
                onChange={(e) => {
                  const transactionId = parseInt(e.target.value);
                  const transaction = transactions.find(t => t.id === transactionId);
                  setSelectedTransaction(transaction);
                }}
                SelectProps={{
                  displayEmpty: true,
                }}
              >
                <option value="">选择交易</option>
                {transactions.map((transaction) => (
                  <option key={transaction.id} value={transaction.id}>
                    {transaction.note || '无备注'} - ¥{transaction.amount.toFixed(2)}
                  </option>
                ))}
              </TextField>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                startIcon={<BrainCircuit />}
                onClick={handleAnalyzeTransaction}
                disabled={!selectedTransaction || loading}
              >
                分析交易
              </Button>
            </CardActions>
          </Card>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <CircularProgress />
            </Box>
          )}

          {analysisResult && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  交易分析结果
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {analysisResult.analysis}
                </Typography>
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                  建议：
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {analysisResult.suggestions.map((suggestion, index) => (
                    <Chip key={index} label={suggestion} color="primary" />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      {/* 预算建议 */}
      {activeTab === 'budget' && (
        <Box>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                预算建议
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                基于当前账本的交易数据，AI将为你生成合理的预算建议
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                当前账本：{selectedLedger?.name || '未选择'}
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                startIcon={<RefreshCw />}
                onClick={handleSuggestBudget}
                disabled={!selectedLedger || loading}
              >
                生成预算建议
              </Button>
            </CardActions>
          </Card>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <CircularProgress />
            </Box>
          )}

          {budgetSuggestion && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  预算建议结果
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      总支出
                    </Typography>
                    <Typography variant="h6" color="error.main">
                      ¥{budgetSuggestion.total_expense.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      建议总预算
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      ¥{budgetSuggestion.suggested_budget.toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  分类预算建议：
                </Typography>
                <Grid container spacing={2}>
                  {budgetSuggestion.category_suggestions.map((item, index) => (
                    <Grid item xs={6} sm={4} key={index}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="body2" color="text.secondary">
                            {item.category}
                          </Typography>
                          <Typography variant="h6">
                            ¥{item.suggested_budget.toFixed(2)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}
        </Box>
      )}
    </Box>
  );
}

export default AI;