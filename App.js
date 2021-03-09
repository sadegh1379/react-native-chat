// @refresh reset
import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect , useCallback } from "react";
import { Pressable, StyleSheet, Text, TextInput, View , Image } from "react-native";
import {GiftedChat} from 'react-native-gifted-chat';
import firebase from "firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC5PmIVGz1ZjsBDqXUzR4P21WSqyhOYPIU",
  authDomain: "chatapp-ad791.firebaseapp.com",
  projectId: "chatapp-ad791",
  storageBucket: "chatapp-ad791.appspot.com",
  messagingSenderId: "258224998723",
  appId: "1:258224998723:web:314c90e81765ab5a0f47f6",
};
if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const chatsRef = db.collection('chats');

export default function App() {
  const [user, setUser] = useState(null);
  const [name , setName]= useState('');
  const [messages , setMessages] = useState([]);

  useEffect(() => {
    readUser();
    const unsubscribe = chatsRef.onSnapshot((querySnapshot)=>{
      const messageFirestore = querySnapshot.docChanges()
      .filter(({type})=>type === 'added')
      .map(({doc})=>{
        const message = doc.data();
        return{...message , createdAt : message.createdAt.toDate()}
      }).sort((a,b)=> b.createdAt.getTime() - a.createdAt.getTime());
      appendMessages(messageFirestore);
    })
    return ()=>unsubscribe
  }, []);

  const appendMessages = useCallback((message)=>{
    setMessages((pm)=>GiftedChat.append(pm , message))
  },[messages])

  const readUser = async () => {
    const user = await AsyncStorage.getItem("user");
    if (user) {
      setUser(JSON.parse(user));
    }
  };

  const handlePress =async ()=>{
    const _id = Math.random().toString(36).substring(7);
    const user = {_id , name};
    await AsyncStorage.setItem('user' , JSON.stringify(user));
    setUser(user);
  }
  const handleSendM =async (message)=>{
    const writes = message.map((m)=> chatsRef.add(m));
    await Promise.all(writes); 

  }
  if(user){
    return(
     
        <GiftedChat  user={user} messages={messages} onSend={handleSendM}/>
    
    )
  }
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
       <View style={{width:'90%'  , justifyContent:'flex-start' , marginTop:200 ,alignItems:'center' ,flex:1 }}>
         <Image source={require('./assets/images/head.png')} style={styles.head} />
         <Text style={{fontSize:24 , fontWeight:'bold' , marginBottom:10 , color:'grey'}}>Live Chat</Text>
         <TextInput style={styles.myInput} value={name} onChangeText={(value)=>setName(value)} placeholder="Enter name..." />
         <Pressable onPress={handlePress} disabled={name.length > 0 ?false : true} style={styles.getChatB}>
           <Text style={{color:name.length > 0?'#fff' : 'grey' , fontWeight:'bold'}}>Get Chat</Text>
         </Pressable>
       </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  myInput:{
    backgroundColor:'#fff',
    padding:10,
    borderWidth : 1,
    borderColor:'grey',
    width:'90%',
    alignSelf:'center',
    borderRadius:10,

  },
  getChatB:{
    backgroundColor:'#333',
    color :'#fff',
    padding :10,
    borderRadius : 10,
    marginTop : 30,
    width : '50%',
    alignSelf:'center',
    justifyContent:'center',
    alignItems:'center',
    
  },
  head:{
    width : 100,
    height:100,
    borderRadius:100,
    marginBottom:20,
  }
});
