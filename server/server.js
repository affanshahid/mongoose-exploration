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

app.post('/todos', authenticate, async (req, res) => {
  const todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });

  try {
    await todo.save();
    res.json({ todo });
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get('/todos', authenticate, async (req, res) => {
  const todos = await Todo.find({ _creator: req.user._id });
  res.json({ todos });
});

app.get('/todos/:id', authenticate, async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) return res.status(404).send();

  try {
    const todo = await Todo.findOne({ _id: id, _creator: req.user._id });
    if (!todo) return res.status(404).send();
    res.json({ todo });
  } catch (err) {
    res.status(400).send();
  }
});

app.delete('/todos/:id', authenticate, async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) return res.status(404).send();

  try {
    const todo = await Todo.findOneAndRemove({ _id: id, _creator: req.user._id });
    if (!todo) return res.status(404).send();
    res.json({ todo });
  } catch (err) {
    res.status(400).send(err);
  }
});

app.patch('/todos/:id', authenticate, async (req, res) => {
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
    const todo = await Todo.findOneAndUpdate({ _id: id, _creator: req.user._id }, { $set: body }, { new: true });
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

app.post('/users/login', async (req, res) => {
  const body = pick(req.body, ['email', 'password']);

  try {
    const user = await User.findByCredentials(body.email, body.password);
    const token = await user.generateAuthToken();
    res.header('x-auth', token).json({ user });
  } catch (err) {
    res.status(400).send();
  }
});

app.delete('/users/me/token', authenticate, async (req, res) => {
  try {
    await req.user.removeToken(req.token);
    res.send();
  } catch (err) {
    res.status(400).send();
  }
});

module.exports = app;