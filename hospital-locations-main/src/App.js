import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

const API_URL = 'http://localhost:3001';


const App = () => {
  const [address, setAddress] = useState("");
  const [coordinates, setcoordinates] = useState({ latitude: "19.0338", longitude: "73.0196" });
  const [isAddressVisible, setAddressVisibility] = useState(false);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);


  const getCoordinates = async () => {
    if (navigator.geolocation) {
      try {
        navigator.geolocation.getCurrentPosition(showPosition);
        setAddress(await fetchUserLocation());
        setAddressVisibility(true);
        setNearbyHospitals(await fetchNearbyHospitals());
        console.log("66888888 ", nearbyHospitals);
        fetchNearbyHospitals(coordinates.latitude, coordinates.longitude);
      } catch (error) {
        console.error(error.message);
        alert("Error getting location information.");
      }
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const fetchNearbyHospitals = async () => {
    try {
      const test = {
        latitude: 19.1121049,
        longitude: 72.861073
      };
       //const response = await axios.get(`${API_URL}/api/hospitals`);
      const response = await axios.post(`${API_URL}/api/hospitals`, JSON.stringify(test), {
        method: 'POST',
        headers: {
             'content-type': 'application/json',
        },
        // body: JSON.stringify(test)
      });
      console.log('sssssssssssssssssssssssssss', response.data);
      return response.data;
    } catch (error) {
      console.error(error.message);
      alert("Error fetching nearby hospitals.");
    }
  };

  // Fetch user's location
const fetchUserLocation = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/location`);
    console.log('vvvvvvvvvvvvvvvvvvvvvvv', response.data.userAddress);
    return response.data.userAddress;
    // Handle the data in your React app
  } catch (error) {
    console.error(error);
  }
};

  useEffect(() => {
    getCoordinates();
  }, []);

  function showPosition(position) {
    console.log("QQQQQQQQQQQQQQQQQQQQQQQQQQQQQLatitude: " + position.coords.latitude + "Longitude: " + position.coords.longitude);
  }
  return (
    <div className="Map">
      <h2>Find the Nearest Hospital</h2>
      
      <button className="button" onClick={getCoordinates}>Locate Me</button>

      <h4>Your Coordinates</h4>

      {isAddressVisible && (
        <div>
          <p>Latitude: {coordinates.latitude}</p>
          <p>Longitude: {coordinates.longitude}</p>
          <p>Address: {address}</p>
        </div>
      )}

      {isAddressVisible && (
        <div>
        <h4>Nearby Hospitals</h4>
        <ul>
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
  );
};
export default App;