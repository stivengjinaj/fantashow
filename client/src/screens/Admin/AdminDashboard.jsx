import React, {useState, useEffect, useContext} from 'react';
import {Container, Row, Col, Button} from 'react-bootstrap';
import Sidebar from './Sidebar';
import DashboardSummary from './DashboardSummary';
import RegisteredUsers from './RegisteredUsers';
import UserRanking from './UserRanking';
import CashPaymentRequests from './CashPaymentRequests';
import AllPayments from './AllPayments';
import SupportSection from './SupportSection';
import UserEditModal from './UserEditModal';
import { List } from 'react-bootstrap-icons';
import {getAdminData, getAllCashPaymentRequests, getAllUsers, getSupportTickets} from "../../API.js";
import {UserContext} from "../Contexts/UserContext.jsx";
import { debounce } from 'lodash';
import NewAdmin from "./NewAdmin.jsx";
import NewUser from "./NewUser.jsx";
import QrCodeDownloadButton from "../misc/QrCodeDownloadButton.jsx";

function AdminDashboard() {
    const { user } = useContext(UserContext);
    const [ adminData, setAdminData ] = useState(null);
    const [activeTab, setActiveTab] = useState('users');
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    const [showUserModal, setShowUserModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [users, setUsers] = useState([]);
    const [cashPayments, setCashPayments] = useState([]);
    const [supportTickets, setSupportTickets] = useState([]);

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

        const fetchCashPayments = async () => {
            try {
                const token = await user.getIdToken();
                const data = await getAllCashPaymentRequests(user.uid, token);
                if (data.success) {
                    setCashPayments(data.message);
                }
            }catch (error) {
                console.error("Error fetching cash payments:", error);
            }
        }

        const fetchSupportTickets = async () => {
            try {
                const token = await user.getIdToken();
                const data = await getSupportTickets(user.uid, token);
                if (data.success) {
                    setSupportTickets(data.message);
                }
            } catch (error) {
                console.error("Error fetching support tickets:", error);
            }
        }

        const fetchAdminData = async () => {
            try {
                const token = await user.getIdToken();
                const data = await getAdminData(user.uid, token);
                if (data.success) {
                    setAdminData(data.message);
                }
            }catch (error) {
                console.error("Error fetching admin data:", error);
            }
        }

        if (user) {
            fetchAdminData();
            fetchUsers();
            fetchCashPayments();
            fetchSupportTickets();
        }
    }, [user]);

    const handleUserUpdate = (updatedUser) => {
        setUsers(prevUsers =>
            prevUsers.map(u =>
                u.id === updatedUser.id ? { ...u, ...updatedUser } : u
            )
        );
    };

    const handleUserDelete = (deletedUser) => {
        setUsers(prevUsers => prevUsers.filter(user => user.id !== deletedUser.id));
    };

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
                return <RegisteredUsers
                    admin={user}
                    users={users}
                    onEditUser={handleEditUser}
                    onDeleteUser={handleUserDelete}
                />;
            case 'ranking':
                return <UserRanking
                    users={users}
                />;
            case 'cashRequests':
                return <CashPaymentRequests
                    admin={user}
                    onEditUsers={setUsers}
                    cashPayments={cashPayments}
                    setCashPayments={setCashPayments}
                    users={users}
                />;
            case 'allPayments':
                return <AllPayments
                    users={users}
                />;
            case 'support':
                return <SupportSection
                    admin={user}
                    tickets={supportTickets}
                    setTickets={setSupportTickets}
                    users={users}
                />;
            case 'newAdmin':
                return <NewAdmin admin={user} />
            case 'newUser':
                return <NewUser />
            default:
                return <div>Seleziona una scheda dal menu a sinistra.</div>;
        }
    };

    // Calculate sidebar and content classes/styles based on state
    const sidebarWidth = 240;
    const collapsedSidebarWidth = 60;

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

    // The main content area needs an offset based on the sidebar state
    const contentOffset = sidebarExpanded ?
        (isMobile ? 0 : sidebarWidth) :
        (isMobile ? 0 : collapsedSidebarWidth);

    const contentStyle = {
        marginLeft: `${contentOffset}px`,
        width: `calc(100% - ${contentOffset}px)`,
        transition: 'all 0.3s ease'
    };

    // Visibility control for mobile
    if (isMobile && sidebarExpanded) {
        contentStyle.opacity = 0;
        contentStyle.visibility = 'hidden';
    }

    const handleCopyReferral = () => {
        navigator.clipboard.writeText(`https://fantashow.onrender.com/referral/${adminData.referralCode}`)
            .then(() => {
                alert("Codice referral copiato!");
            })
            .catch((err) => {
                console.error("Failed to copy referral code: ", err);
            });
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
                    {/* Toggle the sidebar button-visible on all screens */}
                    <div className="mb-3 d-flex align-items-center">
                        <button
                            className="btn btn-outline-primary me-3"
                            onClick={toggleSidebar}
                        >
                            <List size={20} />
                        </button>
                        <h4 className="m-0">Admin Dashboard</h4>
                        {adminData && <Button className="mx-3 blue-button" onClick={handleCopyReferral}>Copia referral</Button>}
                        {adminData && <QrCodeDownloadButton url={`https://fantashow.onrender.com/referral/${adminData.referralCode}`} smallScreen={false} /> }
                    </div>

                    {/* Dashboard Summary Cards */}
                    <DashboardSummary
                        totalUsers={users.length}
                        paidUsers={users.filter(u => u.paid).length}
                        notPaidUsers={users.filter(p => !p.paid).length}
                        openTickets={supportTickets.filter(t => !t.solved).length}
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
                onUserUpdated={handleUserUpdate}
            />
        </Container>
    );
}

export default AdminDashboard;