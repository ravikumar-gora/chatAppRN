// @refresh reset
import { StatusBar } from 'expo-status-bar';
import React, {useState,useEffect,useCallback} from 'react';
import {GiftedChat, Bubble} from 'react-native-gifted-chat';
import AsyncStorage from '@react-native-community/async-storage';
import {Button,StyleSheet,TextInput, View} from 'react-native';
import * as firebase from 'firebase';
import 'firebase/firestore';
import {LogBox} from 'react-native'
LogBox.ignoreAllLogs(true)

const firebaseConfig = {
  apiKey: "AIzaSyBXkny2UmqxnXn4BwYPtGYa4HScmr-Q73w",
  authDomain: "chatappgit-8e1a4.firebaseapp.com",
  projectId: "chatappgit-8e1a4",
  storageBucket: "chatappgit-8e1a4.appspot.com",
  messagingSenderId: "49400717083",
  appId: "1:49400717083:web:810a3d0ef3a944b9f63dbe",
  measurementId: "G-GRD7F7WC85"
  };
  
if(firebase.apps.length==0){
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore()
const chatsRef = db.collection('chats')

export default function App() {


  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [messages, setMessages] = useState([]);  
  useEffect (()=>{
    readUser()
    const unsubscribe = chatsRef.onSnapshot(querySnapshot=>{
      const messagesFirestore = querySnapshot.docChanges().filter((
        {type})=> type=='added').map(({doc})=>{
          const message = doc.data()
          return {...message,createdAt:message.createdAt.toDate()}
        }).sort((a,b) =>b.createdAt.getTime()-a.createdAt.getTime())
       appendMessages(messagesFirestore)
    })
    return () => unsubscribe()
  },[])

  const appendMessages = useCallback((messages)=>{
    setMessages((previousMessages) => GiftedChat.append(previousMessages,messages))
  },[messages])

  async function readUser(){
    const user = await AsyncStorage.getItem('user')
    if(user){
      setUser(JSON.parse(user))
      
    }
  }
  async function handlePress(){
    const _id = Math.random().toString(36).substring(7)
    const user = {_id,name}
    await AsyncStorage.setItem('user',JSON.stringify(user))
    setUser(user);
  }

  async function handleSend(messages){
    const writes = messages.map(m => chatsRef.add(m))
    await Promise.all(writes)
  }
  if(!user){
    return <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Enter your name" 
      onChangeText={setName}
      value={name}/>
      <Button title ="Start Chat" onPress={handlePress} style={styles.button}></Button>
    </View>
  }
 return   <GiftedChat messages={messages} showUserAvatar={true} user={user} onSend={handleSend}
  renderBubble={props => {
    return (
      <Bubble
        {...props}
        listViewProps={{
          style: {
            backgroundColor: 'red',
          },
        }}
        textStyle={{
          right: {
            color: 'white',
          },
          left: {
            color: 'white',
          },
        }}
        wrapperStyle={{
          right: {
            backgroundColor: '#80286c',
          },
          left:{
            backgroundColor:'#0b6134'
          }
        }}
      />
    );
  }}
  />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding:20,
  },
  input:{
    backgroundColor:'#FFF',
    borderColor:'black',
    padding:15,
    borderRadius:50,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-around',
    width:'65%',
    marginBottom:20,
    paddingVertical:15,
    paddingHorizontal:15,
    borderWidth:1,
  }
});
