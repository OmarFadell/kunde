// utils/getNextSequence.js
const Counter = require('../models/counter');

async function getNextSequence(name) {
  const updated = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true } // create if not exists
  );

  return updated.seq;
}

module.exports = getNextSequence;
