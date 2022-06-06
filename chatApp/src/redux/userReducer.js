import {createSlice} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    userName: null,
    rooms: [],
    id: null,
  },
  reducers: {
    connectAccount: (state, action) => {
      let payload = action.payload;
      state.id = payload.id;
      state.userName = payload.userName;
      state.rooms = payload.rooms;
      AsyncStorage.setItem('id', payload.id).catch(e => {
        console.log('saving error');
      });
    },
    logout: state => {
      state.id = null;
      state.rooms = [];
      state.userName = null;
      AsyncStorage.removeItem('id');
    },
    updateRooms: (state, action) => {
      state.rooms = action.payload;
    },
  },
});

export const {connectAccount, logout, updateRooms} = userSlice.actions;

export default userReducer = userSlice.reducer;
