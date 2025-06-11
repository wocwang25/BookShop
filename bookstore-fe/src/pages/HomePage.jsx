// src/pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { API } from '../api/apiService';
import { Link } from 'react-router-dom';
import { Container, Title, Text, Button, SimpleGrid, Card, Image, Group, Badge, Center, Loader } from '@mantine/core';

// --- Tạo một BookCard component riêng bằng Mantine ---
const BookCard = ({ book }) => {
    // Logic nút thêm vào giỏ hàng
    const handleAddToCart = () => {
        API.cart.addToCart({ bookId: book._id, quantity: 1 })
            .then(() => alert(`Đã thêm "${book.title}" vào giỏ hàng!`))
            .catch(err => alert('Thêm vào giỏ hàng thất bại. Vui lòng đăng nhập.'));
    };

    return (
        <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                background: 'rgba(255,255,255,0.7)', // nền trắng trong suốt
                backdropFilter: 'blur(4px)',         // hiệu ứng mờ nền (tùy chọn)
            }}
        >
            <Card.Section>
                <Link to={`/books/${book._id}`}>
                    <Image
                        src={book.imageUrl || '/images/default_image01.jpg'}
                        height={350}
                        alt={book.title}
                    />
                </Link>
            </Card.Section>

            <Group position="apart" mt="md" mb="xs">
                <Text weight={500} size="lg" lineClamp={1} style={{ color: '#222' }}>
                    {book.title}
                </Text>
                <Badge color="pink" variant="light">
                    Mới
                </Badge>
            </Group>

            <Text size="sm" color="dark" lineClamp={2} style={{ color: '#222' }}>
                bởi {book.author?.name || 'Chưa rõ tác giả'}
            </Text>

            <Text size="sm" color="dark" mt="sm" style={{ color: '#222' }}>
                Thể loại: {book.category?.name || 'Chưa phân loại'}
            </Text>

            <div style={{ flexGrow: 1 }} />

            <Group position="apart" mt="md">
                <Text weight={700} size="xl" style={{ color: '#222' }}>
                    {new Intl.NumberFormat('vi-VN').format(book.price)} ₫
                </Text>
                <Button variant="light" color="blue" onClick={handleAddToCart}>
                    Thêm vào giỏ
                </Button>
            </Group>
        </Card>);
};

// --- Component HomePage chính ---
const HomePage = () => {
    const [featuredBooks, setFeaturedBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFeaturedBooks = async () => {
            try {
                const response = await API.books.getAllBooks({ params: { limit: 4, sort: '-createdAt' } });
                const books = response.data?.books || [];
                setFeaturedBooks(books);
            } catch (err) {
                setError('Không thể tải sách nổi bật.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedBooks();
    }, []);

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
                <Container size="xl" style={{ width: '100%' }}>
                    <Center>
                        <div style={{ textAlign: 'center', width: '100%' }}>
                            <Title
                                order={1}
                                style={{
                                    fontSize: '3.5rem',
                                    marginBottom: '20px',
                                    color: '#1a237e',
                                    textShadow: '0 2px 8px rgba(0,0,0,0.08)'
                                }}
                            >
                                Khám phá thế giới qua từng trang sách
                            </Title>
                            <Text
                                size="xl"
                                style={{
                                    maxWidth: '700px',
                                    margin: 'auto',
                                    color: '#222',
                                    fontWeight: 600,
                                    textShadow: '0 2px 8px rgba(0,0,0,0.08)'
                                }}
                            >
                                Readify - nơi những câu chuyện bắt đầu và trí tưởng tượng không có giới hạn.
                                Tìm kiếm và sở hữu những cuốn sách yêu thích của bạn ngay hôm nay.
                            </Text>
                            <Button
                                component={Link}
                                to="/books"
                                size="lg"
                                mt="xl"
                                radius="xl"
                                variant="filled"
                                color="#228be6"
                                style={{
                                    marginTop: 32,
                                    color: "white",
                                    fontWeight: 700,
                                    letterSpacing: 1,
                                    boxShadow: "0 4px 16px 0 rgba(34,139,230,0.15)"
                                }}
                            >
                                Xem tất cả sách
                            </Button>
                        </div>
                    </Center>
                </Container>
            </div>

            {/* Featured Books Section */}
            <Container size="xl" my="xl" style={{ padding: '40px 0', width: '100%' }}>
                <Title order={2} align="center" mb="lg">
                    Sách Nổi Bật Tuần Này
                </Title>

                {loading && (
                    <Center style={{ height: '300px' }}>
                        <Loader size="xl" />
                    </Center>
                )}

                {error && (
                    <Center style={{ height: '300px' }}>
                        <Text color="red">{error}</Text>
                    </Center>
                )}

                {!loading && !error && (
                    <SimpleGrid
                        cols={4}
                        spacing="lg"
                        breakpoints={[
                            { maxWidth: 'md', cols: 2, spacing: 'md' },
                            { maxWidth: 'xs', cols: 1, spacing: 'sm' },
                        ]}
                        style={{ width: '100%' }}
                    >
                        {featuredBooks.map(book => (
                            <BookCard key={book._id} book={book} />
                        ))}
                    </SimpleGrid>
                )}
            </Container>

            {/* Call to Action Section */}
            <div
                style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.85)', // nền trắng mờ
                    backdropFilter: 'blur(6px)',          // hiệu ứng mờ nền phía sau (nếu muốn)
                    color: '#1a237e',                     // chữ đậm hơn
                    padding: '60px 0',
                    boxShadow: '0 8px 32px 0 rgba(31,38,135,0.07)', // bóng nhẹ cho nổi bật
                }}
            >
                <Container size="xl" style={{ width: '100%' }}>
                    <Center>
                        <div style={{ textAlign: 'center', width: '100%' }}>
                            <Title order={2} style={{ marginBottom: '20px', color: '#1a237e', fontWeight: 700 }}>
                                Trở thành thành viên của Readify
                            </Title>
                            <Text size="lg" style={{ maxWidth: '600px', margin: 'auto', color: '#222', fontWeight: 600 }}>
                                Đăng ký tài khoản ngay hôm nay để nhận ưu đãi độc quyền, lưu danh sách yêu thích và quản lý đơn hàng dễ dàng.
                            </Text>
                        </div>
                    </Center>
                </Container>
            </div>
        </div>
    );
};

export default HomePage;