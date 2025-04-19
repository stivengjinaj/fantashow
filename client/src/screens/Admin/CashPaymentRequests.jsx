import React, { useState } from 'react';
import { Card, Table, Button, Badge, Form } from 'react-bootstrap';

function CashPaymentRequests({ paymentRequests, users }) {
    const [selectedRequests, setSelectedRequests] = useState([]);

    // Handle checkbox selection
    const handleSelectRequest = (requestId) => {
        if (selectedRequests.includes(requestId)) {
            setSelectedRequests(selectedRequests.filter(id => id !== requestId));
        } else {
            setSelectedRequests([...selectedRequests, requestId]);
        }
    };

    // Handle select all
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedRequests(paymentRequests.filter(r => r.status === 'pending').map(r => r.id));
        } else {
            setSelectedRequests([]);
        }
    };

    // Handle batch operations
    const handleBatchOperation = (operation) => {
        // This would call an API in a real app
        console.log(`${operation} payment requests:`, selectedRequests);
        // Reset selection after operation
        setSelectedRequests([]);
    };

    // Get username by ID
    const getUserName = (userId) => {
        const user = users.find(u => u.id === userId);
        return user ? user.name : 'Unknown User';
    };

    // Handle single request operation
    const handleRequestOperation = (requestId, operation) => {
        // This would call an API in a real app
        console.log(`${operation} payment request:`, requestId);
    };

    return (
        <Card>
            <Card.Header className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
                <h5 className="mb-md-0">Cash Payment Requests</h5>
                <div>
                    <Button
                        variant="success"
                        size="sm"
                        className="me-1"
                        disabled={selectedRequests.length === 0}
                        onClick={() => handleBatchOperation('approve')}
                    >
                        Approve Selected
                    </Button>
                    <Button
                        variant="danger"
                        size="sm"
                        disabled={selectedRequests.length === 0}
                        onClick={() => handleBatchOperation('reject')}
                    >
                        Reject Selected
                    </Button>
                </div>
            </Card.Header>
            <Card.Body>
                <div className="table-responsive">
                    <Table hover>
                        <thead>
                        <tr>
                            <th width="40">
                                <Form.Check
                                    type="checkbox"
                                    onChange={handleSelectAll}
                                    checked={selectedRequests.length === paymentRequests.filter(r => r.status === 'pending').length && paymentRequests.length > 0}
                                />
                            </th>
                            <th>ID</th>
                            <th>User</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {paymentRequests.length > 0 ? (
                            paymentRequests.map(request => (
                                <tr key={request.id}>
                                    <td>
                                        {request.status === 'pending' && (
                                            <Form.Check
                                                type="checkbox"
                                                checked={selectedRequests.includes(request.id)}
                                                onChange={() => handleSelectRequest(request.id)}
                                            />
                                        )}
                                    </td>
                                    <td>{request.id}</td>
                                    <td>{getUserName(request.userId)}</td>
                                    <td>${request.amount.toFixed(2)}</td>
                                    <td>{request.date}</td>
                                    <td>
                                        <Badge bg={
                                            request.status === 'pending' ? 'warning' :
                                                request.status === 'approved' ? 'success' : 'danger'
                                        }>
                                            {request.status}
                                        </Badge>
                                    </td>
                                    <td>
                                        {request.status === 'pending' && (
                                            <>
                                                <Button
                                                    variant="outline-success"
                                                    size="sm"
                                                    className="me-1"
                                                    onClick={() => handleRequestOperation(request.id, 'approve')}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleRequestOperation(request.id, 'reject')}
                                                >
                                                    Reject
                                                </Button>
                                            </>
                                        )}
                                        {request.status !== 'pending' && (
                                            <Button
                                                variant="outline-secondary"
                                                size="sm"
                                                onClick={() => handleRequestOperation(request.id, 'details')}
                                            >
                                                Details
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center">No payment requests found</td>
                            </tr>
                        )}
                        </tbody>
                    </Table>
                </div>
            </Card.Body>
        </Card>
    );
}

export default CashPaymentRequests;