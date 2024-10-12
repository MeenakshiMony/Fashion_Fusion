const express = require('express');
const {
  postComment,
  getComments,
  likeComment,
} = require('../controllers/communityController');
const router = express.Router();

router.post('/comment', postComment);
router.get('/comments/:outfitId', getComments);
router.post('/like/:commentId', likeComment);

module.exports = router;
