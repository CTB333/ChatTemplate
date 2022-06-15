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

  const [other, setOther] = useState(null);
  const [msg, setMsg] = useState('');
  const [days, setDays] = useState([]);
  const [lastReadIndex, setLastReadIndex] = useState({
    date: null,
    message: null,
  });

  useEffect(() => {
    navigation.setOptions({
      headerTitle: other?.userName ?? 'Chatting With...',
      headerLeft: backBtn,
    });
  }, [navigation, other]);

  useEffect(() => {
    mounted.current = true;
    Socket.emit('get_room_msg', {roomId: room.id});
    whoIsWho();
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    // console.log(JSON.stringify(room, null, 2));

    Socket.on('msg_room_success', messageRoomSuccess);

    Socket.on('get_user_data_success', data => {
      if (mounted.current) {
        setOther(data);
      }
    });
  }, [Socket]);

  let whoIsWho = () => {
    for (let userId of room?.users) {
      if (userId != user.id) {
        Socket.emit('get_user_data', {id: userId});
      }
    }
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

  const messageRoomSuccess = data => {
    let {messages: msgs} = data;
    let dateStrings = [];
    let messagesByDate = [];
    let lastRead = {
      date: null,
      message: null,
    };

    for (let message of msgs) {
      let date = new Date(message.date);
      let dateString = date.toLocaleDateString();
      if (dateStrings.includes(dateString)) {
        continue;
      } else {
        dateStrings.push(dateString);
      }
    }

    for (let dateString of dateStrings) {
      let messageArr = [];
      for (let message of msgs) {
        let date = new Date(message.date);
        if (dateString == date.toLocaleDateString()) {
          messageArr.push(message);
        }
      }
      messageArr.sort(sortMessages);
      let dateMessageObject = {
        date: dateString,
        messages: messageArr,
      };
      messagesByDate.push(dateMessageObject);
    }

    for (let i = 0; i < messagesByDate.length; i++) {
      let msgObj = messagesByDate[i];
      let messages = [...msgObj.messages];
      let userMessages = messages.map((v, j, _) => {
        if (v.from == user.id) {
          return v;
        } else {
          return null;
        }
      });

      console.log('Date ' + msgObj.date);
      console.log(messages.length);
      console.log(userMessages.length);
      userMessages.forEach((value, j, arr) => {
        if (!value) return;
        let last = null;
        let lastIndex = null;
        let y = j - 1;
        while (y >= 0 && !last) {
          if (arr[y]) {
            last = arr[y];
            lastIndex = y;
          }
          y--;
        }

        if (last?.read == true && value.read == false) {
          lastRead.date = i;
          lastRead.message = lastIndex;
          return;
        }

        if (j == 0 && value.read == false) {
          lastRead.date = i;
          lastRead.message = lastIndex;
          return;
        }

        if (
          i == messagesByDate.length - 1 &&
          j == arr.length - 1 &&
          value.read
        ) {
          lastRead.date = i;
          lastRead.message = j;
        }
      });

      console.log();
    }

    console.log('Last Read');
    console.log(lastRead);
    console.log();

    if (mounted.current) {
      setDays(messagesByDate);
      setLastReadIndex(lastRead);
    }
  };

  const disconnectFromRoom = () => {
    Socket.emit('leave_room', {id: user.id, roomId: room.id});
    dispatch(closeRoom());
    navigation.goBack();
  };

  const sendMessage = () => {
    if (msg.length <= 0) {
      return;
    }
    let message = {
      text: msg,
      from: user.id,
      date: new Date().toISOString(),
      read: false,
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

  const renderBubble = (item, index, arr, dateIndex) => {
    let isUser = item.from == user.id;
    let rootView = {};
    let bubble = {};
    let text = {};
    let readText = null;
    let date = new Date(item?.readAt);

    let next = arr[index + 1];

    if (next && next.from == item.from) {
      rootView.marginBottom = 5;
    }

    if (isUser) {
      rootView.alignItems = 'flex-end';
      bubble.backgroundColor = 'black';
      text.color = 'white';
    }

    if (index == lastReadIndex.message && dateIndex == lastReadIndex.date) {
      readText = `Read at ${date.toLocaleTimeString()}`;
    }

    return (
      <View key={item._id} style={[CSS.width, styles.msgCont, rootView]}>
        <View style={[CSS.col]}>
          <View style={[CSS.center, styles.msgBox, bubble]}>
            <Text style={[styles.msgText, text]}>{item.text}</Text>
          </View>
        </View>
        {readText ? <Text style={[styles.readText]}>{readText}</Text> : null}
      </View>
    );
  };

  return (
    <View style={[CSS.flexPage]}>
      <View style={[styles.scrollBox]}>
        <FlatList
          inverted
          data={[...days].reverse()}
          keyExtractor={(v, i) => v.date}
          ListHeaderComponent={<View style={[styles.spacer]} />}
          renderItem={({item, index, key}) => {
            let messages = item.messages;

            return (
              <View key={key} style={[CSS.width, styles.fullDayCont]}>
                <View style={[CSS.width, CSS.center, styles.dateBox]}>
                  <Text style={[styles.dateText]}>{item.date}</Text>
                </View>
                <View style={[CSS.width]}>
                  {messages.map((v, i, arr) => renderBubble(v, i, arr, index))}
                </View>
              </View>
            );
          }}
          style={[CSS.flexPage, styles.scroll]}
        />
      </View>
      <View
        style={[
          CSS.width,
          CSS.center,
          styles.footer,
          {paddingBottom: insets.bottom},
        ]}>
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
            onSubmitEditing={sendMessage}
          />
        </View>
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
  spacer: {
    alignSelf: 'flex-end',
    height: 50,
  },
  fullDayCont: {
    paddingVertical: 15,
  },
  dateBox: {
    borderBottomColor: '#32404A',
    borderBottomWidth: 1,
    padding: 10,
    marginVertical: 15,
  },
  dateText: {
    color: '#32404A',
    fontSize: 15,
  },

  footer: {
    padding: 10,
    backgroundColor: '#32404A',
    borderRadius: 45,
    borderBottomEndRadius: 0,
    borderBottomLeftRadius: 0,
  },
  readText: {
    color: '#32404A',
    fontSize: 15,
    marginTop: 5,
  },
  input: {
    padding: 15,
  },

  msgCont: {
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  msgBox: {
    position: 'relative',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 40,
  },
  msgText: {
    color: 'black',
    fontSize: 20,
  },
});
