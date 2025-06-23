// // routes/assets.js
// const express  = require('express');
// const mongoose = require('mongoose');
// const auth     = require('../middleware/auth');
// const router   = express.Router();

// const Asset = mongoose.model('Asset');
// const Base  = mongoose.model('Base');

// /* ─────────  GET /api/assets  ─────────
//  * List assets.  Admins see all, others
//  * only see assets tied to their base.   */
// router.get('/', auth(), async (req, res) => {
//   try {
//     const filter = req.user.role === 'admin' ? {} : { base: req.user.base };
//     const assets = await Asset.find(filter)
//                               .populate('equipmentType', 'name category')
//                               .populate('base', 'name code');
//     res.json(assets);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Could not fetch assets.' });
//   }
// });

// /* ─────────  GET /api/assets/:id  ───────── */
// router.get('/:id', auth(), async (req, res) => {
//   try {
//     const asset = await Asset.findById(req.params.id)
//                              .populate('equipmentType')
//                              .populate('base');
//     if (!asset) return res.status(404).json({ message: 'Asset not found.' });

//     // non‑admin users can only view assets at their own base
//     if (req.user.role !== 'admin' && String(asset.base._id) !== req.user.base)
//       return res.status(403).json({ message: 'Not your base.' });

//     res.json(asset);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Error retrieving asset.' });
//   }
// });

// /* ─────────  POST /api/assets  ─────────
//  * Create asset.  Restricted to admin +
//  * logistics_officer (could be narrowed). */
// /* ---------- POST /api/assets ---------- */
// // router.post('/', auth(['admin', 'logistics_officer']), async (req, res) => {
// //   try {
// //     // easiest: new + save so we can attach options
// //     const asset = new Asset(req.body);
// //     await asset.save({
// //       _audit: {
// //         userId: req.user.uid,
// //         ip:     req.ip,
// //         ua:     req.get('User-Agent')
// //       }
// //     });
// //     res.status(201).json(asset);
// //   } catch (err) {
// //     console.error(err);
// //     res.status(422).json({ message: 'Asset validation failed.', detail: err.message });
// //   }
// // });

// // router.post('/', auth(['admin', 'logistics_officer']), async (req, res) => {
// //   try {
// //     const asset = await Asset.create(
// //       req.body,
// //       {
// //         _audit: {
// //           userId: req.user.uid,
// //           ip: req.ip,
// //           ua: req.get('User-Agent'),
// //         },
// //       }
// //     );
// //     res.status(201).json(asset);
// //   } catch (err) {
// //     console.error(err);
// //     res.status(422).json({
// //       message: 'Asset validation failed.',
// //       detail: err.message,
// //     });
// //   }
// // });


// // /* ---------- PATCH /api/assets/:id ---------- */
// // router.patch('/:id', auth(['admin', 'logistics_officer']), async (req, res) => {
// //   try {
// //     const asset = await Asset.findByIdAndUpdate(
// //       req.params.id,
// //       req.body,
// //       {
// //         new: true,
// //         runValidators: true,
// //         _audit: {
// //           userId: req.user.uid,
// //           ip:     req.ip,
// //           ua:     req.get('User-Agent')
// //         }
// //       }
// //     );
// //     if (!asset) return res.status(404).json({ message: 'Asset not found.' });
// //     res.json(asset);
// //   } catch (err) {
// //     console.error(err);
// //     res.status(422).json({ message: 'Update failed.', detail: err.message });
// //   }
// // });

// // /* ---------- DELETE /api/assets/:id ---------- */
// // router.delete('/:id', auth(['admin']), async (req, res) => {
// //   const removed = await Asset.findByIdAndDelete(
// //     req.params.id,
// //     {
// //       _audit: {
// //         userId: req.user.uid,
// //         ip:     req.ip,
// //         ua:     req.get('User-Agent')
// //       }
// //     }
// //   );
// //   if (!removed) return res.status(404).json({ message: 'Asset not found.' });
// //   res.json({ message: 'Asset deleted.' });
// // });

// // Fix the POST route in assets.js
// router.post('/', auth(['admin', 'logistics_officer']), async (req, res) => {
//   try {
//     const asset = new Asset(req.body);
//     await asset.save({
//       _audit: {
//         userId: req.user.uid,
//         ip: req.ip,
//         ua: req.get('User-Agent'),
//       },
//     });
//     res.status(201).json(asset);
//   } catch (err) {
//     console.error(err);
//     res.status(422).json({
//       message: 'Asset validation failed.',
//       detail: err.message,
//     });
//   }
// });

// // Fix the PATCH route in assets.js
// router.patch('/:id', auth(['admin', 'logistics_officer']), async (req, res) => {
//   try {
//     const asset = await Asset.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       {
//         new: true,
//         runValidators: true,
//         _audit: {
//           userId: req.user.uid,
//           ip: req.ip,
//           ua: req.get('User-Agent')
//         }
//       }
//     );
//     if (!asset) return res.status(404).json({ message: 'Asset not found.' });
//     res.json(asset);
//   } catch (err) {
//     console.error(err);
//     res.status(422).json({ message: 'Update failed.', detail: err.message });
//   }
// });

// // Fix the DELETE route in assets.js
// router.delete('/:id', auth(['admin']), async (req, res) => {
//   try {
//     const removed = await Asset.findByIdAndDelete(
//       req.params.id,
//       {
//         _audit: {
//           userId: req.user.uid,
//           ip: req.ip,
//           ua: req.get('User-Agent')
//         }
//       }
//     );
//     if (!removed) return res.status(404).json({ message: 'Asset not found.' });
//     res.json({ message: 'Asset deleted.' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Delete failed.', detail: err.message });
//   }
// });


// module.exports = router;


const express = require('express');
const router = express.Router();
const Asset = require('../models/asset');
const auth = require('../middleware/auth');

// GET /assets
router.get('/', auth(['admin', 'logistics_officer', 'base_commander']), async (req, res) => {
  try {
    let filter = {};
    if (req.user.role !== 'admin') {
      filter.base = req.user.base;
    }

    const assets = await Asset.find(filter)
      .populate('equipmentType')
      .populate('base');
    res.json(assets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /assets/:id
router.get('/:id', auth(['admin', 'logistics_officer', 'base_commander']), async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('equipmentType')
      .populate('base');
    if (!asset) return res.status(404).json({ message: 'Asset not found.' });

    if (req.user.role !== 'admin' && asset.base._id.toString() !== req.user.base) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    res.json(asset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /assets
router.post('/', auth(['admin', 'logistics_officer']), async (req, res) => {
  try {
    const asset = new Asset(req.body);
    
    // Save with audit options
    await asset.save({
      _audit: {
        userId: req.user.uid,
        ip: req.ip,
        ua: req.get('User-Agent'),
      },
    });
    
    // Populate the saved asset before returning
    await asset.populate(['equipmentType', 'base']);
    
    res.status(201).json(asset);
  } catch (err) {
    console.error('Asset creation error:', err);
    res.status(422).json({
      message: 'Asset validation failed.',
      detail: err.message,
    });
  }
});

// PATCH /assets/:id
router.patch('/:id', auth(['admin', 'logistics_officer']), async (req, res) => {
  try {
    const asset = await Asset.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
        _audit: {
          userId: req.user.uid,
          ip: req.ip,
          ua: req.get('User-Agent')
        }
      }
    ).populate(['equipmentType', 'base']);
    
    if (!asset) return res.status(404).json({ message: 'Asset not found.' });
    
    res.json(asset);
  } catch (err) {
    console.error('Asset update error:', err);
    res.status(422).json({ 
      message: 'Update failed.', 
      detail: err.message 
    });
  }
});

// DELETE /assets/:id
router.delete('/:id', auth(['admin']), async (req, res) => {
  try {
    const asset = await Asset.findByIdAndDelete(
      req.params.id,
      {
        _audit: {
          userId: req.user.uid,
          ip: req.ip,
          ua: req.get('User-Agent')
        }
      }
    );
    
    if (!asset) return res.status(404).json({ message: 'Asset not found.' });
    
    res.json({ message: 'Asset deleted.' });
  } catch (err) {
    console.error('Asset deletion error:', err);
    res.status(500).json({ 
      message: 'Delete failed.', 
      detail: err.message 
    });
  }
});

module.exports = router;
