import React, { useState } from 'react';
import { 
    Paper, 
    Text, 
    Group, 
    Button, 
    Collapse,
    Code,
    Badge,
    Stack,
    Divider,
    ActionIcon,
    Tooltip,
    Switch
} from '@mantine/core';
import { 
    IconBug, 
    IconChevronDown, 
    IconChevronUp,
    IconRefresh,
    IconCheck,
    IconX,
    IconClock,
    IconTestPipe
} from '@tabler/icons-react';
import { API } from '../../api/apiService';
import { mockApiService, testMockApis } from '../../services/mockApiService';

const DebugPanel = () => {
    const [opened, setOpened] = useState(false);
    const [apiStatus, setApiStatus] = useState({
        books: 'unknown',
        importSlips: 'unknown',
        inventoryReport: 'unknown'
    });
    const [loading, setLoading] = useState(false);
    const [useMockData, setUseMockData] = useState(false);

    const testApiEndpoint = async (name, apiCall) => {
        try {
            setApiStatus(prev => ({ ...prev, [name]: 'loading' }));
            const result = await apiCall();
            console.log(`${name} API result:`, result);
            setApiStatus(prev => ({ ...prev, [name]: 'success' }));
            return { status: 'success', data: result };
        } catch (error) {
            console.error(`${name} API error:`, error);
            setApiStatus(prev => ({ ...prev, [name]: 'error' }));
            return { status: 'error', error: error.message };
        }
    };

    const testAllApis = async () => {
        setLoading(true);
        
        const apiToUse = useMockData ? mockApiService : API;
        
        const results = await Promise.allSettled([
            testApiEndpoint('books', apiToUse.books.getAllBooks),
            testApiEndpoint('importSlips', apiToUse.import.getAllSlip),
            testApiEndpoint('inventoryReport', apiToUse.reports.getInventoryReport)
        ]);

        console.log('All API test results:', results);
        setLoading(false);
    };

    const testMockOnly = async () => {
        setLoading(true);
        try {
            const results = await testMockApis();
            console.log('Mock API test completed:', results);
        } catch (error) {
            console.error('Mock API test failed:', error);
        }
        setLoading(false);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'success': return <IconCheck size={16} color="green" />;
            case 'error': return <IconX size={16} color="red" />;
            case 'loading': return <IconClock size={16} color="blue" />;
            default: return <IconClock size={16} color="gray" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'success': return 'green';
            case 'error': return 'red';
            case 'loading': return 'blue';
            default: return 'gray';
        }
    };

    return (
        <Paper withBorder p="md" radius="md" mb="lg" style={{ border: '1px dashed #ffa500' }}>
            <Group position="apart" onClick={() => setOpened(!opened)} style={{ cursor: 'pointer' }}>
                <Group spacing="xs">
                    <IconBug size={20} color="#ffa500" />
                    <Text fw={600} color="orange">Debug Panel</Text>
                    <Badge size="sm" color="orange" variant="light">Development</Badge>
                    {useMockData && <Badge size="sm" color="blue" variant="light">Mock Mode</Badge>}
                </Group>
                <Group spacing="xs">
                    <Tooltip label="Test tất cả API">
                        <ActionIcon 
                            onClick={(e) => {
                                e.stopPropagation();
                                testAllApis();
                            }}
                            loading={loading}
                            variant="light"
                        >
                            <IconRefresh size={16} />
                        </ActionIcon>
                    </Tooltip>
                    {opened ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                </Group>
            </Group>

            <Collapse in={opened}>
                <Divider my="md" />
                
                <Stack spacing="md">
                    <div>
                        <Group position="apart" mb="md">
                            <Text fw={600}>Test Configuration</Text>
                            <Switch
                                label="Use Mock Data"
                                checked={useMockData}
                                onChange={(event) => setUseMockData(event.currentTarget.checked)}
                                size="sm"
                            />
                        </Group>
                    </div>

                    <div>
                        <Text fw={600} mb="xs">API Status</Text>
                        <Stack spacing="xs">
                            <Group position="apart">
                                <Group spacing="xs">
                                    {getStatusIcon(apiStatus.books)}
                                    <Text size="sm">Books API</Text>
                                </Group>
                                <Badge size="sm" color={getStatusColor(apiStatus.books)} variant="light">
                                    {apiStatus.books}
                                </Badge>
                            </Group>
                            
                            <Group position="apart">
                                <Group spacing="xs">
                                    {getStatusIcon(apiStatus.importSlips)}
                                    <Text size="sm">Import Slips API</Text>
                                </Group>
                                <Badge size="sm" color={getStatusColor(apiStatus.importSlips)} variant="light">
                                    {apiStatus.importSlips}
                                </Badge>
                            </Group>
                            
                            <Group position="apart">
                                <Group spacing="xs">
                                    {getStatusIcon(apiStatus.inventoryReport)}
                                    <Text size="sm">Inventory Report API</Text>
                                </Group>
                                <Badge size="sm" color={getStatusColor(apiStatus.inventoryReport)} variant="light">
                                    {apiStatus.inventoryReport}
                                </Badge>
                            </Group>
                        </Stack>
                    </div>

                    <div>
                        <Text fw={600} mb="xs">API Configuration</Text>
                        <Code block>
                            {JSON.stringify({
                                baseURL: 'http://localhost:5000/api',
                                token: localStorage.getItem('token') ? 'Present' : 'Missing',
                                currentTime: new Date().toISOString(),
                                mockMode: useMockData
                            }, null, 2)}
                        </Code>
                    </div>

                    <div>
                        <Text fw={600} mb="xs">Quick Actions</Text>
                        <Group spacing="xs">
                            <Button size="xs" variant="outline" onClick={() => console.log('Current state:', localStorage)}>
                                Log Storage
                            </Button>
                            <Button size="xs" variant="outline" onClick={() => console.log('API Client:', API)}>
                                Log API Client
                            </Button>
                            <Button size="xs" variant="outline" onClick={testAllApis} loading={loading}>
                                Test {useMockData ? 'Mock' : 'Real'} APIs
                            </Button>
                            <Button 
                                size="xs" 
                                variant="outline" 
                                color="blue"
                                leftSection={<IconTestPipe size={12} />}
                                onClick={testMockOnly} 
                                loading={loading}
                            >
                                Test Mock APIs
                            </Button>
                        </Group>
                    </div>

                    <div>
                        <Text fw={600} mb="xs">Troubleshooting Tips</Text>
                        <Text size="xs" c="dimmed">
                            • Nếu API thật gặp lỗi, bật "Use Mock Data" để test với dữ liệu mẫu<br/>
                            • Kiểm tra console để xem chi tiết lỗi API<br/>
                            • Đảm bảo backend đang chạy trên localhost:5000<br/>
                            • Kiểm tra token authentication trong localStorage
                        </Text>
                    </div>
                </Stack>
            </Collapse>
        </Paper>
    );
};

export default DebugPanel; 