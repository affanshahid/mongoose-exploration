const { MongoClient, ObjectID } = require('mongodb');

const DB = 'TodoApp';
(async () => {
  let client;

  try {
    client = await MongoClient.connect(`mongodb://localhost:27017/`, { useNewUrlParser: true })
    console.log('Connected!');

    const db = client.db(DB);
    // const results = await db.collection('Todos').findOneAndUpdate({
    //   _id: new ObjectID('5af83f9440bd2aadd0f1e271')
    // }, {
    //   $set: {
    //     completed: true
    //   }
    // }, {
    //   returnOriginal: false
    // });

    const results = await db.collection('Users').findOneAndUpdate({
      name: 'Affan'
    }, {
      $set: { name: 'John '},
      $inc: { age: 1 }
    }, {
      returnOriginal: false
    });

    console.log(results);

  } catch (err) {
    console.error(err.stack);
  } finally {
    client.close();
  }
})();