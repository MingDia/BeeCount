import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Alert,
  LinearProgress,
  Divider,
  Grid,
} from '@mui/material';
import { Download, Upload, FileDownload, FileUpload } from '@mui/icons-material';

function DataImportExport() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  // 导出功能
  const handleExport = (type) => {
    window.open(`http://localhost:8080/api/v1/export/csv/${type}`, '_blank');
  };

  // 导入功能
  const handleImport = (type, e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccess(null);

    const formData = new FormData();
    formData.append('file', file);

    fetch(`http://localhost:8080/api/v1/import/csv/${type}`, {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setUploadSuccess(data.message);
          setUploadProgress(100);
          // 重置表单
          e.target.value = '';
          // 重新加载页面以显示新数据
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          setUploadError(data.error || '导入失败');
        }
      })
      .catch(error => {
        setUploadError('导入失败: ' + error.message);
      })
      .finally(() => {
        setUploadProgress(0);
      });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">数据导入/导出</Typography>
      </Box>

      {uploadError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {uploadError}
        </Alert>
      )}

      {uploadSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {uploadSuccess}
        </Alert>
      )}

      {uploadProgress > 0 && (
        <LinearProgress variant="determinate" value={uploadProgress} sx={{ mb: 3 }} />
      )}

      <Grid container spacing={3}>
        {/* 交易数据 */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                交易数据
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                导入/导出交易记录，包括标签和附件信息
              </Typography>
            </CardContent>
            <CardActions sx={{ flexDirection: 'column', alignItems: 'stretch', p: 2 }}>
              <Button
                variant="contained"
                startIcon={<Download />}
                fullWidth
                onClick={() => handleExport('transactions')}
                sx={{ mb: 1 }}
              >
                导出CSV
              </Button>
              <Button
                variant="outlined"
                startIcon={<Upload />}
                fullWidth
                component="label"
              >
                导入CSV
                <input
                  type="file"
                  hidden
                  accept=".csv"
                  onChange={(e) => handleImport('transactions', e)}
                />
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* 账户数据 */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                账户数据
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                导入/导出账户信息，包括余额和类型
              </Typography>
            </CardContent>
            <CardActions sx={{ flexDirection: 'column', alignItems: 'stretch', p: 2 }}>
              <Button
                variant="contained"
                startIcon={<Download />}
                fullWidth
                onClick={() => handleExport('accounts')}
                sx={{ mb: 1 }}
              >
                导出CSV
              </Button>
              <Button
                variant="outlined"
                startIcon={<Upload />}
                fullWidth
                component="label"
              >
                导入CSV
                <input
                  type="file"
                  hidden
                  accept=".csv"
                  onChange={(e) => handleImport('accounts', e)}
                />
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* 分类数据 */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                分类数据
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                导入/导出分类信息，包括层级和图标
              </Typography>
            </CardContent>
            <CardActions sx={{ flexDirection: 'column', alignItems: 'stretch', p: 2 }}>
              <Button
                variant="contained"
                startIcon={<Download />}
                fullWidth
                onClick={() => handleExport('categories')}
                sx={{ mb: 1 }}
              >
                导出CSV
              </Button>
              <Button
                variant="outlined"
                startIcon={<Upload />}
                fullWidth
                component="label"
              >
                导入CSV
                <input
                  type="file"
                  hidden
                  accept=".csv"
                  onChange={(e) => handleImport('categories', e)}
                />
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          操作说明
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          1. 导出：点击对应数据类型的"导出CSV"按钮，系统会自动下载CSV文件
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          2. 导入：点击对应数据类型的"导入CSV"按钮，选择要导入的CSV文件
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          3. 导入格式：请确保导入的CSV文件格式与导出的格式一致
        </Typography>
        <Typography variant="body2" color="text.secondary">
          4. 导入注意：导入会创建新数据，不会覆盖现有数据
        </Typography>
      </Box>
    </Box>
  );
}

export default DataImportExport;