// Import necessary modules from React and React Router
import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation between routes
import './Navbar.css'; // Import CSS for styling the Navbar component

// Define the Navbar component
const Navbar = () => {
  return (
    // Navigation container
    <nav className="navbar">
      
      {/* Unordered list for navigation links */}
      <ul>
        {/* List item with a Link component for navigating to the homepage */}
        <li><Link to="/">Homepage</Link></li>
        
        {/* List item with a Link component for navigating to the dashboard */}
        <li><Link to="/dashboard">Dashboard</Link></li>
        
        {/* List item with a Link component for navigating to the plant timeline */}
        <li><Link to="/plant-timeline">Plant timeline</Link></li>
        
        {/* List item with a Link component for navigating to the plant gallery */}
        <li><Link to="/plant-gallery">Plant Gallery</Link></li>
        
        {/* List item with a Link component for navigating to the plant care AI page */}
        <li><Link to="/plant-care-ai">Plant Care AI</Link></li>
      </ul>
    </nav>
  );
};

// Export the Navbar component for use in other parts of the application
export default Navbar;
