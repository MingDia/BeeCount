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
  Alert,
  LinearProgress,
  Card,
} from '@mui/material';
import { Add, Delete, Edit, Search, UploadFile, PictureAsPdf, Cancel } from '@mui/icons-material';
import { format } from 'date-fns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useApp } from '../contexts/AppContext';
import { smartAPI } from '../services/api';

function Transactions() {
  const { 
    transactions, 
    accounts, 
    categories, 
    tags, 
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
    tags: [],
    attachments: [],
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [smartClassifying, setSmartClassifying] = useState(false);

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
      setFormData({
        ...transaction,
        tags: transaction.tags || [],
        attachments: transaction.attachments || [],
      });
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
        tags: [],
        attachments: [],
      });
    }
    setUploadProgress(0);
    setUploadError(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTransaction(null);
  };

  const handleSubmit = async () => {
    try {
      let transactionId;
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, formData);
        transactionId = editingTransaction.id;
      } else {
        const newTransaction = await createTransaction(formData);
        transactionId = newTransaction.id;
      }
      handleCloseDialog();
      return transactionId;
    } catch (error) {
      console.error('操作失败:', error);
      return null;
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

  const handleTagChange = (tagId) => {
    setFormData(prev => {
      const isSelected = prev.tags.some(tag => tag.id === tagId);
      if (isSelected) {
        return {
          ...prev,
          tags: prev.tags.filter(tag => tag.id !== tagId),
        };
      } else {
        const tag = tags.find(t => t.id === tagId);
        return {
          ...prev,
          tags: [...prev.tags, tag],
        };
      }
    });
  };

  const handleFileUpload = async (e, transactionId) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadProgress(0);
    setUploadError(null);

    const formData = new FormData();
    formData.append('transaction_id', transactionId);
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8080/api/v1/attachments/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('上传失败');
      }

      const data = await response.json();
      if (data.success) {
        // 重新加载交易数据以获取最新的附件信息
        setFormData(prev => ({
          ...prev,
          attachments: [...(prev.attachments || []), data.data],
        }));
      } else {
        throw new Error(data.error || '上传失败');
      }
    } catch (error) {
      setUploadError(error.message);
    } finally {
      setUploadProgress(0);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (window.confirm('确定要删除这个附件吗？')) {
      try {
        const response = await fetch(`http://localhost:8080/api/v1/attachments/${attachmentId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setFormData(prev => ({
            ...prev,
            attachments: prev.attachments.filter(att => att.id !== attachmentId),
          }));
        } else {
          throw new Error('删除失败');
        }
      } catch (error) {
        console.error('删除附件失败:', error);
      }
    }
  };

  const handleSmartClassify = async () => {
    if (!formData.note && !formData.amount) {
      alert('请输入备注或金额以进行智能分类');
      return;
    }

    // 获取用户的OpenAI API设置
    const apiKey = localStorage.getItem('openai_api_key') || '';
    const baseUrl = localStorage.getItem('openai_base_url') || '';

    if (!apiKey) {
      alert('请先在个人设置中配置OpenAI API密钥');
      return;
    }

    setSmartClassifying(true);
    try {
      const response = await smartAPI.classify({
        note: formData.note,
        amount: formData.amount,
        type: formData.type,
        api_key: apiKey,
        base_url: baseUrl,
      });
      if (response.data.success) {
        const suggestedCategory = response.data.data;
        if (suggestedCategory) {
          setFormData(prev => ({
            ...prev,
            categoryId: suggestedCategory.id,
          }));
          alert(`智能分类建议: ${suggestedCategory.name}`);
        } else {
          alert('无法智能分类，请手动选择');
        }
      }
    } catch (error) {
      console.error('智能分类失败:', error);
      alert('智能分类失败，请手动选择');
    } finally {
      setSmartClassifying(false);
    }
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
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 3, gap: 2 }}>
          <Typography 
            variant="h4"
            sx={{ 
              fontSize: { xs: '1.5rem', sm: '2rem' }
            }}
          >交易管理</Typography>
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
            添加交易
          </Button>
        </Box>

        {/* 搜索栏 */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="搜索交易..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="large"
            InputProps={{
              startAdornment: <Search sx={{ mr: 1 }} />,
            }}
          />
        </Box>

        {/* 移动端交易列表 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredTransactions.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center', border: 1, borderColor: 'divider', borderRadius: 2 }}>
              暂无交易记录
            </Box>
          ) : (
            filteredTransactions.map((transaction) => (
              <Card key={transaction.id} sx={{ p: { xs: 2, sm: 2.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box>
                    <Chip
                      label={transaction.type === 'income' ? '收入' : transaction.type === 'expense' ? '支出' : '转账'}
                      color={transaction.type === 'income' ? 'success' : transaction.type === 'expense' ? 'error' : 'primary'}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 'medium',
                        fontSize: { xs: '1rem', sm: '1.125rem' }
                      }}
                    >
                      {getCategoryName(transaction.categoryId)}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="h6"
                    color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                    sx={{ 
                      fontSize: { xs: '1.25rem', sm: '1.5rem' }
                    }}
                  >
                    {transaction.type === 'income' ? '+' : '-'}{' '}¥{transaction.amount.toFixed(2)}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {transaction.type === 'transfer' ? (
                    `${getAccountName(transaction.accountId)} → ${getAccountName(transaction.toAccountId)}`
                  ) : (
                    getAccountName(transaction.accountId)
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {format(new Date(transaction.happenedAt), 'yyyy-MM-dd HH:mm')}
                </Typography>
                {transaction.note && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {transaction.note}
                  </Typography>
                )}
                {transaction.tags && transaction.tags.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                    {transaction.tags.map((tag) => (
                      <Chip 
                        key={tag.id} 
                        label={tag.name} 
                        size="small" 
                        sx={{ 
                          bgcolor: tag.color || 'primary.main',
                          color: 'white',
                          fontSize: '0.7rem',
                          height: 20
                        }} 
                      />
                    ))}
                  </Box>
                )}
                {transaction.attachments && transaction.attachments.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {transaction.attachments.map((attachment) => (
                      <Chip 
                        key={attachment.id} 
                        label={attachment.originalName} 
                        size="small" 
                        sx={{ 
                          bgcolor: 'primary.light',
                          color: 'primary.contrastText',
                          fontSize: '0.7rem',
                          height: 20
                        }}
                        onClick={() => {
                          window.open(`http://localhost:8080/uploads/${attachment.fileName}`, '_blank');
                        }}
                      />
                    ))}
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <IconButton 
                    size="large" 
                    onClick={() => handleOpenDialog(transaction)}
                    sx={{ 
                      padding: 1.5,
                      minHeight: 44,
                      minWidth: 44
                    }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton 
                    size="large" 
                    onClick={() => handleDelete(transaction.id)}
                    sx={{ 
                      padding: 1.5,
                      minHeight: 44,
                      minWidth: 44
                    }}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </Card>
            ))
          )}
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
          <DialogTitle sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2.5 } }}>
            {editingTransaction ? '编辑交易' : '添加交易'}
          </DialogTitle>
          <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1, sm: 2 } }}>
            <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 2.5 } }}>
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
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { xs: 'stretch', sm: 'flex-end' } }}>
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
                  <Button
                    variant="outlined"
                    onClick={handleSmartClassify}
                    disabled={smartClassifying}
                    sx={{ height: 56, py: 1.5 }}
                    fullWidth
                  >
                    {smartClassifying ? '分析中...' : '智能分类'}
                  </Button>
                </Box>
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

              <DatePicker
                label="日期"
                value={formData.happenedAt ? new Date(formData.happenedAt) : null}
                onChange={(date) => setFormData(prev => ({ ...prev, happenedAt: date }))}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'large'
                  },
                }}
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

              <FormControl fullWidth size="large">
                <InputLabel>标签</InputLabel>
                <Select
                  multiple
                  name="tags"
                  value={formData.tags.map(tag => tag.id)}
                  onChange={(e) => {
                    const selectedTagIds = e.target.value;
                    const selectedTags = tags.filter(tag => selectedTagIds.includes(tag.id));
                    setFormData(prev => ({ ...prev, tags: selectedTags }));
                  }}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selected.map((value) => {
                        const tag = tags.find(t => t.id === value);
                        return tag ? (
                          <Chip key={value} label={tag.name} sx={{ bgcolor: tag.color || 'primary.main' }} />
                        ) : null;
                      })}
                    </Box>
                  )}
                  label="标签"
                >
                  {tags.map((tag) => (
                    <MenuItem key={tag.id} value={tag.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: tag.color || 'primary.main' }} />
                        {tag.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>附件</Typography>
                {uploadError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {uploadError}
                  </Alert>
                )}
                {uploadProgress > 0 && (
                  <LinearProgress variant="determinate" value={uploadProgress} sx={{ mb: 2 }} />
                )}
                {formData.attachments && formData.attachments.length > 0 ? (
                  <Box sx={{ mb: 2, maxHeight: 120, overflowY: 'auto' }}>
                    {formData.attachments.map((attachment) => (
                      <Box key={attachment.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {attachment.fileName.endsWith('.pdf') ? (
                            <PictureAsPdf size={20} />
                          ) : (
                            <UploadFile size={20} />
                          )}
                          <Box>
                            <Typography variant="body2">{attachment.originalName}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {((attachment.fileSize || 0) / 1024).toFixed(1)} KB
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton 
                          size="large" 
                          onClick={() => handleDeleteAttachment(attachment.id)}
                          sx={{ 
                            padding: 1.5,
                            minHeight: 44,
                            minWidth: 44
                          }}
                        >
                          <Cancel size={20} />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    暂无附件
                  </Typography>
                )}
                <Button
                  variant="outlined"
                  startIcon={<UploadFile />}
                  onClick={() => {
                    const fileInput = document.createElement('input');
                    fileInput.type = 'file';
                    fileInput.accept = '*';
                    fileInput.onchange = (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      
                      if (editingTransaction) {
                        handleFileUpload(e, editingTransaction.id);
                      } else {
                        handleSubmit().then((transactionId) => {
                          if (transactionId) {
                            const formData = new FormData();
                            formData.append('transaction_id', transactionId);
                            formData.append('file', file);
                            
                            setUploadProgress(0);
                            setUploadError(null);
                            
                            fetch('http://localhost:8080/api/v1/attachments/upload', {
                              method: 'POST',
                              body: formData,
                            })
                              .then(response => response.json())
                              .then(data => {
                                if (data.success) {
                                  window.location.reload();
                                } else {
                                  setUploadError(data.error || '上传失败');
                                }
                              })
                              .catch(error => {
                                setUploadError('上传失败: ' + error.message);
                              })
                              .finally(() => {
                                setUploadProgress(0);
                              });
                          }
                        });
                      }
                    };
                    fileInput.click();
                  }}
                  fullWidth
                  sx={{ py: 1.5 }}
                >
                  上传附件
                </Button>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 }, gap: 1, flexDirection: { xs: 'column-reverse', sm: 'row' } }}>
            <Button onClick={handleCloseDialog} fullWidth sx={{ py: 1.5 }}>取消</Button>
            <Button onClick={handleSubmit} variant="contained" fullWidth sx={{ py: 1.5 }}>
              {editingTransaction ? '保存' : '添加'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}

export default Transactions;
