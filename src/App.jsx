import Detail from "./components/detail/Detail";
import Chat from "./components/chat/Chat";
import List from "./components/list/List";
import Login from "./components/login/Login";
import Notification from "./components/notification/Notification";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import useUserStore from "./lib/userStore";
import chatStore from "./lib/chatStore";


const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const {chatId}=chatStore();
  const [didLogin, setDidLogin] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      // delay function to help database update before login
      if (user) {
        fetchUserInfo(user?.uid);
        setDidLogin(!didLogin);
      } else {
        fetchUserInfo(null);
      }
    });
    return () => {
      unSub();
    };
  }, [fetchUserInfo]);



  if (isLoading) return <div className="loading">Loading.....</div>;

  return (
    <div className='container'>
      {currentUser ? (
        <>
          <List />
          <Chat />
          <Detail />
        </>
      ) : (
        <Login />
      )}
      <Notification />
    </div>
  );
};

export default App;
