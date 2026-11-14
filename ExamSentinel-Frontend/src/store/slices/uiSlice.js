// store/slices/uiSlice.js
import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    showLogoutConfirmation: false,
    showCalculator: false,

    // Loading states
    isNavigating: false,
    showConfirmDialog: false,
    confirmDialogData: null,

    // Sidebar
    sidebarCollapsed: false,

    // Notifications
    notifications: [],

    // Modal states
    showSubmitConfirmation: false,
    showTimeWarning: false,

    // Theme
    theme: "light",

    // Layout
    isMobile: false,
  },
  reducers: {
     setShowCalculator: (state, action) => {
      state.showCalculator = action.payload;
    },
    toggleCalculator: (state) => {
      state.showCalculator = !state.showCalculator;
    },
    showLogoutConfirmation: (state) => {
      state.showLogoutConfirmation = true;
    },
    hideLogoutConfirmation: (state) => {
      state.showLogoutConfirmation = false;
    },
    setNavigating: (state, action) => {
      state.isNavigating = action.payload;
    },

    showConfirmDialog: (state, action) => {
      state.showConfirmDialog = true;
      state.confirmDialogData = action.payload;
    },

    hideConfirmDialog: (state) => {
      state.showConfirmDialog = false;
      state.confirmDialogData = null;
    },

    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },

    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
    },

    addNotification: (state, action) => {
      const notification = {
        id: Date.now() + Math.random(),
        timestamp: Date.now(),
        ...action.payload,
      };
      state.notifications.push(notification);
    },

    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },

    clearNotifications: (state) => {
      state.notifications = [];
    },

    showSubmitConfirmation: (state) => {
      state.showSubmitConfirmation = true;
    },

    hideSubmitConfirmation: (state) => {
      state.showSubmitConfirmation = false;
    },

    showTimeWarning: (state) => {
      state.showTimeWarning = true;
    },

    hideTimeWarning: (state) => {
      state.showTimeWarning = false;
    },

    setTheme: (state, action) => {
      state.theme = action.payload;
    },

    setIsMobile: (state, action) => {
      state.isMobile = action.payload;
    },
  },
});

export const {
  setNavigating,
  showConfirmDialog,
  hideConfirmDialog,
  toggleSidebar,
  setSidebarCollapsed,
  addNotification,
  removeNotification,
  clearNotifications,
  showSubmitConfirmation,
  hideSubmitConfirmation,
  showTimeWarning,
  hideTimeWarning,
  setTheme,
  setIsMobile,
  showLogoutConfirmation,
  hideLogoutConfirmation,
  setShowCalculator, toggleCalculator
} = uiSlice.actions;

export default uiSlice.reducer;
