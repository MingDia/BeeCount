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

function Register() {
	const [formData, setFormData] = useState({
		username: '',
		email: '',
		password: '',
		confirmPassword: '',
	});
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const { register, isAuthenticated } = useAuth();

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

		if (formData.password !== formData.confirmPassword) {
			setError('两次输入的密码不一致');
			return;
		}

		if (formData.password.length < 6) {
			setError('密码至少需要6个字符');
			return;
		}

		setLoading(true);
		const result = await register({
			username: formData.username,
			email: formData.email,
			password: formData.password,
		});

		if (result.success) {
			navigate('/');
		} else {
			setError(result.error);
		}
		setLoading(false);
	};

	if (isAuthenticated) {
		return null;
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
						注册
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
							id="email"
							label="邮箱"
							name="email"
							type="email"
							autoComplete="email"
							value={formData.email}
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
							autoComplete="new-password"
							value={formData.password}
							onChange={handleChange}
							helperText="至少6个字符"
						/>
						<TextField
							margin="normal"
							required
							fullWidth
							name="confirmPassword"
							label="确认密码"
							type="password"
							id="confirmPassword"
							value={formData.confirmPassword}
							onChange={handleChange}
						/>
						<Button
							type="submit"
							fullWidth
							variant="contained"
							sx={{ mt: 3, mb: 2 }}
							disabled={loading}
						>
							{loading ? '注册中...' : '注册'}
						</Button>
						<Box textAlign="center">
							<Link to="/login" style={{ textDecoration: 'none' }}>
								<Typography variant="body2" color="primary">
									已有账号？立即登录
								</Typography>
							</Link>
						</Box>
					</Box>
				</Paper>
			</Box>
		</Container>
	);
}

export default Register;