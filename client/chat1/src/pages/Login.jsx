import { Alert, Button, Form, Row, Col, Stack } from "react-bootstrap";

const Login = () => {
  return (
    <>
      <Form style={{ maxWidth: '400px', margin: 'auto', marginTop: '2rem', padding: '1.5rem', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '10px' }}>
        <Stack gap={3}>
            <h2>Login</h2>
          <Form.Group controlId="formName">
            <Form.Label>Name</Form.Label>
            <Form.Control type="text" placeholder="Enter your name" />
          </Form.Group>

          <Form.Group controlId="formEmail">
            <Form.Label>Email </Form.Label>
            <Form.Control type="email" placeholder="Enter your email" />
          </Form.Group>

          <Form.Group controlId="formPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" placeholder="Enter your password" />
          </Form.Group>

          <Button variant="success" type="submit" className="mt-3">
            Login
          </Button>
          <Alert variant="danger"><p> An error occured</p></Alert>
        </Stack>
      </Form>
    </>
  );
};

export default Login;
