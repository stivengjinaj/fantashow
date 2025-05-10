import React, { useState } from 'react';
import { Card, Table, Form, Button, Badge, Row, Col } from 'react-bootstrap';
import { ChevronLeft, ChevronRight, Download } from 'react-bootstrap-icons';
import {dateToFirebaseDate, formatFirebaseTimestamp} from "../../utils/helper.js";
import autoTable from "jspdf-autotable";
import jsPDF from "jspdf";

function AllPayments({ users }) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filteredUsers, setFilteredUsers] = useState(users);
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;

    // Handle date filter
    const handleDateFilter = () => {
        if (startDate && endDate) {
            const startFirebase = dateToFirebaseDate(startDate);
            const endFirebase = dateToFirebaseDate(endDate);

            if (startFirebase && endFirebase) {
                const filtered = users.filter(user => {
                    if (!user.paymentDate || typeof user.paymentDate._seconds !== 'number') {
                        return false;
                    }

                    return (
                        user.paymentDate._seconds >= startFirebase._seconds &&
                        user.paymentDate._seconds <= endFirebase._seconds
                    );
                });

                setFilteredUsers(filtered);
                setCurrentPage(1);
            }
        } else {
            setFilteredUsers(users);
        }
    };

    // Reset filter
    const handleResetFilter = () => {
        setStartDate('');
        setEndDate('');
        setFilteredUsers(users);
        setCurrentPage(1);
    };

    // Calculate pagination
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const paginate = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    // Export transactions
    const handleExport = () => {
        const doc = new jsPDF();
        const tableColumn = ["ID Transazione", "Utente", "Stato", "Data"];
        const tableRows = [];

        filteredUsers.forEach(user => {
            const userData = [
                user.paymentId,
                `${user.name} ${user.surname}`,
                user.paid ? "Pagato" : "Non pagato",
                formatFirebaseTimestamp(user.paymentDate)
            ];
            tableRows.push(userData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
        });

        doc.save("pagamenti.pdf");
    };


    return (
        <Card>
            <Card.Header>
                <h5 className="mb-3">Tutti i pagamenti</h5>
                <Row className="g-2 align-items-end">
                    <Col xs={12} sm={4} md={3}>
                        <Form.Group>
                            <Form.Label column={3}>Data inizio</Form.Label>
                            <Form.Control
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                    <Col xs={12} sm={4} md={3}>
                        <Form.Group>
                            <Form.Label column={3}>Data fine</Form.Label>
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
                            Filtra
                        </Button>
                        <Button
                            variant="outline-secondary"
                            className="me-2"
                            onClick={handleResetFilter}
                        >
                            Ripristina
                        </Button>
                        <Button
                            variant="success"
                            className="ms-auto"
                            onClick={handleExport}
                        >
                            <Download className="me-1" /> Esporta
                        </Button>
                    </Col>
                </Row>
            </Card.Header>
            <Card.Body>
                <div className="table-responsive">
                    <Table hover>
                        <thead>
                        <tr>
                            <th>ID Transazione</th>
                            <th>Utente</th>
                            <th>Stato</th>
                            <th>Data</th>
                        </tr>
                        </thead>
                        <tbody>
                        {currentUsers.length > 0 ? (
                            currentUsers.map(user => (
                                <tr key={user.id}>
                                    <td>{user.paymentId ? user.paymentId : "Pagamento cash"}</td>
                                    <td>{user.name+" "+user.surname}</td>
                                    <td>
                                        <Badge bg={user.paid ? "success" : "warning"} text="light">
                                            {user.paid ? "Pagato" : "Non pagato"}
                                        </Badge>
                                    </td>
                                    <td>{formatFirebaseTimestamp(user.paymentDate)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center">Nessun utente trovato</td>
                            </tr>
                        )}
                        </tbody>
                    </Table>
                </div>

                {/* Pagination */}
                {filteredUsers.length > usersPerPage && (
                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <div>
                            Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} entries
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