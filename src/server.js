import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';

import router from './routes/routes.js';

dotenv.config();

const PORT = process.env.PORT || 3333;

const app = express();
app.use(express.json());
app.use(helmet());
app.use(cors());

app.use('/api', router);

app.get('/', (req, res) => {
    res.send('Organizer API running!');
});

app.listen(PORT, () => console.log(`Server started on port http://localhost:${PORT} 🚀`));