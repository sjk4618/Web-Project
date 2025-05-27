import React, { useState } from "react";
import { useUserStore } from "../store/useUserStore";
import styled from "styled-components";

const AuthContainer = styled.div`
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 2rem;
  color: #2c3e50;
  background: linear-gradient(45deg, #2c3e50, #3498db);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  }

  &::placeholder {
    color: #95a5a6;
  }
`;

const SubmitButton = styled.button`
  padding: 1rem;
  background: linear-gradient(45deg, #3498db, #2980b9);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ToggleButton = styled.button`
  margin-top: 1.5rem;
  background: none;
  border: none;
  color: #3498db;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0.5rem;
  border-radius: 5px;

  &:hover {
    background: rgba(52, 152, 219, 0.1);
  }
`;

const ErrorMessage = styled.p`
  color: #e74c3c;
  font-size: 0.9rem;
  margin: 0;
  padding: 0.5rem;
  background: rgba(231, 76, 60, 0.1);
  border-radius: 5px;
  text-align: center;
`;

const Auth = () => {
  const setUser = useUserStore((state) => state.setUser);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const users = JSON.parse(localStorage.getItem("users") || "[]");

      if (isLogin) {
        // 로그인
        const user = users.find(
          (u) =>
            u.username === formData.username && u.password === formData.password
        );

        if (!user) {
          throw new Error("사용자 이름 또는 비밀번호가 일치하지 않습니다.");
        }

        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            username: user.username,
            token: Math.random().toString(36).substring(7),
          })
        );

        setUser({ username: user.username });
      } else {
        // 회원가입
        if (users.some((u) => u.username === formData.username)) {
          throw new Error("이미 존재하는 사용자 이름입니다.");
        }

        const newUser = {
          username: formData.username,
          password: formData.password,
          scores: [],
        };

        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));

        // 자동 로그인
        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            username: newUser.username,
            token: Math.random().toString(36).substring(7),
          })
        );

        setUser({ username: newUser.username });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AuthContainer>
      <Title>{isLogin ? "로그인" : "회원가입"}</Title>
      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          name="username"
          placeholder="사용자 이름"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <Input
          type="password"
          name="password"
          placeholder="비밀번호"
          value={formData.password}
          onChange={handleChange}
          required
        />
        {!isLogin && (
          <Input
            type="password"
            name="confirmPassword"
            placeholder="비밀번호 확인"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        )}
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <SubmitButton type="submit">
          {isLogin ? "로그인" : "회원가입"}
        </SubmitButton>
      </Form>
      <ToggleButton
        type="button"
        onClick={() => {
          setIsLogin(!isLogin);
          setError("");
          setFormData({
            username: "",
            password: "",
            confirmPassword: "",
          });
        }}
      >
        {isLogin
          ? "계정이 없으신가요? 회원가입"
          : "이미 계정이 있으신가요? 로그인"}
      </ToggleButton>
    </AuthContainer>
  );
};

export default Auth;
