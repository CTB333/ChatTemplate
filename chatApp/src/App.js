import React, {useEffect} from 'react';

import {IconComponentProvider} from '@react-native-material/core';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import AsyncStorage from '@react-native-async-storage/async-storage';

import store from './redux/store';
import {Provider} from 'react-redux';
import Socket from './redux/api';
import {updateRooms} from './redux/userReducer';

import {StyleSheet, LogBox} from 'react-native';
import {Start, SignUp, Rooms, Chat, Login} from './Screens/index';
import Header from './components/Header';

const Stack = createStackNavigator();

const App = () => {
  useEffect(() => {
    LogBox.ignoreLogs([
      'Sending `onAnimatedValueUpdate` with no listeners registered.',
    ]);

    return () => {
      Socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const loginById = async () => {
      try {
        let id = await AsyncStorage.getItem('id');
        Socket.emit('login_id', {id});
      } catch (e) {
        console.log('No Id Found');
      }
    };

    // Socket.emit('master_reset_rooms');

    Socket.on('connect', () => {
      loginById();
    });

    Socket.on('update_rooms', data => {
      let {rooms, id} = data;
      let {userReducer: user} = store.getState();
      console.log('Update Rooms Reveived');
      if (user?.id == id.toString()) {
        console.log('Updating ', user.userName, "'s rooms");
        store.dispatch(updateRooms(rooms));
      }
      console.log();
    });
  }, [Socket]);

  return (
    <Provider store={store}>
      <IconComponentProvider IconComponent={MaterialIcons}>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              cardOverlayEnabled: true,
              header: props => <Header {...props} />,
            }}
            initialRouteName="Start">
            <Stack.Screen
              name={'Start'}
              component={Start}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name={'SignUp'}
              children={props => <SignUp {...props} />}
              options={{
                headerShown: true,
                headerTitle: '',
              }}
            />
            <Stack.Screen
              name={'Login'}
              children={props => <Login {...props} />}
              options={{
                headerShown: true,
                headerTitle: '',
              }}
            />
            <Stack.Screen
              name={'Rooms'}
              children={props => <Rooms {...props} />}
              options={{
                headerShown: true,
                headerTitle: 'My Messages',
              }}
            />
            <Stack.Screen
              name={'Chat'}
              children={props => <Chat {...props} />}
              options={{
                gestureEnabled: false,
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </IconComponentProvider>
    </Provider>
  );
};

export default App;

const styles = StyleSheet.create({});
