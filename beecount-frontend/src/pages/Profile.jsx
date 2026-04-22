import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	Box,
	Button,
	Container,
	CssBaseline,
	TextField,
	Typography,
	Alert,
	Paper,
	Avatar,
	Divider,
} from '@mui/material';
import { Person } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

function Profile() {
	const { user, updateUser, logout } = useAuth();
	const [formData, setFormData] = useState({
		nickname: user?.nickname || '',
		theme: user?.theme || 'light',
		language: user?.language || 'zh-CN',
		fontScale: user?.fontScale || 1.0,
	});
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setSuccess('');
		setLoading(true);

		const result = await updateUser(formData);
		if (result.success) {
			setSuccess('更新成功');
		} else {
			setError(result.error);
		}
		setLoading(false);
	};

	const handleLogout = () => {
		logout();
		navigate('/login');
	};

	return (
		<Container component="main" maxWidth="md">
			<CssBaseline />
			<Box sx={{ marginTop: 4, marginBottom: 4 }}>
				<Typography component="h1" variant="h4" gutterBottom>
					个人资料
				</Typography>

				<Paper elevation={3} sx={{ padding: 4, marginBottom: 3 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
						<Avatar sx={{ width: 64, height: 64, marginRight: 2 }}>
							<Person />
						</Avatar>
						<Box>
							<Typography variant="h6">{user?.username}</Typography>
							<Typography variant="body2" color="textSecondary">
								{user?.email}
							</Typography>
						</Box>
					</Box>

					{error && (
						<Alert severity="error" sx={{ mb: 2 }}>
							{error}
						</Alert>
					)}
					{success && (
						<Alert severity="success" sx={{ mb: 2 }}>
							{success}
						</Alert>
					)}

					<Box component="form" onSubmit={handleSubmit}>
						<TextField
							margin="normal"
							fullWidth
							id="nickname"
							label="昵称"
							name="nickname"
							value={formData.nickname}
							onChange={handleChange}
						/>
						<TextField
							margin="normal"
							fullWidth
							id="theme"
							label="主题"
							name="theme"
							select
							SelectProps={{
								native: true,
							}}
							value={formData.theme}
							onChange={handleChange}
						>
							<option value="light">浅色</option>
							<option value="dark">深色</option>
						</TextField>
						<TextField
							margin="normal"
							fullWidth
							id="language"
							label="语言"
							name="language"
							select
							SelectProps={{
								native: true,
							}}
							value={formData.language}
							onChange={handleChange}
						>
							<option value="zh-CN">简体中文</option>
							<option value="en-US">English</option>
						</TextField>
						<TextField
							margin="normal"
							fullWidth
							id="fontScale"
							label="字体缩放"
							name="fontScale"
							type="number"
							inputProps={{
								min: 0.8,
								max: 1.5,
								step: 0.1,
							}}
							value={formData.fontScale}
							onChange={handleChange}
						/>
						<Button
							type="submit"
							fullWidth
							variant="contained"
							sx={{ mt: 3, mb: 2 }}
							disabled={loading}
						>
							{loading ? '更新中...' : '更新'}
						</Button>
					</Box>
				</Paper>

				<Divider sx={{ my: 3 }} />

				<Paper elevation={3} sx={{ padding: 4 }}>
					<Typography variant="h6" gutterBottom>
						账户操作
					</Typography>
					<Button
						fullWidth
						variant="outlined"
						color="error"
						onClick={handleLogout}
					>
						退出登录
					</Button>
				</Paper>
			</Box>
		</Container>
	);
}

export default Profile;