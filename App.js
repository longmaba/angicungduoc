import React, { useState, useEffect } from 'react';
import {
  Platform,
  Text,
  View,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';

import { AdMobBanner, AdMobInterstitial } from 'expo-ads-admob';
import * as StoreReview from 'expo-store-review';

import { useAssets } from 'expo-asset';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import { BlurView } from 'expo-blur';
import AppLoading from 'expo-app-loading';
import { useFonts, Comfortaa_600SemiBold, Comfortaa_700Bold, Comfortaa_500Medium } from '@expo-google-fonts/comfortaa';
import TypeWriter from 'react-native-typewriter';
import FlipCard from 'react-native-flip-card';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';

import { LinearGradient } from 'expo-linear-gradient';

import * as Animatable from 'react-native-animatable';

import Toggle from 'react-native-toggle-element';

const bannerAdIdProduction = 'ca-app-pub-1608026392919290/7161404605';
const bannerAdIdTest = 'ca-app-pub-3940256099942544/6300978111'; // Test
const interstialAdIdProduction = 'ca-app-pub-1608026392919290/7930209722';
const interstialAdIdTest = 'ca-app-pub-3940256099942544/1033173712'; // Test

const bannerAdId = Constants.isDevice && !__DEV__ ? bannerAdIdProduction : bannerAdIdTest;
const interstialAdId = Constants.isDevice && !__DEV__ ? interstialAdIdProduction : interstialAdIdTest;

const showAds = false;

const storeUrl = Platform.OS === 'ios' ? 'https://apps.apple.com/app/id1547760601' : undefined;

const initAd = async () => {
  await AdMobInterstitial.setAdUnitID(interstialAdId);
  let rdy = await AdMobInterstitial.getIsReadyAsync();
  if (!rdy) {
    AdMobInterstitial.requestAdAsync({ servePersonalizedAds: true });
  }
};

const serveAds = async () => {
  let rdy = await AdMobInterstitial.getIsReadyAsync();
  if (!rdy) {
    try {
      AdMobInterstitial.requestAdAsync({ servePersonalizedAds: true });
      return;
    } catch (e) {
      console.log(e);
      return;
    }
  }
  if (showAds) {
    await AdMobInterstitial.showAdAsync();
  }
};

const cityIds = {
  'Thành Phố Hà Nội': 218,
  'Ho Chi Minh City': 217,
  'Thành Phố Đà Nẵng': 219,
  'Thành Phố Cần Thơ': 221,
  'Thành Phố Hải Phòng': 220,
  'Tỉnh Thừa Thiên Huế': 273,
  'Tỉnh Khánh Hòa': 248,
  'Tỉnh Đồng Nai': 222,
  'Tỉnh Nghệ An': 257,
  'Tỉnh Bà Rịa-Vũng Tàu': 223,
  'Tỉnh Bắc Ninh': 228,
  'Tỉnh Bình Dương': 230,
  'Tỉnh Lâm Đồng': 254,
  'Tỉnh Quảng Nam': 263,
  'Tỉnh Quảng Ninh': 265,
  'Tỉnh Thái Nguyên': 271,
  'Hà Nội': 218,
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function App() {
  let [fontsLoaded] = useFonts({
    Comfortaa_600SemiBold,
    Comfortaa_700Bold,
    Comfortaa_500Medium,
  });

  const [errorMsg, setErrorMsg] = useState(null);
  const [city, setCity] = useState();
  const [fetching, setFetching] = useState(true);
  const [flip, setFlip] = useState(false);
  const [link, setLink] = useState('');
  const [location, setLocation] = useState();
  const [retry, setRetry] = useState(false);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailVisibile, setThumbnailVisible] = useState(false);
  const [food, setToggleFood] = useState(false);
  const [drink, setToggleDrink] = useState(false);

  const [firstText, setFirstText] = useState('Đang định vị...');
  const [assets] = useAssets([require('./assets/background.png')]);

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'android' && !Constants.isDevice) {
        setErrorMsg('Oops, this will not work on Snack in an Android emulator. Try it on your device!');
        return;
      }
      initAd();
      const region = await AsyncStorage.getItem('region');
      if (region !== null) {
        setCity(region);
        setFetching(true);
        let location = await Location.getCurrentPositionAsync({});
        setFirstText('Ăn gì cũng được :)');
        setLocation(location.coords);
        setFetching(false);
        Location.reverseGeocodeAsync(location.coords).then((data) => {
          if (data[0].region !== region) {
            setCity(data[0].region);
          }
        });
      } else {
        let { status } = await Location.requestPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }
        await getCurrentLocation();
      }
    })();
  }, []);

  let text = null;

  const getCurrentLocation = async () => {
    setFetching(true);
    let location = await Location.getCurrentPositionAsync({});
    let reverseGeo = await Location.reverseGeocodeAsync(location.coords);
    await AsyncStorage.setItem('region', reverseGeo[0].region);
    setCity(reverseGeo[0].region);
    setLocation(location.coords);
    setFirstText('Gacha?');
    setFetching(false);
  };

  let listRestaurants = [];

  const headers = {
    'x-foody-api-version': '1',
    'x-foody-app-type': '1004',
    'x-foody-client-id': '',
    'x-foody-client-language': 'vi',
    'x-foody-client-type': '1',
    'x-foody-client-version': '3.0.0',
  };

  const getListRestaurants = async () => {
    setFetching(true);
    const combinedCategory = [];
    if (food) {
      combinedCategory.push({ code: 1, id: 1000000 });
    }
    if (drink) {
      combinedCategory.push({ code: 1, id: 1000001 });
    }
    const payload = {
      category_group: 1,
      city_id: cityIds[city],
      delivery_only: true,
      keyword: '',
      sort_type: 3,
      position: {
        latitude: location ? location.latitude : 21.017998,
        longitude: location ? location.longitude : 105.838806,
      },
      foody_services: [1],
      full_restaurant_ids: true,
      combine_categories: combinedCategory.length !== 0 ? combinedCategory : [{ code: 1, id: 1000000 }],
    };

    const result = await axios.post('https://gappapi.deliverynow.vn/api/delivery/search_global', payload, { headers });
    return result?.data?.reply?.search_result[0].restaurant_ids;
  };

  const getARandomRestaurant = async () => {
    listRestaurants = await getListRestaurants();
    let results;
    if (listRestaurants.length >= 0) {
      results = await getRestaurantInfoFromIds(listRestaurants);
      if (results.length === 0) {
        setFirstText('Không còn quán nào mở :(');
      } else {
        const chosenOne = results[Math.round(Math.random() * (results.length - 1))];
        setThumbnail(chosenOne.photos[5].value);
        startGacha(results, chosenOne);
      }
    }
  };

  const startGacha = async (listRestaurant, chosenOne) => {
    const startTime = new Date();
    const duration = 5; // How long you want the gacha to run
    let i = 0;
    while (true) {
      setFirstText(listRestaurant[i].name.trim());
      i++;
      if (i >= listRestaurant.length) {
        i = 0;
      }
      await sleep(100);
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      if (elapsed >= duration) {
        serveAds();
        break;
      }
    }
    setFirstText(chosenOne.name.trim());
    setLink(chosenOne.url);
    setThumbnailVisible(true);
    setRetry(true);
    setFetching(false);
  };

  const getRestaurantInfoFromIds = async (ids) => {
    const payload = { restaurant_ids: ids };
    let result = await axios.post('https://gappapi.deliverynow.vn/api/delivery/get_infos', payload, { headers });
    result = result.data.reply.delivery_infos.filter((d) => d.is_open);
    return result;
  };

  if (errorMsg) {
    text = errorMsg;
  } else if (city) {
    text = city;
  }

  if (!fontsLoaded || !assets) {
    return <AppLoading />;
  } else {
    return (
      <View style={styles.container}>
        <Image
          source={require('./assets/background.png')}
          resizeMode="contain"
          style={{
            height: Dimensions.get('screen').height,
            position: 'absolute',
          }}
        />
        <View style={{ justifyContent: 'center', alignItems: 'center', top: 120 }}>
          <Text
            style={{
              fontFamily: 'Comfortaa_700Bold',
              fontSize: 36,
              color: '#583d72',
              textAlign: 'center',
            }}
          >
            Bây giờ ăn gì?
          </Text>
        </View>
        <View style={styles.settings}>
          <TouchableOpacity onPress={() => setFlip(!flip)}>
            <Feather name="settings" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <Animatable.View style={styles.card} animation="fadeInUp" easing="ease-out">
          <FlipCard
            flip={flip}
            flipHorizontal={true}
            perspective={1000}
            flipVertical={false}
            style={{ top: '25%' }}
            friction={10}
            clickable={false}
          >
            <BlurView
              tint="light"
              intensity={100}
              style={{
                height: 400,
                width: 300,
                borderRadius: 30,
                overflow: 'hidden',
                padding: 10,
              }}
            >
              {thumbnail && thumbnailVisibile ? (
                <View
                  style={{
                    width: 130,
                    height: 130,
                    backgroundColor: 'transparent',
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'center',
                    position: 'absolute',
                    margin: 10,
                    top: 5,
                    borderRadius: 30,
                    shadowColor: 'black',
                    shadowOffset: {
                      width: 0,
                      height: 0,
                    },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                  }}
                >
                  <Animatable.View
                    style={{ overflow: 'hidden', width: '100%', height: '100%', borderRadius: 30 }}
                    animation="flipInY"
                  >
                    <Image source={{ uri: thumbnail }} resizeMode="contain" style={{ width: 130, height: 130 }} />
                  </Animatable.View>
                </View>
              ) : null}
              <View
                style={{
                  flex: 1,
                  alignSelf: 'center',
                  justifyContent: 'center',
                  minWidth: '100%',
                  alignItems: 'center',
                  top: 20,
                }}
              >
                <TouchableOpacity onPress={() => getARandomRestaurant()} disabled={fetching}>
                  <Text
                    style={{
                      fontFamily: 'Comfortaa_700Bold',
                      fontSize: 24,
                      color: '#583d72',
                      textAlign: 'center',
                      top: 10,
                    }}
                  >
                    {firstText}
                  </Text>
                </TouchableOpacity>
                <ActivityIndicator animating={fetching} style={{ marginTop: 10 }} />
                {link || retry ? (
                  <View style={{ flexDirection: 'row', top: 10 }}>
                    <TouchableOpacity onPress={() => Linking.openURL(link)} style={styles.shadowButton}>
                      <Feather name="external-link" size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        getARandomRestaurant();
                        setRetry(false);
                        setLink(null);
                        setThumbnail(null);
                        setThumbnailVisible(false);
                      }}
                      style={styles.shadowButton}
                    >
                      <Feather name="refresh-ccw" size={24} color="white" />
                    </TouchableOpacity>
                  </View>
                ) : null}
                <View style={{ position: 'absolute', bottom: 50 }}>
                  {text && (
                    <TypeWriter
                      style={{
                        fontFamily: 'Comfortaa_500Medium',
                        fontSize: 18,
                        color: '#583d72',
                      }}
                      typing={1}
                      minDelay={30}
                      initialDelay={2000}
                    >
                      {`Địa điểm: ${text}`}
                    </TypeWriter>
                  )}
                </View>
              </View>
            </BlurView>
            <BlurView tint="light" intensity={100} style={styles.blurView}>
              <View style={styles.container}>
                <Text
                  style={{
                    fontFamily: 'Comfortaa_600SemiBold',
                    fontSize: 12,
                    color: '#c2c2c2',
                  }}
                >
                  v1.1.0
                </Text>
                <View style={styles.shadowButtonLarge}>
                  <Text
                    style={{
                      fontFamily: 'Comfortaa_600SemiBold',
                      fontSize: 18,
                      color: '#c2c2c2',
                    }}
                  >
                    Creator: HLG
                  </Text>
                </View>
                <View style={styles.shadowButtonLarge}>
                  <TouchableOpacity
                    onPress={() => Linking.openURL(storeUrl ? storeUrl : 'https://www.facebook.com/longmaba')}
                  >
                    <LinearGradient
                      style={styles.shadowButtonLarge}
                      colors={['#fd746c', '#ff9068']}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                    >
                      <Text
                        style={{
                          fontFamily: 'Comfortaa_600SemiBold',
                          fontSize: 18,
                          color: 'white',
                        }}
                      >
                        {`Rate me? <3`}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    width: 200,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    margin: 5,
                    padding: 5,
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'Comfortaa_600SemiBold',
                      fontSize: 18,
                      color: '#583d72',
                    }}
                  >
                    Đồ ăng
                  </Text>
                  <Toggle
                    value={food}
                    onPress={(val) => setToggleFood(val)}
                    trackBar={{
                      width: 50,
                      height: 20,
                      activeBackgroundColor: '#ff9068',
                      inActiveBackgroundColor: '#c2c2c2',
                    }}
                    thumbButton={{
                      height: 30,
                      width: 30,
                      activeBackgroundColor: '#fd746c',
                      inActiveBackgroundColor: '#d2d2d2',
                    }}
                  />
                </View>
                <View
                  style={{
                    width: 200,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    margin: 5,
                    padding: 5,
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'Comfortaa_600SemiBold',
                      fontSize: 18,
                      color: '#583d72',
                    }}
                  >
                    Đồ ún
                  </Text>
                  <Toggle
                    value={drink}
                    onPress={(val) => setToggleDrink(val)}
                    trackBar={{
                      width: 50,
                      height: 20,
                      activeBackgroundColor: '#ff9068',
                      inActiveBackgroundColor: '#c2c2c2',
                    }}
                    thumbButton={{
                      height: 30,
                      width: 30,
                      activeBackgroundColor: '#fd746c',
                      inActiveBackgroundColor: '#d2d2d2',
                    }}
                  />
                </View>
              </View>
            </BlurView>
          </FlipCard>
        </Animatable.View>
        <AdMobBanner
          bannerSize="banner"
          adUnitID={bannerAdId} // Test ID, Replace with your-admob-unit-id
          servePersonalizedAds // true or false
          onDidFailToReceiveAdWithError={(e) => console.log(e)}
          style={{ position: 'absolute', bottom: 0 }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  paragraph: {
    fontSize: 18,
    textAlign: 'center',
  },
  blurView: {
    height: 400,
    width: 300,
    borderRadius: 30,
    overflow: 'hidden',
  },
  card: {
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  settings: { position: 'absolute', top: 40, right: 20 },
  shadowButton: {
    width: 40,
    height: 40,
    backgroundColor: 'transparent',
    borderRadius: 10,
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  shadowButtonLarge: {
    backgroundColor: '#f2f2f2',
    width: 200,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 5,
    shadowOpacity: 0.07,
    margin: 10,
  },
});
