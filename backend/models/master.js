// models/Master.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const MasterSchema = new Schema({
  id: { type: String, index: true },
  idiom: { type: String },
  alternative_idioms: [{ type: String }],
  literal_meaning: { type: String },
  figurative_meaning_bn: { type: String },
  figurative_meaning_en: { type: String },
  similar_in_english: [{ type: String }],
  example_sentences_in_bangla: [{ type: String }],
  example_sentences_in_english: [{ type: String }],
  usage_domain: [{ type: String }],
  tags: [{ type: String }],
  frequency: { type: String },
  sentiment: { type: String },
  historical_significance: { type: Boolean },
  religious_significance: { type: Boolean },
  cultural_significance: { type: Boolean },
  scape: { type: String },
  history: [{ type: String }],
  note: { type: String },

  // ✅ new field
  status: { type: String, enum: ['pending', 'done'], default: 'pending' },

  by: {
    name: String,
    email: String,
    designation: String,
    workplace: String,
    highestDegree: String,
    university: String,
    at: Date
  }
}, { strict: false, collection: 'master', timestamps: true });

module.exports = mongoose.model('Master', MasterSchema);
