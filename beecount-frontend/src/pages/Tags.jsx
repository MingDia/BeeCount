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

// 临时的颜色选择器组件
const ColorPicker = ({ value, onChange, label }) => {
  const colors = [
    '#FF5722', '#FF9800', '#FFEB3B', '#8BC34A', '#4CAF50',
    '#00BCD4', '#2196F3', '#3F51B5', '#9C27B0', '#673AB7',
    '#795548', '#9E9E9E', '#607D8B', '#F44336', '#E91E63',
  ];

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 1 }}>{label}</Typography>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {colors.map((color) => (
          <Box
            key={color}
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              bgcolor: color,
              cursor: 'pointer',
              border: value === color ? '2px solid black' : '1px solid #e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={() => onChange(color)}
          >
            {value === color && (
              <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: 'white' }} />
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

function Tags() {
  const { tags, createTag, updateTag, deleteTag } = useApp();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#2196F3',
    sortOrder: 0,
  });

  const handleOpenDialog = (tag = null) => {
    if (tag) {
      setEditingTag(tag);
      setFormData(tag);
    } else {
      setEditingTag(null);
      setFormData({
        name: '',
        color: '#2196F3',
        sortOrder: 0,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTag(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingTag) {
        await updateTag(editingTag.id, formData);
      } else {
        await createTag(formData);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('操作失败:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这个标签吗？')) {
      try {
        await deleteTag(id);
      } catch (error) {
        console.error('删除失败:', error);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value,
    }));
  };

  // 按排序顺序排序标签
  const sortedTags = [...tags].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">标签管理</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          添加标签
        </Button>
      </Box>

      <Grid container spacing={3}>
        {sortedTags.map((tag) => (
          <Grid item xs={12} sm={6} md={4} key={tag.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6">{tag.name}</Typography>
                  <Chip
                    label={`排序: ${tag.sortOrder}`}
                    size="small"
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: tag.color,
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    颜色: {tag.color}
                  </Typography>
                </Box>
              </CardContent>
              <CardActions>
                <IconButton onClick={() => handleOpenDialog(tag)}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(tag.id)}>
                  <Delete />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 添加/编辑标签对话框 */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTag ? '编辑标签' : '添加标签'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              name="name"
              label="标签名称"
              fullWidth
              value={formData.name}
              onChange={handleChange}
            />
            <ColorPicker
              label="选择颜色"
              value={formData.color}
              onChange={(color) => setFormData(prev => ({ ...prev, color }))}
            />
            <TextField
              name="sortOrder"
              label="排序顺序"
              type="number"
              fullWidth
              value={formData.sortOrder}
              onChange={handleChange}
              helperText="数字越小，排序越靠前"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingTag ? '保存' : '添加'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Tags;
