const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

app.use(express.json());

const JWT_SECRET = 'your-very-secret-key-that-is-long-and-secure';

const mockUser = {
  id: 1,
  username: 'testuser',
  password: 'password123',
};



app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  if (username === mockUser.username && password === mockUser.password) {
    const payload = {
      user: {
        id: mockUser.id,
        username: mockUser.username,
      },
    };

    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '1h' }, 
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});



const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token missing or invalid format' });
  }

  const token = authHeader.split(' ')[1]; // Extract the token from "Bearer <token>"

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded.user;
    
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};


app.get('/protected', authMiddleware, (req, res) => {
  res.json({
    message: 'You have accessed a protected route!',
    user: req.user, 
  });
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});