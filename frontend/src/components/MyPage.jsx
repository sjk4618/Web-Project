import React, { useState, useEffect } from "react";
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
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
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
    koStats: {
      averageAccuracy: 0,
      averageSpeed: 0,
      totalGames: 0,
      scores: [],
    },
    enStats: {
      averageAccuracy: 0,
      averageSpeed: 0,
      totalGames: 0,
      scores: [],
    },
  });

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser) {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const user = users.find((u) => u.username === currentUser.username);

      if (user && Array.isArray(user.scores)) {
        const scores = user.scores;
        // 한글/영어 타자 기록 분리
        const koScores = scores.filter((score) => score.language === "ko");
        const enScores = scores.filter((score) => score.language === "en");

        // 한글 타자 통계
        const koAverageAccuracy =
          koScores.length > 0
            ? Math.round(
                koScores.reduce((acc, curr) => acc + curr.accuracy, 0) /
                  koScores.length
              )
            : 0;
        const koAverageSpeed =
          koScores.length > 0
            ? Math.round(
                koScores.reduce((acc, curr) => acc + curr.typingSpeed, 0) /
                  koScores.length
              )
            : 0;

        // 영어 타자 통계
        const enAverageAccuracy =
          enScores.length > 0
            ? Math.round(
                enScores.reduce((acc, curr) => acc + curr.accuracy, 0) /
                  enScores.length
              )
            : 0;
        const enAverageSpeed =
          enScores.length > 0
            ? Math.round(
                enScores.reduce((acc, curr) => acc + curr.typingSpeed, 0) /
                  enScores.length
              )
            : 0;

        setUserStats({
          koStats: {
            averageAccuracy: koAverageAccuracy,
            averageSpeed: koAverageSpeed,
            totalGames: koScores.length,
            scores: koScores.sort(
              (a, b) => new Date(b.date) - new Date(a.date)
            ),
          },
          enStats: {
            averageAccuracy: enAverageAccuracy,
            averageSpeed: enAverageSpeed,
            totalGames: enScores.length,
            scores: enScores.sort(
              (a, b) => new Date(b.date) - new Date(a.date)
            ),
          },
        });
      } else {
        setUserStats({
          koStats: {
            averageAccuracy: 0,
            averageSpeed: 0,
            totalGames: 0,
            scores: [],
          },
          enStats: {
            averageAccuracy: 0,
            averageSpeed: 0,
            totalGames: 0,
            scores: [],
          },
        });
      }
    }
  }, []);

  const chartData = {
    labels: [...userStats.koStats.scores, ...userStats.enStats.scores]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((score) => {
        const date = new Date(score.date);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(date.getDate()).padStart(2, "0")} ${String(
          date.getHours()
        ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
      }),
    datasets: [
      {
        label: "한글 타자 정확도 (%)",
        data: userStats.koStats.scores.map((score) => score.accuracy),
        borderColor: "#2196F3",
        tension: 0.1,
        yAxisID: "y",
      },
      {
        label: "한글 타자 속도 (타/분)",
        data: userStats.koStats.scores.map((score) => score.typingSpeed),
        borderColor: "#4CAF50",
        tension: 0.1,
        yAxisID: "y1",
      },
      {
        label: "한글 타자 시간 (초)",
        data: userStats.koStats.scores.map((score) => score.elapsedTime),
        borderColor: "#9C27B0",
        tension: 0.1,
        yAxisID: "y2",
      },
      {
        label: "영어 타자 정확도 (%)",
        data: userStats.enStats.scores.map((score) => score.accuracy),
        borderColor: "#FF9800",
        tension: 0.1,
        yAxisID: "y",
      },
      {
        label: "영어 타자 속도 (타/분)",
        data: userStats.enStats.scores.map((score) => score.typingSpeed),
        borderColor: "#F44336",
        tension: 0.1,
        yAxisID: "y1",
      },
      {
        label: "영어 타자 시간 (초)",
        data: userStats.enStats.scores.map((score) => score.elapsedTime),
        borderColor: "#795548",
        tension: 0.1,
        yAxisID: "y2",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: "index",
      intersect: false,
    },
    scales: {
      y: {
        type: "linear",
        display: true,
        position: "left",
        title: {
          display: true,
          text: "정확도 (%)",
        },
        min: 0,
        max: 100,
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        title: {
          display: true,
          text: "타수 (타/분)",
        },
        min: 0,
        grid: {
          drawOnChartArea: false,
        },
      },
      y2: {
        type: "linear",
        display: true,
        position: "right",
        title: {
          display: true,
          text: "시간 (초)",
        },
        min: 0,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const formatElapsedTime = (seconds) => {
    if (!seconds || isNaN(seconds) || seconds < 0) return "-";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}분 ${remainingSeconds}초`;
  };

  return (
    <Container>
      <Title>마이페이지</Title>

      <StatsGrid>
        <StatCard>
          <StatLabel>한글 타자 평균 정확도</StatLabel>
          <StatValue>{userStats.koStats.averageAccuracy}%</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>한글 타자 평균 속도</StatLabel>
          <StatValue>{userStats.koStats.averageSpeed}타/분</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>한글 타자 평균 시간</StatLabel>
          <StatValue>
            {formatElapsedTime(
              userStats.koStats.scores.length > 0
                ? userStats.koStats.scores.reduce(
                    (acc, curr) => acc + (curr.elapsedTime || 0),
                    0
                  ) / userStats.koStats.scores.length
                : 0
            )}
          </StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>한글 타자 게임 수</StatLabel>
          <StatValue>{userStats.koStats.totalGames}회</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>영어 타자 평균 정확도</StatLabel>
          <StatValue>{userStats.enStats.averageAccuracy}%</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>영어 타자 평균 속도</StatLabel>
          <StatValue>{userStats.enStats.averageSpeed}타/분</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>영어 타자 평균 시간</StatLabel>
          <StatValue>
            {formatElapsedTime(
              userStats.enStats.scores.length > 0
                ? userStats.enStats.scores.reduce(
                    (acc, curr) => acc + (curr.elapsedTime || 0),
                    0
                  ) / userStats.enStats.scores.length
                : 0
            )}
          </StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>영어 타자 게임 수</StatLabel>
          <StatValue>{userStats.enStats.totalGames}회</StatValue>
        </StatCard>
      </StatsGrid>

      {(userStats.koStats.scores.length > 0 ||
        userStats.enStats.scores.length > 0) && (
        <>
          <ScoreList>
            <ScoreHeader>
              <div>날짜</div>
              <div>타자 종류</div>
              <div>정확도</div>
              <div>타수</div>
              <div>걸린 시간</div>
              <div>난이도</div>
            </ScoreHeader>
            {[...userStats.koStats.scores, ...userStats.enStats.scores]
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((score, index) => (
                <ScoreItem key={index}>
                  <div>{new Date(score.date).toLocaleString()}</div>
                  <div>
                    {score.language === "ko" ? "한글 타자" : "영어 타자"}
                  </div>
                  <div>{score.accuracy}%</div>
                  <div>{score.typingSpeed}타/분</div>
                  <div>{formatElapsedTime(score.elapsedTime)}</div>
                  <div>{score.difficulty}</div>
                </ScoreItem>
              ))}
          </ScoreList>

          <div style={{ marginTop: "2rem", height: "300px" }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </>
      )}
    </Container>
  );
};

export default MyPage;
