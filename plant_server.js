const express = require('express');
const app = express();
const fs = require('fs');

app.use(express.json());

app.post('/receive-data', (req, res) => {
    const { scientificName } = req.body;
    fs.writeFileSync('scientific_name.txt', scientificName);
    res.send('Data received and saved!');
});

app.listen(5003, () => {
    console.log('Server running on port 5003');
});
