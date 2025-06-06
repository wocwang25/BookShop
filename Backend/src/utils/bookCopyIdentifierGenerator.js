const BookCopy = require('../models/BookCopy');

exports.generateCopyIdentifier = async (bookId, bookTitle, authorName, session = null) => {
    // 1. Rút gọn tên sách và tác giả
    const formatPart = (str, maxLength = 5) => {
        if (!str) return 'N/A';
        const words = str.split(' ').filter(Boolean);
        if (words.length === 0) return 'N/A';
        // Lấy chữ cái đầu của mỗi từ và giới hạn độ dài
        let abbr = words.map(w => w[0].toUpperCase()).join('');
        return abbr.length > maxLength ? abbr.substring(0, maxLength) : abbr;
    };

    const titleAbbr = formatPart(bookTitle, 5); // VD: Harry Potter -> HP
    const authorAbbr = formatPart(authorName, 3); // VD: J.K. Rowling -> JKR

    // 2. Lấy số thứ tự tiếp theo cho cuốn sách này
    // Dùng countDocuments để lấy số lượng bản copy hiện có, sau đó thêm 1
    // Cần phải chạy trong transaction nếu bạn muốn đảm bảo tính duy nhất tuyệt đối trong trường hợp đồng thời cao.
    // Nếu không, có thể có race condition dẫn đến trùng lặp, nhưng index unique sẽ bắt lỗi.
    const currentCount = await BookCopy.countDocuments(
        { book: bookId },
        session ? { session } : undefined
    );
    const sequenceNumber = (currentCount + 1).toString().padStart(3, '0'); // VD: 001, 002,...

    return `${titleAbbr}-${authorAbbr}-${sequenceNumber}`;
};