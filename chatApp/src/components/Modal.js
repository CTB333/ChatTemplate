import React from 'react';

import {Shadow} from 'react-native-shadow-2';

import {StyleSheet, View} from 'react-native';
import {CSS} from '../Styles';

const Modal = ({containerStyle, shadowProps, children, viewStyle}) => {
  return (
    <Shadow
      distance={15}
      containerViewStyle={[styles.defaultShadow, ...containerStyle]}
      viewStyle={[CSS.width, CSS.flexPage]}
      {...shadowProps}>
      <View style={[CSS.width, CSS.height, ...viewStyle]}>{children}</View>
    </Shadow>
  );
};

export default Modal;

const styles = StyleSheet.create({
  defaultShadow: {
    width: '80%',
    height: '30%',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
});
