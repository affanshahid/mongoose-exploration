const { MongoClient, ObjectID } = require('mongodb');

console.log(new ObjectID().toString())

const DB = 'TodoApp';
// (async () => {
//   let client;

//   try {
//     client = await MongoClient.connect(`mongodb://localhost:27017/${DB}`, { useNewUrlParser: true })
//     console.log('Connected!');

//     const db = client.db(DB);
//     const result = await db.collection('Users').insertOne({
//       name: 'Affan',
//       age: 24,
//       location: 'Pakistan'
//     });

//     console.log(JSON.stringify(result.ops, undefined, 2));
//   } catch (err) {
//     console.error(err.stack);
//   } finally {
//     client.close();
//   }
// })();