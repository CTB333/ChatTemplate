import React, {useRef, useLayoutEffect, useEffect, useState} from 'react';

import {TextInput, IconButton, Icon} from '@react-native-material/core';

import Socket from '../../redux/api';
import {useDispatch, useSelector} from 'react-redux';
import {closeRoom} from '../../redux/roomReducer';

import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {StyleSheet, Text, View, FlatList} from 'react-native';
import {CSS} from '../../Styles';

const Chat = ({navigation}) => {
  const insets = useSafeAreaInsets();

  const mounted = useRef(false);
  const dispatch = useDispatch();
  const user = useSelector(state => state.userReducer);
  const room = useSelector(state => state.roomReducer);

  const [msg, setMsg] = useState('');
  const [messages, setMessages] = useState([]);

  useLayoutEffect(() => {
    let users = whoIsWho();

    navigation.setOptions({
      headerTitle: users.other.userName,
      headerLeft: backBtn,
    });
  }, [navigation]);

  useEffect(() => {
    mounted.current = true;
    Socket.emit('get_room_msg', {roomId: room.id});
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    // console.log(JSON.stringify(room, null, 2));

    Socket.on('msg_room_success', data => {
      let {messages: msgs} = data;
      msgs.sort((a, b) => sortMessages(a, b));
      if (mounted.current) {
        setMessages(msgs);
      }
    });
  }, [Socket]);

  let whoIsWho = () => {
    let me = {};
    let other = {};

    for (let u of room.users) {
      if (user.id == u.userId.toString()) {
        me = u;
      } else {
        other = u;
      }
    }
    return {
      me,
      other,
    };
  };

  let backBtn = () => (
    <IconButton
      onPress={disconnectFromRoom}
      icon={<Icon name="chevron-left" color="black" size={25} />}
    />
  );

  let sendBtn = () => (
    <View style={{backgroundColor: 'green', borderRadius: 50}}>
      <IconButton
        onPress={sendMessage}
        color={'white'}
        icon={<Icon name="arrow-upward" color="white" size={25} />}
      />
    </View>
  );

  const disconnectFromRoom = () => {
    dispatch(closeRoom());
    navigation.goBack();
  };

  const sendMessage = () => {
    if (msg.length <= 0) {
      return;
    }
    let message = {
      text: msg,
      date: new Date().toISOString(),
      userId: user.id,
    };
    let data = {
      roomName: room.name,
      message,
    };

    Socket.emit('msg_room', data);

    setMsg('');
  };

  const sortMessages = (a, b) => {
    let d1 = a.date;
    let d2 = b.date;

    let date1 = new Date(d1);
    let date2 = new Date(d2);

    return date1.getTime() - date2.getTime();
  };

  return (
    <View style={[CSS.flexPage, {paddingBottom: insets.bottom}]}>
      <View style={[styles.scrollBox]}>
        <FlatList
          data={messages}
          keyExtractor={(v, i) => v._id}
          renderItem={({item, index, key}) => {
            let rootView = {};
            let bubble = {};
            let text = {};

            let next = messages[index + 1];

            if (next && next.userId == item.userId) {
              rootView.marginBottom = 5;
            }

            if (item.userId == user.id) {
              rootView.alignItems = 'flex-end';
              bubble.backgroundColor = 'black';
              text.color = 'white';
            }

            return (
              <View key={key} style={[CSS.width, styles.msgCont, rootView]}>
                <View style={[CSS.center, styles.msgBox, bubble]}>
                  <Text style={[styles.msgText, text]}>{item.text}</Text>
                </View>
              </View>
            );
          }}
          style={[CSS.flexPage, styles.scroll]}
        />
      </View>
      <View style={[CSS.width, styles.input]}>
        <TextInput
          variant="outlined"
          color="black"
          value={msg}
          onChangeText={txt => setMsg(txt)}
          style={[CSS.materialInputStyle]}
          inputContainerStyle={[CSS.materialInputContainer]}
          inputStyle={[CSS.materialInput]}
          trailing={sendBtn}
          onEndEditing={sendMessage}
        />
      </View>
    </View>
  );
};

export default Chat;

const styles = StyleSheet.create({
  scrollBox: {
    flexGrow: 1,
  },
  scroll: {
    padding: 15,
  },
  input: {
    padding: 15,
  },
  msgCont: {
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  msgBox: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 40,
  },
  msgText: {
    color: 'black',
    fontSize: 20,
  },
});
