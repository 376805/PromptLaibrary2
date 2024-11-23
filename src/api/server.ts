import express from 'express';
import cors from 'cors';
import { router as templateRouter } from './templates';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/templates', templateRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 