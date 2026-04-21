import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  LinearProgress,
  CircularProgress,
  Paper,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  PieChart,
  Timeline,
} from '@mui/icons-material';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { statisticsAPI } from '../services/api';
import { useApp } from '../contexts/AppContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function Statistics() {
  const { selectedLedger } = useApp();
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [scope, setScope] = useState('month'); // month, year, all
  const [type, setType] = useState('expense'); // expense, income, balance
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const params = {
        ledger_id: selectedLedger?.id || 1,
        scope,
        type,
        selected_date: selectedDate,
      };
      const response = await statisticsAPI.getStatistics(params);
      if (response.data.success) {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [scope, type, selectedDate, selectedLedger]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(amount);
  };

  const getTrendChartData = () => {
    if (!statistics) return null;
    
    const labels = statistics.trend_data.map(item => {
      if (scope === 'month') {
        const date = new Date(item.date);
        return `${date.getDate()}日`;
      } else if (scope === 'year') {
        return `${item.month}月`;
      } else {
        return `${item.year}年`;
      }
    });

    const incomeData = statistics.trend_data.map(item => item.income);
    const expenseData = statistics.trend_data.map(item => item.expense);

    return {
      labels,
      datasets: [
        {
          label: '收入',
          data: incomeData,
          borderColor: '#4caf50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          tension: 0.4,
          fill: true,
        },
        {
          label: '支出',
          data: expenseData,
          borderColor: '#f44336',
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  const getCategoryChartData = () => {
    if (!statistics || !statistics.category_totals.length) return null;

    const labels = statistics.category_totals.map(item => item.category?.name || '未分类');
    const data = statistics.category_totals.map(item => item.total);
    const colors = [
      '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
      '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
      '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800',
    ];

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors.slice(0, data.length),
          borderWidth: 2,
          borderColor: '#fff',
        },
      ],
    };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        统计分析
      </Typography>

      {/* 筛选器 */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>时间范围</InputLabel>
            <Select
              value={scope}
              label="时间范围"
              onChange={(e) => setScope(e.target.value)}
            >
              <MenuItem value="month">本月</MenuItem>
              <MenuItem value="year">本年</MenuItem>
              <MenuItem value="all">全部</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>统计类型</InputLabel>
            <Select
              value={type}
              label="统计类型"
              onChange={(e) => setType(e.target.value)}
            >
              <MenuItem value="expense">支出分析</MenuItem>
              <MenuItem value="income">收入分析</MenuItem>
              <MenuItem value="balance">收支对比</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* 概要卡片 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingDown sx={{ color: '#f44336', mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  总支出
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                {formatCurrency(statistics?.summary?.total_expense || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {statistics?.summary?.expense_count || 0} 笔交易
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp sx={{ color: '#4caf50', mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  总收入
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                {formatCurrency(statistics?.summary?.total_income || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {statistics?.summary?.income_count || 0} 笔交易
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountBalance sx={{ 
                  color: (statistics?.summary?.balance || 0) >= 0 ? '#2196f3' : '#f44336', 
                  mr: 1 
                }} />
                <Typography variant="body2" color="text.secondary">
                  结余
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 'bold', 
                color: (statistics?.summary?.balance || 0) >= 0 ? '#2196f3' : '#f44336' 
              }}>
                {formatCurrency(statistics?.summary?.balance || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 图表区域 */}
      <Grid container spacing={3}>
        {/* 趋势图 */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Timeline sx={{ mr: 1, color: '#1976d2' }} />
                <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                  收支趋势
                </Typography>
              </Box>
              {getTrendChartData() && (
                <Box sx={{ height: 300 }}>
                  <Line data={getTrendChartData()} options={chartOptions} />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 分类饼图 */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PieChart sx={{ mr: 1, color: '#9c27b0' }} />
                <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                  分类占比
                </Typography>
              </Box>
              {getCategoryChartData() ? (
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center' }}>
                  <Doughnut data={getCategoryChartData()} options={chartOptions} />
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">暂无数据</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 分类排行列表 */}
      {statistics?.category_totals?.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 2 }}>
              分类排行
            </Typography>
            <Grid container spacing={2}>
              {statistics.category_totals
                .sort((a, b) => b.total - a.total)
                .map((item, index) => (
                  <Grid item xs={12} key={item.category?.id || index}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body1" sx={{ fontWeight: 'medium', mr: 1 }}>
                            {index + 1}.
                          </Typography>
                          <Typography variant="body1">
                            {item.category?.name || '未分类'}
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(item.total)}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={item.percent}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: '#1976d2',
                            borderRadius: 4,
                          },
                        }}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {item.percent.toFixed(1)}%
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default Statistics;
