import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { sentences } from "../data/sentences";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: "Noto Sans KR", sans-serif;
`;

const GameBox = styled.div`
  background: white;
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const TextDisplay = styled.div`
  font-size: 1.5rem;
  line-height: 2;
  margin-bottom: 2rem;
  min-height: 100px;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  font-size: 1.2rem;
  border: 2px solid #ddd;
  border-radius: 5px;
  margin-bottom: 1rem;

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const Timer = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${(props) => (props.time <= 10 ? "#ff4444" : "#333")};
  margin-bottom: 1rem;
`;

const DifficultyButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  background-color: ${(props) => (props.active ? "#4CAF50" : "#ddd")};
  color: ${(props) => (props.active ? "white" : "#333")};
  cursor: pointer;

  &:hover {
    background-color: ${(props) => (props.active ? "#45a049" : "#ccc")};
  }
`;

const ResultBox = styled.div`
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 10px;
  margin-top: 2rem;
`;

const ScoreText = styled.p`
  font-size: 1.2rem;
  margin: 0.5rem 0;
`;

const ChartContainer = styled.div`
  margin-top: 2rem;
  height: 300px;
`;

const TypingGame = () => {
  const [difficulty, setDifficulty] = useState("medium");
  const [currentSentence, setCurrentSentence] = useState("");
  const [userInput, setUserInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameActive, setIsGameActive] = useState(false);
  const [scores, setScores] = useState([]);
  const [bestScore, setBestScore] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    const savedScores = JSON.parse(
      localStorage.getItem("typingScores") || "[]"
    );
    const savedBestScore = localStorage.getItem("bestScore") || 0;
    setScores(savedScores);
    setBestScore(Number(savedBestScore));
  }, []);

  useEffect(() => {
    if (isGameActive && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      endGame();
    }
  }, [isGameActive, timeLeft]);

  const startGame = () => {
    const sentenceList = sentences[difficulty];
    const randomIndex = Math.floor(Math.random() * sentenceList.length);
    setCurrentSentence(sentenceList[randomIndex]);
    setUserInput("");
    setTimeLeft(60);
    setIsGameActive(true);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const endGame = () => {
    setIsGameActive(false);
    const wpm = calculateWPM();
    const accuracy = calculateAccuracy();
    const newScore = { wpm, accuracy, date: new Date().toLocaleDateString() };

    const newScores = [...scores, newScore].slice(-10);
    setScores(newScores);
    localStorage.setItem("typingScores", JSON.stringify(newScores));

    if (wpm > bestScore) {
      setBestScore(wpm);
      localStorage.setItem("bestScore", wpm);
    }

    // 로컬 스토리지에 점수 저장
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (currentUser) {
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        const userIndex = users.findIndex(
          (u) => u.username === currentUser.username
        );

        if (userIndex !== -1) {
          if (!users[userIndex].scores) {
            users[userIndex].scores = [];
          }

          users[userIndex].scores.push({
            wpm,
            accuracy,
            difficulty,
            date: new Date().toLocaleDateString(),
          });

          localStorage.setItem("users", JSON.stringify(users));
        }
      }
    } catch (err) {
      console.error("점수 저장 중 오류:", err);
    }
  };

  const calculateWPM = () => {
    const words = currentSentence.split(" ").length;
    const timeInMinutes = (60 - timeLeft) / 60;
    return Math.round(words / timeInMinutes);
  };

  const calculateAccuracy = () => {
    let correct = 0;
    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] === currentSentence[i]) {
        correct++;
      }
    }
    return Math.round((correct / userInput.length) * 100) || 0;
  };

  const renderText = () => {
    return currentSentence.split("").map((char, index) => {
      let color = "#666";
      if (index < userInput.length) {
        color = userInput[index] === char ? "#4CAF50" : "#ff4444";
      }
      return (
        <span key={index} style={{ color }}>
          {char}
        </span>
      );
    });
  };

  const chartData = {
    labels: scores.map((score) => score.date),
    datasets: [
      {
        label: "WPM",
        data: scores.map((score) => score.wpm),
        borderColor: "#4CAF50",
        tension: 0.1,
      },
      {
        label: "정확도 (%)",
        data: scores.map((score) => score.accuracy),
        borderColor: "#2196F3",
        tension: 0.1,
      },
    ],
  };

  return (
    <Container>
      <GameBox>
        <DifficultyButtons>
          <Button
            active={difficulty === "easy"}
            onClick={() => setDifficulty("easy")}
          >
            쉬움
          </Button>
          <Button
            active={difficulty === "medium"}
            onClick={() => setDifficulty("medium")}
          >
            보통
          </Button>
          <Button
            active={difficulty === "hard"}
            onClick={() => setDifficulty("hard")}
          >
            어려움
          </Button>
        </DifficultyButtons>

        <Timer time={timeLeft}>{timeLeft}초</Timer>

        <TextDisplay>{renderText()}</TextDisplay>

        <Input
          ref={inputRef}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          disabled={!isGameActive}
          placeholder={
            isGameActive
              ? "타이핑을 시작하세요..."
              : "게임을 시작하려면 난이도를 선택하세요"
          }
          onKeyDown={(e) => {
            if (!isGameActive && e.key !== "Enter") {
              startGame();
            }
          }}
        />

        {!isGameActive && timeLeft === 60 && (
          <Button onClick={startGame}>게임 시작</Button>
        )}

        {!isGameActive && timeLeft === 0 && (
          <ResultBox>
            <ScoreText>WPM: {calculateWPM()}</ScoreText>
            <ScoreText>정확도: {calculateAccuracy()}%</ScoreText>
            <ScoreText>최고 기록: {bestScore} WPM</ScoreText>
            <Button onClick={startGame}>다시 시작</Button>
          </ResultBox>
        )}
      </GameBox>

      {scores.length > 0 && (
        <ChartContainer>
          <Line data={chartData} />
        </ChartContainer>
      )}
    </Container>
  );
};

export default TypingGame;
