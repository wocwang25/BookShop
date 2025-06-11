// src/pages/staff/ImportPage.jsx
import React, { useState, useEffect } from 'react';
import { API } from '../../api/apiService';
import { useForm } from '@mantine/form';
import { Autocomplete, NumberInput, Button, Table, ActionIcon, Group, Title, Paper, Text, Notification, Loader } from '@mantine/core';
import { IconTrash, IconFileImport, IconCheck, IconX } from '@tabler/icons-react';

const ImportPage = () => {
    const [allBooks, setAllBooks] = useState([]); // Danh sách sách gốc để tìm kiếm
    const [importList, setImportList] = useState([]); // Danh sách sách trong phiếu nhập tạm thời
    const [notification, setNotification] = useState({ show: false, message: '', color: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form để tìm và thêm sách
    const form = useForm({
        initialValues: { bookId: '', title: '' },
    });

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

    const showNotification = (message, color) => {
        setNotification({ show: true, message, color });
        setTimeout(() => setNotification({ show: false, message: '', color: '' }), 4000);
    };

    const handleAddToList = (selectedItem) => {
        if (!selectedItem) return;

        const bookToAdd = allBooks.find(b => b.value === selectedItem.value);

        if (bookToAdd && !importList.find(item => item._id === bookToAdd._id)) {
            // Theo QĐ1, mặc định số lượng nhập là 150
            setImportList([...importList, { ...bookToAdd, importQuantity: 150 }]);
        }
        form.reset(); // Reset form sau khi thêm
    };

    const handleQuantityChange = (bookId, quantity) => {
        setImportList(importList.map(item =>
            item._id === bookId ? { ...item, importQuantity: quantity || 0 } : item
        ));
    };

    const handleRemoveFromList = (bookId) => {
        setImportList(importList.filter(item => item._id !== bookId));
    };

    // Hàm gọi API tạo phiếu nhập
    const handleCreateImportSlip = async () => {
        if (importList.length === 0) {
            showNotification("Vui lòng thêm ít nhất một sách vào danh sách.", "orange");
            return;
        }

        setIsSubmitting(true);
        try {
            const slipData = {
                items: importList.map(item => ({
                    book: item._id, // API của bạn có thể cần 'bookId' thay vì 'book'
                    quantity: item.importQuantity,
                })),
                importDate: new Date(),
            };

            // Sử dụng API từ apiService.jsx
            await API.import.importBook(slipData);

            showNotification("Tạo phiếu nhập thành công!", "teal");
            setImportList([]); // Xóa danh sách sau khi thành công
        } catch (error) {
            showNotification(error.response?.data?.message || "Lỗi khi tạo phiếu nhập.", "red");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Hiển thị danh sách sách trong bảng
    const rows = importList.map((book) => (
        <tr key={book._id}>
            <td>{book.label}</td>
            <td>{book.author?.name}</td>
            <td><NumberInput value={book.importQuantity} onChange={(val) => handleQuantityChange(book._id, val)} min={1} step={10} style={{ width: 100 }} /></td>
            <td><ActionIcon color="red" onClick={() => handleRemoveFromList(book._id)}><IconTrash size="1rem" /></ActionIcon></td>
        </tr>
    ));

    return (
        <Paper withBorder p="md" radius="md">
            {notification.show && (
                <Notification icon={notification.color === 'red' ? <IconX /> : <IconCheck />} color={notification.color} onClose={() => setNotification({ show: false })} pos="fixed" top={20} right={20} zIndex={1000}>
                    {notification.message}
                </Notification>
            )}

            <Title order={2} mb="xl">Tạo Phiếu Nhập Sách</Title>
            <Group align="flex-end">
                <Autocomplete
                    label="Tìm kiếm sách để nhập"
                    placeholder="Gõ tên sách..."
                    data={allBooks}
                    onItemSubmit={handleAddToList}
                    {...form.getInputProps('title')}
                    style={{ flex: 1 }}
                />
            </Group>

            <Title order={4} mt="xl" mb="md">Sách trong phiếu nhập</Title>
            <div style={{ minHeight: 200 }}>
                <Table striped highlightOnHover>
                    <thead><tr><th>Tên sách</th><th>Tác giả</th><th>Số lượng nhập</th><th>Xóa</th></tr></thead>
                    <tbody>{rows.length > 0 ? rows : <tr><td colSpan={4}><Text color="dimmed" align="center">Chưa có sách nào.</Text></td></tr>}</tbody>
                </Table>
            </div>

            <Group position="right" mt="xl">
                <Button
                    leftIcon={<IconFileImport size="1rem" />}
                    onClick={handleCreateImportSlip}
                    loading={isSubmitting}
                    disabled={importList.length === 0}
                >
                    Xác Nhận Tạo Phiếu Nhập
                </Button>
            </Group>
        </Paper>
    );
};

export default ImportPage;