import React, {useEffect, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {connectAccount, logout} from '../../redux/userReducer';
import Socket from '../../redux/api';
import {StyleSheet, Text, View} from 'react-native';
import {CSS} from '../../Styles';
import Button from '../../components/Button';
import Modal from '../../components/Modal';

const Start = ({navigation}) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.userReducer);

  useEffect(() => {
    Socket.on('login_id_success', data => {
      dispatch(connectAccount(data));
    });
    Socket.on('login_id_err', async () => {
      dispatch(logout());
      console.log('Clear Async Storage');
    });
  }, [Socket]);

  useEffect(() => {
    if (user?.id) {
      navigation.replace('Rooms');
    }
  }, [user]);

  const loginTouch = {
    onPress: () => {
      navigation.replace('Login');
    },
    style: [CSS.center, CSS.width, styles.btn, styles.login],
  };
  const loginText = {
    style: [CSS.whiteText, styles.text],
  };

  const signTouch = {
    onPress: () => {
      navigation.replace('SignUp');
    },
    style: [CSS.center, CSS.width, styles.btn, styles.signUp],
  };
  const signText = {
    style: [styles.text],
  };

  const createBtnProps = () => {};

  return (
    <View style={[CSS.page, CSS.center]}>
      <Modal
        containerStyle={[styles.shadow]}
        viewStyle={[CSS.center, styles.modal]}>
        <View style={[CSS.flexPage, CSS.width, CSS.col, CSS.center]}>
          <View style={[{flex: 1}]}>
            <Text style={styles.title}>Welcome To Privacy</Text>
          </View>
          <View style={[CSS.width, {flex: 1}]}>
            <Button
              text={'Login'}
              touchProps={loginTouch}
              textProps={loginText}
            />
            <Button
              text={'Sign Up'}
              touchProps={signTouch}
              textProps={signText}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Start;

const styles = StyleSheet.create({
  shadow: {
    height: '25%',
  },
  modal: {
    padding: 15,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  btn: {
    borderRadius: 10,
    paddingVertical: 10,
  },
  login: {
    backgroundColor: 'black',
  },
  signUp: {
    marginTop: 15,
    borderWidth: 2,
    borderColor: 'black',
  },
  text: {
    fontSize: 20,
  },
});
