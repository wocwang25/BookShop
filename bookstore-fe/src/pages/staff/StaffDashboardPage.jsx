// src/pages/staff/StaffDashboardPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Title, Text, SimpleGrid, Paper, Group, ThemeIcon } from '@mantine/core';
import { IconReceipt, IconFileInvoice, IconCash, IconReport } from '@tabler/icons-react';

const StatCard = ({ title, value, icon, color }) => (
    <Paper withBorder p="md" radius="md">
        <Group position="apart">
            <div>
                <Text color="dimmed" tt="uppercase" fw={700} fz="xs">
                    {title}
                </Text>
                <Text fw={700} fz="xl">
                    {value}
                </Text>
            </div>
            <ThemeIcon color={color} variant="light" size={38} radius="md">
                {icon}
            </ThemeIcon>
        </Group>
    </Paper>
);

const ActionCard = ({ title, description, to, icon }) => (
    <Paper component={Link} to={to} withBorder p="md" radius="md" shadow="sm" sx={{ '&:hover': { boxShadow: 'var(--mantine-shadow-md)' } }}>
        <Group>
            <ThemeIcon size="lg" variant="light">
                {icon}
            </ThemeIcon>
            <div>
                <Text fw={700}>{title}</Text>
                <Text size="sm" c="dimmed">{description}</Text>
            </div>
        </Group>
    </Paper>
);


const StaffDashboardPage = () => {
    // Trong thực tế, bạn sẽ gọi API để lấy các con số này
    const stats = [
        { title: 'Sách đã nhập tháng này', value: '1,205', icon: <IconReceipt size="1.2rem" />, color: 'blue' },
        { title: 'Hóa đơn đã tạo', value: '86', icon: <IconFileInvoice size="1.2rem" />, color: 'teal' },
        { title: 'Tổng thu trong ngày', value: '15,750,000 ₫', icon: <IconCash size="1.2rem" />, color: 'grape' },
        { title: 'Sách tồn kho dưới 20', value: '12', icon: <IconReport size="1.2rem" />, color: 'orange' },
    ];

    const actions = [
        { title: 'Tạo Phiếu Nhập Sách', description: 'Nhập sách mới vào kho hàng.', to: '/staff/import', icon: <IconReceipt /> },
        { title: 'Lập Hóa Đơn Mới', description: 'Tạo hóa đơn bán hoặc thuê sách cho khách hàng.', to: '/staff/invoice', icon: <IconFileInvoice /> },
        { title: 'Lập Phiếu Thu Tiền', description: 'Ghi nhận thanh toán công nợ từ khách hàng.', to: '/staff/payment', icon: <IconCash /> },
        { title: 'Xem Báo Cáo', description: 'Xem báo cáo tồn kho và công nợ hàng tháng.', to: '/staff/reports', icon: <IconReport /> },
    ];

    return (
        <Container fluid style={{
            minHeight: '100vh',
            width: '100vw',
            padding: '1rem',
            backgroundColor: '#f8f9fa',
            boxSizing: 'border-box',
            overflow: 'auto',
            paddingTop: '70px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        }}>
            <Title order={2} mb="lg" ta='center'>Bảng Điều Khiển Nhân Viên</Title>

            <SimpleGrid cols={4} breakpoints={[{ maxWidth: 'md', cols: 2 }, { maxWidth: 'xs', cols: 1 }]}>
                {stats.map((stat, index) => <StatCard key={index} {...stat} />)}
            </SimpleGrid>

            <Title order={3} my="xl">Chức năng chính</Title>

            <SimpleGrid cols={2} breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
                {actions.map((action, index) => <ActionCard key={index} {...action} />)}
            </SimpleGrid>

        </Container>
    );
};

export default StaffDashboardPage;