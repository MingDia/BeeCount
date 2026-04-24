import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI, setAuthToken } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(null);
	const [loading, setLoading] = useState(true);

	// 初始化时检查localStorage
	useEffect(() => {
		const savedToken = localStorage.getItem('authToken');
		if (savedToken) {
			setToken(savedToken);
			setAuthToken(savedToken);
			fetchCurrentUser();
		} else {
			setLoading(false);
		}
	}, []);

	const fetchCurrentUser = async () => {
		try {
			const response = await userAPI.getMe();
			setUser(response.data.data);
		} catch (error) {
			console.error('获取用户信息失败:', error);
			logout();
		} finally {
			setLoading(false);
		}
	};

	const login = async (data) => {
		try {
			const response = await authAPI.login(data);
			const { user: userData, token: authToken } = response.data.data;
			
			setToken(authToken);
			setUser(userData);
			setAuthToken(authToken);
			localStorage.setItem('authToken', authToken);
			
			return { success: true };
		} catch (error) {
			return { success: false, error: error.response?.data?.error || '登录失败' };
		}
	};

	const register = async (data) => {
		try {
			const response = await authAPI.register(data);
			const { user: userData, token: authToken } = response.data.data;
			
			setToken(authToken);
			setUser(userData);
			setAuthToken(authToken);
			localStorage.setItem('authToken', authToken);
			
			return { success: true };
		} catch (error) {
			return { success: false, error: error.response?.data?.error || '注册失败' };
		}
	};

	const logout = () => {
		setUser(null);
		setToken(null);
		setAuthToken(null);
		localStorage.removeItem('authToken');
	};

	const updateUser = async (data) => {
		try {
			const response = await userAPI.updateMe(data);
			setUser(response.data.data);
			return { success: true };
		} catch (error) {
			return { success: false, error: error.response?.data?.error || '更新失败' };
		}
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				token,
				loading,
				login,
				register,
				logout,
				updateUser,
				isAuthenticated: !!user,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}