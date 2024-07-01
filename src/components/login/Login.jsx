import React, { useState } from "react";
import "./Login.css";
import { toast } from "react-toastify";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "../../lib/firebase";
import upload from "../../lib/upload";

const Login = () => {
  const [avatar, setAvatar] = useState({
    file: null,
    url: "",
  });

  const [avatarError, setAvatarError] = useState(null);
  const [registerError, setRegisterError] = useState(null);
  const [loginError, setLoginError] = useState(null);

  const [loadingRegister, setLoadingRegister] = useState(false);
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const handleAvatar = async (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
      setAvatarError(null); // Reset avatar error when a file is selected
    } else {
      setAvatarError("Please select a file.");
    }
  };

  const handleRegister = async (e) => {
    setLoadingRegister(true);
    setRegisterError(null); // Clear previous register error message

    try {
      const res = await createUserWithEmailAndPassword(
        auth,
        registerEmail,
        registerPassword
      );

      const imgUrl = await upload(avatar.file);

      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        avatar: imgUrl,
        id: res.user.uid,
        blocked: [],
      });

      await setDoc(doc(db, "userchats", res.user.uid), {
        chats: [],
      });

      setAvatar({ file: null, url: "" }); // Reset avatar

      toast.success("Account created! Login now..");
    } catch (error) {
      setRegisterError(error.message);
    } finally {
      setLoadingRegister(false);
    }
  };

  const handleLogin = async (e) => {
    setLoadingLogin(true);
    setLoginError(null); // Clear previous login error message

    // Check if email or password fields are empty
    if (!loginEmail || !loginPassword) {
      setLoginError("Please fill out all fields.");
      setLoadingLogin(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      //fetchUserInfo(user?.uid);
      toast.success("Logged in successfully!");
    } catch (error) {
      // Handle specific errors
      console.log(error.message);

      switch (error.code) {
        case "auth/email-already-in-use":
          alert("The email address is already in use by another account.");
          break;
        case "auth/invalid-email":
          alert("The email address is not valid.");
          break;
        case "auth/operation-not-allowed":
          alert("Email/password accounts are not enabled.");
          break;
        case "auth/weak-password":
          alert("The password is too weak.");
          break;
        case "auth/user-not-found":
          alert("No user found with this email.");
          break;
        case "auth/wrong-password":
          alert("Incorrect password.");
          break;
        default:
          alert("An unknown error occurred: " + error.message);
      }

      if (error.code === "auth/invalid-credential") {
        setLoginError("Account does not exist. Please sign up first.");
      } else if (error.code === "auth/wrong-password") {
        setLoginError("Incorrect password. Please try again.");
      } else {
        setLoginError(error.message);
      }
    } finally {
      setLoadingLogin(false);
    }
  };

  return (
    <div className="login">
      <div className="item">
        <h2>Welcome Back</h2>
        <form action='="#'>
          <input
            type="text"
            placeholder="Email"
            name="email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
          />
          <button type="button" onClick={handleLogin} disabled={loadingLogin}>
            {loadingLogin ? "Loading" : "Sign In"}
          </button>
        </form>
        {loginError && <p style={{ color: "red" }}>{loginError}</p>}
      </div>
      <div className="separator"></div>
      <div className="item">
        <h2>Create an Account</h2>
        <form action="#">
          <label htmlFor="file">
            <img src={avatar.url ? avatar.url : "./avatar.png"} alt="" />
            Upload an Image
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleAvatar}
          />
          <input
            type="text"
            placeholder="UserName"
            name="username"
            value={registerUsername}
            onChange={(e) => setRegisterUsername(e.target.value)}
          />
          <input
            type="text"
            placeholder="Email"
            name="email"
            value={registerEmail}
            onChange={(e) => setRegisterEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={handleRegister}
            disabled={loadingRegister}
          >
            {loadingRegister ? "Loading" : "Sign Up"}
          </button>
        </form>
        {avatarError && <p style={{ color: "red" }}>{avatarError}</p>}
        {registerError && <p style={{ color: "red" }}>{registerError}</p>}
      </div>
    </div>
  );
};

export default Login;
