// src/components/Dashboard.js

import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import '../dashboardpage.css';

const sensorDataApiUrl = 'https://9wohjilbw6.execute-api.ap-southeast-2.amazonaws.com/data/RetrieveSensorData';
const waterPumpControlUrl = 'https://lqit46ymn0.execute-api.ap-southeast-2.amazonaws.com/wpc/control';
const rgbLightControlUrl = 'https://u70oktpbs1.execute-api.ap-southeast-2.amazonaws.com/rgbled/control';

function Dashboard() {
  const [sensorData, setSensorData] = useState(null);
  const [recommendedData, setRecommendedData] = useState(null);
  const [currentWaterLevel, setCurrentWaterLevel] = useState(null);
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [automaticMode, setAutomaticMode] = useState(false);
  const [automaticLightMode, setAutomaticLightMode] = useState(false);
  const [error, setError] = useState(null);

  // Function to fetch the latest sensor and recommended data
  const fetchLatestValue = async () => {
    try {
      const response = await fetch(sensorDataApiUrl);
      if (!response.ok) throw new Error(`Sensor Data Error: ${response.statusText}`);
      const dataArray = await response.json();

      // Assuming the API returns an array where each item has a payload with data_type
      let liveData = null;
      let recommendedData = null;
      let calibratedWaterLevel = null;

      dataArray.forEach(item => {
        if (item.payload && item.payload.data_type === 'live') {
          liveData = item.payload;
        } else if (item.payload && item.payload.data_type === 'recommend') {
          recommendedData = item.payload;
        } else if (item.payload && item.payload.data_type === 'waterLevel') {
          calibratedWaterLevel = item.payload.waterLevel;
        }
      });

      // Handle live data
      if (liveData) {
        setSensorData(prevData => ({
          ...prevData,
          ...liveData,
          water_level: !isCalibrated ? liveData.water_level : currentWaterLevel,
        }));
        if (!isCalibrated) {
          setCurrentWaterLevel(liveData.water_level);
        }
      }

      // Handle recommended data
      if (recommendedData) {
        setRecommendedData(recommendedData);
      }

      // Handle calibration data
      if (calibratedWaterLevel !== null) {
        setCurrentWaterLevel(calibratedWaterLevel);
        setIsCalibrated(true);
      } else {
        setIsCalibrated(false);
      }

      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchLatestValue();
    const intervalId = setInterval(fetchLatestValue, 5000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCalibrated, currentWaterLevel]);

  // Function to control the water pump
  const toggleWaterPump = (action) => {
    fetch(waterPumpControlUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: 'waterPump/control', message: action }),
    })
      .then(response => {
        if (!response.ok) throw new Error(`Water Pump Control Error: ${response.statusText}`);
        return response.json();
      })
      .then(data => console.log(`Water pump turned ${action}`))
      .catch(error => console.error('Error controlling water pump:', error));
  };

  // Function to control the RGB light
  const toggleRGBLight = (action) => {
    fetch(rgbLightControlUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: 'rgbLED/control', message: action }),
    })
      .then(response => {
        if (!response.ok) throw new Error(`RGB Light Control Error: ${response.statusText}`);
        return response.json();
      })
      .then(data => console.log(`RGB light turned ${action}`))
      .catch(error => console.error('Error controlling RGB light:', error));
  };

  // Function to toggle automatic water pump mode
  const handleAutomaticModeToggle = (event) => {
    const isChecked = event.target.checked;
    setAutomaticMode(isChecked);
    const action = isChecked ? 'automatic' : 'manual';

    fetch(waterPumpControlUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: 'waterPump/control', message: action }),
    })
      .then(response => {
        if (!response.ok) throw new Error(`Automatic Mode Toggle Error: ${response.statusText}`);
        return response.json();
      })
      .then(data => console.log(`Water pump set to ${action} mode`))
      .catch(error => console.error('Error toggling automatic mode:', error));
  };

  // Function to toggle automatic RGB light mode
  const handleAutomaticLightModeToggle = (event) => {
    const isChecked = event.target.checked;
    setAutomaticLightMode(isChecked);
    const action = isChecked ? 'automatic' : 'manual';

    fetch(rgbLightControlUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: 'rgbLED/control', message: action }),
    })
      .then(response => {
        if (!response.ok) throw new Error(`Automatic Light Mode Toggle Error: ${response.statusText}`);
        return response.json();
      })
      .then(data => console.log(`RGB light set to ${action} mode`))
      .catch(error => console.error('Error toggling automatic light mode:', error));
  };

  // Function to calibrate the ultrasonic sensor
  const calibrateUltrasonicSensor = () => {
    fetch(waterPumpControlUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: 'waterPump/control', message: 'CALIBRATE' }),
    })
      .then(response => {
        if (!response.ok) throw new Error(`Calibration Error: ${response.statusText}`);
        return response.json();
      })
      .then(data => {
        console.log('Calibration command sent');
      })
      .catch(error => console.error('Error sending calibration command:', error));
  };

  // Prepare data for the pie chart
  const pieData = [{ name: 'Water Level', value: currentWaterLevel || 0 }];
  const COLORS = [currentWaterLevel < 5.3 ? '#ff4d4f' : '#008036'];

  return (
    <div className="dashboard-container">
      {/* Display error message if any */}
      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
        </div>
      )}

      <div className="left-panel">
        {/* Air Data Card */}
        <div className="data-card">
          <h3>Air</h3>
          <div className="data-content">
            <div className="sensor-data">
              <h4>Live Data</h4>
              <p>Temperature: {sensorData ? sensorData.temperature : 'Loading...'} °C</p>
              <p>Humidity: {sensorData ? sensorData.humidity : 'Loading...'} %</p>
              <p>Light: {sensorData ? sensorData.light_level : 'Loading...'} Lux</p>
            </div>
            <div className="recommended-data">
              <h4>Recommended Data</h4>
              <p>Temperature: {recommendedData ? recommendedData.rec_temp : 'Loading...'} </p>
              <p>Humidity: {recommendedData ? recommendedData.rec_humidity : 'Loading...'}</p>
              <p>Light: {recommendedData ? recommendedData.rec_light : 'Loading...'} </p>
            </div>
          </div>
        </div>

        {/* Soil Data Card */}
        <div className="data-card">
          <h3>Soil</h3>
          <div className="data-content">
            <div className="sensor-data">
              <h4>Live Data</h4>
              <p>Temperature: {sensorData ? sensorData.soil_temp : 'Loading...'} °C</p>
              <p>Humidity: {sensorData ? sensorData.soil_humidity : 'Loading...'} %</p>
              <p>pH: {sensorData ? sensorData.soil_ph : 'Loading...'}</p>
              <p>Conductivity: {sensorData ? sensorData.soil_conductivity : 'Loading...'} μs/cm</p>
              <p>Nitrogen: {sensorData ? sensorData.soil_n : 'Loading...'} Mg/kg</p>
              <p>Phosphorus: {sensorData ? sensorData.soil_phosphorus : 'Loading...'} Mg/kg</p>
              <p>Potassium: {sensorData ? sensorData.soil_potassium : 'Loading...'} Mg/kg</p>
            </div>
            <div className="recommended-data">
              <h4>Recommended Data</h4>
              <p>Temperature: {recommendedData ? recommendedData.rec_soil_temp : 'Loading...'} </p>
              <p>Humidity: {recommendedData ? recommendedData.rec_soil_humidity : 'Loading...'} </p>
              <p>pH: {recommendedData ? recommendedData.rec_soil_pH : 'Loading...'}</p>
              <p>Conductivity: {recommendedData ? recommendedData.rec_soil_conductivity : 'Loading...'} </p>
              <p>Nitrogen: {recommendedData ? recommendedData.rec_soil_nitrogen : 'Loading...'} </p>
              <p>Phosphorus: {recommendedData ? recommendedData.rec_soil_phosphorus : 'Loading...'} </p>
              <p>Potassium: {recommendedData ? recommendedData.rec_soil_potassium : 'Loading...'} </p>
            </div>
          </div>
        </div>

        {/* Flower Image */}
        <img src="/Flower.png" alt="Flower" className="flower-image" />
      </div>

      <div className="right-panel">
        {/* Water Pump Control Section */}
        <h2>Water Pump Control</h2>
        {currentWaterLevel !== null && currentWaterLevel < 5.3 && (
          <div className="alert">
            <p>Water level is low, please add water!</p>
          </div>
        )}
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              innerRadius="70%"
              outerRadius="90%"
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="button-container">
          <button onClick={() => toggleWaterPump('ON')} disabled={automaticMode}>
            Turn Water Pump ON
          </button>
          <button onClick={() => toggleWaterPump('OFF')} disabled={automaticMode}>
            Turn Water Pump OFF
          </button>
          <button onClick={calibrateUltrasonicSensor}>Calibrate Water Pump</button>
        </div>
        <div className="checkbox-container">
          <label>
            <input
              type="checkbox"
              checked={automaticMode}
              onChange={handleAutomaticModeToggle}
            />
            Automatic Water Pump Mode
          </label>
        </div>

        {/* RGB Light Control Section */}
        <h2>RGB Light Control</h2>
        <img src="/sun.png" alt="Sun" className="sun-image" />
        <div className="button-container">
          <button onClick={() => toggleRGBLight('ON')} disabled={automaticLightMode}>
            Turn RGB Light ON
          </button>
          <button onClick={() => toggleRGBLight('OFF')} disabled={automaticLightMode}>
            Turn RGB Light OFF
          </button>
        </div>
        <div className="checkbox-container">
          <label>
            <input
              type="checkbox"
              checked={automaticLightMode}
              onChange={handleAutomaticLightModeToggle}
            />
            Automatic RGB Light Mode
          </label>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
