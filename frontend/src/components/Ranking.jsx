import React, { useState, useEffect } from "react";
import styled from "styled-components";

const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
`;

const LanguageSelector = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
`;

const LanguageButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  background-color: ${(props) => (props.active ? "#4CAF50" : "#ddd")};
  color: ${(props) => (props.active ? "white" : "#333")};
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background-color: ${(props) => (props.active ? "#45a049" : "#ccc")};
  }
`;

const DifficultySelector = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
`;

const DifficultyButton = styled(LanguageButton)``;

const ScoreExplanation = styled.div`
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 5px;
  margin-bottom: 2rem;
  font-size: 1rem;
  color: #333;
  line-height: 1.6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  h3 {
    color: #4caf50;
    margin-bottom: 1rem;
    font-size: 1.2rem;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 1rem 0;
  }

  li {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
    position: relative;

    &:before {
      content: "•";
      color: #4caf50;
      position: absolute;
      left: 0;
    }
  }
`;

const RankingList = styled.div`
  margin-top: 2rem;
`;

const RankingItem = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: grid;
  grid-template-columns: 0.5fr 2fr 1fr 1fr 1fr 1fr 1fr;
  gap: 1rem;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }

  &.top-1 {
    background: linear-gradient(to right, #ffd700, #fff8e1);
  }

  &.top-2 {
    background: linear-gradient(to right, #c0c0c0, #f5f5f5);
  }

  &.top-3 {
    background: linear-gradient(to right, #cd7f32, #ffe4c4);
  }
`;

const RankingHeader = styled(RankingItem)`
  font-weight: bold;
  background: #f8f9fa;
  border-radius: 5px;
  margin-bottom: 1rem;
`;

const RankNumber = styled.div`
  font-weight: bold;
  color: #666;
  text-align: center;
`;

const Username = styled.div`
  font-weight: bold;
  color: #333;
`;

const Score = styled.div`
  color: #2196f3;
  font-weight: bold;
`;

const Accuracy = styled.div`
  color: #4caf50;
`;

const TypingSpeed = styled.div`
  color: #ff9800;
`;

const Time = styled.div`
  color: #9c27b0;
`;

const Difficulty = styled.div`
  color: #666;
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

    // 총점 계산: (타수 × 1) + (정확도 × 2) - (시간 × 0.5)
    const scoresWithTotal = allScores.map((score) => ({
      ...score,
      totalScore:
        score.typingSpeed * 1 + score.accuracy * 2 - score.elapsedTime * 0.5,
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
        <p>총점 = (타수 × 1) + (정확도 × 2) - (걸린 시간 × 0.5)</p>
        <p>예시: 타수 300타/분, 정확도 95%, 걸린 시간 120초인 경우</p>
        <p>
          총점 = (300 × 1) + (95 × 2) - (120 × 0.5) = 300 + 190 - 60 = 430점
        </p>
        <p>각 요소별 가중치:</p>
        <ul>
          <li>타수: 1배 (기본) - 타이핑 속도를 나타내는 기본 지표</li>
          <li>정확도: 2배 (정확한 타이핑 강조) - 정확한 타이핑이 매우 중요</li>
          <li>
            시간: 0.5배 (시간 페널티 완화) - 시간에 대한 부담을 줄여 편안한 게임
            플레이
          </li>
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
