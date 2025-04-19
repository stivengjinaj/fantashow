import React, { useState } from 'react';
import { Card, Table, Form, Button, Badge, Row, Col } from 'react-bootstrap';
import { ChevronLeft, ChevronRight, Download } from 'react-bootstrap-icons';

function AllPayments({ payments, users }) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filteredPayments, setFilteredPayments] = useState(payments);
    const [currentPage, setCurrentPage] = useState(1);
    const paymentsPerPage = 10;

    // Handle date filter
    const handleDateFilter = () => {
        if (startDate && endDate) {
            const filtered = payments.filter(payment => {
                const paymentDate = new Date(payment.date);
                const start = new Date(startDate);
                const end = new Date(endDate);
                return paymentDate >= start && paymentDate <= end;
            });
            setFilteredPayments(filtered);
            setCurrentPage(1); // Reset to first page
        } else {
            setFilteredPayments(payments);
        }
    };

    // Reset filter
    const handleResetFilter = () => {
        setStartDate('');
        setEndDate('');
        setFilteredPayments(payments);
        setCurrentPage(1);
    };

    // Get user name by ID
    const getUserName = (userId) => {
        const user = users.find(u => u.id === userId);
        return user ? user.name : 'Unknown User';
    };

    // Calculate pagination
    const indexOfLastPayment = currentPage * paymentsPerPage;
    const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
    const currentPayments = filteredPayments.slice(indexOfFirstPayment, indexOfLastPayment);
    const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage);

    const paginate = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    // Export payments
    const handleExport = () => {
        // This would generate a CSV or Excel file in a real app
        console.log('Exporting payment data');
    };

    return (
        <Card>
            <Card.Header>
                <h5 className="mb-3">All Payments</h5>
                <Row className="g-2 align-items-center">
                    <Col xs={12} sm={4} md={3}>
                        <Form.Group>
                            <Form.Label>Start Date</Form.Label>
                            <Form.Control
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                    <Col xs={12} sm={4} md={3}>
                        <Form.Group>
                            <Form.Label>End Date</Form.Label>
                            <Form.Control
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                    <Col xs={12} sm={4} md={6} className="d-flex align-items-end">
                        <Button
                            variant="primary"
                            className="me-2"
                            onClick={handleDateFilter}
                            disabled={!startDate || !endDate}
                        >
                            Filter
                        </Button>
                        <Button
                            variant="outline-secondary"
                            className="me-2"
                            onClick={handleResetFilter}
                        >
                            Reset
                        </Button>
                        <Button
                            variant="success"
                            className="ms-auto"
                            onClick={handleExport}
                        >
                            <Download className="me-1" /> Export
                        </Button>
                    </Col>
                </Row>
            </Card.Header>
            <Card.Body>
                <div className="table-responsive">
                    <Table hover>
                        <thead>
                        <tr>
                            <th>Payment ID</th>
                            <th>User</th>
                            <th>Amount</th>
                            <th>Payment Method</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {currentPayments.length > 0 ? (
                            currentPayments.map(payment => (
                                <tr key={payment.id}>
                                    <td>{payment.id}</td>
                                    <td>{getUserName(payment.userId)}</td>
                                    <td>${payment.amount.toFixed(2)}</td>
                                    <td>
                                        <Badge bg="info" text="dark">
                                            {payment.method}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Badge bg={
                                            payment.status === 'completed' ? 'success' :
                                                payment.status === 'pending' ? 'warning' : 'danger'
                                        }>
                                            {payment.status}
                                        </Badge>
                                    </td>
                                    <td>{payment.date}</td>
                                    <td>
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            onClick={() => console.log(`View payment details: ${payment.id}`)}
                                        >
                                            Details
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center">No payments found</td>
                            </tr>
                        )}
                        </tbody>
                    </Table>
                </div>

                {/* Pagination */}
                {filteredPayments.length > paymentsPerPage && (
                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <div>
                            Showing {indexOfFirstPayment + 1} to {Math.min(indexOfLastPayment, filteredPayments.length)} of {filteredPayments.length} entries
                        </div>
                        <div>
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                className="me-1"
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft />
                            </Button>
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight />
                            </Button>
                        </div>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
}

export default AllPayments;