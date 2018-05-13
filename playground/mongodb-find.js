const { MongoClient, ObjectID } = require('mongodb');

const DB = 'TodoApp';
(async () => {
  let client;

  try {
    client = await MongoClient.connect(`mongodb://localhost:27017/`, { useNewUrlParser: true })
    console.log('Connected!');

    const db = client.db(DB);
    const results = await db.collection('Todos').find({
      _id: new ObjectID('5af842f0c0b842ae04907f0b')
    }).toArray();
    console.log(JSON.stringify(results, null, 2));

  } catch (err) {
    console.error(err.stack);
  } finally {
    client.close();
  }
})();