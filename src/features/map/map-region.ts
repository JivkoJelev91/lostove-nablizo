import type { Region } from 'react-native-maps';

/** The mock "you are here" position. Real device location arrives with the data layer. */
export const MOCK_USER_LOCATION = { latitude: 42.6835, longitude: 23.3219 };

export const INITIAL_REGION: Region = {
  ...MOCK_USER_LOCATION,
  latitudeDelta: 0.09,
  longitudeDelta: 0.075,
};
