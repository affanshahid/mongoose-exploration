const ObjectId = require('mongoose').Types.ObjectId;
const jwt = require('jsonwebtoken');

const { Todo } = require('../../models/todo');
const { User } = require('../../models/user');

const todos = [
  { _id: new ObjectId(), text: 'First test todo' },
  { _id: new ObjectId(), text: 'Second test todo', completed: true, completedAt: true }
];

const userOneId = new ObjectId();
const userTwoId = new ObjectId();
const users = [
  {
    _id: userOneId,
    email: 'andrew@example.com',
    password: 'user1.pass',
    tokens: [{
      access: 'auth',
      token: jwt.sign({ access: 'auth', _id: userOneId }, 'abc123').toString()
    }]
  },
  {
    _id: userTwoId,
    email: 'affan@example.com',
    password: 'user2.pass'
  }
];

const populateTodos = async () => {
  await Todo.remove({});
  await Todo.insertMany(todos);
};

const populateUsers = async () => {
  await User.remove({});
  await Promise.all(users.map(user => new User(user).save()));
};

module.exports = {
  populateTodos,
  populateUsers,
  users,
  todos
};