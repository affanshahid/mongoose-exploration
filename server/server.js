const express = require('express');
require('express-async-errors');

const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');

const ObjectId = mongoose.Types.ObjectId;
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

app.get('/todos/:id', async (req, res) => {
  const { id } = req.params;
  
  if (!ObjectId.isValid(id)) return res.status(404).send();
  
  try {
    const todo = await Todo.findById(id);
    if (!todo) return res.status(404).send();
    res.json({ todo });
  } catch (err) {
    res.status(400).send();
  }
});

app.delete('/todos/:id', async (req, res) => {
  const { id } = req.params;

  if(!ObjectId.isValid(id)) return res.status(404).send();

  try {
    const todo = await Todo.findByIdAndRemove(id);
    if (!todo) return res.status(404).send();
    res.json({ todo });
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = app;