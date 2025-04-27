require('dotenv').config();
const express = require('express');
const body_parser = require('body-parser');
const path = require('path');
const app = express();

const connectDB = require('../config/db');
connectDB();
const { removeVietnameseTones } = require('./removeVNtones');
const mongoose = require('mongoose');
const Book = require('../models/Book');
const Author = require('../models/Author')
const Category = require('../models/Category')


async function updateBookSearchField() {
    try {
        // Kết nối MongoDB
        console.log('MongoDB connected.');

        const books = await Book.find();
        for (const book of books) {
            book.title_search = removeVietnameseTones(book.title)
            book.author_search = removeVietnameseTones(book.author)
            book.category_search = removeVietnameseTones(book.category)

            await book.save();
        }

        console.log('Update completed.');
    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB disconnected.');
    }
}

updateBookSearchField();