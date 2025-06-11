// src/pages/staff/InvoicePage.jsx
import React, { useState, useEffect } from 'react';
import { API } from '../../api/apiService';
import { Autocomplete, Button, Table, ActionIcon, Group, Title, Paper, Text, Select, NumberInput, Modal, SegmentedControl } from '@mantine/core';
import { IconTrash, IconFileInvoice } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';

// Đây là một ví dụ đơn giản. Bạn cần mở rộng nó thêm.
const InvoicePage = () => {
    // ... State và logic tương tự như ImportPage
    const [invoiceItems, setInvoiceItems] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);

    // TODO: Load customers để hiển thị trong Select
    useEffect(() => {
        // API.customer.getAllCustomers() - bạn cần API này
    }, []);

    // Logic khi tạo hóa đơn
    const handleCreateInvoice = async () => {
        if (!selectedCustomerId || invoiceItems.length === 0) {
            alert("Vui lòng chọn khách hàng và thêm sản phẩm.");
            return;
        }

        // Tách item bán và thuê
        const salesItems = invoiceItems.filter(item => item.type === 'sale');
        const rentalItems = invoiceItems.filter(item => item.type === 'rent');

        try {
            // Gọi API tương ứng
            if (salesItems.length > 0) {
                await API.invoice.createSalesInvoice({ customerId: selectedCustomerId, items: salesItems });
            }
            if (rentalItems.length > 0) {
                await API.invoice.createRentalInvoice({ customerId: selectedCustomerId, items: rentalItems });
            }
            alert("Tạo hóa đơn thành công!");
            // Reset state
        } catch (error) {
            alert("Lỗi khi tạo hóa đơn.");
        }
    };

    // ... Giao diện sẽ tương tự ImportPage, nhưng mỗi item trong bảng sẽ có thêm một Select ('Bán'/'Thuê')
    // và nút "Thêm vào hóa đơn" sẽ mở một Modal để chọn loại và số lượng.

    return (
        <Paper withBorder p="md" radius="md">
            <Title order={2} mb="xl">Tạo Hóa Đơn</Title>
            {/* ... Autocomplete tìm khách hàng, Autocomplete tìm sách ... */}
            <Text mt="lg">Giao diện này cần được phát triển thêm để xử lý logic Bán/Thuê phức tạp.</Text>
            <Button mt="lg" onClick={handleCreateInvoice}>Tạo Hóa Đơn</Button>
        </Paper>
    );
};

export default InvoicePage;