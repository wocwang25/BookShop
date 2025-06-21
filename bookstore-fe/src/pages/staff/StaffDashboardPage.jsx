// src/pages/staff/StaffDashboardPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
    Container,
    Title,
    Text,
    SimpleGrid,
    Paper,
    Group,
    ThemeIcon,
    Button,
    Alert,
    Box,
    Divider,
    ActionIcon,
    Tooltip
} from '@mantine/core';
import {
    IconReceipt,
    IconFileInvoice,
    IconCash,
    IconReport,
    IconRefresh,
    IconAlertTriangle,
    IconChevronRight,
    IconSettings,
    IconBell,
    IconCalendar
} from '@tabler/icons-react';
import { useDashboardData } from '../../hooks/useDashboardData';
import StatCard from '../../components/dashboard/StatsOverview';
import DebugPanel from '../../components/dashboard/DebugPanel';

const ActionCard = ({ title, description, to, icon, badge, isDisabled = false }) => (
    <Paper
        component={isDisabled ? 'div' : Link}
        to={!isDisabled ? to : undefined}
        withBorder
        p="lg"
        radius="md"
        shadow="sm"
        sx={{
            '&:hover': !isDisabled ? {
                boxShadow: 'var(--mantine-shadow-md)',
                transform: 'translateY(-1px)',
                transition: 'all 0.2s ease'
            } : {},
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            opacity: isDisabled ? 0.6 : 1,
            transition: 'all 0.2s ease',
            position: 'relative'
        }}
    >
        {badge && (
            <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: 'var(--mantine-color-red-6)',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold'
            }}>
                {badge}
            </div>
        )}

        <Group position="apart">
            <Group>
                <ThemeIcon size="xl" variant="light" color={isDisabled ? 'gray' : undefined}>
                    {icon}
                </ThemeIcon>
                <div>
                    <Text fw={700} mb="xs">{title}</Text>
                    <Text size="sm" c="dimmed">{description}</Text>
                </div>
            </Group>
            {!isDisabled && <IconChevronRight size={20} color="var(--mantine-color-dimmed)" />}
        </Group>
    </Paper>
);

const StaffDashboardPage = () => {
    const { stats, isLoading, error, lastUpdated, refresh } = useDashboardData();

    const actions = [
        {
            title: 'Tạo Phiếu Nhập Sách',
            description: 'Nhập sách mới vào kho hàng.',
            to: '/staff/import',
            icon: <IconReceipt size="1.2rem" />
        },
        {
            title: 'Lập Hóa Đơn Mới',
            description: 'Tạo hóa đơn bán hoặc thuê sách cho khách hàng.',
            to: '/staff/invoice',
            icon: <IconFileInvoice size="1.2rem" />
        },
        {
            title: 'Lập Phiếu Thu Tiền',
            description: 'Ghi nhận thanh toán công nợ từ khách hàng.',
            to: '/staff/payment',
            icon: <IconCash size="1.2rem" />
        },
        {
            title: 'Xem Báo Cáo',
            description: 'Xem báo cáo tồn kho và công nợ hàng tháng.',
            to: '/staff/reports',
            icon: <IconReport size="1.2rem" />,
            badge: stats.find(s => s.title === 'Sách tồn kho thấp')?.value !== '0' ? '!' : null
        },
    ];

    return (
        <Container fluid style={{
            minHeight: '100vh',
            width: '100vw',
            padding: '2rem',
            backgroundImage: 'url("/images/1139490.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            boxSizing: 'border-box',
            overflow: 'auto',
            paddingTop: '90px',
        }}>
            {/* Overlay để làm mờ background */}
            <Box
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(2px)',
                    zIndex: -1
                }}
            />

            <Container size="xl">
                {/* Debug Panel - chỉ hiện trong development */}
                {process.env.NODE_ENV === 'development' && <DebugPanel />}

                {/* Header */}
                <Paper withBorder p="lg" radius="md" mb="xl" shadow="sm">
                    <Group position="apart">
                        <div>
                            <Group spacing="md" mb="xs">
                                <Title order={1}>Bảng Điều Khiển Nhân Viên</Title>
                                <Tooltip label="Cài đặt dashboard">
                                    <ActionIcon variant="light" size="lg">
                                        <IconSettings size="1.2rem" />
                                    </ActionIcon>
                                </Tooltip>
                                <Tooltip label="Thông báo">
                                    <ActionIcon variant="light" size="lg">
                                        <IconBell size="1.2rem" />
                                    </ActionIcon>
                                </Tooltip>
                            </Group>

                            <Group spacing="md">
                                <Group spacing="xs">
                                    <IconCalendar size="1rem" color="var(--mantine-color-dimmed)" />
                                    <Text c="dimmed" fz="sm">
                                        {new Date().toLocaleDateString('vi-VN', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </Text>
                                </Group>

                                {lastUpdated && (
                                    <>
                                        <Divider orientation="vertical" />
                                        <Text c="dimmed" fz="sm">
                                            Cập nhật: {lastUpdated.toLocaleTimeString('vi-VN')}
                                        </Text>
                                    </>
                                )}
                            </Group>
                        </div>

                        <Button
                            leftSection={<IconRefresh size="1rem" />}
                            variant="filled"
                            onClick={refresh}
                            loading={isLoading}
                            size="md"
                        >
                            Làm mới
                        </Button>
                    </Group>
                </Paper>

                {/* Error Alert */}
                {error && (
                    <Alert
                        icon={<IconAlertTriangle size="1rem" />}
                        title={error.includes('mẫu') ? 'Thông báo' : 'Lỗi tải dữ liệu'}
                        color={error.includes('mẫu') ? 'yellow' : 'red'}
                        mb="xl"
                        variant="light"
                        withCloseButton
                    >
                        {error}
                        {error.includes('mẫu') && (
                            <Text size="sm" mt="xs">
                                Dashboard hiện đang sử dụng dữ liệu mẫu. Kiểm tra kết nối API để lấy dữ liệu thực tế.
                            </Text>
                        )}
                    </Alert>
                )}

                {/* Stats Cards */}
                <Title order={3} mb="lg">Thống kê tổng quan</Title>
                <SimpleGrid
                    cols={4}
                    breakpoints={[
                        { maxWidth: 'lg', cols: 2 },
                        { maxWidth: 'sm', cols: 1 }
                    ]}
                    mb="xl"
                >
                    {stats.map((stat, index) =>
                        <StatCard
                            key={index}
                            {...stat}
                            isLoading={isLoading}
                        />
                    )}
                </SimpleGrid>

                {/* Action Cards */}
                <Title order={3} mb="lg">Chức năng chính</Title>
                <SimpleGrid
                    cols={2}
                    breakpoints={[{ maxWidth: 'sm', cols: 1 }]}
                    spacing="lg"
                    mb="xl"
                >
                    {actions.map((action, index) =>
                        <ActionCard key={index} {...action} />
                    )}
                </SimpleGrid>

                {/* Quick Links */}
                {/* <Paper withBorder p="lg" radius="md" shadow="sm">
                    <Group position="apart" mb="md">
                        <Title order={4}>Liên kết nhanh</Title>
                        <Text fz="sm" c="dimmed">Truy cập nhanh các tính năng khác</Text>
                    </Group>
                    
                    <SimpleGrid cols={3} breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
                        <Button 
                            component={Link} 
                            to="/staff/books" 
                            variant="subtle" 
                            size="sm"
                            fullWidth
                        >
                            Quản lý sách
                        </Button>
                        <Button 
                            component={Link} 
                            to="/staff/customers" 
                            variant="subtle" 
                            size="sm"
                            fullWidth
                        >
                            Khách hàng
                        </Button>
                        <Button 
                            component={Link} 
                            to="/staff/settings" 
                            variant="subtle" 
                            size="sm"
                            fullWidth
                        >
                            Cài đặt
                        </Button>
                    </SimpleGrid>
                </Paper> */}
            </Container>
        </Container>
    );
};

export default StaffDashboardPage;