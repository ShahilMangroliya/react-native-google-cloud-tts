/** @format */

import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import Sound from 'react-native-sound';
let speechRef: any = null;
let speechQueue: string[] = [];
let speechTextQueue: string[] = [];
let isPlaying: boolean = false;
let isDownoading: boolean = false;
let TOKEN: string = '';

interface IGoogleApIRes {
  audioContent: string;
}

const addToQueue = (data: string) => {
  speechQueue.push(data);
};

const addToTextQueue = (data: string) => {
  speechTextQueue.push(data);
};

const readFromQueue = () => {
  return speechQueue.splice(0, 1)[0] ?? '';
};
const readFromTextQueue = () => {
  return speechTextQueue.splice(0, 1)[0] ?? '';
};

const speech = async (text: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      const audioData: string = await getAudioData(text);
      const path = await writeAudioToStorage(audioData);
      addToQueue(path);
      if (!isPlaying) {
        handleSpeechQueue();
      }
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};

const writeAudioToStorage = (data: string) => {
  return new Promise<string>(async (resolve, reject) => {
    try {
      const path: string = `${
        RNFS.TemporaryDirectoryPath + (Platform.OS === 'android' ? '/' : '')
      }pointz_${new Date().getTime()}.wav`;
      await RNFS.writeFile(path, data, 'base64');
      resolve(path);
    } catch (error) {
      reject(error);
    }
  });
};

const handleSpeechQueue = async () => {
  while (speechQueue.length > 0) {
    isPlaying = true;
    try {
      const music = readFromQueue();
      await playMusic(music);
    } catch (error) {
      throw error;
    }
  }
  isPlaying = false;
};

const handleTextSpeechQueue = async () => {
  while (speechTextQueue.length > 0) {
    isDownoading = true;
    try {
      const text = readFromTextQueue();
      await speech(text);
    } catch (error) {
      throw error;
    }
  }
  isDownoading = false;
};

const playMusic = (music: string) => {
  return new Promise<boolean | string>((resolve, reject) => {
    speechRef = new Sound('file://' + music, undefined, (error: string) => {
      if (error) {
        reject(error);
        console.warn('failed to load the sound', error);
      }
      speechRef?.play((success: boolean) => {
        if (!success) {
          reject('playback failed due to audio decoding errors');
          console.warn('playback failed due to audio decoding errors');
        } else {
          resolve(true);
        }
      });
    });
  });
};

const getAudioData = async (text = '') => {
  return new Promise<string>(async (resolve, reject) => {
    const key = TOKEN;
    const address = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${key}`;
    const payload = createRequest(text);
    try {
      const response = await fetch(`${address}`, payload);
      const result: IGoogleApIRes = await response.json();
      resolve(result?.audioContent);
    } catch (err) {
      reject(err);
    }
  });
};

const createRequest = (text: string) => ({
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    input: {
      text,
    },
    voice: {
      languageCode: 'en-US',
      name: 'en-US-Wavenet-D',
    },
    audioConfig: {
      audioEncoding: 'LINEAR16',
      pitch: 0,
      speakingRate: 1,
    },
  }),
  method: 'POST',
});

/**
use this method at opening of your app to clear previous catch from this lib
*/

export const cleanTempFolder = async () => {
  try {
    const path = RNFS.TemporaryDirectoryPath;
    await RNFS.unlink(path);
    await RNFS.mkdir(path);
  } catch (error) {
    throw error;
  }
};

/**
use this for Text to Speech
*/
export const textToSpeech = async (text: string) => {
  try {
    if (text) {
      addToTextQueue(text);
      if (!isDownoading) {
        handleTextSpeechQueue();
      }
    }
  } catch (error) {
    throw error;
  }
};

/**
set API key from google cloud
*/

export const setApiKey = (key: string) => {
  TOKEN = key;
};
