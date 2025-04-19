import React from 'react';
import { Card, Table, Badge } from 'react-bootstrap';
import { Trophy } from 'react-bootstrap-icons';

function UserRanking({ users }) {
    // Sort users by points (highest first)
    const rankedUsers = [...users].sort((a, b) => b.points - a.points);

    // Function to determine rank badge color
    const getRankColor = (index) => {
        switch(index) {
            case 0: return 'warning'; // Gold
            case 1: return 'secondary'; // Silver
            case 2: return 'danger'; // Bronze
            default: return 'light';
        }
    };

    return (
        <Card>
            <Card.Header className="d-flex align-items-center">
                <Trophy className="me-2 text-warning" size={20} />
                <h5 className="mb-0">User Ranking by Points</h5>
            </Card.Header>
            <Card.Body>
                <div className="table-responsive">
                    <Table hover>
                        <thead>
                        <tr>
                            <th width="80">Rank</th>
                            <th>User ID</th>
                            <th>Name</th>
                            <th>Points</th>
                            <th>Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rankedUsers.map((user, index) => (
                            <tr key={user.id}>
                                <td>
                                    <Badge
                                        bg={getRankColor(index)}
                                        className="py-2 px-3"
                                        style={{width: '40px'}}
                                    >
                                        {index + 1}
                                    </Badge>
                                </td>
                                <td>{user.id}</td>
                                <td>{user.name}</td>
                                <td>
                                    <strong>{user.points}</strong>
                                </td>
                                <td>
                                    <Badge bg={user.status === 'active' ? 'success' : 'danger'}>
                                        {user.status}
                                    </Badge>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </div>
            </Card.Body>
        </Card>
    );
}

export default UserRanking;