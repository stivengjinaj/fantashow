import React, { useState } from 'react';
import {Card, Table, Button, Badge, Form, Modal} from 'react-bootstrap';
import {formatFirebaseTimestamp} from "../../utils/helper.js";
import { updateCashPaymentList, updateCashPaymentRequest} from "../../API.js";


function CashPaymentRequests({ cashPayments, setCashPayments, admin, users, onEditUsers }) {
    const [selectedRequests, setSelectedRequests] = useState([]);
    const [showRevokeModal, setShowRevokeModal] = useState(false);
    const [paymentToRevoke, setPaymentToRevoke] = useState(null);

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

    // Open revocation confirmation modal
    const confirmRevocation = (payment) => {
        setPaymentToRevoke(payment);
        setShowRevokeModal(true);
    };

    // Close the modal without revoking
    const cancelRevocation = () => {
        setShowRevokeModal(false);
        setPaymentToRevoke(null);
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

    // Execute the actual revocation after confirmation
    const handleRevocation = async () => {
        if (paymentToRevoke) {
            await handleRequestOperation(paymentToRevoke, 'revoke');
            setShowRevokeModal(false);
            setPaymentToRevoke(null);
        }
    };

    return (
        <>
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
                                                        onClick={() => confirmRevocation(request)}
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

            {/* Revocation Confirmation Modal */}
            <Modal show={showRevokeModal} onHide={cancelRevocation} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Conferma Revoca</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {paymentToRevoke && (
                        <p>Sei sicuro di voler revocare il pagamento di <strong>{getUserName(paymentToRevoke.id)}</strong>?</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={cancelRevocation}>
                        Annulla
                    </Button>
                    <Button variant="danger" onClick={handleRevocation}>
                        Revoca
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default CashPaymentRequests;