// Define a variable to store the scientific name of the plant
const scientificName = "Hydrangea spp."; // "Hydrangea spp." is used as a sample scientific name

// Make a POST request to the server at the specified URL
fetch('http://localhost:3001/send-to-raspberry', { 
    method: 'POST', // Set the HTTP method to POST
    headers: {
        'Content-Type': 'application/json', // Indicate that the request body contains JSON data
    },
    // Convert the scientificName object to a JSON string to be sent as the request body
    body: JSON.stringify({ scientificName }),
})
.then(response => response.json()) // Convert the server response to JSON format
.then(data => console.log(data)) // Log the response data to the console if successful
.catch((error) => {
    console.error('Error:', error); // Log any errors that occur during the fetch request
});
