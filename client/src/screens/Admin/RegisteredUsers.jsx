import React, { useState } from 'react';
import { Card, Table, Form, Button, Badge, InputGroup } from 'react-bootstrap';
import { Search, PencilSquare, Trash, ChevronLeft, ChevronRight } from 'react-bootstrap-icons';
import {formatFirebaseTimestamp} from "../../utils/helper.js";

function RegisteredUsers({ users, onEditUser }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;

    // Filter users based on search term
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page on search
    };

    // Handle user deletion
    const handleDeleteUser = (userId) => {
        // This would call an API in a real app
        if (window.confirm('Are you sure you want to delete this user?')) {
            console.log(`Delete user with ID: ${userId}`);
        }
    };

    return (
        <Card>
            <Card.Header className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
                <h5 className="mb-md-0">Registered Users</h5>
                <InputGroup style={{ maxWidth: '300px' }}>
                    <Form.Control
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                    <Button variant="outline-secondary">
                        <Search />
                    </Button>
                </InputGroup>
            </Card.Header>
            <Card.Body>
                <div className="table-responsive">
                    <Table hover>
                        <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Punti</th>
                            <th>Stato</th>
                            <th>Data Registrazione</th>
                            <th>Operazioni</th>
                        </tr>
                        </thead>
                        <tbody>
                        {currentUsers.length > 0 ? (
                            currentUsers.map(user => (
                                <tr key={user.id}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.points}</td>
                                    <td>
                                        <Badge bg={user.paid ? 'success' : 'danger'}>
                                            {user.paid ? "Pagato" : "Non pagato"}
                                        </Badge>
                                    </td>
                                    <td>{formatFirebaseTimestamp(user.createdAt)}</td>
                                    <td>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            className="me-1"
                                            onClick={() => onEditUser(user)}
                                        >
                                            <PencilSquare size={16} />
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleDeleteUser(user.id)}
                                        >
                                            <Trash size={16} />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center">No users found</td>
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

export default RegisteredUsers;