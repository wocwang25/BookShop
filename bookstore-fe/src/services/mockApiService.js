// src/services/mockApiService.js
// Mock API service để test khi backend chưa sẵn sàng

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApiService = {
    books: {
        getAllBooks: async () => {
            await delay(1000); // Simulate network delay
            return {
                data: [
                    {
                        id: 1,
                        title: "Lập trình JavaScript",
                        author: "Nguyễn Văn A",
                        stock: 15,
                        price: 250000,
                        category: "Công nghệ"
                    },
                    {
                        id: 2,
                        title: "Học React từ cơ bản",
                        author: "Trần Thị B",
                        stock: 25,
                        price: 300000,
                        category: "Công nghệ"
                    },
                    {
                        id: 3,
                        title: "Database Design",
                        author: "Lê Văn C",
                        stock: 8,
                        price: 400000,
                        category: "Công nghệ"
                    },
                    {
                        id: 4,
                        title: "Node.js Advanced",
                        author: "Phạm Thị D",
                        stock: 30,
                        price: 350000,
                        category: "Công nghệ"
                    },
                    {
                        id: 5,
                        title: "UI/UX Design",
                        author: "Hoàng Văn E",
                        stock: 12,
                        price: 280000,
                        category: "Thiết kế"
                    }
                ]
            };
        }
    },

    import: {
        getAllSlip: async () => {
            await delay(800);
            const currentDate = new Date();
            return {
                data: [
                    {
                        id: 1,
                        bookId: 1,
                        quantity: 50,
                        createdAt: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5).toISOString(),
                        importPrice: 200000
                    },
                    {
                        id: 2,
                        bookId: 2,
                        quantity: 30,
                        createdAt: new Date(currentDate.getFullYear(), currentDate.getMonth(), 12).toISOString(),
                        importPrice: 250000
                    },
                    {
                        id: 3,
                        bookId: 3,
                        quantity: 25,
                        createdAt: new Date(currentDate.getFullYear(), currentDate.getMonth(), 18).toISOString(),
                        importPrice: 320000
                    },
                    {
                        id: 4,
                        bookId: 4,
                        quantity: 40,
                        createdAt: new Date(currentDate.getFullYear(), currentDate.getMonth(), 22).toISOString(),
                        importPrice: 300000
                    }
                ]
            };
        }
    },

    reports: {
        getInventoryReport: async () => {
            await delay(1200);
            return {
                data: {
                    lowStockBooks: [
                        { id: 1, title: "Lập trình JavaScript", stock: 15 },
                        { id: 3, title: "Database Design", stock: 8 },
                        { id: 5, title: "UI/UX Design", stock: 12 }
                    ],
                    totalBooks: 90,
                    totalValue: 25000000
                }
            };
        }
    }
};

// Function để test mock APIs
export const testMockApis = async () => {
    console.log('Testing mock APIs...');
    
    try {
        const [books, importSlips, inventory] = await Promise.all([
            mockApiService.books.getAllBooks(),
            mockApiService.import.getAllSlip(),
            mockApiService.reports.getInventoryReport()
        ]);

        console.log('Mock Books:', books);
        console.log('Mock Import Slips:', importSlips);
        console.log('Mock Inventory:', inventory);

        return { books, importSlips, inventory };
    } catch (error) {
        console.error('Mock API test failed:', error);
        throw error;
    }
}; 