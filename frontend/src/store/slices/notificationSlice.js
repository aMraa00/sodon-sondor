import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationService } from '@/services/api';

export const fetchNotifications = createAsyncThunk('notifications/fetch', async () => {
  const { data } = await notificationService.getAll();
  return data;
});

export const markNotifRead = createAsyncThunk('notifications/markRead', async (id) => {
  await notificationService.markRead(id);
  return id;
});

export const markAllNotifRead = createAsyncThunk('notifications/markAllRead', async () => {
  await notificationService.markAllRead();
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { items: [], unreadCount: 0, loading: false },
  reducers: {
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (s, a) => {
        s.items = a.payload.data;
        s.unreadCount = a.payload.unreadCount;
        s.loading = false;
      })
      .addCase(fetchNotifications.pending, (s) => { s.loading = true; })
      .addCase(markNotifRead.fulfilled, (s, a) => {
        const n = s.items.find((i) => i._id === a.payload);
        if (n && !n.isRead) { n.isRead = true; s.unreadCount = Math.max(0, s.unreadCount - 1); }
      })
      .addCase(markAllNotifRead.fulfilled, (s) => {
        s.items.forEach((i) => { i.isRead = true; });
        s.unreadCount = 0;
      });
  },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
