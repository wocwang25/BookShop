const BOOK = require('../models/Book');

// CRUD
// -> create
//Validate dữ liệu đầu vào. -> Kiểm tra trùng lặp (nếu cần). -> Tạo đối tượng mới từ model. -> Lưu vào db -> Trả về response.
const Book_CRUD = {
    create: async function (req, res) {
        try {
            const { title, author, category, price } = req.body;

            const existingBook = await BOOK.findOne({ title });
            if (existingBook) {
                return res.status(400).json({ message: `${title} already exists` });
            }

            const newBook = new BOOK({
                title,
                author,
                category,
                price
            });
            await newBook.save();

            return res.status(201).json(newBook);
        }
        catch (error) {
            return res.status(500).json({ message: "Error creating book", error })
        }
    }
}