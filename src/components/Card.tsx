import React from 'react';
import { CardContainer, CardContent } from './Card.styled';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
}

const Card: React.FC<CardProps> = ({ children, onPress }) => {
  return (
    <CardContainer onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <CardContent>
        {children}
      </CardContent>
    </CardContainer>
  );
};

export default Card;
