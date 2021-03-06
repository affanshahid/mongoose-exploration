const request = require('supertest');
const ObjectId = require('mongoose').Types.ObjectId;

const app = require('../server');
const { Todo } = require('../models/todo');
const { User } = require('../models/user');
const { todos, populateTodos, users, populateUsers } = require('./seed/seed');

beforeEach(done => {
  populateUsers().then(populateTodos).then(done);
});

describe('POST /todos', () => {
  it('should create a new todo', done => {
    const text = 'Test todo text';

    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({ text })
      .expect(200)
      .expect(res => expect(res.body.todo.text).toBe(text))
      .end(async (err, res) => {
        if (err) return done(err);

        try {
          const todos = await Todo.find({ text });
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        } catch (err) {
          done(err);
        }
      });
  });

  it('should not create todo with invalid body data', done => {
    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)      
      .send({})
      .expect(400)
      .end(async (err, res) => {
        if (err) return done(err);

        try {
          const todos = await Todo.find();
          expect(todos.length).toBe(2);
          done();
        } catch (err) {
          done(err);
        }
      });
  });
});

describe('GET /todos', () => {
  it('should get all todos', done => {
    request(app)
      .get('/todos')
      .set('x-auth', users[0].tokens[0].token)      
      .expect(200)
      .expect(res => expect(res.body.todos.length).toBe(1))
      .end(done)
  });
});

describe('GET /todos/:id', () => {
  it('should return todo doc', done => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => expect(res.body.todo.text).toBe(todos[0].text))
      .end(done);
  });

  it('should return 404 if todo not found', done => {
    request(app)
      .get(`/todos/${(new ObjectId()).toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)      
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object ids', done => {
    request(app)
      .get('/todos/123')
      .set('x-auth', users[0].tokens[0].token)      
      .expect(404)
      .end(done);
  });

  it('should not return todo doc created by other user', done => {
    request(app)
      .get(`/todos/${todos[1]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('should remove a todo', done => {
    const id = todos[1]._id.toHexString();

    request(app)
      .delete(`/todos/${id}`)
      .set('x-auth', users[1].tokens[0].token)      
      .expect(200)
      .expect(res => expect(res.body.todo._id).toBe(id))
      .end(async err => {
        if (err) return done(err);

        const todo = await Todo.findById(id);
        expect(todo).toBeNull();
        done();
      });
  });

  it('should not remove a todo created by another user', done => {
    const id = todos[0]._id.toHexString();

    request(app)
      .delete(`/todos/${id}`)
      .set('x-auth', users[1].tokens[0].token)     
      .expect(404)
      .end(async err => {
        if (err) return done(err);

        const todo = await Todo.findById(id);
        expect(todo).toEqual(expect.anything());
        done();
      });
  });

  it('should return 404 if todo not found', done => {
    request(app)
      .delete(`/todos/${(new ObjectId()).toHexString()}`)
      .set('x-auth', users[1].tokens[0].token)           
      .expect(404)
      .end(done);
  });

  it('should return 404 if object id is invalid', done => {
    request(app)
      .delete('/todos/123')
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('PATCH /todos/:id', () => {
  it('should update the todo', done => {
    const text = 'Mock update';

    request(app)
      .patch(`/todos/${todos[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .send({ text, completed: true })
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(true);
        expect(typeof res.body.todo.completedAt).toBe('number');
      })
      .end(done)
  });

  it('should not update todo created by other user', done => {
    const text = 'Mock update';

    request(app)
      .patch(`/todos/${todos[1]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .send({ text, completed: true })
      .expect(404)
      .end(done)
  });

  it('should clear completedAt when todo is not completed', done => {
    const text = 'Mock update';

    request(app)
      .patch(`/todos/${todos[1]._id.toHexString()}`)
      .set('x-auth', users[1].tokens[0].token)      
      .send({ completed: false, text })
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toBeNull();
      })
      .end(done)
  });
});

describe('GET /users/me', () => {
  it('should return user if authenticated', done => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('should return 401 if not authenticated', done => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect(res => expect(res.body).toEqual({}))
      .end(done);
  });
});

describe('POST /users', () => {
  it('should create a user', done => {
    const email = 'affan.123@example.com';
    const password = 12345566;

    request(app)
      .post('/users')
      .send({ email, password })
      .expect(200)
      .expect(res => {
        expect(res.headers).toHaveProperty('x-auth');
        expect(res.body.user._id).toEqual(expect.anything());
        expect(res.body.user.email).toBe(email);
      })
      .end(async (err, res) => {
        if (err) return done(err);

        try {
          const user = await User.findOne({ email });
          expect(user).toEqual(expect.anything());
          expect(user.password).not.toBe(password);
          done();
        } catch (err) {
          done(err);
        }
      });
  });

  it('should return validation errors if request invalid', done => {
    const email = 'affan';
    const password = 126;

    request(app)
      .post('/users')
      .send({ email, password })
      .expect(400)
      .end(done);
  });

  it('should not create user if email in use', done => {
    const email = users[0].email;
    const password = 1211111116;

    request(app)
      .post('/users')
      .send({ email, password })
      .expect(400)
      .end(done);
  });
});

describe('POST /users/login', () => {
  it('should login user and return auth token', done => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect(res => expect(res.headers).toHaveProperty('x-auth'))
      .end(async (err, res) => {
        if (err) return done(err);

        try {
          const user = await User.findById(users[1]._id);
          expect(user.tokens[1]).toEqual(expect.objectContaining({
            access: 'auth',
            token: res.headers['x-auth']
          }));
          done();
        } catch (err) {
          done(err);
        }
      });
  });

  it('should reject invalid login', done => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password + '1234'
      })
      .expect(400)
      .expect(res => expect(res.headers).not.toHaveProperty('x-auth'))
      .end(async (err, res) => {
        if (err) return done(err);

        try {
          const user = await User.findById(users[1]._id);
          expect(user.tokens.length).toBe(1);
          done();
        } catch (err) {
          done(err);
        }
      });
  });
});

describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout', done => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end(async (err, res) => {
        if (err) return done(err);

        try {
          const user = await User.findById(users[0]._id);
          expect(user.tokens.length).toBe(0);
          done();
        } catch (err) {
          done(err);
        }
      });
  });
});