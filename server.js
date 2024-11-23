import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

// Enable CORS
app.use(cors());

// Serve static files from the dist directory
const distPath = resolve(__dirname, './dist');
app.use(express.static(distPath));

// Serve files from public directory
const publicPath = resolve(__dirname, './public');
app.use(express.static(publicPath));

// Handle all routes by serving index.html
app.get('*', (req, res) => {
  res.sendFile(join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Static files being served from:', distPath);
  console.log('Public files being served from:', publicPath);
});
