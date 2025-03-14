import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';
import { Auth } from 'aws-amplify';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser(); // Check if the user is already authenticated
  }, []);

  async function checkUser() {
    try {
      const user = await Auth.currentAuthenticatedUser();
      setUser(user);
    } catch (error) {
      setUser(null);
    }
  }

  async function handleSignUp(username, password, email) {
    try {
      await Auth.signUp({ username, password, attributes: { email } });
      // Handle confirmation code sent to email
    } catch (error) {
      console.error('Error signing up:', error);
    }
  }

  async function handleConfirmSignUp(username, code) {
    try {
      await Auth.confirmSignUp(username, code);
      // User confirmed, can now sign in
    } catch (error) {
      console.error('Error confirming sign up:', error);
    }
  }

  async function handleSignIn(username, password) {
    try {
      await Auth.signIn(username, password);
      checkUser();
    } catch (error) {
      console.error('Error signing in:', error);
    }
  }

  return (
    <Router>
      {user ? (
        <Redirect to="/welcome" />
      ) : (
        <div>
          <Route
            exact
            path="/"
            render={() => (
              <Registration
                onSignUp={handleSignUp}
                onConfirmSignUp={handleConfirmSignUp}
              />
            )}
          />
          <Route
            path="/welcome"
            component={Welcome}
          />
          <Route
            path="/login"
            render={() => (
              <Login onSignIn={handleSignIn} />
            )}
          />
        </div>
      )}
    </Router>
  );
}

function Registration({ onSignUp, onConfirmSignUp }) {
  // Implement registration and confirmation form components
  // Include input fields for username, password, email, and confirmation code
}

function Login({ onSignIn }) {
  // Implement login form component
  // Include input fields for username and password
}

function Welcome() {
  return <div>Welcome to your app!</div>;
}

export default App;