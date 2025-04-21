import React, {useState, useEffect, useContext} from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Sidebar from './Sidebar';
import DashboardSummary from './DashboardSummary';
import RegisteredUsers from './RegisteredUsers';
import UserRanking from './UserRanking';
import CashPaymentRequests from './CashPaymentRequests';
import AllPayments from './AllPayments';
import SupportSection from './SupportSection';
import UserEditModal from './UserEditModal';
import { List } from 'react-bootstrap-icons';
import {getAllUsers} from "../../API.js";
import {UserContext} from "../Contexts/UserContext.jsx";
import { debounce } from 'lodash';

function AdminDashboard() {
    const { user } = useContext(UserContext);
    const [activeTab, setActiveTab] = useState('users');
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    const [showUserModal, setShowUserModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [users, setUsers ] = useState([]);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth < 768) {
                setSidebarExpanded(false);
            }
        };

        const debouncedResize = debounce(checkMobile, 200);

        checkMobile();
        window.addEventListener('resize', debouncedResize);
        return () => window.removeEventListener('resize', debouncedResize);
    }, []);


    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = await user.getIdToken();
                const data = await getAllUsers(user.uid, token);
                if (data.success) {
                    setUsers(data.message);
                } else {
                    console.error(data.error);
                }
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        if (user) {
            fetchUsers();
        }
    }, [user]);


    const paymentRequests = [
        { id: 101, userId: 2, amount: 150.00, status: 'pending', date: '2024-04-15' },
        { id: 102, userId: 1, amount: 75.50, status: 'approved', date: '2024-04-12' },
        { id: 103, userId: 3, amount: 200.00, status: 'rejected', date: '2024-04-10' },
    ];

    const allPayments = [
        { id: 501, userId: 1, amount: 99.00, method: 'credit', status: 'completed', date: '2024-04-01' },
        { id: 502, userId: 2, amount: 150.00, method: 'bank', status: 'completed', date: '2024-03-28' },
        { id: 503, userId: 3, amount: 49.99, method: 'credit', status: 'refunded', date: '2024-03-15' },
    ];

    const supportTickets = [
        { id: 201, userId: 3, subject: 'Cannot access account', status: 'open', date: '2024-04-16' },
        { id: 202, userId: 1, subject: 'Payment not showing up', status: 'in progress', date: '2024-04-14' },
        { id: 203, userId: 2, subject: 'How to withdraw funds', status: 'closed', date: '2024-04-10' },
    ];

    const handleEditUser = (user) => {
        setCurrentUser(user);
        setShowUserModal(true);
    };

    const toggleSidebar = () => {
        setSidebarExpanded(!sidebarExpanded);
    };

    const renderContent = () => {
        switch(activeTab) {
            case 'users':
                return <RegisteredUsers users={users} onEditUser={handleEditUser} />;
            case 'ranking':
                return <UserRanking users={users} />;
            case 'cashRequests':
                return <CashPaymentRequests paymentRequests={paymentRequests} users={users} />;
            case 'allPayments':
                return <AllPayments payments={allPayments} users={users} />;
            case 'support':
                return <SupportSection tickets={supportTickets} users={users} />;
            default:
                return <div>Select a section from the sidebar</div>;
        }
    };

    // Calculate sidebar and content classes/styles based on state
    const sidebarWidth = 240; // Width in pixels
    const collapsedSidebarWidth = 60; // Width when collapsed

    const sidebarStyle = {
        width: sidebarExpanded ? `${sidebarWidth}px` : `${collapsedSidebarWidth}px`,
        minHeight: '100vh',
        position: 'fixed',
        zIndex: 100,
        transition: 'all 0.3s ease',
        left: 0,
        overflow: 'hidden'
    };

    // Mobile sidebar styling
    if (isMobile) {
        sidebarStyle.width = `${sidebarWidth}px`; // Always full width on mobile

        if (!sidebarExpanded) {
            // Hide when collapsed on mobile
            sidebarStyle.transform = 'translateX(-100%)';
        } else {
            // Cover full screen when expanded on mobile
            sidebarStyle.width = '100%';
            sidebarStyle.maxWidth = '100%';
        }
    }

    // Main content area needs an offset based on sidebar state
    const contentOffset = sidebarExpanded ?
        (isMobile ? 0 : sidebarWidth) :
        (isMobile ? 0 : collapsedSidebarWidth);

    const contentStyle = {
        marginLeft: `${contentOffset}px`,
        width: `calc(100% - ${contentOffset}px)`,
        transition: 'all 0.3s ease'
    };

    // Add visibility control for mobile
    if (isMobile && sidebarExpanded) {
        contentStyle.opacity = 0;
        contentStyle.visibility = 'hidden';
    }

    return (
        <Container fluid className="p-0">
            <Row className="g-0">
                {/* Sidebar */}
                <Col
                    className="bg-dark text-white py-3"
                    style={sidebarStyle}
                >
                    <Sidebar
                        activeTab={activeTab}
                        setActiveTab={(tab) => {
                            setActiveTab(tab);
                            if (isMobile) {
                                setSidebarExpanded(false);
                            }
                        }}
                        toggleSidebar={toggleSidebar}
                        expanded={sidebarExpanded}
                        isMobile={isMobile}
                    />
                </Col>

                {/* Main Content Area */}
                <Col
                    className="p-3"
                    style={contentStyle}
                >
                    {/* Toggle sidebar button - visible on all screens */}
                    <div className="mb-3 d-flex align-items-center">
                        <button
                            className="btn btn-outline-primary me-3"
                            onClick={toggleSidebar}
                        >
                            <List size={20} />
                        </button>
                        <h4 className="m-0">Admin Dashboard</h4>
                    </div>

                    {/* Dashboard Summary Cards */}
                    <DashboardSummary
                        totalUsers={users.length}
                        activeUsers={users.filter(u => u.status === 'active').length}
                        pendingRequests={paymentRequests.filter(p => p.status === 'pending').length}
                        openTickets={supportTickets.filter(t => t.status === 'open').length}
                    />

                    {/* Main Content Based on Active Tab */}
                    {renderContent()}
                </Col>
            </Row>

            {/* User Edit Modal */}
            <UserEditModal
                show={showUserModal}
                edittingUser={currentUser}
                onHide={() => setShowUserModal(false)}
            />
        </Container>
    );
}

export default AdminDashboard;