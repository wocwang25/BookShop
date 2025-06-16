// src/pages/staff/InvoicePage.jsx
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
    Badge,
    Card,
    Modal,
    Alert,
    SimpleGrid,
    Select,
    Stack,
    SegmentedControl,
    Divider
} from '@mantine/core';
import { IconTrash, IconFileInvoice, IconCheck, IconX, IconPlus, IconShoppingCart, IconCalendar, IconUser, IconBook, IconRefresh, IconPrinter, IconDownload } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';

// --- InvoiceItemForm Component ---
const InvoiceItemForm = ({ onSave, onCancel, allBooks = [], invoiceItems = [], setInvoiceItems, isSubmitting = false, rentalDays, setRentalDays }) => {
    const form = useForm({
        initialValues: { bookId: '', title: '', type: 'sale', quantity: 1, rentalDays: 7 },
    });

    const [selectedType, setSelectedType] = useState('sale');

    const handleAddToList = (selectedItem) => {
        console.log('🔍 Selected item:', selectedItem);

        if (!selectedItem) return;

        let bookToAdd;

        if (typeof selectedItem === 'string') {
            bookToAdd = allBooks.find(b => b.value === selectedItem || b.label === selectedItem);
        } else {
            bookToAdd = allBooks.find(b => b.value === selectedItem.value);
        }

        if (!bookToAdd) {
            // Có thể showNotification hoặc return
            console.error('Không tìm thấy sách phù hợp!');
            return;
        }

        if (bookToAdd && !invoiceItems.find(item => item._id === bookToAdd._id && item.type === selectedType)) {
            const newItem = {
                ...bookToAdd,
                type: selectedType,
                quantity: selectedType === 'sale' ? 1 : 1,
                // rentalDays: selectedType === 'rent' ? 7 : undefined,
                unitPrice: selectedType === 'sale' ? bookToAdd.salePrice : bookToAdd.rentalPrice
            };
            setInvoiceItems([...invoiceItems, newItem]);
        }
        form.reset();
    };

    const handleQuantityChange = (itemId, type, quantity) => {
        setInvoiceItems(invoiceItems.map(item =>
            item._id === itemId && item.type === type
                ? { ...item, quantity: quantity || 1 }
                : item
        ));
    };

    const handleRentalDaysChange = (itemId, days) => {
        setInvoiceItems(invoiceItems.map(item =>
            item._id === itemId && item.type === 'rent'
                ? { ...item, rentalDays: days || 1 }
                : item
        ));
    };

    const handleRemoveFromList = (itemId, type) => {
        setInvoiceItems(invoiceItems.filter(item => !(item._id === itemId && item.type === type)));
    };

    const salesItems = invoiceItems.filter(item => item.type === 'sale');
    const rentalItems = invoiceItems.filter(item => item.type === 'rent');

    const totalSales = salesItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const totalRentals = rentalItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice * rentalDays), 0);
    const grandTotal = totalSales + totalRentals;

    const renderItemRows = (items, type) => items.map((item) => (
        <Table.Tr key={`${item._id}-${type}`}>
            <Table.Td>{item.label}</Table.Td>
            <Table.Td>{item.author?.name}</Table.Td>
            <Table.Td>
                <Badge color={type === 'sale' ? 'blue' : 'green'} variant="filled">
                    {type === 'sale' ? 'Mua' : 'Thuê'}
                </Badge>
            </Table.Td>
            <Table.Td>
                <NumberInput
                    value={item.quantity}
                    onChange={(val) => handleQuantityChange(item._id, type, val)}
                    min={1}
                    step={1}
                    style={{ width: 80 }}
                />
            </Table.Td>
            {/* Khi render từng dòng, bỏ NumberInput số ngày thuê: */}
            {/* <Table.Td>
                {type === 'rent' ? (
                    <NumberInput
                        value={item.rentalDays}
                        onChange={(val) => handleRentalDaysChange(item._id, val)}
                        min={1}
                        step={1}
                        style={{ width: 80 }}
                    />
                ) : (
                    <Text size="sm" c="dimmed">-</Text>
                )}
            </Table.Td> */}
            <Table.Td>
                <Text size="sm" fw={500} c="green">
                    {item.unitPrice?.toLocaleString('vi-VN')} ₫
                </Text>
            </Table.Td>
            <Table.Td>
                <Text size="sm" fw={500}>
                    {type === 'sale'
                        ? (item.quantity * item.unitPrice).toLocaleString('vi-VN')
                        : (item.quantity * item.unitPrice * rentalDays).toLocaleString('vi-VN')
                    } ₫
                </Text>
            </Table.Td>
            <Table.Td>
                <ActionIcon color="red" onClick={() => handleRemoveFromList(item._id, type)}>
                    <IconTrash size="1rem" />
                </ActionIcon>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <div style={{ padding: '1rem' }}>
            <SimpleGrid cols={1} spacing="lg">
                <Group>
                    <div style={{ flex: 1 }}>
                        <Autocomplete
                            label="🔍 Tìm kiếm sách"
                            placeholder="Gõ tên sách..."
                            data={allBooks}
                            onOptionSubmit={handleAddToList}
                            value={form.values.title}
                            onChange={(value) => form.setFieldValue('title', value)}
                            size="md"
                            radius="md"
                            clearable
                            comboboxProps={{
                                zIndex: 12000,
                                withinPortal: true,
                            }}
                        />
                    </div>
                    <div>
                        <Text size="sm" fw={500} mb="xs">Loại giao dịch</Text>
                        <SegmentedControl
                            value={selectedType}
                            onChange={setSelectedType}
                            data={[
                                { label: '🛒 Mua', value: 'sale' },
                                { label: '📅 Thuê', value: 'rent' }
                            ]}
                            size="md"
                        />
                    </div>
                </Group>

                {selectedType === 'rent' && (
                    <Group>
                        <Text size="sm" fw={500}>Số ngày thuê</Text>
                        <NumberInput
                            value={rentalDays}
                            onChange={setRentalDays}
                            min={1}
                            step={1}
                            style={{ width: 100 }}
                            hideControls
                        />
                    </Group>
                )}

                {invoiceItems.length > 0 && (
                    <>
                        <div>
                            <Text size="lg" fw={600} mb="md">📋 Danh sách đã chọn:</Text>
                            <div style={{
                                maxHeight: '400px',
                                overflowY: 'auto',
                                border: '1px solid #e9ecef',
                                borderRadius: '8px'
                            }}>
                                <Table striped highlightOnHover size="sm">
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Tên sách</Table.Th>
                                            <Table.Th>Tác giả</Table.Th>
                                            <Table.Th>Loại</Table.Th>
                                            <Table.Th>Số lượng</Table.Th>
                                            {/* <Table.Th>Số ngày thuê</Table.Th> */}
                                            <Table.Th>Đơn giá</Table.Th>
                                            <Table.Th>Thành tiền</Table.Th>
                                            <Table.Th>Xóa</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {renderItemRows(salesItems, 'sale')}
                                        {renderItemRows(rentalItems, 'rent')}
                                    </Table.Tbody>
                                </Table>
                            </div>
                        </div>

                        <Card withBorder>
                            <SimpleGrid cols={3}>
                                <div>
                                    <Text size="sm" c="dimmed">Tổng tiền mua</Text>
                                    <Text size="lg" fw={600} c="blue">
                                        {totalSales.toLocaleString('vi-VN')} ₫
                                    </Text>
                                </div>
                                <div>
                                    <Text size="sm" c="dimmed">Tổng tiền thuê</Text>
                                    <Text size="lg" fw={600} c="green">
                                        {totalRentals.toLocaleString('vi-VN')} ₫
                                    </Text>
                                </div>
                                <div>
                                    <Text size="sm" c="dimmed">Tổng cộng</Text>
                                    <Text size="xl" fw={700}>
                                        {grandTotal.toLocaleString('vi-VN')} ₫
                                    </Text>
                                </div>
                            </SimpleGrid>
                        </Card>
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
                    leftSection={<IconFileInvoice size="1rem" />}
                    onClick={() => onSave()}
                    disabled={invoiceItems.length === 0}
                    loading={isSubmitting}
                    variant="gradient"
                    gradient={{ from: 'orange', to: 'red' }}
                    size="md"
                    radius="md"
                >
                    💰 Tạo Hóa Đơn
                </Button>
            </Group>
        </div>
    );
};

// --- InvoicesList Component ---
const InvoicesList = ({ invoices, onView, onPrint, isLoading, selectedMonth, setSelectedMonth, selectedYear, setSelectedYear, onRefresh }) => {
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
        <Paper withBorder p="md" radius="md" style={{
            background: 'rgba(255,255,255,0.85)' // Nền trắng mờ
        }}>
            <Group justify="space-between" mb="md">
                <Title order={3}>📄 Danh Sách Hóa Đơn</Title>
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
            ) : invoices.length > 0 ? (
                <>
                    <Card withBorder mb="md">
                        <SimpleGrid cols={3}>
                            <div>
                                <Text size="sm" c="dimmed">Tổng số hóa đơn</Text>
                                <Text size="xl" fw={700}>{invoices.length}</Text>
                            </div>
                            <div>
                                <Text size="sm" c="dimmed">Hóa đơn bán</Text>
                                <Text size="xl" fw={700} c="blue">
                                    {invoices.filter(inv => inv.type === 'sale').length}
                                </Text>
                            </div>
                            <div>
                                <Text size="sm" c="dimmed">Hóa đơn thuê</Text>
                                <Text size="xl" fw={700} c="green">
                                    {invoices.filter(inv => inv.type === 'rent').length}
                                </Text>
                            </div>
                        </SimpleGrid>
                    </Card>

                    <Table striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Ngày</Table.Th>
                                <Table.Th>Mã hóa đơn</Table.Th>
                                <Table.Th>Loại</Table.Th>
                                <Table.Th>Khách hàng</Table.Th>
                                <Table.Th>Tổng tiền</Table.Th>
                                <Table.Th>Thao tác</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {invoices.map((invoice) => (
                                <Table.Tr key={invoice._id}>
                                    <Table.Td>{new Date(invoice.createdAt).toLocaleDateString('vi-VN')}</Table.Td>
                                    <Table.Td>#{invoice._id}</Table.Td>
                                    <Table.Td>
                                        <Badge color={invoice.type === 'sale' ? 'blue' : 'green'}>
                                            {invoice.type === 'sale' ? 'Mua' : 'Thuê'}
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td>{invoice.customer?.name || 'N/A'}</Table.Td>
                                    <Table.Td>{invoice.totalAmount?.toLocaleString('vi-VN')} ₫</Table.Td>
                                    <Table.Td>
                                        <Group gap="xs">
                                            <ActionIcon
                                                variant="light"
                                                color="blue"
                                                onClick={() => onView(invoice)}
                                                title="Xem chi tiết"
                                            >
                                                <IconFileInvoice size="1rem" />
                                            </ActionIcon>
                                            <ActionIcon
                                                variant="light"
                                                color="green"
                                                onClick={() => onPrint && onPrint(invoice)}
                                                title="In hóa đơn"
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
                    Không tìm thấy hóa đơn nào trong tháng {selectedMonth}/{selectedYear}
                </Alert>
            )}
        </Paper>
    );
};

const InvoicePage = () => {
    const [allBooks, setAllBooks] = useState([]);
    const [invoiceItems, setInvoiceItems] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedCustomerInput, setSelectedCustomerInput] = useState('');
    const [notification, setNotification] = useState({ show: false, message: '', color: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // States for invoice list
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [rentalDays, setRentalDays] = useState(7); // mặc định 7 ngày
    const [invoices, setInvoices] = useState([]);
    const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isViewModalOpen, { open: openViewModal, close: closeViewModal }] = useDisclosure(false);

    // Modal states
    const [isInvoiceModalOpen, { open: openInvoiceModal, close: closeInvoiceModal }] = useDisclosure(false);

    // Load data on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const booksResponse = await API.books.getAllBooks();
                setAllBooks(booksResponse.data.books.map(b => ({
                    value: b._id,
                    label: b.title,
                    salePrice: b.salePrice || 50000, // Fallback price if not set
                    rentalPrice: b.rentalPrice || 5000, // Fallback price if not set
                    ...b
                })));

                // Try to load customers, use mock data if API not available
                try {
                    const customersResponse = await API.customer.getAllCustomers();
                    setCustomers(customersResponse.data.customers || customersResponse.data);
                } catch (customerError) {
                    console.warn('Customer API not available, using mock data:', customerError);
                    // Mock customers as fallback
                    setCustomers([
                        { _id: '1', name: 'Nguyễn Văn A', email: 'a@email.com' },
                        { _id: '2', name: 'Trần Thị B', email: 'b@email.com' },
                        { _id: '3', name: 'Lê Văn C', email: 'c@email.com' }
                    ]);
                }
            } catch (error) {
                console.error('Error loading data:', error);
                showNotification('Không thể tải dữ liệu.', 'red');
            }
        };
        loadData();
    }, []);

    // Load invoices when month/year changes
    useEffect(() => {
        loadInvoices();
    }, [selectedMonth, selectedYear]);

    const loadInvoices = async () => {
        try {
            setIsLoadingInvoices(true);

            // Load both sales and rental invoices
            const [salesResponse, rentalResponse] = await Promise.all([
                API.invoice.getSalesInvoice({ month: selectedMonth, year: selectedYear }),
                API.invoice.getRentalInvoice({ month: selectedMonth, year: selectedYear })
            ]);

            // Combine and format invoices
            const salesInvoices = (salesResponse.data.invoices || []).map(invoice => ({
                ...invoice,
                type: 'sale'
            }));

            const rentalInvoices = (rentalResponse.data.invoices || []).map(invoice => ({
                ...invoice,
                type: 'rent'
            }));

            const allInvoices = [...salesInvoices, ...rentalInvoices];

            // Sort by creation date (newest first)
            allInvoices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setInvoices(allInvoices);
        } catch (error) {
            console.error('Error loading invoices:', error);

            // Use mock data as fallback
            const mockInvoices = [
                {
                    _id: 'inv001',
                    type: 'sale',
                    customer: { name: 'Nguyễn Văn A' },
                    totalAmount: 150000,
                    createdAt: new Date(),
                    items: []
                },
                {
                    _id: 'inv002',
                    type: 'rent',
                    customer: { name: 'Trần Thị B' },
                    totalAmount: 75000,
                    createdAt: new Date(),
                    items: []
                }
            ];
            setInvoices(mockInvoices);
            showNotification('Không thể tải danh sách hóa đơn, hiển thị dữ liệu mẫu', 'yellow');
        } finally {
            setIsLoadingInvoices(false);
        }
    };

    const showNotification = (message, color) => {
        setNotification({ show: true, message, color });
        setTimeout(() => setNotification({ show: false, message: '', color: '' }), 4000);
    };

    const handleCreateInvoice = async () => {
        if (!selectedCustomerInput || invoiceItems.length === 0) {
            showNotification("Vui lòng chọn khách hàng và thêm sản phẩm.", "orange");
            return;
        }

        setIsSubmitting(true);
        try {
            // Tìm khách hàng cũ
            const matchedCustomer = customers.find(
                c => `${c.name} (${c.email})` === selectedCustomerInput
            );

            // Nếu có, lấy thông tin cũ, nếu không thì tạo mới với tên nhập vào
            const customer_name = matchedCustomer ? matchedCustomer.name : selectedCustomerInput;

            const salesItems = invoiceItems.filter(item => item.type === 'sale');
            const rentalItems = invoiceItems.filter(item => item.type === 'rent');

            // Gửi hóa đơn bán
            if (salesItems.length > 0) {
                const salesData = {
                    customer_name: customer_name,
                    items: salesItems.map(item => ({
                        title: item.label, // dùng label là tên sách
                        quantity: item.quantity
                    }))
                };
                await API.invoice.createSalesInvoice(salesData);
            }

            // Gửi hóa đơn thuê
            if (rentalItems.length > 0) {
                const today = new Date();
                const dueDate = new Date(today);
                dueDate.setDate(today.getDate() + rentalDays);

                const rentalData = {
                    customer_name: customer_name,
                    items: rentalItems.map(item => ({
                        title: item.label
                    })),
                    rent_info: {
                        startDate: today.toISOString().slice(0, 10),
                        dueDate: dueDate.toISOString().slice(0, 10),
                    }
                };
                await API.invoice.createRentalInvoice(rentalData);
            }

            showNotification("Tạo hóa đơn thành công!", "teal");
            resetInvoiceState();
            closeInvoiceModal();
            await loadInvoices();
        } catch (error) {
            console.error('Error creating invoice:', error);
            showNotification(error.response?.data?.error || "Lỗi khi tạo hóa đơn.", "red");
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetInvoiceState = () => {
        setInvoiceItems([]);
        setSelectedCustomer(null);
        setSelectedCustomerInput('');
        setIsSubmitting(false);
    };

    const handleCloseInvoiceModal = () => {
        resetInvoiceState();
        closeInvoiceModal();
    };

    const handleViewInvoice = (invoice) => {
        setSelectedInvoice(invoice);
        openViewModal();
    };

    const handlePrintInvoice = (invoiceToPrint = null) => {
        const invoice = invoiceToPrint || selectedInvoice;
        console.log('🖨️ handlePrintInvoice called', invoice);

        if (!invoice) {
            console.error('❌ No invoice found');
            showNotification('Không tìm thấy hóa đơn cần in', 'red');
            return;
        }

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            showNotification('Không thể mở cửa sổ in. Vui lòng cho phép popup.', 'red');
            return;
        }

        const totalAmount = invoice.totalAmount || 0;
        const items = invoice.items || [];

        const printContent = `
            <html>
                <head>
                    <title>Hóa đơn #${invoice._id}</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            padding: 20px; 
                            line-height: 1.6;
                            color: #333;
                        }
                        .header { 
                            text-align: center; 
                            margin-bottom: 30px; 
                            border-bottom: 3px solid #4A90E2;
                            padding-bottom: 20px;
                        }
                        .company-name {
                            font-size: 28px;
                            font-weight: bold;
                            color: #4A90E2;
                            margin-bottom: 10px;
                        }
                        .invoice-title {
                            font-size: 24px;
                            font-weight: bold;
                            color: #E74C3C;
                            margin: 15px 0;
                        }
                        .info { 
                            margin-bottom: 30px; 
                            display: flex;
                            justify-content: space-between;
                            background: #f8f9fa;
                            padding: 20px;
                            border-radius: 8px;
                        }
                        .info-section {
                            flex: 1;
                            margin-right: 20px;
                        }
                        .info-section:last-child {
                            margin-right: 0;
                        }
                        .info-section h3 {
                            color: #4A90E2;
                            margin-bottom: 10px;
                            font-size: 16px;
                        }
                        .info-section p {
                            margin: 5px 0;
                            font-size: 14px;
                        }
                        table { 
                            width: 100%; 
                            border-collapse: collapse; 
                            margin-bottom: 30px; 
                        }
                        th, td { 
                            border: 1px solid #ddd; 
                            padding: 12px 8px; 
                            text-align: left; 
                        }
                        th { 
                            background-color: #4A90E2; 
                            color: white;
                            font-weight: bold;
                        }
                        tr:nth-child(even) {
                            background-color: #f8f9fa;
                        }
                        .total { 
                            text-align: right; 
                            font-weight: bold; 
                            background: #E8F4FD;
                            padding: 20px;
                            border-radius: 8px;
                            border-left: 5px solid #4A90E2;
                        }
                        .total-amount {
                            font-size: 24px;
                            color: #E74C3C;
                            margin-top: 10px;
                        }
                        .footer {
                            margin-top: 50px;
                            text-align: center;
                            padding-top: 20px;
                            border-top: 2px solid #ddd;
                            color: #666;
                        }
                        @media print {
                            .no-print { display: none; }
                            body { margin: 0; padding: 15px; }
                        }
                    </style>
                </head>
                <body>
                                      <!-- Đặt trong phần header của phiếu thu tiền -->
                    <div class="header">
                        <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
                            <img src="/images/logo-navy.svg" alt="Readify" style="height:36px; margin-right:8px; object-fit:contain;" />
                            <span style="font-size: 28px; font-weight: 700; font-family: 'Pacifico', cursive; color:rgb(5, 20, 36);">
                                Readify
                            </span>
                        </div>
                        <div style="font-size: 14px; color: #666;">Địa chỉ: Kí túc xá khu B, TP.HCM</div>
                        <div style="font-size: 14px; color: #666;">Điện thoại: 0123 456 789 | Email: lolicute@readify.com</div>
                        <div class="invoice-title">
                            HÓA ĐƠN ${invoice.type === 'sale' ? 'BÁN SÁCH' : 'THUÊ SÁCH'}
                        </div>
                    </div>                    
                    <div class="info">
                        <div class="info-section">
                            <h3>📋 Thông tin hóa đơn</h3>
                            <p><strong>Mã hóa đơn:</strong> #${invoice._id}</p>
                            <p><strong>Ngày lập:</strong> ${new Date(invoice.createdAt).toLocaleDateString('vi-VN')}</p>
                            <p><strong>Loại hóa đơn:</strong> ${invoice.type === 'sale' ? 'Mua sách' : 'Thuê sách'}</p>
                        </div>
                        <div class="info-section">
                            <h3>👤 Thông tin khách hàng</h3>
                            <p><strong>Tên khách hàng:</strong> ${invoice.customer?.name || 'N/A'}</p>
                            <p><strong>Email:</strong> ${invoice.customer?.email || 'N/A'}</p>
                            ${invoice.type === 'rent' ? `
                            <p><strong>Ngày thuê:</strong> ${invoice.startDate ? new Date(invoice.startDate).toLocaleDateString('vi-VN') : '-'}</p>
                            <p><strong>Ngày trả:</strong> ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('vi-VN') : '-'}</p>
                            ` : ''}
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th style="width: 5%;">STT</th>
                                <th style="width: 35%;">Tên sách</th>
                                <th style="width: 20%;">Thể loại</th>
                                <th style="width: 10%;">SL</th>
                                ${invoice.type === 'sale' ? `
                                <th style="width: 15%;">Đơn giá</th>
                                <th style="width: 15%;">Thành tiền</th>
                                ` : `
                                <th style="width: 15%;">Ngày thuê</th>
                                <th style="width: 15%;">Ngày trả</th>
                                `}
                            </tr>
                        </thead>
                        <tbody>
                            ${items.map((item, idx) => {
            const category = item.book?.category?.name || item.category?.name || item.book?.category || item.category || 'Không xác định';
            const bookTitle = item.book?.title || item.title || 'Không có tên';
            const quantity = item.quantity || 1;

            if (invoice.type === 'sale') {
                const unitPrice = item.unitPrice || 0;
                const total = unitPrice * quantity;
                return `
                                        <tr>
                                            <td style="text-align: center;">${idx + 1}</td>
                                            <td>${bookTitle}</td>
                                            <td>${category}</td>
                                            <td style="text-align: center;">${quantity}</td>
                                            <td style="text-align: right;">${unitPrice.toLocaleString('vi-VN')} ₫</td>
                                            <td style="text-align: right;">${total.toLocaleString('vi-VN')} ₫</td>
                                        </tr>
                                    `;
            } else {
                return `
                                        <tr>
                                            <td style="text-align: center;">${idx + 1}</td>
                                            <td>${bookTitle}</td>
                                            <td>${category}</td>
                                            <td style="text-align: center;">${quantity}</td>
                                            <td>${invoice.startDate ? new Date(invoice.startDate).toLocaleDateString('vi-VN') : '-'}</td>
                                            <td>${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('vi-VN') : '-'}</td>
                                        </tr>
                                    `;
            }
        }).join('')}
                        </tbody>
                    </table>

                    <div class="total">
                        <p style="font-size: 16px; margin-bottom: 10px;">Tổng số mặt hàng: <strong>${items.length}</strong></p>
                        <div class="total-amount">
                            TỔNG CỘNG: ${totalAmount.toLocaleString('vi-VN')} ₫
                        </div>
                    </div>

                    <div class="footer">
                        <p><em>Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi!</em></p>
                        <p style="margin-top: 10px; font-size: 12px;">In lúc: ${new Date().toLocaleString('vi-VN')}</p>
                    </div>

                    <div class="no-print" style="margin-top: 20px; text-align: center;">
                        <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; background: #4A90E2; color: white; border: none; border-radius: 5px; cursor: pointer;">In Hóa Đơn</button>
                    </div>
                </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        showNotification('Đã mở cửa sổ in hóa đơn', 'green');
    };

    const totalAmount = invoiceItems.reduce((sum, item) => {
        if (item.type === 'sale') {
            return sum + (item.quantity * item.unitPrice);
        } else {
            return sum + (item.quantity * item.unitPrice * rentalDays);
        }
    }, 0);

    return (
        <div
            style={{
                minHeight: '100vh',
                width: '100vw',
                backgroundImage: 'url("/images/1139490.png")',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center center',
                backgroundAttachment: 'fixed',
                padding: '1rem',
                boxSizing: 'border-box',
                overflow: 'auto',
                paddingTop: '70px',
            }}
        >
            {/* Notifications */}
            {notification.show && (
                <Notification
                    icon={notification.color === 'red' ? <IconX /> : <IconCheck />}
                    color={notification.color}
                    onClose={() => setNotification({ show: false })}
                    style={{ position: 'fixed', top: 80, right: 20, zIndex: 12000 }}
                >
                    {notification.message}
                </Notification>
            )}

            <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Title order={1} mb="md" c="dark" style={{ fontWeight: 600 }}>
                        🧾 Quản Lý Hóa Đơn
                    </Title>
                    <Text size="lg" c="dimmed" mb="xl">
                        Tạo hóa đơn mua và thuê sách cho khách hàng
                    </Text>
                    <Group justify="center" wrap="wrap">
                        <Button
                            leftSection={<IconPlus size="1rem" />}
                            onClick={() => {
                                resetInvoiceState();
                                openInvoiceModal();
                            }}
                            gradient={{ from: 'orange', to: 'red' }}
                            variant="gradient"
                            size="lg"
                            radius="md"
                        >
                            Tạo Hóa Đơn Mới
                        </Button>
                    </Group>
                </div>

                {/* Customer Selection */}
                {selectedCustomer && (
                    <Paper withBorder p="md" radius="md" mb="xl">
                        <Group>
                            <IconUser size="1.5rem" />
                            <div>
                                <Text size="sm" c="dimmed">Khách hàng được chọn:</Text>
                                <Text size="lg" fw={600}>{selectedCustomer.name}</Text>
                                <Text size="sm" c="dimmed">{selectedCustomer.email}</Text>
                            </div>
                        </Group>
                    </Paper>
                )}

                {/* Invoice items display */}
                {invoiceItems.length > 0 && (
                    <Paper withBorder p="xl" radius="lg" shadow="sm" mb="xl">
                        <Title order={3} mb="xl" ta="center" c="dark">
                            📋 Hóa Đơn Đang Tạo
                        </Title>
                        <Card withBorder>
                            <Text size="lg" fw={600} ta="center">
                                Tổng tiền: {totalAmount.toLocaleString('vi-VN')} ₫
                            </Text>
                            <Text size="sm" c="dimmed" ta="center">
                                {invoiceItems.length} mặt hàng
                            </Text>
                        </Card>
                    </Paper>
                )}
            </div>

            {/* Invoices List */}
            <InvoicesList
                invoices={invoices}
                onView={handleViewInvoice}
                onPrint={(invoice) => {
                    console.log('🖨️ Print from list:', invoice);
                    handlePrintInvoice(invoice);
                }}
                isLoading={isLoadingInvoices}
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                onRefresh={loadInvoices}
            />

            {/* Create Invoice Modal */}
            <Modal
                opened={isInvoiceModalOpen}
                onClose={handleCloseInvoiceModal}
                title="🧾 Tạo Hóa Đơn Mới"
                centered
                size="xl"
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
                <div style={{ marginBottom: '1rem' }}>
                    <Text size="md" fw={500} mb="xs">👤 Chọn khách hàng</Text>
                    <Autocomplete
                        placeholder="Nhập hoặc chọn khách hàng..."
                        data={customers.map(c => `${c.name} (${c.email})`)}
                        value={selectedCustomerInput ?? ''}
                        onChange={setSelectedCustomerInput}
                        size="md"
                        clearable
                        comboboxProps={{
                            zIndex: 12000,
                            withinPortal: true,
                        }}
                    />
                </div>
                <Divider my="md" />
                <InvoiceItemForm
                    onSave={handleCreateInvoice}
                    onCancel={handleCloseInvoiceModal}
                    allBooks={allBooks}
                    invoiceItems={invoiceItems}
                    setInvoiceItems={setInvoiceItems}
                    isSubmitting={isSubmitting}
                    rentalDays={rentalDays}           // thêm dòng này
                    setRentalDays={setRentalDays}
                />
            </Modal>

            {/* View Invoice Modal */}
            <Modal
                opened={isViewModalOpen}
                onClose={closeViewModal}
                size="xl"
                title={
                    <Group gap="md">
                        <IconFileInvoice size="1.5rem" color="#4A90E2" />
                        <Text size="xl" fw={700} c="#4A90E2">Chi Tiết Hóa Đơn</Text>
                    </Group>
                }
                centered
                zIndex={9999}
                overlayProps={{
                    backgroundOpacity: 0.8,
                    blur: 2,
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
                        maxHeight: '95vh',
                        overflow: 'hidden',
                        borderRadius: '16px',
                        boxShadow: '0 20px 40px rgba(74, 144, 226, 0.15)'
                    },
                    header: {
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        borderBottom: 'none',
                        padding: '1.5rem 2rem',
                        borderRadius: '16px 16px 0 0'
                    },
                    body: {
                        padding: 0,
                        maxHeight: 'calc(95vh - 80px)',
                        overflow: 'auto'
                    },
                    overlay: {
                        zIndex: 9998,
                        background: 'rgba(74, 144, 226, 0.15) !important'
                    }
                }}
                portalProps={{
                    target: document.body
                }}
            >
                {selectedInvoice && (
                    <div style={{
                        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                        minHeight: '100%',
                        padding: '2rem'
                    }}>
                        <Paper
                            withBorder
                            radius="xl"
                            shadow="xl"
                            style={{
                                maxWidth: 1000,
                                margin: '0 auto',
                                background: 'white',
                                border: 'none',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Header với gradient đẹp */}
                            <div style={{
                                background: `linear-gradient(135deg, ${selectedInvoice.type === 'sale' ? '#667eea 0%, #764ba2 100%' : '#11998e 0%, #38ef7d 100%'})`,
                                padding: '2rem',
                                color: 'white',
                                textAlign: 'center',
                                position: 'relative'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1.5rem'
                                }}>
                                    <Badge
                                        size="xl"
                                        variant="white"
                                        color={selectedInvoice.type === 'sale' ? 'blue' : 'green'}
                                        style={{
                                            fontSize: '16px',
                                            padding: '0.5rem 1rem'
                                        }}
                                    >
                                        {selectedInvoice.type === 'sale' ? '🛒 MUA' : '📅 THUÊ'}
                                    </Badge>
                                </div>

                                <Text size="2.5rem" fw={700} mb="xs" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                                    📚 BOOKSTORE
                                </Text>
                                <Text size="lg" opacity={0.9} mb="lg">
                                    Hệ thống quản lý sách chuyên nghiệp
                                </Text>
                                <Title order={1} size="2rem" fw={700} style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                                    HÓA ĐƠN {selectedInvoice.type === 'sale' ? 'BÁN SÁCH' : 'THUÊ SÁCH'}
                                </Title>
                            </div>

                            {/* Thông tin hóa đơn */}
                            <div style={{ padding: '2rem' }}>
                                <SimpleGrid cols={2} spacing="xl" mb="xl">
                                    <Card withBorder radius="lg" p="xl" style={{
                                        maxWidth: 1000,
                                        margin: '0 auto',
                                        background: 'rgba(255,255,255,0.85)', // Nền trắng mờ
                                        border: 'none',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                        overflow: 'hidden'
                                    }}>
                                        <Group mb="md">
                                            <IconFileInvoice size="1.5rem" color="#4A90E2" />
                                            <Text size="lg" fw={700} c="#4A90E2">Thông tin hóa đơn</Text>
                                        </Group>
                                        <Stack gap="sm">
                                            <Group justify="space-between">
                                                <Text size="sm" c="dimmed">Mã hóa đơn:</Text>
                                                <Text size="sm" fw={600}>#{selectedInvoice._id}</Text>
                                            </Group>
                                            <Group justify="space-between">
                                                <Text size="sm" c="dimmed">Ngày lập:</Text>
                                                <Text size="sm" fw={600}>{new Date(selectedInvoice.createdAt).toLocaleDateString('vi-VN')}</Text>
                                            </Group>
                                            <Group justify="space-between">
                                                <Text size="sm" c="dimmed">Loại giao dịch:</Text>
                                                <Badge color={selectedInvoice.type === 'sale' ? 'blue' : 'green'}>
                                                    {selectedInvoice.type === 'sale' ? 'Mua sách' : 'Thuê sách'}
                                                </Badge>
                                            </Group>
                                        </Stack>
                                    </Card>

                                    <Card withBorder radius="lg" p="xl" style={{ background: '#f0fff4', border: '2px solid #c6f6d5' }}>
                                        <Group mb="md">
                                            <IconUser size="1.5rem" color="#38A169" />
                                            <Text size="lg" fw={700} c="#38A169">Thông tin khách hàng</Text>
                                        </Group>
                                        <Stack gap="sm">
                                            <Group justify="space-between">
                                                <Text size="sm" c="dimmed">Tên khách hàng:</Text>
                                                <Text size="sm" fw={600}>{selectedInvoice.customer?.name || 'N/A'}</Text>
                                            </Group>
                                            <Group justify="space-between">
                                                <Text size="sm" c="dimmed">Email:</Text>
                                                <Text size="sm" fw={600}>{selectedInvoice.customer?.email || 'N/A'}</Text>
                                            </Group>
                                            {selectedInvoice.type === 'rent' && (
                                                <>
                                                    <Group justify="space-between">
                                                        <Text size="sm" c="dimmed">Ngày thuê:</Text>
                                                        <Text size="sm" fw={600}>
                                                            {selectedInvoice.startDate ? new Date(selectedInvoice.startDate).toLocaleDateString('vi-VN') : '-'}
                                                        </Text>
                                                    </Group>
                                                    <Group justify="space-between">
                                                        <Text size="sm" c="dimmed">Ngày trả:</Text>
                                                        <Text size="sm" fw={600}>
                                                            {selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString('vi-VN') : '-'}
                                                        </Text>
                                                    </Group>
                                                </>
                                            )}
                                        </Stack>
                                    </Card>
                                </SimpleGrid>

                                {/* Bảng chi tiết */}
                                <Card withBorder radius="lg" mb="xl" style={{ overflow: 'hidden' }}>
                                    <div style={{
                                        background: 'linear-gradient(90deg, #4A90E2 0%, #357ABD 100%)',
                                        padding: '1rem 1.5rem',
                                        color: 'white'
                                    }}>
                                        <Group>
                                            <IconBook size="1.2rem" />
                                            <Text size="lg" fw={700}>Chi tiết sản phẩm</Text>
                                        </Group>
                                    </div>

                                    <Table
                                        highlightOnHover
                                        style={{ fontSize: '14px' }}
                                        striped
                                    >
                                        <Table.Thead style={{ background: '#f8f9fa' }}>
                                            <Table.Tr>
                                                <Table.Th style={{ textAlign: 'center', width: '60px' }}>STT</Table.Th>
                                                <Table.Th style={{ width: '20%' }}>Tên sách</Table.Th>
                                                <Table.Th style={{ width: '30%' }}>Thể loại</Table.Th>
                                                <Table.Th style={{ textAlign: 'center', width: '10%' }}>SL</Table.Th>
                                                {selectedInvoice.type === 'sale' ? (
                                                    <>
                                                        <Table.Th style={{ textAlign: 'right', width: '15%' }}>Đơn giá</Table.Th>
                                                        <Table.Th style={{ textAlign: 'right', width: '20%' }}>Thành tiền</Table.Th>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Table.Th style={{ width: '17.5%' }}>Ngày thuê</Table.Th>
                                                        <Table.Th style={{ width: '17.5%' }}>Ngày trả</Table.Th>
                                                    </>
                                                )}
                                            </Table.Tr>
                                        </Table.Thead>
                                        <Table.Tbody>
                                            {(selectedInvoice.items || []).map((item, idx) => (
                                                <Table.Tr key={item._id || idx}>
                                                    <Table.Td style={{ textAlign: 'center', fontWeight: 600 }}>{idx + 1}</Table.Td>
                                                    <Table.Td style={{ fontWeight: 500 }}>{item.book?.title || item.title || '-'}</Table.Td>
                                                    <Table.Td>
                                                        <Badge variant="light" size="sm">
                                                            {item.book?.category?.name
                                                                || item.category?.name
                                                                || item.book?.category
                                                                || item.category
                                                                || '-'}
                                                        </Badge>
                                                    </Table.Td>
                                                    <Table.Td style={{ textAlign: 'center', fontWeight: 600 }}>{item.quantity || 1}</Table.Td>
                                                    {selectedInvoice.type === 'sale' ? (
                                                        <>
                                                            <Table.Td style={{ textAlign: 'right', fontWeight: 500, color: '#4A90E2' }}>
                                                                {item.unitPrice != null
                                                                    ? item.unitPrice.toLocaleString('vi-VN') + ' ₫'
                                                                    : '-'}
                                                            </Table.Td>
                                                            <Table.Td style={{ textAlign: 'right', fontWeight: 600, color: '#E74C3C' }}>
                                                                {(item.unitPrice && item.quantity)
                                                                    ? (item.unitPrice * item.quantity).toLocaleString('vi-VN') + ' ₫'
                                                                    : '-'}
                                                            </Table.Td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Table.Td>
                                                                {selectedInvoice.startDate
                                                                    ? new Date(selectedInvoice.startDate).toLocaleDateString('vi-VN')
                                                                    : '-'}
                                                            </Table.Td>
                                                            <Table.Td>
                                                                {selectedInvoice.dueDate
                                                                    ? new Date(selectedInvoice.dueDate).toLocaleDateString('vi-VN')
                                                                    : '-'}
                                                            </Table.Td>
                                                        </>
                                                    )}
                                                </Table.Tr>
                                            ))}
                                        </Table.Tbody>
                                    </Table>
                                </Card>

                                {/* Tổng tiền */}
                                <Card
                                    withBorder
                                    radius="lg"
                                    p="xl"
                                    mb="xl"
                                    style={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        textAlign: 'center'
                                    }}
                                >
                                    <Group justify="center" mb="md">
                                        <IconShoppingCart size="2rem" />
                                        <div>
                                            <Text size="sm" opacity={0.9}>Tổng số mặt hàng</Text>
                                            <Text size="xl" fw={700}>{(selectedInvoice.items || []).length} sản phẩm</Text>
                                        </div>
                                    </Group>
                                    <Divider color="rgba(255,255,255,0.3)" mb="md" />
                                    <Text size="sm" opacity={0.9} mb="xs">TỔNG CỘNG</Text>
                                    <Text size="3rem" fw={700} style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                                        {selectedInvoice.totalAmount?.toLocaleString('vi-VN')} ₫
                                    </Text>
                                </Card>

                                {/* Nút thao tác */}
                                <Group justify="center" gap="lg">
                                    <Button
                                        leftSection={<IconPrinter size="1.2rem" />}
                                        onClick={() => handlePrintInvoice(selectedInvoice)}
                                        variant="gradient"
                                        gradient={{ from: 'blue', to: 'cyan' }}
                                        size="lg"
                                        radius="lg"
                                        style={{
                                            boxShadow: '0 4px 12px rgba(74, 144, 226, 0.3)',
                                            minWidth: '140px'
                                        }}
                                    >
                                        In hóa đơn
                                    </Button>
                                    <Button
                                        onClick={closeViewModal}
                                        variant="gradient"
                                        gradient={{ from: 'gray', to: 'dark' }}
                                        size="lg"
                                        radius="lg"
                                        style={{
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                                            minWidth: '100px'
                                        }}
                                    >
                                        Đóng
                                    </Button>
                                </Group>
                            </div>
                        </Paper>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default InvoicePage;