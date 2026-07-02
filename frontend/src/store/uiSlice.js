import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
  const saved = localStorage.getItem('theme');
  if (saved) return saved;
  // Default to dark mode for premium Shopify/Linear developer feel
  return 'dark';
};

const initialState = {
  theme: getInitialTheme(),
  activeBranch: JSON.parse(localStorage.getItem('activeBranch')) || null,
  searchQuery: '',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);
      // Toggle class on document element
      if (state.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', state.theme);
      if (state.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    setActiveBranch: (state, action) => {
      state.activeBranch = action.payload;
      localStorage.setItem('activeBranch', JSON.stringify(action.payload));
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    }
  }
});

export const { toggleTheme, setTheme, setActiveBranch, setSearchQuery } = uiSlice.actions;
export default uiSlice.reducer;
