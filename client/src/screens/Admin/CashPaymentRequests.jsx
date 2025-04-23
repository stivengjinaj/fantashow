import React, { useState } from 'react';
import { Card, Table, Button, Badge, Form } from 'react-bootstrap';
import {formatFirebaseTimestamp} from "../../utils/helper.js";
import {deleteCashPaymentRequest, updateCashPaymentRequest} from "../../API.js";

function CashPaymentRequests({ cashPayments, setCashPayments, admin, users }) {
    const [selectedRequests, setSelectedRequests] = useState([]);

    // Handle checkbox selection
    const handleSelectRequest = (requestId) => {
        if (selectedRequests.includes(requestId)) {
            setSelectedRequests(selectedRequests.filter(id => id !== requestId));
        } else {
            setSelectedRequests([...selectedRequests, requestId]);
        }
    };

    // Handle selects all
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedRequests(cashPayments.filter(r => !r.paid).map(r => r.id));
        } else {
            setSelectedRequests([]);
        }
    };

    // Handle batch operations
    const handleBatchOperation = (operation) => {

        setSelectedRequests([]);
    };

    // Get username by ID
    const getUserName = (userId) => {
        const user = users.find(u => u.id === userId);
        return user ? user.name+" "+user.surname : 'Utente sconosciuto';
    };

    // Handle a single request operation
    const handleRequestOperation = async (request, operation) => {
        try {
            const idToken = await admin.getIdToken();
            switch (operation) {
                case 'approve':
                    await updateCashPaymentRequest(admin.uid, request.id, idToken, true);
                    setCashPayments((prevCashPayments) =>
                        prevCashPayments.map((payment) =>
                            payment.id === request.id ? { ...payment, paid: true } : payment
                        )
                    );
                    break;
                case 'revoke':
                    await updateCashPaymentRequest(admin.uid, request.id, idToken, false);
                    setCashPayments((prevCashPayments) =>
                        prevCashPayments.map((payment) =>
                            payment.id === request.id ? { ...payment, paid: false } : payment
                        )
                    );
                    break;
                case 'delete':
                    await deleteCashPaymentRequest(request.id);
                    setCashPayments((prevCashPayments) =>
                        prevCashPayments.filter((payment) => payment.id !== request.id)
                    );
                    break;
            }
        } catch (e) {
            console.error(e);
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
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleRequestOperation(request, 'delete')}
                                                >
                                                    Cancella
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