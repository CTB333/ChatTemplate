import {StyleSheet, Dimensions} from 'react-native';

const Dims = Dimensions.get('window');

const CSS = StyleSheet.create({
  page: {
    width: Dims.width,
    height: Dims.height,
  },
  flexPage: {
    flex: 1,
  },
  col: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
  },
  width: {
    width: '100%',
  },
  height: {
    height: '100%',
  },
  grow: {
    flexGrow: 1,
  },
  textInput: {
    fontSize: 18,
    padding: 5,
    borderColor: 'grey',
    borderWidth: 2,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  whiteText: {
    color: 'white',
  },
  materialInput: {
    fontSize: 18,
    padding: 0,
    margin: 0,
  },
  materialInputStyle: {
    padding: 0,
    margin: 0,
  },
  materialInputContainer: {
    padding: 10,
    margin: 0,
  },
});

export {CSS};
