import React, {useLayoutEffect, useState, useEffect, useRef} from 'react';

import {useSelector, useDispatch} from 'react-redux';
import {connectAccount} from '../../redux/userReducer';
import Socket from '../../redux/api';

import {StyleSheet, Text, View, TextInput, StatusBar} from 'react-native';
import {CSS} from '../../Styles';
import Button from '../../components/Button';
import Modal from '../../components/Modal';

const Login = ({navigation}) => {
  const mount = useRef(false);

  const dispatch = useDispatch();
  const user = useSelector(state => state.userReducer);

  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');

  const [err, setErr] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Button
          text={'Sign Up'}
          touchProps={{
            style: [{marginLeft: 20}],
            onPress: () => {
              navigation.replace('SignUp');
            },
          }}
          textProps={{style: [{fontSize: 15, color: 'blue'}]}}
        />
      ),
    });
  }, [navigation]);

  useEffect(() => {
    mount.current = true;

    return () => {
      mount.current = false;
    };
  }, []);

  useEffect(() => {
    if (user?.id) {
      navigation.replace('Rooms');
    }
  }, [user]);

  useEffect(() => {
    Socket.on('login_success', data => {
      dispatch(connectAccount(data));
    });

    Socket.on('login_err', data => {
      setErr(data.err);
    });
  }, [Socket]);

  const login = () => {
    if (userName.length < 0 || password.length < 0) {
      return;
    }
    console.log('login');
    Socket.emit('login', {userName, password});
  };

  const touch = {
    onPress: login,
    style: [CSS.width, CSS.center, styles.btn],
  };
  const text = {
    style: [CSS.whiteText, styles.text],
  };

  return (
    <View style={[CSS.center, CSS.page]}>
      <StatusBar barStyle="light-content" />
      <Modal
        containerStyle={[styles.shadow]}
        viewStyle={[CSS.center, {padding: 15}]}>
        <Text style={{fontSize: 24, fontWeight: '700'}}>Login</Text>
        <Text style={{fontSize: 18, color: 'red', flexGrow: 1, marginTop: 15}}>
          {err}
        </Text>
        <View style={[CSS.col, CSS.width]}>
          <Text>User Name</Text>
          <TextInput
            style={[CSS.textInput, {borderRadius: 5, marginTop: 10}]}
            value={userName}
            onChangeText={setUserName}
          />
        </View>
        <View style={[CSS.col, CSS.width, {marginTop: 15}]}>
          <Text>Password</Text>
          <TextInput
            style={[CSS.textInput, {borderRadius: 5, marginTop: 10}]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        <Button text={'Login'} touchProps={touch} textProps={text} />
      </Modal>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  shadow: {
    height: '40%',
  },
  btn: {
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 15,
    backgroundColor: 'black',
  },

  text: {
    fontSize: 20,
  },
});
