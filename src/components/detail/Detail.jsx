import { auth } from "../../lib/firebase"
import useUserStore from "../../lib/userStore";
import "./Detail.css"
import chatStore from "../../lib/chatStore";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

const Detail = () => {
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } = chatStore();
  const { currentUser } = useUserStore();

  const handleBlock = async () => {
    if (!chatId || !currentUser || !user) return;
    try {
      const userDocRef = doc(db, "users", user.id);
      const currentUserDocRef = doc(db, "users", currentUser.id);

      if (isReceiverBlocked) {
        await updateDoc(userDocRef, {
          blocked: user.blocked.filter(id => id !== currentUser.id),
        });
        await updateDoc(currentUserDocRef, {
          blocked: currentUser.blocked.filter(id => id !== user.id),
        });
      } else {
        await updateDoc(userDocRef, {
          blocked: [...user.blocked, currentUser.id],
        });
        await updateDoc(currentUserDocRef, {
          blocked: [...currentUser.blocked, user.id],
        });
      }

      changeBlock();
    } catch (error) {
      console.error("Error blocking/unblocking user:", error);
    }
  };
  return (
    <div className="detail">
        <div className="user">
            <img src={user?.avatar || "./avatar.png"} alt="" />
            <h2>{user?.username} </h2>
            <p>Lorem ipsum dolor sit amet.</p>
        </div>
        <div className="info">
            <div className="options">
                <div className="title">
                    <span>Chat Settings</span>
                    <img src="./arrowUp.png" alt="" />
                </div>
            </div>

            <div className="options">
                <div className="title">
                    <span>Privacy & Help</span>
                    <img src="./arrowUp.png" alt="" />
                </div>
            </div>

            <div className="options">
                <div className="title">
                    <span>Shared photos</span>
                    <img src="./arrowUp.png" alt="" />
                </div>
                
            </div>

            <div className="options">
                <div className="title">
                    <span>Shared Files</span>
                    <img src="./arrowUp.png" alt="" />
                </div>
            </div>
            <button onClick={handleBlock}>
                {/* {isReceiverBlocked ? "Unblock User" : "Block User"} */}
                {isCurrentUserBlocked?"You are blocked":isReceiverBlocked?"User Blocked":"Block User"}
            </button>
            <button className="logout" onClick={() => auth.signOut()}>Log Out</button>
        </div>
    </div>
);
};

export default Detail;