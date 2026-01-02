import React from 'react';
import { KeyboardTypeOptions } from 'react-native';
import { InputWrapper, StyledInput } from './InputField.styled';

interface InputFieldProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
}

const InputField: React.FC<InputFieldProps> = ({ placeholder, value, onChangeText, keyboardType = 'default' }) => {
  return (
    <InputWrapper>
      <StyledInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
      />
    </InputWrapper>
  );
};

export default InputField;
