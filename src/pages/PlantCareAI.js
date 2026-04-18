// Import necessary React modules and CSS styles for the PlantSearch component
import React, { useState } from 'react';
import '../PlantCareAI.css';

// Define the PlantSearch component
function PlantSearch() {
  // Define state variables to manage component data and behavior
  const [plantInfo, setPlantInfo] = useState(''); // Stores plant disease information
  const [chatMessages, setChatMessages] = useState([]); // Stores chat messages
  const [chatInput, setChatInput] = useState(''); // Stores the current user input in chat
  const [isChatOpen, setIsChatOpen] = useState(false); // Manages the visibility of the chat widget
  const [isLoading, setIsLoading] = useState(false); // Indicates if chat response is loading
  const [cameraError, setCameraError] = useState(''); // Stores errors related to camera usage
  const [uploadedImage, setUploadedImage] = useState(null); // Stores the uploaded or captured image URL

  // Function to send a command to the Raspberry Pi to control the camera
  const toggleCamera = (action) => {
    fetch('https://u70oktpbs1.execute-api.ap-southeast-2.amazonaws.com/rgbled/control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: 'rgbLED/control', message: action }), // Define the camera control action (ON/OFF)
    }).catch(error => console.error('Error controlling camera:', error)); // Log any errors
  };

  // Function to take a photo using the Raspberry Pi camera
  const handleTakePhoto = async () => {
    toggleCamera('ON'); // Turn the camera ON
    try {
      // Fetch the list of images from the server
      const response = await fetch('http://localhost:5002/api/images');
      if (!response.ok) {
        throw new Error('Failed to fetch image list from uploads');
      }
      const data = await response.json();

      // Check if there are any images in the uploads
      if (data.length === 0) {
        throw new Error('No images found in uploads');
      }

      // Get the URL of the latest image and update the state
      const latestImage = data[data.length - 1];
      const imageUrl = `http://localhost:5002/uploads/${latestImage}`;
      setUploadedImage(imageUrl); // Display the captured image
      setCameraError(''); // Clear any previous camera errors

      // Fetch the image as a blob for identification
      const imgResponse = await fetch(imageUrl);
      const imgBlob = await imgResponse.blob();
      await identifyPlant(imgBlob); // Identify the plant in the image
    } catch (error) {
      console.error('Error accessing photo:', error);
      setCameraError('Unable to access photos. Please check connection.');
    } finally {
      toggleCamera('OFF'); // Turn the camera OFF after capturing the image
    }
  };

  // Function to identify the plant using the plant identification API
  const identifyPlant = async (blob) => {
    const formData = new FormData();
    formData.append('images', blob, 'photo.jpg'); // Append the image blob to the form data

    try {
      // Send the image to the plant identification API
      const response = await fetch('https://plant.id/api/v3/health_assessment', {
        method: 'POST',
        headers: {
          'Api-Key': 'lygqLRbAsdaSwJLFhRiVJwdNGD2j0igPcAeh2Nm0vuBUIedH7h', // API key for authentication
        },
        body: formData, // Attach the form data to the request
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Parse the response to extract plant health information
      const result = await response.json();
      const suggestions = result.result?.disease?.suggestions;
      if (suggestions && suggestions.length > 0) {
        const healthInfo = suggestions.map((suggestion) => {
          const probabilityPercentage = (suggestion.probability * 100).toFixed(2);
          return `Disease: ${suggestion.name}, Probability: ${probabilityPercentage}%`;
        }).join("\n");
        setPlantInfo(healthInfo); // Update the plant information state
      } else {
        setPlantInfo('No disease suggestions found.');
      }
    } catch (error) {
      console.error('Error identifying the plant:', error);
      setPlantInfo('Error identifying the plant.');
    }
  };

  // Function to handle image upload and plant identification
  const handleUpload = (event) => {
    const file = event.target.files[0]; // Get the uploaded file
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Convert the image to a blob and identify the plant
        const base64data = reader.result.split(",")[1];
        const binary = atob(base64data);
        const array = [];
        for (let i = 0; i < binary.length; i++) {
          array.push(binary.charCodeAt(i));
        }
        const blob = new Blob([new Uint8Array(array)], { type: 'image/jpeg' });
        identifyPlant(blob); // Identify the plant in the uploaded image
        const imageUrl = URL.createObjectURL(blob); // Create a URL for the uploaded image
        setUploadedImage(imageUrl); // Display the uploaded image
      };
      reader.readAsDataURL(file); // Read the uploaded file as a data URL
    }
  };

  // Function to handle chat message submission
  const handleChatSubmit = async (event) => {
    event.preventDefault(); // Prevent form submission from refreshing the page
    if (!chatInput.trim()) return; // Do nothing if chat input is empty

    // Add the user's message to the chat
    const userMessage = { sender: 'user', text: chatInput };
    setChatMessages((prevMessages) => [...prevMessages, userMessage]);
    setChatInput(''); // Clear the chat input field
    setIsLoading(true); // Set loading state to true

    try {
      // Send the user's message to the chatbot API
      const response = await fetch('https://api.deepbricks.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-Ya1lYbp8LYSBosl7WLBiWcaYCBaWCRoRMlABV0UBPubQPghg' // API key for authentication
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: chatInput }],
        }),
      });

      if (!response.ok) {
        throw new Error('Error fetching chat response');
      }

      // Add the chatbot's response to the chat
      const data = await response.json();
      const botMessage = {
        sender: 'bot',
        text: data.choices[0].message.content,
      };

      setChatMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: 'Error retrieving response. Please try again later.' },
      ]);
    } finally {
      setIsLoading(false); // Set loading state to false
    }
  };

  return (
    <div className="plant-search-container">
      <h1>Know more about your plants</h1>

      {/* Image upload and photo capture buttons */}
      <div className="button-container">
        <input type="file" id="upload" style={{ display: 'none' }} onChange={handleUpload} />
        <button onClick={() => document.getElementById('upload').click()}>Upload</button>
        <button onClick={handleTakePhoto}>Take Photo</button>
      </div>

      {/* Display camera error if any */}
      {cameraError && <p className="error">{cameraError}</p>}

      {/* Display the uploaded or captured image */}
      <div className="image-display">
        {uploadedImage && <img src={uploadedImage} alt="Captured from Raspberry Pi" />}
      </div>

      {/* Display plant health information */}
      <div className="plant-info">
        {plantInfo && (
          <table>
            <thead>
              <tr>
                <th>Disease</th>
                <th>Probability</th>
              </tr>
            </thead>
            <tbody>
              {plantInfo.split('Disease: ').slice(1).map((info, index) => {
                const [disease, probability] = info.split(', Probability: ');
                return (
                  <tr key={index}>
                    <td>{disease.trim()}</td>
                    <td>{probability.trim()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Chat widget */}
      <div className={`chat-widget ${isChatOpen ? 'open' : ''}`}>
        <div className="chat-icon" onClick={() => setIsChatOpen(!isChatOpen)}>
          <img src="/Picture2.png" alt="Chat" />
        </div>
        {isChatOpen && (
          <div className="chat-box">
            <div className="chat-header">
              <h3>Plant AI Assistant</h3>
            </div>
            <div className="chat-body">
              {chatMessages.map((message, index) => (
                <div key={index} className={`chat-message ${message.sender}`}>
                  <p>{message.text}</p>
                </div>
              ))}
              {isLoading && <div className="chat-message bot">Typing...</div>}
            </div>
            <form onSubmit={handleChatSubmit} className="chat-input">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
              />
              <button type="submit">Send</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// Export the PlantSearch component
export default PlantSearch;
