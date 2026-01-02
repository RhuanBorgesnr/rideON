import styled from 'styled-components/native';

export const Container = styled.ScrollView`
  flex: 1;
  background-color: #fff;
`;

export const Content = styled.View`
  padding: 16px;
`;

export const Title = styled.Text`
  font-size: 20px;
  color: #333;
  margin-bottom: 8px;
`;

export const SectionTitle = styled.Text`
  font-size: 18px;
  color: #555;
  margin-top: 16px;
  margin-bottom: 8px;
`;

export const Row = styled.View`
  flex-direction: row;
  justify-content: space-between;
  padding: 8px 0;
`;

export const Label = styled.Text`
  font-size: 16px;
  color: #333;
`;

export const Value = styled.Text`
  font-size: 16px;
  color: #333;
`;

export const HeaderHighlight = styled.View<{ negative?: boolean }>`
  padding: 16px;
  background-color: ${(p) => (p.negative ? '#f44336' : '#4caf50')};
  border-radius: 12px;
  margin-bottom: 16px;
  align-items: center;
`;

export const HeaderValue = styled.Text`
  font-size: 22px;
  color: #fff;
  font-weight: 700;
`;

export const SectionCard = styled.View`
  background-color: #fff;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 16px;
  border-width: 1px;
  border-color: #eee;
  shadow-color: #000;
  shadow-opacity: 0.08;
  shadow-radius: 8px;
  shadow-offset: 0px 2px;
  elevation: 2;
`;

export const Divider = styled.View`
  height: 1px;
  background-color: #eee;
  margin: 12px 0;
`;
