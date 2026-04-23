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
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          {selectedLedger ? selectedLedger.name : '欢迎使用BeeCount'}
        </Typography>
        {selectedLedger && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            快速添加
          </Button>
        )}
      </Box>

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
                      <IconButton edge="end" aria-label="edit" onClick={() => handleOpenDialog(transaction)}>
                        <Edit />
                      </IconButton>
                      <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(transaction.id)}>
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
                      <IconButton size="small" onClick={() => navigate('/accounts')}>
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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTransaction ? '编辑交易' : '快速添加交易'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
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
              value={formData.amount}
              onChange={handleChange}
            />

            {formData.type !== 'transfer' && (
              <FormControl fullWidth>
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

            <FormControl fullWidth>
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
              <FormControl fullWidth>
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
              value={formData.note}
              onChange={handleChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingTransaction ? '保存' : '添加'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Home;
