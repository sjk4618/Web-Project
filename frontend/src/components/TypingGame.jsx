import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { sentences } from "../data/sentences";
import { ENGLISH_QUOTES } from "../constants/englishQuotes";
import axios from "axios";

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
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  min-width: 300px;
`;

const LoadingSpinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4caf50;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.div`
  margin-bottom: 0.5rem;
  font-weight: bold;
`;

const LoadingSubText = styled.div`
  font-size: 0.9rem;
  color: #888;
`;

const LanguageSelection = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const LanguageButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
`;

const TypingGame = () => {
  const [difficulty, setDifficulty] = useState("medium");
  const [language, setLanguage] = useState(null); // 'ko' 또는 'en'
  const [currentSentence, setCurrentSentence] = useState("");
  const [userInput, setUserInput] = useState("");
  const [isGameActive, setIsGameActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scores, setScores] = useState([]);
  const [bestScore, setBestScore] = useState(0);
  const [gameStats, setGameStats] = useState({
    correctWords: 0,
    totalTime: 0,
    averageAccuracy: 0,
    typingSpeed: 0,
    totalKeystrokes: 0,
    correctKeystrokes: 0,
    elapsedTime: 0,
    completedSentences: 0,
  });
  const [_remainingSentences, setRemainingSentences] = useState([]);
  const inputRef = useRef(null);
  const startTimeRef = useRef(null);
  const keystrokeTimesRef = useRef([]);
  const lastKeystrokeTimeRef = useRef(null);

  const formatElapsedTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}분 ${remainingSeconds}초`;
  };

  // 한글 자모 분리 함수 수정
  const decomposeHangul = (char) => {
    const code = char.charCodeAt(0);
    if (code < 0xac00 || code > 0xd7a3) return [char]; // 한글이 아닌 경우

    const syllable = code - 0xac00;
    const final = syllable % 28;
    const medial = ((syllable - final) / 28) % 21;
    const initial = Math.floor((syllable - final) / 28 / 21);

    const result = [];
    if (initial > 0) result.push(String.fromCharCode(0x1100 + initial - 1)); // 초성
    if (medial > 0) result.push(String.fromCharCode(0x1161 + medial - 1)); // 중성
    if (final > 0) result.push(String.fromCharCode(0x11a7 + final)); // 종성

    return result;
  };

  // 한글 타수 계산 함수 수정
  const calculateHangulKeystrokes = (text) => {
    return text.split("").reduce((count, char) => {
      const decomposed = decomposeHangul(char);
      return count + decomposed.length;
    }, 0);
  };

  useEffect(() => {
    let timer;
    if (isGameActive) {
      timer = setInterval(() => {
        const currentTime = Date.now();
        const elapsedTime = (currentTime - startTimeRef.current) / 1000;

        // 현재 문장에서 정확한 입력만 필터링
        const correctInput = userInput
          .split("")
          .filter((char, index) => char === currentSentence[index])
          .join("");

        // 현재 문장의 타수 계산 (한컴타자 방식)
        const correctKeystrokes = calculateHangulKeystrokes(correctInput);

        // 최근 10초 동안의 타수 계산
        const recentKeystrokes = keystrokeTimesRef.current.filter(
          (time) => currentTime - time <= 10000
        ).length;

        let typingSpeed;
        if (lastKeystrokeTimeRef.current) {
          const timeSinceLastKeystroke =
            (currentTime - lastKeystrokeTimeRef.current) / 1000;
          if (timeSinceLastKeystroke > 1) {
            // 1초 이상 입력이 없으면
            // 타수를 점진적으로 감소
            const decayFactor = Math.min(timeSinceLastKeystroke / 10, 1); // 최대 10초 동안 감소
            const decayedKeystrokes = Math.floor(
              recentKeystrokes * (1 - decayFactor)
            );
            typingSpeed = Math.round((decayedKeystrokes / 10) * 60);
          } else {
            typingSpeed = Math.round((recentKeystrokes / 10) * 60);
          }
        } else {
          typingSpeed = Math.round((recentKeystrokes / 10) * 60);
        }

        setGameStats((prev) => ({
          ...prev,
          correctKeystrokes,
          typingSpeed,
          elapsedTime,
        }));
      }, 100); // 0.1초마다 업데이트
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isGameActive, userInput, currentSentence]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setUserInput(value);
    lastKeystrokeTimeRef.current = Date.now();

    if (value.length > userInput.length) {
      // 새로운 키 입력이 있을 때마다 타수 증가
      const newChar = value[value.length - 1];
      const keystrokes = calculateHangulKeystrokes(newChar);
      for (let i = 0; i < keystrokes; i++) {
        keystrokeTimesRef.current.push(Date.now());
      }
    }
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
        completedSentences: prev.completedSentences + 1,
      }));

      if (gameStats.completedSentences + 1 >= 10) {
        endGame();
        return;
      }

      setRemainingSentences((prev) => {
        const newSentences = [...prev];
        newSentences.shift();
        setCurrentSentence(newSentences[0]);
        setUserInput("");
        return newSentences;
      });
    }
  };

  const startGame = async () => {
    if (!language) return;

    setIsLoading(true);
    try {
      let initialSentences;
      if (language === "ko") {
        // 한글 타자: 영어 명언을 받아와서 번역
        initialSentences = await fetchAndTranslate30Quotes();
      } else {
        // 영어 타자: 영어 명언만 받아옴
        const res = await axios.get("/api/quotes");
        initialSentences = res.data.results.map((item) => ({
          content: item.content,
          author: item.author,
        }));
      }

      setRemainingSentences(initialSentences.slice(0, 10));
      setCurrentSentence(initialSentences[0]);
      setUserInput("");
      setIsGameActive(true);
      startTimeRef.current = Date.now();
      lastKeystrokeTimeRef.current = Date.now();
      keystrokeTimesRef.current = [];
      setGameStats({
        correctWords: 0,
        totalTime: 0,
        averageAccuracy: 0,
        typingSpeed: 0,
        totalKeystrokes: 0,
        correctKeystrokes: 0,
        elapsedTime: 0,
        completedSentences: 0,
      });
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (err) {
      console.error("게임 시작 중 오류 발생:", err);
      const localSentences = sentences[difficulty].slice(0, 10);
      setRemainingSentences(localSentences);
      setCurrentSentence(localSentences[0]);
      setUserInput("");
      setIsGameActive(true);
      startTimeRef.current = Date.now();
      lastKeystrokeTimeRef.current = Date.now();
      keystrokeTimesRef.current = [];
      setGameStats({
        correctWords: 0,
        totalTime: 0,
        averageAccuracy: 0,
        typingSpeed: 0,
        totalKeystrokes: 0,
        correctKeystrokes: 0,
        elapsedTime: 0,
        completedSentences: 0,
      });
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } finally {
      setIsLoading(false);
    }
  };

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

  const endGame = () => {
    setIsGameActive(false);
    const finalStats = {
      accuracy: Math.round(gameStats.averageAccuracy),
      correctWords: gameStats.correctWords,
      difficulty,
      language,
      date: new Date().toLocaleDateString(),
      typingSpeed: gameStats.typingSpeed,
      elapsedTime: gameStats.elapsedTime,
    };

    const newScores = [...scores, finalStats].slice(-10);
    setScores(newScores);
    localStorage.setItem("typingScores", JSON.stringify(newScores));

    if (finalStats.accuracy > bestScore) {
      setBestScore(finalStats.accuracy);
      localStorage.setItem("bestScore", finalStats.accuracy);
    }

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
    const content =
      typeof currentSentence === "object"
        ? currentSentence.content
        : currentSentence;
    const author =
      typeof currentSentence === "object" ? currentSentence.author : null;

    return (
      <>
        {content.split("").map((char, index) => {
          let color = "#666";
          if (index < userInput.length) {
            color = userInput[index] === char ? "#4CAF50" : "#ff4444";
          }
          return (
            <span key={index} style={{ color }}>
              {char}
            </span>
          );
        })}
        {author && (
          <span style={{ color: "#666", marginLeft: "1rem" }}>- {author}</span>
        )}
      </>
    );
  };

  return (
    <Container>
      <GameBox>
        {isLoading ? (
          <LoadingView>
            <LoadingSpinner />
            <LoadingText>게임 준비 중...</LoadingText>
            <LoadingSubText>
              {language === "ko"
                ? "명언을 받아오고 번역하는 중입니다."
                : "명언을 받아오는 중입니다."}
              <br />
              잠시만 기다려주세요.
            </LoadingSubText>
          </LoadingView>
        ) : (
          <>
            {!language && (
              <LanguageSelection>
                <h3>타자 종류 선택</h3>
                <LanguageButtons>
                  <Button
                    onClick={() => setLanguage("ko")}
                    active={language === "ko"}
                  >
                    한글 타자
                  </Button>
                  <Button
                    onClick={() => setLanguage("en")}
                    active={language === "en"}
                  >
                    영어 타자
                  </Button>
                </LanguageButtons>
              </LanguageSelection>
            )}

            {language && (
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

                {isGameActive && (
                  <>
                    <Timer>
                      경과 시간: {formatElapsedTime(gameStats.elapsedTime)}
                    </Timer>
                    <GameStats>
                      <StatItem>
                        <StatLabel>정확도</StatLabel>
                        <StatValue>
                          {Math.round(gameStats.averageAccuracy)}%
                        </StatValue>
                      </StatItem>
                      <StatItem>
                        <StatLabel>타수</StatLabel>
                        <StatValue>{gameStats.typingSpeed}타/분</StatValue>
                      </StatItem>
                      <StatItem>
                        <StatLabel>진행도</StatLabel>
                        <StatValue>{gameStats.completedSentences}/10</StatValue>
                      </StatItem>
                    </GameStats>
                  </>
                )}

                <TextDisplay>
                  {renderText()}
                  <div
                    style={{
                      fontSize: "0.9rem",
                      color: "#666",
                      marginTop: "0.5rem",
                    }}
                  >
                    * 작가 이름은 입력하지 않아도 됩니다.
                  </div>
                </TextDisplay>

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

                {!isGameActive && gameStats.completedSentences === 0 && (
                  <Button onClick={startGame}>게임 시작</Button>
                )}

                {!isGameActive && gameStats.completedSentences >= 10 && (
                  <ResultBox>
                    <ScoreText>
                      완료 시간: {formatElapsedTime(gameStats.elapsedTime)}
                    </ScoreText>
                    <ScoreText>
                      평균 정확도: {Math.round(gameStats.averageAccuracy)}%
                    </ScoreText>
                    <ScoreText>
                      최종 타수: {gameStats.typingSpeed}타/분
                    </ScoreText>
                    <Button
                      onClick={() => {
                        setLanguage(null);
                        startGame();
                      }}
                    >
                      다시 시작
                    </Button>
                  </ResultBox>
                )}
              </>
            )}
          </>
        )}
      </GameBox>
    </Container>
  );
};

export default TypingGame;
