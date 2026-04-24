import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
	Box,
	Button,
	Container,
	CssBaseline,
	TextField,
	Typography,
	Alert,
	Paper,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

function Login() {
	const [formData, setFormData] = useState({
		username: '',
		password: '',
	});
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const { login, isAuthenticated } = useAuth();

	// 如果已经登录，重定向到首页
	React.useEffect(() => {
		if (isAuthenticated) {
			navigate('/');
		}
	}, [isAuthenticated, navigate]);

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setLoading(true);

		const result = await login(formData);
		if (result.success) {
			navigate('/');
		} else {
			setError(result.error);
		}
		setLoading(false);
	};

	if (isAuthenticated) {
		return null; // 或者显示加载状态
	}

	return (
		<Container component="main" maxWidth="xs">
			<CssBaseline />
			<Box
				sx={{
					marginTop: 8,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
				}}
			>
				<Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
					<Typography component="h1" variant="h5" textAlign="center">
						登录
					</Typography>

					{error && (
						<Alert severity="error" sx={{ mt: 2, width: '100%' }}>
							{error}
						</Alert>
					)}

					<Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
						<TextField
							margin="normal"
							required
							fullWidth
							id="username"
							label="用户名"
							name="username"
							autoComplete="username"
							autoFocus
							value={formData.username}
							onChange={handleChange}
						/>
						<TextField
							margin="normal"
							required
							fullWidth
							name="password"
							label="密码"
							type="password"
							id="password"
							autoComplete="current-password"
							value={formData.password}
							onChange={handleChange}
						/>
						<Button
							type="submit"
							fullWidth
							variant="contained"
							sx={{ mt: 3, mb: 2 }}
							disabled={loading}
						>
							{loading ? '登录中...' : '登录'}
						</Button>
						<Box textAlign="center">
							<Link to="/register" style={{ textDecoration: 'none' }}>
								<Typography variant="body2" color="primary">
									没有账号？立即注册
								</Typography>
							</Link>
						</Box>
					</Box>
				</Paper>
			</Box>
		</Container>
	);
}

export default Login;