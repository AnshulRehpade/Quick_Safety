const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { SNSClient, command, PublishCommand } = require("@aws-sdk/client-sns");
const { fromCognitoIdentityPool } = require("@aws-sdk/credential-provider-cognito-identity");
const { CognitoIdentityClient } = require("@aws-sdk/client-cognito-identity");


const app = express();
const port = process.env.PORT || 3001;

// AWS SDK Configuration
const region = 'us-east-1'; // Replace with your AWS region
const userPoolId = 'us-east-1_sQXurSPAu'; // Replace with your Cognito User Pool ID
const identityPoolId = 'us-east-1:16b1a25c-ed11-44c0-9d2d-fa2a9786f51a'; // Replace with your Cognito Identity Pool ID

const config = {
  region,
  credentials: fromCognitoIdentityPool({
    userPoolId,
    identityPoolId,
    client: new CognitoIdentityClient({ region }),
  }),
};

const snsClient = new SNSClient(config);

// Message to publish
const topicArn = 'arn:aws:sns:us-east-1:814333511770:panicAlert'; // Replace with your SNS topic ARN


// Enable CORS to allow your React app to access the API
app.use(cors());
app.use(express.json());

// Get User address
app.post('/api/location', async (req, res) => {
  try {
    const coordinates = req.body;
    console.log('CCCCCCC ', coordinates);
    const userAddress = await getUserAddress(coordinates.latitude, coordinates.longitude);
    res.json({ coordinates, userAddress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Retrieve nearby hospitals
app.post('/api/hospitals', async (req, res) => {
  try {
    const coordinates = req.body;
    console.log('AAAAAA ', coordinates);
    const nearbyHospitals = await getNearbyHospital(coordinates.latitude, coordinates.longitude);

    res.json(nearbyHospitals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/sendsms', async (req, res) => {
  try {
    const address = req.body;
    console.log('BBBBBBB ', address);
    const value = address['address'];
    const message = 'Please send ambulance at ' + value.toString();
    const params = {
      Message: message,
      TopicArn: topicArn,
    };
    const command = new PublishCommand(params);
  
    try {
      const response = await snsClient.send(command);
      console.log('Message published. MessageId:', response.MessageId);
      res.json("Message published");
    } catch (error) {
      console.error('Error publishing message:', error);
      res.json("Unable to send message" + error);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function getUserAddress(lat, lng) {
  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyBQ4GPQYig-udiv8WtrrNmhWosRI5phxMk`);
    const data = response.data;

    if (data.results && data.results.length > 0) {
      return data.results[0].formatted_address;
    } else {
      return "Address not available";
    }
  } catch (error) {
    console.error(error);
    return "Error fetching address";
  }
}

async function getNearbyHospital(lat, lng) {
    try {
        const apiKey = 'AIzaSyBQ4GPQYig-udiv8WtrrNmhWosRI5phxMk';
        const response = await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=hospital&key=${apiKey}`);
        const data = response.data;
        if (data.results && data.results.length > 0) {
            return data.results;
        } else {
            return [];
        }
    } catch (error) {
      console.error(error);
      return "Error fetching address";
    }
  }

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
