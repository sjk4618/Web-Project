import React, { useState, useEffect } from "react";
import styled from "styled-components";

const Container = styled.div`
  max-width: 1000px;
  margin: 2rem auto;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(45deg, #2c3e50, #3498db);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const LanguageSelector = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
`;

const LanguageButton = styled.button`
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 10px;
  background: ${(props) =>
    props.active
      ? "linear-gradient(45deg, #3498db, #2980b9)"
      : "rgba(255, 255, 255, 0.9)"};
  color: ${(props) => (props.active ? "white" : "#2c3e50")};
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const DifficultySelector = styled(LanguageSelector)``;

const DifficultyButton = styled(LanguageButton)``;

const ScoreExplanation = styled.div`
  background: rgba(248, 249, 250, 0.9);
  padding: 2rem;
  border-radius: 15px;
  margin-bottom: 2rem;
  font-size: 1rem;
  color: #2c3e50;
  line-height: 1.6;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);

  h3 {
    color: #3498db;
    margin-bottom: 1rem;
    font-size: 1.4rem;
    font-weight: 600;
  }

  p {
    margin: 0.8rem 0;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 1rem 0;
  }

  li {
    margin: 0.8rem 0;
    padding-left: 1.8rem;
    position: relative;

    &:before {
      content: "•";
      color: #3498db;
      position: absolute;
      left: 0;
      font-size: 1.2rem;
    }
  }
`;

const RankingList = styled.div`
  margin-top: 2rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const RankingItem = styled.div`
  padding: 1.2rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: grid;
  grid-template-columns: 0.5fr 2fr 1fr 1fr 1fr 1fr 1fr;
  gap: 1rem;
  align-items: center;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(52, 152, 219, 0.05);
  }

  &:last-child {
    border-bottom: none;
  }

  &.top-1 {
    background: linear-gradient(
      to right,
      rgba(255, 215, 0, 0.1),
      rgba(255, 248, 225, 0.1)
    );
  }

  &.top-2 {
    background: linear-gradient(
      to right,
      rgba(192, 192, 192, 0.1),
      rgba(245, 245, 245, 0.1)
    );
  }

  &.top-3 {
    background: linear-gradient(
      to right,
      rgba(205, 127, 50, 0.1),
      rgba(255, 228, 196, 0.1)
    );
  }
`;

const RankingHeader = styled(RankingItem)`
  font-weight: 600;
  background: rgba(52, 152, 219, 0.1);
  color: #2c3e50;
  border-radius: 15px 15px 0 0;
  margin-bottom: 0;
`;

const RankNumber = styled.div`
  font-weight: 600;
  color: #2c3e50;
  text-align: center;
  font-size: 1.1rem;
`;

const Username = styled.div`
  font-weight: 600;
  color: #2c3e50;
  font-size: 1.1rem;
`;

const Score = styled.div`
  color: #3498db;
  font-weight: 600;
  font-size: 1.1rem;
`;

const Accuracy = styled.div`
  color: #2ecc71;
  font-weight: 500;
`;

const TypingSpeed = styled.div`
  color: #e67e22;
  font-weight: 500;
`;

const Time = styled.div`
  color: #9b59b6;
  font-weight: 500;
`;

const Difficulty = styled.div`
  color: #7f8c8d;
  font-weight: 500;
`;

const Ranking = () => {
  const [rankings, setRankings] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("ko");
  const [selectedDifficulty, setSelectedDifficulty] = useState("easy");

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const allScores = users.flatMap((user) =>
      (user.scores || []).map((score) => ({
        ...score,
        username: user.username,
      }))
    );

    // 총점 계산: (정확도 × 5) + (타수 × 3) - (시간 × 2)
    const scoresWithTotal = allScores.map((score) => ({
      ...score,
      totalScore:
        score.accuracy * 5 + score.typingSpeed * 3 - score.elapsedTime * 2,
    }));

    // 선택된 언어와 난이도에 따라 필터링
    const filteredScores = scoresWithTotal.filter(
      (score) =>
        score.language === selectedLanguage &&
        score.difficulty === selectedDifficulty
    );

    // 총점 기준으로 정렬
    const sortedScores = filteredScores.sort(
      (a, b) => b.totalScore - a.totalScore
    );
    setRankings(sortedScores);
  }, [selectedLanguage, selectedDifficulty]);

  const formatElapsedTime = (seconds) => {
    if (!seconds || isNaN(seconds) || seconds < 0) return "-";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}분 ${remainingSeconds}초`;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  return (
    <Container>
      <Title>랭킹</Title>

      <ScoreExplanation>
        <h3>랭킹 점수 계산 방법</h3>
        <p>총점 = (정확도 × 5) + (타수 × 3) - (걸린 시간 × 2)</p>
        <p>예시: 타수 300타/분, 정확도 95%, 걸린 시간 120초인 경우</p>
        <p>
          총점 = (95 × 5) + (300 × 3) - (120 × 2) = 475 + 900 - 240 = 1135점
        </p>
        <p>각 요소별 가중치:</p>
        <ul>
          <li>정확도: 5배 (정확한 타이핑이 매우 중요)</li>
          <li>타수: 3배 (속도도 중요)</li>
          <li>시간: 2배 (시간이 짧을수록 유리)</li>
        </ul>
      </ScoreExplanation>

      <LanguageSelector>
        <LanguageButton
          active={selectedLanguage === "ko"}
          onClick={() => setSelectedLanguage("ko")}
        >
          한글 타자
        </LanguageButton>
        <LanguageButton
          active={selectedLanguage === "en"}
          onClick={() => setSelectedLanguage("en")}
        >
          영어 타자
        </LanguageButton>
      </LanguageSelector>

      <DifficultySelector>
        <DifficultyButton
          active={selectedDifficulty === "easy"}
          onClick={() => setSelectedDifficulty("easy")}
        >
          쉬움
        </DifficultyButton>
        <DifficultyButton
          active={selectedDifficulty === "hard"}
          onClick={() => setSelectedDifficulty("hard")}
        >
          어려움
        </DifficultyButton>
      </DifficultySelector>

      <RankingList>
        <RankingHeader>
          <div>순위</div>
          <div>사용자</div>
          <div>총점</div>
          <div>타수</div>
          <div>정확도</div>
          <div>걸린 시간</div>
          <div>날짜</div>
        </RankingHeader>
        {rankings.map((score, index) => (
          <RankingItem key={index}>
            <div>{index + 1}</div>
            <div>{score.username}</div>
            <div>{Math.round(score.totalScore)}점</div>
            <div>{score.typingSpeed}타/분</div>
            <div>{score.accuracy}%</div>
            <div>{formatElapsedTime(score.elapsedTime)}</div>
            <div>{formatDate(score.date)}</div>
          </RankingItem>
        ))}
      </RankingList>
    </Container>
  );
};

export default Ranking;
