import React, {useLayoutEffect, useState} from 'react';

import {Pressable} from '@react-native-material/core';

import {AppBar} from '@react-native-material/core';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {getHeaderTitle} from '@react-navigation/elements';

import {StyleSheet, Text, View} from 'react-native';

const Header = ({navigation, route, options, back}) => {
  const insets = useSafeAreaInsets();
  const title = getHeaderTitle(options, route.name);

  const [props, setProps] = useState({});

  useLayoutEffect(() => {
    setProps(getAppBarProps());
  }, [navigation, options, route]);

  const getAppBarProps = () => {
    switch (route.name) {
      case 'Start':
        return {};
      case 'SignUp':
        return {
          leading: () => (
            <Pressable
              style={[styles.loginPress]}
              onPress={() => {
                navigation.replace('Login');
              }}>
              <Text style={[styles.login]}>Login</Text>
            </Pressable>
          ),
          color: 'black',
        };
      case 'Login':
        return {
          leading: () => (
            <Pressable
              style={[styles.loginPress]}
              onPress={() => {
                navigation.replace('SignUp');
              }}>
              <Text style={[styles.login]}>Sign Up</Text>
            </Pressable>
          ),
          color: 'black',
        };
      case 'Rooms':
        return {
          centerTitle: true,
          leading: options.headerLeft,
          trailing: options.headerRight,
          color: 'white',
        };
      case 'Chat':
        return {
          centerTitle: true,
          leading: options.headerLeft,
          color: 'white',
        };
      default:
        return {};
    }
  };

  return (
    <AppBar
      title={title}
      style={[{paddingTop: insets.top, paddingBottom: 10}]}
      {...props}
    />
  );
};

export default Header;

const styles = StyleSheet.create({
  loginPress: {
    marginLeft: 15,
  },
  login: {
    fontSize: 24,
    color: 'white',
  },
});
