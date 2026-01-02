import React from 'react';
import { FlatList } from 'react-native';
import Card from './Card';
import { HistoryItemText } from './HistoryList.styled';

interface HistoryItem {
  id: number;
  date: string;
  netProfit: number;
}

interface HistoryListProps {
  data: HistoryItem[];
  onPressItem: (item: HistoryItem) => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ data, onPressItem }) => {
  const renderItem = ({ item }: { item: HistoryItem }) => (
    <Card onPress={() => onPressItem(item)}>
      <HistoryItemText>
        {item.date} - Lucro líquido: R$ {item.netProfit.toFixed(2)}
      </HistoryItemText>
    </Card>
  );

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
    />
  );
};

export default HistoryList;
