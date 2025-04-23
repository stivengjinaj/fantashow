import React from 'react';
import {Button, Nav, Row} from 'react-bootstrap';
import {
    XLg,
    People,
    Award,
    CreditCard2Front,
    CashCoin,
    Headset, Key
} from 'react-bootstrap-icons';
import {logout} from "../../utils/auth.js";

function Sidebar({ activeTab, setActiveTab, toggleSidebar, expanded, isMobile }) {
    return (
        <div className="d-flex flex-column align-items-center min-vh-100">
            <div className="d-flex justify-content-between align-items-center mb-4 px-3">
                {expanded && <h3 className="m-0">Admin Panel</h3>}
                {isMobile && expanded && (
                    <button
                        className="btn btn-link text-white p-0"
                        onClick={toggleSidebar}
                    >
                        <XLg size={20} />
                    </button>
                )}
            </div>

            <Nav className="flex-column">
                <Nav.Link
                    className={`d-flex align-items-center ${activeTab === 'users' ? 'active bg-primary text-white' : 'text-white'}`}
                    onClick={() => setActiveTab('users')}
                    title="Utenti Registrati"
                >
                    <People className={expanded ? "me-2" : "mx-auto"} size={expanded ? 16 : 20} />
                    {expanded && <span>Utenti Registrati</span>}
                </Nav.Link>
                <Nav.Link
                    className={`d-flex align-items-center ${activeTab === 'ranking' ? 'active bg-primary text-white' : 'text-white'}`}
                    onClick={() => setActiveTab('ranking')}
                    title="Classifica Utenti"
                >
                    <Award className={expanded ? "me-2" : "mx-auto"} size={expanded ? 16 : 20} />
                    {expanded && <span>Classifica Utenti</span>}
                </Nav.Link>
                <Nav.Link
                    className={`d-flex align-items-center ${activeTab === 'cashRequests' ? 'active bg-primary text-white' : 'text-white'}`}
                    onClick={() => setActiveTab('cashRequests')}
                    title="Richieste Pagamento Cash"
                >
                    <CashCoin className={expanded ? "me-2" : "mx-auto"} size={expanded ? 16 : 20} />
                    {expanded && <span>Richieste Pagamento Cash</span>}
                </Nav.Link>
                <Nav.Link
                    className={`d-flex align-items-center ${activeTab === 'allPayments' ? 'active bg-primary text-white' : 'text-white'}`}
                    onClick={() => setActiveTab('allPayments')}
                    title="Tutti i Pagamenti"
                >
                    <CreditCard2Front className={expanded ? "me-2" : "mx-auto"} size={expanded ? 16 : 20} />
                    {expanded && <span>Tutti i Pagamenti</span>}
                </Nav.Link>
                <Nav.Link
                    className={`d-flex align-items-center ${activeTab === 'support' ? 'active bg-primary text-white' : 'text-white'}`}
                    onClick={() => setActiveTab('support')}
                    title="Supporto"
                >
                    <Headset className={expanded ? "me-2" : "mx-auto"} size={expanded ? 16 : 20} />
                    {expanded && <span>Supporto</span>}
                </Nav.Link>
                <Nav.Link
                    className={`d-flex align-items-center ${activeTab === 'newAdmin' ? 'active bg-primary text-white' : 'text-white'}`}
                    onClick={() => setActiveTab('newAdmin')}
                    title="Aggiungi Admin"
                >
                    <Key className={expanded ? "me-2" : "mx-auto"} size={expanded ? 16 : 20} />
                    {expanded && <span>Aggiungi Admin</span>}
                </Nav.Link>
            </Nav>

            {expanded && (
                <Row className="mt-auto w-100 mb-3 p-3">
                    <Button onClick={logout} className="bg-danger">Logout</Button>
                </Row>
            )}
        </div>
    );
}

export default Sidebar;