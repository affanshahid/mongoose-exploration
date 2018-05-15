const { MongoClient, ObjectID } = require('mongodb');

const DB = 'TodoApp';
(async () => {
  let client;

  try {
    client = await MongoClient.connect(`mongodb://localhost:27017/`, { useNewUrlParser: true })
    console.log('Connected!');

    const db = client.db(DB);
    const results = await db.collection('Todos').deleteMany({ text: 'Eat food' });
    console.log(results);

  } catch (err) {
    console.error(err.stack);
  } finally {
    client.close();
  }
})();