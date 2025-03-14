// Login.js
import {React, useState, useContext} from 'react';
import { Amplify, Auth } from 'aws-amplify';
import { BrowserRouter as Router, Routes, Route, useNavigate, BrowserRouter, Navigate } from 'react-router-dom';
import { SigninContext } from './contexts/SigninContext'
import {welcome} from './welcome'
import { setRTLTextPlugin } from 'mapbox-gl';


const Login = () => {
  const { user, setUser } = useContext(SigninContext)
  const navigate = useNavigate();
  const logme = async () => {
    Auth.signIn('Admin008', 'Admin008##').then((result) => {
      //Success 
      // <AuthenticatedContent />
      setUser('Admin008');
      console.log('AAAAAAAAAAA', user);
      setTimeout(() => { 
        console.log('WWWWWWWWWW', user);
    }, 10000); 
      return <Navigate replace to="/welcome" />;
      // navigate("/welcome");
     }).catch((err) => {
      console.log('ggggggggggggggggg');
      // Something is Wrong
     })
  }
  
  function AuthenticatedContent() {
    return (
      <div>
        <h1>Welcome, User!</h1>
        {/* Other authenticated content */}
      </div>
    );
  }
  return (
    <div>
      <h2>Login</h2>
      <form>
        <div>
          <label htmlFor="username">Username:</label>
          <input type="text" id="username" name="username" />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" name="password" />
        </div>
        <button type="submit" onClick={logme}>Login</button>
      </form>
    </div>
  );
}



export default Login;