const express = require('express');
const bcrypt = require('bcrypt');
const db = require('crud-db');
const port = process.env.PORT || 3000;
const _ = require('lodash');
const app = express();

app.use(express.json());

db.initialize();

app.post('/user', async (req, res) => {
  let salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(req.body.password, salt);

  db.add(req.body.name, {
    'password': password,
    'name': req.body.name
  });

  res.send(db.get(req.body.name).name);
});

app.post('/auth', async (req, res) => {
  if (!db.get(req.body.name)) {
    return res.status(404).send('application not found');
  }

  let msg;

  msg = await bcrypt.compare(req.body.password, db.get(req.body.name).password);

  if (msg == true) {
    return res.send('authentication successful');
  }
  else {
    return res.send('authentication failed');
  }
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});