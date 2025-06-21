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
    Switch,
    Badge,
    Select,
    useMantineTheme, // Hook để lấy theme của Mantine
} from '@mantine/core';
import { IconSearch, IconPlus, IconBook, IconUser, IconCategory, IconRefresh, IconCheck, IconX, IconPencil, IconTrash, IconFileUpload, IconFileSpreadsheet, IconSettings } from '@tabler/icons-react';
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

// --- RuleForm Component ---
const RuleForm = ({ rule, onSave, onCancel }) => {
    const form = useForm({
        initialValues: {
            code: rule?.code || '',
            description: rule?.description || '',
            active: rule?.is_active !== undefined ? rule.is_active : true,
            ruleValue: rule?.ruleValue ? JSON.stringify(rule.ruleValue, null, 2) : '{}',
        },
        validate: {
            code: (value) => {
                if (!value || value.trim().length === 0) return 'Mã qui định không được để trống';
                if (!/^[A-Z0-9]+$/.test(value.trim())) return 'Mã quy định chỉ được chứa chữ cái viết hoa và số';
                return null;
            },
            description: (value) => (value.trim().length === 0 ? 'Mô tả không được để trống' : null),
            ruleValue: (value) => {
                if (!value.trim()) return null; // Allow empty ruleValue
                try {
                    JSON.parse(value);
                    return null;
                } catch (error) {
                    return 'RuleValue phải là JSON hợp lệ hoặc để trống';
                }
            },
        },
    });

    const handleSubmit = (values) => {
        let ruleValue = null;
        if (values.ruleValue && values.ruleValue.trim()) {
            try {
                ruleValue = JSON.parse(values.ruleValue);
            } catch (error) {
                return; // Validation should have caught this
            }
        }

        const formData = {
            code: values.code.trim().toUpperCase(),
            ruleValue,
            description: values.description.trim(),
            active: values.active
        };

        onSave(formData);
    };

    // Predefined rule templates for quick selection
    const ruleTemplates = [
        {
            label: 'QD1 - Quy định nhập sách',
            code: 'QD1',
            description: 'Quy định về số lượng nhập tối thiểu và tồn kho tối thiểu để nhập thêm sách',
            ruleValue: {
                min_import: 150,
                min_stock: 300
            }
        },
        {
            label: 'QD2 - Quy định bán sách',
            code: 'QD2',
            description: 'Quy định về công nợ tối đa của khách hàng và lượng tồn tối thiểu sau khi bán',
            ruleValue: {
                max_debt: 20000,
                min_stock: 10
            }
        },
        {
            label: 'QD6 - Quy định thay đổi',
            code: 'QD6',
            description: 'Quy định về việc cho phép thay đổi các quy định khác',
            ruleValue: {
                allow_rule_change: true
            }
        }
    ];

    const handleTemplateSelect = (templateCode) => {
        const template = ruleTemplates.find(t => t.code === templateCode);
        if (template) {
            form.setFieldValue('code', template.code);
            form.setFieldValue('description', template.description);
            form.setFieldValue('ruleValue', JSON.stringify(template.ruleValue, null, 2));
        }
    };

    return (
        <div style={{ padding: '1rem' }}>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <SimpleGrid cols={1} spacing="lg">
                    {/* Quick Templates - only show for new rules */}
                    {!rule && (
                        <div>
                            <Text size="sm" fw={500} mb="xs">🚀 Mẫu có sẵn (tùy chọn):</Text>
                            <Group gap="xs" mb="md">
                                {ruleTemplates.map(template => (
                                    <Button
                                        key={template.code}
                                        variant="light"
                                        size="xs"
                                        onClick={() => handleTemplateSelect(template.code)}
                                    >
                                        {template.code}
                                    </Button>
                                ))}
                            </Group>
                        </div>
                    )}

                    <TextInput
                        label="🏷️ Mã quy định"
                        placeholder="VD: QD1, QD2, QD3, CUSTOM_RULE..."
                        {...form.getInputProps('code')}
                        required
                        size="md"
                        radius="md"
                        disabled={!!rule} // Không cho sửa code nếu đang edit
                        description="Mã quy định viết hoa, chỉ chứa chữ cái và số"
                    />

                    <Textarea
                        label="📝 Mô tả quy định"
                        placeholder="Mô tả chi tiết về quy định này"
                        {...form.getInputProps('description')}
                        required
                        minRows={2}
                        size="md"
                        radius="md"
                    />

                    <Textarea
                        label="⚙️ Giá trị quy định (JSON)"
                        placeholder='Ví dụ: {"min_import": 150, "min_stock": 300} hoặc để trống nếu không cần'
                        {...form.getInputProps('ruleValue')}
                        minRows={4}
                        maxRows={10}
                        size="md"
                        radius="md"
                        description="Định dạng JSON hợp lệ hoặc để trống. Có thể sử dụng mẫu có sẵn ở trên."
                        style={{ fontFamily: 'monospace' }}
                    />

                    <Switch
                        label="✅ Trạng thái hoạt động"
                        description="Bật/tắt qui định này"
                        {...form.getInputProps('active', { type: 'checkbox' })}
                        size="md"
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
                        gradient={{ from: 'green', to: 'teal' }}
                        size="md"
                        radius="md"
                    >
                        💾 Lưu Qui Định
                    </Button>
                </Group>
            </form>
        </div>
    );
};

// --- UserForm Component ---
const UserForm = ({ user, onSave, onCancel }) => {
    const form = useForm({
        initialValues: {
            name: user?.name || '',
            username: user?.username || '',
            email: user?.email || '',
            role: user?.role || 'customer',
            password: '',
        },
        validate: {
            name: (value) => (value.trim().length < 2 ? 'Tên phải có ít nhất 2 ký tự' : null),
            username: (value) => (value.trim().length < 3 ? 'Tên đăng nhập phải có ít nhất 3 ký tự' : null),
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Email không hợp lệ'),
            password: (value) => {
                // Chỉ validate password khi tạo user mới
                if (!user && value.length < 6) {
                    return 'Mật khẩu phải có ít nhất 6 ký tự';
                }
                return null;
            },
        },
    });

    const handleSubmit = (values) => {
        const formData = {
            name: values.name.trim(),
            username: values.username.trim(),
            email: values.email.trim(),
            role: values.role,
        };

        // Chỉ gửi password khi tạo user mới
        if (!user && values.password) {
            formData.password = values.password;
        }

        onSave(formData);
    };

    return (
        <div style={{ padding: '1rem' }}>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <SimpleGrid cols={1} spacing="lg">
                    <TextInput
                        label="👤 Họ và tên"
                        placeholder="Nhập họ và tên"
                        {...form.getInputProps('name')}
                        required
                        size="md"
                        radius="md"
                    />

                    <SimpleGrid cols={2} spacing="md">
                        <TextInput
                            label="🔑 Tên đăng nhập"
                            placeholder="Nhập tên đăng nhập"
                            {...form.getInputProps('username')}
                            required
                            size="md"
                            radius="md"
                            disabled={!!user} // Không cho sửa username khi edit
                            description={user ? "Không thể thay đổi tên đăng nhập" : ""}
                        />
                        <TextInput
                            label="📧 Email"
                            placeholder="Nhập email"
                            {...form.getInputProps('email')}
                            required
                            size="md"
                            radius="md"
                        />
                    </SimpleGrid>

                    <Select
                        label="🏷️ Vai trò"
                        placeholder="Chọn vai trò"
                        data={[
                            { value: 'customer', label: '👥 Khách hàng' },
                            { value: 'staff', label: '👨‍💼 Nhân viên' },
                            { value: 'admin', label: '👑 Quản trị viên' }
                        ]}
                        {...form.getInputProps('role')}
                        required
                        size="md"
                        radius="md"
                        withinPortal
                        dropdownPosition="bottom"
                        portalProps={{ zIndex: 10001 }}
                        comboboxProps={{
                            zIndex: 10001,
                            withinPortal: true,
                            dropdownPadding: 4,
                            position: 'bottom-start'
                        }}
                    />

                    {!user && (
                        <TextInput
                            label="🔒 Mật khẩu"
                            placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                            type="password"
                            {...form.getInputProps('password')}
                            required
                            size="md"
                            radius="md"
                            description="Mật khẩu chỉ được đặt khi tạo user mới"
                        />
                    )}
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
                        gradient={{ from: 'blue', to: 'purple' }}
                        size="md"
                        radius="md"
                    >
                        💾 {user ? 'Cập nhật' : 'Tạo'} Người dùng
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
    const [searchTotal, setSearchTotal] = useState(0);
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

    // State cho Rules Management
    const [rules, setRules] = useState([]);
    const [isRuleModalOpen, { open: openRuleModal, close: closeRuleModal }] = useDisclosure(false);
    const [editingRule, setEditingRule] = useState(null);
    const [isDeleteRuleModalOpen, { open: openDeleteRuleModal, close: closeDeleteRuleModal }] = useDisclosure(false);
    const [ruleToDelete, setRuleToDelete] = useState(null);
    const [showRules, setShowRules] = useState(false);

    // State cho User Management
    const [users, setUsers] = useState([]);
    const [isUserModalOpen, { open: openUserModal, close: closeUserModal }] = useDisclosure(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isDeleteUserModalOpen, { open: openDeleteUserModal, close: closeDeleteUserModal }] = useDisclosure(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [showUsers, setShowUsers] = useState(false);

    // State cho User Search
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [userSearchResult, setUserSearchResult] = useState([]);
    const [userSearchTotal, setUserSearchTotal] = useState(0);

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

    // Hàm hiển thị thông báo
    const showNotification = useCallback((message, color) => {
        setNotification({ show: true, message, color });
        setTimeout(() => setNotification({ show: false, message: '' }), 3000);
    }, []);

    // Hàm lấy danh sách rules
    const fetchRules = useCallback(async () => {
        try {
            const response = await API.rules.getAllRules();
            setRules(response.data || []);
        } catch (error) {
            showNotification('Không thể tải danh sách quy định', 'red');
        }
    }, [showNotification]);

    // Hàm lấy danh sách users
    const fetchUsers = useCallback(async () => {
        try {
            const response = await API.user.getAllUsers();
            setUsers(response.data.users || []);
        } catch (error) {
            showNotification('Không thể tải danh sách người dùng', 'red');
        }
    }, [showNotification]);

    useEffect(() => {
        fetchDashboardData();
        fetchRules();
        fetchUsers();
    }, [fetchDashboardData, fetchRules, fetchUsers]);

    // Hàm mở form thêm rule
    const handleAddNewRule = () => {
        setEditingRule(null);
        openRuleModal();
    };

    // Hàm mở form sửa rule
    const handleEditRule = (rule) => {
        setEditingRule(rule);
        openRuleModal();
    };

    // Hàm xử lý lưu rule
    const handleSaveRule = async (formData) => {
        try {
            // Ensure consistent field naming
            const ruleData = {
                code: formData.code,
                ruleValue: formData.ruleValue,
                description: formData.description,
                is_active: formData.active  // Convert active to is_active
            };

            if (editingRule) {
                await API.rules.updateRuleByCode(editingRule.code, ruleData);
                showNotification('Cập nhật qui định thành công!', 'teal');
            } else {
                await API.rules.createOrUpdateRule(ruleData);
                showNotification('Thêm qui định mới thành công!', 'teal');
            }
            closeRuleModal();
            fetchRules();
        } catch (error) {
            showNotification(error.response?.data?.error || error.response?.data?.message || 'Có lỗi xảy ra', 'red');
        }
    };

    // Hàm xử lý xóa rule
    const confirmDeleteRule = (rule) => {
        setRuleToDelete(rule);
        openDeleteRuleModal();
    };

    const handleDeleteRule = async () => {
        if (!ruleToDelete) {
            return;
        }

        try {
            await API.rules.deleteRule(ruleToDelete.code);
            showNotification('Xóa quy định thành công!', 'teal');
            closeDeleteRuleModal();
            await fetchRules();
        } catch (error) {
            showNotification(error.response?.data?.error || error.response?.data?.message || 'Lỗi khi xóa quy định', 'red');
        }
    };

    // Hàm toggle trạng thái rule
    const handleToggleRuleStatus = async (rule) => {
        try {
            // Ensure we use the correct field name that backend expects
            const updatedData = {
                code: rule.code,  // Add code field explicitly
                ruleValue: rule.ruleValue,
                description: rule.description,
                is_active: !rule.is_active  // Use is_active instead of active
            };

            await API.rules.updateRuleByCode(rule.code, updatedData);
            showNotification(`${rule.is_active ? 'Tắt' : 'Bật'} quy định thành công!`, 'teal');
            await fetchRules();
        } catch (error) {
            showNotification(error.response?.data?.error || error.response?.data?.message || 'Lỗi khi thay đổi trạng thái quy định', 'red');
        }
    };

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
            setSearchTotal(response.data.total || 0);
        } catch (error) {
            showNotification('Lỗi khi tìm kiếm sách', 'red');
        } finally {
            setIsLoading(false);
        }
    };

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
            showNotification(
                error.response?.data?.error || error.response?.data?.message || 'Lỗi khi lưu sách',
                'red'
            );
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
            showNotification(
                error.response?.data?.error || error.response?.data?.message || 'Lỗi khi xóa sách',
                'red'
            );
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

            const response = await API.books.importBooksFromCSV(csvFile);

            clearInterval(progressInterval);
            setImportProgress(100);

            // Parse response structure từ backend
            const data = response.data;
            const result = data.result || {};
            const importedCount = result.successCount || result.imported || result.importedCount || 0;
            const failedCount = Array.isArray(result.failed) ? result.failed.length : (result.failedCount || 0);

            setImportResult({
                success: true,
                message: data.message || 'Import thành công!',
                imported: importedCount,
                failed: failedCount,
                details: result.details || result.errors || []
            });

            showNotification(`Import thành công ${importedCount} sách!`, 'teal');
            fetchDashboardData(); // Tải lại dữ liệu dashboard

        } catch (error) {
            setImportProgress(100);
            setImportResult({
                success: false,
                message: error.response?.data?.message || error.message || 'Có lỗi xảy ra khi import',
                details: error.response?.data?.details || [error.message]
            });
            showNotification(error.response?.data?.message || error.message || 'Lỗi khi import CSV', 'red');
        } finally {
            setIsImporting(false);
        }
    };

    // --- User Management Handlers ---
    // Hàm mở form thêm user
    const handleAddNewUser = () => {
        setEditingUser(null);
        openUserModal();
    };

    // Hàm mở form sửa user
    const handleEditUser = (user) => {
        setEditingUser(user);
        openUserModal();
    };

    // Hàm xử lý lưu user
    const handleSaveUser = async (formData) => {
        try {
            if (editingUser) {
                await API.user.updateUser(editingUser._id, formData);
                showNotification('Cập nhật người dùng thành công!', 'teal');
            } else {
                await API.user.createUser(formData);
                showNotification('Thêm người dùng mới thành công!', 'teal');
            }
            closeUserModal();
            fetchUsers();
            // Refresh search results if there's an active search
            if (userSearchQuery) {
                handleUserSearch(new Event('submit'));
            }
        } catch (error) {
            showNotification(
                error.response?.data?.message || 'Có lỗi xảy ra',
                'red'
            );
        }
    };

    // Hàm xử lý xóa user
    const confirmDeleteUser = (user) => {
        setUserToDelete(user);
        openDeleteUserModal();
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;

        try {
            await API.user.deleteUser(userToDelete._id);
            showNotification('Xóa người dùng thành công!', 'teal');
            closeDeleteUserModal();
            await fetchUsers();
            // Refresh search results if there's an active search
            if (userSearchQuery) {
                handleUserSearch(new Event('submit'));
            }
        } catch (error) {
            showNotification(
                error.response?.data?.message || 'Lỗi khi xóa người dùng',
                'red'
            );
        }
    };

    // Hàm tìm kiếm user
    const handleUserSearch = async (event) => {
        event.preventDefault();
        if (!userSearchQuery.trim()) {
            setUserSearchResult([]);
            setUserSearchTotal(0);
            return;
        }
        setIsLoading(true);
        try {
            const response = await API.user.searchUsers(userSearchQuery);
            setUserSearchResult(response.data.users || []);
            setUserSearchTotal(response.data.count || 0);
        } catch (error) {
            showNotification('Lỗi khi tìm kiếm người dùng', 'red');
        } finally {
            setIsLoading(false);
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

    // Component để render bảng rules
    const RulesTable = ({ data, title }) => {
        return (
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
                                <Table.Th style={{ fontWeight: 600, color: '#495057', whiteSpace: 'nowrap' }}>🏷️ Mã QĐ</Table.Th>
                                <Table.Th style={{ fontWeight: 600, color: '#495057', whiteSpace: 'nowrap' }}>📝 Mô Tả</Table.Th>
                                <Table.Th style={{ fontWeight: 600, color: '#495057', whiteSpace: 'nowrap' }}>⚙️ Giá Trị</Table.Th>
                                <Table.Th style={{ fontWeight: 600, color: '#495057', whiteSpace: 'nowrap', textAlign: 'center' }}>🔄 Trạng Thái</Table.Th>
                                <Table.Th style={{ fontWeight: 600, color: '#495057', whiteSpace: 'nowrap', textAlign: 'center' }}>⚙️ Hành Động</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {data.length > 0 ? (
                                data.map((rule, index) => {
                                    return (
                                        <Table.Tr key={rule._id || rule.code || index} style={{ transition: 'background-color 0.2s ease' }}>
                                            <Table.Td>
                                                <Badge
                                                    variant="gradient"
                                                    gradient={rule.is_active ? { from: 'green', to: 'teal' } : { from: 'gray', to: 'gray' }}
                                                    size="lg"
                                                >
                                                    {rule.code}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text lineClamp={2} size="sm">
                                                    {rule.description}
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <div style={{ maxWidth: '250px' }}>
                                                    {rule.ruleValue ? (
                                                        (() => {
                                                            // Smart display logic based on ruleValue content
                                                            const rv = rule.ruleValue;

                                                            // QD1-like structure
                                                            if (rv.min_import !== undefined && rv.min_stock !== undefined) {
                                                                return (
                                                                    <div>
                                                                        <Text size="sm" c="blue">Nhập tối thiểu: {rv.min_import}</Text>
                                                                        <Text size="sm" c="green">Tồn kho tối thiểu: {rv.min_stock}</Text>
                                                                    </div>
                                                                );
                                                            }

                                                            // QD2-like structure
                                                            if (rv.max_debt !== undefined) {
                                                                return (
                                                                    <div>
                                                                        <Text size="sm" c="red">Công nợ tối đa: {rv.max_debt?.toLocaleString()}₫</Text>
                                                                        {rv.min_stock && <Text size="sm" c="green">Tồn kho tối thiểu: {rv.min_stock}</Text>}
                                                                    </div>
                                                                );
                                                            }

                                                            // QD6-like structure
                                                            if (rv.allow_rule_change !== undefined) {
                                                                return (
                                                                    <Text size="sm" c={rv.allow_rule_change ? "green" : "red"}>
                                                                        {rv.allow_rule_change ? "✅ Cho phép thay đổi" : "❌ Không cho phép thay đổi"}
                                                                    </Text>
                                                                );
                                                            }

                                                            // Generic display for other structures
                                                            return (
                                                                <div>
                                                                    {Object.entries(rv).map(([key, value]) => (
                                                                        <Text key={key} size="xs" c="dimmed">
                                                                            <Text span fw={500}>{key}:</Text> {String(value)}
                                                                        </Text>
                                                                    ))}
                                                                </div>
                                                            );
                                                        })()
                                                    ) : (
                                                        <Text size="xs" c="dimmed" fs="italic">
                                                            Không có giá trị
                                                        </Text>
                                                    )}
                                                </div>
                                            </Table.Td>
                                            <Table.Td style={{ textAlign: 'center' }}>
                                                <Switch
                                                    checked={rule.is_active}
                                                    onChange={() => {
                                                        handleToggleRuleStatus(rule);
                                                    }}
                                                    size="md"
                                                    color="green"
                                                    style={{ cursor: 'pointer' }}
                                                />
                                            </Table.Td>
                                            <Table.Td>
                                                <Group gap="xs" justify="center" wrap="nowrap">
                                                    <ActionIcon
                                                        color="blue"
                                                        variant="gradient"
                                                        gradient={{ from: 'blue', to: 'cyan' }}
                                                        onClick={() => handleEditRule(rule)}
                                                        radius="md"
                                                        size="lg"
                                                    >
                                                        <IconPencil size="1rem" />
                                                    </ActionIcon>
                                                    <ActionIcon
                                                        color="red"
                                                        variant="gradient"
                                                        gradient={{ from: 'red', to: 'pink' }}
                                                        onClick={() => {
                                                            confirmDeleteRule(rule);
                                                        }}
                                                        radius="md"
                                                        size="lg"
                                                    >
                                                        <IconTrash size="1rem" />
                                                    </ActionIcon>
                                                </Group>
                                            </Table.Td>
                                        </Table.Tr>
                                    );
                                })
                            ) : (
                                <Table.Tr>
                                    <Table.Td colSpan={5}>
                                        <div style={{
                                            textAlign: 'center',
                                            padding: '2rem',
                                            color: '#868e96'
                                        }}>
                                            <Text size="lg" c="dimmed" mb="sm">
                                                ⚙️ Chưa có qui định nào
                                            </Text>
                                            <Text size="sm" c="dimmed">
                                                Thêm qui định đầu tiên cho nhà sách
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
    };

    // Component để render bảng users
    const UsersTable = ({ data, title }) => {
        const getRoleBadge = (role) => {
            const roleConfig = {
                admin: { color: 'red', label: '👑 Admin' },
                staff: { color: 'blue', label: '👨‍💼 Staff' },
                customer: { color: 'green', label: '👥 Customer' }
            };
            const config = roleConfig[role] || { color: 'gray', label: role };
            return (
                <Badge color={config.color} variant="gradient" size="lg">
                    {config.label}
                </Badge>
            );
        };

        const formatDate = (dateString) => {
            return new Date(dateString).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        };

        return (
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
                                <Table.Th style={{ fontWeight: 600, color: '#495057', whiteSpace: 'nowrap' }}>👤 Tên</Table.Th>
                                <Table.Th style={{ fontWeight: 600, color: '#495057', whiteSpace: 'nowrap' }}>🔑 Username</Table.Th>
                                <Table.Th style={{ fontWeight: 600, color: '#495057', whiteSpace: 'nowrap' }}>📧 Email</Table.Th>
                                <Table.Th style={{ fontWeight: 600, color: '#495057', whiteSpace: 'nowrap' }}>🏷️ Vai trò</Table.Th>
                                <Table.Th style={{ fontWeight: 600, color: '#495057', whiteSpace: 'nowrap' }}>📅 Tạo lúc</Table.Th>
                                <Table.Th style={{ fontWeight: 600, color: '#495057', whiteSpace: 'nowrap', textAlign: 'center' }}>⚙️ Hành động</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {data.length > 0 ? (
                                data.map((user, index) => (
                                    <Table.Tr key={user._id || index} style={{ transition: 'background-color 0.2s ease' }}>
                                        <Table.Td>
                                            <Text fw={500} size="sm">
                                                {user.name}
                                            </Text>
                                            {user.customerProfile?.debt > 0 && (
                                                <Text size="xs" c="red">
                                                    Nợ: {user.customerProfile.debt?.toLocaleString()}₫
                                                </Text>
                                            )}
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm" c="dark">
                                                {user.username}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm" c="dark">
                                                {user.email}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>
                                            {getRoleBadge(user.role)}
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="xs" c="dimmed">
                                                {formatDate(user.createdAt)}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Group gap="xs" justify="center" wrap="nowrap">
                                                <ActionIcon
                                                    color="blue"
                                                    variant="gradient"
                                                    gradient={{ from: 'blue', to: 'cyan' }}
                                                    onClick={() => handleEditUser(user)}
                                                    radius="md"
                                                    size="lg"
                                                >
                                                    <IconPencil size="1rem" />
                                                </ActionIcon>
                                                {user.role !== 'admin' && (
                                                    <ActionIcon
                                                        color="red"
                                                        variant="gradient"
                                                        gradient={{ from: 'red', to: 'pink' }}
                                                        onClick={() => confirmDeleteUser(user)}
                                                        radius="md"
                                                        size="lg"
                                                    >
                                                        <IconTrash size="1rem" />
                                                    </ActionIcon>
                                                )}
                                            </Group>
                                        </Table.Td>
                                    </Table.Tr>
                                ))
                            ) : (
                                <Table.Tr>
                                    <Table.Td colSpan={6}>
                                        <div style={{
                                            textAlign: 'center',
                                            padding: '2rem',
                                            color: '#868e96'
                                        }}>
                                            <Text size="lg" c="dimmed" mb="sm">
                                                👥 Chưa có người dùng nào
                                            </Text>
                                            <Text size="sm" c="dimmed">
                                                Thêm người dùng đầu tiên cho hệ thống
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
    };

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
                            <Table.Th style={{ fontWeight: 600, color: '#495057', whiteSpace: 'nowrap' }}>✍️ Tác Giả</Table.Th>
                            <Table.Th style={{ fontWeight: 600, color: '#495057', whiteSpace: 'nowrap' }}>📂 Thể Loại</Table.Th>
                            <Table.Th style={{ fontWeight: 600, color: '#495057', whiteSpace: 'nowrap' }}>💰 Giá</Table.Th>
                            <Table.Th style={{ fontWeight: 600, color: '#495057', whiteSpace: 'nowrap' }}>📦 Tồn Kho</Table.Th>
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
                                        <Text size="sm" c="dark">
                                            {book.category?.name}
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
                                            c={book.availableStock > 10 ? 'teal' : book.availableStock > 0 ? 'orange' : 'red'}
                                            fw={500}
                                        >
                                            {book.availableStock || 0}
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
                                <Table.Td colSpan={6}>
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

            {/* CONTAINER CHÍNH SỬ DỤNG TOÀN BỘ MÀN HÌNH */}
            <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
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
                        <Button
                            leftSection={<IconSettings size="1rem" />}
                            onClick={() => setShowRules(!showRules)}
                            gradient={{ from: 'purple', to: 'grape' }}
                            variant="gradient"
                        >
                            {showRules ? 'Ẩn' : 'Hiện'} Qui Định
                        </Button>
                        <Button
                            leftSection={<IconUser size="1rem" />}
                            onClick={() => setShowUsers(!showUsers)}
                            gradient={{ from: 'orange', to: 'red' }}
                            variant="gradient"
                        >
                            {showUsers ? 'Ẩn' : 'Hiện'} Người Dùng
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

                {/* Rules Management Section */}
                {showRules && (
                    <div style={{ marginBottom: '2rem' }}>
                        <Title order={3} ta="center" mb="lg" c="dark">
                            ⚙️ Quản Lý Qui Định
                        </Title>
                        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                            <Button
                                leftSection={<IconPlus size="1rem" />}
                                onClick={handleAddNewRule}
                                gradient={{ from: 'purple', to: 'grape' }}
                                variant="gradient"
                                radius="md"
                            >
                                Thêm Qui Định Mới
                            </Button>
                        </div>
                        <div style={{ width: '100%', maxWidth: 1100, margin: '0 auto' }}>
                            <RulesTable data={rules} title="📋 Danh Sách Qui Định" />
                        </div>
                    </div>
                )}

                {/* User Management Section */}
                {showUsers && (
                    <div style={{ marginBottom: '2rem' }}>
                        <Title order={3} ta="center" mb="lg" c="dark">
                            👥 Quản Lý Người Dùng
                        </Title>
                        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                            <Button
                                leftSection={<IconPlus size="1rem" />}
                                onClick={handleAddNewUser}
                                gradient={{ from: 'orange', to: 'red' }}
                                variant="gradient"
                                radius="md"
                            >
                                Thêm Người Dùng Mới
                            </Button>
                        </div>

                        {/* Thanh tìm kiếm user */}
                        <div style={{ width: '100%', maxWidth: 600, margin: '0 auto', marginBottom: '2rem' }}>
                            <Paper
                                withBorder
                                p="lg"
                                radius="lg"
                                shadow="sm"
                                style={{
                                    background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                                }}
                            >
                                <form onSubmit={handleUserSearch}>
                                    <TextInput
                                        label="🔍 Tìm kiếm người dùng"
                                        placeholder="Nhập tên, username hoặc email..."
                                        value={userSearchQuery}
                                        onChange={(event) => setUserSearchQuery(event.currentTarget.value)}
                                        size="md"
                                        radius="md"
                                        rightSection={
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '100%' }}>
                                                {userSearchQuery && (
                                                    <ActionIcon
                                                        variant="subtle"
                                                        color="gray"
                                                        onClick={() => {
                                                            setUserSearchQuery('');
                                                            setUserSearchResult([]);
                                                            setUserSearchTotal(0);
                                                        }}
                                                        size="sm"
                                                    >
                                                        <IconX size="0.9rem" />
                                                    </ActionIcon>
                                                )}
                                                <ActionIcon
                                                    type="submit"
                                                    variant="gradient"
                                                    gradient={{ from: 'orange', to: 'red' }}
                                                    size="lg"
                                                    loading={isLoading}
                                                >
                                                    <IconSearch size="1.1rem" />
                                                </ActionIcon>
                                            </div>
                                        }
                                        rightSectionWidth={userSearchQuery ? 80 : 50}
                                        styles={{
                                            input: {
                                                borderRadius: '8px',
                                                border: '2px solid #e9ecef',
                                                transition: 'border-color 0.2s ease',
                                                '&:focus': {
                                                    borderColor: '#fd7e14'
                                                }
                                            }
                                        }}
                                    />
                                </form>
                            </Paper>
                        </div>

                        <div style={{ width: '100%', maxWidth: 1100, margin: '0 auto' }}>
                            {userSearchQuery ? (
                                <UsersTable
                                    data={userSearchResult}
                                    title={`🔎 Kết quả tìm kiếm cho "${userSearchQuery}" (${userSearchTotal} kết quả)`}
                                />
                            ) : (
                                <UsersTable data={users} title="👤 Danh Sách Người Dùng" />
                            )}
                        </div>
                    </div>
                )}

                {/* Thanh tìm kiếm và bảng sách căn giữa, bảng to hơn */}
                <div
                    style={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        maxWidth: 1200,
                        margin: '0 auto',
                        marginBottom: '2rem'
                    }}
                >
                    {/* Thanh tìm kiếm */}
                    <div style={{ width: '100%', maxWidth: 600, marginBottom: 32 }}>
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

                    {/* Bảng sách */}
                    <div style={{ width: '100%', maxWidth: 1100 }}>
                        {searchQuery ? (
                            <BooksTable data={searchResult} title={`🔎 Kết quả tìm kiếm cho "${searchQuery}" (${searchTotal} kết quả)`} />
                        ) : (
                            <BooksTable data={recentBooks} title="📚 Sách Được Cập Nhật Gần Đây" />
                        )}
                    </div>
                </div>
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
                    zIndex={10000}
                    overlayProps={{
                        backgroundOpacity: 0.55,
                        blur: 3,
                        zIndex: 9999
                    }}
                    styles={{
                        root: {
                            zIndex: 10000,
                        },
                        inner: {
                            zIndex: 10000,
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                        },
                        modal: {
                            backgroundColor: 'white',
                            zIndex: 10000,
                            position: 'relative',
                            maxHeight: '90vh',
                            overflow: 'auto',
                            minWidth: '400px'
                        },
                        header: {
                            backgroundColor: '#f8f9fa',
                            borderBottom: '1px solid #dee2e6',
                            padding: '1rem 1.5rem',
                            fontSize: '1.1rem',
                            fontWeight: 600
                        },
                        overlay: {
                            zIndex: 9999,
                            backgroundColor: 'rgba(0, 0, 0, 0.55) !important'
                        }
                    }}
                    portalProps={{
                        target: document.body
                    }}

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

                {/* Modal để Thêm/Sửa Rule */}
                <Modal
                    opened={isRuleModalOpen}
                    onClose={closeRuleModal}
                    title={editingRule ? '✏️ Chỉnh Sửa Qui Định' : '➕ Thêm Qui Định Mới'}
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
                    <RuleForm
                        key={editingRule?.code || 'new-rule-form'}
                        rule={editingRule}
                        onSave={handleSaveRule}
                        onCancel={closeRuleModal}
                    />
                </Modal>

                {/* Modal để Thêm/Sửa User */}
                <Modal
                    opened={isUserModalOpen}
                    onClose={closeUserModal}
                    title={editingUser ? '✏️ Chỉnh Sửa Người Dùng' : '➕ Thêm Người Dùng Mới'}
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
                    <UserForm
                        key={editingUser?._id || 'new-user-form'}
                        user={editingUser}
                        onSave={handleSaveUser}
                        onCancel={closeUserModal}
                    />
                </Modal>

                {/* Modal Xác Nhận Xóa User */}
                <Modal
                    opened={isDeleteUserModalOpen}
                    onClose={closeDeleteUserModal}
                    title="⚠️ Xác Nhận Xóa Người Dùng"
                    centered
                    radius="lg"
                    shadow="xl"
                    zIndex={10000}
                    overlayProps={{
                        backgroundOpacity: 0.55,
                        blur: 3,
                        zIndex: 9999
                    }}
                    styles={{
                        root: {
                            zIndex: 10000,
                        },
                        inner: {
                            zIndex: 10000,
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                        },
                        modal: {
                            backgroundColor: 'white',
                            zIndex: 10000,
                            position: 'relative',
                            maxHeight: '90vh',
                            overflow: 'auto',
                            minWidth: '400px'
                        },
                        header: {
                            backgroundColor: '#f8f9fa',
                            borderBottom: '1px solid #dee2e6',
                            padding: '1rem 1.5rem',
                            fontSize: '1.1rem',
                            fontWeight: 600
                        },
                        overlay: {
                            zIndex: 9999,
                            backgroundColor: 'rgba(0, 0, 0, 0.55) !important'
                        }
                    }}
                    portalProps={{
                        target: document.body
                    }}
                >
                    <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px' }}>
                        <Text size="md" mb="lg">
                            Bạn có chắc chắn muốn xóa người dùng <strong>"{userToDelete?.name}"</strong> không?
                            <br />
                            <Text span c="dimmed" size="sm" mt="xs">
                                Username: {userToDelete?.username} | Email: {userToDelete?.email}
                            </Text>
                            <br />
                            <Text span c="red" size="sm" mt="xs">
                                Hành động này không thể hoàn tác.
                            </Text>
                        </Text>
                    </div>
                    <Group justify="flex-end" gap="md">
                        <Button variant="default" onClick={closeDeleteUserModal} radius="md">
                            Hủy
                        </Button>
                        <Button
                            color="red"
                            onClick={handleDeleteUser}
                            radius="md"
                            variant="gradient"
                            gradient={{ from: 'red', to: 'pink' }}
                        >
                            Xác nhận Xóa
                        </Button>
                    </Group>
                </Modal>

                {/* Modal Xác Nhận Xóa Rule */}
                <Modal
                    opened={isDeleteRuleModalOpen}
                    onClose={closeDeleteRuleModal}
                    title="⚠️ Xác Nhận Xóa Qui Định"
                    centered
                    radius="lg"
                    shadow="xl"
                    zIndex={10000}
                    overlayProps={{
                        backgroundOpacity: 0.55,
                        blur: 3,
                        zIndex: 9999
                    }}
                    styles={{
                        root: {
                            zIndex: 10000,
                        },
                        inner: {
                            zIndex: 10000,
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                        },
                        modal: {
                            backgroundColor: 'white',
                            zIndex: 10000,
                            position: 'relative',
                            maxHeight: '90vh',
                            overflow: 'auto',
                            minWidth: '400px'
                        },
                        header: {
                            backgroundColor: '#f8f9fa',
                            borderBottom: '1px solid #dee2e6',
                            padding: '1rem 1.5rem',
                            fontSize: '1.1rem',
                            fontWeight: 600
                        },
                        overlay: {
                            zIndex: 9999,
                            backgroundColor: 'rgba(0, 0, 0, 0.55) !important'
                        }
                    }}
                    portalProps={{
                        target: document.body
                    }}
                >
                    <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px' }}>
                        <Text size="md" mb="lg">
                            Bạn có chắc chắn muốn xóa qui định <strong>"{ruleToDelete?.code}"</strong> không?
                            <br />
                            <Text span c="dimmed" size="sm" mt="xs">
                                {ruleToDelete?.description}
                            </Text>
                            <br />
                            <Text span c="red" size="sm" mt="xs">
                                Hành động này không thể hoàn tác.
                            </Text>
                        </Text>
                    </div>
                    <Group justify="flex-end" gap="md">
                        <Button variant="default" onClick={closeDeleteRuleModal} radius="md">
                            Hủy
                        </Button>
                        <Button
                            color="red"
                            onClick={() => {
                                handleDeleteRule();
                            }}
                            radius="md"
                            variant="gradient"
                            gradient={{ from: 'red', to: 'pink' }}
                        >
                            Xác nhận Xóa
                        </Button>
                    </Group>
                </Modal>
            </div>
        </div>
    );
};

export default AdminDashboardPage;