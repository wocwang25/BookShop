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
import { IconTrash, IconFileInvoice, IconCheck, IconX, IconPlus, IconShoppingCart, IconCalendar, IconUser, IconBook, IconRefresh } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { DatePickerInput } from '@mantine/dates';

// --- InvoiceItemForm Component ---
const InvoiceItemForm = ({ onSave, onCancel, allBooks = [], invoiceItems = [], setInvoiceItems, isSubmitting = false }) => {
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

        if (bookToAdd && !invoiceItems.find(item => item._id === bookToAdd._id && item.type === selectedType)) {
            const newItem = {
                ...bookToAdd,
                type: selectedType,
                quantity: selectedType === 'sale' ? 1 : 1,
                rentalDays: selectedType === 'rent' ? 7 : undefined,
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
    const totalRentals = rentalItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.rentalDays), 0);
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
            <Table.Td>
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
            </Table.Td>
            <Table.Td>
                <Text size="sm" fw={500} c="green">
                    {item.unitPrice?.toLocaleString('vi-VN')} ₫
                </Text>
            </Table.Td>
            <Table.Td>
                <Text size="sm" fw={500}>
                    {type === 'sale' 
                        ? (item.quantity * item.unitPrice).toLocaleString('vi-VN')
                        : (item.quantity * item.unitPrice * item.rentalDays).toLocaleString('vi-VN')
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
                                zIndex: 2000,
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
                                            <Table.Th>Số ngày thuê</Table.Th>
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
        <Paper withBorder p="md" radius="md">
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
    const [notification, setNotification] = useState({ show: false, message: '', color: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // States for invoice list
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
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
        if (!selectedCustomer || invoiceItems.length === 0) {
            showNotification("Vui lòng chọn khách hàng và thêm sản phẩm.", "orange");
            return;
        }

        setIsSubmitting(true);
        try {
            const salesItems = invoiceItems.filter(item => item.type === 'sale');
            const rentalItems = invoiceItems.filter(item => item.type === 'rent');

            if (salesItems.length > 0) {
                const salesData = {
                    customerId: selectedCustomer._id,
                    items: salesItems.map(item => ({
                        bookId: item._id,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice
                    }))
                };
                await API.invoice.createSalesInvoice(salesData);
            }

            if (rentalItems.length > 0) {
                const rentalData = {
                    customerId: selectedCustomer._id,
                    items: rentalItems.map(item => ({
                        bookId: item._id,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        rentalDays: item.rentalDays
                    }))
                };
                await API.invoice.createRentalInvoice(rentalData);
            }

            showNotification("Tạo hóa đơn thành công!", "teal");
            resetInvoiceState();
            closeInvoiceModal();
            await loadInvoices();
        } catch (error) {
            console.error('Error creating invoice:', error);
            showNotification(error.response?.data?.message || "Lỗi khi tạo hóa đơn.", "red");
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetInvoiceState = () => {
        setInvoiceItems([]);
        setSelectedCustomer(null);
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

    const totalAmount = invoiceItems.reduce((sum, item) => {
        if (item.type === 'sale') {
            return sum + (item.quantity * item.unitPrice);
        } else {
            return sum + (item.quantity * item.unitPrice * item.rentalDays);
        }
    }, 0);

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
            {/* Notifications */}
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
            >
                <div style={{ marginBottom: '1rem' }}>
                    <Text size="md" fw={500} mb="xs">👤 Chọn khách hàng</Text>
                    <Select
                        placeholder="Chọn khách hàng..."
                        data={customers.map(c => ({ value: c._id, label: `${c.name} (${c.email})` }))}
                        value={selectedCustomer?._id}
                        onChange={(value) => {
                            const customer = customers.find(c => c._id === value);
                            setSelectedCustomer(customer);
                        }}
                        searchable
                        size="md"
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
                />
            </Modal>

            {/* View Invoice Modal */}
            <Modal
                opened={isViewModalOpen}
                onClose={closeViewModal}
                size="xl"
                title="Chi Tiết Hóa Đơn"
                centered
            >
                {selectedInvoice && (
                    <div>
                        <Paper withBorder p="md" mb="md">
                            <Text size="sm" c="dimmed">Mã hóa đơn: #{selectedInvoice._id}</Text>
                            <Text size="sm" c="dimmed">Ngày tạo: {new Date(selectedInvoice.createdAt).toLocaleString('vi-VN')}</Text>
                            <Text size="sm" c="dimmed">Khách hàng: {selectedInvoice.customer?.name}</Text>
                            <Text size="sm" c="dimmed">Tổng tiền: {selectedInvoice.totalAmount?.toLocaleString('vi-VN')} ₫</Text>
                        </Paper>
                        <Button onClick={closeViewModal}>Đóng</Button>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default InvoicePage;