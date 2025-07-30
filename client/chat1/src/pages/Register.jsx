import { Alert, Button, Form, Stack } from "react-bootstrap";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Register = () => {
  const {
    registerInfo,
    updateRegisterInfo,
    registerUser,
    registerError,
    isRegisterLoading,
  } = useContext(AuthContext);

  return (
    <Form
      onSubmit={registerUser}
      style={{
        maxWidth: "400px",
        margin: "auto",
        marginTop: "2rem",
        padding: "1.5rem",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        borderRadius: "10px",
      }}
    >
      <Stack gap={3}>
        <h2>Register</h2>

        <Form.Group controlId="formName">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter your name"
            value={registerInfo.name}
            onChange={(e) =>
              updateRegisterInfo({ ...registerInfo, name: e.target.value })
            }
          />
        </Form.Group>

        <Form.Group controlId="formEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter your email"
            value={registerInfo.email}
            onChange={(e) =>
              updateRegisterInfo({ ...registerInfo, email: e.target.value })
            }
          />
        </Form.Group>

        <Form.Group controlId="formPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter your password"
            value={registerInfo.password}
            onChange={(e) =>
              updateRegisterInfo({ ...registerInfo, password: e.target.value })
            }
          />
        </Form.Group>

        <Button variant="success" type="submit" className="mt-3">
          {isRegisterLoading ? "Creating your account..." : "Register"}
        </Button>

        {registerError && <Alert variant="danger">{registerError}</Alert>}
      </Stack>
    </Form>
  );
};

export default Register;
