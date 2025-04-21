import React, { useState } from 'react';
import { Card, Table, Form, Button, Badge, Modal } from 'react-bootstrap';

function SupportSection({ tickets, users }) {
    const [statusFilter, setStatusFilter] = useState('all');
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);

    // Filter tickets by status
    const filteredTickets = statusFilter === 'all'
        ? tickets
        : tickets.filter(ticket => ticket.status === statusFilter);

    // Get username by ID
    const getUserName = (userId) => {
        const user = users.find(u => u.id === userId);
        return user ? user.name : 'Unknown User';
    };

    // Handle ticket click for details
    const handleViewTicket = (ticket) => {
        setSelectedTicket(ticket);
        setShowTicketModal(true);
    };

    // Handle ticket status change
    const handleStatusChange = (newStatus) => {
        // This would call an API in a real app
        console.log(`Change ticket ${selectedTicket.id} status to ${newStatus}`);
        setShowTicketModal(false);
    };

    return (
        <>
            <Card>
                <Card.Header className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
                    <h5 className="mb-md-0">Support Tickets</h5>
                    <Form.Select
                        style={{ width: 'auto' }}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="open">Open</option>
                        <option value="in progress">In Progress</option>
                        <option value="closed">Closed</option>
                    </Form.Select>
                </Card.Header>
                <Card.Body>
                    <div className="table-responsive">
                        <Table hover>
                            <thead>
                            <tr>
                                <th>Ticket ID</th>
                                <th>User</th>
                                <th>Subject</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredTickets.length > 0 ? (
                                filteredTickets.map(ticket => (
                                    <tr key={ticket.id}>
                                        <td>{ticket.id}</td>
                                        <td>{getUserName(ticket.userId)}</td>
                                        <td>{ticket.subject}</td>
                                        <td>
                                            <Badge bg={
                                                ticket.status === 'open' ? 'danger' :
                                                    ticket.status === 'in progress' ? 'warning' : 'success'
                                            }>
                                                {ticket.status}
                                            </Badge>
                                        </td>
                                        <td>{ticket.date}</td>
                                        <td>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => handleViewTicket(ticket)}
                                            >
                                                View Details
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center">No tickets found</td>
                                </tr>
                            )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

            {/* Ticket Details Modal */}
            <Modal show={showTicketModal} onHide={() => setShowTicketModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Support Ticket Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedTicket && (
                        <div>
                            <div className="d-flex justify-content-between mb-3">
                                <div>
                                    <h6>Ticket ID: {selectedTicket.id}</h6>
                                    <p className="mb-1">
                                        <strong>User:</strong> {getUserName(selectedTicket.userId)}
                                    </p>
                                    <p className="mb-1">
                                        <strong>Date:</strong> {selectedTicket.date}
                                    </p>
                                    <p className="mb-1">
                                        <strong>Status:</strong> {' '}
                                        <Badge bg={
                                            selectedTicket.status === 'open' ? 'danger' :
                                                selectedTicket.status === 'in progress' ? 'warning' : 'success'
                                        }>
                                            {selectedTicket.status}
                                        </Badge>
                                    </p>
                                </div>
                                <div>
                                    <Form.Group>
                                        <Form.Label>Change Status</Form.Label>
                                        <Form.Select
                                            defaultValue={selectedTicket.status}
                                            onChange={(e) => handleStatusChange(e.target.value)}
                                        >
                                            <option value="open">Open</option>
                                            <option value="in progress">In Progress</option>
                                            <option value="closed">Closed</option>
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                            </div>

                            <h5>Subject: {selectedTicket.subject}</h5>
                            <hr />

                            <div className="bg-light p-3 rounded mb-3">
                                <h6>Ticket Message:</h6>
                                <p>
                                    {/* This would be the ticket message content */}
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vitae enim vitae erat aliquam commodo.
                                    Fusce at lorem nibh. Nullam tempus velit id velit euismod, ac volutpat est fringilla.
                                </p>
                            </div>

                            {/* Reply section */}
                            <h6>Reply to Ticket</h6>
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Control as="textarea" rows={3} placeholder="Type your response here..." />
                                </Form.Group>
                                <Button variant="primary">
                                    Send Reply
                                </Button>
                            </Form>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowTicketModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default SupportSection;