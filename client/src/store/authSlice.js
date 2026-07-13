import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../components/axiosInstance';

// Loads the current user from a saved token on app start
export const loadProfile = createAsyncThunk('auth/loadProfile', async (_, { rejectWithValue }) => {
  const token = localStorage.getItem('sbstocks_token');
  if (!token) return rejectWithValue('No token');

  try {
    const { data } = await axiosInstance.get('/users/me');
    return data.user;
  } catch (err) {
    localStorage.removeItem('sbstocks_token');
    return rejectWithValue(err.response?.data?.message || 'Session expired');
  }
});

// Re-fetches the user (e.g. after a trade or wallet action changes the balance)
export const refreshUser = createAsyncThunk('auth/refreshUser', async () => {
  const { data } = await axiosInstance.get('/users/me');
  return data.user;
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: true,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { token, user } = action.payload;
      localStorage.setItem('sbstocks_token', token);
      state.user = user;
    },
    logout: (state) => {
      localStorage.removeItem('sbstocks_token');
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(loadProfile.rejected, (state) => {
        state.user = null;
        state.loading = false;
      })
      .addCase(refreshUser.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
