import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './Navbar.css';
import Homepage from './pages/startpage'; // Ensure this matches the actual file name
import Dashboard from './pages/dashboardpage'; // Ensure this matches the actual file name
import PlantTimeline from './pages/PlantTimeline'; // Correct file name and path
import PlantGallery from './pages/PlantGallery'; // Ensure case-sensitivity
import PlantCareAI from './pages/PlantCareAI'; // Ensure case-sensitivity
import Footer from './pages/footer'; // 引入 Footer 组件

function App() {
    const [question, setQuestion] = useState('');
    const [response, setResponse] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadResult, setUploadResult] = useState('');

    // 处理问题提交
    const handleSubmitQuestion = async (event) => {
        event.preventDefault();

        try {
            const res = await fetch('/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question })
            });

            const data = await res.json();

            // 提取从后端返回的内容
            const assistantResponse = data.response.choices[0].message.content;
            setResponse(assistantResponse);
        } catch (error) {
            console.error('Error:', error);
            setResponse('Error communicating with the server');
        }
    };

    // 处理图片上传
    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleSubmitImage = async (event) => {
        event.preventDefault();

        if (!selectedFile) {
            alert('Please select a file');
            return;
        }

        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            const res = await fetch('/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            setUploadResult(data.message);
        } catch (error) {
            console.error('Error uploading image:', error);
            setUploadResult('Error uploading the image');
        }
    };

    return (
        <Router>
            <div>
                <nav className="navbar">
                    <ul>
                        <li><Link to="/">Homepage</Link></li>
                        <li><Link to="/dashboard">Dashboard</Link></li>
                        <li><Link to="/plant-timeline">Plant Timeline</Link></li>
                        <li><Link to="/plant-gallery">Plant Gallery</Link></li>
                        <li><Link to="/plant-care-ai">Plant Care AI</Link></li>
                    </ul>
                </nav>

                <Routes>
                    <Route path="/" element={<Homepage />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/plant-timeline" element={<PlantTimeline />} />
                    <Route path="/plant-gallery" element={<PlantGallery />} />
                    <Route path="/plant-care-ai" element={<PlantCareAI />} />
                </Routes>

                <Footer /> {/* Include Footer component */}
            </div>
        </Router>
    );
}

export default App;
