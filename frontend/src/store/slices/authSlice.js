import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '@/services/api';

export const loginUser = createAsyncThunk('auth/login', async (creds, { rejectWithValue }) => {
  try {
    const { data } = await authService.login(creds);
    localStorage.setItem('token', data.token);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Нэвтрэх үед алдаа гарлаа.');
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authService.logout();
  } catch {}
  localStorage.removeItem('token');
});

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const { data } = await authService.getMe();
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false,
    // If no token exists, we're immediately initialized (no fetchMe needed)
    initialized: !localStorage.getItem('token'),
    error: null,
  },
  reducers: {
    setToken: (state, action) => { state.token = action.payload; localStorage.setItem('token', action.payload); },
    logout:   (state) => { state.user = null; state.token = null; localStorage.removeItem('token'); },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending,  (s) => { s.loading = true; s.error = null; })
      .addCase(loginUser.fulfilled,(s, a) => { s.loading = false; s.token = a.payload.token; s.user = a.payload.data; })
      .addCase(loginUser.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(logoutUser.fulfilled, (s) => { s.user = null; s.token = null; })
      .addCase(fetchMe.pending,  (s) => { s.loading = true; })
      .addCase(fetchMe.fulfilled,(s, a) => { s.loading = false; s.user = a.payload; s.initialized = true; })
      .addCase(fetchMe.rejected, (s) => { s.loading = false; s.token = null; s.initialized = true; localStorage.removeItem('token'); });
  },
});

export const { setToken, logout, clearError } = authSlice.actions;
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => !!state.auth.token && !!state.auth.user;
export default authSlice.reducer;
