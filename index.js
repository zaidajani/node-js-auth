const express = require('express');
const bcrypt = require('bcrypt');
const db = require('crud-db');
const port = process.env.PORT || 3000;
const _ = require('lodash');
const Joi = require('joi');
const app = express();

app.use(express.json());

db.initialize();

function validate(user) {
  const schema = {
    name: Joi.string().min(3).max(45).required(),
    password: Joi.string().min(3).required()
  }

  return Joi.validate(user, schema);
}

app.post('/user', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
 
  let salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(req.body.password, salt);

  db.add(req.body.name, {
    'password': password,
    'name': req.body.name
  });

  res.send(db.get(req.body.name).name);
});

app.post('/auth', async (req, res) => {
  const { error } = validate(req.body);
  if(error) return res.status(400).send(error.details[0].message);

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