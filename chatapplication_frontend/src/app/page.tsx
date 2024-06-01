'use client';
import React, { useEffect, useState } from 'react';
import Chat from './chats/page';
import Login from './login/page';

const Home: React.FC = () => {
  const [auth, setAuth] = useState<boolean>(false);
  const [profile,setProfile]=useState<string>('')


  const toggleAuth = () => {
    setAuth((prevAuth) => !prevAuth);
  };
  useEffect(()=>{
    const a=localStorage.getItem('username')
    if(a!=null){
      console.log(a.length)
     setAuth(true)
      setProfile(a)
    }
    console.log(auth)
    console.log(a,'a')
  },[])

  return (
    auth ? (
      <Chat auth={auth} toggleAuth={toggleAuth} profile={profile} setProfile={setProfile} />
    ) : (
      <Login auth={auth} toggleAuth={toggleAuth} profile={profile} setProfile={setProfile} />
    )
  );
};

export default Home;

