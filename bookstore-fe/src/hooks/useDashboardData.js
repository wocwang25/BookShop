import { useState, useEffect, useCallback } from 'react';
import { API } from '../api/apiService';

export const useDashboardData = () => {
    const [state, setState] = useState({
        stats: [],
        isLoading: true,
        error: null,
        lastUpdated: null
    });

    // Fix: Sửa lỗi Date object
    const month = new Date().getMonth() + 1; // +1 vì getMonth() trả về 0-11
    const year = new Date().getFullYear();

    // Fallback data for when APIs are not available
    const getFallbackStats = () => {
        return [
            {
                title: 'Sách đã nhập tháng này',
                value: '1,205',
                icon: 'receipt',
                color: 'blue',
                description: 'Đầu sách',
            },
            {
                title: 'Phiếu nhập đã tạo',
                value: '48',
                icon: 'fileInvoice',
                color: 'teal',
                description: 'Phiếu nhập sách mới',
            },
            {
                title: 'Hóa đơn bán',
                value: '32',
                icon: 'shoppingCart',
                color: 'green',
                description: 'Hóa đơn bán trong tháng',
            },
            {
                title: 'Hóa đơn thuê',
                value: '15',
                icon: 'clock',
                color: 'orange',
                description: 'Hóa đơn thuê trong tháng',
            },
            {
                title: 'Tổng sách trong kho',
                value: '2,847',
                icon: 'cash',
                color: 'grape',
                description: 'Đầu sách có sẵn',
            },
            {
                title: 'Sách tồn kho thấp',
                value: '12',
                icon: 'report',
                description: 'Sách tồn kho thấp hơn quy định',
            },
        ];
    };

    const fetchDashboardData = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }));

            console.log('Fetching dashboard data...');

            // Chuẩn bị tham số thời gian cho API
            const timeData = { month, year };

            // Gọi API với timeout và xử lý lỗi
            const apiCallsPromise = Promise.all([
                API.import.getAllSlip(timeData).catch(err => {
                    console.warn('Import slips API failed:', err);
                    return { data: [] };
                }),
                API.books.getAllBooks().catch(err => {
                    console.warn('Books API failed:', err);
                    return { data: { books: [] } };
                }),
                API.rules.getRuleByCode('QD1').catch(err => {
                    console.warn('Rule QD1 API failed:', err);
                    return { data: null };
                }),
                API.invoice.getSalesInvoice(timeData).catch(err => {
                    console.warn('Sales invoices API failed:', err);
                    return { data: { totalAmount: 0, invoices: [] } };
                }),
                API.invoice.getRentalInvoice(timeData).catch(err => {
                    console.warn('Rental invoices API failed:', err);
                    return { data: { totalAmount: 0, invoices: [] } };
                })

            ]);

            // Timeout sau 10 giây
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('API timeout')), 10000);
            });

            let apiResults;
            try {
                apiResults = await Promise.race([apiCallsPromise, timeoutPromise]);
            } catch (timeoutError) {
                console.warn('API calls timed out, using fallback data');
                throw new Error('API timeout');
            }

            const [importSlips, booksResponse, ruleQD1, salesInvoiceResponse, rentalInvoiceResponse] = apiResults;

            console.log('API Results:', {
                importSlips,
                booksResponse,
                ruleQD1,
                salesInvoiceResponse,
                rentalInvoiceResponse
            });

            // Xử lý dữ liệu sách
            const books = booksResponse?.data?.books || booksResponse?.data || [];
            const importSlipsData = importSlips?.data || [];
            const QD1 = ruleQD1.data || null;
            const salesInvoiceData = salesInvoiceResponse?.data || { totalAmount: 0, invoices: [] };
            const rentalInvoiceData = rentalInvoiceResponse?.data || { totalAmount: 0, invoices: [] };

            // Kiểm tra xem có dữ liệu thực tế không
            const hasRealData = books.length > 0 || importSlipsData.length > 0 ||
                salesInvoiceData.invoices.length > 0 || rentalInvoiceData.invoices.length > 0;
            console.log('Books data:', books);
            console.log('Has real data:', hasRealData);

            if (!hasRealData) {
                console.log('No real data available, using fallback');
                setState({
                    stats: getFallbackStats(),
                    isLoading: false,
                    error: 'Đang sử dụng dữ liệu mẫu (API chưa sẵn sàng)',
                    lastUpdated: new Date()
                });
                return;
            }

            // Lọc phiếu nhập trong tháng hiện tại
            const currentMonthImportSlips = importSlipsData.slips?.filter(slip => {
                if (!slip.createdAt && !slip.importDate && !slip.created_at) return false;
                const slipDate = new Date(slip.createdAt || slip.importDate || slip.created_at);
                return slipDate.getMonth() === month - 1 && slipDate.getFullYear() === year;
            }) || [];

            // Tính tổng số lượng sách nhập trong tháng
            const totalBooksImported = currentMonthImportSlips.reduce((total, slip) => {
                // Kiểm tra nhiều trường quantity có thể có
                const quantity = slip.quantity || 1;
                return total + quantity;
            }, 0);

            // Tìm sách có tồn kho thấp (dưới 20)
            const lowStockBooks = books.filter(book => {
                const stock = book.availableStock || 0;
                return stock < 20;
            });

            const totalBooks = books.length;

            // Xử lý dữ liệu hóa đơn bán
            const totalSalesInvoices = salesInvoiceData.invoices?.length || 0;
            const totalSalesAmount = salesInvoiceData.totalAmount || 0;

            // Xử lý dữ liệu hóa đơn thuê  
            const totalRentalInvoices = rentalInvoiceData.invoices?.length || 0;
            const totalRentalAmount = rentalInvoiceData.totalAmount || 0;

            // Mục tiêu tháng (có thể lấy từ API hoặc config)
            const monthlyImportTarget = 1000;
            const importProgress = totalBooksImported > 0 ? Math.min((totalBooksImported / monthlyImportTarget) * 100, 100) : 0;

            // Tính số phiếu nhập đã tạo
            const totalImportSlips = currentMonthImportSlips.length;
            const slipTarget = 50;
            const slipProgress = totalImportSlips > 0 ? Math.min((totalImportSlips / slipTarget) * 100, 100) : 0;

            // Tính tỷ lệ tồn kho an toàn
            const safeStockPercentage = totalBooks > 0 ? Math.max(100 - (lowStockBooks.length / totalBooks) * 100, 0) : 100;
            const min_stock = QD1?.min_stock || 20;
            console.log(min_stock)

            // Mục tiêu hóa đơn hàng tháng
            const monthlySalesTarget = 50;
            const monthlyRentalTarget = 30;
            const salesProgress = totalSalesInvoices > 0 ? Math.min((totalSalesInvoices / monthlySalesTarget) * 100, 100) : 0;
            const rentalProgress = totalRentalInvoices > 0 ? Math.min((totalRentalInvoices / monthlyRentalTarget) * 100, 100) : 0;

            const stats = [
                // {
                //     title: 'Sách đã nhập tháng này',
                //     value: totalBooksImported.toLocaleString('vi-VN'),
                //     icon: 'receipt',
                //     color: 'blue',
                //     trend: totalBooksImported > 0 ? 'up' : 'stable',
                //     trendValue: totalBooksImported > 0 ? '+12%' : '0%',
                //     description: `${totalImportSlips} phiếu nhập`,
                //     progress: Math.round(importProgress),
                //     target: monthlyImportTarget.toLocaleString('vi-VN')
                // },
                {
                    title: 'Phiếu nhập đã tạo',
                    value: totalImportSlips.toLocaleString('vi-VN'),
                    icon: 'fileInvoice',
                    color: 'teal',
                    trend: totalImportSlips > 0 ? 'up' : 'stable',
                    trendValue: totalImportSlips > 0 ? '+8%' : '0%',
                    description: 'Phiếu nhập sách mới',
                    progress: Math.round(slipProgress),
                    target: slipTarget.toString()
                },
                {
                    title: 'Hóa đơn bán',
                    value: totalSalesInvoices.toLocaleString('vi-VN'),
                    icon: 'shoppingCart',
                    color: 'green',
                    trend: totalSalesInvoices > 0 ? 'up' : 'stable',
                    trendValue: totalSalesInvoices > 0 ? '+15%' : '0%',
                    description: `Tổng: ${totalSalesAmount.toLocaleString('vi-VN')} ₫`,
                    progress: Math.round(salesProgress),
                    target: monthlySalesTarget.toString()
                },
                {
                    title: 'Hóa đơn thuê',
                    value: totalRentalInvoices.toLocaleString('vi-VN'),
                    icon: 'clock',
                    color: 'orange',
                    trend: totalRentalInvoices > 0 ? 'up' : 'stable',
                    trendValue: totalRentalInvoices > 0 ? '+10%' : '0%',
                    description: `Tổng: ${totalRentalAmount.toLocaleString('vi-VN')} ₫`,
                    progress: Math.round(rentalProgress),
                    target: monthlyRentalTarget.toString()
                },
                {
                    title: 'Sách tồn kho thấp',
                    value: lowStockBooks.length.toLocaleString('vi-VN'),
                    icon: 'report',
                    color: lowStockBooks.length > 10 ? 'red' : lowStockBooks.length > 5 ? 'orange' : 'green',
                    trend: lowStockBooks.length > 10 ? 'up' : 'down',
                    trendValue: lowStockBooks.length > 10 ? '+5%' : '-5%',
                    description: `Cần nhập thêm để > ${min_stock} cuốn`,
                    progress: Math.round(safeStockPercentage),
                    target: '0'
                },
            ];

            setState({
                stats,
                isLoading: false,
                error: null,
                lastUpdated: new Date()
            });

        } catch (error) {
            console.error('Error fetching dashboard data:', error);

            // Sử dụng fallback data khi có lỗi
            setState({
                stats: getFallbackStats(),
                isLoading: false,
                error: `Lỗi API: ${error.message}. Hiển thị dữ liệu mẫu.`,
                lastUpdated: new Date()
            });
        }
    }, [month, year]);

    useEffect(() => {
        fetchDashboardData();

        // Auto refresh every 5 minutes (chỉ khi không có lỗi)
        const interval = setInterval(() => {
            if (!state.error || state.error.includes('mẫu')) {
                fetchDashboardData();
            }
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [fetchDashboardData]);

    const refresh = useCallback(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return {
        ...state,
        refresh
    };
}; 