// routes/master.js
const express = require('express');
const mongoose = require('mongoose');
const Master = require('../models/master');
const auth = require('../middleware/auth');

const router = express.Router();

// GET list with pagination, optional q text search (needs text index), tag, usage, fields
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.tag) filter.tags = req.query.tag;
    if (req.query.usage) filter.usage_domain = req.query.usage;

    let query;
    if (req.query.q && req.query.q.trim()) {
      // Use regex search instead of text index for better compatibility
      const searchRegex = new RegExp(req.query.q.trim(), 'i');
      const searchFilter = {
        ...filter,
        $or: [
          { idiom: searchRegex },
          { figurative_meaning_bn: searchRegex },
          { figurative_meaning_en: searchRegex },
          { literal_meaning: searchRegex }
        ]
      };
      query = Master.find(searchFilter).sort({ id: 1, updatedAt: -1 }); // Sort by ID first, then by updatedAt
    } else {
      query = Master.find(filter).sort({ id: 1, updatedAt: -1 }); // Sort by ID first, then by updatedAt
    }

    const fields = req.query.fields ? req.query.fields.split(',').join(' ') : '';
    const docs = await query.skip(skip).limit(limit).select(fields).lean().exec();
    const total = await Master.countDocuments(filter);

    res.json({ page, limit, total, docs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching list', error: err.message });
  }
});

// GET single by ObjectId or by custom id field
router.get('/:id', async (req, res) => {
  const raw = req.params.id;
  try {
    let doc = null;
    if (mongoose.Types.ObjectId.isValid(raw)) {
      doc = await Master.findById(raw).lean();
    }
    if (!doc) {
      doc = await Master.findOne({ id: raw }).lean();
    }
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching doc', error: err.message });
  }
});

// GET next available ID (for navigation after marking as done)
router.get('/next/:currentId', async (req, res) => {
  const currentId = req.params.currentId;
  try {
    // Find the next document after the current ID (sorted by custom id field)
    const nextDoc = await Master.findOne({ 
      $or: [
        { id: { $gt: parseInt(currentId) } },
        { id: { $gt: currentId } }
      ]
    }).sort({ id: 1 }).select('_id id').lean();

    if (nextDoc) {
      res.json({ nextId: nextDoc._id, customId: nextDoc.id });
    } else {
      // If no next document, return null
      res.json({ nextId: null, customId: null });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error finding next document', error: err.message });
  }
});

// GET random pending idiom (for Quick button)
router.get('/random/pending', async (req, res) => {
  try {
    // Get count of pending documents
    const pendingCount = await Master.countDocuments({ 
      $or: [
        { status: 'pending' },
        { status: { $exists: false } },
        { status: null }
      ]
    });
    
    if (pendingCount === 0) {
      return res.json({ randomId: null, message: 'No pending idioms found' });
    }
    
    // Get a random pending document
    const randomSkip = Math.floor(Math.random() * pendingCount);
    const randomDoc = await Master.findOne({
      $or: [
        { status: 'pending' },
        { status: { $exists: false } },
        { status: null }
      ]
    }).skip(randomSkip).select('_id id').lean();

    if (randomDoc) {
      res.json({ randomId: randomDoc._id, customId: randomDoc.id });
    } else {
      res.json({ randomId: null, message: 'No pending idioms found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error finding random pending idiom', error: err.message });
  }
});

// PUT update (authenticated). Only allow schema fields to be set, plus stamp `by`.
router.put('/:id', auth, async (req, res) => {
  const raw = req.params.id;
  try {
    const query = mongoose.Types.ObjectId.isValid(raw) ? { _id: raw } : { id: raw };

    const allowedFields = [
      'id', 'idiom', 'alternative_idioms', 'literal_meaning', 'figurative_meaning_bn',
      'figurative_meaning_en', 'similar_in_english', 'example_sentences_in_bangla',
      'example_sentences_in_english', 'usage_domain', 'tags', 'frequency', 'sentiment',
      'historical_significance', 'religious_significance', 'cultural_significance',
      'scape', 'history', 'note', 'status'
    ];

    const setPayload = {};
    for (const key of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        setPayload[key] = req.body[key];
      }
    }

    // Stamp `by` from authenticated user
    setPayload.by = {
      name: req.user.name,
      email: req.user.email,
      designation: req.user.designation,
      workplace: req.user.workplace,
      highestDegree: req.user.highestDegree,
      university: req.user.university,
      at: new Date()
    };

    const updated = await Master.findOneAndUpdate(query, { $set: setPayload }, { new: true }).lean();
    if (!updated) return res.status(404).json({ message: 'Document not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
});

module.exports = router;
