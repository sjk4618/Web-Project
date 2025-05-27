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
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui,
    Roboto, sans-serif;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
`;

const Title = styled.h1`
  margin: 0;
  color: #2c3e50;
  font-size: 1.8rem;
  font-weight: 700;
  background: linear-gradient(45deg, #2c3e50, #3498db);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Nav = styled.nav`
  display: flex;
  gap: 1.5rem;
  align-items: center;
`;

const Button = styled.button`
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 8px;
  background-color: ${(props) => (props.primary ? "#3498db" : "#f8f9fa")};
  color: ${(props) => (props.primary ? "white" : "#2c3e50")};
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: ${(props) => (props.primary ? "#2980b9" : "#e9ecef")};
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  font-weight: 500;
  color: #2c3e50;
`;

const NavLink = styled(Link)`
  text-decoration: none;
  color: #2c3e50;
  padding: 0.7rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    background-color: #f8f9fa;
    color: #3498db;
    transform: translateY(-2px);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
`;

const LoadingText = styled.h2`
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
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
      <LoadingContainer>
        <LoadingText>로딩 중...</LoadingText>
      </LoadingContainer>
    );
  }

  return (
    <Router>
      <AppContainer>
        <Header>
          <Title>랜덤 명언 타자 게임</Title>
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
