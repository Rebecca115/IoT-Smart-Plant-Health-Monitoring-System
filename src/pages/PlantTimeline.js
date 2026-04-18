// Import necessary React modules and components from Recharts for charting
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import '../PlantTimeline.css'; // Import the CSS file for styling

// API URL for retrieving sensor data
const apiUrl = 'https://9wohjilbw6.execute-api.ap-southeast-2.amazonaws.com/data/RetrieveSensorData';

// Define sensor metrics for chart display, including keys, labels, and colors
const metrics = [
    { key: 'temperature', label: 'Air Temperature (°C)', color: '#FF5722' },
    { key: 'humidity', label: 'Air Humidity (%)', color: '#4CAF50' },
    { key: 'light_level', label: 'Light Level (lux)', color: '#FFC107' },
    { key: 'soil_humidity', label: 'Soil Humidity (%)', color: '#FF9800' },
    { key: 'soil_temp', label: 'Soil Temperature (°C)', color: '#673AB7' },
    { key: 'soil_ph', label: 'Soil pH', color: '#F44336' },
    { key: 'soil_conductivity', label: 'Soil Conductivity (μS/cm)', color: '#9C27B0' },
    { key: 'soil_N', label: 'Soil Nitrogen (mg/kg)', color: '#03A9F4' },
    { key: 'soil_phosphorus', label: 'Soil Phosphorus (mg/kg)', color: '#8BC34A' },
    { key: 'soil_potassium', label: 'Soil Potassium (mg/kg)', color: '#FFEB3B' }
];

// Component to display plant image timeline
function PlantTimeline() {
    // State variable to store the list of image URLs
    const [images, setImages] = useState([]);

    // Function to fetch images from the server's uploads folder
    const fetchImagesFromFolder = async () => {
        try {
            // Fetch image filenames from the local server API
            const response = await fetch('http://localhost:5002/api/images');
            const data = await response.json();

            // Map the filenames to full image URLs
            const imageUrls = data.map(fileName => `http://localhost:5002/uploads/${fileName}`);
            setImages(imageUrls); // Set the fetched image URLs in state
        } catch (error) {
            console.error("Error fetching images:", error); // Log any errors
        }
    };

    // useEffect hook to fetch images when the component mounts
    useEffect(() => {
        fetchImagesFromFolder(); // Fetch images when component mounts
    }, []); // Empty dependency array ensures it runs only once

    return (
        <div className="plant-timeline">
            <h2>Plant Image Timeline</h2>
            <div className="image-container">
                {/* Map through images and display them in a timeline format */}
                {images.map((url, index) => (
                    <div key={index} className="timeline-item">
                        <img src={url} alt={`Plant Day ${index + 1}`} className="plant-image" />
                        <p>Day {index + 1}</p> {/* Display day number below each image */}
                    </div>
                ))}
            </div>
        </div>
    );
}

// Main App component
const App = () => {
    // State variables to manage sensor data, loading state, and error messages
    const [data, setData] = useState([]); // Stores sensor data
    const [loading, setLoading] = useState(true); // Loading state for data fetch
    const [error, setError] = useState(''); // Error message for data fetch

    // useEffect hook to fetch sensor data when the component mounts
    useEffect(() => {
        // Async function to fetch sensor data from the API
        const fetchData = async () => {
            try {
                const response = await fetch(apiUrl); // Make the API call
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`); // Handle error if response is not ok
                const result = await response.json(); // Parse response as JSON
                setData(result); // Set the fetched data in state
                setLoading(false); // Set loading state to false
            } catch (err) {
                console.error('Error fetching data:', err); // Log any errors
                setError('Error loading data. Please try again later.'); // Set error message
                setLoading(false); // Set loading state to false
            }
        };
        fetchData(); // Call the fetchData function
    }, []); // Empty dependency array ensures it runs only once

    return (
        <div className="App">

            {/* Plant Timeline Component */}
            <PlantTimeline />

            {/* Display charts for sensor data */}
            <main>
                {/* Show loading message while data is being fetched */}
                {loading && <div id="loading">Loading data...</div>}

                {/* Display error message if data fetch fails */}
                {error && <div className="error">{error}</div>}

                {/* Render charts for each sensor metric if data is loaded and no errors */}
                {!loading && !error && metrics.map(metric => (
                    <section key={metric.key} className="chart-section">
                        <h2>{metric.label}</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart
                                data={data.map(record => ({
                                    // Map timestamp and sensor value for the chart
                                    timestamp: record.timestamp ? new Date(record.timestamp).toLocaleString() : 'N/A',
                                    value: parseFloat(record.payload?.[metric.key] || null)
                                }))}
                            >
                                {/* Configure chart grid, axes, tooltip, and line properties */}
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="timestamp" />
                                <YAxis />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke={metric.color}
                                    strokeWidth={2}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </section>
                ))}
            </main>

            {/* Timeline image at the bottom of the page */}
            <div className="timeline-png-container">
                <img src="/timeline.png" alt="Timeline" className="timeline-png" />
            </div>
        </div>
    );
};

// Export the App component for use in other parts of the application
export default App;
