import React, { useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, Divider, List, ListItem, ListItemText, Chip, IconButton } from '@mui/material';
import { Add, Delete, Edit, AttachMoney, AccountBalance } from '@mui/icons-material';
import { useApp } from '../contexts/AppContext';
import { format } from 'date-fns';

function Home() {
  const { selectedLedger, transactions, accounts, categories, isLoading, createTransaction } = useApp();

  // 计算总收入和支出
  const calculateSummary = () => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, balance: income - expense };
  };

  const summary = calculateSummary();

  // 获取最近10条交易
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.happenedAt) - new Date(a.happenedAt))
    .slice(0, 10);

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : '未分类';
  };

  const getAccountName = (accountId) => {
    const account = accounts.find(a => a.id === accountId);
    return account ? account.name : '未设置';
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">加载中...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {selectedLedger ? selectedLedger.name : '欢迎使用BeeCount'}
      </Typography>

      {/* 概览卡片 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoney sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="subtitle2" color="text.secondary">
                  总收入
                </Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                ¥{summary.income.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountBalance sx={{ mr: 1, color: 'error.main' }} />
                <Typography variant="subtitle2" color="text.secondary">
                  总支出
                </Typography>
              </Box>
              <Typography variant="h4" color="error.main">
                ¥{summary.expense.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  余额
                </Typography>
              </Box>
              <Typography variant="h4" color={summary.balance >= 0 ? 'success.main' : 'error.main'}>
                ¥{summary.balance.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 3 }} />

      {/* 最近交易 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          最近交易
        </Typography>
        <Card>
          <List>
            {recentTransactions.length === 0 ? (
              <ListItem>
              <ListItemText primary="暂无交易记录" />
            </ListItem>
            ) : (
              recentTransactions.map((transaction) => (
                <ListItem
                  key={transaction.id}
                  secondaryAction={
                    <Box>
                      <IconButton edge="end" aria-label="edit">
                        <Edit />
                      </IconButton>
                      <IconButton edge="end" aria-label="delete">
                        <Delete />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={transaction.type === 'income' ? '收入' : transaction.type === 'expense' ? '支出' : '转账'}
                          color={transaction.type === 'income' ? 'success' : transaction.type === 'expense' ? 'error' : 'primary'}
                          size="small"
                        />
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          {getCategoryName(transaction.categoryId)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {getAccountName(transaction.accountId)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(transaction.happenedAt), 'yyyy-MM-dd HH:mm')}
                        </Typography>
                      </Box>
                    }
                  />
                  <Box sx={{ ml: 2, textAlign: 'right' }}>
                    <Typography
                      variant="h6"
                      color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                    >
                      {transaction.type === 'income' ? '+' : '-'}{' '}¥{transaction.amount.toFixed(2)}
                    </Typography>
                  </Box>
                </ListItem>
              ))
            )}
          </List>
        </Card>
      </Box>

      {/* 账户列表 */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">账户</Typography>
        </Box>
        <Grid container spacing={2}>
          {accounts.map((account) => (
            <Grid item xs={12} sm={6} md={4} key={account.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">{account.name}</Typography>
                    <Box>
                      <IconButton size="small">
                        <Edit />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    类型: {account.type}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    初始余额: ¥{account.initialBalance.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}

export default Home;
