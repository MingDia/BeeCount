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
} from '@mui/material';
import {
  Home,
  AccountBalanceWallet,
  Category,
  Receipt,
  Budget,
  Label,
  Menu as MenuIcon,
  AccountCircle,
  AccountBalance,
  FileDownload,
  BrainCircuit,
  BarChart,
  Notifications,
  Logout,
  Person,
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
  { text: '预算', icon: <Budget />, path: '/budgets' },
  { text: '标签', icon: <Label />, path: '/tags' },
  { text: '提醒', icon: <Notifications />, path: '/reminders' },
  { text: '统计分析', icon: <BarChart />, path: '/statistics' },
  { text: '数据导入/导出', icon: <FileDownload />, path: '/data' },
  { text: 'AI助手', icon: <BrainCircuit />, path: '/ai' },
];

function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { ledgers, selectedLedger, dispatch } = useApp();
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

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          BeeCount
        </Typography>
      </Toolbar>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <AccountBalance size={16} sx={{ mr: 1 }} />
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            账本
          </Typography>
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
    </Box>
  );
}

export default Layout;
