// Import necessary React modules
import React from 'react';
// Import CSS file for styling the start page
import '../startpage.css'; 

// Main App component definition
function App() {
  return (
    <div className="container"> {/* Main container for the start page */}
      
      {/* Header section of the start page */}
      <header className="header">
        <h1>Smart plant care system</h1> {/* Main title of the page */}
        <p>It's time to water your plant ...</p> {/* Description or call-to-action */}
        
        {/* Start button to navigate to the plant gallery page */}
        <button 
          className="start-button" 
          onClick={() => window.location.href = 'http://localhost:3000/plant-gallery'} // Redirect to plant gallery
        >
          let's get started
        </button>
      </header>

      {/* Image container to display an illustration */}
      <div className="image-container">
        {/* Display an image of a farmer watering plants */}
        <img 
          src="/Picture1.png" // Ensure the image path is correct
          alt="Farmer watering plants" // Alt text for accessibility
          className="farmer-image" // CSS class for styling the image
        />
      </div>
    </div>
  );
}

// Export the App component for use in other parts of the application
export default App;
