import { Image, StyleSheet, Platform, View } from 'react-native';
import HomeScreen from '@/components/HomeScreen';
import MessagesScreen from '@/components/MessageScreen';

export default function Index() {
  
  return (
   <View>
      <HomeScreen navigation={undefined} />
      {/* <MessagesScreen navigation={undefined}/> */}
   </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
