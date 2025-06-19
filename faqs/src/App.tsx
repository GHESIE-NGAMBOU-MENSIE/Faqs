import { useState } from 'react';
import useSWR from 'swr';
import { Card, Button, Container, Row, Col, Form, Navbar , Modal} from 'react-bootstrap';
import './App.css';
import { Question } from './interface.tsx';


// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());



function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, text.lastIndexOf(' ', maxLength)) + '...';
}

function App() {
  const API_URL = 'http://localhost:5180/api/Faqs';

const { data, error, isLoading, mutate } = useSWR(`${API_URL}/GetAll`, fetcher);

  const [filter, setFilter] = useState('');
  const [idFilter, setIdFilter] = useState(''); // State for ID search
  const [answer, setAnswer] = useState('');
  const [question, setFaq] = useState('');
  const [show, setShow] = useState(false);
  const [disabled, setDisable] = useState(false);
  

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);




  // Ensure `questions` is defined as the data fetched from SWR
  const questions: Question[] = data || [];

  // Filter by general text
  const filterQuestions = (questions: Question[], filterText: string): Question[] => {
    const lowercasedFilter = filterText.toLowerCase();
    return questions.filter(
      (qa) =>
        qa.question.toLowerCase().includes(lowercasedFilter) ||
        qa.answer.toLowerCase().includes(lowercasedFilter)
    );
  };

  // Filter by ID
  const getQuestionById = (questions: Question[], id: string): Question | null => {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) return null;
    return questions.find((qa) => qa.id === numericId) || null;
  };

  // Apply filters
  const filteredQuestions = filterQuestions(questions, filter);
  const questionById = getQuestionById(questions, idFilter);

  if (error) return <div>Failed to load</div>;
  if (isLoading) return <div>Loading...</div>;


  // Delete a question
  const deleteQuestion = async (id: number) => {
    try {
      await fetch(`http://localhost:5180/api/Faqs/DeleteById/${id}`, {
        method: 'DELETE',
      });
      mutate(); // Revalidate the list of questions
    } catch (err) {
      console.error('Error deleting question:', err);
    }
  };

    // add a new question
    const addFaq = async (question: string, answer: string) => {
      try {
        const q= {question, answer };
        setDisable(true)
        const response = await fetch(`http://localhost:5180/api/Faqs/Create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(q), // Correctly stringify the payload
          
        });
    
        if (!response.ok) {
          throw new Error(`Failed to post question: ${response.statusText}`);
        }
    
        // Revalidate the list of questions
        mutate();
        
        handleClose()

        resetForm()

        
        
      } catch (err) {
        console.error('Error posting question:', err);
        
      }
      finally{
        setDisable(false);
      }
    };

    const resetForm = async () => {
      
      setFaq('')
      setAnswer('')



    }
  

  return (
    <>
      {/* Frequent Questions Card */}
      <div className="centered-container">
        <Card style={{ width: '70rem' }}></Card>
        <Card className="center-card text-center">
          <Card.Body>
            <Card.Title style={{ fontWeight: 'normal' }}>Frequent Questions</Card.Title>
            <Card.Text>Simple answers to your most common questions</Card.Text>
            <div className="d-flex justify-content-between gap-2">
              <Button variant="success" className="custom-btn">
                Getting started guide
              </Button>
              <Button variant="primary" className="custom-btn">
                Email support
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Search Bar */}
      <Navbar expand="lg" className="bg-body-tertiary" style={{ marginTop: '20px', padding: '10px' }}>
        <Form className="d-flex" style={{ width: '100%' }}>
          <Form.Control
            type="search"
            placeholder="Search..."
            className="me-2"
            aria-label="Search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </Form>
      </Navbar>

      {/* New ID Search Bar */}
      <Navbar expand="lg" className="bg-body-tertiary" style={{ marginTop: '10px', padding: '10px' }}>
        <Form className="d-flex" style={{ width: '100%' }}>
          <Form.Control
            type="search"
            placeholder="Search by question ID..."
            className="me-2"
            aria-label="Search by ID"
            value={idFilter}
            onChange={(e) => setIdFilter(e.target.value)}
          />
        </Form>
      </Navbar>

            {/*modal  to add a new question */}

            <Button variant="primary" onClick={handleShow}>
        Add new question
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add new question</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
          <Form.Group
              className="mb-3"
              controlId="question"
            >
              <Form.Label>Question</Form.Label>
              <Form.Control as="textarea" rows={3}                                
              value={question}
              onChange={(e) => setFaq(e.target.value)} />
            </Form.Group>
            
            <Form.Group
              className="mb-3"
              controlId="Answer"
            >
              <Form.Label>Answer</Form.Label>
              <Form.Control as="textarea" rows={3}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)} />
              
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary"   onClick={() => addFaq(question, answer, )} disabled = {disabled}>
        
          
            Save 
          </Button>
          
        </Modal.Footer>
      </Modal>


      {/* Render Question by ID */}
      {idFilter && questionById ? (
        <Container style={{ marginTop: '20px' }}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Question #{questionById.id}</Card.Title>
              <Card.Text>
                <strong>Q:</strong> {questionById.question}
                <br />
                <strong>A:</strong> {questionById.answer}
              </Card.Text>
            </Card.Body>
          </Card>
        </Container>
      ) : idFilter ? (
        <Container style={{ marginTop: '20px', color: 'red' }}>
          No question found for this ID.
        </Container>
      ) : null}

      {/*  Content section */}
      <Container className="my-5">
        <Row>
          <Col md={6}>
            {filteredQuestions
              .filter((_, index) => index % 2 === 0)
              .map((qa, index) => (
                <div key={index} style={{ marginBottom: '1.5rem' }}>
                  <div style={{ color: 'blue', fontWeight: 'bold' }}>{qa.question}</div>
                  <div style={{ color: 'black' }}>{truncateText(qa.answer, 200)}</div>
                  <Button
                      variant="danger"
                      size="sm"
                      onClick={() => deleteQuestion(qa.id)}
                      style={{ marginTop: '10px' }}
                    >
                      Delete
                    </Button>
                </div>
              ))}
          </Col>
          <Col md={6}>
            {filteredQuestions
              .filter((_, index) => index % 2 !== 0)
              .map((qa, index) => (
                <div key={index} style={{ marginBottom: '1.5rem' }}>
                  <div style={{ color: 'blue', fontWeight: 'bold' }}>{qa.question}</div>
                  <div style={{ color: 'black' }}>{truncateText(qa.answer, 200)}</div>
                  <Button
                      variant="danger"
                      size="sm"
                      onClick={() => deleteQuestion(qa.id)}
                      style={{ marginTop: '10px' }}
                    >
                      Delete
                    </Button>
                </div>
              ))}
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default App;
