import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  padding: 16px;
  background-color: #fff;
`;

export const ProfitHighlight = styled.View<{ negative?: boolean }>`
  padding: 16px;
  background-color: ${(p) => (p.negative ? '#f44336' : '#4caf50')};
  border-radius: 8px;
  margin-bottom: 16px;
  align-items: center;
`;

export const Title = styled.Text`
  font-size: 20px;
  color: #fff;
`;

export const HistoryContainer = styled.View`
  margin-top: 16px;
`;

export const Text = styled.Text`
  font-size: 18px;
  color: #333;
  margin-bottom: 8px;
`;

export const QuickCards = styled.View`
  flex-direction: row;
  margin-top: 12px;
`;

export const QuickCard = styled.View`
  flex: 1;
  padding: 12px;
  margin-right: 8px;
  border-radius: 8px;
  background-color: #f7f7f7;
  border-width: 1px;
  border-color: #eee;
`;

export const QuickCardTitle = styled.Text`
  font-size: 14px;
  color: #666;
`;

export const QuickCardValue = styled.Text`
  font-size: 18px;
  color: #333;
  font-weight: 600;
`;
