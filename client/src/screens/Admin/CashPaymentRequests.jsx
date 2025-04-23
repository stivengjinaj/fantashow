import React, { useState } from 'react';
import { Card, Table, Button, Badge, Form } from 'react-bootstrap';
import {formatFirebaseTimestamp} from "../../utils/helper.js";
import { updateCashPaymentList, updateCashPaymentRequest} from "../../API.js";


function CashPaymentRequests({ cashPayments, setCashPayments, admin, users, onEditUsers }) {
    const [selectedRequests, setSelectedRequests] = useState([]);

    // Handle checkbox selection
    const handleSelectRequest = (requestId) => {
        setSelectedRequests(prev =>
            prev.includes(requestId)
                ? prev.filter(id => id !== requestId)
                : [...prev, requestId]
        );
    };

    // Handle selects all
    const handleSelectAll = (e) => {
        setSelectedRequests(
            e.target.checked
                ? cashPayments.filter(r => !r.paid).map(r => r.id)
                : []
        );
    };

    const updateUsersWithPaymentChanges = (paymentIds, isPaid) => {
        const affectedUserIds = cashPayments
            .filter(payment => paymentIds.includes(payment.id))
            .map(payment => payment.id);


        if (affectedUserIds.length > 0) {
            const updatedUsers = users.map(user => {
                if (affectedUserIds.includes(user.id)) {
                    return { ...user, paid: isPaid };
                }
                return user;
            });
            onEditUsers(updatedUsers);
        }
    };

    const handleBatchOperation = async (operation) => {
        try {
            const paymentIds = selectedRequests.filter(id =>
                cashPayments.find(r => r.id === id && !r.paid)
            );

            if (paymentIds.length === 0) return;

            const idToken = await admin.getIdToken();
            const isPaid = operation === 'approve';

            await updateCashPaymentList(admin.uid, paymentIds, idToken, isPaid);

            setCashPayments(prevCashPayments =>
                prevCashPayments.map(payment =>
                    paymentIds.includes(payment.id)
                        ? { ...payment, paid: isPaid }
                        : payment
                )
            );

            // Pass the payment IDs and isPaid status
            updateUsersWithPaymentChanges(paymentIds, isPaid);

            setSelectedRequests([]);
        } catch (error) {
            console.error("Error during batch operation:", error);
        }
    };

    // Get username by ID
    const getUserName = (userId) => {
        const user = users.find(u => u.id === userId);
        return user ? `${user.name} ${user.surname}` : 'Utente sconosciuto';
    };

    // Handle a single request operation
    const handleRequestOperation = async (request, operation) => {
        try {
            const idToken = await admin.getIdToken();
            const isPaid = operation === 'approve';
            const response = await updateCashPaymentRequest(admin.uid, request.id, idToken, isPaid);

            if(response.success){
                setCashPayments(prevCashPayments =>
                    prevCashPayments.map(payment =>
                        payment.id === request.id ? { ...payment, paid: isPaid } : payment
                    )
                );

                updateUsersWithPaymentChanges([request.id], isPaid);
            }
        } catch (error) {
            console.error("Error handling request operation:", error);
        }
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
                                    checked={selectedRequests.length === cashPayments.filter(r => !r.paid).length && cashPayments.length > 0}
                                />
                            </th>
                            <th>Utente</th>
                            <th>Data</th>
                            <th>Stato</th>
                            <th>Operazioni</th>
                        </tr>
                        </thead>
                        <tbody>
                        {cashPayments.length > 0 ? (
                            cashPayments.map(request => (
                                <tr key={request.id}>
                                    <td>
                                        {!request.paid && (
                                            <Form.Check
                                                type="checkbox"
                                                checked={selectedRequests.includes(request.id)}
                                                onChange={() => handleSelectRequest(request.id)}
                                            />
                                        )}
                                    </td>
                                    <td>{getUserName(request.id)}</td>
                                    <td>{formatFirebaseTimestamp(request.requestDate)}</td>
                                    <td>
                                        <Badge bg={
                                            request.paid ? 'success' : 'danger'
                                        }>
                                            {request.paid ? 'Pagato' : 'Non pagato'}
                                        </Badge>
                                    </td>
                                    <td>
                                        {!request.paid && (
                                            <>
                                                <Button
                                                    variant="outline-success"
                                                    size="sm"
                                                    className="me-1"
                                                    onClick={() => handleRequestOperation(request, 'approve')}
                                                >
                                                    Approva
                                                </Button>
                                            </>
                                        )}
                                        {request.paid && (
                                            <>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleRequestOperation(request, 'revoke')}
                                                >
                                                    Revoca
                                                </Button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center">
                                    Non ci sono richieste di pagamento cash
                                </td>
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