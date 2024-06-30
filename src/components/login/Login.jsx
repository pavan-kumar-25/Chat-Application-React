import React, { useState } from 'react';
import './Login.css';
import { toast } from "react-toastify";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase'; 
import upload from '../../lib/upload';

const Login = () => {
  const [avatar, setAvatar] = useState({
    file: null,
    url: ""
  });

  const [avatarError, setAvatarError] = useState(null);
  const [registerError, setRegisterError] = useState(null);
  const [loginError, setLoginError] = useState(null);

  const [loadingRegister, setLoadingRegister] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);

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
    e.preventDefault();
    setLoadingRegister(true);
    setRegisterError(null); // Clear previous register error message

    const formData = new FormData(e.target);

    const { username, email, password } = Object.fromEntries(formData.entries());

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

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

      e.target.reset();  // Clear the form inputs
      setAvatar({ file: null, url: "" }); // Reset avatar

      toast.success("Account created! Login now..");
    } catch (error) {
      setRegisterError(error.message);
    } finally {
      setLoadingRegister(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoadingLogin(true);
    setLoginError(null); // Clear previous login error message

    const formData = new FormData(e.target);

    const { email, password } = Object.fromEntries(formData.entries());

    // Check if email or password fields are empty
    if (!email || !password) {
      setLoginError("Please fill out all fields.");
      setLoadingLogin(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      //fetchUserInfo(user?.uid);

      toast.success("Logged in successfully!");
    } catch (error) {
      // Handle specific errors
      if (error.code === 'auth/user-not-found') {
        setLoginError("Account does not exist. Please sign up first.");
      } else if (error.code === 'auth/wrong-password') {
        setLoginError("Incorrect password. Please try again.");
      } else {
        setLoginError(error.message);
      }
    } finally {
      setLoadingLogin(false);
    }
  };

  return (
    <div className='login'>
      <div className="item">
        <h2>Welcome Back</h2>
        <form onSubmit={handleLogin}>
          <input type="text" placeholder='Email' name='email' />
          <input type="password" placeholder='Password' name='password' />
          <button disabled={loadingLogin}>{loadingLogin ? "Loading" : "Sign In"}</button>
        </form>
        {loginError && (
          <p style={{ color: "red" }}>{loginError}</p>
        )}
      </div>
      <div className="separator"></div>
      <div className="item">
        <h2>Create an Account</h2>
        <form onSubmit={handleRegister}>
          <label htmlFor="file">
            <img src={avatar.url ? avatar.url : "./avatar.png"} alt="" />
            Upload an Image
          </label>
          <input type="file" id='file' style={{ display: "none" }} onChange={handleAvatar} />
          <input type="text" placeholder='UserName' name='username' />
          <input type="text" placeholder='Email' name='email' />
          <input type="password" placeholder='Password' name='password' />
          <button disabled={loadingRegister}>{loadingRegister ? "Loading" : "Sign Up"}</button>
        </form>
        {avatarError && (
          <p style={{ color: "red" }}>{avatarError}</p>
        )}
        {registerError && (
          <p style={{ color: "red" }}>{registerError}</p>
        )}
      </div>
    </div>
  );
};

export default Login;
