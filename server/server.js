require('./config/config');
const express = require('express');
require('express-async-errors');
const { pick } = require('lodash');

const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');
const authenticate = require('./middleware/authenticate');

const ObjectId = mongoose.Types.ObjectId;
const app = express();

app.use(express.json());

app.post('/todos', async (req, res) => {
  const todo = new Todo({
    text: req.body.text
  });

  try {
    await todo.save();
    res.json({ todo });
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

  if (!ObjectId.isValid(id)) return res.status(404).send();

  try {
    const todo = await Todo.findByIdAndRemove(id);
    if (!todo) return res.status(404).send();
    res.json({ todo });
  } catch (err) {
    res.status(400).send(err);
  }
});

app.patch('/todos/:id', async (req, res) => {
  const { id } = req.params;

  const body = pick(req.body, ['text', 'completed']);

  if (!ObjectId.isValid(id)) return res.status(404).send();

  if (body.completed === true) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  try {
    const todo = await Todo.findByIdAndUpdate(id, { $set: body }, { new: true });
    if (!todo) return res.status(404).send();
    res.json({ todo });
  } catch (err) {
    res.status(400).send();
  }
});

app.post('/users', async (req, res) => {
  const body = pick(req.body, ['password', 'email']);
  const user = new User(body);

  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.header('x-auth', token).json({ user });
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get('/users/me', authenticate, async (req, res) => {
  res.json(req.user);
});

module.exports = app;