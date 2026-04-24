import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { useApp } from '../contexts/AppContext';

function Accounts() {
  const { accounts, createAccount, updateAccount, deleteAccount } = useApp();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'cash',
    currency: 'CNY',
    initialBalance: 0,
    note: '',
  });

  const handleOpenDialog = (account = null) => {
    if (account) {
      setEditingAccount(account);
      setFormData(account);
    } else {
      setEditingAccount(null);
      setFormData({
        name: '',
        type: 'cash',
        currency: 'CNY',
        initialBalance: 0,
        note: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAccount(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingAccount) {
        await updateAccount(editingAccount.id, formData);
      } else {
        await createAccount(formData);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('操作失败:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这个账户吗？')) {
      try {
        await deleteAccount(id);
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

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 3, gap: 2 }}>
        <Typography 
          variant="h4"
          sx={{ 
            fontSize: { xs: '1.5rem', sm: '2rem' }
          }}
        >账户管理</Typography>
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
          添加账户
        </Button>
      </Box>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {accounts.map((account) => (
          <Grid item xs={12} sm={6} md={4} key={account.id}>
            <Card>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    fontSize: { xs: '1.125rem', sm: '1.25rem' },
                    wordBreak: 'break-word'
                  }}
                >
                  {account.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  类型: {account.type}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  货币: {account.currency}
                </Typography>
                <Typography 
                  variant="h5" 
                  color="primary" 
                  gutterBottom
                  sx={{ 
                    fontSize: { xs: '1.25rem', sm: '1.5rem' }
                  }}
                >
                  ¥{account.initialBalance.toFixed(2)}
                </Typography>
                {account.note && (
                  <Typography variant="body2" color="text.secondary">
                    备注: {account.note}
                  </Typography>
                )}
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end', px: { xs: 1, sm: 2 }, py: 1 }}>
                <IconButton 
                  onClick={() => handleOpenDialog(account)}
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
                  onClick={() => handleDelete(account.id)}
                  size="large"
                  sx={{ 
                    padding: 1.5,
                    minHeight: 44,
                    minWidth: 44
                  }}
                >
                  <Delete />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 添加/编辑账户对话框 */}
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
        <DialogTitle sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2.5 } }}>
          {editingAccount ? '编辑账户' : '添加账户'}
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1, sm: 2 } }}>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 2.5 } }}>
            <TextField
              name="name"
              label="账户名称"
              fullWidth
              size="large"
              value={formData.name}
              onChange={handleChange}
            />
            <FormControl fullWidth size="large">
              <InputLabel>账户类型</InputLabel>
              <Select
                name="type"
                value={formData.type}
                label="账户类型"
                onChange={handleChange}
              >
                <MenuItem value="cash">现金</MenuItem>
                <MenuItem value="bank">银行卡</MenuItem>
                <MenuItem value="credit">信用卡</MenuItem>
                <MenuItem value="wallet">电子钱包</MenuItem>
                <MenuItem value="other">其他</MenuItem>
              </Select>
            </FormControl>
            <TextField
              name="currency"
              label="货币"
              fullWidth
              size="large"
              value={formData.currency}
              onChange={handleChange}
            />
            <TextField
              name="initialBalance"
              label="初始余额"
              type="number"
              fullWidth
              size="large"
              value={formData.initialBalance}
              onChange={handleChange}
            />
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
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 }, gap: 1, flexDirection: { xs: 'column-reverse', sm: 'row' } }}>
          <Button onClick={handleCloseDialog} fullWidth sx={{ py: 1.5 }}>取消</Button>
          <Button onClick={handleSubmit} variant="contained" fullWidth sx={{ py: 1.5 }}>
            {editingAccount ? '保存' : '添加'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Accounts;
