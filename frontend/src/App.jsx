import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";
import styled from "styled-components";
import TypingGame from "./components/TypingGame";
import Auth from "./components/Auth";
import Ranking from "./components/Ranking";
import MyPage from "./components/MyPage";
import { useUserStore } from "./store/useUserStore";

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

const NavLink = styled(Link)`
  text-decoration: none;
  color: #333;
  padding: 0.5rem 1rem;
  border-radius: 5px;

  &:hover {
    background-color: #f5f5f5;
  }
`;

function App() {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const logout = useUserStore((state) => state.logout);
  const [isLoading, setIsLoading] = useState(true);
  const [gameKey, setGameKey] = useState(0);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser) {
      setUser({ username: currentUser.username });
    }
    setIsLoading(false);
  }, [setUser]);

  if (isLoading) {
    return (
      <AppContainer>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h2>로딩 중...</h2>
        </div>
      </AppContainer>
    );
  }

  return (
    <Router>
      <AppContainer>
        <Header>
          <Title>랜덤 명언 타이핑 게임</Title>
          <Nav>
            {user ? (
              <>
                <UserInfo>
                  <span>안녕하세요, {user.username}님!</span>
                  <NavLink
                    to="/"
                    onClick={() => setGameKey((prev) => prev + 1)}
                  >
                    게임
                  </NavLink>
                  <NavLink to="/ranking">랭킹</NavLink>
                  <NavLink to="/mypage">마이페이지</NavLink>
                  <Button onClick={logout}>로그아웃</Button>
                </UserInfo>
              </>
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
            element={
              user ? <TypingGame key={gameKey} /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/login"
            element={user ? <Navigate to="/" /> : <Auth />}
          />
          <Route
            path="/ranking"
            element={user ? <Ranking /> : <Navigate to="/login" />}
          />
          <Route
            path="/mypage"
            element={user ? <MyPage /> : <Navigate to="/login" />}
          />
        </Routes>
      </AppContainer>
    </Router>
  );
}

export default App;
