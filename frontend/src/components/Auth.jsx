import React, { useState } from "react";
import { useUserStore } from "../store/useUserStore";

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
    <div className="max-w-md mx-auto my-8 p-8 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {isLogin ? "로그인" : "회원가입"}
      </h2>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="사용자 이름"
          value={formData.username}
          onChange={handleChange}
          required
          className="p-3 border-2 border-gray-200 rounded focus:outline-none focus:border-green-500 text-base"
        />
        <input
          type="password"
          name="password"
          placeholder="비밀번호"
          value={formData.password}
          onChange={handleChange}
          required
          className="p-3 border-2 border-gray-200 rounded focus:outline-none focus:border-green-500 text-base"
        />
        {!isLogin && (
          <input
            type="password"
            name="confirmPassword"
            placeholder="비밀번호 확인"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="p-3 border-2 border-gray-200 rounded focus:outline-none focus:border-green-500 text-base"
          />
        )}
        {error && <p className="text-red-500 text-sm m-0">{error}</p>}
        <button
          type="submit"
          className="p-3 bg-green-500 text-white rounded text-base font-semibold hover:bg-green-600 transition-colors"
        >
          {isLogin ? "로그인" : "회원가입"}
        </button>
      </form>
      <button
        type="button"
        className="mt-4 text-green-500 text-sm hover:underline focus:outline-none bg-transparent"
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
      </button>
    </div>
  );
};

export default Auth;
