import React, { useState, useEffect } from "react";
import styled from "styled-components";

const Container = styled.div`
  max-width: 600px;
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

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
`;

const Th = styled.th`
  padding: 1rem;
  text-align: left;
  border-bottom: 2px solid #ddd;
  color: #666;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #ddd;
  color: #333;
`;

const Tr = styled.tr`
  &:hover {
    background-color: #f5f5f5;
  }
`;

const Rank = styled.span`
  font-weight: bold;
  color: ${(props) => {
    switch (props.rank) {
      case 1:
        return "#FFD700";
      case 2:
        return "#C0C0C0";
      case 3:
        return "#CD7F32";
      default:
        return "#666";
    }
  }};
`;

const Ranking = () => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const users = JSON.parse(localStorage.getItem("users") || "[]");

      // 각 사용자의 최고 점수와 평균 정확도 계산
      const userRankings = users.map((user) => {
        const scores = user.scores || [];
        const highestWpm = Math.max(...scores.map((s) => s.wpm), 0);
        const averageAccuracy =
          scores.length > 0
            ? Math.round(
                scores.reduce((acc, curr) => acc + curr.accuracy, 0) /
                  scores.length
              )
            : 0;

        return {
          username: user.username,
          highestWpm,
          averageAccuracy,
        };
      });

      // WPM 기준으로 정렬
      userRankings.sort((a, b) => b.highestWpm - a.highestWpm);

      setRankings(userRankings);
    } catch (err) {
      setError("랭킹을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) return <Container>로딩 중...</Container>;
  if (error) return <Container>{error}</Container>;

  return (
    <Container>
      <Title>타이핑 게임 랭킹</Title>
      <Table>
        <thead>
          <tr>
            <Th>순위</Th>
            <Th>사용자</Th>
            <Th>최고 WPM</Th>
            <Th>평균 정확도</Th>
          </tr>
        </thead>
        <tbody>
          {rankings.map((user, index) => (
            <Tr key={user.username}>
              <Td>
                <Rank rank={index + 1}>{index + 1}</Rank>
              </Td>
              <Td>{user.username}</Td>
              <Td>{user.highestWpm} WPM</Td>
              <Td>{user.averageAccuracy}%</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Ranking;
