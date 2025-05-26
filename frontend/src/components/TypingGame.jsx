import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { Line } from "react-chartjs-2";
import { sentences } from "../data/sentences";
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
import { ENGLISH_QUOTES } from "../constants/englishQuotes";
import axios from "axios";

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

const GameStats = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 5px;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.3rem;
`;

const StatValue = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
`;

const StatDescription = styled.div`
  font-size: 0.8rem;
  color: #888;
  max-width: 150px;
`;

const LoadingView = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #666;
`;

const TypingGame = () => {
  const [difficulty, setDifficulty] = useState("medium");
  const [currentSentence, setCurrentSentence] = useState("");
  const [userInput, setUserInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scores, setScores] = useState([]);
  const [bestScore, setBestScore] = useState(0);
  const [gameStats, setGameStats] = useState({
    correctWords: 0,
    totalTime: 0,
    currentWpm: 0,
    currentCpm: 0,
    averageAccuracy: 0,
  });
  const [, setSentenceQueue] = useState([]);
  const inputRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    let timer;
    if (isGameActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            endGame();
            return 0;
          }
          return prev - 1;
        });

        // WPM과 CPM 실시간 계산
        const elapsedTime = (Date.now() - startTimeRef.current) / 1000 / 60; // 분 단위
        const totalCharacters = userInput.length; // 실제 입력된 문자 수 사용
        const currentWpm = calculateWPM(totalCharacters, elapsedTime);
        const currentCpm = calculateCPM(totalCharacters, elapsedTime);

        setGameStats((prev) => ({
          ...prev,
          currentWpm,
          currentCpm,
        }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isGameActive, timeLeft, userInput]);

  const fetchAndTranslate30Quotes = async () => {
    try {
      const res = await axios.get("/api/quotes?limit=30");
      const quotes = res.data.results.map((item) => item.content);
      const translated = await Promise.all(
        quotes.map(async (quote) => {
          try {
            const response = await axios.post("/api/translate", {
              text: quote,
              source: "en",
              target: "ko",
            });
            return response.data.translatedText;
          } catch (err) {
            console.error("번역 중 오류:", err);
            return quote;
          }
        })
      );
      return translated;
    } catch (err) {
      console.error("Quote API 에러 발생:", err);
      return ENGLISH_QUOTES.slice(0, 30);
    }
  };

  const startGame = async () => {
    setIsLoading(true);
    try {
      const initialSentences = await fetchAndTranslate30Quotes();
      setSentenceQueue(initialSentences);
      setCurrentSentence(initialSentences[0]);
      setUserInput("");
      setTimeLeft(60);
      setIsGameActive(true);
      startTimeRef.current = Date.now();
      setGameStats({
        correctWords: 0,
        totalTime: 0,
        currentWpm: 0,
        currentCpm: 0,
        averageAccuracy: 0,
      });
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (err) {
      console.error("게임 시작 중 오류 발생:", err);
      const localSentences = sentences[difficulty];
      setSentenceQueue(localSentences);
      setCurrentSentence(localSentences[0]);
      setUserInput("");
      setTimeLeft(60);
      setIsGameActive(true);
      startTimeRef.current = Date.now();
      setGameStats({
        correctWords: 0,
        totalTime: 0,
        currentWpm: 0,
        currentCpm: 0,
        averageAccuracy: 0,
      });
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setUserInput(value);
  };

  const handleKeyDown = async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const accuracy = calculateAccuracy();
      const words = currentSentence.split(" ").length;

      setGameStats((prev) => ({
        ...prev,
        correctWords: prev.correctWords + (accuracy === 100 ? words : 0),
        averageAccuracy:
          (prev.averageAccuracy * prev.correctWords + accuracy) /
          (prev.correctWords + 1),
      }));

      setSentenceQueue((prevQueue) => {
        const newQueue = [...prevQueue];
        newQueue.shift();
        // 만약 5개 이하라면, 새 문장 받아와서 뒤에 붙임 (비동기)
        if (newQueue.length <= 5) {
          fetchAndTranslate30Quotes().then((moreSentences) => {
            setSentenceQueue((q) => [...q, ...moreSentences]);
          });
        }
        // 현재 문장과 입력값 갱신
        setCurrentSentence(newQueue[0]);
        setUserInput("");
        return newQueue;
      });
    }
  };

  const endGame = () => {
    setIsGameActive(false);
    const finalStats = {
      wpm: gameStats.currentWpm,
      accuracy: Math.round(gameStats.averageAccuracy),
      correctWords: gameStats.correctWords,
      difficulty,
      date: new Date().toLocaleDateString(),
    };

    const newScores = [...scores, finalStats].slice(-10);
    setScores(newScores);
    localStorage.setItem("typingScores", JSON.stringify(newScores));

    if (finalStats.wpm > bestScore) {
      setBestScore(finalStats.wpm);
      localStorage.setItem("bestScore", finalStats.wpm);
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

          users[userIndex].scores.push(finalStats);
          localStorage.setItem("users", JSON.stringify(users));
        }
      }
    } catch (err) {
      console.error("점수 저장 중 오류:", err);
    }
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

  // WPM과 CPM 계산 함수 추가
  const calculateWPM = (characters, timeInMinutes) => {
    // 평균 단어 길이를 5글자로 가정
    const words = characters / 5;
    return Math.round(words / timeInMinutes);
  };

  const calculateCPM = (characters, timeInMinutes) => {
    return Math.round(characters / timeInMinutes);
  };

  return (
    <Container>
      <GameBox>
        {isLoading ? (
          <LoadingView>
            <TextDisplay>
              명언을 받아오고 있습니다...
              <br />
              잠시만 기다려주세요.
            </TextDisplay>
          </LoadingView>
        ) : (
          <>
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

            {isGameActive && (
              <GameStats>
                <StatItem>
                  <StatLabel>현재 WPM</StatLabel>
                  <StatValue>{gameStats.currentWpm}</StatValue>
                  <StatDescription>
                    WPM(Words Per Minute)은 1분당 입력한 단어 수를 의미합니다.
                  </StatDescription>
                </StatItem>
                <StatItem>
                  <StatLabel>현재 CPM</StatLabel>
                  <StatValue>{gameStats.currentCpm}</StatValue>
                  <StatDescription>
                    CPM(Characters Per Minute)은 1분당 입력한 글자 수를
                    의미합니다.
                  </StatDescription>
                </StatItem>
                <StatItem>
                  <StatLabel>정확도</StatLabel>
                  <StatValue>
                    {Math.round(gameStats.averageAccuracy)}%
                  </StatValue>
                  <StatDescription>
                    정확하게 입력한 글자의 비율입니다.
                  </StatDescription>
                </StatItem>
              </GameStats>
            )}

            <TextDisplay>{renderText()}</TextDisplay>

            <Input
              ref={inputRef}
              value={userInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={!isGameActive}
              placeholder={
                isGameActive
                  ? "타이핑을 시작하세요... (엔터로 다음 문장)"
                  : "게임을 시작하려면 난이도를 선택하세요"
              }
            />

            {!isGameActive && timeLeft === 60 && (
              <Button onClick={startGame}>게임 시작</Button>
            )}

            {!isGameActive && timeLeft === 0 && (
              <ResultBox>
                <ScoreText>최종 WPM: {gameStats.currentWpm}</ScoreText>
                <ScoreText>
                  평균 정확도: {Math.round(gameStats.averageAccuracy)}%
                </ScoreText>
                <ScoreText>정확한 단어: {gameStats.correctWords}</ScoreText>
                <ScoreText>최고 기록: {bestScore} WPM</ScoreText>
                <Button onClick={startGame}>다시 시작</Button>
              </ResultBox>
            )}
          </>
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
