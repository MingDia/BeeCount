import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Accounts from './pages/Accounts';
import Categories from './pages/Categories';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Tags from './pages/Tags';
import RecurringTransactions from './pages/RecurringTransactions';
import DataImportExport from './pages/DataImportExport';
import AI from './pages/AI';
import Statistics from './pages/Statistics';
import Login from './pages/Login';
import Register from './pages/Register';
import Reminders from './pages/Reminders';
import Profile from './pages/Profile';

// 主题组件
function ThemedApp() {
	const { user } = useAuth();
	const [theme, setTheme] = useState(createTheme({
		palette: {
			mode: 'light',
			primary: {
				main: '#1976d2',
			},
		},
	}));

	useEffect(() => {
		// 根据用户主题设置创建主题
		const createAppTheme = (mode) => {
			return createTheme({
				palette: {
					mode: mode,
					primary: {
						main: '#1976d2',
					},
					secondary: {
						main: '#dc004e',
					},
					background: {
						default: mode === 'light' ? '#f5f5f5' : '#121212',
						paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
					},
				},
				typography: {
					fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
				},
			});
		};

		if (user?.theme) {
			setTheme(createAppTheme(user.theme));
		} else {
			// 默认使用浅色主题
			setTheme(createAppTheme('light'));
		}
	}, [user?.theme]);

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<AppProvider>
				<Router>
					<Routes>
						<Route path="/login" element={<Login />} />
						<Route path="/register" element={<Register />} />
						<Route path="/" element={<Layout />}>
							<Route index element={<Home />} />
							<Route path="accounts" element={<Accounts />} />
							<Route path="categories" element={<Categories />} />
							<Route path="transactions" element={<Transactions />} />
							<Route path="budgets" element={<Budgets />} />
							<Route path="tags" element={<Tags />} />
							<Route path="recurring" element={<RecurringTransactions />} />
							<Route path="reminders" element={<Reminders />} />
							<Route path="data" element={<DataImportExport />} />
							<Route path="ai" element={<AI />} />
							<Route path="statistics" element={<Statistics />} />
							<Route path="profile" element={<Profile />} />
							<Route path="*" element={<Navigate to="/" replace />} />
						</Route>
					</Routes>
				</Router>
			</AppProvider>
		</ThemeProvider>
	);
}

function App() {
	return (
		<AuthProvider>
			<ThemedApp />
		</AuthProvider>
	);
}

export default App;
