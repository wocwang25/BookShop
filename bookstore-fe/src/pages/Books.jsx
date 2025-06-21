import React, { useState, useEffect } from 'react';
import {
    Container,
    Title,
    Text,
    TextInput,
    Grid,
    Card,
    Image,
    Group,
    Badge,
    Button,
    LoadingOverlay,
    Center,
    Stack,
    Pagination,
    Box,
    ActionIcon,
    Tooltip,
    Paper,
    Divider,
    Checkbox,
    Flex,
    SimpleGrid,
    Modal,
    ScrollArea,
    Rating
} from '@mantine/core';
import { IconSearch, IconHeart, IconShoppingCart, IconEye, IconFilter, IconX, IconCalendar, IconTag, IconUser, IconCurrencyDong, IconBook, IconBarcode, IconClock, IconDatabase, IconEdit } from '@tabler/icons-react';
import { booksAPI, categoriesAPI, cartAPI, favouriteAPI } from '../api/apiService';
import { useAuth } from '../contexts/AuthContext';
import { notifications } from '@mantine/notifications';

const Books = () => {
    const { isAuthenticated } = useAuth();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [categories, setCategories] = useState([]);
    const [selectedBook, setSelectedBook] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const booksPerPage = 12;

    // Fetch all books and categories
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                console.log('Fetching books and categories...');

                // Fetch books and categories in parallel
                const [booksResponse, categoriesResponse] = await Promise.all([
                    booksAPI.getAllBooks(),
                    categoriesAPI.getAllCategories()
                ]);

                console.log('Books response:', booksResponse.data);
                console.log('Categories response:', categoriesResponse.data);

                // Set books data
                const booksData = booksResponse.data?.books || booksResponse.data || [];
                setBooks(booksData);
                setFilteredBooks(booksData);

                // Set categories data
                const categoriesData = categoriesResponse.data || [];
                setCategories(categoriesData.map(cat => cat.name));

            } catch (error) {
                console.error('Error fetching data:', error);
                notifications.show({
                    title: 'Lỗi',
                    message: 'Không thể tải dữ liệu. Vui lòng thử lại sau.',
                    color: 'red'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Apply filters
    useEffect(() => {
        console.log('Applying filters...', { searchQuery, selectedCategories, priceRange });
        let filtered = books;

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(book =>
                book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                book.author?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                book.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Category filter
        if (selectedCategories.length > 0) {
            filtered = filtered.filter(book =>
                selectedCategories.includes(book.category?.name)
            );
        }

        // Price range filter
        if (priceRange.min || priceRange.max) {
            filtered = filtered.filter(book => {
                const price = book.price || 0;
                const min = priceRange.min ? parseFloat(priceRange.min) : 0;
                const max = priceRange.max ? parseFloat(priceRange.max) : Infinity;
                return price >= min && price <= max;
            });
        }

        setFilteredBooks(filtered);
        setCurrentPage(1);
    }, [searchQuery, selectedCategories, priceRange, books]);

    // Pagination logic
    const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
    const startIndex = (currentPage - 1) * booksPerPage;
    const currentBooks = filteredBooks.slice(startIndex, startIndex + booksPerPage);

    // Format price in Vietnamese currency
    const formatPrice = (price) => {
        if (!price) return 'Liên hệ';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    // Handle category filter
    const handleCategoryChange = (category, checked) => {
        if (checked) {
            setSelectedCategories([...selectedCategories, category]);
        } else {
            setSelectedCategories(selectedCategories.filter(cat => cat !== category));
        }
    };

    // Clear all filters
    const clearFilters = () => {
        setSelectedCategories([]);
        setPriceRange({ min: '', max: '' });
        setSearchQuery('');
    };

    const handleAddToCart = async (bookId) => {
        if (!isAuthenticated) {
            notifications.show({
                title: 'Yêu cầu đăng nhập',
                message: 'Vui lòng đăng nhập để thêm sách vào giỏ hàng',
                color: 'orange'
            });
            return;
        }

        try {
            await cartAPI.addToCart({ bookId, quantity: 1 });
            notifications.show({
                title: 'Thành công',
                message: 'Đã thêm sách vào giỏ hàng',
                color: 'green'
            });
        } catch (error) {
            console.error('Error adding to cart:', error);
            notifications.show({
                title: 'Lỗi',
                message: error.response?.data?.message || 'Không thể thêm sách vào giỏ hàng',
                color: 'red'
            });
        }
    };

    const handleAddToFavorites = async (bookId) => {
        if (!isAuthenticated) {
            notifications.show({
                title: 'Yêu cầu đăng nhập',
                message: 'Vui lòng đăng nhập để thêm sách vào danh sách yêu thích',
                color: 'orange'
            });
            return;
        }

        try {
            await favouriteAPI.addToFavourite(bookId);
            notifications.show({
                title: 'Thành công',
                message: 'Đã thêm sách vào danh sách yêu thích',
                color: 'green'
            });
        } catch (error) {
            console.error('Error adding to favorites:', error);
            notifications.show({
                title: 'Lỗi',
                message: error.response?.data?.message || 'Không thể thêm sách vào danh sách yêu thích',
                color: 'red'
            });
        }
    };

    // Handle view book details
    const handleViewDetails = async (book) => {
        try {
            setModalLoading(true);
            setIsModalOpen(true);

            // Fetch detailed book information
            const response = await booksAPI.getBookById(book._id);
            console.log('thông tin chi tiết sách: ', response.data.book)
            setSelectedBook(response.data.book);
        } catch (error) {
            console.error('Error fetching book details:', error);
            // Fall back to using the basic book info
            setSelectedBook(book);
            notifications.show({
                title: 'Cảnh báo',
                message: 'Không thể tải chi tiết sách, hiển thị thông tin cơ bản',
                color: 'yellow'
            });
        } finally {
            setModalLoading(false);
        }
    };

    // Close modal
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedBook(null);
    };

    console.log('Rendering Books component', { books, filteredBooks, currentBooks });

    return (
        <div
            style={{
                minHeight: '100vh',
                width: '100vw',
                overflowX: 'hidden',
                background: '#f8f9fa',
                backgroundImage: 'url("/images/1139490.png")', // <-- Đúng cú pháp
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                position: 'absolute',
                inset: 0,
                zIndex: 0
            }}>

            {/* Hero Section */}
            <div
                style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0)', // nền trắng trong suốt
                    // backdropFilter: 'blur(4px)',         // hiệu ứng mờ nền phía sau
                    padding: '80px 0 40px 0'
                }}
            >
                <Container size="xl" py="xl">
                    <Flex gap="md" align="flex-start">
                        {/* Sidebar Filter Panel */}
                        <Paper
                            shadow="sm"
                            p="md"
                            radius="md"
                            style={{
                                width: '280px',
                                maxHeight: 'calc(100vh - 120px)',
                                position: 'sticky',
                                top: '80px',
                                overflow: 'hidden'
                            }}
                        >
                            <Group justify="space-between" mb="md">
                                <Group spacing="xs">
                                    <IconFilter size={20} />
                                    <Title order={4}>Bộ lọc</Title>
                                </Group>
                                <Button variant="subtle" size="xs" onClick={clearFilters}>
                                    Xóa tất cả
                                </Button>
                            </Group>

                            <Divider mb="md" />

                            {/* Category Filter */}
                            <Stack spacing="sm" mb="lg">
                                <Text fw={600} size="sm" c="dark">
                                    Thể loại
                                </Text>
                                <ScrollArea h={Math.min(categories.length * 32 + 20, 300)} type="auto">
                                    <Stack spacing="xs" pr="sm">
                                        {categories.map((category) => (
                                            <Checkbox
                                                key={category}
                                                label={category}
                                                checked={selectedCategories.includes(category)}
                                                onChange={(event) =>
                                                    handleCategoryChange(category, event.currentTarget.checked)
                                                }
                                                size="sm"
                                            />
                                        ))}
                                    </Stack>
                                </ScrollArea>
                            </Stack>

                            <Divider mb="md" />

                            {/* Price Range Filter */}
                            <Stack spacing="sm">
                                <Text fw={600} size="sm" c="dark">
                                    Khoảng giá
                                </Text>
                                <Group grow>
                                    <TextInput
                                        placeholder="Từ"
                                        value={priceRange.min}
                                        onChange={(event) =>
                                            setPriceRange({ ...priceRange, min: event.currentTarget.value })
                                        }
                                        size="sm"
                                    />
                                    <TextInput
                                        placeholder="Đến"
                                        value={priceRange.max}
                                        onChange={(event) =>
                                            setPriceRange({ ...priceRange, max: event.currentTarget.value })
                                        }
                                        size="sm"
                                    />
                                </Group>
                            </Stack>
                        </Paper>

                        {/* Main Content Area */}
                        <Box style={{ flex: 1 }}>
                            {/* Header with Search */}
                            <Paper shadow="xs" p="md" radius="md" mb="lg">
                                <Stack spacing="md">
                                    <Group justify="space-between" align="center">
                                        <Box>
                                            <Title order={2} size="h2" fw={700}>
                                                Tất Cả Sách
                                            </Title>
                                            <Text size="sm" c="dimmed">
                                                Tìm thấy {filteredBooks.length} cuốn sách
                                            </Text>
                                        </Box>
                                    </Group>

                                    {/* Search Bar */}
                                    <TextInput
                                        placeholder="Tìm kiếm theo tên sách, tác giả, thể loại..."
                                        leftSection={<IconSearch size={16} />}
                                        value={searchQuery}
                                        onChange={(event) => setSearchQuery(event.currentTarget.value)}
                                        size="md"
                                        radius="md"
                                        style={{ maxWidth: '600px' }}
                                    />
                                </Stack>
                            </Paper>

                            {/* Books Grid */}
                            <Box pos="relative" mb="lg">
                                <LoadingOverlay visible={loading} overlayProps={{ radius: "sm", blur: 2 }} />

                                {currentBooks.length === 0 && !loading ? (
                                    <Paper p="xl" radius="md" withBorder>
                                        <Center>
                                            <Stack align="center" spacing="md">
                                                <Text size="lg" c="dimmed">
                                                    Không tìm thấy sách nào phù hợp
                                                </Text>
                                                <Button variant="light" onClick={clearFilters}>
                                                    Xóa bộ lọc
                                                </Button>
                                            </Stack>
                                        </Center>
                                    </Paper>
                                ) : (
                                    <SimpleGrid
                                        cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
                                        spacing="md"
                                    >
                                        {currentBooks.map((book) => (
                                            <Card
                                                key={book._id}
                                                shadow="sm"
                                                padding="lg"
                                                radius="md"
                                                withBorder
                                                style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                                            >
                                                {/* Book Image */}
                                                <Card.Section>
                                                    <Image
                                                        src={book.imageUrl || '/images/default_image.jpg'}
                                                        height={200}
                                                        alt={book.title}
                                                        fit="cover"
                                                    />
                                                </Card.Section>

                                                {/* Book Info */}
                                                <Stack spacing="xs" style={{ flex: 1 }} mt="md">
                                                    <Title order={5} lineClamp={2}>
                                                        {book.title}
                                                    </Title>

                                                    <Text size="sm" c="dimmed">
                                                        {book.author?.name || 'Chưa rõ tác giả'}
                                                    </Text>

                                                    <Badge color="blue" variant="light" size="sm" w="fit-content">
                                                        {book.category?.name || 'Chưa phân loại'}
                                                    </Badge>

                                                    {book.publicationYear && (
                                                        <Text size="xs" c="dimmed">
                                                            Năm: {book.publicationYear}
                                                        </Text>
                                                    )}

                                                    <Text size="lg" fw={700} c="blue">
                                                        {formatPrice(book.price)}
                                                    </Text>

                                                    {book.description && (
                                                        <Text size="sm" c="dimmed" lineClamp={2}>
                                                            {book.description}
                                                        </Text>
                                                    )}
                                                </Stack>

                                                {/* Action Buttons */}
                                                <Group justify="space-between" mt="md">
                                                    <Group spacing="xs">
                                                        <Tooltip label="Thêm vào yêu thích">
                                                            <ActionIcon
                                                                variant="light"
                                                                color="red"
                                                                onClick={() => handleAddToFavorites(book._id)}
                                                            >
                                                                <IconHeart size={16} />
                                                            </ActionIcon>
                                                        </Tooltip>
                                                        <Tooltip label="Xem chi tiết">
                                                            <ActionIcon
                                                                variant="light"
                                                                color="blue"
                                                                onClick={() => handleViewDetails(book)}
                                                            >
                                                                <IconEye size={16} />
                                                            </ActionIcon>
                                                        </Tooltip>
                                                    </Group>

                                                    <Button
                                                        leftSection={<IconShoppingCart size={16} />}
                                                        size="sm"
                                                        onClick={() => handleAddToCart(book._id)}
                                                        variant="filled"
                                                    >
                                                        Thêm vào giỏ
                                                    </Button>
                                                </Group>
                                            </Card>
                                        ))}
                                    </SimpleGrid>
                                )}
                            </Box>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <Paper p="md" radius="md" withBorder>
                                    <Center>
                                        <Pagination
                                            value={currentPage}
                                            onChange={setCurrentPage}
                                            total={totalPages}
                                            size="md"
                                            radius="md"
                                        />
                                    </Center>
                                </Paper>
                            )}
                        </Box>
                    </Flex>
                </Container>

            </div>

            {/* Book Details Modal */}
            <Modal
                opened={isModalOpen}
                onClose={closeModal}
                title={
                    <Group gap="sm">
                        <IconDatabase size={20} />
                        <Text fw={600}>Thông tin chi tiêt</Text>
                    </Group>
                }
                size="xl"
                centered
                overlayProps={{
                    backgroundOpacity: 0.55,
                    blur: 3,
                }}
            >
                {selectedBook && (
                    <ScrollArea h={700}>
                        <LoadingOverlay visible={modalLoading} overlayProps={{ radius: "sm", blur: 2 }} />

                        <Stack gap="lg">
                            {/* Book Image and Basic Info */}
                            <Group align="flex-start" gap="lg">
                                <Image
                                    src={selectedBook.imageUrl || '/images/default_image.jpg'}
                                    alt={selectedBook.title}
                                    width={220}
                                    height={300}
                                    fit="cover"
                                    radius="md"
                                    fallbackSrc="/images/default_image.jpg"
                                />

                                <Stack gap="md" style={{ flex: 1 }}>
                                    <Title order={2} lineClamp={3}>
                                        {selectedBook.title}
                                    </Title>

                                    {/* System Information for Staff */}
                                    <Paper withBorder p="sm" radius="md" bg="gray.0">
                                        <Stack gap="xs">
                                            <Text fw={600} size="sm" c="blue">
                                                Thông tin hệ thống
                                            </Text>

                                            <Group gap="xs">
                                                <IconBarcode size={16} color="gray" />
                                                <Text size="sm" c="dimmed">
                                                    <strong>ID:</strong> {selectedBook._id}
                                                </Text>
                                            </Group>

                                            {selectedBook.createdAt && (
                                                <Group gap="xs">
                                                    <IconClock size={16} color="gray" />
                                                    <Text size="sm" c="dimmed">
                                                        <strong>Ngày tạo:</strong> {new Date(selectedBook.createdAt).toLocaleString('vi-VN')}
                                                    </Text>
                                                </Group>
                                            )}

                                            {selectedBook.updatedAt && (
                                                <Group gap="xs">
                                                    <IconEdit size={16} color="gray" />
                                                    <Text size="sm" c="dimmed">
                                                        <strong>Cập nhật:</strong> {new Date(selectedBook.updatedAt).toLocaleString('vi-VN')}
                                                    </Text>
                                                </Group>
                                            )}
                                        </Stack>
                                    </Paper>

                                    {/* Basic Book Information */}
                                    <Paper withBorder p="sm" radius="md">
                                        <Stack gap="xs">
                                            <Text fw={600} size="sm" c="dark">
                                                Thông tin cơ bản
                                            </Text>

                                            <Group gap="xs">
                                                <IconUser size={16} color="gray" />
                                                <Text size="sm" c="dimmed">
                                                    <strong>Tác giả:</strong> {selectedBook.author?.name || selectedBook.author || 'Chưa rõ'}
                                                </Text>
                                            </Group>

                                            <Group gap="xs" align="center">
                                                <IconTag size={16} color="gray" />
                                                <Text size="sm" c="dimmed">
                                                    <strong>Thể loại:</strong>
                                                </Text>
                                                <Badge color="blue" variant="light">
                                                    {selectedBook.category?.name || selectedBook.category || 'Chưa phân loại'}
                                                </Badge>
                                            </Group>

                                            {selectedBook.publicationYear && (
                                                <Group gap="xs">
                                                    <IconCalendar size={16} color="gray" />
                                                    <Text size="sm" c="dimmed">
                                                        <strong>Năm xuất bản:</strong> {selectedBook.publicationYear}
                                                    </Text>
                                                </Group>
                                            )}

                                            {selectedBook.manufacturer && (
                                                <Group gap="xs">
                                                    <IconBook size={16} color="gray" />
                                                    <Text size="sm" c="dimmed">
                                                        <strong>Nhà xuất bản:</strong> {selectedBook.manufacturer}
                                                    </Text>
                                                </Group>
                                            )}

                                            <Group gap="xs">
                                                <IconCurrencyDong size={16} color="gray" />
                                                <Text size="lg" fw={700} c="blue">
                                                    <strong>Giá bán:</strong> {formatPrice(selectedBook.price)}
                                                </Text>
                                            </Group>
                                        </Stack>
                                    </Paper>

                                    {/* Inventory Information */}
                                    <Paper withBorder p="sm" radius="md" bg={selectedBook.quantity > 0 ? "green.0" : "red.0"}>
                                        <Stack gap="xs">
                                            <Text fw={600} size="sm" c={selectedBook.quantity > 0 ? "green" : "red"}>
                                                Thông tin kho
                                            </Text>

                                            <Text size="md" fw={600} c={selectedBook.quantity > 0 ? "green" : "red"}>
                                                {selectedBook.quantity !== undefined
                                                    ? (selectedBook.quantity >= 0
                                                        ? `✓ Còn ${selectedBook.quantity} cuốn trong kho`
                                                        : "⚠ Tạm hết hàng")
                                                    : "❓ Chưa có thông tin kho"
                                                }
                                            </Text>

                                            {selectedBook.quantity > 0 && (
                                                <Text size="xs" c="dimmed">
                                                    Trạng thái: Có sẵn để bán/cho thuê
                                                </Text>
                                            )}
                                        </Stack>
                                    </Paper>
                                </Stack>
                            </Group>

                            <Divider />

                            {/* Detailed Description */}
                            <Stack gap="sm">
                                <Title order={4}>Mô tả chi tiết</Title>
                                <Paper withBorder p="md" radius="md">
                                    <Text size="sm" style={{ lineHeight: 1.6, textAlign: 'justify' }}>
                                        {selectedBook.description || 'Chưa có mô tả chi tiết cho cuốn sách này.'}
                                    </Text>
                                </Paper>
                            </Stack>

                            <Divider />
                        </Stack>
                    </ScrollArea>
                )}
            </Modal>

        </div>
    );
};

export default Books;
