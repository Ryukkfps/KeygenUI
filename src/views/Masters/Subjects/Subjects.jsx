import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Card, Form, Button } from 'react-bootstrap';
import { useUser } from './../../../context/UserContext';
const baseUrl = process.env.REACT_APP_BASE_URL;

const Subjects = () => {
    const { keygenUser } = useUser();
    const token = keygenUser?.token
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [subjectName, setSubjectName] = useState('');
    const [existingSubjects, setExistingSubjects] = useState([]);

    useEffect(() => {
        fetchSubjects();
    }, [subjects]); // Fetch subjects whenever there's a change in the subjects state

    const fetchSubjects = async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/Subjects`,{
                headers:{
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data) {
                setSubjects(response.data);
                setLoading(false);
                const existing = response.data.map(subject => subject.subjectName.toLowerCase());
                setExistingSubjects(existing);
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    const handleAddSubject = async () => {
        try {
            const response = await axios.post(`${baseUrl}/api/Subjects`, { subjectName },{
                headers:{
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.status === 200) {
                setSubjectName('');
                setExistingSubjects([...existingSubjects, subjectName.toLowerCase()]); // Clear the input field
            }
        } catch (error) {
            console.error('Error adding subject:', error);
        }
    };

    return (
        <div className="container mt-3">
            <div className="row">
                <div className="col-md-6 mb-3">
                    <Card>
                        <Card.Header>
                            <Card.Title className="text-center">Subjects</Card.Title>
                        </Card.Header>
                        <Card.Body>
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>Subject ID</th>
                                            <th>Subject Name</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subjects.map((subject) => (
                                            <tr key={subject.subjectID}>
                                                <td>{subject.subjectID}</td>
                                                <td>{subject.subjectName}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                        </Card.Body>
                    </Card>
                </div>
                <div className="col-md-6">
                    <Card>
                        <Card.Header>
                            <Card.Title>
                                Add Subject
                            </Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <h5 className="card-title"></h5>
                            <Form>
                                <Form.Group controlId="formSubject">
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter subject name"
                                        value={subjectName}
                                        onChange={(e) => {
                                            setSubjectName(e.target.value)}
                                        }
                                    />
                                </Form.Group>
                                <div className='mt-4 text-end'>
                                    <Button variant="primary" onClick={handleAddSubject} disabled={existingSubjects.includes(subjectName.toLowerCase())}>Add Subject</Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Subjects;
