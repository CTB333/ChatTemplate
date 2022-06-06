import React, {useLayoutEffect, useEffect, useState, useRef} from 'react';

import {IconButton, Icon, useBoolean} from '@react-native-material/core';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

import {useSelector, useDispatch} from 'react-redux';
import {logout} from '../../redux/userReducer';
import {openRoom} from '../../redux/roomReducer';
import Socket from '../../redux/api';

import {StyleSheet, View, FlatList, Dimensions} from 'react-native';
import {CSS} from '../../Styles';
import Search from './components/Search';
import UserItem from '../../components/UserItem';

const {height} = Dimensions.get('window');

const Rooms = ({navigation}) => {
  const mounted = useRef(false);
  const dispatch = useDispatch();
  const user = useSelector(state => state.userReducer);
  const globalRoom = useSelector(state => state.roomReducer);

  const progress = useSharedValue(100);

  const [searchPage, setSearchPage] = useBoolean(false);
  const [results, setResults] = useState([]);
  const [friends, setFriends] = useState([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <IconButton
          style={{borderRadius: 10}}
          onPress={() => {
            Socket.emit('logout');
            dispatch(logout());
            navigation.reset({
              index: 0,
              routes: [{name: 'Start'}],
            });
          }}
          icon={() => <Icon name={'exit-to-app'} color={'black'} size={25} />}
        />
      ),
      headerRight: () => (
        <IconButton
          style={{borderRadius: 10}}
          onPress={() => {
            setSearchPage.toggle();
          }}
          icon={() => (
            <Icon
              name={searchPage ? 'minimize' : 'add'}
              color={'black'}
              size={25}
            />
          )}
        />
      ),
      headerTitle: user.userName,
    });
  }, [navigation, searchPage]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (searchPage) {
      progress.value = withTiming(0);
    } else {
      progress.value = withTiming(100);
    }
  }, [searchPage]);

  useEffect(() => {
    if (globalRoom.id) {
      setSearchPage.off();
      navigation.navigate('Chat');
    }
  }, [globalRoom]);

  useEffect(() => {
    formatFreinds();
  }, [user]);

  useEffect(() => {
    Socket.on('search_users_success', data => {
      if (mounted.current) {
        setResults(data.users);
      }
    });

    Socket.on('connect_users_success', data => {
      let {room} = data;
      dispatch(openRoom(room));
    });
  }, [Socket]);

  const formatFreinds = () => {
    let friendArr = [];
    if (user?.rooms) {
      for (let room of user.rooms) {
        let freindObj = {
          roomId: room.roomId,
          userName: room.other.userName,
          userId: room.other.userId,
        };
        friendArr.push(freindObj);
      }
    }
    setFriends(friendArr);
  };

  const bottomStyle = useAnimatedStyle(() => {
    let translateY = interpolate(progress.value, [0, 100], [-height, 0]);

    return {
      transform: [{translateY}],
    };
  });

  const queryUsers = query => {
    Socket.emit('search_users', {query});
  };

  const connectUsers = data => {
    Socket.emit('connect_users', data);
  };

  return (
    <View style={[CSS.page, CSS.col]}>
      <View style={[CSS.page]}>
        <FlatList
          style={[CSS.flexPage, {marginTop: 25}]}
          data={friends}
          keyExtractor={(v, i) => v.userId.toString()}
          renderItem={({item, index, key}) => {
            let data = {
              id1: user.id,
              id2: item.userId,
              roomId: item.roomId,
            };

            const onPress = () => {
              connectUsers(data);
            };

            return (
              <UserItem key={key} title={item.userName} onPress={onPress} />
            );
          }}
        />
      </View>
      <Animated.View style={[CSS.page, bottomStyle]}>
        <Search
          queryUsers={queryUsers}
          connect={connectUsers}
          results={results}
          userId={user.id}
          userRooms={user.rooms}
        />
      </Animated.View>
    </View>
  );
};

export default Rooms;

const styles = StyleSheet.create({
  blue: {
    backgroundColor: 'blue',
  },
  yellow: {
    backgroundColor: 'yellow',
  },
});
