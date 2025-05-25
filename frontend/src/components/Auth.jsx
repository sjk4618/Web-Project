import React, { useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #4caf50;
  }
`;

const Button = styled.button`
  padding: 0.8rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;

  &:hover {
    background-color: #45a049;
  }
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: #4caf50;
  cursor: pointer;
  margin-top: 1rem;
  font-size: 0.9rem;

  &:hover {
    text-decoration: underline;
  }
`;

const ErrorMessage = styled.p`
  color: #ff4444;
  margin: 0;
  font-size: 0.9rem;
`;

const Auth = ({ onLogin }) => {
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
            token: Math.random().toString(36).substring(7), // 간단한 토큰 생성
          })
        );

        onLogin({ username: user.username });
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

        onLogin({ username: newUser.username });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container>
      <h2>{isLogin ? "로그인" : "회원가입"}</h2>
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
        <Button type="submit">{isLogin ? "로그인" : "회원가입"}</Button>
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
    </Container>
  );
};

export default Auth;
