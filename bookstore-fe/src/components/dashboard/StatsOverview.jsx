import React from 'react';
import { 
    Paper, 
    Text, 
    Group, 
    ThemeIcon, 
    Badge, 
    Stack, 
    Skeleton,
    Progress,
    Tooltip
} from '@mantine/core';
import { 
    IconReceipt, 
    IconFileInvoice, 
    IconCash, 
    IconReport,
    IconTrendingUp,
    IconTrendingDown,
    IconMinus
} from '@tabler/icons-react';

// Icon mapping
const iconMap = {
    receipt: IconReceipt,
    fileInvoice: IconFileInvoice,
    cash: IconCash,
    report: IconReport
};

// Trend icon mapping
const trendIconMap = {
    up: IconTrendingUp,
    down: IconTrendingDown,
    stable: IconMinus
};

const StatCard = ({ 
    title, 
    value, 
    icon, 
    color, 
    isLoading, 
    trend, 
    trendValue,
    description,
    progress,
    target
}) => {
    const IconComponent = iconMap[icon] || iconMap.report;
    const TrendIcon = trendIconMap[trend] || IconMinus;

    if (isLoading) {
        return (
            <Paper withBorder p="lg" radius="md" shadow="sm">
                <Stack spacing="xs">
                    <Skeleton height={12} width="70%" />
                    <Skeleton height={24} width="40%" />
                    <Skeleton height={8} width="90%" />
                </Stack>
            </Paper>
        );
    }

    return (
        <Paper 
            withBorder 
            p="lg" 
            radius="md" 
            shadow="sm" 
            sx={{ 
                '&:hover': { 
                    transform: 'translateY(-2px)',
                    boxShadow: 'var(--mantine-shadow-lg)',
                    transition: 'all 0.3s ease'
                },
                transition: 'all 0.3s ease',
                cursor: 'default'
            }}
        >
            <Group position="apart" mb="md">
                <div style={{ flex: 1 }}>
                    <Text color="dimmed" tt="uppercase" fw={700} fz="xs" mb="xs">
                        {title}
                    </Text>
                    <Text fw={700} fz="xl" mb="xs">
                        {value}
                    </Text>
                    {description && (
                        <Text fz="xs" c="dimmed" mb="xs">
                            {description}
                        </Text>
                    )}
                </div>
                <ThemeIcon color={color} variant="light" size={48} radius="md">
                    <IconComponent size="1.5rem" />
                </ThemeIcon>
            </Group>

            {/* Progress bar nếu có target */}
            {progress !== undefined && target && (
                <div style={{ marginBottom: '0.5rem' }}>
                    <Group position="apart" mb="xs">
                        <Text fz="xs" c="dimmed">Tiến độ</Text>
                        <Text fz="xs" c="dimmed">{progress}%</Text>
                    </Group>
                    <Progress 
                        value={progress} 
                        color={progress >= 80 ? 'green' : progress >= 50 ? 'yellow' : 'red'}
                        size="sm" 
                        radius="xl"
                    />
                    <Text fz="xs" c="dimmed" mt="xs">
                        Mục tiêu: {target}
                    </Text>
                </div>
            )}

            {/* Trend indicator */}
            {trend && trendValue && (
                <Group spacing="xs">
                    <Tooltip label={`Xu hướng ${trend === 'up' ? 'tăng' : trend === 'down' ? 'giảm' : 'ổn định'}`}>
                        <Badge 
                            size="sm" 
                            variant="light" 
                            color={trend === 'up' ? 'green' : trend === 'down' ? 'red' : 'gray'}
                            leftSection={<TrendIcon size={12} />}
                        >
                            {trendValue}
                        </Badge>
                    </Tooltip>
                    <Text fz="xs" c="dimmed">so với tháng trước</Text>
                </Group>
            )}
        </Paper>
    );
};

export default StatCard; 