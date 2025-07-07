import React, { useState } from 'react';
import { Card, Table, Form, Button, Badge, InputGroup, Modal } from 'react-bootstrap';
import {Search, PencilSquare, Trash, ChevronLeft, ChevronRight, ChevronUp, ChevronDown} from 'react-bootstrap-icons';
import {formatFirebaseTimestamp, mapStatus} from "../../utils/helper.js";
import {adminDeleteUser} from "../../API.js";

function RegisteredUsers({ admin, users, setUsers, onEditUser, onDeleteUser }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage, setUsersPerPage] = useState(10);
    const [orderDirection, setOrderDirection] = useState('desc');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const paginate = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const handleUserPerPageChange = (e) => {
        const value = parseInt(e.target.value, 10);
        setUsersPerPage(value === 999 ? filteredUsers.length : value);
        setCurrentPage(1);
    }

    const handleOrderChange = (e) => {
        const field = e.target.value;

        const sortedUsers = [...users].sort((a, b) => {
            if (field === 'createdAt') {
                return new Date(b.createdAt) - new Date(a.createdAt);
            } else if (field === 'name') {
                return a.name.localeCompare(b.name);
            } else if (field === 'points') {
                return b.points - a.points;
            } else if (field === 'coins') {
                return b.coins - a.coins;
            }
            return 0;
        });

        setUsers(sortedUsers);
    };


    const handleOrderDirectionChange = () => {
        setOrderDirection(prevDirection => {
            const newDirection = prevDirection === 'asc' ? 'desc' : 'asc';
            users.reverse();
            return newDirection;
        });
    }

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const confirmDeleteUser = (user) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const handleDeleteUser = async () => {
        if (userToDelete) {
            try {
                const adminToken = await admin.getIdToken();
                const response = await adminDeleteUser(adminToken, userToDelete.id)
                if (response.success) {
                    onDeleteUser(userToDelete);
                    alert("Utente eliminato con successo");
                }else {
                    alert("Errore durante l'eliminazione dell'utente: "+response.error);
                }
            }catch (e) {
                alert("Errore durante l'eliminazione dell'utente: "+e.error);
            }
            setShowDeleteModal(false);
            setUserToDelete(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setUserToDelete(null);
    };

    return (
        <>
            <Card>
                <Card.Header className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
                    <h5 className="mb-md-0">Utenti Registrati</h5>
                    <InputGroup style={{ maxWidth: '900px' }}>
                        <Form.Select defaultValue="desc" onChange={handleOrderChange} className="me-1">
                            <option value={"createdAt"}>Ordina</option>
                            <option value={"createdAt"}>Iscrizione</option>
                            <option value={"name"}>Nome</option>
                            <option value={"points"}>Punti</option>
                            <option value={"coins"}>Coin</option>
                        </Form.Select>
                        <Button variant={"secondary"} onClick={handleOrderDirectionChange} className="me-2 rounded-3">
                            {orderDirection === 'asc' ? <ChevronUp /> : <ChevronDown />}
                        </Button>
                        <Form.Select defaultValue={10} onChange={handleUserPerPageChange} className="me-3">
                            <option value={10}>Utenti per pagina</option>
                            <option value={999}>Tutti gli Utenti</option>
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={20}>20</option>
                            <option value={30}>30</option>
                        </Form.Select>
                        <Form.Control
                            type="text"
                            placeholder="Cerca utente..."
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
                                <th>Utente</th>
                                <th>Email</th>
                                <th>Punti</th>
                                <th>Coin</th>
                                <th>Stato</th>
                                <th>Pagamento</th>
                                <th>Data Registrazione</th>
                                <th>Operazioni</th>
                            </tr>
                            </thead>
                            <tbody>
                            {currentUsers.length > 0 ? (
                                currentUsers.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.name+" "+user.surname}</td>
                                        <td>{user.email}</td>
                                        <td>{user.points}</td>
                                        <td>{user.coins}</td>
                                        <td>
                                            <Badge bg={user.status === 0 ? 'secondary' : user.status === 1 ? 'info' : 'warning'}>
                                                {mapStatus(user.status)}
                                            </Badge>
                                        </td>
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
                                                onClick={() => confirmDeleteUser(user)}
                                            >
                                                <Trash size={16} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center">Nessun utente trovato</td>
                                </tr>
                            )}
                            </tbody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {filteredUsers.length > usersPerPage && (
                        <div className="d-flex justify-content-between align-items-center mt-3">
                            <div>
                                Mostrando da {indexOfFirstUser + 1} a {Math.min(indexOfLastUser, filteredUsers.length)}. Totale: {filteredUsers.length} utenti
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

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={cancelDelete} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Conferma Eliminazione</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {userToDelete && (
                        <p>Sei sicuro di voler eliminare l'utente <strong>{userToDelete.name} {userToDelete.surname}</strong>?</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={cancelDelete}>
                        Annulla
                    </Button>
                    <Button variant="danger" onClick={handleDeleteUser}>
                        Elimina
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default RegisteredUsers;