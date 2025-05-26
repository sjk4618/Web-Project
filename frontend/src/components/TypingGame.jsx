import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
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

const TypingGame = () => {
  const [difficulty, setDifficulty] = useState("medium");
  const [currentSentence, setCurrentSentence] = useState("");
  const [translatedSentence, setTranslatedSentence] = useState("");
  const [userInput, setUserInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameActive, setIsGameActive] = useState(false);
  const [scores, setScores] = useState([]);
  const [bestScore, setBestScore] = useState(0);
  const [gameStats, setGameStats] = useState({
    totalWords: 0,
    correctWords: 0,
    totalTime: 0,
    currentWpm: 0,
    currentCpm: 0,
    averageAccuracy: 0,
  });
  const inputRef = useRef(null);
  const startTimeRef = useRef(null);
  const [quotes, setQuotes] = useState([]);
  const [translatedQuotes, setTranslatedQuotes] = useState([]);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  
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
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isGameActive, timeLeft]);

  const fetchAndTranslateQuotes = async () => {
    try {
      setIsLoading(true);
      // 명언 50개 가져오기
      const res = await axios.get("/api/quotes");
      const fetchedQuotes =
        res.data.results?.map((result) => result.content) || ENGLISH_QUOTES;

      // 순차적으로 번역
      const translatedResults = [];
      for (const quote of fetchedQuotes) {
        try {
          const translationRes = await axios.post("/api/translate", {
            text: quote,
          });
          const translatedText =
            translationRes.data.translations?.[0]?.text ?? "";
          translatedResults.push(translatedText);
          console.log(`번역 완료: ${quote} -> ${translatedText}`);
        } catch (err) {
          console.error("번역 실패:", err);
          translatedResults.push("");
        }
        // API 호출 간 약간의 딜레이 추가
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      setQuotes(fetchedQuotes);
      setTranslatedQuotes(translatedResults);
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error("명언 가져오기 실패:", err);
      setIsLoading(false);
      return false;
    }
  };

  const startGame = async () => {
    try {
      // 명언과 번역 가져오기
      const success = await fetchAndTranslateQuotes();
      if (!success) {
        throw new Error("명언 가져오기 실패");
      }

      setCurrentQuoteIndex(0);
      setCurrentSentence(quotes[0]);
      setTranslatedSentence(translatedQuotes[0]);
      setUserInput("");
      setTimeLeft(60);
      setIsGameActive(true);
      startTimeRef.current = Date.now();
      setGameStats({
        totalWords: 0,
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
      setCurrentSentence(ENGLISH_QUOTES[0]);
      setTranslatedSentence("");
      setUserInput("");
      setTimeLeft(60);
      setIsGameActive(true);
      startTimeRef.current = Date.now();
      setGameStats({
        totalWords: 0,
        correctWords: 0,
        totalTime: 0,
        currentWpm: 0,
        currentCpm: 0,
        averageAccuracy: 0,
      });
      if (inputRef.current) {
        inputRef.current.focus();
      }
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
      const words = (currentSentence || "").split(" ").length;

      setGameStats((prev) => ({
        ...prev,
        totalWords: prev.totalWords + words,
        correctWords: prev.correctWords + (accuracy === 100 ? words : 0),
        averageAccuracy:
          (prev.averageAccuracy * prev.totalWords + accuracy) /
          (prev.totalWords + 1),
      }));

      // 다음 문장으로 이동
      const nextIndex = (currentQuoteIndex + 1) % quotes.length;
      setCurrentQuoteIndex(nextIndex);
      setCurrentSentence(quotes[nextIndex]);
      setTranslatedSentence(translatedQuotes[nextIndex]);
      setUserInput("");
    }
  };

  const endGame = () => {
    setIsGameActive(false);
    const finalStats = {
      wpm: gameStats.currentWpm,
      accuracy: Math.round(gameStats.averageAccuracy),
      totalWords: gameStats.totalWords,
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
    if (
      !currentSentence ||
      typeof currentSentence !== "string" ||
      !currentSentence.length
    ) {
      return <span>문장을 불러오는 중입니다...</span>;
    }

    return (currentSentence || "").split("").map((char, index) => {
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

        {isLoading && (
          <div style={{ textAlign: "center", margin: "2rem 0" }}>
            명언을 번역하는 중입니다... 잠시만 기다려주세요.
          </div>
        )}

        {isGameActive && !isLoading && (
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
                CPM(Characters Per Minute)은 1분당 입력한 글자 수를 의미합니다.
              </StatDescription>
            </StatItem>
            <StatItem>
              <StatLabel>정확도</StatLabel>
              <StatValue>{Math.round(gameStats.averageAccuracy)}%</StatValue>
              <StatDescription>
                정확하게 입력한 글자의 비율입니다.
              </StatDescription>
            </StatItem>
            <StatItem>
              <StatLabel>총 단어</StatLabel>
              <StatValue>{gameStats.totalWords}</StatValue>
              <StatDescription>
                지금까지 입력한 총 단어 수입니다.
              </StatDescription>
            </StatItem>
          </GameStats>
        )}

        <TextDisplay>
          {renderText()}
          {translatedSentence && (
            <div
              style={{ marginTop: "1rem", color: "#666", fontSize: "1.2rem" }}
            >
              {translatedSentence}
            </div>
          )}
        </TextDisplay>

        <Input
          ref={inputRef}
          value={userInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={!isGameActive || isLoading}
          placeholder={
            isLoading
              ? "명언을 번역하는 중입니다..."
              : isGameActive
              ? "타이핑을 시작하세요... (엔터로 다음 문장)"
              : "게임을 시작하려면 난이도를 선택하세요"
          }
        />

        {!isGameActive && timeLeft === 60 && !isLoading && (
          <Button onClick={startGame}>게임 시작</Button>
        )}

        {!isGameActive && timeLeft === 0 && (
          <ResultBox>
            <ScoreText>최종 WPM: {gameStats.currentWpm}</ScoreText>
            <ScoreText>
              평균 정확도: {Math.round(gameStats.averageAccuracy)}%
            </ScoreText>
            <ScoreText>총 입력 단어: {gameStats.totalWords}</ScoreText>
            <ScoreText>정확한 단어: {gameStats.correctWords}</ScoreText>
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
