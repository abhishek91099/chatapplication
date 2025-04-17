'use client';
import { url } from 'inspector';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import 'tailwindcss/tailwind.css';

// const socket = io('http://192.168.45.1:5000'); 
// Adjust the URL as needed

interface Message {
  id: number;
  sender?: string;
  receiver?: string;
  message: string;
  status?: 'sending' | 'sent' | 'failed';
}

interface User {
  id: number;
  username: string;
}

interface ChatProps { 
  [key: string]: any | boolean | (() => void) | string; // Adjust the types as needed
  auth: boolean;
  toggleAuth: () => void;
  profile: string;
  setProfile: (profile: string) => void;
}
const Chat: React.FC<ChatProps> = ({ auth, toggleAuth, profile, setProfile }) => {
  const [text, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [side, setSide] = useState<User[]>([]);
  const [chat, setChat] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const [acknowledgment, setAcknowledgment] = useState(null);
  const [online, setOnline] = useState<Set<string>>(new Set());
  const socket_ref=useRef<io|null>() 


  const fetch_users = async () => {
    try {
      const response = await fetch('http://172.20.10.2:5000/users', {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        setSide(data);
      }
    } catch (error) {
      console.error("Error during fetching users:", error);
    }
  };

  const fetch_messages = async (selectedUser: string) => {
    try {
      const response = await fetch('http://172.20.10.2:5000/message', {
        method: "POST",
        body: JSON.stringify({ sender: profile }),
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } 
      
    } catch (error) {
      console.error("Error during fetching messages:", error);
    }
  };

  useEffect(() => {
    console.log('Messages updated:', messages);
    // Scroll to the end of the messages whenever they update
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    
    const socket = io('http://172.20.10.2:5000', {
      query: { id: profile }
    });
    socket.on('connect', () => {
      console.log(socket.id); // Logs the socket ID when connected
    });
    socket_ref.current=socket

    socket.on('disconnect', () => {
      console.log('disconnected'); // Logs 'disconnected' when the connection is lost
    });
    socket.on('online_users',(users)=>{
      setOnline(prevOnline => new Set([...prevOnline, ...users]));

    })
    socket.on('user_disconnected',(userid)=>{
      setOnline(prevOnline => {
        const newOnline = new Set(prevOnline);
        newOnline.delete(userid);
        return newOnline;
      });
    

    })

    

    socket.on('message' ,(message: { from: string, text: string },ack) => {
      ack()
      console.log(message, 'got from the back');
      setMessages(prevMessages => [
        ...prevMessages,
        { id: new Date().getTime(), sender: message.from, message: message.text}
      ])
      // socket.emit('ack',{Response:true,from:profile,to:message.from})
      console.log(messages, 'updated');
      console.log('done')
    });
   
    
    

    fetch_users();

    // Cleanup listeners on component unmount
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('message');
      socket.off('user_disconnected');
      socket.off('online_users');

    };
  }, []);

  useEffect(() => {
    console.log('State after update:', online); // Log state changes
  }, [online]);
  // useEffect(()=>{
  //   socket.on('ack', (response) => {
  //     setAcknowledgment(response.success);
  //     console.log(response.id,'hereebady')
  //     setMessages(prevMessages =>
  //       prevMessages.map(msg =>
  //         msg.id === response.id ? { ...msg, status: 'sent' } : msg
  //       ))
  //   });
  //   return ()=>{
  //     socket.off('ack');
  //   }
    

  // })
  useEffect(() => {
    socket_ref.current.on('ack', (response) => {
      setAcknowledgment(response.success);
      console.log(response.id, 'hereebady');
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === response.id &&
          msg.sender === profile &&
          msg.receiver === chat
            ? { ...msg, status: response.success ? 'sent' : 'failed' }
            : msg
        )
      );
    });
    return () => {
      socket_ref.current.off('ack');
    };
  }, [profile, chat]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      const newMessage: Message = { id: new Date().getTime(), sender: profile, message: text, receiver: chat, status: 'sending' };
      setMessages(prevMessages => [...prevMessages, newMessage]);
  
      socket_ref.current.emit('message', { to: chat, message: text, from: profile,id:new Date().getTime() })
      setMessage('')
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as any); // Type assertion since handleSubmit expects a FormEvent
    }
  };

  const logout = () => {
    toggleAuth();
    localStorage.removeItem('username');
    setProfile('');
  };

  const handle_side = (item: User) => {
    setChat(item.username);
    fetch_messages(item.username);
  };

  // Filtered user list based on search query
  const filteredUsers = side.filter(user => user.username.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="h-screen w-screen flex">
      {auth ? (
        <div className="flex w-full h-full">
          <div className="w-full sm:w-1/4 md:w-1/5 lg:w-1/6 bg-gray-800 text-white p-3 flex flex-col">
            <h1 className="text-lg font-bold mb-4">Chats</h1>
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 mb-4 rounded-lg bg-gray-700 text-white outline-none"
            />
            <div className="flex flex-col space-y-2 overflow-auto">
              {filteredUsers.map((item) => {
                if (item.username !== profile) {
                  return (
                    <div
                      key={item.id}
                      onClick={() => handle_side(item)}
                      className="cursor-pointer p-2 rounded-lg hover:bg-gray-700"
                    >
                      {item.username ? item.username : 'No username'} <span className={`inline-block h-3 w-3 rounded-full ml-2 ${online.has(item.username) ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
          <div className="flex-1 flex flex-col h-full">
            <div className="flex items-center justify-between bg-gray-700 p-5 text-white">
            <div className="p-5">
                {chat ? (
                  <div>
                    <h1>
                      {chat}
                      <span className={`inline-block h-3 w-3 rounded-full ml-2 ${online.has(chat) ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                    </h1>
                    {online.has(chat) ? (
                      <h1 className="text-lg  mb-4">online</h1>
                    ) : (
                      <h1>offline</h1>
                    )}
                  </div>
                ) : (
                  <></>
                )}
            </div>
            <div className='flex-col items-center justify-center'>
            <img className='w-10 h-10 rounded-full border-3 border-gray-300' src='https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Madana_Mohana_temple_of_Bishnupur_in_Bankura_district_30.jpg/800px-Madana_Mohana_temple_of_Bishnupur_in_Bankura_district_30.jpg'/>
                <h1>{profile}</h1>
              <button onClick={logout} className="bg-red-500 px-4 py-2 rounded-lg">Logout</button>
              </div>
            </div>
            

            
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.filter((item) => (item.sender === chat || item.receiver === chat)).map((item, index) => {
                return (
                  <div
                    key={`${item.id}-${index}`}
                    className={`flex ${item.sender === chat ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-md p-3 rounded-lg ${item.sender === chat ? 'bg-gray-800 text-white' : 'bg-gray-600 text-white'}`} style={{ zIndex: index }}>
                      <div>{item.message}</div>
                      <div className="text-xs mt-1 text-right">
                         {item.status === 'sending' && 'Sending...'}
                        {item.status === 'sent' && 'Sent'}
                        {item.status === 'failed' && 'Failed to send'}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={endOfMessagesRef} />
            </div>
            {chat ? (
              <div className="flex items-center p-5 bg-gray-700">
                <input
                  placeholder="Type a message..."
                  type="text"
                  value={text}
                  className="flex-1 p-2 rounded-lg bg-gray-800 text-white outline-none"
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  className="bg-cyan-500 px-4 py-2 ml-2 rounded-lg text-white"
                  onClick={handleSubmit}
                >
                  Send
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-20 bg-gray-700 text-white">
                Select a user to start chatting
              </div>
            )}
          </div>
        </div>
      ) : (
        <h1 className="text-center mt-20 text-2xl">Please login</h1>
      )}
    </div>
  );
};

export default Chat;
