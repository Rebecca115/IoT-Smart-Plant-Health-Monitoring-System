// Import React library, which is needed to create React components
import React from 'react';

// Import CSS styles for the Footer component
import '../footer.css';

// Define the Footer component
function Footer() {
  return (
    // Define the footer element with a class name for styling
    <footer className="footer">
      &copy; 2024 UWA CITS5506 IOT GROUP5 {/* Display copyright text */}
    </footer>
  );
}

// Export the Footer component so it can be used in other parts of the application
export default Footer;
