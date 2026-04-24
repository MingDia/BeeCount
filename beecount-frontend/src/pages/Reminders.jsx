import React, { useState, useEffect } from 'react';
import {
	Box,
	Button,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	FormControlLabel,
	Switch,
	Alert,
} from '@mui/material';
import { Add, Edit, Delete, Notifications } from '@mui/icons-material';
import { reminderAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function Reminders() {
	const [reminders, setReminders] = useState([]);
	const [open, setOpen] = useState(false);
	const [currentReminder, setCurrentReminder] = useState({
		type: 'custom',
		title: '',
		description: '',
		amount: null,
		reminderDate: new Date().toISOString().split('T')[0],
		frequency: 'once',
		enabled: true,
	});
	const [isEditing, setIsEditing] = useState(false);
	const [error, setError] = useState('');
	const { isAuthenticated } = useAuth();

	useEffect(() => {
		if (isAuthenticated) {
			fetchReminders();
		}
	}, [isAuthenticated]);

	const fetchReminders = async () => {
		try {
			const response = await reminderAPI.getAll();
			setReminders(response.data.data);
		} catch (error) {
			console.error('获取提醒失败:', error);
		}
	};

	const handleOpen = (reminder = null) => {
		if (reminder) {
			setCurrentReminder({
				...reminder,
				reminderDate: new Date(reminder.reminderDate).toISOString().split('T')[0],
			});
			setIsEditing(true);
		} else {
			setCurrentReminder({
				type: 'custom',
				title: '',
				description: '',
				amount: null,
				reminderDate: new Date().toISOString().split('T')[0],
				frequency: 'once',
				enabled: true,
			});
			setIsEditing(false);
		}
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
		setError('');
	};

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setCurrentReminder(prev => ({
			...prev,
			[name]: type === 'checkbox' ? checked : type === 'number' ? (value ? Number(value) : null) : value,
		}));
	};

	const handleSave = async () => {
		try {
			if (isEditing) {
				await reminderAPI.update(currentReminder.id, currentReminder);
			} else {
				await reminderAPI.create(currentReminder);
			}
			fetchReminders();
			handleClose();
		} catch (error) {
			setError(error.response?.data?.error || '操作失败');
		}
	};

	const handleDelete = async (id) => {
		if (window.confirm('确定要删除这个提醒吗？')) {
			try {
				await reminderAPI.delete(id);
				fetchReminders();
			} catch (error) {
				console.error('删除提醒失败:', error);
			}
		}
	};

	const handleMarkNotified = async (id) => {
		try {
			await reminderAPI.markNotified(id);
			fetchReminders();
		} catch (error) {
			console.error('标记提醒失败:', error);
		}
	};

	return (
		<Box sx={{ p: 3 }}>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
				<Typography variant="h4">提醒管理</Typography>
				<Button
					variant="contained"
					startIcon={<Add />}
					onClick={() => handleOpen()}
				>
					添加提醒
				</Button>
			</Box>

			{error && (
				<Alert severity="error" sx={{ mb: 2 }}>
					{error}
				</Alert>
			)}

			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>类型</TableCell>
							<TableCell>标题</TableCell>
							<TableCell>金额</TableCell>
							<TableCell>提醒日期</TableCell>
							<TableCell>频率</TableCell>
							<TableCell>状态</TableCell>
							<TableCell>操作</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{reminders.map((reminder) => (
							<TableRow key={reminder.id}>
								<TableCell>
									{reminder.type === 'budget' && '预算'}
									{reminder.type === 'recurring' && '周期交易'}
									{reminder.type === 'bill' && '账单'}
									{reminder.type === 'custom' && '自定义'}
								</TableCell>
								<TableCell>{reminder.title}</TableCell>
								<TableCell>
									{reminder.amount ? `¥${reminder.amount.toFixed(2)}` : '-'}
								</TableCell>
								<TableCell>
									{new Date(reminder.reminderDate).toLocaleDateString()}
								</TableCell>
								<TableCell>
									{reminder.frequency === 'once' && '一次性'}
									{reminder.frequency === 'daily' && '每天'}
									{reminder.frequency === 'weekly' && '每周'}
									{reminder.frequency === 'monthly' && '每月'}
								</TableCell>
								<TableCell>
									<FormControlLabel
										control={
											<Switch
												checked={reminder.enabled}
												disabled
											/>
										}
										label={reminder.enabled ? '启用' : '禁用'}
									/>
								</TableCell>
								<TableCell>
									<Button
										size="small"
										startIcon={<Edit />}
										onClick={() => handleOpen(reminder)}
									>
										编辑
									</Button>
									<Button
										size="small"
										startIcon={<Notifications />}
										onClick={() => handleMarkNotified(reminder.id)}
									>
										标记
									</Button>
									<Button
										size="small"
										startIcon={<Delete />}
										color="error"
										onClick={() => handleDelete(reminder.id)}
									>
										删除
									</Button>
								</TableCell>
							</TableRow>
						))}
						{reminders.length === 0 && (
							<TableRow>
								<TableCell colSpan={7} align="center">
									<Typography variant="body2" color="textSecondary">
										暂无提醒
									</Typography>
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</TableContainer>

			<Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
				<DialogTitle>{isEditing ? '编辑提醒' : '添加提醒'}</DialogTitle>
				<DialogContent>
					<DialogContentText>
						{isEditing ? '修改提醒的详细信息' : '创建一个新的提醒'}
					</DialogContentText>
					<Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: { md: '1fr 1fr' }, gap: 2 }}>
						<FormControl fullWidth>
							<InputLabel>类型</InputLabel>
							<Select
								name="type"
								value={currentReminder.type}
								onChange={handleChange}
								label="类型"
							>
								<MenuItem value="custom">自定义</MenuItem>
								<MenuItem value="budget">预算</MenuItem>
								<MenuItem value="recurring">周期交易</MenuItem>
								<MenuItem value="bill">账单</MenuItem>
							</Select>
						</FormControl>
						<TextField
							name="title"
							label="标题"
							fullWidth
							required
							value={currentReminder.title}
							onChange={handleChange}
						/>
						<TextField
							name="amount"
							label="金额"
							type="number"
							fullWidth
							value={currentReminder.amount || ''}
							onChange={handleChange}
						/>
						<TextField
							name="reminderDate"
							label="提醒日期"
							type="date"
							fullWidth
							required
							InputLabelProps={{ shrink: true }}
							value={currentReminder.reminderDate}
							onChange={handleChange}
						/>
						<FormControl fullWidth>
							<InputLabel>频率</InputLabel>
							<Select
								name="frequency"
								value={currentReminder.frequency}
								onChange={handleChange}
								label="频率"
							>
								<MenuItem value="once">一次性</MenuItem>
								<MenuItem value="daily">每天</MenuItem>
								<MenuItem value="weekly">每周</MenuItem>
								<MenuItem value="monthly">每月</MenuItem>
							</Select>
						</FormControl>
						<FormControlLabel
							control={
								<Switch
									name="enabled"
									checked={currentReminder.enabled}
									onChange={handleChange}
								/>
							}
							label="启用"
						/>
						<TextField
							name="description"
							label="描述"
							multiline
							rows={3}
							fullWidth
							sx={{ gridColumn: { md: 'span 2' } }}
							value={currentReminder.description}
							onChange={handleChange}
						/>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose}>取消</Button>
					<Button onClick={handleSave} variant="contained">保存</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}

export default Reminders;