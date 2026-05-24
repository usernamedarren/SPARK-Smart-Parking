import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function ViewScreen() {
  const navigation = useNavigation();

  const [searchText, setSearchText] =
    useState("");

  const [selectedLocation, setSelectedLocation] =
    useState("LABTEK 5");

  const ganeshaLocations = [
    "Labtek 5",
    "Labtek 8",
    "FSRD",
    "GKUB",
    "GKUT",
    "CADL",
    "Aula Barat",
    "Aula Timur",
  ];

  const jatinangorLocations = [
    "GKU 1",
    "GKU 2",
    "GKU 3",
    "Rektorat",
  ];

  const allLocations = [
    ...ganeshaLocations,
    ...jatinangorLocations,
  ];

  const filteredLocations =
    allLocations.filter((item) =>
      item
        .toLowerCase()
        .includes(searchText.toLowerCase())
    );

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 120,
      }}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/spark-logo.png")}
          style={styles.logo}
        />

        <TouchableOpacity
          onPress={() =>
            navigation.navigate(
              "Profile" as never
            )
          }
        >
          <Ionicons
            name="person-circle"
            size={45}
            color="#D92E3F"
          />
        </TouchableOpacity>
      </View>

      {/* CITY BG */}
      <Image
        source={require("../../assets/images/city-bg.png")}
        style={styles.cityImage}
      />

      {/* HERO SECTION */}
      <View style={styles.heroWrapper}>
        <View style={styles.heroSection}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>
              Parking View
            </Text>

            <Text style={styles.lastUpdated}>
              Last updated on Wed 23 May 26, 15.00
            </Text>
          </View>
        </View>
      </View>

      {/* SEARCH */}
      <View style={styles.searchBox}>
        <Ionicons
          name="search"
          size={22}
          color="#777"
        />

        <TextInput
          style={styles.input}
          placeholder="Search location (e.g., Labtek, GKU)"
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* LIVE FEED CARD */}
      <View style={styles.feedCard}>
        <Text style={styles.feedTitle}>
          🎥 Parking Live Feed
        </Text>

        <View style={styles.cameraBox}>
          <Image
            source={require("../../assets/images/live-feed.jpg")}
            style={styles.cameraImage}
          />

          <View style={styles.liveBadge}>
            <Text style={styles.liveText}>
              ● LIVE CAM
            </Text>
          </View>
        </View>

        <View style={styles.feedBottom}>
          <Text style={styles.monitoring}>
            Monitoring Zone:
            <Text style={styles.zone}>
              {" "}
              {selectedLocation}
            </Text>
          </Text>

          <TouchableOpacity>
            <Text style={styles.refresh}>
              ↻ Refresh Feed
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* LOCATION CARD */}
      <View style={styles.locationCard}>
        <Text style={styles.locationTitle}>
          Parking Location
        </Text>

        <Text style={styles.locationSubtitle}>
          ITB GANESHA
        </Text>

        <View style={styles.locationGrid}>
          {filteredLocations
            .slice(0, 8)
            .map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.locationButton,
                  selectedLocation === item &&
                    styles.activeLocation,
                ]}
                onPress={() =>
                  setSelectedLocation(item)
                }
              >
                <Text
                  style={[
                    styles.locationText,
                    selectedLocation === item &&
                      styles.activeText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
        </View>

        <Text style={styles.locationSubtitle}>
          ITB JATINANGOR
        </Text>

        <View style={styles.locationGrid}>
          {filteredLocations
            .slice(8,12)
            .map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.locationButton,
                  selectedLocation === item &&
                    styles.activeLocation,
                ]}
                onPress={() =>
                  setSelectedLocation(item)
                }
              >
                <Text
                  style={[
                    styles.locationText,
                    selectedLocation === item &&
                      styles.activeText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
        </View>
      </View>

      {/* LEGEND */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.dot,
              { backgroundColor: "#3D5E39" },
            ]}
          />
          <Text style={styles.legendText}>
            Available
          </Text>
        </View>

        <View style={styles.legendItem}>
          <View
            style={[
              styles.dot,
              { backgroundColor: "#F2C94C" },
            ]}
          />
          <Text style={styles.legendText}>
            Limited
          </Text>
        </View>

        <View style={styles.legendItem}>
          <View
            style={[
              styles.dot,
              { backgroundColor: "#D92E3F" },
            ]}
          />
          <Text style={styles.legendText}>
            Full
          </Text>
        </View>
      </View>

      <Text style={styles.peakHours}>
        Peak hours: 09.00 - 12.00
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F3EE",
    paddingHorizontal: 24,
    paddingTop: 55,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logo: {
    width: 100,
    height: 48,
    resizeMode: "contain",
  },

  cityImage: {
    position: "absolute",
    top: 20,
    right: -35,
    width: 250,
    height: 110,
    resizeMode: "contain",
  },

  title: {
    fontSize: 20,
    fontFamily: "PoppinsBold",
    color: "#D92E3F",
    marginTop: 0,
  },

  lastUpdated: {
    fontSize: 15,
    fontFamily: "PoppinsRegular",
    color: "#D92E3F",
    marginTop: -2,
  },

  searchBox: {
    height: 45,
    borderWidth: 2,
    borderColor: "#D92E3F",
    borderRadius: 20,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,

    marginTop: -100,
    marginBottom: 20,

    zIndex: 1000,
    elevation: 5,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontFamily: "PoppinsRegular",
    fontSize: 13,
  },

  feedCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#F2D9D9",
    padding: 18,
    marginBottom: 18,
  },

  feedTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 18,
    marginBottom: 12,
  },

  cameraBox: {
    position: "relative",
  },

  cameraImage: {
    width: "100%",
    height: 220,
    borderRadius: 18,
  },

  liveBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#D92E3F",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },

  liveText: {
    color: "#FFF",
    fontSize: 11,
    fontFamily: "PoppinsSemiBold",
  },

  feedBottom: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  monitoring: {
    fontFamily: "PoppinsRegular",
    fontSize: 12,
  },

  zone: {
    color: "#D92E3F",
    fontFamily: "PoppinsBold",
  },

  refresh: {
    color: "#D92E3F",
    fontSize: 12,
    fontFamily: "PoppinsMedium",
  },

  locationCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#F2D9D9",
    padding: 18,
  },

  locationTitle: {
    fontFamily: "PoppinsBold",
    fontSize: 18,
    marginBottom: 10,
  },

  locationSubtitle: {
    fontSize: 11,
    color: "#999",
    fontFamily: "PoppinsMedium",
    marginBottom: 12,
    marginTop: 10,
  },

  locationGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  locationButton: {
    width: "48%",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 10,
  },

  activeLocation: {
    backgroundColor: "#D92E3F",
    borderColor: "#D92E3F",
  },

  locationText: {
    fontFamily: "PoppinsMedium",
    color: "#555",
    fontSize: 13,
  },

  activeText: {
    color: "#FFF",
  },

  legendRow: {
    flexDirection: "row",
    marginTop: 18,
    gap: 16,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 100,
    marginRight: 6,
  },

  legendText: {
    fontSize: 11,
    fontFamily: "PoppinsRegular",
  },

  peakHours: {
    marginTop: 10,
    fontSize: 11,
    color: "#777",
    alignSelf: "flex-end",
    fontFamily: "PoppinsRegular",
  },

  heroSection: {
  minHeight: 150,
  justifyContent: "center",
  zIndex: 2,
},

textContainer: {
  zIndex: 2,
  width: "90%",
  marginTop: -135,
},

heroWrapper: {
  position: "relative",
  marginTop: 20,

  marginHorizontal: -24,
  paddingHorizontal: 24,
},
});