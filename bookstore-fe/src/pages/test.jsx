// src/pages/staff/PaymentPage.jsx
import React, { useState, useEffect } from 'react';
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
    Divider,
    Textarea
} from '@mantine/core';
import { IconTrash, IconFileInvoice, IconCheck, IconX, IconPlus, IconShoppingCart, IconCalendar, IconUser, IconBook, IconRefresh, IconPrinter, IconDownload, IconCash, IconReceipt } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';

// --- PaymentForm Component ---
const PaymentForm = ({ onSave, onCancel, customers = [], isSubmitting = false }) => {
    const form = useForm({
        initialValues: {
            customer_name: '',
            paymentAmount: 0,
            note: '',
            invoiceId: '',
            customer_info: {
                phone: '',
                address: ''
            }
        },
    });

    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerInvoices, setCustomerInvoices] = useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [loadingInvoices, setLoadingInvoices] = useState(false);

    const handleCustomerSelect = (value) => {
        const customer = customers.find(c => `${c.name} (${c.email})` === value);
        if (customer) {
            setSelectedCustomer(customer);
            form.setFieldValue('customer_name', customer.name);
            form.setFieldValue('paymentAmount', customer.debt || 0);
            form.setFieldValue('customer_info', {
                phone: customer.phone || '',
                address: customer.address || ''
            });
        } else {
            // Khách hàng mới
            setSelectedCustomer(null);
            form.setFieldValue('customer_name', value);
            form.setFieldValue('paymentAmount', 0);
            form.setFieldValue('customer_info', {
                phone: '',
                address: ''
            });
        }
    };

    // Load customer invoices
    const loadCustomerInvoices = async (customerId) => {
        try {
            setLoadingInvoices(true);

            // Get customer details with populated invoices
            const response = await API.customer.getCustomerById(customerId);
            const customer = response.data.customers || response.data;


            const allInvoices = [];

            // Add sales invoices
            if (customer.salesInvoices && customer.salesInvoices.length > 0) {
                customer.salesInvoices.forEach(invoice => {
                    allInvoices.push({
                        ...invoice,
                        type: 'sale',
                        displayName: `Hóa đơn bán #${invoice._id} - ${invoice.totalAmount?.toLocaleString('vi-VN')} ₫`
                    });
                });
            }

            // Add rental invoices
            if (customer.rentalInvoices && customer.rentalInvoices.length > 0) {
                customer.rentalInvoices.forEach(invoice => {
                    allInvoices.push({
                        ...invoice,
                        type: 'rent',
                        displayName: `Hóa đơn thuê #${invoice._id} - ${invoice.totalAmount?.toLocaleString('vi-VN')} ₫`
                    });
                });
            }

            setCustomerInvoices(allInvoices);
        } catch (error) {
            console.error('Error loading customer invoices:', error);
            // If API fails, show empty list
            setCustomerInvoices([]);
        } finally {
            setLoadingInvoices(false);
        }
    };

    const handleInvoiceSelect = (invoiceId) => {
        const invoice = customerInvoices.find(inv => inv._id === invoiceId);
        if (invoice) {
            setSelectedInvoice(invoice);
            form.setFieldValue('invoiceId', invoiceId);
            form.setFieldValue('paymentAmount', invoice.totalAmount || 0);
        } else {
            setSelectedInvoice(null);
            form.setFieldValue('invoiceId', '');
            form.setFieldValue('paymentAmount', selectedCustomer?.debt || 0);
        }
    };

    const handleSubmit = () => {
        const values = form.values;
        if (!values.customer_name || values.paymentAmount <= 0) {
            return;
        }
        console.log('💰 Payment data before submit:', values);
        onSave(values);
    };

    const resetForm = () => {
        form.reset();
        setSelectedCustomer(null);
        setCustomerInvoices([]);
        setSelectedInvoice(null);
    };

    return (
        <div style={{ padding: '1rem' }}>
            <SimpleGrid cols={1} spacing="lg">
                <div>
                    <Text size="md" fw={500} mb="xs">👤 Chọn hoặc nhập khách hàng</Text>
                    <Autocomplete
                        placeholder="Nhập hoặc chọn khách hàng..."
                        data={customers.map(c => `${c.name} (${c.email})`)}
                        value={selectedCustomer ? `${selectedCustomer.name} (${selectedCustomer.email})` : form.values.customer_name}
                        onChange={(value) => {
                            // Chỉ lưu tên, loại bỏ email nếu có
                            const nameOnly = value && value.includes('(') ? value.split('(')[0].trim() : value;
                            form.setFieldValue('customer_name', nameOnly || '');
                            // Nếu xóa hết thì reset selectedCustomer và form
                            if (!value) {
                                setSelectedCustomer(null);
                                setCustomerInvoices([]);
                                setSelectedInvoice(null);
                                form.setFieldValue('paymentAmount', 0);
                                form.setFieldValue('invoiceId', '');
                                form.setFieldValue('customer_info', {
                                    phone: '',
                                    address: ''
                                });
                            }
                        }}
                        onOptionSubmit={async (value) => {
                            const customer = customers.find(c => `${c.name} (${c.email})` === value);
                            if (customer) {
                                setSelectedCustomer(customer);
                                form.setFieldValue('customer_name', customer.name); // Chỉ lưu tên, không có email
                                form.setFieldValue('paymentAmount', customer.debt || 0);
                                form.setFieldValue('customer_info', {
                                    phone: customer.phone || '',
                                    address: customer.address || ''
                                });

                                // Load invoices for this customer
                                await loadCustomerInvoices(customer._id);
                            } else {
                                // Khách hàng mới - chỉ lấy tên nếu có định dạng "Tên (email)"
                                setSelectedCustomer(null);
                                setCustomerInvoices([]);
                                setSelectedInvoice(null);
                                const nameOnly = value.includes('(') ? value.split('(')[0].trim() : value;
                                form.setFieldValue('customer_name', nameOnly);
                                form.setFieldValue('paymentAmount', 0);
                                form.setFieldValue('invoiceId', '');
                                form.setFieldValue('customer_info', {
                                    phone: '',
                                    address: ''
                                });
                            }
                        }}
                        size="md"
                        clearable
                        comboboxProps={{
                            zIndex: 12000,
                            withinPortal: true,
                        }}
                    />
                </div>

                {selectedCustomer && (
                    <Card withBorder p="md" style={{ background: '#f0fff4', border: '2px solid #c6f6d5' }}>
                        <Group>
                            <IconUser size="1.5rem" color="#38A169" />
                            <div>
                                <Text size="sm" c="dimmed">Thông tin khách hàng:</Text>
                                <Text size="lg" fw={600}>{selectedCustomer.name}</Text>
                                <Text size="sm" c="dimmed">{selectedCustomer.email}</Text>
                                <Text size="sm" fw={500} c="red">
                                    Nợ hiện tại: {(selectedCustomer.debt || 0).toLocaleString('vi-VN')} ₫
                                </Text>
                            </div>
                        </Group>
                    </Card>
                )}

                {selectedCustomer && (
                    <div>
                        <Text size="md" fw={500} mb="xs">📄 Chọn hóa đơn cần thanh toán (tùy chọn)</Text>
                        {loadingInvoices ? (
                            <Group>
                                <Loader size="sm" />
                                <Text size="sm" c="dimmed">Đang tải danh sách hóa đơn...</Text>
                            </Group>
                        ) : customerInvoices.length > 0 ? (
                            <Select
                                placeholder="Chọn hóa đơn hoặc để trống để thu toàn bộ nợ"
                                data={[
                                    { value: '', label: 'Thu toàn bộ nợ của khách hàng' },
                                    ...customerInvoices.map(invoice => ({
                                        value: invoice._id,
                                        label: invoice.displayName
                                    }))
                                ]}
                                value={form.values.invoiceId}
                                onChange={handleInvoiceSelect}
                                size="md"
                                clearable
                            />
                        ) : (
                            <Alert color="yellow" title="Không có hóa đơn">
                                Khách hàng này chưa có hóa đơn nào cần thanh toán
                            </Alert>
                        )}
                    </div>
                )}

                {selectedInvoice && (
                    <Card withBorder p="md" style={{ background: '#fff9e6', border: '2px solid #ffd43b' }}>
                        <Group>
                            <IconFileInvoice size="1.5rem" color="#fd7e14" />
                            <div>
                                <Text size="sm" c="dimmed">Thông tin hóa đơn được chọn:</Text>
                                <Text size="lg" fw={600}>
                                    {selectedInvoice.type === 'sale' ? 'Hóa đơn bán' : 'Hóa đơn thuê'} #{selectedInvoice._id}
                                </Text>
                                <Text size="sm" c="dimmed">
                                    Ngày tạo: {new Date(selectedInvoice.createdAt).toLocaleDateString('vi-VN')}
                                </Text>
                                <Text size="sm" fw={500} c="orange">
                                    Tổng tiền: {(selectedInvoice.totalAmount || 0).toLocaleString('vi-VN')} ₫
                                </Text>
                            </div>
                        </Group>
                    </Card>
                )}

                <NumberInput
                    label="💰 Số tiền thu"
                    placeholder="Nhập số tiền..."
                    value={form.values.paymentAmount}
                    onChange={(val) => form.setFieldValue('paymentAmount', val)}
                    min={0}
                    step={10000}
                    thousandSeparator=","
                    suffix=" ₫"
                    size="md"
                    required
                />

                <SimpleGrid cols={2} spacing="md">
                    <div>
                        <Text size="sm" fw={500} mb="xs">📞 Số điện thoại</Text>
                        <input
                            type="text"
                            placeholder="Số điện thoại..."
                            value={form.values.customer_info.phone}
                            onChange={(e) => form.setFieldValue('customer_info.phone', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                        />
                    </div>
                    <div>
                        <Text size="sm" fw={500} mb="xs">🏠 Địa chỉ</Text>
                        <input
                            type="text"
                            placeholder="Địa chỉ..."
                            value={form.values.customer_info.address}
                            onChange={(e) => form.setFieldValue('customer_info.address', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                        />
                    </div>
                </SimpleGrid>

                <Textarea
                    label="📝 Ghi chú"
                    placeholder="Ghi chú thêm (tùy chọn)..."
                    value={form.values.note}
                    onChange={(e) => form.setFieldValue('note', e.target.value)}
                    rows={3}
                    size="md"
                />

                {form.values.paymentAmount > 0 && (
                    <Card withBorder p="xl" style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        textAlign: 'center'
                    }}>
                        <Group justify="center" mb="md">
                            <IconCash size="2rem" />
                            <div>
                                <Text size="sm" opacity={0.9}>Số tiền thu</Text>
                                <Text size="3rem" fw={700} style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                                    {form.values.paymentAmount.toLocaleString('vi-VN')} ₫
                                </Text>
                            </div>
                        </Group>
                        {selectedCustomer && selectedCustomer.debt > 0 && (
                            <div>
                                <Divider color="rgba(255,255,255,0.3)" mb="md" />
                                <Text size="sm" opacity={0.9}>Nợ còn lại sau thu</Text>
                                <Text size="xl" fw={600}>
                                    {Math.max(0, selectedCustomer.debt - form.values.paymentAmount).toLocaleString('vi-VN')} ₫
                                </Text>
                            </div>
                        )}
                    </Card>
                )}
            </SimpleGrid>

            <Group justify="flex-end" mt="xl" gap="md">
                <Button
                    variant="default"
                    onClick={() => {
                        resetForm();
                        onCancel();
                    }}
                    size="md"
                    radius="md"
                    disabled={isSubmitting}
                >
                    Hủy
                </Button>
                <Button
                    leftSection={<IconCash size="1rem" />}
                    onClick={handleSubmit}
                    disabled={!form.values.customer_name || form.values.paymentAmount <= 0}
                    loading={isSubmitting}
                    variant="gradient"
                    gradient={{ from: 'green', to: 'teal' }}
                    size="md"
                    radius="md"
                >
                    💰 Tạo Phiếu Thu
                </Button>
            </Group>
        </div>
    );
};

// --- PaymentList Component ---
const PaymentList = ({ receipts, onView, onPrint, isLoading, selectedMonth, setSelectedMonth, selectedYear, setSelectedYear, onRefresh }) => {
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
            background: 'rgba(255,255,255,0.85)'
        }}>
            <Group justify="space-between" mb="md">
                <Title order={3}>💰 Danh Sách Phiếu Thu</Title>
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
            ) : receipts.length > 0 ? (
                <>
                    <Card withBorder mb="md">
                        <SimpleGrid cols={2}>
                            <div>
                                <Text size="sm" c="dimmed">Tổng số phiếu thu</Text>
                                <Text size="xl" fw={700}>{receipts.length}</Text>
                            </div>
                            <div>
                                <Text size="sm" c="dimmed">Tổng tiền đã thu</Text>
                                <Text size="xl" fw={700} c="green">
                                    {receipts.reduce((sum, receipt) => sum + (receipt.paymentAmount || 0), 0).toLocaleString('vi-VN')} ₫
                                </Text>
                            </div>
                        </SimpleGrid>
                    </Card>

                    <Table striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Ngày</Table.Th>
                                <Table.Th>Mã phiếu</Table.Th>
                                <Table.Th>Khách hàng</Table.Th>
                                <Table.Th>Hóa đơn</Table.Th>
                                <Table.Th>Số tiền</Table.Th>
                                <Table.Th>Ghi chú</Table.Th>
                                <Table.Th>Thao tác</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {receipts.map((receipt) => (
                                <Table.Tr key={receipt._id}>
                                    <Table.Td>{new Date(receipt.createdAt).toLocaleDateString('vi-VN')}</Table.Td>
                                    <Table.Td>#{receipt._id}</Table.Td>
                                    <Table.Td>{receipt.customer?.name || 'N/A'}</Table.Td>
                                    <Table.Td>
                                        {receipt.invoice ? (
                                            <div>
                                                <Badge
                                                    color={receipt.invoice.type === 'sale' ? 'blue' : 'green'}
                                                    size="sm"
                                                    mb="xs"
                                                >
                                                    {receipt.invoice.type === 'sale' ? 'Bán' : 'Thuê'}
                                                </Badge>
                                                <Text size="xs" c="dimmed">
                                                    #{receipt.invoice._id.slice(-6)}
                                                </Text>
                                            </div>
                                        ) : (
                                            <Text size="sm" c="dimmed">Thu tổng nợ</Text>
                                        )}
                                    </Table.Td>
                                    <Table.Td>
                                        <Text fw={600} c="green">
                                            {receipt.paymentAmount?.toLocaleString('vi-VN')} ₫
                                        </Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="sm" c="dimmed">
                                            {receipt.note || '-'}
                                        </Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Group gap="xs">
                                            <ActionIcon
                                                variant="light"
                                                color="blue"
                                                onClick={() => onView(receipt)}
                                                title="Xem chi tiết"
                                            >
                                                <IconReceipt size="1rem" />
                                            </ActionIcon>
                                            <ActionIcon
                                                variant="light"
                                                color="green"
                                                onClick={() => onPrint(receipt)}
                                                title="In phiếu thu"
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
                    Không tìm thấy phiếu thu nào trong tháng {selectedMonth}/{selectedYear}
                </Alert>
            )}
        </Paper>
    );
};

const PaymentPage = () => {
    const [customers, setCustomers] = useState([]);
    const [receipts, setReceipts] = useState([]);
    const [notification, setNotification] = useState({ show: false, message: '', color: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // States for receipt list
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [isLoadingReceipts, setIsLoadingReceipts] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [isViewModalOpen, { open: openViewModal, close: closeViewModal }] = useDisclosure(false);

    // Modal states
    const [isPaymentModalOpen, { open: openPaymentModal, close: closePaymentModal }] = useDisclosure(false);

    // Load data on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                // Load customers
                try {
                    const customersResponse = await API.customer.getAllCustomers();
                    setCustomers(customersResponse.data.customers || customersResponse.data);
                } catch (customerError) {
                    console.warn('Customer API not available, using mock data:', customerError);
                    setCustomers([
                        { _id: '1', name: 'Nguyễn Văn A', email: 'a@email.com', debt: 150000 },
                        { _id: '2', name: 'Trần Thị B', email: 'b@email.com', debt: 200000 },
                        { _id: '3', name: 'Lê Văn C', email: 'c@email.com', debt: 100000 }
                    ]);
                }
            } catch (error) {
                console.error('Error loading data:', error);
                showNotification('Không thể tải dữ liệu.', 'red');
            }
        };
        loadData();
    }, []);

    // Load receipts when month/year changes
    useEffect(() => {
        loadReceipts();
    }, [selectedMonth, selectedYear]);

    const loadReceipts = async () => {
        try {
            setIsLoadingReceipts(true);

            console.log('mongth year', selectedMonth, selectedYear)

            // Call API to get payment receipts by month/year
            const response = await API.payment.getAllPaymentReceipt({
                month: selectedMonth,
                year: selectedYear
            });

            setReceipts(response.data.receipts || []);
            console.log(response.data.receipts)
        } catch (error) {
            console.error('Error loading receipts:', error);

            // Use mock data as fallback
            const mockReceipts = [
                {
                    _id: 'receipt001',
                    customer: { name: 'Nguyễn Văn A' },
                    paymentAmount: 150000,
                    note: 'Thu nợ sách tháng trước',
                    createdAt: new Date(),
                    user: { name: 'Admin' }
                },
                {
                    _id: 'receipt002',
                    customer: { name: 'Trần Thị B' },
                    paymentAmount: 75000,
                    note: 'Thu một phần nợ',
                    createdAt: new Date(),
                    user: { name: 'Admin' }
                }
            ];
            setReceipts(mockReceipts);
            showNotification('Không thể tải danh sách phiếu thu, hiển thị dữ liệu mẫu', 'yellow');
        } finally {
            setIsLoadingReceipts(false);
        }
    };

    const showNotification = (message, color) => {
        setNotification({ show: true, message, color });
        setTimeout(() => setNotification({ show: false, message: '', color: '' }), 4000);
    };

    const handleCreatePayment = async (paymentData) => {
        setIsSubmitting(true);
        try {
            console.log(paymentData)
            await API.payment.createPaymentReceipt(paymentData);
            showNotification("Tạo phiếu thu thành công!", "teal");
            closePaymentModal();
            await loadReceipts();

            // Reload customers to update debt info
            const customersResponse = await API.customer.getAllCustomers();
            setCustomers(customersResponse.data.customers || customersResponse.data);
        } catch (error) {
            console.error('Error creating payment:', error);
            showNotification(error.response?.data?.error || "Lỗi khi tạo phiếu thu.", "red");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleViewReceipt = (receipt) => {
        setSelectedReceipt(receipt);
        openViewModal();
    };

    const handlePrintReceipt = (receipt) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            showNotification('Không thể mở cửa sổ in. Vui lòng cho phép popup.', 'red');
            return;
        }

        const printContent = `
            <html>
                <head>
                    <title>Phiếu Thu #${receipt._id}</title>
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
                        .receipt-title {
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
                        .amount { 
                            text-align: center; 
                            font-weight: bold; 
                            background: #E8F4FD;
                            padding: 30px;
                            border-radius: 8px;
                            border-left: 5px solid #4A90E2;
                            margin: 30px 0;
                        }
                        .amount-value {
                            font-size: 36px;
                            color: #E74C3C;
                            margin: 20px 0;
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
                        <div class="receipt-title">
                            PHIẾU THU TIỀN
                        </div>
                    </div>
                    
                    <div class="info">
                        <div class="info-section">
                            <h3>📋 Thông tin phiếu thu</h3>
                            <p><strong>Mã phiếu:</strong> #${receipt._id}</p>
                            <p><strong>Ngày lập:</strong> ${new Date(receipt.createdAt).toLocaleDateString('vi-VN')}</p>
                            <p><strong>Thời gian:</strong> ${new Date(receipt.createdAt).toLocaleTimeString('vi-VN')}</p>
                            <p><strong>Nhân viên lập:</strong> ${receipt.user?.name || 'Admin'}</p>
                            <p><strong>Loại thu tiền:</strong> ${receipt.invoice ? 'Thu theo hóa đơn' : 'Thu tổng nợ'}</p>
                        </div>
                        <div class="info-section">
                            <h3>👤 Thông tin khách hàng</h3>
                            <p><strong>Tên khách hàng:</strong> ${receipt.customer?.name || 'N/A'}</p>
                            <p><strong>Email:</strong> ${receipt.customer?.email || 'N/A'}</p>
                            <p><strong>Điện thoại:</strong> ${receipt.customer?.phone || 'N/A'}</p>
                            <p><strong>Địa chỉ:</strong> ${receipt.customer?.address || 'N/A'}</p>
                        </div>
                        ${receipt.invoice ? `
                        <div class="info-section">
                            <h3>📄 Thông tin hóa đơn</h3>
                            <p><strong>Mã hóa đơn:</strong> #${receipt.invoice._id}</p>
                            <p><strong>Loại hóa đơn:</strong> ${receipt.invoice.type === 'sale' ? 'Hóa đơn bán' : 'Hóa đơn thuê'}</p>
                            <p><strong>Ngày tạo HĐ:</strong> ${new Date(receipt.invoice.createdAt).toLocaleDateString('vi-VN')}</p>
                            <p><strong>Tổng tiền HĐ:</strong> ${(receipt.invoice.totalAmount || 0).toLocaleString('vi-VN')} ₫</p>
                            ${receipt.invoice.type === 'rent' ? `
                            <p><strong>Ngày thuê:</strong> ${receipt.invoice.startDate ? new Date(receipt.invoice.startDate).toLocaleDateString('vi-VN') : 'N/A'}</p>
                            <p><strong>Ngày trả:</strong> ${receipt.invoice.dueDate ? new Date(receipt.invoice.dueDate).toLocaleDateString('vi-VN') : 'N/A'}</p>
                            ` : ''}
                        </div>
                        ` : ''}
                    </div>

                    <div class="amount">
                        <p style="font-size: 18px; margin-bottom: 10px;">SỐ TIỀN ĐÃ THU</p>
                        <div class="amount-value">
                            ${(receipt.paymentAmount || 0).toLocaleString('vi-VN')} ₫
                        </div>
                        <p style="font-size: 14px; color: #666; margin-top: 10px;">
                            Bằng chữ: ${numberToWords(receipt.paymentAmount || 0)} đồng
                        </p>
                    </div>

                    ${receipt.note ? `
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h4 style="color: #4A90E2; margin-bottom: 10px;">📝 Ghi chú:</h4>
                        <p>${receipt.note}</p>
                    </div>
                    ` : ''}

                    <div class="footer">
                        <p><em>Cảm ơn quý khách đã thanh toán!</em></p>
                        <p style="margin-top: 10px; font-size: 12px;">In lúc: ${new Date().toLocaleString('vi-VN')}</p>
                    </div>

                    <div class="no-print" style="margin-top: 20px; text-align: center;">
                        <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; background: #4A90E2; color: white; border: none; border-radius: 5px; cursor: pointer;">In Phiếu Thu</button>
                    </div>
                </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        showNotification('Đã mở cửa sổ in phiếu thu', 'green');
    };

    // Helper function to convert number to words (simplified)
    const numberToWords = (amount) => {
        // This is a simplified version - you might want to use a proper library
        if (amount < 1000) return `${amount}`;
        if (amount < 1000000) return `${Math.floor(amount / 1000)} nghìn ${amount % 1000 > 0 ? (amount % 1000) : ''}`;
        return `${Math.floor(amount / 1000000)} triệu ${amount % 1000000 > 0 ? Math.floor((amount % 1000000) / 1000) + ' nghìn' : ''}`;
    };

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
                        💰 Quản Lý Phiếu Thu Tiền
                    </Title>
                    <Text size="lg" c="dimmed" mb="xl">
                        Lập phiếu thu tiền và quản lý công nợ khách hàng
                    </Text>
                    <Group justify="center" wrap="wrap">
                        <Button
                            leftSection={<IconPlus size="1rem" />}
                            onClick={openPaymentModal}
                            gradient={{ from: 'green', to: 'teal' }}
                            variant="gradient"
                            size="lg"
                            radius="md"
                        >
                            Tạo Phiếu Thu Mới
                        </Button>
                    </Group>
                </div>
            </div>

            {/* Payment Receipts List */}
            <PaymentList
                receipts={receipts}
                onView={handleViewReceipt}
                onPrint={handlePrintReceipt}
                isLoading={isLoadingReceipts}
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                onRefresh={loadReceipts}
            />

            {/* Create Payment Modal */}
            <Modal
                opened={isPaymentModalOpen}
                onClose={closePaymentModal}
                title="💰 Tạo Phiếu Thu Mới"
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
                <PaymentForm
                    onSave={handleCreatePayment}
                    onCancel={closePaymentModal}
                    customers={customers}
                    isSubmitting={isSubmitting}
                />
            </Modal>

            {/* View Receipt Modal */}
            <Modal
                opened={isViewModalOpen}
                onClose={closeViewModal}
                size="lg"
                title="Chi Tiết Phiếu Thu"
                centered
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
                {selectedReceipt && (
                    <Paper withBorder p="xl" radius="lg">
                        <Group justify="space-between" mb="xl">
                            <Title order={3}>Phiếu Thu #{selectedReceipt._id}</Title>
                            <Button
                                leftSection={<IconPrinter size="1rem" />}
                                onClick={() => handlePrintReceipt(selectedReceipt)}
                                variant="light"
                                color="green"
                            >
                                In Phiếu
                            </Button>
                        </Group>

                        <SimpleGrid cols={selectedReceipt.invoice ? 3 : 2} spacing="xl" mb="xl">
                            <Card withBorder p="lg" style={{ background: '#f8f9ff' }}>
                                <Group mb="md">
                                    <IconReceipt size="1.5rem" color="#4A90E2" />
                                    <Text size="lg" fw={700} c="#4A90E2">Thông tin phiếu thu</Text>
                                </Group>
                                <Stack gap="sm">
                                    <Group justify="space-between">
                                        <Text size="sm" c="dimmed">Mã phiếu:</Text>
                                        <Text size="sm" fw={600}>#{selectedReceipt._id}</Text>
                                    </Group>
                                    <Group justify="space-between">
                                        <Text size="sm" c="dimmed">Ngày lập:</Text>
                                        <Text size="sm" fw={600}>
                                            {new Date(selectedReceipt.createdAt).toLocaleString('vi-VN')}
                                        </Text>
                                    </Group>
                                    <Group justify="space-between">
                                        <Text size="sm" c="dimmed">Nhân viên lập:</Text>
                                        <Text size="sm" fw={600}>{selectedReceipt.user?.name || 'Admin'}</Text>
                                    </Group>
                                    <Group justify="space-between">
                                        <Text size="sm" c="dimmed">Loại thu tiền:</Text>
                                        <Text size="sm" fw={600}>
                                            {selectedReceipt.invoice ? 'Thu theo hóa đơn' : 'Thu tổng nợ'}
                                        </Text>
                                    </Group>
                                </Stack>
                            </Card>

                            <Card withBorder p="lg" style={{ background: '#f0fff4' }}>
                                <Group mb="md">
                                    <IconUser size="1.5rem" color="#38A169" />
                                    <Text size="lg" fw={700} c="#38A169">Thông tin khách hàng</Text>
                                </Group>
                                <Stack gap="sm">
                                    <Group justify="space-between">
                                        <Text size="sm" c="dimmed">Tên:</Text>
                                        <Text size="sm" fw={600}>{selectedReceipt.customer?.name || 'N/A'}</Text>
                                    </Group>
                                    <Group justify="space-between">
                                        <Text size="sm" c="dimmed">Email:</Text>
                                        <Text size="sm" fw={600}>{selectedReceipt.customer?.email || 'N/A'}</Text>
                                    </Group>
                                    <Group justify="space-between">
                                        <Text size="sm" c="dimmed">Số điện thoại:</Text>
                                        <Text size="sm" fw={600}>{selectedReceipt.customer?.phone || 'N/A'}</Text>
                                    </Group>
                                    <Group justify="space-between">
                                        <Text size="sm" c="dimmed">Địa chỉ:</Text>
                                        <Text size="sm" fw={600}>{selectedReceipt.customer?.address || 'N/A'}</Text>
                                    </Group>
                                </Stack>
                            </Card>

                            {selectedReceipt.invoice && (
                                <Card withBorder p="lg" style={{ background: '#fff9e6' }}>
                                    <Group mb="md">
                                        <IconFileInvoice size="1.5rem" color="#fd7e14" />
                                        <Text size="lg" fw={700} c="#fd7e14">Thông tin hóa đơn</Text>
                                    </Group>
                                    <Stack gap="sm">
                                        <Group justify="space-between">
                                            <Text size="sm" c="dimmed">Mã hóa đơn:</Text>
                                            <Text size="sm" fw={600}>#{selectedReceipt.invoice._id}</Text>
                                        </Group>
                                        <Group justify="space-between">
                                            <Text size="sm" c="dimmed">Loại hóa đơn:</Text>
                                            <Badge color={selectedReceipt.invoice.type === 'sale' ? 'blue' : 'green'}>
                                                {selectedReceipt.invoice.type === 'sale' ? 'Hóa đơn bán' : 'Hóa đơn thuê'}
                                            </Badge>
                                        </Group>
                                        <Group justify="space-between">
                                            <Text size="sm" c="dimmed">Ngày tạo:</Text>
                                            <Text size="sm" fw={600}>
                                                {new Date(selectedReceipt.invoice.createdAt).toLocaleDateString('vi-VN')}
                                            </Text>
                                        </Group>
                                        <Group justify="space-between">
                                            <Text size="sm" c="dimmed">Tổng tiền HĐ:</Text>
                                            <Text size="sm" fw={600} c="orange">
                                                {(selectedReceipt.invoice.totalAmount || 0).toLocaleString('vi-VN')} ₫
                                            </Text>
                                        </Group>
                                        {selectedReceipt.invoice.type === 'rent' && (
                                            <>
                                                <Group justify="space-between">
                                                    <Text size="sm" c="dimmed">Ngày thuê:</Text>
                                                    <Text size="sm" fw={600}>
                                                        {selectedReceipt.invoice.startDate ?
                                                            new Date(selectedReceipt.invoice.startDate).toLocaleDateString('vi-VN') :
                                                            'N/A'
                                                        }
                                                    </Text>
                                                </Group>
                                                <Group justify="space-between">
                                                    <Text size="sm" c="dimmed">Ngày trả:</Text>
                                                    <Text size="sm" fw={600}>
                                                        {selectedReceipt.invoice.dueDate ?
                                                            new Date(selectedReceipt.invoice.dueDate).toLocaleDateString('vi-VN') :
                                                            'N/A'
                                                        }
                                                    </Text>
                                                </Group>
                                            </>
                                        )}
                                    </Stack>
                                </Card>
                            )}
                        </SimpleGrid>

                        <Card withBorder p="xl" mb="xl" style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            textAlign: 'center'
                        }}>
                            <Text size="lg" opacity={0.9} mb="xs">SỐ TIỀN ĐÃ THU</Text>
                            <Text size="3rem" fw={700} style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                                {(selectedReceipt.paymentAmount || 0).toLocaleString('vi-VN')} ₫
                            </Text>
                        </Card>

                        {selectedReceipt.note && (
                            <Card withBorder p="md" style={{ background: '#f8f9fa' }}>
                                <Text size="sm" fw={500} mb="xs">📝 Ghi chú:</Text>
                                <Text size="sm">{selectedReceipt.note}</Text>
                            </Card>
                        )}
                    </Paper>
                )}
            </Modal>
        </div>
    );
};

export default PaymentPage;