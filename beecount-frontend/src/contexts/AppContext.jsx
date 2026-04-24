import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { ledgerAPI, accountAPI, categoryAPI, transactionAPI, tagAPI, budgetAPI } from '../services/api';

const initialState = {
  ledgers: [],
  accounts: [],
  categories: [],
  transactions: [],
  tags: [],
  budgets: [],
  selectedLedger: null,
  isLoading: false,
  error: null,
};

const AppActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_LEDGERS: 'SET_LEDGERS',
  ADD_LEDGER: 'ADD_LEDGER',
  UPDATE_LEDGER: 'UPDATE_LEDGER',
  DELETE_LEDGER: 'DELETE_LEDGER',
  SET_SELECTED_LEDGER: 'SET_SELECTED_LEDGER',
  SET_ACCOUNTS: 'SET_ACCOUNTS',
  ADD_ACCOUNT: 'ADD_ACCOUNT',
  UPDATE_ACCOUNT: 'UPDATE_ACCOUNT',
  DELETE_ACCOUNT: 'DELETE_ACCOUNT',
  SET_CATEGORIES: 'SET_CATEGORIES',
  ADD_CATEGORY: 'ADD_CATEGORY',
  UPDATE_CATEGORY: 'UPDATE_CATEGORY',
  DELETE_CATEGORY: 'DELETE_CATEGORY',
  SET_TRANSACTIONS: 'SET_TRANSACTIONS',
  ADD_TRANSACTION: 'ADD_TRANSACTION',
  UPDATE_TRANSACTION: 'UPDATE_TRANSACTION',
  DELETE_TRANSACTION: 'DELETE_TRANSACTION',
  SET_TAGS: 'SET_TAGS',
  ADD_TAG: 'ADD_TAG',
  UPDATE_TAG: 'UPDATE_TAG',
  DELETE_TAG: 'DELETE_TAG',
  SET_BUDGETS: 'SET_BUDGETS',
  ADD_BUDGET: 'ADD_BUDGET',
  UPDATE_BUDGET: 'UPDATE_BUDGET',
  DELETE_BUDGET: 'DELETE_BUDGET',
};

function appReducer(state, action) {
  switch (action.type) {
    case AppActionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };
    case AppActionTypes.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };
    case AppActionTypes.SET_LEDGERS:
      return { ...state, ledgers: action.payload, isLoading: false };
    case AppActionTypes.ADD_LEDGER:
      return { ...state, ledgers: [...state.ledgers, action.payload] };
    case AppActionTypes.UPDATE_LEDGER:
      return {
        ...state,
        ledgers: state.ledgers.map(ledger =>
          ledger.id === action.payload.id ? action.payload : ledger
        ),
      };
    case AppActionTypes.DELETE_LEDGER:
      return {
        ...state,
        ledgers: state.ledgers.filter(ledger => ledger.id !== action.payload),
      };
    case AppActionTypes.SET_SELECTED_LEDGER:
      return { ...state, selectedLedger: action.payload };
    case AppActionTypes.SET_ACCOUNTS:
      return { ...state, accounts: action.payload, isLoading: false };
    case AppActionTypes.ADD_ACCOUNT:
      return { ...state, accounts: [...state.accounts, action.payload] };
    case AppActionTypes.UPDATE_ACCOUNT:
      return {
        ...state,
        accounts: state.accounts.map(account =>
          account.id === action.payload.id ? action.payload : account
        ),
      };
    case AppActionTypes.DELETE_ACCOUNT:
      return {
        ...state,
        accounts: state.accounts.filter(account => account.id !== action.payload),
      };
    case AppActionTypes.SET_CATEGORIES:
      return { ...state, categories: action.payload, isLoading: false };
    case AppActionTypes.ADD_CATEGORY:
      return { ...state, categories: [...state.categories, action.payload] };
    case AppActionTypes.UPDATE_CATEGORY:
      return {
        ...state,
        categories: state.categories.map(category =>
          category.id === action.payload.id ? action.payload : category
        ),
      };
    case AppActionTypes.DELETE_CATEGORY:
      return {
        ...state,
        categories: state.categories.filter(category => category.id !== action.payload),
      };
    case AppActionTypes.SET_TRANSACTIONS:
      return { ...state, transactions: action.payload, isLoading: false };
    case AppActionTypes.ADD_TRANSACTION:
      return { ...state, transactions: [...state.transactions, action.payload] };
    case AppActionTypes.UPDATE_TRANSACTION:
      return {
        ...state,
        transactions: state.transactions.map(transaction =>
          transaction.id === action.payload.id ? action.payload : transaction
        ),
      };
    case AppActionTypes.DELETE_TRANSACTION:
      return {
        ...state,
        transactions: state.transactions.filter(transaction => transaction.id !== action.payload),
      };
    case AppActionTypes.SET_TAGS:
      return { ...state, tags: action.payload, isLoading: false };
    case AppActionTypes.ADD_TAG:
      return { ...state, tags: [...state.tags, action.payload] };
    case AppActionTypes.UPDATE_TAG:
      return {
        ...state,
        tags: state.tags.map(tag =>
          tag.id === action.payload.id ? action.payload : tag
        ),
      };
    case AppActionTypes.DELETE_TAG:
      return {
        ...state,
        tags: state.tags.filter(tag => tag.id !== action.payload),
      };
    case AppActionTypes.SET_BUDGETS:
      return { ...state, budgets: action.payload, isLoading: false };
    case AppActionTypes.ADD_BUDGET:
      return { ...state, budgets: [...state.budgets, action.payload] };
    case AppActionTypes.UPDATE_BUDGET:
      return {
        ...state,
        budgets: state.budgets.map(budget =>
          budget.id === action.payload.id ? action.payload : budget
        ),
      };
    case AppActionTypes.DELETE_BUDGET:
      return {
        ...state,
        budgets: state.budgets.filter(budget => budget.id !== action.payload),
      };
    default:
      return state;
  }
}

const AppContext = createContext();

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 初始化数据
  useEffect(() => {
    fetchInitialData();
  }, []);

  // 当选中账本变化时，获取对应账本的数据
  useEffect(() => {
    if (state.selectedLedger) {
      fetchLedgerData(state.selectedLedger.id);
    }
  }, [state.selectedLedger]);

  const fetchInitialData = async () => {
    dispatch({ type: AppActionTypes.SET_LOADING, payload: true });
    try {
      const [ledgersRes, tagsRes, categoriesRes] = await Promise.all([
        ledgerAPI.getAll(),
        tagAPI.getAll(),
        categoryAPI.getAll(),
      ]);

      dispatch({ type: AppActionTypes.SET_LEDGERS, payload: ledgersRes.data.data });
      dispatch({ type: AppActionTypes.SET_TAGS, payload: tagsRes.data.data });
      dispatch({ type: AppActionTypes.SET_CATEGORIES, payload: categoriesRes.data.data });

      // 选择第一个账本作为默认
      if (ledgersRes.data.data.length > 0) {
        dispatch({ type: AppActionTypes.SET_SELECTED_LEDGER, payload: ledgersRes.data.data[0] });
      }
    } catch (error) {
      dispatch({ type: AppActionTypes.SET_ERROR, payload: error.message });
    }
  };

  const fetchLedgerData = async (ledgerId) => {
    dispatch({ type: AppActionTypes.SET_LOADING, payload: true });
    try {
      const [accountsRes, transactionsRes, budgetsRes] = await Promise.all([
        ledgerAPI.getAccounts(ledgerId),
        ledgerAPI.getTransactions(ledgerId),
        ledgerAPI.getBudgets(ledgerId),
      ]);

      dispatch({ type: AppActionTypes.SET_ACCOUNTS, payload: accountsRes.data.data });
      dispatch({ type: AppActionTypes.SET_TRANSACTIONS, payload: transactionsRes.data.data });
      dispatch({ type: AppActionTypes.SET_BUDGETS, payload: budgetsRes.data.data });
    } catch (error) {
      dispatch({ type: AppActionTypes.SET_ERROR, payload: error.message });
    }
  };

  // 账本操作
  const createLedger = async (data) => {
    try {
      const res = await ledgerAPI.create(data);
      dispatch({ type: AppActionTypes.ADD_LEDGER, payload: res.data.data });
      if (!state.selectedLedger) {
        dispatch({ type: AppActionTypes.SET_SELECTED_LEDGER, payload: res.data.data });
      }
      return res.data;
    } catch (error) {
      console.error('Error creating ledger:', error);
      throw error;
    }
  };

  const updateLedger = async (id, data) => {
    try {
      const res = await ledgerAPI.update(id, data);
      dispatch({ type: AppActionTypes.UPDATE_LEDGER, payload: res.data.data });
      if (state.selectedLedger?.id === id) {
        dispatch({ type: AppActionTypes.SET_SELECTED_LEDGER, payload: res.data.data });
      }
      return res.data;
    } catch (error) {
      console.error('Error updating ledger:', error);
      throw error;
    }
  };

  const deleteLedger = async (id) => {
    try {
      await ledgerAPI.delete(id);
      dispatch({ type: AppActionTypes.DELETE_LEDGER, payload: id });
      if (state.selectedLedger?.id === id) {
        const remaining = state.ledgers.filter(l => l.id !== id);
        dispatch({ type: AppActionTypes.SET_SELECTED_LEDGER, payload: remaining[0] || null });
      }
    } catch (error) {
      console.error('Error deleting ledger:', error);
      throw error;
    }
  };

  // 账户操作
  const createAccount = async (data) => {
    try {
      const res = await accountAPI.create({ ...data, ledger_id: state.selectedLedger?.id });
      dispatch({ type: AppActionTypes.ADD_ACCOUNT, payload: res.data.data });
      return res.data;
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  };

  const updateAccount = async (id, data) => {
    try {
      const res = await accountAPI.update(id, data);
      dispatch({ type: AppActionTypes.UPDATE_ACCOUNT, payload: res.data.data });
      return res.data;
    } catch (error) {
      console.error('Error updating account:', error);
      throw error;
    }
  };

  const deleteAccount = async (id) => {
    try {
      await accountAPI.delete(id);
      dispatch({ type: AppActionTypes.DELETE_ACCOUNT, payload: id });
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  };

  // 分类操作
  const createCategory = async (data) => {
    try {
      const res = await categoryAPI.create(data);
      dispatch({ type: AppActionTypes.ADD_CATEGORY, payload: res.data.data });
      return res.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  };

  const updateCategory = async (id, data) => {
    try {
      const res = await categoryAPI.update(id, data);
      dispatch({ type: AppActionTypes.UPDATE_CATEGORY, payload: res.data.data });
      return res.data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  };

  const deleteCategory = async (id) => {
    try {
      await categoryAPI.delete(id);
      dispatch({ type: AppActionTypes.DELETE_CATEGORY, payload: id });
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  // 交易操作
  const createTransaction = async (data) => {
    try {
      const res = await transactionAPI.create({ ...data, ledger_id: state.selectedLedger?.id });
      dispatch({ type: AppActionTypes.ADD_TRANSACTION, payload: res.data.data });
      return res.data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  };

  const updateTransaction = async (id, data) => {
    try {
      const res = await transactionAPI.update(id, data);
      dispatch({ type: AppActionTypes.UPDATE_TRANSACTION, payload: res.data.data });
      return res.data;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await transactionAPI.delete(id);
      dispatch({ type: AppActionTypes.DELETE_TRANSACTION, payload: id });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  };

  // 标签操作
  const createTag = async (data) => {
    try {
      const res = await tagAPI.create(data);
      dispatch({ type: AppActionTypes.ADD_TAG, payload: res.data.data });
      return res.data;
    } catch (error) {
      console.error('Error creating tag:', error);
      throw error;
    }
  };

  const updateTag = async (id, data) => {
    try {
      const res = await tagAPI.update(id, data);
      dispatch({ type: AppActionTypes.UPDATE_TAG, payload: res.data.data });
      return res.data;
    } catch (error) {
      console.error('Error updating tag:', error);
      throw error;
    }
  };

  const deleteTag = async (id) => {
    try {
      await tagAPI.delete(id);
      dispatch({ type: AppActionTypes.DELETE_TAG, payload: id });
    } catch (error) {
      console.error('Error deleting tag:', error);
      throw error;
    }
  };

  // 预算操作
  const createBudget = async (data) => {
    try {
      const res = await budgetAPI.create({ ...data, ledger_id: state.selectedLedger?.id });
      dispatch({ type: AppActionTypes.ADD_BUDGET, payload: res.data.data });
      return res.data;
    } catch (error) {
      console.error('Error creating budget:', error);
      throw error;
    }
  };

  const updateBudget = async (id, data) => {
    try {
      const res = await budgetAPI.update(id, data);
      dispatch({ type: AppActionTypes.UPDATE_BUDGET, payload: res.data.data });
      return res.data;
    } catch (error) {
      console.error('Error updating budget:', error);
      throw error;
    }
  };

  const deleteBudget = async (id) => {
    try {
      await budgetAPI.delete(id);
      dispatch({ type: AppActionTypes.DELETE_BUDGET, payload: id });
    } catch (error) {
      console.error('Error deleting budget:', error);
      throw error;
    }
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        dispatch,
        createLedger,
        updateLedger,
        deleteLedger,
        createAccount,
        updateAccount,
        deleteAccount,
        createCategory,
        updateCategory,
        deleteCategory,
        createTransaction,
        updateTransaction,
        deleteTransaction,
        createTag,
        updateTag,
        deleteTag,
        createBudget,
        updateBudget,
        deleteBudget,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
