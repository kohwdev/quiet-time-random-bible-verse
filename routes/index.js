const express = require('express')
const router = express.Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')
const Story = require('../models/Story')
const axios = require('axios')
const bibleBooks = require('./bibleBooks.json')

// @desc    Login/Landing page
// @route   GET /
router.get('/', ensureGuest, (req, res) => {
  res.render('login', {
    layout: 'login',
  })
})

const BASE_URL = 'https://bible-api.com/';

// Function to fetch a random Bible verse
async function getRandomBibleVerse() {
  const randomBook = bibleBooks[Math.floor(Math.random() * bibleBooks.length)];
  const randomChapter = Math.floor(Math.random() * (randomBook.TotalChapters - 1 + 1)) + 1;

  const response = await axios.get(`${BASE_URL}${randomBook.Book}+${randomChapter}?translation=kjv`);

  if (response.data && response.data.verses) {
    const verses = response.data.verses;
    const randomIndex = Math.floor(Math.random() * verses.length);
    const randomVerse = verses[randomIndex];

    return {
      verseText: randomVerse.text,
      verseReference: `${response.data.reference}:${randomVerse.verse}`,
    };
  } else {
    throw new Error('Invalid API response');
  }
}

// @desc    Dashboard
// @route   GET /dashboard
router.get('/dashboard', ensureAuth, async (req, res) => {
  try {
    const bibleVerse = await getRandomBibleVerse();
    const stories = await Story.find({ user: req.user.id }).lean();

    res.render('dashboard', {
      name: req.user.firstName,
      stories,
      verseText: bibleVerse.verseText,
      verseReference: bibleVerse.verseReference,
    });
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});



module.exports = router;

