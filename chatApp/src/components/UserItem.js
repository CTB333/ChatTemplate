import React from 'react';

import {ListItem, Icon} from '@react-native-material/core';

import {StyleSheet} from 'react-native';

const UserItem = ({title, onPress}) => {
  let personIcon = <Icon color="black" size={20} name="person" />;

  let chevronIcon = () => <Icon color="black" size={20} name="chevron-right" />;

  return (
    <ListItem
      title={title}
      leading={personIcon}
      trailing={chevronIcon}
      onPress={onPress}
    />
  );
};

export default UserItem;

const styles = StyleSheet.create({});
