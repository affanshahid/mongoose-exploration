const request = require('supertest');
const ObjectId = require('mongoose').Types.ObjectId;

const app = require('../server');
const { Todo } = require('../models/todo');

const todos = [
  { _id: new ObjectId(), text: 'First test todo' },
  { _id: new ObjectId(), text: 'Second test todo', completed: true, completedAt: true }
];

beforeEach(async done => {
  await Todo.remove({});
  await Todo.insertMany(todos);
  done();
});

describe('POST /todos', () => {
  it('should create a new todo', done => {
    const text = 'Test todo text';

    request(app)
      .post('/todos')
      .send({ text })
      .expect(200)
      .expect(res => expect(res.body.text).toBe(text))
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
      .expect(200)
      .expect(res => expect(res.body.todos.length).toBe(2))
      .end(done)
  });
});

describe('GET /todos/:id', () => {
  it('should return todo doc', done => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect(res => expect(res.body.todo.text).toBe(todos[0].text))
      .end(done);
  });

  it('should return 404 if todo not found', done => {
    request(app)
      .get(`/todos/${(new ObjectId()).toHexString()}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object ids', done => {
    request(app)
      .get('/todos/123')
      .expect(404)
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('should remove a todo', done => {
    const id = todos[1]._id.toHexString();

    request(app)
      .delete(`/todos/${id}`)
      .expect(200)
      .expect(res => expect(res.body.todo._id).toBe(id))
      .end(async err => {
        if (err) return done(err);

        const todo = await Todo.findById(id);
        expect(todo).toBeNull();
        done();
      });
  });

  it('should return 404 if todo not found', done => {
    request(app)
      .delete(`/todos/${(new ObjectId()).toHexString()}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 if object id is invalid', done => {
    request(app)
      .delete('/todos/123')
      .expect(404)
      .end(done);
  });
});

describe('PATCH /todos/:id', () => {
  it('should update the todo', done => {
    const text = 'Mock update';

    request(app)
      .patch(`/todos/${todos[0]._id.toHexString()}`)
      .send({ text, completed: true })
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(true);
        expect(typeof res.body.todo.completedAt).toBe('number');
      })
      .end(done)
  });

  it('should clear completedAt when todo is not completed', done => {
    const text = 'Mock update';
    
    request(app)
      .patch(`/todos/${todos[1]._id.toHexString()}`)
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