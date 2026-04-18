// API Gateway URL
const apiUrl = 'https://9wohjilbw6.execute-api.ap-southeast-2.amazonaws.com/data/RetrieveSensorData';

// Function to fetch and update the latest sensor value
function fetchLatestValue() {
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            // Extract the latest value from the array (assuming the latest is the last item)
            const latestData = data[data.length - 1];
            const temperature = latestData.payload.temperature;
            const humidity = latestData.payload.humidity;
            const lightLevel = latestData.payload.light_level;
            const phLevel = latestData.payload.ph_level;
            const soilMoisture = latestData.payload.soil_moisture;

            // Display the values
            document.getElementById('value-display').textContent = 
                `Temperature: ${temperature} °C, ` +
                `Humidity: ${humidity} %, ` +
                `Light Level: ${lightLevel} lx, ` +
                `pH Level: ${phLevel}, ` +
                `Soil Moisture: ${soilMoisture}`;
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            document.getElementById('value-display').textContent = `Error fetching data: ${error.message}`;
        });
}

// Fetch the latest value initially
fetchLatestValue();

// Set an interval to update the value periodically (e.g., every 5 seconds)
setInterval(fetchLatestValue, 5000);
