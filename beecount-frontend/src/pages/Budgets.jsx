import React, { useState, useEffect } from 'react';
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
  Chip,
  LinearProgress,
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { useApp } from '../contexts/AppContext';

function Budgets() {
  const { budgets, categories, createBudget, updateBudget, deleteBudget } = useApp();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({
    type: 'total',
    categoryId: null,
    amount: 0,
    period: 'monthly',
    startDay: 1,
    enabled: true,
  });
  const [budgetsProgress, setBudgetsProgress] = useState({});
  const [loading, setLoading] = useState(false);

  const handleOpenDialog = (budget = null) => {
    if (budget) {
      setEditingBudget(budget);
      setFormData(budget);
    } else {
      setEditingBudget(null);
      setFormData({
        type: 'total',
        categoryId: null,
        amount: 0,
        period: 'monthly',
        startDay: 1,
        enabled: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBudget(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingBudget) {
        await updateBudget(editingBudget.id, formData);
      } else {
        await createBudget(formData);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('操作失败:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这个预算吗？')) {
      try {
        await deleteBudget(id);
      } catch (error) {
        console.error('删除失败:', error);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value,
    }));
  };

  // 获取预算进度数据
  const fetchBudgetsProgress = async () => {
    if (budgets.length === 0) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/v1/budgets/progress/all');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const progressMap = {};
          data.data.forEach(item => {
            progressMap[item.budget.id] = item;
          });
          setBudgetsProgress(progressMap);
        }
      }
    } catch (error) {
      console.error('获取预算进度失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 当预算变化时重新获取进度
  useEffect(() => {
    fetchBudgetsProgress();
  }, [budgets]);

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : '总预算';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">预算管理</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          添加预算
        </Button>
      </Box>

      <Grid container spacing={3}>
        {budgets.map((budget) => {
          const budgetProgress = budgetsProgress[budget.id];
          const spent = budgetProgress?.total_expense || 0;
          const progress = budgetProgress?.progress || 0;
          const startDate = budgetProgress?.start_date ? new Date(budgetProgress.start_date) : null;
          const endDate = budgetProgress?.end_date ? new Date(budgetProgress.end_date) : null;
          
          return (
            <Grid item xs={12} sm={6} md={4} key={budget.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6">
                      {budget.type === 'total' ? '总预算' : getCategoryName(budget.categoryId)}
                    </Typography>
                    <Chip
                      label={budget.enabled ? '启用' : '禁用'}
                      color={budget.enabled ? 'success' : 'warning'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="h5" color="primary" gutterBottom>
                    ¥{budget.amount.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    周期: {budget.period === 'monthly' ? '月度' : budget.period === 'weekly' ? '周度' : '年度'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    开始日: {budget.startDay} 日
                  </Typography>
                  {startDate && endDate && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      周期: {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                    </Typography>
                  )}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">已使用</Typography>
                      <Typography variant="body2">
                        ¥{spent.toFixed(2)} / ¥{budget.amount.toFixed(2)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{
                        height: 8,
                        borderRadius: 1,
                        backgroundColor: 'background.paper',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: progress > 80 ? 'error.main' : progress > 50 ? 'warning.main' : 'success.main',
                        },
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      {progress.toFixed(1)}%
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <IconButton onClick={() => handleOpenDialog(budget)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(budget.id)}>
                    <Delete />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* 添加/编辑预算对话框 */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingBudget ? '编辑预算' : '添加预算'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>预算类型</InputLabel>
              <Select
                name="type"
                value={formData.type}
                label="预算类型"
                onChange={handleChange}
              >
                <MenuItem value="total">总预算</MenuItem>
                <MenuItem value="category">分类预算</MenuItem>
              </Select>
            </FormControl>

            {formData.type === 'category' && (
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
                    .filter(c => c.kind === 'expense')
                    .map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            )}

            <TextField
              name="amount"
              label="预算金额"
              type="number"
              fullWidth
              value={formData.amount}
              onChange={handleChange}
            />

            <FormControl fullWidth>
              <InputLabel>周期</InputLabel>
              <Select
                name="period"
                value={formData.period}
                label="周期"
                onChange={handleChange}
              >
                <MenuItem value="monthly">月度</MenuItem>
                <MenuItem value="weekly">周度</MenuItem>
                <MenuItem value="yearly">年度</MenuItem>
              </Select>
            </FormControl>

            <TextField
              name="startDay"
              label="开始日"
              type="number"
              fullWidth
              value={formData.startDay}
              onChange={handleChange}
              helperText="1-31（月度）或 1-7（周度）"
            />

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                id="enabled"
                name="enabled"
                checked={formData.enabled}
                onChange={handleChange}
                style={{ marginRight: '8px' }}
              />
              <label htmlFor="enabled">启用预算</label>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingBudget ? '保存' : '添加'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Budgets;
