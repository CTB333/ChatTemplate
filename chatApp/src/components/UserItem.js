import React from 'react';

import {ListItem, Icon, Badge} from '@react-native-material/core';

import {StyleSheet, View} from 'react-native';
import {CSS} from '../Styles';

const UserItem = ({title, banner, onPress}) => {
  let personIcon = (
    <View style={[CSS.center, styles.iconCont]}>
      <Icon color="black" size={30} name="person" />
      {banner ? (
        <Badge style={[styles.badge]} visible={true} color={'#32404A'} />
      ) : null}
    </View>
  );

  let chevronIcon = () => <Icon color="black" size={20} name="chevron-right" />;

  return (
    <ListItem
      title={title}
      leadingMode="avatar"
      leading={personIcon}
      trailing={chevronIcon}
      onPress={onPress}
    />
  );
};

export default UserItem;

const styles = StyleSheet.create({
  iconCont: {
    position: 'relative',
    padding: 10,
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 20,
  },
});
