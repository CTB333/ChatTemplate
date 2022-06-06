import React, {useState, useEffect} from 'react';

import {TextInput} from '@react-native-material/core';

import {StyleSheet, View, ScrollView} from 'react-native';
import {CSS} from '../../../Styles';
import UserItem from '../../../components/UserItem';

const Search = ({queryUsers, results, userId, userRooms, connect}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (query.length > 0) {
      queryUsers(query);
    }
  }, [query]);

  return (
    <View style={[CSS.page, {backgroundColor: 'white'}]}>
      <View style={[styles.input]}>
        <TextInput
          label="Search"
          value={query}
          onChangeText={text => setQuery(text)}
        />
      </View>
      <ScrollView style={[CSS.page]}>
        {results.map((v, i, _) => {
          let roomId = null;

          if (userRooms) {
            for (let room of userRooms) {
              for (let room2 of v.rooms) {
                if (room.roomId.toString() == room2.roomId.toString()) {
                  roomId = room.roomId;
                }
              }
            }
          }

          let data = {
            id1: userId,
            id2: v.id,
            roomId,
          };

          const onPress = () => {
            connect(data);
            setQuery('');
          };

          return (
            <UserItem key={data.id2} title={v.userName} onPress={onPress} />
          );
        })}
      </ScrollView>
    </View>
  );
};

export default Search;

const styles = StyleSheet.create({
  input: {
    padding: 15,
  },
});
