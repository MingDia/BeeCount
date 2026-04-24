import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Add, Edit, Delete, Save, Close } from '@mui/icons-material';
import { recurringTransactionAPI } from '../services/api';

function RecurringTransactions() {
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentRecurring, setCurrentRecurring] = useState({
    id: 0,
    ledger_id: 1,
    type: 'expense',
    amount: 0,
    category_id: 0,
    account_id: 0,
    to_account_id: 0,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    frequency: 'monthly',
    interval: 1,
    note: '',
    enabled: true,
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchRecurringTransactions();
  }, []);

  const fetchRecurringTransactions = async () => {
    try {
      const response = await recurringTransactionAPI.getAll();
      setRecurringTransactions(response.data.data);
    } catch (error) {
      console.error('Error fetching recurring transactions:', error);
    }
  };

  const handleOpen = (recurring = null) => {
    if (recurring) {
      setCurrentRecurring({
        ...recurring,
        start_date: new Date(recurring.start_date).toISOString().split('T')[0],
        end_date: recurring.end_date ? new Date(recurring.end_date).toISOString().split('T')[0] : '',
      });
      setIsEditing(true);
    } else {
      setCurrentRecurring({
        id: 0,
        ledger_id: 1,
        type: 'expense',
        amount: 0,
        category_id: 0,
        account_id: 0,
        to_account_id: 0,
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        frequency: 'monthly',
        interval: 1,
        note: '',
        enabled: true,
      });
      setIsEditing(false);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentRecurring(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async () => {
    try {
      if (isEditing) {
        await recurringTransactionAPI.update(currentRecurring.id, currentRecurring);
      } else {
        await recurringTransactionAPI.create(currentRecurring);
      }
      fetchRecurringTransactions();
      handleClose();
    } catch (error) {
      console.error('Error saving recurring transaction:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这个周期交易吗？')) {
      try {
        await recurringTransactionAPI.delete(id);
        fetchRecurringTransactions();
      } catch (error) {
        console.error('Error deleting recurring transaction:', error);
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">周期交易</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
        >
          添加周期交易
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>类型</TableCell>
              <TableCell>金额</TableCell>
              <TableCell>频率</TableCell>
              <TableCell>开始日期</TableCell>
              <TableCell>结束日期</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recurringTransactions.map((recurring) => (
              <TableRow key={recurring.id}>
                <TableCell>{recurring.type === 'expense' ? '支出' : '收入'}</TableCell>
                <TableCell>¥{recurring.amount.toFixed(2)}</TableCell>
                <TableCell>
                  {recurring.frequency === 'daily' && '每天'}
                  {recurring.frequency === 'weekly' && '每周'}
                  {recurring.frequency === 'monthly' && '每月'}
                  {recurring.frequency === 'yearly' && '每年'}
                  {recurring.interval > 1 && ` ${recurring.interval}次`}
                </TableCell>
                <TableCell>{new Date(recurring.start_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  {recurring.end_date ? new Date(recurring.end_date).toLocaleDateString() : '无'}
                </TableCell>
                <TableCell>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={recurring.enabled}
                        onChange={(e) => {
                          const updated = { ...recurring, enabled: e.target.checked };
                          recurringTransactionAPI.update(recurring.id, updated)
                            .then(() => fetchRecurringTransactions())
                            .catch(console.error);
                        }}
                      />
                    }
                    label={recurring.enabled ? '启用' : '禁用'}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    startIcon={<Edit />}
                    onClick={() => handleOpen(recurring)}
                  >
                    编辑
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Delete />}
                    color="error"
                    onClick={() => handleDelete(recurring.id)}
                  >
                    删除
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? '编辑周期交易' : '添加周期交易'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {isEditing ? '修改周期交易的详细信息' : '创建一个新的周期交易'}
          </DialogContentText>
          <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: { md: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="类型"
              name="type"
              select
              fullWidth
              value={currentRecurring.type}
              onChange={handleChange}
            >
              <MenuItem value="expense">支出</MenuItem>
              <MenuItem value="income">收入</MenuItem>
            </TextField>
            <TextField
              label="金额"
              name="amount"
              type="number"
              fullWidth
              value={currentRecurring.amount}
              onChange={handleChange}
            />
            <TextField
              label="频率"
              name="frequency"
              select
              fullWidth
              value={currentRecurring.frequency}
              onChange={handleChange}
            >
              <MenuItem value="daily">每天</MenuItem>
              <MenuItem value="weekly">每周</MenuItem>
              <MenuItem value="monthly">每月</MenuItem>
              <MenuItem value="yearly">每年</MenuItem>
            </TextField>
            <TextField
              label="间隔"
              name="interval"
              type="number"
              fullWidth
              value={currentRecurring.interval}
              onChange={handleChange}
            />
            <TextField
              label="开始日期"
              name="start_date"
              type="date"
              fullWidth
              value={currentRecurring.start_date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="结束日期 (可选)"
              name="end_date"
              type="date"
              fullWidth
              value={currentRecurring.end_date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="备注"
              name="note"
              fullWidth
              multiline
              rows={2}
              value={currentRecurring.note}
              onChange={handleChange}
              sx={{ gridColumn: { md: 'span 2' } }}
            />
            <FormControlLabel
              control={
                <Switch
                  name="enabled"
                  checked={currentRecurring.enabled}
                  onChange={handleChange}
                />
              }
              label="启用"
              sx={{ gridColumn: { md: 'span 2' } }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} startIcon={<Close />}>
            取消
          </Button>
          <Button onClick={handleSave} variant="contained" startIcon={<Save />}>
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default RecurringTransactions;