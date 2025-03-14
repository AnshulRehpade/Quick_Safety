/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';

import './App.css';

import ReactMapGL, {
  NavigationControl
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import { Amplify, Auth } from 'aws-amplify';
import { Signer } from "@aws-amplify/core";
import Location from "aws-sdk/clients/location";
import awsconfig from './aws-exports';
import axios from 'axios';
import { BrowserRouter, Routes, Route } from 'react-router-dom';


const mapName = "demoMap";
const API_URL = 'http://localhost:3001';

Amplify.configure(awsconfig);

/**
 * Sign requests made by Mapbox GL using AWS SigV4.
 */
const transformRequest = (credentials) => (url, resourceType) => {
  // Resolve to an AWS URL
  if (resourceType === "Style" && !url?.includes("://")) {
    url = `https://maps.geo.${awsconfig.aws_project_region}.amazonaws.com/maps/v0/maps/${url}/style-descriptor`;
  }

  // Only sign AWS requests (with the signature as part of the query string)
  if (url?.includes("amazonaws.com")) {
    return {
      url: Signer.signUrl(url, {
        access_key: credentials.accessKeyId,
        secret_key: credentials.secretAccessKey,
        session_token: credentials.sessionToken,
      })
    };
  }

  // Don't sign
  return { url: url || "" };
};

function Search(props){

  const [place, setPlace] = useState();
 
  const handleChange = (event) => {
    setPlace(event.target.value);
  }

  const handleClick = (event) => {
    event.preventDefault();
    props.searchPlace(place)
  }
  
  return (
    <div className="container">
      <div className="input-group">
        <input type="text" className="form-control form-control-lg" placeholder="Search for Places" aria-label="Place" aria-describedby="basic-addon2" value={ place } onChange={handleChange}/>
        <div className="input-group-append">
          <button onClick={ handleClick } className="btn btn-primary" type="submit">Search</button>
        </div>
      </div>
    </div>
  )
};

const App = () => {
  const [credentials, setCredentials] = useState(null);
  const [address, setAddress] = useState("");
  const [coordinates, setcoordinates] = useState({ latitude: "18.0338", longitude: "73.0196" });
  const [isAddressVisible, setAddressVisibility] = useState(false);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [notification, setNotification] = useState([]);
  const [user, setUser] = useState(null);
  const [auth, setAuth] = useState("No");
  
  const [viewport, setViewport] = useState({
    longitude: 72.8777,
    latitude: 19.0760,
    zoom: 15,
  });

  const [client, setClient] = useState(null);
 
  const getCoordinates = async () => {
    if(coordinates.latitude !== "18.0338") {
      try {
        setAddress(await fetchUserLocation());
        setAddressVisibility(true);
        setNearbyHospitals(await fetchNearbyHospitals());
      } catch (error) {
        console.error(error.message);
        alert("Error getting location information.");
      }
    }
  };


  const getCurrentPosition = () => {
    if (navigator.geolocation) {
      try {
        navigator.geolocation.getCurrentPosition(getDevicePosition);        
      } catch (error) {
        console.error(error.message);
        alert("Error getting location information.");
      }
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const getDevicePosition = (position) => {
    console.log("QQQQQQQQQQQQQQQQQQQQQQQQQQQQQLatitude: " + position.coords.latitude + "Longitude: " + position.coords.longitude);
    setcoordinates({ latitude: position.coords.latitude, longitude: position.coords.longitude });    
  }

  const fetchNearbyHospitals = async () => {
    try {
      console.log('sssssssssssssssssssssssssss1', coordinates);
      const response = await axios.post(`${API_URL}/api/hospitals`, JSON.stringify(coordinates), {
        method: 'POST',
        headers: {
             'content-type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error(error.message);
      alert("Error fetching nearby hospitals.");
    }
  };

  const fetchUserLocation = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/location`, JSON.stringify(coordinates), {
        method: 'POST',
        headers: {
             'content-type': 'application/json',
        },
      });
      return response.data.userAddress;
      // Handle the data in your React app
    } catch (error) {
      console.error(error);
    }
  };

 

  useEffect(() => {
    const fetchCredentials = async () => {
      setCredentials(await Auth.currentUserCredentials());
    };

    fetchCredentials();

    const createClient = async () => {
      const credentials = await Auth.currentCredentials();
      const client = new Location({
          credentials,
          region: awsconfig.aws_project_region,
     });
     setClient(client);
    }

    createClient();
    getCurrentPosition();
  }, []);

  useEffect(() => {
    getCoordinates();
  }, [coordinates.latitude, coordinates.longitude]);

  const sendSms = async () => {
    try {
      setNotification('Need help at ' + JSON.stringify(address).toString());
      const response = await axios.post(`${API_URL}/api/sendsms`, JSON.stringify({address}), {
        method: 'POST',
        headers: {
             'content-type': 'application/json',
        },
      });
      console.log('WWWWWWWWWWWWWWWWWW', response.data);
      // Handle the data in your React app
    } catch (error) {
      console.error(error);
    }
  };

  const searchPlace = (place) => {
    if(place === undefined || place === null) {
      place = JSON.stringify(address).toString();
    }
    const params = {
      IndexName: "DemoPlaceIndex",
      Text: place,
    };

    client.searchPlaceIndexForText(params, (err, data) => {
      if (err) console.error(err);
      if (data) {
 
        const coordinates = data.Results[0].Place.Geometry.Point;
        setViewport({
          longitude: coordinates[0],
          latitude: coordinates[1], 
          zoom: 15})
          setcoordinates({ latitude: coordinates[1], longitude: coordinates[0] });
        console.log("coordinates ", coordinates);
        return coordinates;
      }
    });
  }

  useEffect(() => {
    console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', user);
  }, [user]);

  const logme = async() => {
    Auth.signIn('Admin008', 'Admin008##').then((result) => {
      setAuth('Yes')
      console.log('AAAAAAAAAAA', user);
     }).catch((err) => {
      // Something is Wrong
     })
    setUser('Admin008');
  }
  
  const UnauthenticatedContent = () => {
    console.log('TTTTTTTTTTTTTTTTTTTTTDDDDDDDDDDDDDDDD', auth);
    return (
      <main style={{ display: 'flex', flexDirection: 'column', padding: '20px' }}>
      <div style={{ width: '30%', backgroundColor: '#FF9F00', padding: '10px', borderRadius: '10px', margin: '0 auto' }}>
        <h2>Login</h2>
        <form>
          <label for="username">Username:</label>
          <input type="text" id="username" name="username" placeholder="Enter your username" style={{ width: '100%', padding: '10px', border: 'none', borderRadius: '5px', marginBottom: '10px' }} />
          <label for="password">Password:</label>
          <input type="password" id="password" name="password" placeholder="Enter your password" style={{ width: '100%', padding: '10px', border: 'none', borderRadius: '5px', marginBottom: '10px' }} />
          <button type="submit" onClick={logme} style={{ width: '100%', backgroundColor: '#FF9F00', color: '#fff', padding: '10px', border: 'none', borderRadius: '5px' }}>Login</button>
        </form>
      </div>
    </main>
    );
  }

  return (
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <div>
        <header>
          <h1>Welcome, User</h1>
          <a href="logout.php">Log Out</a>
        </header>
        <main>
          <div class="top-section">

            <div class="subpart">
                <h2>Send SOS</h2>
                <button class="panic-button" onClick={sendSms}>Panic Button</button>
            </div>
            <div class="subpart">
                <Search searchPlace = {searchPlace} />
            </div>
            <div class="subpart">
              <div class="notification-box">
                  <h2>Recent Notifications</h2>
                  <ul>
                    {notification}
                  </ul>
              </div>
            </div>
          </div>
          <div class="bottom-section">
            <div class="left-section">
              <div class="map">
                {/* <!-- Your map code goes here --> */}
                {credentials ? (
                  <ReactMapGL
                    {...viewport}
                    width="100%"
                    height="100vh"
                    transformRequest={transformRequest(credentials)}
                    mapStyle={mapName}
                    onViewportChange={setViewport}
                  >
                    <div style={{ position: "absolute", left: 20, top: 20 }}>
                      {/* react-map-gl v5 doesn't support dragging the compass to change bearing */}
                      <NavigationControl showCompass={false} />
                    </div>
                  </ReactMapGL>
                ) : (
                  <h1>Loading...</h1>
                )}
              </div>
            </div>
            <div class="right-section">
              {isAddressVisible && (
                <div class="notification-box">
                  <h4>Your Coordinates</h4>
                  <p>Latitude: {coordinates.latitude}</p>
                  <p>Longitude: {coordinates.longitude}</p>
                  <p>Address: {address}</p>
                </div>
              )}
              {isAddressVisible && (
                <div>
                  <h4>Nearby Hospitals</h4>
                  <ul class="hospital-list">
                    {nearbyHospitals.map((hospital, index) => (
                      <li key={index}>
                        <p><strong>{hospital.name}</strong></p>
                        <p>{hospital.vicinity}</p>
                      </li>
                    ))}
                    {
                      console.log(nearbyHospitals[0])
                    }
                  </ul>
                </div>
              )}      
            </div>
          </div>
        </main>
        </div>
                ) : (
                  <UnauthenticatedContent />
                )
              }
          />
        </Routes>
      </BrowserRouter>
  );

};

export default App;