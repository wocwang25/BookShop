// src/pages/staff/PaymentPage.jsx
import React, { useState, useEffect } from 'react';
import { API } from '../../api/apiService';
import { Autocomplete, NumberInput, Button, Title, Paper, Text, Group } from '@mantine/core';
import { IconCash } from '@tabler/icons-react';

const PaymentPage = () => {
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [amount, setAmount] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Cần API lấy danh sách tất cả khách hàng
        // API.customer.getAll().then(res => setCustomers(res.data...));
    }, []);

    const handleSelectCustomer = (item) => {
        const customer = customers.find(c => c.value === item.value);
        setSelectedCustomer(customer);
    };

    const handleCreateReceipt = async () => {
        if (!selectedCustomer || amount <= 0) {
            alert("Vui lòng chọn khách hàng và nhập số tiền hợp lệ.");
            return;
        }

        // Theo QĐ4: Kiểm tra số tiền thu không vượt quá công nợ
        if (amount > selectedCustomer.outstandingDebt) {
            alert("Số tiền thu không được vượt quá công nợ của khách hàng.");
            return;
        }

        setLoading(true);
        try {
            await API.payment.createPaymentReceipt({
                customerId: selectedCustomer._id,
                amountPaid: amount,
            });
            alert("Tạo phiếu thu thành công!");
            // Cập nhật lại công nợ hoặc reset
        } catch (error) {
            alert("Lỗi khi tạo phiếu thu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper withBorder p="md" radius="md" style={{ maxWidth: 600, margin: 'auto' }}>
            <Title order={2} mb="xl">Lập Phiếu Thu Tiền</Title>
            <Autocomplete
                label="Chọn khách hàng"
                placeholder="Tìm theo tên hoặc email..."
                data={customers /* Dữ liệu từ API */}
                onItemSubmit={handleSelectCustomer}
            />
            {selectedCustomer && (
                <div style={{ marginTop: '20px' }}>
                    <Text>Khách hàng: <strong>{selectedCustomer.label}</strong></Text>
                    <Text>Công nợ hiện tại: <strong style={{ color: 'red' }}>{selectedCustomer.outstandingDebt?.toLocaleString()} ₫</strong></Text>
                    <NumberInput
                        mt="md"
                        label="Số tiền thu"
                        value={amount}
                        onChange={setAmount}
                        min={0}
                        max={selectedCustomer.outstandingDebt}
                        step={10000}
                        required
                    />
                </div>
            )}
            <Group position="right" mt="xl">
                <Button
                    leftIcon={<IconCash size="1rem" />}
                    onClick={handleCreateReceipt}
                    loading={loading}
                    disabled={!selectedCustomer || amount <= 0}
                >
                    Xác nhận
                </Button>
            </Group>
        </Paper>
    );
};
export default PaymentPage;