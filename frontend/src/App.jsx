import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import styled from "styled-components";
import TypingGame from "./components/TypingGame";
import Auth from "./components/Auth";
import Ranking from "./components/Ranking";

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 2rem;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  margin: 0;
  color: #333;
`;

const Nav = styled.nav`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  background-color: ${(props) => (props.primary ? "#4CAF50" : "#ddd")};
  color: ${(props) => (props.primary ? "white" : "#333")};
  cursor: pointer;

  &:hover {
    background-color: ${(props) => (props.primary ? "#45a049" : "#ccc")};
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser) {
      setUser({ username: currentUser.username });
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setUser(null);
  };

  return (
    <Router>
      <AppContainer>
        <Header>
          <Title>타이핑 게임</Title>
          <Nav>
            {user ? (
              <UserInfo>
                <span>안녕하세요, {user.username}님!</span>
                <Button onClick={handleLogout}>로그아웃</Button>
              </UserInfo>
            ) : (
              <Button primary onClick={() => (window.location.href = "/login")}>
                로그인
              </Button>
            )}
          </Nav>
        </Header>

        <Routes>
          <Route
            path="/"
            element={user ? <TypingGame /> : <Navigate to="/login" />}
          />
          <Route
            path="/login"
            element={
              user ? <Navigate to="/" /> : <Auth onLogin={handleLogin} />
            }
          />
          <Route
            path="/ranking"
            element={user ? <Ranking /> : <Navigate to="/login" />}
          />
        </Routes>
      </AppContainer>
    </Router>
  );
}

export default App;
