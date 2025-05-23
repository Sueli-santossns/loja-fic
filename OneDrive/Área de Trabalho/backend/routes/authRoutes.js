const express = require('express');
const router = express.Router();
const User = require('../models/user');
const generateToken = require('../utils/generateToken');

// Cadastro
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  const userExists = await User.findOne({ username });
  if (userExists) {
    return res.status(400).json({ message: 'Usuário já existe' });
  }

  const newUser = new User({ username, password });
  await newUser.save();

  res.status(201).json({
    _id: newUser._id,
    username: newUser.username,
    token: generateToken(newUser._id),
  });
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (user && await user.matchPassword(password)) {
    res.json({
      _id: user._id,
      username: user.username,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Credenciais inválidas' });
  }
});


module.exports = router;
