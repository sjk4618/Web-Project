import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Line } from "react-chartjs-2";

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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 10px;
  text-align: center;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
`;

const ScoreList = styled.div`
  margin-top: 2rem;
`;

const ScoreItem = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 1rem;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }
`;

const ScoreHeader = styled(ScoreItem)`
  font-weight: bold;
  background: #f8f9fa;
  border-radius: 5px;
  margin-bottom: 1rem;
`;

const MyPage = () => {
  const [userStats, setUserStats] = useState({
    highestWpm: 0,
    averageWpm: 0,
    averageAccuracy: 0,
    totalGames: 0,
    scores: [],
  });

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser) {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const user = users.find((u) => u.username === currentUser.username);

      if (user && user.scores) {
        const scores = user.scores;
        const highestWpm = Math.max(...scores.map((s) => s.wpm), 0);
        const averageWpm = Math.round(
          scores.reduce((acc, curr) => acc + curr.wpm, 0) / scores.length
        );
        const averageAccuracy = Math.round(
          scores.reduce((acc, curr) => acc + curr.accuracy, 0) / scores.length
        );

        setUserStats({
          highestWpm,
          averageWpm,
          averageAccuracy,
          totalGames: scores.length,
          scores: scores.sort((a, b) => new Date(b.date) - new Date(a.date)),
        });
      }
    }
  }, []);

  const chartData = {
    labels: userStats.scores.map((score) => score.date),
    datasets: [
      {
        label: "WPM",
        data: userStats.scores.map((score) => score.wpm),
        borderColor: "#4CAF50",
        tension: 0.1,
      },
      {
        label: "정확도 (%)",
        data: userStats.scores.map((score) => score.accuracy),
        borderColor: "#2196F3",
        tension: 0.1,
      },
    ],
  };

  return (
    <Container>
      <Title>마이페이지</Title>

      <StatsGrid>
        <StatCard>
          <StatLabel>최고 WPM</StatLabel>
          <StatValue>{userStats.highestWpm}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>평균 WPM</StatLabel>
          <StatValue>{userStats.averageWpm}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>평균 정확도</StatLabel>
          <StatValue>{userStats.averageAccuracy}%</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>총 게임 수</StatLabel>
          <StatValue>{userStats.totalGames}</StatValue>
        </StatCard>
      </StatsGrid>

      {userStats.scores.length > 0 && (
        <>
          <ScoreList>
            <ScoreHeader>
              <div>날짜</div>
              <div>WPM</div>
              <div>정확도</div>
              <div>난이도</div>
            </ScoreHeader>
            {userStats.scores.map((score, index) => (
              <ScoreItem key={index}>
                <div>{score.date}</div>
                <div>{score.wpm}</div>
                <div>{score.accuracy}%</div>
                <div>{score.difficulty}</div>
              </ScoreItem>
            ))}
          </ScoreList>

          <div style={{ marginTop: "2rem", height: "300px" }}>
            <Line data={chartData} />
          </div>
        </>
      )}
    </Container>
  );
};

export default MyPage;
