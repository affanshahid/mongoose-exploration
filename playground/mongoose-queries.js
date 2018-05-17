const { mongoose } = require('../server/db/mongoose');
const { Todo } = require('../server/models/todo');

const _id = '6afe0aa7db994c2eb96ca715';

Todo.find({ _id }).then(console.log);

Todo.findOne({ _id }).then(console.log);

Todo.findById(_id).then(console.log);