const express = require('express');
require('express-async-errors');

const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');

const app = express();

app.use(express.json());

app.post('/todos', async (req, res) => {
  const todo = new Todo({
    text: req.body.text
  });

  try {
    await todo.save();
    res.json(todo);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get('/todos', async (req, res) => {
  const todos = await Todo.find();
  res.json({ todos });
});

module.exports = app;