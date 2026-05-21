import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";

import MapView, { Marker } from "react-native-maps";

import {
  Ionicons,
  Feather,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import { useNavigation } from "@react-navigation/native";

export default function MapScreen() {
  const navigation = useNavigation();
  const [selected, setSelected] =
    useState("All");

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Image
            source={require("../../assets/images/spark-logo.png")}
            style={styles.logoImage}
          />
        </View>
        <TouchableOpacity
        onPress={() =>
            navigation.navigate("Profile" as never)
        }
        >
        <Ionicons
          name="person-circle"
          size={45}
          color="#D92E3F"
        />
        </TouchableOpacity>
      </View>

      {/* FILTER BAR */}
      <View style={styles.filterContainer}>

        {[
          "All",
          "Labtek 5",
          "Labtek 8",
          "FSRD",
        ].map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.filterChip,
              selected === item &&
                styles.activeChip,
            ]}
            onPress={() =>
              setSelected(item)
            }
          >
            <Text
              style={[
                styles.filterText,
                selected === item &&
                  styles.activeChipText,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}

        <Feather
          name="sliders"
          size={18}
          color="#D92E3F"
        />
      </View>

      {/* LOCATE BUTTON */}
      <TouchableOpacity
        style={styles.locateBtn}
      >
        <Ionicons
          name="location"
          size={15}
          color="#fff"
        />

        <Text style={styles.locateText}>
          Locate Me
        </Text>
      </TouchableOpacity>

      {/* MAP */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: -6.8915,
            longitude: 107.6107,
            latitudeDelta: 0.006,
            longitudeDelta: 0.006,
          }}
        >
          {/* LABTEK 5 */}
          <Marker
            coordinate={{
              latitude: -6.8915,
              longitude: 107.6107,
            }}
          >
            <View>
              <View style={[
                styles.marker,
                { backgroundColor: "#406A43" }
              ]}>
                <Text style={styles.markerText}>
                  P
                </Text>
              </View>

              <View style={styles.popup}>
                <Text style={styles.popupTitle}>
                  Labtek 5
                </Text>

                <Text style={styles.popupSubtitle}>
                  20 spots
                </Text>
              </View>
            </View>
          </Marker>

          {/* LABTEK 8 */}
          <Marker
            coordinate={{
              latitude: -6.8919,
              longitude: 107.6116,
            }}
          >
            <View>
              <View style={[
                styles.marker,
                { backgroundColor: "#F2C94C" }
              ]}>
                <Text style={styles.markerText}>
                  P
                </Text>
              </View>

              <View style={styles.popup}>
                <Text style={styles.popupTitle}>
                  Labtek 8
                </Text>

                <Text
                  style={[
                    styles.popupSubtitle,
                    { color: "#F2C94C" }
                  ]}
                >
                  5 spots
                </Text>
              </View>
            </View>
          </Marker>

          {/* FSRD */}
          <Marker
            coordinate={{
              latitude: -6.8932,
              longitude: 107.6120,
            }}
          >
            <View>
              <View style={[
                styles.marker,
                { backgroundColor: "#D92E3F" }
              ]}>
                <Text style={styles.markerText}>
                  P
                </Text>
              </View>

              <View style={styles.popup}>
                <Text style={styles.popupTitle}>
                  FSRD
                </Text>

                <Text
                  style={[
                    styles.popupSubtitle,
                    { color: "#D92E3F" }
                  ]}
                >
                  Full
                </Text>
              </View>
            </View>
          </Marker>
        </MapView>
      </View>

      {/* LEGEND */}
      <View style={styles.legendRow}>
        <Text style={styles.legend}>
          🟢 Available
        </Text>

        <Text style={styles.legend}>
          🟡 Limited
        </Text>

        <Text style={styles.legend}>
          🔴 Full
        </Text>

        <Text style={styles.legend}>
          🔵 Your Location
        </Text>
      </View>

      {/* NAVBAR */}
      <View style={styles.bottomNav}>

        <TouchableOpacity
          style={styles.navItem}
        >
          <Ionicons
            name="home-outline"
            size={22}
            color="#4B4B4B"
          />
          <Text style={styles.navText}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.activeTab}
        >
          <Feather
            name="map"
            size={22}
            color="#D92E3F"
          />
          <Text style={styles.activeTabText}>
            Map
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
        >
          <MaterialCommunityIcons
            name="file-chart-outline"
            size={22}
            color="#4B4B4B"
          />
          <Text style={styles.navText}>
            Prediction
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
        >
          <Ionicons
            name="reload-outline"
            size={22}
            color="#4B4B4B"
          />
          <Text style={styles.navText}>
            History
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F3EE",
    paddingTop: 55,
    paddingHorizontal: 24,
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

    logoRow: {
    flexDirection: "row",
    alignItems: "center",
    },

    logoImage: {
    width: 100,
    height: 48,
    resizeMode: "contain",
    },

  /* FILTER BAR */
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    backgroundColor: "#FFF",
    borderRadius: 18,

    borderWidth: 1,
    borderColor: "#F0D7D7",

    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  filterChip: {
    backgroundColor: "#EFEAE6",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
  },

  activeChip: {
    backgroundColor: "#FBE6E3",
  },

  filterText: {
    fontSize: 11,
    fontFamily: "PoppinsMedium",
    color: "#777",
  },

  activeChipText: {
    color: "#D92E3F",
    fontFamily: "PoppinsSemiBold",
  },

  /* LOCATE BUTTON */
  locateBtn: {
    marginTop: 12,

    backgroundColor: "#406A43",

    alignSelf: "flex-start",

    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,

    flexDirection: "row",
    alignItems: "center",
  },

  locateText: {
    color: "#fff",
    fontFamily: "PoppinsMedium",
    fontSize: 11,
    marginLeft: 4,
  },

  /* MAP */
  mapContainer: {
    marginTop: 14,
    height: 460,

    borderRadius: 24,
    overflow: "hidden",

    borderWidth: 1,
    borderColor: "#F0D7D7",
  },

  map: {
    flex: 1,
  },

  /* MARKER */
  marker: {
    width: 34,
    height: 34,
    borderRadius: 17,

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 2,
    borderColor: "#fff",
  },

  markerText: {
    color: "#fff",
    fontFamily: "PoppinsBold",
    fontSize: 14,
  },

  popup: {
    backgroundColor: "#fff",

    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,

    marginTop: 6,
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,

    elevation: 4,
  },

  popupTitle: {
    fontFamily: "PoppinsBold",
    fontSize: 11,
    color: "#222",
  },

  popupSubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#777",
  },

  /* LEGEND */
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingHorizontal: 2,
  },

  legend: {
    fontSize: 10,
    color: "#777",
    fontFamily: "PoppinsRegular",
  },

  /* NAVBAR */
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,

    height: 82,
    backgroundColor: "#fff",

    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",

    borderTopWidth: 1.5,
    borderTopColor: "#F2D6D6",

    paddingBottom: 10,
  },

  navItem: {
    alignItems: "center",
    justifyContent: "center",
  },

  navText: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#4B4B4B",
    marginTop: 4,
  },

  activeTab: {
    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#FBE6E3",

    width: 58,
    height: 36,
    borderRadius: 18,
  },

  activeTabText: {
    fontFamily: "PoppinsMedium",
    fontSize: 10,
    color: "#D92E3F",
    marginTop: 2,
  },
});