import React from 'react';
import { ButtonContainer, ButtonText } from './Button.styled';

interface ButtonProps {
  title: string;
  onPress: () => void;
}

const Button: React.FC<ButtonProps> = ({ title, onPress }) => {
  return (
    <ButtonContainer onPress={onPress} activeOpacity={0.7}>
      <ButtonText>{title}</ButtonText>
    </ButtonContainer>
  );
};

export default Button;
