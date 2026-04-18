// Import necessary React modules and CSS for the PlantSearch component
import React, { useState, useEffect } from 'react';
import '../PlantGallery.css'; // Import the CSS file for styling

// Define the PlantSearch component
function PlantSearch() {
  // State variables to manage component data and behavior
  const [plantInfo, setPlantInfo] = useState(''); // Stores plant identification results
  const [searchQuery, setSearchQuery] = useState(''); // Stores the user's search input
  const [chatResponse, setChatResponse] = useState(''); // Stores the chat API response
  const [plantName, setPlantName] = useState(''); // Stores the plant name
  const [plantAvatar, setPlantAvatar] = useState(null); // Stores the plant avatar image file
  const [plantDescription, setPlantDescription] = useState(''); // Stores the plant description
  const [plantDate, setPlantDate] = useState(''); // Stores the planting date
  const [isModalOpen, setIsModalOpen] = useState(false); // Manages the modal visibility state

  // useEffect to fetch the first image from the server on component mount
  useEffect(() => {
    fetch('http://localhost:5002/api/images') // Fetch image data from the local server
      .then((response) => response.json()) // Parse the response as JSON
      .then((images) => {
        // If images are found, set the first image as the plant avatar
        if (images && images.length > 0) {
          setPlantAvatar(`http://localhost:5002/uploads/${images[0]}`);
        }
      })
      .catch((error) => console.error("Error fetching images:", error)); // Log errors, if any
  }, []); // Empty dependency array to run only once on component mount

  // Handle avatar replacement and plant identification when a file is uploaded
  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0]; // Get the uploaded file
    if (file) {
      setPlantAvatar(URL.createObjectURL(file)); // Display the uploaded image as the avatar

      // Create form data to upload the image for plant identification
      const formData = new FormData();
      formData.append('images', file);

      try {
        // Send the image to the PlantNet API for identification
        const response = await fetch('https://my-api.plantnet.org/v2/identify/all?include-related-images=false&no-reject=false&nb-results=10&lang=en&api-key=2b10qBBsSVf9aXG04dEUCYzRO', {
          method: 'POST',
          body: formData, // Attach the form data to the request
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json(); // Parse the response as JSON
        console.log('Plant Identification Response:', result); // Log the result

        // Extract the scientific name from the first identified plant, if available
        const firstPlant = result.results[0];
        if (firstPlant) {
          const scientificName = firstPlant.species?.scientificName || 'Unknown Scientific Name';
          setPlantName(scientificName); // Set the plant name in the input field
        } else {
          setPlantInfo(<p>No plant data available</p>); // Display a message if no plant data is found
        }
      } catch (error) {
        console.error('Error identifying the plant:', error); // Log errors during the fetch process
      }
    }
  };

  // Function to handle avatar click and trigger file input
  const handleAvatarClick = () => {
    document.getElementById('avatarInput').click(); // Trigger file input when the avatar is clicked
  };

  // Handle form submission and display the modal with plant information
  const handleSubmit = () => {
    setIsModalOpen(true); // Open the modal on submit
  };

  return (
    <div className="plant-search-container">
      {/* Avatar upload and display section */}
      <div className="avatar-upload" onClick={handleAvatarClick}>
        <input
          type="file"
          id="avatarInput"
          className="avatar-input"
          accept="image/*" // Accept only image files
          onChange={handleAvatarUpload} // Handle avatar upload
          style={{ display: 'none' }} // Hide the file input element
        />
        {/* Display uploaded or fetched avatar */}
        {plantAvatar && <img src={plantAvatar} alt="Plant Avatar" className="plant-avatar" />}
      </div>

      {/* Plant name input field */}
      <div className="nickname-input">
        <label htmlFor="plantName">Plant Name</label>
        <input
          type="text"
          id="plantName"
          className="text-input"
          placeholder="Enter plant name"
          value={plantName}
          onChange={(e) => setPlantName(e.target.value)} // Update plant name state on input change
        />
      </div>

      {/* Planting date input field */}
      <div className="date-input">
        <label htmlFor="plantDate">Planting Date (dd/mm/yyyy)</label>
        <input
          type="date"
          id="plantDate"
          className="text-input"
          value={plantDate}
          onChange={(e) => setPlantDate(e.target.value)} // Update planting date state
        />
      </div>

      {/* Plant description input field */}
      <div className="description-input">
        <label htmlFor="plantDescription">Plant Description</label>
        <textarea
          id="plantDescription"
          className="text-area"
          placeholder="Describe your plant..."
          value={plantDescription}
          onChange={(e) => setPlantDescription(e.target.value)} // Update plant description state
        />
      </div>

      {/* Submit button to open the modal */}
      <div className="submit-btn">
        <button onClick={handleSubmit}>Submit</button>
      </div>

      {/* Modal to display plant information */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Plant Information</h2>
            <p><strong>Name:</strong> {plantName}</p>
            <p><strong>Planting Date:</strong> {plantDate}</p>
            <p><strong>Description:</strong> {plantDescription}</p>
            {/* Display additional plant info if available */}
            {plantInfo && <div className="plant-info-modal">{plantInfo}</div>}
            <button onClick={() => setIsModalOpen(false)}>Close</button> {/* Close modal button */}
            <button onClick={() => window.location.href = '/dashboard'}>Go to Dashboard</button> {/* Redirect to dashboard */}
          </div>
        </div>
      )}
    </div>
  );
}

// Export the PlantSearch component for use in other parts of the application
export default PlantSearch;
