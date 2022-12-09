import * as React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import {
  cleanTempFolder,
  setApiKey,
  textToSpeech,
} from 'react-native-google-cloud-tts';

const speak = () => {
  textToSpeech('Hello World');
};

export default function App() {
  React.useEffect(() => {
    cleanTempFolder();
    setApiKey('YOUR_API_KEY');
  }, []);

  return (
    <View style={styles.container}>
      <Text onPress={speak}>Press Me</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
