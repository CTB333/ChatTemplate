import React from 'react';
import {StyleSheet, TouchableOpacity, Text} from 'react-native';

const Button = ({text, touchProps, textProps}) => {
  return (
    <TouchableOpacity {...touchProps}>
      <Text {...textProps}>{text}</Text>
    </TouchableOpacity>
  );
};

export default Button;

const styles = StyleSheet.create({});
