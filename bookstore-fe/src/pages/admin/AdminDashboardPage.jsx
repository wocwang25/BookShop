// src/pages/admin/AdminDashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { API } from '../../api/apiService';
import { useForm } from '@mantine/form';
import {
    Container,
    Title,
    Text,
    SimpleGrid,
    Paper,
    Group,
    Button,
    TextInput,
    NumberInput,
    Textarea,
    ActionIcon,
    Table,
    Modal,
    Notification,
    FileInput,
    Progress,
    Alert,
    useMantineTheme, // Hook để lấy theme của Mantine
} from '@mantine/core';
import { IconSearch, IconPlus, IconBook, IconUser, IconCategory, IconRefresh, IconCheck, IconX, IconPencil, IconTrash, IconFileUpload, IconFileSpreadsheet } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';

// --- BookForm sẽ được hiển thị trong Modal ---
const BookForm = ({ book, onSave, onCancel }) => {
    const form = useForm({
        initialValues: {
            title: book?.title || '',
            author: book?.author?.name || '',
            category: book?.category?.name || '',
            price: book?.price || 0,
            publicationYear: book?.publicationYear || new Date().getFullYear(),
            description: book?.description || '',
            imageUrl: book?.imageUrl || '',
        },
        validate: {
            title: (value) => (value.trim().length < 2 ? 'Tên sách phải có ít nhất 2 ký tự' : null),
            author: (value) => (value.trim().length === 0 ? 'Tên tác giả không được để trống' : null),
            category: (value) => (value.trim().length === 0 ? 'Thể loại không được để trống' : null),
            price: (value) => (value <= 0 ? 'Giá sách phải lớn hơn 0' : null),
        },
    });

    return (
        <div style={{ padding: '1rem' }}>
        <form onSubmit={form.onSubmit(onSave)}>
                <SimpleGrid cols={1} spacing="lg">
                    <TextInput 
                        label="📖 Tên sách" 
                        placeholder="Nhập tên sách" 
                        {...form.getInputProps('title')} 
                        required 
                        size="md"
                        radius="md"
                    />
                    <SimpleGrid cols={2} spacing="md">
                        <TextInput 
                            label="✍️ Tên tác giả" 
                            placeholder="Nhập tên tác giả" 
                            {...form.getInputProps('author')} 
                            required 
                            size="md"
                            radius="md"
                        />
                        <TextInput 
                            label="📂 Thể loại" 
                            placeholder="Nhập thể loại" 
                            {...form.getInputProps('category')} 
                            required 
                            size="md"
                            radius="md"
                        />
                    </SimpleGrid>
                    <TextInput 
                        label="🖼️ URL Ảnh bìa" 
                        placeholder="/images/default.jpg" 
                        {...form.getInputProps('imageUrl')} 
                        size="md"
                        radius="md"
                    />
                    <SimpleGrid cols={2} spacing="md">
                        <NumberInput 
                            label="💰 Giá (VNĐ)" 
                            {...form.getInputProps('price')} 
                            required 
                            min={0} 
                            hideControls 
                            size="md"
                            radius="md"
                            thousandSeparator=","
                        />
                        <NumberInput 
                            label="📅 Năm XB" 
                            {...form.getInputProps('publicationYear')} 
                            min={1000} 
                            max={new Date().getFullYear()} 
                            hideControls 
                            size="md"
                            radius="md"
                        />
                    </SimpleGrid>
                    <Textarea 
                        label="📝 Mô tả" 
                        placeholder="Mô tả ngắn về sách" 
                        {...form.getInputProps('description')} 
                        minRows={3}
                        size="md"
                        radius="md"
                    />
            </SimpleGrid>
                <Group justify="flex-end" mt="xl" gap="md">
                    <Button 
                        variant="default" 
                        onClick={onCancel}
                        size="md"
                        radius="md"
                    >
                        Hủy
                    </Button>
                    <Button 
                        type="submit"
                        variant="gradient"
                        gradient={{ from: 'blue', to: 'cyan' }}
                        size="md"
                        radius="md"
                    >
                        💾 Lưu Sách
                    </Button>
            </Group>
        </form>
        </div>
    );
};


// --- Component Trang Dashboard Chính ---
const AdminDashboardPage = () => {
    // States
    const [stats, setStats] = useState({ totalBooks: 0, totalAuthors: 0, totalCategories: 0 });
    const [recentBooks, setRecentBooks] = useState([]);
    const [searchResult, setSearchResult] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', color: 'blue' });

    // State cho Modal Form
    const [isFormModalOpen, { open: openFormModal, close: closeFormModal }] = useDisclosure(false);
    const [editingBook, setEditingBook] = useState(null); // null: thêm mới, object: sửa

    // State cho Modal Xóa
    const [isDeleteModalOpen, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
    const [bookToDelete, setBookToDelete] = useState(null);

    // State cho CSV Import
    const [isCsvModalOpen, { open: openCsvModal, close: closeCsvModal }] = useDisclosure(false);
    const [csvFile, setCsvFile] = useState(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importProgress, setImportProgress] = useState(0);
    const [importResult, setImportResult] = useState(null);

    // Theme
    const theme = useMantineTheme();

    // --- Các Hàm xử lý dữ liệu ---
    const fetchDashboardData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await API.books.getAllBooks(); // Có thể tạo API riêng cho dashboard để tối ưu
            const allBooks = response.data.books || [];

            // Tính toán stats
            setStats({
                totalBooks: allBooks.length,
                totalAuthors: new Set(allBooks.map(b => b.author?.name)).size,
                totalCategories: new Set(allBooks.map(b => b.category?.name)).size,
            });

            // Lọc sách mới cập nhật (trong vòng 24 giờ qua)
            const oneDayAgo = new Date();
            oneDayAgo.setDate(oneDayAgo.getDate() - 1);
            const recent = allBooks
                .filter(b => new Date(b.updatedAt) > oneDayAgo)
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

            setRecentBooks(recent);
        } catch (error) {
            showNotification('Không thể tải dữ liệu dashboard', 'red');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);





    // Hàm tìm kiếm
    const handleSearch = async (event) => {
        event.preventDefault();
        if (!searchQuery.trim()) {
            setSearchResult([]); // Xóa kết quả nếu ô tìm kiếm trống
            return;
        }
        setIsLoading(true);
        try {
            // Sử dụng API search đã tạo trong apiService
            const response = await API.books.searchBooks(searchQuery);
            setSearchResult(response.data.books || []);
        } catch (error) {
            showNotification('Lỗi khi tìm kiếm sách', 'red');
        } finally {
            setIsLoading(false);
        }
    };

    // Hàm hiển thị thông báo
    const showNotification = useCallback((message, color) => {
        setNotification({ show: true, message, color });
        setTimeout(() => setNotification({ show: false, message: '' }), 3000);
    }, []);

    // Hàm mở form thêm sách
    const handleAddNewBook = () => {
        setEditingBook(null); // Đảm bảo đang ở chế độ thêm mới
        openFormModal();
    };

    // Hàm mở form sửa sách
    const handleEditBook = (book) => {
        setEditingBook(book);
        openFormModal();
    };

    // Hàm xử lý lưu sách (cả thêm và sửa)
    const handleSaveBook = async (formData) => {
        try {
            if (editingBook) {
                await API.books.updateBook(editingBook._id, formData);
                showNotification('Cập nhật sách thành công!', 'teal');
            } else {
                await API.books.createBook(formData);
                showNotification('Thêm sách mới thành công!', 'teal');
            }
            closeFormModal();
            fetchDashboardData(); // Tải lại dữ liệu dashboard
            if (searchQuery) handleSearch(new Event('submit')); // Tải lại kết quả search nếu đang search
        } catch (error) {
            showNotification(error.response?.data?.message || 'Có lỗi xảy ra', 'red');
        }
    };

    // Hàm xử lý xóa
    const confirmDelete = (book) => {
        setBookToDelete(book);
        openDeleteModal();
    };

    const handleDeleteBook = async () => {
        if (!bookToDelete) return;
        try {
            await API.books.deleteBook(bookToDelete._id);
            showNotification('Xóa sách thành công!', 'teal');
            closeDeleteModal();
            fetchDashboardData(); // Tải lại dữ liệu dashboard
            if (searchQuery) handleSearch(new Event('submit')); // Tải lại kết quả search nếu đang search
        } catch (error) {
            showNotification(error.response?.data?.message || 'Lỗi khi xóa sách', 'red');
        }
    };

    // Hàm mở modal CSV import
    const handleOpenCsvImport = () => {
        setCsvFile(null);
        setImportResult(null);
        setImportProgress(0);
        openCsvModal();
    };

    // Hàm xử lý import CSV
    const handleCsvImport = async () => {
        console.log('=== CSV IMPORT DEBUG START ===');
        console.log('1. csvFile:', csvFile);
        console.log('2. csvFile name:', csvFile?.name);
        console.log('3. csvFile size:', csvFile?.size);
        console.log('4. csvFile type:', csvFile?.type);

        if (!csvFile) {
            console.log('ERROR: No CSV file selected');
            showNotification('Vui lòng chọn file CSV', 'red');
            return;
        }

        console.log('5. Starting import process...');
        setIsImporting(true);
        setImportProgress(0);
        setImportResult(null);

        try {
            console.log('6. Setting up progress interval...');
            // Simulate progress
            const progressInterval = setInterval(() => {
                setImportProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            console.log('7. Making API call to import CSV...');
            console.log('8. API.books.importBooksFromCSV function:', API.books.importBooksFromCSV);
            
            const response = await API.books.importBooksFromCSV(csvFile);
            
            console.log('9. API call completed successfully!');
            console.log('10. Full response:', response);
            console.log('11. Response status:', response.status);
            console.log('12. Response data:', response.data);
            console.log('13. Response data.result:', response.data.result);
            
            clearInterval(progressInterval);
            setImportProgress(100);
            
            // Parse response structure từ backend
            const data = response.data;
            const result = data.result || {};
            const importedCount = result.successCount || result.imported || result.importedCount || 0;
            const failedCount = Array.isArray(result.failed) ? result.failed.length : (result.failedCount || 0);
            
            console.log('14. Parsed counts - imported:', importedCount, 'failed:', failedCount);
            
            setImportResult({
                success: true,
                message: data.message || 'Import thành công!',
                imported: importedCount,
                failed: failedCount,
                details: result.details || result.errors || []
            });

            console.log('15. Success notification and UI update');
            showNotification(`Import thành công ${importedCount} sách!`, 'teal');
            fetchDashboardData(); // Tải lại dữ liệu dashboard

        } catch (error) {
            console.log('ERROR: CSV Import failed');
            console.log('Error object:', error);
            console.log('Error message:', error.message);
            console.log('Error response:', error.response);
            console.log('Error response data:', error.response?.data);
            console.log('Error response status:', error.response?.status);
            console.log('Error stack:', error.stack);
            
            setImportProgress(100);
            setImportResult({
                success: false,
                message: error.response?.data?.message || error.message || 'Có lỗi xảy ra khi import',
                details: error.response?.data?.details || [error.message]
            });
            showNotification(error.response?.data?.message || error.message || 'Lỗi khi import CSV', 'red');
        } finally {
            console.log('14. Cleanup - setting isImporting to false');
            setIsImporting(false);
            console.log('=== CSV IMPORT DEBUG END ===');
        }
    };


    // Component cho các thẻ thống kê
    const StatCard = ({ title, value, icon, color }) => (
        <Paper 
            withBorder 
            p="xl" 
            radius="lg" 
            shadow="sm"
            style={{
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer',
                ':hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                }
            }}
        >
            <Group justify="space-between" mb="md">
                <Text size="xs" c="dimmed" tt="uppercase" fw={700} lh={1.3}>
                    {title}
                </Text>
                <ActionIcon 
                    color={color} 
                    variant="gradient" 
                    gradient={{ from: color, to: color === 'blue' ? 'cyan' : color === 'cyan' ? 'teal' : 'green' }}
                    size="xl" 
                    radius="lg"
                >
                    {icon}
                </ActionIcon>
            </Group>
            <Text fw={700} size="2rem" c="dark" ta="center">
                {value}
            </Text>
        </Paper>
    );

    // Component để render bảng sách
    const BooksTable = ({ data, title }) => (
        <Paper 
            withBorder 
            p="xl" 
            radius="lg" 
            shadow="sm"
            style={{
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                width: '100%',
                height: 'fit-content'
            }}
        >
            <Title order={3} mb="xl" ta="center" c="dark">
                {title}
            </Title>
            <div style={{ 
                maxHeight: '500px', 
                overflowY: 'auto',
                borderRadius: '12px',
                border: '1px solid #e9ecef'
            }}>
                <Table 
                    striped 
                    highlightOnHover 
                    withTableBorder
                    style={{
                        borderRadius: '12px',
                        overflow: 'hidden'
                    }}
                >
                    <Table.Thead style={{ backgroundColor: '#f1f3f4' }}>
                        <Table.Tr>
                            <Table.Th style={{ fontWeight: 600, color: '#495057' }}>📖 Tên Sách</Table.Th>
                            <Table.Th style={{ fontWeight: 600, color: '#495057' }}>✍️ Tác Giả</Table.Th>
                            <Table.Th style={{ fontWeight: 600, color: '#495057' }}>💰 Giá</Table.Th>
                            <Table.Th style={{ fontWeight: 600, color: '#495057' }}>📦 Tồn Kho</Table.Th>
                            <Table.Th style={{ fontWeight: 600, color: '#495057', textAlign: 'center' }}>⚙️ Hành Động</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {data.length > 0 ? (
                            data.map(book => (
                                <Table.Tr key={book._id} style={{ transition: 'background-color 0.2s ease' }}>
                                    <Table.Td>
                                        <Text lineClamp={1} fw={500} size="sm">
                                            {book.title}
                                        </Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="sm" c="dark">
                                            {book.author?.name}
                                        </Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="sm" fw={500} c="blue">
                                            {book.price?.toLocaleString()}₫
                                        </Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text 
                                            size="sm" 
                                            c={book.currentStock > 10 ? 'teal' : book.currentStock > 0 ? 'orange' : 'red'}
                                            fw={500}
                                        >
                                            {book.currentStock || 0}
                                        </Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Group gap="xs" justify="center" wrap="nowrap">
                                            <ActionIcon 
                                                color="blue" 
                                                variant="gradient" 
                                                gradient={{ from: 'blue', to: 'cyan' }}
                                                onClick={() => handleEditBook(book)}
                                                radius="md"
                                                size="lg"
                                            >
                                                <IconPencil size="1rem" />
                                            </ActionIcon>
                                            <ActionIcon 
                                                color="red" 
                                                variant="gradient"
                                                gradient={{ from: 'red', to: 'pink' }}
                                                onClick={() => confirmDelete(book)}
                                                radius="md"
                                                size="lg"
                                            >
                                                <IconTrash size="1rem" />
                                            </ActionIcon>
                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                            ))
                        ) : (
                            <Table.Tr>
                                <Table.Td colSpan={5}>
                                    <div style={{ 
                                        textAlign: 'center', 
                                        padding: '2rem',
                                        color: '#868e96'
                                    }}>
                                        <Text size="lg" c="dimmed" mb="sm">
                                            📚 Không có dữ liệu
                                        </Text>
                                        <Text size="sm" c="dimmed">
                                            {searchQuery ? 'Không tìm thấy sách phù hợp' : 'Chưa có sách nào được cập nhật gần đây'}
                                        </Text>
                                    </div>
                                </Table.Td>
                            </Table.Tr>
                        )}
                    </Table.Tbody>
                </Table>
            </div>
        </Paper>
    );

    return (
        <div
            style={{
                minHeight: '100vh',
                width: '100vw',
                backgroundColor: '#f8f9fa',
                padding: '1rem',
                boxSizing: 'border-box',
                overflow: 'auto'
            }}
        >
            {/* Vùng hiển thị thông báo */}
            {notification.show && (
                <Notification
                    icon={notification.color === 'red' ? <IconX size="1.1rem" /> : <IconCheck size="1.1rem" />}
                    color={notification.color}
                    onClose={() => setNotification({ show: false, message: '' })}
                    style={{ position: 'fixed', top: 80, right: 20, zIndex: 1000 }}
                >
                    {notification.message}
                </Notification>
            )}

            {/* CONTAINER CHÍNH SỬ DỤNG TOÀN BỘ MÀN HÌNH */}
            <div style={{ width: '100%', maxWidth: 'none' }}>
                {/* Header của Dashboard */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Title order={1} mb="md" c="dark" style={{ fontWeight: 600 }}>
                        🏪 Tổng Quan Nhà Sách
                    </Title>
                    <Text size="lg" c="dimmed" mb="xl">
                        Quản lý thông tin sách, tác giả và danh mục một cách hiệu quả
                    </Text>
                                        <Group justify="center" wrap="wrap">
                        <Button 
                            leftSection={<IconRefresh size="1rem" />} 
                            variant="default" 
                            onClick={fetchDashboardData}
                            loading={isLoading}
                        >
                            Tải Lại
                        </Button>
                        <Button 
                            leftSection={<IconPlus size="1rem" />} 
                            onClick={handleAddNewBook}
                            gradient={{ from: 'blue', to: 'cyan' }}
                            variant="gradient"
                        >
                            Thêm Sách Mới
                        </Button>
                        <Button 
                            leftSection={<IconFileUpload size="1rem" />} 
                            onClick={handleOpenCsvImport}
                            gradient={{ from: 'green', to: 'teal' }}
                            variant="gradient"
                        >
                            Import CSV
                        </Button>
                    </Group>
                </div>

                {/* Các thẻ thống kê */}
                <div style={{ marginBottom: '2rem' }}>
                    <Title order={3} ta="center" mb="lg" c="dark">
                        📊 Thống Kê Tổng Quan
                    </Title>
                    <SimpleGrid 
                        cols={{ base: 1, sm: 2, md: 4 }} 
                        spacing="lg"
                        style={{ margin: '0 auto' }}
                    >
                        <StatCard 
                            title="Tổng Số Đầu Sách" 
                            value={stats.totalBooks} 
                            icon={<IconBook size="1.5rem" />} 
                            color="blue" 
                        />
                        <StatCard 
                            title="Tổng Số Tác Giả" 
                            value={stats.totalAuthors} 
                            icon={<IconUser size="1.5rem" />} 
                            color="cyan" 
                        />
                        <StatCard 
                            title="Tổng Số Thể Loại" 
                            value={stats.totalCategories} 
                            icon={<IconCategory size="1.5rem" />} 
                            color="teal" 
                        />
                        <StatCard 
                            title="Doanh Thu" 
                            value="0₫" 
                            icon={<IconCategory size="1.5rem" />} 
                            color="green" 
                        />
                </SimpleGrid>
                </div>

                {/* Layout 2 cột cho search và table */}
                <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="xl" style={{ marginBottom: '2rem' }}>
                {/* Thanh tìm kiếm */}
                    <div>
                        <Title order={3} ta="center" mb="lg" c="dark">
                            🔍 Tìm Kiếm Sách
                        </Title>
                        <Paper 
                            withBorder 
                            p="xl" 
                            radius="lg" 
                            shadow="sm"
                            style={{ 
                                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                                height: 'fit-content'
                            }}
                        >
                    <form onSubmit={handleSearch}>
                        <TextInput
                            label="Tìm kiếm sách"
                            placeholder="Nhập tên sách, tác giả..."
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.currentTarget.value)}
                                    size="lg"
                            rightSection={
                                        <ActionIcon 
                                            type="submit" 
                                            variant="gradient" 
                                            gradient={{ from: 'blue', to: 'cyan' }}
                                            size="lg"
                                            loading={isLoading}
                                        >
                                            <IconSearch size="1.2rem" />
                                </ActionIcon>
                            }
                                    styles={{
                                        input: {
                                            borderRadius: '12px',
                                            border: '2px solid #e9ecef',
                                            transition: 'border-color 0.2s ease',
                                            '&:focus': {
                                                borderColor: '#339af0'
                                            }
                                        }
                                    }}
                        />
                    </form>
                </Paper>
                    </div>

                {/* Hiển thị kết quả tìm kiếm hoặc sách gần đây */}
                    <div style={{ width: '100%' }}>
                {searchQuery ? (
                            <BooksTable data={searchResult} title={`🔎 Kết quả tìm kiếm cho "${searchQuery}"`} />
                ) : (
                            <BooksTable data={recentBooks} title="📚 Sách Được Cập Nhật Gần Đây" />
                )}
                    </div>
                </SimpleGrid>

                {/* Modal để Thêm/Sửa Sách */}
                <Modal 
                    opened={isFormModalOpen} 
                    onClose={closeFormModal} 
                    title={editingBook ? '✏️ Chỉnh Sửa Sách' : '➕ Thêm Sách Mới'} 
                    centered 
                    size="lg"
                    radius="lg"
                    shadow="xl"
                    zIndex={9999}
                    overlayProps={{
                        backgroundOpacity: 0.75,
                        blur: 1,
                        zIndex: 9998
                    }}
                    styles={{
                        root: {
                            zIndex: 9999,
                        },
                        inner: {
                            zIndex: 9999,
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                        },
                        modal: {
                            backgroundColor: 'white',
                            zIndex: 9999,
                            position: 'relative',
                            maxHeight: '90vh',
                            overflow: 'auto'
                        },
                        header: {
                            backgroundColor: '#f8f9fa',
                            borderBottom: '1px solid #dee2e6',
                            padding: '1rem 1.5rem',
                            fontSize: '1.1rem',
                            fontWeight: 600
                        },
                        overlay: {
                            zIndex: 9998,
                            backgroundColor: 'rgba(0, 0, 0, 0.75) !important'
                        }
                    }}
                    portalProps={{
                        target: document.body
                    }}
                >
                    <BookForm
                        key={editingBook?._id || 'new-book-form'}
                        book={editingBook}
                        onSave={handleSaveBook}
                        onCancel={closeFormModal}
                    />
                </Modal>



                {/* Modal Xác Nhận Xóa */}
                <Modal 
                    opened={isDeleteModalOpen} 
                    onClose={closeDeleteModal} 
                    title="⚠️ Xác Nhận Xóa" 
                    centered
                    radius="lg"
                    shadow="xl"
                >
                    <Text size="md" mb="lg">
                        Bạn có chắc chắn muốn xóa sách <strong>"{bookToDelete?.title}"</strong> không? 
                        <br />
                        <Text span c="red" size="sm">
                            Hành động này không thể hoàn tác.
                        </Text>
                    </Text>
                    <Group justify="flex-end" gap="md">
                        <Button variant="default" onClick={closeDeleteModal} radius="md">
                            Hủy
                        </Button>
                        <Button 
                            color="red" 
                            onClick={handleDeleteBook}
                            radius="md"
                            variant="gradient"
                            gradient={{ from: 'red', to: 'pink' }}
                        >
                            Xác nhận Xóa
                        </Button>
                    </Group>
                </Modal>

                {/* Modal Import CSV */}
                <Modal 
                    opened={isCsvModalOpen} 
                    onClose={closeCsvModal} 
                    title="📊 Import Sách từ File CSV" 
                    centered
                    size="lg"
                    radius="lg"
                    shadow="xl"
                    zIndex={9999}
                    overlayProps={{
                        backgroundOpacity: 0.75,
                        blur: 1,
                        zIndex: 9998
                    }}
                    styles={{
                        root: {
                            zIndex: 9999,
                        },
                        inner: {
                            zIndex: 9999,
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                        },
                        modal: {
                            backgroundColor: 'white',
                            zIndex: 9999,
                            position: 'relative',
                            maxHeight: '90vh',
                            overflow: 'auto'
                        },
                        header: {
                            backgroundColor: '#f8f9fa',
                            borderBottom: '1px solid #dee2e6',
                            padding: '1rem 1.5rem',
                            fontSize: '1.1rem',
                            fontWeight: 600
                        },
                        overlay: {
                            zIndex: 9998,
                            backgroundColor: 'rgba(0, 0, 0, 0.75) !important'
                        }
                    }}
                    portalProps={{
                        target: document.body
                    }}
                >
                    <div style={{ padding: '1rem' }}>
                        {/* Hướng dẫn format CSV */}
                        <Alert 
                            icon={<IconFileSpreadsheet size="1rem" />} 
                            title="Định dạng file CSV yêu cầu" 
                            color="blue" 
                            mb="lg"
                        >
                            <Text size="sm" mb="xs">
                                File CSV cần có các cột sau (theo thứ tự):
                            </Text>
                            <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                                title, author, category, price, publicationYear, description, imageUrl
                            </Text>
                            <Text size="xs" mt="xs" c="dimmed">
                                Ví dụ: "Tôi thấy hoa vàng trên cỏ xanh", "Nguyễn Nhật Ánh", "Văn học", 85000, 2010, "Tiểu thuyết nổi tiếng", "/images/book1.jpg"
                            </Text>
                        </Alert>

                        {/* File Upload */}
                        <FileInput
                            label="📁 Chọn file CSV"
                            placeholder="Nhấn để chọn file CSV..."
                            accept=".csv"
                            value={csvFile}
                            onChange={setCsvFile}
                            size="lg"
                            radius="md"
                            mb="lg"
                            leftSection={<IconFileUpload size="1rem" />}
                        />

                        {/* Progress Bar */}
                        {isImporting && (
                            <div style={{ marginBottom: '1rem' }}>
                                <Text size="sm" mb="xs">Đang import... {importProgress}%</Text>
                                <Progress 
                                    value={importProgress} 
                                    size="lg" 
                                    radius="xl"
                                    animated
                                    color={importProgress === 100 ? 'teal' : 'blue'}
                                />
                            </div>
                        )}

                        {/* Import Result */}
                        {importResult && (
                            <Alert 
                                color={importResult.success ? 'teal' : 'red'} 
                                title={importResult.success ? '✅ Import thành công!' : '❌ Import thất bại'} 
                                mb="lg"
                            >
                                <Text size="sm" mb="xs">{importResult.message}</Text>
                                {importResult.imported !== undefined && (
                                    <Text size="xs" c="dimmed">
                                        • Thành công: {importResult.imported} sách
                                    </Text>
                                )}
                                {importResult.failed !== undefined && importResult.failed > 0 && (
                                    <Text size="xs" c="red">
                                        • Thất bại: {importResult.failed} sách
                                    </Text>
                                )}
                                {importResult.details && importResult.details.length > 0 && (
                                    <div style={{ marginTop: '8px' }}>
                                        <Text size="xs" fw={500}>Chi tiết lỗi:</Text>
                                        {importResult.details.slice(0, 5).map((detail, index) => (
                                            <Text key={index} size="xs" c="dimmed" style={{ marginLeft: '8px' }}>
                                                • {detail}
                                            </Text>
                                        ))}
                                        {importResult.details.length > 5 && (
                                            <Text size="xs" c="dimmed" style={{ marginLeft: '8px' }}>
                                                ... và {importResult.details.length - 5} lỗi khác
                                            </Text>
                                        )}
                                    </div>
                                )}
                            </Alert>
                        )}

                        {/* Buttons */}
                        <Group justify="flex-end" gap="md">
                            <Button 
                                variant="default" 
                                onClick={closeCsvModal}
                                radius="md"
                                disabled={isImporting}
                            >
                                {importResult?.success ? 'Đóng' : 'Hủy'}
                            </Button>
                            {!importResult?.success && (
                                <Button 
                                    leftSection={<IconFileUpload size="1rem" />}
                                    onClick={handleCsvImport}
                                    radius="md"
                                    variant="gradient"
                                    gradient={{ from: 'green', to: 'teal' }}
                                    loading={isImporting}
                                    disabled={!csvFile || isImporting}
                                >
                                    {isImporting ? 'Đang import...' : 'Bắt đầu Import'}
                                </Button>
                            )}
                        </Group>
                    </div>
                </Modal>



            </div>
        </div>
    );
};

export default AdminDashboardPage;