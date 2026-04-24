import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, Divider, List, ListItem, ListItemText, Chip, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Add, Delete, Edit, AttachMoney, AccountBalance } from '@mui/icons-material';
import { useApp } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

function Home() {
  const { selectedLedger, transactions, accounts, categories, isLoading, createTransaction, updateTransaction, deleteTransaction } = useApp();
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: 0,
    categoryId: null,
    accountId: null,
    toAccountId: null,
    happenedAt: new Date(),
    note: '',
    tags: [],
    attachments: [],
  });

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

  const handleOpenDialog = (transaction = null) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setFormData(transaction);
    } else {
      setEditingTransaction(null);
      setFormData({
        type: 'expense',
        amount: 0,
        categoryId: null,
        accountId: accounts.length > 0 ? accounts[0].id : null,
        toAccountId: null,
        happenedAt: new Date(),
        note: '',
        tags: [],
        attachments: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTransaction(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, formData);
      } else {
        await createTransaction(formData);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('操作失败:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这个交易吗？')) {
      try {
        await deleteTransaction(id);
      } catch (error) {
        console.error('删除失败:', error);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">加载中...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3 }, 
      maxWidth: '100vw', 
      overflowX: 'hidden' 
    }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        mb: 3,
        gap: 2
      }}>
        <Typography 
          variant="h4"
          sx={{ 
            fontSize: { xs: '1.5rem', sm: '2rem' }
          }}
        >
          {selectedLedger ? selectedLedger.name : '欢迎使用BeeCount'}
        </Typography>
        {selectedLedger && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            fullWidth
            sx={{ 
              py: 1.5,
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            快速添加
          </Button>
        )}
      </Box>

      {/* 概览卡片 */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoney sx={{ mr: 1, color: 'success.main', fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                <Typography variant="subtitle2" color="text.secondary">
                  总收入
                </Typography>
              </Box>
              <Typography 
                variant="h4"
                sx={{ 
                  fontSize: { xs: '1.5rem', sm: '2rem' }
                }}
                color="success.main"
              >
                ¥{summary.income.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountBalance sx={{ mr: 1, color: 'error.main', fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                <Typography variant="subtitle2" color="text.secondary">
                  总支出
                </Typography>
              </Box>
              <Typography 
                variant="h4"
                sx={{ 
                  fontSize: { xs: '1.5rem', sm: '2rem' }
                }}
                color="error.main"
              >
                ¥{summary.expense.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  余额
                </Typography>
              </Box>
              <Typography 
                variant="h4"
                sx={{ 
                  fontSize: { xs: '1.5rem', sm: '2rem' }
                }}
                color={summary.balance >= 0 ? 'success.main' : 'error.main'}
              >
                ¥{summary.balance.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 3 }} />

      {/* 最近交易 */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h5" 
          gutterBottom
          sx={{ 
            fontSize: { xs: '1.25rem', sm: '1.5rem' }
          }}
        >
          最近交易
        </Typography>
        <Card>
          <List sx={{ p: { xs: 0.5, sm: 0 } }}>
            {recentTransactions.length === 0 ? (
              <ListItem sx={{ py: 3 }}>
              <ListItemText 
                primary="暂无交易记录" 
                sx={{ textAlign: 'center' }}
              />
            </ListItem>
            ) : (
              recentTransactions.map((transaction) => (
                <ListItem
                  key={transaction.id}
                  sx={{ 
                    py: { xs: 1.5, sm: 1 },
                    px: { xs: 1, sm: 2 },
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    textAlign: { xs: 'left', sm: 'inherit' },
                    gap: { xs: 1, sm: 0 }
                  }}
                  secondaryAction={
                    <Box sx={{ 
                      mt: { xs: 1, sm: 0 },
                      display: 'flex', 
                      gap: 0.5 
                    }}>
                      <IconButton 
                        edge="end" 
                        aria-label="edit" 
                        onClick={() => handleOpenDialog(transaction)}
                        size="large"
                        sx={{ 
                          padding: 1.5,
                          minHeight: 44,
                          minWidth: 44
                        }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        edge="end" 
                        aria-label="delete" 
                        onClick={() => handleDelete(transaction.id)}
                        size="large"
                        sx={{ 
                          padding: 1.5,
                          minHeight: 44,
                          minWidth: 44
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
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
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          {getAccountName(transaction.accountId)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(transaction.happenedAt), 'yyyy-MM-dd HH:mm')}
                        </Typography>
                      </Box>
                    }
                  />
                  <Box sx={{ 
                    ml: { xs: 0, sm: 2 }, 
                    textAlign: { xs: 'right', sm: 'right' },
                    alignSelf: { xs: 'flex-end', sm: 'center' }
                  }}>
                    <Typography
                      variant="h6"
                      sx={{ 
                        fontSize: { xs: '1.25rem', sm: '1.5rem' }
                      }}
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
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2 
        }}>
          <Typography 
            variant="h5"
            sx={{ 
              fontSize: { xs: '1.25rem', sm: '1.5rem' }
            }}
          >账户</Typography>
        </Box>
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {accounts.map((account) => (
            <Grid item xs={12} sm={6} md={4} key={account.id}>
              <Card>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontSize: { xs: '1.125rem', sm: '1.25rem' },
                          wordBreak: 'break-word'
                        }}
                      >{account.name}</Typography>
                    </Box>
                    <Box sx={{ ml: 1, flexShrink: 0 }}>
                      <IconButton 
                        size="large" 
                        onClick={() => navigate('/accounts')}
                        sx={{ 
                          padding: 1.5,
                          minHeight: 44,
                          minWidth: 44
                        }}
                      >
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

      {/* 添加/编辑交易对话框 */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        sx={{ 
          '& .MuiDialog-paper': {
            margin: { xs: 1, sm: 2 },
            width: { xs: 'calc(100% - 16px)', sm: 'auto' }
          }
        }}
      >
        <DialogTitle sx={{ 
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 2.5 }
        }}>
          {editingTransaction ? '编辑交易' : '快速添加交易'}
        </DialogTitle>
        <DialogContent sx={{ 
          px: { xs: 2, sm: 3 },
          py: { xs: 1, sm: 2 }
        }}>
          <Box sx={{ 
            pt: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            gap: { xs: 2, sm: 2.5 } 
          }}>
            <FormControl fullWidth size="large">
              <InputLabel>交易类型</InputLabel>
              <Select
                name="type"
                value={formData.type}
                label="交易类型"
                onChange={handleChange}
              >
                <MenuItem value="expense">支出</MenuItem>
                <MenuItem value="income">收入</MenuItem>
                <MenuItem value="transfer">转账</MenuItem>
              </Select>
            </FormControl>

            <TextField
              name="amount"
              label="金额"
              type="number"
              fullWidth
              size="large"
              value={formData.amount}
              onChange={handleChange}
            />

            {formData.type !== 'transfer' && (
              <FormControl fullWidth size="large">
                <InputLabel>分类</InputLabel>
                <Select
                  name="categoryId"
                  value={formData.categoryId || ''}
                  label="分类"
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: parseInt(e.target.value) }))}
                  displayEmpty
                >
                  <MenuItem value="">选择分类</MenuItem>
                  {categories
                    .filter(c => c.kind === (formData.type === 'income' ? 'income' : 'expense'))
                    .map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            )}

            <FormControl fullWidth size="large">
              <InputLabel>账户</InputLabel>
              <Select
                name="accountId"
                value={formData.accountId || ''}
                label="账户"
                onChange={(e) => setFormData(prev => ({ ...prev, accountId: parseInt(e.target.value) }))}
                displayEmpty
              >
                <MenuItem value="">选择账户</MenuItem>
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {formData.type === 'transfer' && (
              <FormControl fullWidth size="large">
                <InputLabel>目标账户</InputLabel>
                <Select
                  name="toAccountId"
                  value={formData.toAccountId || ''}
                  label="目标账户"
                  onChange={(e) => setFormData(prev => ({ ...prev, toAccountId: parseInt(e.target.value) }))}
                  displayEmpty
                >
                  <MenuItem value="">选择目标账户</MenuItem>
                  {accounts.map((account) => (
                    <MenuItem key={account.id} value={account.id} disabled={account.id === formData.accountId}>
                      {account.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <TextField
              name="note"
              label="备注"
              multiline
              rows={2}
              fullWidth
              size="large"
              value={formData.note}
              onChange={handleChange}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          px: { xs: 2, sm: 3 },
          py: { xs: 1.5, sm: 2 },
          gap: 1,
          flexDirection: { xs: 'column-reverse', sm: 'row' }
        }}>
          <Button 
            onClick={handleCloseDialog}
            fullWidth
            sx={{ py: 1.5 }}
          >取消</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            fullWidth
            sx={{ py: 1.5 }}
          >
            {editingTransaction ? '保存' : '添加'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Home;
