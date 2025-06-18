// src/pages/staff/ReportsPage.jsx
import React, { useState, useEffect } from 'react';
import { API } from '../../api/apiService';
import {
    Container,
    Select,
    Button,
    Group,
    Title,
    Paper,
    Table,
    Text,
    Loader,
    Alert,
    SimpleGrid,
    ActionIcon,
    Notification,
    Badge,
    useMantineTheme
} from '@mantine/core';
import { IconCalendar, IconAlertCircle, IconCheck, IconX, IconFileAnalytics, IconTrendingUp, IconRefresh, IconDownload, IconSortAscending, IconSortDescending, IconFilter } from '@tabler/icons-react';

const ReportsPage = () => {
    const [reportType, setReportType] = useState('inventory');
    const [month, setMonth] = useState(new Date().getMonth() + 1); // Current month
    const [year, setYear] = useState(new Date().getFullYear()); // Current year
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState({ show: false, message: '', color: 'blue' });
    const [sortBy, setSortBy] = useState('');
    const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'

    // Theme
    const theme = useMantineTheme();

    // Hàm hiển thị thông báo
    const showNotification = (message, color) => {
        setNotification({ show: true, message, color });
        setTimeout(() => setNotification({ show: false, message: '' }), 3000);
    };

    const handleFetchReport = async () => {
        if (!month || !year || month < 1 || month > 12) {
            setError('Vui lòng chọn tháng và năm hợp lệ');
            return;
        }

        setLoading(true);
        setData([]);
        setError('');

        try {
            let response;
            if (reportType === 'inventory') {
                response = await API.reports.getInventoryReport({ month, year });
            } else if (reportType === 'debt') {
                response = await API.reports.getDebtReport({ month, year });
            }
            setData(response.data || []);
            // Reset sorting when new data is loaded
            setSortBy('');
            setSortDirection('asc');
            showNotification('Tải báo cáo thành công!', 'teal');
        } catch (error) {
            console.error('Error fetching report:', error);
            const errorMessage = error.response?.data?.error || "Không thể tải báo cáo. Vui lòng thử lại.";
            setError(errorMessage);
            showNotification(errorMessage, 'red');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    // Function to export data to CSV
    const exportToCSV = () => {
        if (!data.length) {
            showNotification('Không có dữ liệu để xuất!', 'red');
            return;
        }

        let csvContent = '';
        let headers = [];
        let rows = [];

        if (reportType === 'inventory') {
            headers = ['Tên sách', 'Tồn đầu', 'Nhập', 'Bán', 'Thuê', 'Tồn cuối'];
            rows = data.map(item => [
                `"${item.title}"`,
                item.openingStock ?? 'N/A',
                item.imported || 0,
                item.sold || 0,
                item.rent || 0,
                item.closingStock || 0
            ]);
        } else {
            headers = ['Tên khách hàng', 'Nợ đầu kỳ', 'Tiền bán', 'Tiền thuê', 'Đã thu', 'Nợ cuối kỳ'];
            rows = data.map(item => [
                `"${item.name}"`,
                item.openingDebt || 0,
                item.salesAmount || 0,
                item.rentAmount || 0,
                item.amountPaid || 0,
                item.closingDebt || 0
            ]);
        }

        csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

        // Add BOM for UTF-8 encoding to support Vietnamese characters
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `${reportType}-report-${month}_${year}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showNotification('Xuất file CSV thành công!', 'teal');
    };

    // Function to sort data
    const getSortedData = () => {
        if (!sortBy || !data.length) return data;

        const sortedData = [...data].sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];

            // Handle different data types
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            // Handle null/undefined values
            if (aValue == null) aValue = reportType === 'inventory' ? 0 : '';
            if (bValue == null) bValue = reportType === 'inventory' ? 0 : '';

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return sortedData;
    };

    // Function to handle column sort
    const handleSort = (column) => {
        if (sortBy === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortDirection('asc');
        }
    };

    // Get sort options based on report type
    const getSortOptions = () => {
        if (reportType === 'inventory') {
            return [
                { value: '', label: 'Không sắp xếp' },
                { value: 'title', label: 'Tên sách' },
                { value: 'openingStock', label: 'Tồn đầu' },
                { value: 'imported', label: 'Nhập' },
                { value: 'sold', label: 'Bán' },
                { value: 'rent', label: 'Thuê' },
                { value: 'closingStock', label: 'Tồn cuối' },
            ];
        } else {
            return [
                { value: '', label: 'Không sắp xếp' },
                { value: 'name', label: 'Tên khách hàng' },
                { value: 'openingDebt', label: 'Nợ đầu kỳ' },
                { value: 'salesAmount', label: 'Tiền bán' },
                { value: 'rentAmount', label: 'Tiền thuê' },
                { value: 'amountPaid', label: 'Đã thu' },
                { value: 'closingDebt', label: 'Nợ cuối kỳ' },
            ];
        }
    };

    // Use sorted data for rendering
    const sortedData = getSortedData();

    const inventoryRows = sortedData.map((item, index) => (
        <Table.Tr key={item.bookId || index} style={{ transition: 'background-color 0.2s ease' }}>
            <Table.Td>
                <Text lineClamp={2} fw={500} size="sm">
                    {item.title}
                </Text>
            </Table.Td>
            <Table.Td style={{ textAlign: 'center' }}>
                <Text size="sm" c={item.openingStock === null ? 'dimmed' : 'dark'}>
                    {item.openingStock ?? 'NaN'}
                </Text>
            </Table.Td>
            <Table.Td style={{ textAlign: 'center' }}>
                <Badge variant="light" color="blue" size="sm">
                    {item.imported || 0}
                </Badge>
            </Table.Td>
            <Table.Td style={{ textAlign: 'center' }}>
                <Badge variant="light" color="red" size="sm">
                    {item.sold || 0}
                </Badge>
            </Table.Td>
            <Table.Td style={{ textAlign: 'center' }}>
                <Badge variant="light" color="orange" size="sm">
                    {item.rent || 0}
                </Badge>
            </Table.Td>
            <Table.Td style={{ textAlign: 'center' }}>
                <Text
                    size="sm"
                    fw={500}
                    c={item.closingStock > 10 ? 'teal' : item.closingStock > 0 ? 'orange' : 'red'}
                >
                    {item.closingStock || 0}
                </Text>
            </Table.Td>
        </Table.Tr>
    ));

    const debtRows = sortedData.map((item, index) => (
        <Table.Tr key={item.customerId || index} style={{ transition: 'background-color 0.2s ease' }}>
            <Table.Td>
                <Text lineClamp={1} fw={500} size="sm">
                    {item.name}
                </Text>
            </Table.Td>
            <Table.Td style={{ textAlign: 'right' }}>
                <Text size="sm" c={item.openingDebt > 0 ? 'red' : 'teal'}>
                    {formatCurrency(item.openingDebt || 0)}
                </Text>
            </Table.Td>
            <Table.Td style={{ textAlign: 'right' }}>
                <Text size="sm" c="blue" fw={500}>
                    {formatCurrency(item.salesAmount || 0)}
                </Text>
            </Table.Td>
            <Table.Td style={{ textAlign: 'right' }}>
                <Text size="sm" c="orange" fw={500}>
                    {formatCurrency(item.rentAmount || 0)}
                </Text>
            </Table.Td>
            <Table.Td style={{ textAlign: 'right' }}>
                <Text size="sm" c="teal" fw={500}>
                    {formatCurrency(item.amountPaid || 0)}
                </Text>
            </Table.Td>
            <Table.Td style={{ textAlign: 'right' }}>
                <Text size="sm" c={item.closingDebt > 0 ? 'red' : 'teal'} fw={600}>
                    {formatCurrency(item.closingDebt || 0)}
                </Text>
            </Table.Td>
        </Table.Tr>
    ));

    // Generate month options
    const monthOptions = Array.from({ length: 12 }, (_, i) => ({
        value: (i + 1).toString(),
        label: `Tháng ${i + 1}`
    }));

    // Generate year options (current year and previous 5 years)
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 6 }, (_, i) => ({
        value: (currentYear - i).toString(),
        label: (currentYear - i).toString()
    }));

    // Component cho bảng báo cáo
    const ReportTable = ({ data, reportType, month, year }) => (
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
            <Group justify="space-between" align="center" mb="xl">
                <div>
                    <Title order={3} c="dark">
                        {reportType === 'inventory' ? '📊 Báo Cáo Tồn Kho' : '💰 Báo Cáo Công Nợ'}
                    </Title>
                    <Text size="sm" c="dimmed">
                        Tháng {month}/{year} • {data.length} mục
                        {sortBy && (
                            <Text span ml="sm" c="blue" fw={500}>
                                • Sắp xếp theo {getSortOptions().find(opt => opt.value === sortBy)?.label}
                                ({sortDirection === 'asc' ? '↑' : '↓'})
                            </Text>
                        )}
                    </Text>
                </div>
                <Group gap="xs">
                    <ActionIcon
                        variant="gradient"
                        gradient={{ from: 'green', to: 'teal' }}
                        size="xl"
                        radius="lg"
                        onClick={exportToCSV}
                        title="Xuất file CSV"
                    >
                        <IconDownload size="1.2rem" />
                    </ActionIcon>
                    <ActionIcon
                        variant="gradient"
                        gradient={{ from: 'purple', to: 'grape' }}
                        size="xl"
                        radius="lg"
                        onClick={() => {
                            setSortBy('');
                            setSortDirection('asc');
                            showNotification('Đã xóa sắp xếp!', 'blue');
                        }}
                        title="Xóa sắp xếp"
                    >
                        <IconFilter size="1.2rem" />
                    </ActionIcon>
                </Group>
            </Group>

            <div style={{
                maxHeight: '600px',
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
                        {reportType === 'inventory' ? (
                            <Table.Tr>
                                <Table.Th style={{ fontWeight: 600, color: '#495057' }}>📖 Tên sách</Table.Th>
                                <Table.Th style={{ fontWeight: 600, color: '#495057', textAlign: 'center' }}>📋 Tồn đầu</Table.Th>
                                <Table.Th style={{ fontWeight: 600, color: '#495057', textAlign: 'center' }}>📦 Nhập</Table.Th>
                                <Table.Th style={{ fontWeight: 600, color: '#495057', textAlign: 'center' }}>🛒 Bán</Table.Th>
                                <Table.Th style={{ fontWeight: 600, color: '#495057', textAlign: 'center' }}>📚 Thuê</Table.Th>
                                <Table.Th style={{ fontWeight: 600, color: '#495057', textAlign: 'center' }}>📊 Tồn cuối</Table.Th>
                            </Table.Tr>
                        ) : (
                            <Table.Tr>
                                <Table.Th style={{ fontWeight: 600, color: '#495057' }}>👤 Khách hàng</Table.Th>
                                <Table.Th style={{ fontWeight: 600, color: '#495057', textAlign: 'right' }}>💳 Nợ đầu kỳ</Table.Th>
                                <Table.Th style={{ fontWeight: 600, color: '#495057', textAlign: 'right' }}>🛒 Tiền bán</Table.Th>
                                <Table.Th style={{ fontWeight: 600, color: '#495057', textAlign: 'right' }}>📚 Tiền thuê</Table.Th>
                                <Table.Th style={{ fontWeight: 600, color: '#495057', textAlign: 'right' }}>💰 Đã thu</Table.Th>
                                <Table.Th style={{ fontWeight: 600, color: '#495057', textAlign: 'right' }}>💳 Nợ cuối kỳ</Table.Th>
                            </Table.Tr>
                        )}
                    </Table.Thead>
                    <Table.Tbody>
                        {data.length > 0 ? (
                            reportType === 'inventory' ? inventoryRows : debtRows
                        ) : (
                            <Table.Tr>
                                <Table.Td colSpan={6}>
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '3rem',
                                        color: '#868e96'
                                    }}>
                                        <Text size="lg" c="dimmed" mb="sm">
                                            📋 Không có dữ liệu
                                        </Text>
                                        <Text size="sm" c="dimmed">
                                            Không có dữ liệu cho tháng {month}/{year}
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

    // Component thống kê tổng quan
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
                    gradient={{ from: color, to: color === 'blue' ? 'cyan' : color === 'cyan' ? 'teal' : 'green' }}
                    size="xl"
                    radius="lg"
                >
                    {icon}
                </ActionIcon>
            </Group>
            <Text fw={700} size="1.5rem" c="dark" ta="center" mb="xs">
                {value}
            </Text>
            <Text size="xs" c="dimmed" ta="center">
                {description}
            </Text>
        </Paper>
    );

    // Reset sorting when report type changes
    useEffect(() => {
        setSortBy('');
        setSortDirection('asc');
    }, [reportType]);

    // Tính toán thống kê
    const calculateStats = () => {
        if (!data.length) return { totalItems: 0, totalValue: 0, positive: 0, negative: 0 };

        if (reportType === 'inventory') {
            const totalBooks = data.length;
            const totalStock = data.reduce((sum, item) => sum + (item.closingStock || 0), 0);
            const totalImported = data.reduce((sum, item) => sum + (item.imported || 0), 0);
            const totalSold = data.reduce((sum, item) => sum + (item.sold || 0), 0);

            return {
                totalItems: totalBooks,
                totalValue: totalStock,
                positive: totalImported,
                negative: totalSold
            };
        } else {
            const totalCustomers = data.length;
            const totalRent = data.reduce((sum, item) => sum + (item.rentAmount || 0), 0);
            const totalPaid = data.reduce((sum, item) => sum + (item.amountPaid || 0), 0);
            const totalSales = data.reduce((sum, item) => sum + (item.salesAmount || 0), 0);

            return {
                totalItems: totalCustomers,
                totalValue: totalRent,
                positive: totalPaid,
                negative: totalSales
            };
        }
    };

    const stats = calculateStats();

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

            {/* CONTAINER CHÍNH */}
            <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header của Dashboard */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Title order={1} mb="md" c="dark" style={{ fontWeight: 600 }}>
                        📊 Báo Cáo Hàng Tháng
                    </Title>
                    <Text size="lg" c="dimmed" mb="xl">
                        Theo dõi tình hình kinh doanh và công nợ của nhà sách
                    </Text>
                </div>

                {/* Control Panel */}
                <Paper
                    withBorder
                    p="xl"
                    radius="lg"
                    shadow="sm"
                    mb="xl"
                    style={{
                        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                    }}
                >
                    <Group justify="center" align="end" spacing="md" wrap="wrap">
                        <Select
                            label="📋 Loại báo cáo"
                            data={[
                                { value: 'inventory', label: '📊 Báo cáo tồn kho' },
                                { value: 'debt', label: '💰 Báo cáo công nợ' },
                            ]}
                            value={reportType}
                            onChange={setReportType}
                            w={200}
                            size="md"
                            radius="md"
                        />

                        <Select
                            label="📅 Tháng"
                            data={monthOptions}
                            value={month?.toString()}
                            onChange={(value) => setMonth(parseInt(value))}
                            w={120}
                            size="md"
                            radius="md"
                        />

                        <Select
                            label="📅 Năm"
                            data={yearOptions}
                            value={year?.toString()}
                            onChange={(value) => setYear(parseInt(value))}
                            w={120}
                            size="md"
                            radius="md"
                        />

                        <Button
                            leftSection={<IconFileAnalytics size="1rem" />}
                            onClick={handleFetchReport}
                            loading={loading}
                            disabled={!month || !year}
                            size="md"
                            radius="md"
                            variant="gradient"
                            gradient={{ from: 'blue', to: 'cyan' }}
                        >
                            Xem báo cáo
                        </Button>

                        <Select
                            label="🔄 Sắp xếp theo"
                            data={getSortOptions()}
                            value={sortBy}
                            onChange={setSortBy}
                            w={180}
                            size="md"
                            radius="md"
                            clearable
                        />

                        {sortBy && (
                            <ActionIcon
                                variant="gradient"
                                gradient={{ from: 'indigo', to: 'blue' }}
                                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                                size="xl"
                                radius="md"
                                title={`Đang sắp xếp ${sortDirection === 'asc' ? 'tăng dần' : 'giảm dần'}`}
                            >
                                {sortDirection === 'asc' ?
                                    <IconSortAscending size="1.2rem" /> :
                                    <IconSortDescending size="1.2rem" />
                                }
                            </ActionIcon>
                        )}

                        <ActionIcon
                            variant="gradient"
                            gradient={{ from: 'gray', to: 'dark' }}
                            onClick={() => {
                                setData([]);
                                setError('');
                                setSortBy('');
                                setSortDirection('asc');
                                showNotification('Đã làm mới!', 'blue');
                            }}
                            size="xl"
                            radius="md"
                        >
                            <IconRefresh size="1.2rem" />
                        </ActionIcon>
                    </Group>
                </Paper>

                {/* Error Alert */}
                {error && (
                    <Alert
                        icon={<IconAlertCircle size={16} />}
                        color="red"
                        mb="xl"
                        title="Lỗi"
                        radius="lg"
                    >
                        {error}
                    </Alert>
                )}

                {/* Loading State */}
                {loading && (
                    <Paper withBorder p="xl" radius="lg" mb="xl" style={{ background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)' }}>
                        <Group justify="center" p="xl">
                            <Loader size="lg" />
                            <div>
                                <Text size="lg" fw={500}>Đang tải báo cáo...</Text>
                                <Text size="sm" c="dimmed">Vui lòng đợi trong giây lát</Text>
                            </div>
                        </Group>
                    </Paper>
                )}

                {/* Statistics Cards */}
                {!loading && data.length > 0 && (
                    <div style={{ marginBottom: '2rem' }}>
                        <Title order={3} ta="center" mb="lg" c="dark">
                            📈 Thống Kê Tổng Quan
                        </Title>
                        <SimpleGrid
                            cols={{ base: 1, sm: 2, md: 4 }}
                            spacing="lg"
                        >
                            <StatCard
                                title={reportType === 'inventory' ? 'Tổng Số Sách' : 'Tổng Khách Hàng'}
                                value={stats.totalItems}
                                icon={reportType === 'inventory' ? <IconFileAnalytics size="1.5rem" /> : <IconTrendingUp size="1.5rem" />}
                                color="blue"
                                description={reportType === 'inventory' ? 'Đầu sách được theo dõi' : 'Khách hàng có giao dịch'}
                            />
                            <StatCard
                                title={reportType === 'inventory' ? 'Tổng Tồn Kho' : 'Tổng Thuê'}
                                value={reportType === 'inventory' ? stats.totalValue : formatCurrency(stats.totalValue)}
                                icon={<IconTrendingUp size="1.5rem" />}
                                color="cyan"
                                description={reportType === 'inventory' ? 'Số lượng tồn kho' : 'Tổng tiền thuê trong tháng'}
                            />
                            <StatCard
                                title={reportType === 'inventory' ? 'Tổng Bán' : 'Tổng Bán'}
                                value={reportType === 'inventory' ? stats.negative : formatCurrency(stats.negative)}
                                icon={<IconTrendingUp size="1.5rem" />}
                                color="green"
                                description={reportType === 'inventory' ? 'Số lượng bán trong tháng' : 'Doanh thu bán hàng'}
                            />
                            <StatCard
                                title={reportType === 'inventory' ? 'Tổng Nhập' : 'Tổng Thu'}
                                value={reportType === 'inventory' ? stats.positive : formatCurrency(stats.positive)}
                                icon={<IconTrendingUp size="1.5rem" />}
                                color="teal"
                                description={reportType === 'inventory' ? 'Số lượng nhập trong tháng' : 'Số tiền đã thu trong tháng'}
                            />
                        </SimpleGrid>
                    </div>
                )}

                {/* Report Table */}
                {!loading && data.length > 0 && (
                    <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto' }}>
                        <ReportTable
                            data={data}
                            reportType={reportType}
                            month={month}
                            year={year}
                        />
                    </div>
                )}

                {/* Empty State */}
                {!loading && data.length === 0 && month && year && !error && (
                    <Paper withBorder p="xl" radius="lg" style={{ background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)' }}>
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <Text size="xl" c="dimmed" mb="md">
                                📋 Chưa có dữ liệu
                            </Text>
                            <Text size="md" c="dimmed" mb="lg">
                                Không có dữ liệu cho {reportType === 'inventory' ? 'báo cáo tồn kho' : 'báo cáo công nợ'} tháng {month}/{year}
                            </Text>
                            <Button
                                variant="light"
                                onClick={() => showNotification('Hãy thử chọn tháng/năm khác!', 'blue')}
                            >
                                Thử lại với tháng khác
                            </Button>
                        </div>
                    </Paper>
                )}

                {/* Initial State */}
                {!loading && (!month || !year) && (
                    <Paper withBorder p="xl" radius="lg" style={{ background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)' }}>
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <Text size="xl" c="dimmed" mb="md">
                                🎯 Chọn thời gian để xem báo cáo
                            </Text>
                            <Text size="md" c="dimmed">
                                Vui lòng chọn tháng và năm để hiển thị báo cáo
                            </Text>
                        </div>
                    </Paper>
                )}
            </div>
        </div>
    );
};

export default ReportsPage;