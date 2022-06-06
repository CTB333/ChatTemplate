import {createSlice} from '@reduxjs/toolkit';

export const roomSlice = createSlice({
  name: 'room',
  initialState: {
    id: null,
    users: [],
    connected: [],
    name: null,
  },
  reducers: {
    openRoom: (state, action) => {
      let payload = action.payload;
      state.id = payload.id;
      state.name = payload.name;
      state.users = payload.users;
      state.connected = payload.connected;
    },
    closeRoom: state => {
      state.id = null;
      state.users = [];
      state.connected = [];
      state.name = null;
    },
  },
});

export const {openRoom, closeRoom} = roomSlice.actions;

export default roomReducer = roomSlice.reducer;
