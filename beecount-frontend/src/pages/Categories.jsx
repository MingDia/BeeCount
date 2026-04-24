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
  Chip,
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { useApp } from '../contexts/AppContext';

function Categories() {
  const { categories, createCategory, updateCategory, deleteCategory } = useApp();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    kind: 'expense',
    icon: 'category',
    parentId: null,
  });

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData(category);
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        kind: 'expense',
        icon: 'category',
        parentId: null,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
      } else {
        await createCategory(formData);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('操作失败:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这个分类吗？')) {
      try {
        await deleteCategory(id);
      } catch (error) {
        console.error('删除失败:', error);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // 按类型分组分类
  const expenseCategories = categories.filter(c => c.kind === 'expense');
  const incomeCategories = categories.filter(c => c.kind === 'income');

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">分类管理</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          添加分类
        </Button>
      </Box>

      {/* 支出分类 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          支出分类
        </Typography>
        <Grid container spacing={3}>
          {expenseCategories.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6">{category.name}</Typography>
                    <Chip
                      label="支出"
                      color="error"
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    图标: {category.icon}
                  </Typography>
                  {category.parentId && (
                    <Typography variant="body2" color="text.secondary">
                      父分类: {categories.find(c => c.id === category.parentId)?.name || '未知'}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <IconButton onClick={() => handleOpenDialog(category)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(category.id)}>
                    <Delete />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* 收入分类 */}
      <Box>
        <Typography variant="h5" gutterBottom>
          收入分类
        </Typography>
        <Grid container spacing={3}>
          {incomeCategories.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6">{category.name}</Typography>
                    <Chip
                      label="收入"
                      color="success"
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    图标: {category.icon}
                  </Typography>
                  {category.parentId && (
                    <Typography variant="body2" color="text.secondary">
                      父分类: {categories.find(c => c.id === category.parentId)?.name || '未知'}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <IconButton onClick={() => handleOpenDialog(category)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(category.id)}>
                    <Delete />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* 添加/编辑分类对话框 */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? '编辑分类' : '添加分类'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              name="name"
              label="分类名称"
              fullWidth
              value={formData.name}
              onChange={handleChange}
            />
            <FormControl fullWidth>
              <InputLabel>类型</InputLabel>
              <Select
                name="kind"
                value={formData.kind}
                label="类型"
                onChange={handleChange}
              >
                <MenuItem value="expense">支出</MenuItem>
                <MenuItem value="income">收入</MenuItem>
              </Select>
            </FormControl>
            <TextField
              name="icon"
              label="图标"
              fullWidth
              value={formData.icon}
              onChange={handleChange}
              helperText="请输入 Material UI 图标名称"
            />
            <FormControl fullWidth>
              <InputLabel>父分类</InputLabel>
              <Select
                name="parentId"
                value={formData.parentId || ''}
                label="父分类"
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    parentId: value ? parseInt(value) : null,
                  }));
                }}
                displayEmpty
              >
                <MenuItem value="">无（一级分类）</MenuItem>
                {categories
                  .filter(c => c.kind === formData.kind)
                  .map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingCategory ? '保存' : '添加'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Categories;
