import {configureStore} from '@reduxjs/toolkit';
import userReducer from './userReducer';
import roomReducer from './roomReducer';

export default configureStore({
  reducer: {
    userReducer,
    roomReducer,
  },
});
