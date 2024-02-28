import React, { useEffect, useState } from 'react';
import { Table, Button, Form, Alert, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
const sessionApi = process.env.REACT_APP_API_SESSION;
const sessionbyGroupIDApi = process.env.REACT_APP_API_SESSION_BY_GROUP;

const GroupSessions = ({ group, onViewSession }) => {
    const [sessions, setSessions] = useState(null);
    const [selectedSession, setSelectedSession] = useState('');
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const generateFutureSessions = (backyear,numYears) => {
        const currentYear = new Date().getFullYear();
        const startYear = currentYear - backyear;
        const sessions = [];
        for (let year = startYear; year < startYear + numYears; year++) {
            sessions.push(`${year}-${String(year + 1).slice(-2)}`);
        }
        return sessions;
    };

    const generatedSessions = generateFutureSessions(5,15);

    useEffect(() => {
        fetchSessions();
    },[group]);

    const fetchSessions = () => {
        fetch(`${sessionbyGroupIDApi}/${group}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Failed to fetch sessions');
                }
                return res.json();
            })
            .then((data) => {
                setSessions(data);
                setError(null);
            })
            .catch((err) => {
                console.error('Error Fetching Sessions:', err);
                setSessions(null);
            });
    };

    const addSession = () => {
        if (!selectedSession) {
            setError('Please select a session.');
            return;
        }

        fetch(sessionApi, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                session_Name: selectedSession,
                groupID: group
            })
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Failed to add session');
                }
                setSelectedSession('');
                fetchSessions();
            })
            .catch((err) => {
                console.error('Error Adding Session:', err);
                setError('Failed to add session. Please try again.');
            });
    };

    return (
        <div className='border border-1 p-3'>
            <h2>Sessions</h2>
            <hr />
            <Form.Group className="mb-3">
                <Form.Label>Add Session</Form.Label>
                <div className="input-group">
                    <Form.Select
                        value={selectedSession}
                        onChange={(e) => setSelectedSession(e.target.value)}
                        className="form-select"
                    >
                        <option value="">Select Session</option>
                        {generatedSessions.map((session, index) => {
                            const isSessionAdded = sessions && sessions.some(s => s.session_Name === session && s.groupID === group);
                            return (
                                <option key={index} value={session} disabled={isSessionAdded}>
                                    {session} {isSessionAdded ? "(Already Added)" : ""}
                                </option>
                            );
                        })}
                    </Form.Select>
                    <button className="btn btn-primary" type="button" onClick={addSession}>Add</button>
                </div>
            </Form.Group>

            {error && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                    {error}
                </Alert>
            )}
            {sessions === null ? (
                <Alert variant="info">No sessions found.</Alert>
            ) : (
                sessions && sessions.length > 0 && (
                    <>
                        <InputGroup className="mb-3">
                            <Form.Control
                                type="text"
                                placeholder="Search Session"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <InputGroup.Text> <FontAwesomeIcon icon={faSearch} /></InputGroup.Text>
                        </InputGroup>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th className='text-center'>Sessions</th>
                                    <th className='text-center'>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessions
                                    .filter((session) =>
                                        session.session_Name.toLowerCase().includes(searchQuery.toLowerCase())
                                    )
                                    .sort((a, b) => a.session_Name.localeCompare(b.session_Name)) // Sort sessions by session name
                                    .map((session) => (
                                        <tr key={session.session_Id}>
                                            <td className='p-2 text-center'>{session.session_Name}</td>
                                            <td className='p-2 text-center'>
                                                <Button variant='primary' size='sm' onClick={() => onViewSession(session)}>
                                                    Paper
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </Table>
                    </>
                )
            )}
        </div>
    );
};

GroupSessions.propTypes = {
    group: PropTypes.number.isRequired,
    onViewSession: PropTypes.func.isRequired
};

export default GroupSessions;
