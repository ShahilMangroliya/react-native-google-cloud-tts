# react-native-google-cloud-tts

A Library for google cloud based text to speech implementation

## Installation

using either Yarn:

```
yarn add react-native-google-cloud-tts
```

or npm:

```
npm install react-native-google-cloud-tts
```

## Usage

```js
import {
  cleanTempFolder,
  setApiKey,
  textToSpeech,
} from 'react-native-google-cloud-tts';

// ...
setApiKey('YOUR_API_KEY');
const result = textToSpeech('Hello World');
```

```js
import { cleanTempFolder } from 'react-native-google-cloud-tts';

// ...
useeffect(() => {
  cleanTempFolder();
});
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
