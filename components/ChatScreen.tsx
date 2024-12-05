// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   StyleSheet,
//   TouchableOpacity,
//   FlatList,
//   Dimensions,
//   Animated,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';

// interface ChatScreenProps {
//   route: any; // Receive the selected contact
//   navigation: any;
// }

// const ChatScreen: React.FC<ChatScreenProps> = ({ route }) => {
//   const { contact } = route.params; // Get the selected contact
//   const [message, setMessage] = useState<string>('');
//   const [messages, setMessages] = useState<string[]>([]);
//   const [isMinimized, setIsMinimized] = useState(false);
//   const [isVisible, setIsVisible] = useState(true);
//   const [animation] = useState(new Animated.Value(0));

//   const handleSendMessage = (): void => {
//     if (message.trim()) {
//       setMessages([...messages, message]);
//       setMessage('');
//     }
//   };

//   const toggleMinimize = () => {
//     Animated.timing(animation, {
//       toValue: isMinimized ? 0 : 1, // Animate between minimized (1) and maximized (0)
//       duration: 300,
//       useNativeDriver: false,
//     }).start();
//     setIsMinimized(!isMinimized);
//   };

//   const closeChat = () => {
//     setIsVisible(false); // Hide the chat
//   };

//   // Calculate dynamic styles for the chat window
//   const chatHeight = animation.interpolate({
//     inputRange: [0, 1],
//     outputRange: [400, 50], // Full height when maximized, 50 when minimized
//   });

//   if (!isVisible) {
//     return null; // Don't render the chat if it's closed
//   }

//   return (
//     <Animated.View style={[styles.container, { height: chatHeight }]}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={toggleMinimize} style={styles.iconButton}>
//           <Ionicons
//             name={isMinimized ? 'chevron-up' : 'chevron-down'}
//             size={24}
//             color="#000"
//           />
//         </TouchableOpacity>
//         <Text style={styles.contactName}>{contact.name}</Text>
//         <TouchableOpacity onPress={closeChat} style={styles.iconButton}>
//           <Ionicons name="close" size={24} color="#000" />
//         </TouchableOpacity>
//       </View>

//       {!isMinimized && (
//         <>
//           <FlatList
//             data={messages}
//             renderItem={({ item }) => <Text style={styles.message}>{item}</Text>}
//             keyExtractor={(item, index) => index.toString()}
//             style={styles.messagesList}
//           />
//           <View style={styles.inputContainer}>
//             <TextInput
//               style={styles.input}
//               placeholder="Type a message"
//               value={message}
//               onChangeText={setMessage}
//             />
//             <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
//               <Ionicons name="send" size={24} color="#FFF" />
//             </TouchableOpacity>
//           </View>
//         </>
//       )}
//     </Animated.View>
//   );
// };

// const { width } = Dimensions.get('window'); // Get screen width for responsive design

// const styles = StyleSheet.create({
//   container: {
//     position: 'absolute',
//     bottom: 20,
//     right: 20,
//     width: width - 40, // Responsive width
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     overflow: 'hidden',
//     elevation: 5, // Shadow for Android
//     shadowColor: '#000', // Shadow for iOS
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     padding: 10,
//     backgroundColor: '#f4f4f4',
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//   },
//   iconButton: {
//     padding: 5,
//   },
//   contactName: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     flex: 1,
//     textAlign: 'center',
//   },
//   messagesList: {
//     flex: 1,
//     padding: 10,
//   },
//   message: {
//     padding: 10,
//     marginBottom: 10,
//     backgroundColor: '#e0e0e0',
//     borderRadius: 10,
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderTopWidth: 1,
//     borderTopColor: '#ccc',
//     padding: 10,
//   },
//   input: {
//     flex: 1,
//     padding: 8,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 25,
//   },
//   sendButton: {
//     backgroundColor: '#4CAF50',
//     borderRadius: 25,
//     padding: 10,
//     marginLeft: 10,
//   },
// });

// export default ChatScreen;
