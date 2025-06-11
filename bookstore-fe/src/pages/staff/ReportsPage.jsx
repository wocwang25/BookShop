// src/pages/staff/ReportsPage.jsx
import React, { useState } from 'react';
import { API } from '../../api/apiService';
import { Select, Button, Group, Title, Paper, Table, Text } from '@mantine/core';

const ReportsPage = () => {
    const [reportType, setReportType] = useState('inventory');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleFetchReport = async () => {
        setLoading(true);
        setData([]);
        try {
            let response;
            if (reportType === 'inventory') {
                response = await API.reports.getInventoryReport();
            } else if (reportType === 'debt') {
                response = await API.reports.getDebtReport();
            }
            setData(response.data); // Giả sử API trả về mảng dữ liệu
        } catch (error) {
            alert("Không thể tải báo cáo.");
        } finally {
            setLoading(false);
        }
    };

    const inventoryRows = data.map((item) => (
        <tr key={item.book._id}>
            <td>{item.book.title}</td><td>{item.initialStock}</td><td>{item.change}</td><td>{item.finalStock}</td>
        </tr>
    ));

    const debtRows = data.map((item) => (
        <tr key={item.customer._id}>
            <td>{item.customer.name}</td><td>{item.initialDebt}</td><td>{item.change}</td><td>{item.finalDebt}</td>
        </tr>
    ));

    return (
        <Paper withBorder p="md" radius="md">
            <Title order={2} mb="xl">Xem Báo Cáo Tháng</Title>
            <Group>
                <Select
                    label="Loại báo cáo"
                    data={[
                        { value: 'inventory', label: 'Báo cáo tồn kho' },
                        { value: 'debt', label: 'Báo cáo công nợ' },
                    ]}
                    value={reportType}
                    onChange={setReportType}
                />
                {/* TODO: Thêm Select cho Tháng và Năm */}
                <Button onClick={handleFetchReport} loading={loading} mt="xl">Xem báo cáo</Button>
            </Group>

            <div style={{ marginTop: 30 }}>
                {reportType === 'inventory' && (
                    <Table>
                        <thead><tr><th>Sách</th><th>Tồn đầu</th><th>Phát sinh</th><th>Tồn cuối</th></tr></thead>
                        <tbody>{inventoryRows}</tbody>
                    </Table>
                )}
                {reportType === 'debt' && (
                    <Table>
                        <thead><tr><th>Khách hàng</th><th>Nợ đầu</th><th>Phát sinh</th><th>Nợ cuối</th></tr></thead>
                        <tbody>{debtRows}</tbody>
                    </Table>
                )}
                {!loading && data.length === 0 && <Text mt="md" c="dimmed">Chưa có dữ liệu.</Text>}
            </div>
        </Paper>
    );
};

export default ReportsPage;