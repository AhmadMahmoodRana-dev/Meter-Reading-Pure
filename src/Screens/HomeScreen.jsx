import React from 'react';
import { View} from 'react-native';
import MeterReader from '../Components/MeterReader';

export default function HomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, }}>
      <MeterReader/>
    </View>
  );
}
