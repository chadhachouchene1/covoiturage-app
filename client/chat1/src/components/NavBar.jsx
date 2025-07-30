import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useContext } from 'react'; // you forgot this import
import { AuthContext } from '../context/AuthContext';

const NavBar = () => {
  const { user , logoutUser} = useContext(AuthContext);

  return (
    <Navbar bg="light" className="shadow-sm rounded-bottom px-3 py-2">
      <Container className="d-flex justify-content-between align-items-center">
        <Navbar.Brand as={Link} to="/" style={{ color: '#2e8b57', fontWeight: 'bold', fontSize: '1.5rem' }}>
          ChatApp
        </Navbar.Brand>

        <Nav className="me-auto" style={{ gap: '20px' }}>
            {
                user && ( <>
                
                 <Nav.Link onClick={() => logoutUser()} as={Link} to="/login" style={{ color: '#2e8b57', fontWeight: '500' }}>
            Logout
          </Nav.Link>
                
                
                </>)
            }
            {!user && ( <>
            <Nav.Link as={Link} to="/register" style={{ color: '#2e8b57', fontWeight: '500' }}>
            Register
          </Nav.Link>
          <Nav.Link as={Link} to="/login" style={{ color: '#2e8b57', fontWeight: '500' }}>
            Login
          </Nav.Link>
            
            
            </>)}





          
          <Nav.Link as={Link} to="/chat" style={{ color: '#2e8b57', fontWeight: '500' }}>
            Chat
          </Nav.Link>
        </Nav>

        {user && (
          <span className='text-warning'>Logged in as {user?.name}</span>
        )}
      </Container>
    </Navbar>
  );
};

export default NavBar;
