import React, { useState, useEffect } from "react";
import {
  Platform,
  Text,
  View,
  StyleSheet,
  Image,
  Dimensions,
  Button,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Constants from "expo-constants";
import * as Location from "expo-location";
import { BlurView } from "expo-blur";
import AppLoading from "expo-app-loading";
import { useFonts, Comfortaa_600SemiBold } from "@expo-google-fonts/comfortaa";
import TypeWriter from "react-native-typewriter";

export default function App() {
  let [fontsLoaded] = useFonts({
    Comfortaa_600SemiBold,
  });

  const [errorMsg, setErrorMsg] = useState(null);
  const [location, setLocation] = useState();
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    (async () => {
      if (Platform.OS === "android" && !Constants.isDevice) {
        setErrorMsg(
          "Oops, this will not work on Snack in an Android emulator. Try it on your device!"
        );
        return;
      }
      let { status } = await Location.requestPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }
    })();
  }, []);

  let text = null;

  const getCurrentLocation = async () => {
    setFetching(true);
    let location = await Location.getCurrentPositionAsync({});
    let reverseGeo = await Location.reverseGeocodeAsync(location.coords);
    setLocation(reverseGeo[0].city);
    setFetching(false);
  };

  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = location;
  }

  if (!fontsLoaded) {
    return <AppLoading />;
  } else {
    return (
      <View style={styles.container}>
        <Image
          source={require("./assets/background.png")}
          resizeMode="contain"
          style={{
            height: Dimensions.get("screen").height,
            position: "absolute",
          }}
        />
        <View
          style={{
            shadowColor: "black",
            shadowOffset: {
              width: 0,
              height: 10,
            },
            shadowOpacity: 0.05,
            shadowRadius: 20,
          }}
        >
          <BlurView
            tint="light"
            intensity={100}
            style={{
              height: 400,
              width: 300,
              borderRadius: 30,
              overflow: "hidden",
            }}
          >
            <View
              style={{ flex: 1, alignSelf: "center", justifyContent: "center" }}
            >
              <TouchableOpacity
                onPress={() => getCurrentLocation()}
                disabled={fetching}
              >
                <Text
                  style={{
                    fontFamily: "Comfortaa_600SemiBold",
                    fontSize: 36,
                    color: "#583d72",
                  }}
                >
                  Gacha
                </Text>
              </TouchableOpacity>
              <ActivityIndicator animating={fetching} />
              <View style={{ position: "absolute", bottom: 50, left: -60 }}>
                {text && (
                  <TypeWriter
                    style={{
                      fontFamily: "Comfortaa_600SemiBold",
                      fontSize: 18,
                      color: "#583d72",
                    }}
                    typing={1}
                    minDelay={30}
                    initialDelay={2000}
                  >
                    {`Location: ${text}`}
                  </TypeWriter>
                )}
              </View>
            </View>
          </BlurView>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  paragraph: {
    fontSize: 18,
    textAlign: "center",
  },
});
