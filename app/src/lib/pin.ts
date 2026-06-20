import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'blackandwhite.teamPin';

export const getPin = () => AsyncStorage.getItem(KEY);
export const setPin = (pin: string) => AsyncStorage.setItem(KEY, pin.trim());
export const clearPin = () => AsyncStorage.removeItem(KEY);
