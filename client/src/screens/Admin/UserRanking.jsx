import React, {useCallback, useMemo} from 'react';
import { Card, Table, Badge } from 'react-bootstrap';
import { Trophy } from 'react-bootstrap-icons';
import {formatFirebaseTimestamp} from "../../utils/helper.js";

function UserRanking({ users }) {
    const rankedUsers = useMemo(() => {
        return [...users].sort((a, b) => b.points - a.points);
    }, [users]);

    const getRankColor = useCallback((index) => {
        switch(index) {
            case 0: return 'warning'; // Gold
            case 1: return 'secondary'; // Silver
            case 2: return 'danger'; // Bronze
            default: return 'light';
        }
    }, []);

    return (
        <Card>
            <Card.Header className="d-flex align-items-center">
                <Trophy className="me-2 text-warning" size={20} />
                <h5 className="mb-0">Classifica utenti</h5>
            </Card.Header>
            <Card.Body>
                <div className="table-responsive">
                    <Table hover>
                        <thead>
                        <tr>
                            <th width="80">Rank</th>
                            <th>Utente</th>
                            <th>Punti</th>
                            <th>Coins</th>
                            <th>Squadra</th>
                            <th>Codice referral</th>
                            <th>Data Registrazione</th>
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
                                <td>{user.name+" "+user.surname}</td>
                                <td>
                                    <strong>{user.points}</strong>
                                </td>
                                <td>
                                    <strong>{user.coins}</strong>
                                </td>
                                <td>
                                    {user.team}
                                </td>
                                <td>
                                    {user.referralCode}
                                </td>
                                <td>
                                    {formatFirebaseTimestamp(user.createdAt)}
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