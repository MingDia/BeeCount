import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
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
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { Add, Delete, Edit, Search } from '@mui/icons-material';
import { format } from 'date-fns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useApp } from '../contexts/AppContext';

function Transactions() {
  const { 
    transactions, 
    accounts, 
    categories, 
    createTransaction, 
    updateTransaction, 
    deleteTransaction 
  } = useApp();
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
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  // 过滤交易
  useEffect(() => {
    if (searchTerm) {
      const filtered = transactions.filter(transaction => {
        const category = categories.find(c => c.id === transaction.categoryId);
        const account = accounts.find(a => a.id === transaction.accountId);
        return (
          (category && category.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (account && account.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (transaction.note && transaction.note.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
      setFilteredTransactions(filtered);
    } else {
      setFilteredTransactions(transactions);
    }
  }, [transactions, searchTerm, categories, accounts]);

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
        accountId: null,
        toAccountId: null,
        happenedAt: new Date(),
        note: '',
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

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : '未分类';
  };

  const getAccountName = (accountId) => {
    const account = accounts.find(a => a.id === accountId);
    return account ? account.name : '未设置';
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">交易管理</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            添加交易
          </Button>
        </Box>

        {/* 搜索栏 */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            placeholder="搜索交易..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1 }} />,
            }}
          />
        </Box>

        {/* 交易列表 */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>类型</TableCell>
                <TableCell>金额</TableCell>
                <TableCell>分类</TableCell>
                <TableCell>账户</TableCell>
                <TableCell>日期</TableCell>
                <TableCell>备注</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center' }}>
                    暂无交易记录
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <Chip
                        label={transaction.type === 'income' ? '收入' : transaction.type === 'expense' ? '支出' : '转账'}
                        color={transaction.type === 'income' ? 'success' : transaction.type === 'expense' ? 'error' : 'primary'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography 
                        color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                      >
                        {transaction.type === 'income' ? '+' : '-'}{' '}¥{transaction.amount.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>{getCategoryName(transaction.categoryId)}</TableCell>
                    <TableCell>
                      {transaction.type === 'transfer' ? (
                        `${getAccountName(transaction.accountId)} → ${getAccountName(transaction.toAccountId)}`
                      ) : (
                        getAccountName(transaction.accountId)
                      )}
                    </TableCell>
                    <TableCell>{format(new Date(transaction.happenedAt), 'yyyy-MM-dd HH:mm')}</TableCell>
                    <TableCell>{transaction.note || '-'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton onClick={() => handleOpenDialog(transaction)}>
                          <Edit />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(transaction.id)}>
                          <Delete />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 添加/编辑交易对话框 */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingTransaction ? '编辑交易' : '添加交易'}
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

              <DatePicker
                label="日期"
                value={formData.happenedAt ? new Date(formData.happenedAt) : null}
                onChange={(date) => setFormData(prev => ({ ...prev, happenedAt: date }))}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />

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
    </LocalizationProvider>
  );
}

export default Transactions;
