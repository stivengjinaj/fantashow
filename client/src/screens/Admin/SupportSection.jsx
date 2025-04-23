import React, {useMemo, useState} from 'react';
import { Card, Table, Form, Button, Badge } from 'react-bootstrap';
import {capitalizeString, formatFirebaseTimestamp} from "../../utils/helper.js";
import {updateTicketStatus} from "../../API.js";

function SupportSection({ admin, tickets, setTickets }) {
    const [statusFilter, setStatusFilter] = useState('all');

        const filteredTickets = useMemo(() => {
            return statusFilter === 'all'
                ? tickets
                : statusFilter === "open"
                    ? tickets.filter(ticket => !ticket.solved)
                    : tickets.filter(ticket => ticket.solved);
        }, [statusFilter, tickets]);

    const handleStatusChange = async (tickedId, newStatus) => {
        const idToken = await admin.getIdToken();
        try {
            const response = await updateTicketStatus(admin.uid, idToken, tickedId, newStatus);
            if(response.success){
                handleTicketUpdates(tickedId, newStatus);
            }
        }catch (error) {
            console.log("Error changing ticket status: ", error);
        }
    };

    const handleTicketUpdates = (ticketId, newStatus) => {
        setTickets(prevTickets =>
            prevTickets.map(ticket =>
                ticket.id === ticketId ? { ...ticket, solved: newStatus } : ticket
            )
        );
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
                        <option value="all">Tutti</option>
                        <option value="open">Aperto</option>
                        <option value="responded">Risposto</option>
                    </Form.Select>
                </Card.Header>
                <Card.Body>
                    <div className="table-responsive">
                        <Table hover>
                            <thead>
                            <tr>
                                <th>Modalità supporto</th>
                                <th>Contatto</th>
                                <th>Stato</th>
                                <th>Data</th>
                                <th>Operazioni</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredTickets.length > 0 ? (
                                filteredTickets.map(ticket => (
                                    <tr key={ticket.id}>
                                        <td>{capitalizeString(ticket.supportMode)}</td>
                                        <td>{
                                            ticket.supportMode.toString().toLowerCase() === "telegram"
                                                ? ticket.telegram
                                                : ticket.supportMode.toString().toLowerCase() === "email"
                                                    ? `(${ticket.name}): ${ticket.email}`
                                                    : "Sconosciuto"

                                        }</td>
                                        <td>
                                            <Badge bg={
                                                ticket.solved ? 'success' : 'warning'
                                            }>
                                                {ticket.solved ? "Risposto" : "Aperto"}
                                            </Badge>
                                        </td>
                                        <td>{formatFirebaseTimestamp(ticket.createdAt)}</td>
                                        <td>
                                            <Button
                                                variant="outline-success"
                                                size="sm"
                                                onClick={() => handleStatusChange(ticket.id, true)}
                                                disabled={ticket.solved}
                                            >
                                                Risposto
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center">
                                        Nessun ticket trovato.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>
        </>
    );
}

export default SupportSection;