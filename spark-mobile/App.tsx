import "react-native-gesture-handler";

import React from "react";
import {
  View,
  ActivityIndicator,
} from "react-native";

import { useFonts } from "expo-font";

import {
  NavigationContainer,
} from "@react-navigation/native";

import {
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import {
  Ionicons,
  Feather,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import HomeScreen from "./src/screens/HomeScreen";
import MapScreen from "./src/screens/MapScreen";
import PredictionScreen from "./src/screens/PredictionScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import ProfileScreen from "./src/screens/ProfileScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          position: "absolute",
          height: 82,
          borderTopWidth: 1.5,
          borderTopColor: "#F2D6D6",
          backgroundColor: "#fff",
          paddingBottom: 10,
          paddingTop: 5,
        },

        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: "PoppinsRegular",
          marginTop: 10,
        },

        tabBarActiveTintColor: "#D92E3F",
        tabBarInactiveTintColor: "#4B4B4B",
      }}
    >
      {/* HOME */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                backgroundColor: focused
                  ? "#FBE6E3"
                  : "transparent",

                width: 62,
                height: 34,
                borderRadius: 18,

                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons
                name="home"
                size={22}
                color={
                  focused
                    ? "#D92E3F"
                    : "#4B4B4B"
                }
              />
            </View>
          ),
        }}
      />

      {/* MAP */}
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                backgroundColor: focused
                  ? "#FBE6E3"
                  : "transparent",

                width: 62,
                height: 34,
                borderRadius: 18,

                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Feather
                name="map"
                size={22}
                color={
                  focused
                    ? "#D92E3F"
                    : "#4B4B4B"
                }
              />
            </View>
          ),
        }}
      />

      {/* PREDICTION */}
      <Tab.Screen
        name="Prediction"
        component={PredictionScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                backgroundColor: focused
                  ? "#FBE6E3"
                  : "transparent",

                width: 62,
                height: 34,
                borderRadius: 18,

                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MaterialCommunityIcons
                name="file-chart-outline"
                size={22}
                color={
                  focused
                    ? "#D92E3F"
                    : "#4B4B4B"
                }
              />
            </View>
          ),
        }}
      />

      {/* HISTORY */}
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                backgroundColor: focused
                  ? "#FBE6E3"
                  : "transparent",

                width: 62,
                height: 34,
                borderRadius: 18,

                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons
                name="reload-outline"
                size={22}
                color={
                  focused
                    ? "#D92E3F"
                    : "#4B4B4B"
                }
              />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [loaded] = useFonts({
    PoppinsRegular: require("./assets/fonts/Poppins-Regular.ttf"),
    PoppinsMedium: require("./assets/fonts/Poppins-Medium.ttf"),
    PoppinsSemiBold: require("./assets/fonts/Poppins-SemiBold.ttf"),
    PoppinsBold: require("./assets/fonts/Poppins-Bold.ttf"),
  });

  if (!loaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={BottomTabs}
        />

        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}