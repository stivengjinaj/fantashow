import React from 'react';
import { Nav } from 'react-bootstrap';
import {
    XLg,
    People,
    Award,
    CreditCard2Front,
    CashCoin,
    Headset
} from 'react-bootstrap-icons';

function Sidebar({ activeTab, setActiveTab, toggleSidebar, expanded, isMobile }) {
    return (
        <div className="d-flex flex-column h-100">
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
                    title="Registered Users"
                >
                    <People className={expanded ? "me-2" : "mx-auto"} size={expanded ? 16 : 20} />
                    {expanded && <span>Registered Users</span>}
                </Nav.Link>
                <Nav.Link
                    className={`d-flex align-items-center ${activeTab === 'ranking' ? 'active bg-primary text-white' : 'text-white'}`}
                    onClick={() => setActiveTab('ranking')}
                    title="User Ranking"
                >
                    <Award className={expanded ? "me-2" : "mx-auto"} size={expanded ? 16 : 20} />
                    {expanded && <span>User Ranking</span>}
                </Nav.Link>
                <Nav.Link
                    className={`d-flex align-items-center ${activeTab === 'cashRequests' ? 'active bg-primary text-white' : 'text-white'}`}
                    onClick={() => setActiveTab('cashRequests')}
                    title="Cash Payment Requests"
                >
                    <CashCoin className={expanded ? "me-2" : "mx-auto"} size={expanded ? 16 : 20} />
                    {expanded && <span>Cash Payment Requests</span>}
                </Nav.Link>
                <Nav.Link
                    className={`d-flex align-items-center ${activeTab === 'allPayments' ? 'active bg-primary text-white' : 'text-white'}`}
                    onClick={() => setActiveTab('allPayments')}
                    title="All Payments"
                >
                    <CreditCard2Front className={expanded ? "me-2" : "mx-auto"} size={expanded ? 16 : 20} />
                    {expanded && <span>All Payments</span>}
                </Nav.Link>
                <Nav.Link
                    className={`d-flex align-items-center ${activeTab === 'support' ? 'active bg-primary text-white' : 'text-white'}`}
                    onClick={() => setActiveTab('support')}
                    title="Support Section"
                >
                    <Headset className={expanded ? "me-2" : "mx-auto"} size={expanded ? 16 : 20} />
                    {expanded && <span>Support Section</span>}
                </Nav.Link>
            </Nav>

            {expanded && (
                <div className="mt-auto p-3">
                    <div className="text-muted small">
                        <p>Logged in as admin</p>
                        <p className="mb-0">© 2025 Fantashow</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Sidebar;