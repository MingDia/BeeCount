import React, { useState } from 'react';
import { Outlet, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  MenuItem as SelectMenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Home,
  AccountBalanceWallet,
  Category,
  Receipt,
  AccountBalance,
  Label,
  Menu as MenuIcon,
  AccountCircle,
  FileDownload,
  Lightbulb,
  BarChart,
  Notifications,
  Logout,
  Person,
  Add,
  Edit,
  Delete,
} from '@mui/icons-material';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 240;

const menuItems = [
  { text: '首页', icon: <Home />, path: '/' },
  { text: '账户', icon: <AccountBalanceWallet />, path: '/accounts' },
  { text: '分类', icon: <Category />, path: '/categories' },
  { text: '交易', icon: <Receipt />, path: '/transactions' },
  { text: '周期交易', icon: <Receipt />, path: '/recurring' },
  { text: '预算', icon: <AccountBalance />, path: '/budgets' },
  { text: '标签', icon: <Label />, path: '/tags' },
  { text: '提醒', icon: <Notifications />, path: '/reminders' },
  { text: '统计分析', icon: <BarChart />, path: '/statistics' },
  { text: '数据导入/导出', icon: <FileDownload />, path: '/data' },
  { text: 'AI助手', icon: <Lightbulb />, path: '/ai' },
];

function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [openLedgerDialog, setOpenLedgerDialog] = React.useState(false);
  const [editingLedger, setEditingLedger] = React.useState(null);
  const [ledgerFormData, setLedgerFormData] = React.useState({
    name: '',
    description: '',
    currency: 'CNY',
  });
  const { ledgers, selectedLedger, dispatch, createLedger, updateLedger, deleteLedger } = useApp();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLedgerChange = (event) => {
    const selectedId = parseInt(event.target.value);
    const ledger = ledgers.find(l => l.id === selectedId);
    if (ledger) {
      dispatch({ type: 'SET_SELECTED_LEDGER', payload: ledger });
    }
  };

  const handleOpenLedgerDialog = (ledger = null) => {
    if (ledger) {
      setEditingLedger(ledger);
      setLedgerFormData({
        name: ledger.name,
        description: ledger.description || '',
        currency: ledger.currency || 'CNY',
      });
    } else {
      setEditingLedger(null);
      setLedgerFormData({
        name: '',
        description: '',
        currency: 'CNY',
      });
    }
    setOpenLedgerDialog(true);
  };

  const handleCloseLedgerDialog = () => {
    setOpenLedgerDialog(false);
    setEditingLedger(null);
  };

  const handleLedgerSubmit = async () => {
    try {
      if (editingLedger) {
        await updateLedger(editingLedger.id, ledgerFormData);
      } else {
        await createLedger(ledgerFormData);
      }
      handleCloseLedgerDialog();
    } catch (error) {
      console.error('操作失败:', error);
    }
  };

  const handleLedgerDelete = async (id) => {
    if (window.confirm('确定要删除这个账本吗？删除后所有关联的交易数据也会丢失。')) {
      try {
        await deleteLedger(id);
      } catch (error) {
        console.error('删除失败:', error);
      }
    }
  };

  const handleLedgerFormChange = (e) => {
    const { name, value } = e.target;
    setLedgerFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          BeeCount
        </Typography>
      </Toolbar>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AccountBalance size={16} sx={{ mr: 1 }} />
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              账本
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {selectedLedger && (
              <IconButton size="small" onClick={() => handleOpenLedgerDialog(selectedLedger)}>
                <Edit fontSize="small" />
              </IconButton>
            )}
            <IconButton size="small" onClick={() => handleOpenLedgerDialog()}>
              <Add fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        <FormControl fullWidth size="small">
          <Select
            value={selectedLedger?.id || ''}
            onChange={handleLedgerChange}
            displayEmpty
            inputProps={{ 'aria-label': '选择账本' }}
          >
            {ledgers.map((ledger) => (
              <SelectMenuItem key={ledger.id} value={ledger.id}>
                {ledger.name}
              </SelectMenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            component={RouterLink}
            to={item.path}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          {user ? (
            <>
              <IconButton
                color="inherit"
                onClick={handleMenuClick}
              >
                <AccountCircle />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem component={RouterLink} to="/profile" onClick={handleMenuClose}>
                  <Person size={20} sx={{ mr: 1 }} />
                  个人资料
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>设置</MenuItem>
                <MenuItem onClick={handleMenuClose}>关于</MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <Logout size={20} sx={{ mr: 1 }} />
                  退出登录
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button color="inherit" component={RouterLink} to="/login">
                登录
              </Button>
              <Button color="inherit" component={RouterLink} to="/register">
                注册
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>

      {/* 账本管理对话框 */}
      <Dialog open={openLedgerDialog} onClose={handleCloseLedgerDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingLedger ? '编辑账本' : '创建账本'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              name="name"
              label="账本名称"
              fullWidth
              required
              value={ledgerFormData.name}
              onChange={handleLedgerFormChange}
            />
            <TextField
              name="description"
              label="描述"
              multiline
              rows={2}
              fullWidth
              value={ledgerFormData.description}
              onChange={handleLedgerFormChange}
            />
            <TextField
              name="currency"
              label="货币"
              fullWidth
              value={ledgerFormData.currency}
              onChange={handleLedgerFormChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          {editingLedger && (
            <Button
              color="error"
              onClick={() => {
                handleLedgerDelete(editingLedger.id);
                handleCloseLedgerDialog();
              }}
              startIcon={<Delete />}
            >
              删除
            </Button>
          )}
          <Button onClick={handleCloseLedgerDialog}>取消</Button>
          <Button onClick={handleLedgerSubmit} variant="contained">
            {editingLedger ? '保存' : '创建'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Layout;
