import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
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

// 创建主题
const theme = createTheme({
	palette: {
		primary: {
			main: '#1976d2',
		},
	},
});

function App() {
	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<AuthProvider>
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
			</AuthProvider>
		</ThemeProvider>
	);
}

export default App;
