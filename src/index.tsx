/** @format */

import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import {
  PERMISSIONS,
  requestMultiple,
  RESULTS,
} from 'react-native-permissions';
import Sound from 'react-native-sound';
let speechRef: any = null;
let speechQueue: any = [];
let speechTextQueue: any = [];
let isPlaying = false;
let isDownoading = false;
let isPermissionGranted = false;
let TOKEN = '';

const addToQueue = (data: any) => {
  speechQueue.push(data);
};

const addToTextQueue = (data: any) => {
  speechTextQueue.push(data);
};

const readFromQueue = () => {
  return speechQueue.splice(0, 1)[0];
};
const readFromTextQueue = () => {
  return speechTextQueue.splice(0, 1)[0];
};

const speech = async (text: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      const audioData = await getAudioData(text);
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

const writeAudioToStorage = (data: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      const path = `${
        RNFS.TemporaryDirectoryPath + (Platform.OS == 'android' ? '/' : '')
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

const playMusic = (music: any) => {
  return new Promise((resolve, reject) => {
    speechRef = new Sound('file://' + music, undefined, (error: any) => {
      if (error) {
        reject(error);
        console.warn('failed to load the sound', error);
      }
      speechRef?.play((success: any) => {
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
  return new Promise(async (resolve, reject) => {
    const key = TOKEN;
    const address = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${key}`;
    const payload = createRequest(text);
    try {
      const response = await fetch(`${address}`, payload);
      const result = await response.json();
      resolve(result?.audioContent);
    } catch (err) {
      reject(err);
    }
  });
};

const createRequest = (text: any) => ({
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

export const cleanTempFolder = async () => {
  try {
    const path = RNFS.TemporaryDirectoryPath;
    await RNFS.unlink(path);
    await RNFS.mkdir(path);
  } catch (error) {
    throw error;
  }
};

export const handleStoragePermission = () => {
  return new Promise(async (resolve, reject) => {
    try {
      if (Platform.OS === 'ios') {
        isPermissionGranted = true;
        resolve(true);
      } else {
        const permissionList = [
          PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
          PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
        ];
        const res = await requestMultiple(permissionList);
        if (
          res[PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE] === RESULTS.GRANTED &&
          res[PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE] === RESULTS.GRANTED
        ) {
          isPermissionGranted = true;
          resolve(true);
        } else {
          const isBlocked =
            res[PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE] ===
              RESULTS.BLOCKED ||
            res[PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE] === RESULTS.BLOCKED;
          isPermissionGranted = false;
          reject({ isStoragePermissionBlocked: isBlocked });
        }
      }
    } catch (error) {
      isPermissionGranted = false;
      reject(error);
    }
  });
};

export const textToSpeech = async (text: any) => {
  try {
    if (!isPermissionGranted) {
      await handleStoragePermission();
    }
    if (isPermissionGranted) {
      if (text) {
        addToTextQueue(text);
        if (!isDownoading) {
          handleTextSpeechQueue();
        }
      }
    }
  } catch (error) {
    throw error;
  }
};

export const setApiKey = (key: string) => {
  TOKEN = key;
};
