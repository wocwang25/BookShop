// src/pages/staff/ImportPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { API } from '../../api/apiService';
import { useForm } from '@mantine/form';
import {
    Container,
    Autocomplete,
    NumberInput,
    Button,
    Table,
    ActionIcon,
    Group,
    Title,
    Paper,
    Text,
    Notification,
    Loader,
    FileInput,
    Badge,
    Card,
    Modal,
    Alert,
    Progress,
    SimpleGrid,
    Select,
    Stack
} from '@mantine/core';
import { IconTrash, IconFileImport, IconCheck, IconX, IconUpload, IconDownload, IconPlus, IconFileSpreadsheet, IconReceipt, IconPrinter, IconRefresh } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';

// --- ManualImportForm Component ---
const ManualImportForm = ({ onSave, onCancel, allBooks = [], importList = [], setImportList, isSubmitting = false }) => {
    const form = useForm({
        initialValues: { bookId: '', title: '' },
    });

    const handleAddToList = (selectedItem) => {
        console.log('🔍 Selected item:', selectedItem);
        console.log('📚 All books:', allBooks);

        if (!selectedItem) return;

        // Handle both string and object selection
        let bookToAdd;
        if (typeof selectedItem === 'string') {
            bookToAdd = allBooks.find(b => b.value === selectedItem || b.label === selectedItem);
        } else {
            bookToAdd = allBooks.find(b => b.value === selectedItem.value);
        }

        console.log('📖 Book to add:', bookToAdd);

        if (bookToAdd && !importList.find(item => item._id === bookToAdd._id)) {
            // Theo QĐ1, mặc định số lượng nhập là 150 và giá nhập 50000
            const newBook = {
                ...bookToAdd,
                importQuantity: 150,
                unitImportPrice: 50000
            };
            console.log('➕ Adding book:', newBook);
            setImportList([...importList, newBook]);
        }
        form.reset(); // Reset form sau khi thêm
    };

    const handleQuantityChange = (bookId, quantity) => {
        setImportList(importList.map(item =>
            item._id === bookId ? { ...item, importQuantity: quantity || 0 } : item
        ));
    };

    const handlePriceChange = (bookId, price) => {
        setImportList(importList.map(item =>
            item._id === bookId ? { ...item, unitImportPrice: price || 0 } : item
        ));
    };

    const handleRemoveFromList = (bookId) => {
        setImportList(importList.filter(item => item._id !== bookId));
    };

    const totalAmount = importList.reduce((sum, item) => sum + (item.importQuantity * item.unitImportPrice), 0);

    const rows = importList.map((book) => (
        <Table.Tr key={book._id}>
            <Table.Td>{book.label}</Table.Td>
            <Table.Td>{book.author?.name}</Table.Td>
            <Table.Td>
                <NumberInput
                    value={book.importQuantity}
                    onChange={(val) => handleQuantityChange(book._id, val)}
                    min={1}
                    step={10}
                    style={{ width: 100 }}
                />
            </Table.Td>
            <Table.Td>
                <NumberInput
                    value={book.unitImportPrice}
                    onChange={(val) => handlePriceChange(book._id, val)}
                    min={1000}
                    step={1000}
                    style={{ width: 120 }}
                    thousandSeparator=","
                    suffix=" ₫"
                />
            </Table.Td>
            <Table.Td>
                <Text size="sm" fw={500}>
                    {(book.importQuantity * book.unitImportPrice).toLocaleString('vi-VN')} ₫
                </Text>
            </Table.Td>
            <Table.Td>
                <ActionIcon color="red" onClick={() => handleRemoveFromList(book._id)}>
                    <IconTrash size="1rem" />
                </ActionIcon>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <div style={{ padding: '1rem' }}>
            {/* Debug info */}
            <div style={{ marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                <Text size="xs">Debug: {allBooks.length} sách có sẵn, {importList.length} sách đã chọn</Text>
                <Text size="xs">API function: {typeof API.import?.importBook}</Text>
            </div>

            <SimpleGrid cols={1} spacing="lg">
                <Autocomplete
                    label="🔍 Tìm kiếm sách để nhập"
                    placeholder="Gõ tên sách..."
                    data={allBooks}
                    onOptionSubmit={handleAddToList}
                    value={form.values.title}
                    onChange={(value) => form.setFieldValue('title', value)}
                    size="md"
                    radius="md"
                    clearable
                    comboboxProps={{
                        zIndex: 2000,
                        withinPortal: true,
                        position: 'bottom',
                        middlewares: {
                            flip: false,
                            shift: false,
                        }
                    }}
                    styles={{
                        dropdown: {
                            zIndex: 2000
                        }
                    }}
                />

                {importList.length > 0 && (
                    <>
                        <div>
                            <Text size="lg" fw={600} mb="md">📋 Sách đã chọn:</Text>
                            <div style={{
                                maxHeight: '300px',
                                overflowY: 'auto',
                                border: '1px solid #e9ecef',
                                borderRadius: '8px'
                            }}>
                                <Table striped highlightOnHover size="sm">
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Tên sách</Table.Th>
                                            <Table.Th>Tác giả</Table.Th>
                                            <Table.Th>Số lượng</Table.Th>
                                            <Table.Th>Giá nhập</Table.Th>
                                            <Table.Th>Thành tiền</Table.Th>
                                            <Table.Th>Xóa</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {rows}
                                    </Table.Tbody>
                                </Table>
                            </div>
                        </div>

                        <Alert color="blue">
                            <Text fw={500}>
                                Tổng: {importList.length} loại sách, {importList.reduce((sum, item) => sum + item.importQuantity, 0)} cuốn
                            </Text>
                            <Text fw={600} size="lg">
                                Tổng tiền: {totalAmount.toLocaleString('vi-VN')} ₫
                            </Text>
                        </Alert>
                    </>
                )}
            </SimpleGrid>

            <Group justify="flex-end" mt="xl" gap="md">
                <Button
                    variant="default"
                    onClick={onCancel}
                    size="md"
                    radius="md"
                    disabled={isSubmitting}
                >
                    Hủy
                </Button>
                <Button
                    leftSection={<IconFileImport size="1rem" />}
                    onClick={() => onSave()}
                    disabled={importList.length === 0}
                    loading={isSubmitting}
                    variant="gradient"
                    gradient={{ from: 'blue', to: 'cyan' }}
                    size="md"
                    radius="md"
                >
                    💾 Tạo Phiếu Nhập
                </Button>
            </Group>
        </div>
    );
};

// --- CSVImportForm Component ---
const CSVImportForm = ({ onSave, onCancel, csvFile, setCsvFile, isSubmitting, importProgress, importResult }) => {
    return (
        <div style={{ padding: '1rem' }}>
            <SimpleGrid cols={1} spacing="lg">
                {/* Hướng dẫn format CSV */}
                <Alert
                    icon={<IconFileSpreadsheet size="1rem" />}
                    title="Định dạng file CSV yêu cầu"
                    color="blue"
                >
                    <Text size="sm" mb="xs">
                        File CSV cần có các cột sau (theo thứ tự):
                    </Text>
                    <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                        bookTitle, quantity, unitImportPrice
                    </Text>
                    <Text size="xs" mt="xs" c="dimmed">
                        Ví dụ: "Lập trình JavaScript", 150, 50000
                    </Text>
                </Alert>

                {/* File Upload */}
                <FileInput
                    label="📁 Chọn file CSV"
                    placeholder="Nhấn để chọn file CSV..."
                    accept=".csv"
                    value={csvFile}
                    onChange={setCsvFile}
                    size="md"
                    radius="md"
                />

                {/* Progress Bar */}
                {isSubmitting && (
                    <div>
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
                    </Alert>
                )}
            </SimpleGrid>

            <Group justify="flex-end" mt="xl" gap="md">
                <Button
                    variant="default"
                    onClick={onCancel}
                    size="md"
                    radius="md"
                    disabled={isSubmitting}
                >
                    {importResult?.success ? 'Đóng' : 'Hủy'}
                </Button>
                {!importResult?.success && (
                    <Button
                        leftSection={<IconUpload size="1rem" />}
                        onClick={() => onSave()}
                        variant="gradient"
                        gradient={{ from: 'green', to: 'teal' }}
                        size="md"
                        radius="md"
                        loading={isSubmitting}
                        disabled={!csvFile || isSubmitting}
                    >
                        💾 {isSubmitting ? 'Đang import...' : 'Bắt đầu Import'}
                    </Button>
                )}
            </Group>
        </div>
    );
};

// --- ImportSlipsList Component ---
const ImportSlipsList = ({ slips, onView, onPrint, isLoading, selectedMonth, setSelectedMonth, selectedYear, setSelectedYear, onRefresh }) => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    const months = [
        { value: '1', label: 'Tháng 1' },
        { value: '2', label: 'Tháng 2' },
        { value: '3', label: 'Tháng 3' },
        { value: '4', label: 'Tháng 4' },
        { value: '5', label: 'Tháng 5' },
        { value: '6', label: 'Tháng 6' },
        { value: '7', label: 'Tháng 7' },
        { value: '8', label: 'Tháng 8' },
        { value: '9', label: 'Tháng 9' },
        { value: '10', label: 'Tháng 10' },
        { value: '11', label: 'Tháng 11' },
        { value: '12', label: 'Tháng 12' },
    ];

    return (
        <Paper withBorder p="md" radius="md">
            <Group justify="space-between" mb="md">
                <Title order={3}>📋 Danh Sách Phiếu Nhập</Title>
                <Button
                    leftSection={<IconRefresh size="1rem" />}
                    onClick={onRefresh}
                    loading={isLoading}
                    variant="light"
                    size="sm"
                >
                    Tải lại
                </Button>
            </Group>

            <Group mb="md">
                <Select
                    label="Tháng"
                    placeholder="Chọn tháng"
                    data={months}
                    value={selectedMonth.toString()}
                    onChange={(value) => setSelectedMonth(parseInt(value))}
                    style={{ width: 200 }}
                />
                <Select
                    label="Năm"
                    placeholder="Chọn năm"
                    data={years.map(year => ({ value: year.toString(), label: year.toString() }))}
                    value={selectedYear.toString()}
                    onChange={(value) => setSelectedYear(parseInt(value))}
                    style={{ width: 200 }}
                />
            </Group>

            {isLoading ? (
                <Group justify="center" py="xl">
                    <Loader size="lg" />
                </Group>
            ) : slips.length > 0 ? (
                <>
                    <Card withBorder mb="md">
                        <SimpleGrid cols={3}>
                            <div>
                                <Text size="sm" c="dimmed">Tổng số phiếu</Text>
                                <Text size="xl" fw={700}>{slips.length}</Text>
                            </div>
                            <div>
                                <Text size="sm" c="dimmed">Tổng số sách</Text>
                                <Text size="xl" fw={700}>
                                    {slips.reduce((sum, slip) =>
                                        sum + slip.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
                                    ).toLocaleString('vi-VN')} cuốn
                                </Text>
                            </div>
                            <div>
                                <Text size="sm" c="dimmed">Tổng giá trị</Text>
                                <Text size="xl" fw={700}>
                                    {slips.reduce((sum, slip) =>
                                        sum + slip.items.reduce((itemSum, item) =>
                                            itemSum + (item.quantity * item.unitImportPrice), 0), 0
                                    ).toLocaleString('vi-VN')} ₫
                                </Text>
                            </div>
                        </SimpleGrid>
                    </Card>

                    <Table striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Ngày</Table.Th>
                                <Table.Th>Mã phiếu</Table.Th>
                                <Table.Th>Số loại sách</Table.Th>
                                <Table.Th>Tổng số lượng</Table.Th>
                                <Table.Th>Tổng tiền</Table.Th>
                                <Table.Th>Thao tác</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {slips.map((slip) => (
                                <Table.Tr key={slip._id}>
                                    <Table.Td>{new Date(slip.createdAt).toLocaleDateString('vi-VN')}</Table.Td>
                                    <Table.Td>#{slip._id}</Table.Td>
                                    <Table.Td>{slip.items.length}</Table.Td>
                                    <Table.Td>{slip.items.reduce((sum, item) => sum + item.quantity, 0).toLocaleString('vi-VN')}</Table.Td>
                                    <Table.Td>{slip.items.reduce((sum, item) => sum + (item.quantity * item.unitImportPrice), 0).toLocaleString('vi-VN')} ₫</Table.Td>
                                    <Table.Td>
                                        <Group gap="xs">
                                            <ActionIcon
                                                variant="light"
                                                color="blue"
                                                onClick={() => onView(slip)}
                                                title="Xem chi tiết"
                                            >
                                                <IconReceipt size="1rem" />
                                            </ActionIcon>
                                            <ActionIcon
                                                variant="light"
                                                color="green"
                                                onClick={() => onPrint(slip)}
                                                title="In phiếu"
                                            >
                                                <IconPrinter size="1rem" />
                                            </ActionIcon>
                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </>
            ) : (
                <Alert color="yellow" title="Không có dữ liệu">
                    Không tìm thấy phiếu nhập nào trong tháng {selectedMonth}/{selectedYear}
                </Alert>
            )}
        </Paper>
    );
};

// --- ImportSlipDetails Component ---
const ImportSlipDetails = ({ slip, onClose, onPrint }) => {
    if (!slip) return null;

    return (
        <div>
            <Group justify="space-between" mb="md">
                <Title order={3}>Chi Tiết Phiếu Nhập #{slip._id}</Title>
                <Group>
                    <Button
                        leftSection={<IconPrinter size="1rem" />}
                        onClick={onPrint}
                        variant="light"
                    >
                        In Phiếu
                    </Button>
                    <Button
                        variant="default"
                        onClick={onClose}
                    >
                        Đóng
                    </Button>
                </Group>
            </Group>

            <Stack spacing="md">
                <Paper withBorder p="md">
                    <Text size="sm" c="dimmed">Ngày tạo: {new Date(slip.createdAt).toLocaleString('vi-VN')}</Text>
                    <Text size="sm" c="dimmed">Tổng số sách: {slip.items.length} loại</Text>
                    <Text size="sm" c="dimmed">Tổng số lượng: {slip.items.reduce((sum, item) => sum + item.quantity, 0)} cuốn</Text>
                    <Text size="sm" c="dimmed">Tổng tiền: {slip.items.reduce((sum, item) => sum + (item.quantity * item.unitImportPrice), 0).toLocaleString('vi-VN')} ₫</Text>
                </Paper>

                <Table striped highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Tên sách</Table.Th>
                            <Table.Th>Số lượng</Table.Th>
                            <Table.Th>Đơn giá</Table.Th>
                            <Table.Th>Thành tiền</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {slip.items.map((item, index) => (
                            <Table.Tr key={index}>
                                <Table.Td>
                                    {item.book?.title || 
                                     (typeof item.book === 'string' ? 
                                      allBooks.find(b => b._id === item.book)?.label || 'Không rõ' : 
                                      'Không rõ')}
                                </Table.Td>
                                <Table.Td>{item.quantity}</Table.Td>
                                <Table.Td>{item.unitImportPrice.toLocaleString('vi-VN')} ₫</Table.Td>
                                <Table.Td>{(item.quantity * item.unitImportPrice).toLocaleString('vi-VN')} ₫</Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </Stack>
        </div>
    );
};

const ImportPage = () => {
    const [allBooks, setAllBooks] = useState([]);
    const [importList, setImportList] = useState([]);
    const [notification, setNotification] = useState({ show: false, message: '', color: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [csvFile, setCsvFile] = useState(null);
    const fileInputRef = useRef();

    // New states for import slips
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [importSlips, setImportSlips] = useState([]);
    const [isLoadingSlips, setIsLoadingSlips] = useState(false);
    const [selectedSlip, setSelectedSlip] = useState(null);
    const [isViewModalOpen, { open: openViewModal, close: closeViewModal }] = useDisclosure(false);

    // Modal states - using useDisclosure like AdminDashboard
    const [isManualModalOpen, { open: openManualModal, close: closeManualModal }] = useDisclosure(false);
    const [isCsvModalOpen, { open: openCsvModal, close: closeCsvModal }] = useDisclosure(false);
    const [importProgress, setImportProgress] = useState(0);
    const [importResult, setImportResult] = useState(null);

    // Tải tất cả sách một lần khi component mount
    useEffect(() => {
        const loadBooks = async () => {
            try {
                const response = await API.books.getAllBooks();
                setAllBooks(response.data.books.map(b => ({ value: b._id, label: b.title, ...b })));
            } catch (error) {
                showNotification('Không thể tải danh sách sách.', 'red');
            }
        };
        loadBooks();
    }, []);

    // Load import slips when month/year changes
    useEffect(() => {
        loadImportSlips();
    }, [selectedMonth, selectedYear]);

    const loadImportSlips = async () => {
        try {
            setIsLoadingSlips(true);
            const response = await API.import.getAllSlip({
                month: selectedMonth,
                year: selectedYear
            });
            setImportSlips(response.data.slips || []);
        } catch (error) {
            console.error('Error loading import slips:', error);
            setNotification({
                show: true,
                message: 'Không thể tải danh sách phiếu nhập',
                color: 'red'
            });
        } finally {
            setIsLoadingSlips(false);
        }
    };

    const showNotification = (message, color) => {
        setNotification({ show: true, message, color });
        setTimeout(() => setNotification({ show: false, message: '', color: '' }), 4000);
    };

    const handleViewSlip = (slip) => {
        setSelectedSlip(slip);
        openViewModal();
    };

    const handlePrintSlip = (slip) => {
        const printWindow = window.open('', '_blank');
        const slipTotalAmount = slip.items.reduce((sum, item) =>
            sum + (item.quantity * item.unitImportPrice), 0
        );

        const printContent = `
            <html>
                <head>
                    <title>Phiếu Nhập #${slip._id}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        .header { text-align: center; margin-bottom: 20px; }
                        .info { margin-bottom: 20px; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f5f5f5; }
                        .total { text-align: right; font-weight: bold; }
                        @media print {
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>PHIẾU NHẬP SÁCH</h1>
                        <p>Mã phiếu: #${slip._id}</p>
                        <p>Ngày: ${new Date(slip.createdAt).toLocaleString('vi-VN')}</p>
                    </div>
                    
                    <div class="info">
                        <p>Tổng số loại sách: ${slip.items.length}</p>
                        <p>Tổng số lượng: ${slip.items.reduce((sum, item) => sum + item.quantity, 0)} cuốn</p>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Tên sách</th>
                                <th>Số lượng</th>
                                <th>Đơn giá</th>
                                <th>Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${slip.items.map(item => `
                                <tr>
                                    <td>${item.book?.title || 
                                         (typeof item.book === 'string' ? 
                                          allBooks.find(b => b._id === item.book)?.label || 'Không rõ' : 
                                          'Không rõ')}</td>
                                    <td>${item.quantity}</td>
                                    <td>${item.unitImportPrice.toLocaleString('vi-VN')} ₫</td>
                                    <td>${(item.quantity * item.unitImportPrice).toLocaleString('vi-VN')} ₫</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="total">
                        <p>Tổng tiền: ${slipTotalAmount.toLocaleString('vi-VN')} ₫</p>
                    </div>

                    <div class="no-print" style="margin-top: 20px; text-align: center;">
                        <button onclick="window.print()">In Phiếu</button>
                    </div>
                </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
    };

    // Hàm gọi API tạo phiếu nhập thủ công
    const handleCreateImportSlip = async () => {
        console.log('📋 Creating import slip...');
        console.log('📚 Import list:', importList);

        if (importList.length === 0) {
            showNotification("Vui lòng thêm ít nhất một sách vào danh sách.", "orange");
            return;
        }

        // Validate dữ liệu
        const invalidItems = importList.filter(item =>
            !item.importQuantity || item.importQuantity <= 0 ||
            !item.unitImportPrice || item.unitImportPrice <= 0
        );

        console.log('❌ Invalid items:', invalidItems);

        if (invalidItems.length > 0) {
            showNotification("Vui lòng nhập đầy đủ số lượng và giá nhập hợp lệ cho tất cả sách.", "orange");
            return;
        }

        setIsSubmitting(true);
        try {
            const slipData = {
                items: importList.map(item => ({
                    bookId: item._id,
                    quantity: item.importQuantity,
                    unitImportPrice: item.unitImportPrice
                }))
            };

            console.log('📤 Sending slip data:', slipData);
            console.log('📡 API function:', API.import?.importBook);

            const response = await API.import.importBook(slipData);
            console.log('✅ API response:', response);

            showNotification("Tạo phiếu nhập thành công!", "teal");
            
            // Reset toàn bộ state
            setImportList([]);
            closeManualModal();
            
            // Tự động refresh danh sách phiếu nhập
            await loadImportSlips();
        } catch (error) {
            console.error('❌ Error creating import slip:', error);
            console.error('❌ Error response:', error.response);
            console.error('❌ Error data:', error.response?.data);
            showNotification(error.response?.data?.message || error.message || "Lỗi khi tạo phiếu nhập.", "red");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Hàm import từ CSV
    const handleCSVImport = async () => {
        if (!csvFile) {
            showNotification("Vui lòng chọn file CSV.", "orange");
            return;
        }

        setIsSubmitting(true);
        setImportProgress(0);
        setImportResult(null);

        try {
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

            const formData = new FormData();
            formData.append('file', csvFile);

            const response = await API.import.importFromCSV(formData);

            console.log(response.data)

            clearInterval(progressInterval);
            setImportProgress(100);

            const data = response.data;
            const result = data.slip || {};
            const importedCount = result.totalItem || 0;
            console.log(result, importedCount)
            const failedCount = Array.isArray(result.failed) ? result.failed.length : (result.failedCount || 0);

            setImportResult({
                success: true,
                message: data.message || 'Import thành công!',
                imported: importedCount,
                failed: failedCount,
                details: result.details || result.errors || []
            });

            showNotification(`Import thành công ${importedCount} sách!`, "teal");
            
            // Tự động refresh danh sách phiếu nhập sau khi import thành công
            await loadImportSlips();
            
            // Đóng modal và reset state sau 2 giây để user có thể thấy kết quả
            setTimeout(() => {
                resetCSVImportState();
                closeCsvModal();
            }, 2000);
            
        } catch (error) {
            setImportProgress(100);
            setImportResult({
                success: false,
                message: error.response?.data?.message || error.message || 'Có lỗi xảy ra khi import',
                details: error.response?.data?.details || [error.message]
            });
            showNotification(error.response?.data?.message || "Lỗi khi import từ CSV.", "red");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Hàm reset state CSV import
    const resetCSVImportState = () => {
        setCsvFile(null);
        setImportProgress(0);
        setImportResult(null);
        setIsSubmitting(false);
    };

    // Hàm reset state manual import
    const resetManualImportState = () => {
        setImportList([]);
        setIsSubmitting(false);
    };

    // Hàm đóng modal CSV với reset
    const handleCloseCsvModal = () => {
        resetCSVImportState();
        closeCsvModal();
    };

    // Hàm đóng modal manual với reset
    const handleCloseManualModal = () => {
        resetManualImportState();
        closeManualModal();
    };

    // Hàm tải file CSV mẫu
    const downloadSampleCSV = () => {
        const csvContent = `bookTitle,quantity,unitImportPrice
"Lập trình JavaScript",150,50000
"Database Design",100,45000
"UI/UX Design",200,55000`;

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'import_sample.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Tính tổng tiền
    const totalAmount = importList.reduce((sum, item) => sum + (item.importQuantity * item.unitImportPrice), 0);

    // Hiển thị danh sách sách trong bảng chính
    const rows = importList.map((book) => (
        <Table.Tr key={book._id}>
            <Table.Td>{book.label}</Table.Td>
            <Table.Td>{book.author?.name}</Table.Td>
            <Table.Td>
                <Text size="sm" fw={500} c="blue">
                    {book.importQuantity}
                </Text>
            </Table.Td>
            <Table.Td>
                <Text size="sm" fw={500} c="green">
                    {book.unitImportPrice?.toLocaleString('vi-VN')} ₫
                </Text>
            </Table.Td>
            <Table.Td>
                <Text size="sm" fw={500}>
                    {(book.importQuantity * book.unitImportPrice).toLocaleString('vi-VN')} ₫
                </Text>
            </Table.Td>
        </Table.Tr>
    ));

    // Component cho các thẻ thống kê
    const StatCard = ({ title, value, icon, color, description }) => (
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
                    gradient={{ from: color, to: color === 'blue' ? 'cyan' : color === 'green' ? 'teal' : 'orange' }}
                    size="xl"
                    radius="lg"
                >
                    {icon}
                </ActionIcon>
            </Group>
            <Text fw={700} size="2rem" c="dark" ta="center">
                {value}
            </Text>
            {description && (
                <Text size="xs" c="dimmed" ta="center" mt="xs">
                    {description}
                </Text>
            )}
        </Paper>
    );

    return (
        <div
            style={{
                minHeight: '100vh',
                width: '100vw',
                backgroundImage: 'url("/images/1139490.png")',
                padding: '1rem',
                boxSizing: 'border-box',
                overflow: 'auto',
                paddingTop: '70px',
            }}
        >
            {/* Vùng hiển thị thông báo */}
            {notification.show && (
                <Notification
                    icon={notification.color === 'red' ? <IconX /> : <IconCheck />}
                    color={notification.color}
                    onClose={() => setNotification({ show: false })}
                    style={{ position: 'fixed', top: 80, right: 20, zIndex: 1000 }}
                >
                    {notification.message}
                </Notification>
            )}

            <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Title order={1} mb="md" c="dark" style={{ fontWeight: 600 }}>
                        📦 Tạo Phiếu Nhập Sách
                    </Title>
                    <Text size="lg" c="dimmed" mb="xl">
                        Quản lý nhập sách vào kho hàng một cách hiệu quả
                    </Text>
                    <Group justify="center" wrap="wrap">
                        <Button
                            leftSection={<IconPlus size="1rem" />}
                            onClick={() => {
                                resetManualImportState();
                                openManualModal();
                            }}
                            gradient={{ from: 'blue', to: 'cyan' }}
                            variant="gradient"
                            size="lg"
                            radius="md"
                        >
                            Nhập Thủ Công
                        </Button>
                        <Button
                            leftSection={<IconUpload size="1rem" />}
                            onClick={() => {
                                resetCSVImportState();
                                openCsvModal();
                            }}
                            gradient={{ from: 'green', to: 'teal' }}
                            variant="gradient"
                            size="lg"
                            radius="md"
                        >
                            Import CSV
                        </Button>
                        <Button
                            leftSection={<IconDownload size="1rem" />}
                            onClick={downloadSampleCSV}
                            variant="outline"
                            size="lg"
                            radius="md"
                        >
                            Tải File Mẫu
                        </Button>
                    </Group>
                </div>

                {/* Thống kê */}
                {/* <div style={{ marginBottom: '2rem' }}>
                    <Title order={3} ta="center" mb="lg" c="dark">
                        📊 Tình Trạng Nhập Sách
                    </Title>
                    <SimpleGrid
                        cols={{ base: 1, sm: 2, md: 3 }}
                        spacing="lg"
                        style={{ margin: '0 auto', maxWidth: '800px' }}
                    >
                        <StatCard
                            title="Sách Trong Phiếu"
                            value={importList.length}
                            icon={<IconReceipt size="1.5rem" />}
                            color="blue"
                            description="Loại sách khác nhau"
                        />
                        <StatCard
                            title="Tổng Số Lượng"
                            value={importList.reduce((sum, item) => sum + item.importQuantity, 0)}
                            icon={<IconFileImport size="1.5rem" />}
                            color="green"
                            description="Cuốn sách"
                        />
                        <StatCard
                            title="Tổng Giá Trị"
                            value={`${(totalAmount / 1000000).toFixed(1)}M`}
                            icon={<IconFileSpreadsheet size="1.5rem" />}
                            color="orange"
                            description={`${totalAmount.toLocaleString('vi-VN')} ₫`}
                        />
                    </SimpleGrid>
                </div> */}

                {/* Danh sách sách đã thêm */}
                {importList.length > 0 && (
                    <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto' }}>
                        <Paper
                            withBorder
                            p="xl"
                            radius="lg"
                            shadow="sm"
                            style={{
                                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                            }}
                        >
                            <Title order={3} mb="xl" ta="center" c="dark">
                                📋 Danh Sách Sách Chuẩn Bị Nhập
                            </Title>
                            <div style={{
                                maxHeight: '400px',
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
                                            <Table.Th style={{ fontWeight: 600, color: '#495057' }}>📦 Số Lượng</Table.Th>
                                            <Table.Th style={{ fontWeight: 600, color: '#495057' }}>💰 Giá Nhập</Table.Th>
                                            <Table.Th style={{ fontWeight: 600, color: '#495057' }}>💵 Thành Tiền</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {rows}
                                    </Table.Tbody>
                                </Table>
                            </div>

                            <Card mt="md" withBorder>
                                <Group justify="space-between">
                                    <div>
                                        <Text size="lg" fw={600}>
                                            Tổng tiền: {totalAmount.toLocaleString('vi-VN')} ₫
                                        </Text>
                                        <Text size="sm" c="dimmed">
                                            {importList.length} loại sách, {importList.reduce((sum, item) => sum + item.importQuantity, 0)} cuốn
                                        </Text>
                                    </div>
                                    <Button
                                        leftSection={<IconFileImport size="1rem" />}
                                        onClick={handleCreateImportSlip}
                                        loading={isSubmitting}
                                        disabled={importList.length === 0}
                                        size="lg"
                                        gradient={{ from: 'blue', to: 'cyan' }}
                                        variant="gradient"
                                    >
                                        Xác Nhận Tạo Phiếu Nhập
                                    </Button>
                                </Group>
                            </Card>
                        </Paper>
                    </div>
                )}
            </div>

            {/* Import Slips List */}
            <ImportSlipsList
                slips={importSlips}
                onView={handleViewSlip}
                onPrint={handlePrintSlip}
                isLoading={isLoadingSlips}
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                onRefresh={loadImportSlips}
            />

            {/* View Import Slip Modal */}
            <Modal
                opened={isViewModalOpen}
                onClose={closeViewModal}
                size="xl"
                title="Chi Tiết Phiếu Nhập"
                centered
                radius="lg"
                shadow="xl"
                zIndex={1000}
                overlayProps={{
                    backgroundOpacity: 0.75,
                    blur: 1,
                    zIndex: 999
                }}
                styles={{
                    root: {
                        zIndex: 1000,
                    },
                    inner: {
                        zIndex: 1000,
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                    },
                    modal: {
                        backgroundColor: 'white',
                        zIndex: 1000,
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
                        zIndex: 999,
                        backgroundColor: 'rgba(0, 0, 0, 0.75) !important'
                    }
                }}
            >
                {selectedSlip && (
                    <div>
                        <Group justify="space-between" mb="md">
                            <Title order={3}>Chi Tiết Phiếu Nhập #{selectedSlip._id}</Title>
                            <Group>
                                <Button
                                    leftSection={<IconPrinter size="1rem" />}
                                    onClick={() => handlePrintSlip(selectedSlip)}
                                    variant="light"
                                >
                                    In Phiếu
                                </Button>
                                <Button
                                    variant="default"
                                    onClick={closeViewModal}
                                >
                                    Đóng
                                </Button>
                            </Group>
                        </Group>

                        <Stack spacing="md">
                            <Paper withBorder p="md">
                                <Text size="sm" c="dimmed">Ngày tạo: {new Date(selectedSlip.createdAt).toLocaleString('vi-VN')}</Text>
                                <Text size="sm" c="dimmed">Tổng số sách: {selectedSlip.items.length} loại</Text>
                                <Text size="sm" c="dimmed">Tổng số lượng: {selectedSlip.items.reduce((sum, item) => sum + item.quantity, 0)} cuốn</Text>
                                <Text size="sm" c="dimmed">Tổng tiền: {selectedSlip.items.reduce((sum, item) => sum + (item.quantity * item.unitImportPrice), 0).toLocaleString('vi-VN')} ₫</Text>
                            </Paper>

                            <Table striped highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Tên sách</Table.Th>
                                        <Table.Th>Số lượng</Table.Th>
                                        <Table.Th>Đơn giá</Table.Th>
                                        <Table.Th>Thành tiền</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {selectedSlip.items.map((item, index) => (
                                        <Table.Tr key={index}>
                                            <Table.Td>
                                                {item.book?.title || 
                                                 (typeof item.book === 'string' ? 
                                                  allBooks.find(b => b._id === item.book)?.label || 'Không rõ' : 
                                                  'Không rõ')}
                                            </Table.Td>
                                            <Table.Td>{item.quantity}</Table.Td>
                                            <Table.Td>{item.unitImportPrice.toLocaleString('vi-VN')} ₫</Table.Td>
                                            <Table.Td>{(item.quantity * item.unitImportPrice).toLocaleString('vi-VN')} ₫</Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        </Stack>
                    </div>
                )}
            </Modal>

            {/* Modal Nhập Thủ Công */}
            <Modal
                opened={isManualModalOpen}
                onClose={handleCloseManualModal}
                title="✏️ Nhập Sách Thủ Công"
                centered
                size="xl"
                radius="lg"
                shadow="xl"
                zIndex={1000}
                overlayProps={{
                    backgroundOpacity: 0.75,
                    blur: 1,
                    zIndex: 999
                }}
                styles={{
                    root: {
                        zIndex: 1000,
                    },
                    inner: {
                        zIndex: 1000,
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                    },
                    modal: {
                        backgroundColor: 'white',
                        zIndex: 1000,
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
                        zIndex: 999,
                        backgroundColor: 'rgba(0, 0, 0, 0.75) !important'
                    }
                }}
                portalProps={{
                    target: document.body
                }}
            >
                <ManualImportForm
                    onSave={handleCreateImportSlip}
                    onCancel={handleCloseManualModal}
                    allBooks={allBooks}
                    importList={importList}
                    setImportList={setImportList}
                    isSubmitting={isSubmitting}
                />
            </Modal>

            {/* Modal Import CSV */}
            <Modal
                opened={isCsvModalOpen}
                onClose={handleCloseCsvModal}
                title="📊 Import Sách từ File CSV"
                centered
                size="lg"
                radius="lg"
                shadow="xl"
                zIndex={1000}
                overlayProps={{
                    backgroundOpacity: 0.75,
                    blur: 1,
                    zIndex: 999
                }}
                styles={{
                    root: {
                        zIndex: 1000,
                    },
                    inner: {
                        zIndex: 1000,
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                    },
                    modal: {
                        backgroundColor: 'white',
                        zIndex: 1000,
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
                        zIndex: 999,
                        backgroundColor: 'rgba(0, 0, 0, 0.75) !important'
                    }
                }}
                portalProps={{
                    target: document.body
                }}
            >
                <CSVImportForm
                    onSave={handleCSVImport}
                    onCancel={handleCloseCsvModal}
                    csvFile={csvFile}
                    setCsvFile={setCsvFile}
                    isSubmitting={isSubmitting}
                    importProgress={importProgress}
                    importResult={importResult}
                />
            </Modal>
        </div>
    );
};

export default ImportPage;