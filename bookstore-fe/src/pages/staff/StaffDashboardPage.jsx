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
    useMantineTheme,
} from '@mantine/core';
import { IconSearch, IconPlus, IconPackage, IconFileUpload, IconFileSpreadsheet, IconRefresh, IconCheck, IconX, IconPencil, IconTrash, IconBoxSeam } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';

// --- ImportForm để nhập sách thủ công ---
const ImportForm = ({ onSave, onCancel }) => {
    const form = useForm({
        initialValues: {
            title: '',
            author: '',
            category: '',
            price: 0,
            publicationYear: new Date().getFullYear(),
            description: '',
            imageUrl: '',
            quantity: 1,
            supplier: '',
        },
        validate: {
            title: (value) => (value.trim().length < 2 ? 'Tên sách phải có ít nhất 2 ký tự' : null),
            author: (value) => (value.trim().length === 0 ? 'Tên tác giả không được để trống' : null),
            category: (value) => (value.trim().length === 0 ? 'Thể loại không được để trống' : null),
            price: (value) => (value <= 0 ? 'Giá sách phải lớn hơn 0' : null),
            quantity: (value) => (value <= 0 ? 'Số lượng phải lớn hơn 0' : null),
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
                    <SimpleGrid cols={2} spacing="md">
                        <TextInput 
                            label="🏢 Nhà cung cấp" 
                            placeholder="Nhập tên nhà cung cấp" 
                            {...form.getInputProps('supplier')} 
                            size="md"
                            radius="md"
                        />
                        <TextInput 
                            label="🖼️ URL Ảnh bìa" 
                            placeholder="/images/default.jpg" 
                            {...form.getInputProps('imageUrl')} 
                            size="md"
                            radius="md"
                        />
                    </SimpleGrid>
                    <SimpleGrid cols={3} spacing="md">
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
                        <NumberInput 
                            label="📦 Số lượng nhập" 
                            {...form.getInputProps('quantity')} 
                            required 
                            min={1} 
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
                        📦 Nhập Kho
                    </Button>
                </Group>
            </form>
        </div>
    );
};

// --- Component Staff Dashboard Chính ---
const StaffDashboardPage = () => {
    // States
    const [stats, setStats] = useState({ totalImports: 0, todayImports: 0, pendingOrders: 0 });
    const [recentImports, setRecentImports] = useState([]);
    const [searchResult, setSearchResult] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', color: 'blue' });

    // State cho Modal Form
    const [isFormModalOpen, { open: openFormModal, close: closeFormModal }] = useDisclosure(false);

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
            // Mock data for now - sẽ thay bằng API thực tế
            setStats({
                totalImports: 156,
                todayImports: 12,
                pendingOrders: 8,
            });

            // Mock recent imports data
            setRecentImports([
                { id: 1, title: "Tôi thấy hoa vàng trên cỏ xanh", author: "Nguyễn Nhật Ánh", quantity: 50, supplier: "NXB Trẻ", date: new Date() },
                { id: 2, title: "Dế Mèn phiêu lưu ký", author: "Tô Hoài", quantity: 30, supplier: "NXB Kim Đồng", date: new Date() },
            ]);
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
            setSearchResult([]);
            return;
        }
        setIsLoading(true);
        try {
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

    // Hàm mở form nhập sách
    const handleAddImport = () => {
        openFormModal();
    };

    // Hàm xử lý nhập sách thủ công
    const handleSaveImport = async (formData) => {
        try {
            await API.import.importBook(formData);
            showNotification('Nhập sách vào kho thành công!', 'teal');
            closeFormModal();
            fetchDashboardData();
        } catch (error) {
            showNotification(error.response?.data?.message || 'Có lỗi xảy ra', 'red');
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
        if (!csvFile) {
            showNotification('Vui lòng chọn file CSV', 'red');
            return;
        }

        setIsImporting(true);
        setImportProgress(0);
        setImportResult(null);

        try {
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
            
            clearInterval(progressInterval);
            setImportProgress(100);
            
            const data = response.data;
            const result = data.result || {};
            const importedCount = result.successCount || result.imported || 0;
            const failedCount = Array.isArray(result.failed) ? result.failed.length : 0;
            
            setImportResult({
                success: true,
                message: data.message || 'Import thành công!',
                imported: importedCount,
                failed: failedCount,
                details: result.details || []
            });

            showNotification(`Import thành công ${importedCount} sách vào kho!`, 'teal');
            fetchDashboardData();

        } catch (error) {
            setImportProgress(100);
            const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi import CSV';
            
            setImportResult({
                success: false,
                message: errorMessage,
                imported: 0,
                failed: 0,
                details: error.response?.data?.details || [errorMessage]
            });
            
            showNotification(errorMessage, 'red');
        } finally {
            setIsImporting(false);
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
        </Paper>
    );

    // Component để render bảng nhập kho
    const ImportsTable = ({ data, title }) => (
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
                            <Table.Th style={{ fontWeight: 600, color: '#495057' }}>📦 Số Lượng</Table.Th>
                            <Table.Th style={{ fontWeight: 600, color: '#495057' }}>🏢 Nhà CC</Table.Th>
                            <Table.Th style={{ fontWeight: 600, color: '#495057' }}>📅 Ngày</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {data.length > 0 ? (
                            data.map(item => (
                                <Table.Tr key={item.id}>
                                    <Table.Td>
                                        <Text lineClamp={1} fw={500} size="sm">
                                            {item.title}
                                        </Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="sm" c="dark">
                                            {item.author}
                                        </Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="sm" fw={500} c="blue">
                                            {item.quantity}
                                        </Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="sm" c="dark">
                                            {item.supplier}
                                        </Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="sm" c="dimmed">
                                            {new Date(item.date).toLocaleDateString('vi-VN')}
                                        </Text>
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
                                            📦 Chưa có dữ liệu nhập kho
                                        </Text>
                                        <Text size="sm" c="dimmed">
                                            {searchQuery ? 'Không tìm thấy phiếu nhập phù hợp' : 'Chưa có phiếu nhập nào gần đây'}
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

            <div style={{ width: '100%', maxWidth: 'none' }}>
                {/* Header của Dashboard */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Title order={1} mb="md" c="dark" style={{ fontWeight: 600 }}>
                        📦 Quản Lý Nhập Kho
                    </Title>
                    <Text size="lg" c="dimmed" mb="xl">
                        Nhập sách vào kho và quản lý phiếu nhập một cách hiệu quả
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
                            onClick={handleAddImport}
                            gradient={{ from: 'blue', to: 'cyan' }}
                            variant="gradient"
                        >
                            Nhập Sách Thủ Công
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
                        📊 Thống Kê Nhập Kho
                    </Title>
                    <SimpleGrid 
                        cols={{ base: 1, sm: 2, md: 3 }} 
                        spacing="lg"
                        style={{ margin: '0 auto' }}
                    >
                        <StatCard 
                            title="Tổng Phiếu Nhập" 
                            value={stats.totalImports} 
                            icon={<IconPackage size="1.5rem" />} 
                            color="blue" 
                        />
                        <StatCard 
                            title="Nhập Hôm Nay" 
                            value={stats.todayImports} 
                            icon={<IconBoxSeam size="1.5rem" />} 
                            color="green" 
                        />
                        <StatCard 
                            title="Đơn Chờ Xử Lý" 
                            value={stats.pendingOrders} 
                            icon={<IconFileSpreadsheet size="1.5rem" />} 
                            color="orange" 
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

                    {/* Hiển thị kết quả tìm kiếm hoặc phiếu nhập gần đây */}
                    <div style={{ width: '100%' }}>
                        {searchQuery ? (
                            <ImportsTable data={searchResult} title={`🔎 Kết quả tìm kiếm cho "${searchQuery}"`} />
                        ) : (
                            <ImportsTable data={recentImports} title="📋 Phiếu Nhập Gần Đây" />
                        )}
                    </div>
                </SimpleGrid>

                {/* Modal để Nhập Sách Thủ Công */}
                <Modal 
                    opened={isFormModalOpen} 
                    onClose={closeFormModal} 
                    title="📦 Nhập Sách Vào Kho" 
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
                        root: { zIndex: 9999 },
                        inner: { zIndex: 9999, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 },
                        modal: { backgroundColor: 'white', zIndex: 9999, position: 'relative', maxHeight: '90vh', overflow: 'auto' },
                        header: { backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6', padding: '1rem 1.5rem', fontSize: '1.1rem', fontWeight: 600 },
                        overlay: { zIndex: 9998, backgroundColor: 'rgba(0, 0, 0, 0.75) !important' }
                    }}
                    portalProps={{ target: document.body }}
                >
                    <ImportForm
                        onSave={handleSaveImport}
                        onCancel={closeFormModal}
                    />
                </Modal>

                {/* Modal Import CSV */}
                <Modal 
                    opened={isCsvModalOpen} 
                    onClose={closeCsvModal} 
                    title="📊 Import Phiếu Nhập từ File CSV" 
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
                        root: { zIndex: 9999 },
                        inner: { zIndex: 9999, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 },
                        modal: { backgroundColor: 'white', zIndex: 9999, position: 'relative', maxHeight: '90vh', overflow: 'auto' },
                        header: { backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6', padding: '1rem 1.5rem', fontSize: '1.1rem', fontWeight: 600 },
                        overlay: { zIndex: 9998, backgroundColor: 'rgba(0, 0, 0, 0.75) !important' }
                    }}
                    portalProps={{ target: document.body }}
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
                                title, author, category, price, publicationYear, description, imageUrl, quantity, supplier
                            </Text>
                            <Text size="xs" mt="xs" c="dimmed">
                                Ví dụ: "Dế Mèn phiêu lưu ký", "Tô Hoài", "Văn học thiếu nhi", 50000, 1941, "Truyện thiếu nhi nổi tiếng", "/images/de-men.jpg", 100, "NXB Kim Đồng"
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

export default StaffDashboardPage; 