import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function PredictionScreen() {
  const navigation = useNavigation<any>();

  const [selectedCampus, setSelectedCampus] =
    useState("");

  const [showCampusOptions, setShowCampusOptions] =
    useState(false);

  const ganeshaLocations = [
    "LABTEK 5",
    "LABTEK 8",
    "FSRD",
    "GKUB",
    "GKUT",
    "CADL",
    "ALBAR",
    "ALTIM",
  ];

  const jatinangorLocations = [
    "GKU 1",
    "GKU 2",
    "GKU 3",
    "REKTORAT",
  ];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 90,
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

      {/* TITLE */}
      <Text style={styles.title}>
        Prediction
      </Text>

      {/* PREDICT BOX */}
      <View style={styles.predictBox}>
        <Text style={styles.predictTitle}>
          Predict Parking Availability
        </Text>

        {/* WHERE */}
        <TouchableOpacity
          style={styles.whereBox}
          onPress={() =>
            setShowCampusOptions(
              !showCampusOptions
            )
          }
        >
          <View style={styles.row}>
            <Ionicons
              name="location"
              size={22}
              color="#D92E3F"
            />

            <View
              style={{
                marginLeft: 14,
              }}
            >
              <Text
                style={
                  styles.whereTitle
                }
              >
                Where?
              </Text>

              <Text
                style={
                  styles.whereSubtitle
                }
              >
                {selectedCampus ||
                  "Select destination....."}
              </Text>
            </View>
          </View>

          <Ionicons
            name="chevron-down"
            size={24}
            color="#D92E3F"
          />
        </TouchableOpacity>

{/* CAMPUS OPTIONS */}
{showCampusOptions && (
  <View style={styles.optionContainer}>
    <TouchableOpacity
      style={styles.optionButton}
      onPress={() => {
        setSelectedCampus(
          "GANESHA"
        );
        setShowCampusOptions(
          false
        );
      }}
    >
      <Text style={styles.optionText}>
        Ganesha
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.optionButton}
      onPress={() => {
        setSelectedCampus(
          "JATINANGOR"
        );
        setShowCampusOptions(
          false
        );
      }}
    >
      <Text style={styles.optionText}>
        Jatinangor
      </Text>
    </TouchableOpacity>
  </View>
)}
</View>

    {/* RECOMMEND */}
    {selectedCampus !== "" && (
      <>
        <Text
          style={styles.recommendTitle}
        >
          Recommend Parking
        </Text>

        <Text
          style={
            styles.recommendSubtitle
          }
        >
          Prediction based on
          real-time and historical
          data estimation
        </Text>

        {(
          selectedCampus ===
          "GANESHA"
            ? ganeshaLocations
            : [
                "GKU 1",
                "GKU 2",
                "REKTORAT",
              ]
        ).map(
          (location, index) => (
            <ParkingCard
              key={location}
              color={
                index % 3 === 0
                  ? "#406A43"
                  : index % 3 === 1
                  ? "#D92E3F"
                  : "#F2C94C"
              }
              status={
                index % 3 === 0
                  ? "Available"
                  : index % 3 === 1
                  ? "Full"
                  : "Limited"
              }
              spots={
                index % 3 === 0
                  ? "24"
                  : index % 3 === 1
                  ? "0"
                  : "4"
              }
              title={location}
              icon={
                index % 3 === 0
                  ? "checkmark-circle"
                  : index % 3 === 1
                  ? "close-circle"
                  : "alert-circle"
              }
              note={
                index % 3 === 0
                  ? "Most likely available on arrival"
                  : index % 3 === 1
                  ? "Not available on arrival"
                  : "Likely available on arrival"
              }
                onNavigate={() =>
                navigation.navigate(
                  "DetailParking" as never,
                  {
                    selectedLocation:
                        location === "LABTEK 5"
                          ? "Labtek 5"
                          : location === "LABTEK 8"
                          ? "Labtek 8"
                          : location === "ALBAR"
                          ? "Aula Barat"
                          : location === "ALTIM"
                          ? "Aula Timur"
                          : location === "REKTORAT"
                          ? "Rektorat"
                          : location,
                  } as never
                )
              }
            />
          )
        )}
      </>
    )}
    </ScrollView>
  );
}

/* CARD COMPONENT */
function ParkingCard({
  color,
  status,
  spots,
  title,
  icon,
  note,
  onNavigate,
}: any) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View
          style={[
            styles.parkingIcon,
            {
              backgroundColor:
                color,
            },
          ]}
        >
          <Text
            style={styles.pText}
          >
            P
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={
              styles.cardTitle
            }
          >
            {title}
          </Text>

          <View
            style={
              styles.infoRow
            }
          >
            <Ionicons
              name="walk"
              size={18}
              color={color}
            />

            <Text
              style={
                styles.walkText
              }
            >
              3 min walk
            </Text>
          </View>

          <View
            style={
              styles.infoRow
            }
          >
            <Ionicons
              name={icon}
              size={18}
              color={color}
            />

            <Text
              style={
                styles.noteText
              }
            >
              {note}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.line} />

      <View
        style={
          styles.cardBottom
        }
      >
        <View
          style={styles.row}
        >
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  color + "20",
              },
            ]}
          >
            <Text
              style={{
                color,
                fontFamily:
                  "PoppinsMedium",
              }}
            >
              {status}
            </Text>
          </View>

          <Text
            style={
              styles.spotText
            }
          >
            {spots} spots
          </Text>
        </View>

        <TouchableOpacity
            style={[
              styles.navigateBtn,
              {
                borderColor: color,
              },
            ]}
            onPress={onNavigate}
          >
          <Ionicons
            name="location"
            size={18}
            color={color}
          />

          <Text
            style={{
              color,
              marginLeft: 4,
              fontFamily:
                "PoppinsMedium",
            }}
          >
            Navigate
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
    paddingHorizontal: 24,
    paddingTop: 55,
  },

  header: {
    flexDirection: "row",
    justifyContent:
      "space-between",
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
    fontFamily:
      "PoppinsBold",
    fontSize: 28,
    color: "#D92E3F",
    marginTop: 10,
    marginBottom: 22,
  },

  predictBox: {
    backgroundColor:
      "#FAF8F6",
    borderWidth: 1.2,
    borderColor: "#F0C8C8",
    borderRadius: 22,
    padding: 16,
    marginBottom: 18,
  },

  predictTitle: {
    fontFamily:
      "PoppinsBold",
    fontSize: 16,
    color: "#D92E3F",
    marginBottom: 12,
  },

  whereBox: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#F0C8C8",
    borderRadius: 22,
    minHeight: 56,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
  },

  optionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },

  optionButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#F0C8C8",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  optionText: {
    fontFamily:
      "PoppinsMedium",
    color: "#444",
    fontSize: 12,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  whereTitle: {
    fontFamily:
      "PoppinsSemiBold",
    fontSize: 14,
    color: "#111",
  },

  whereSubtitle: {
    fontFamily:
      "PoppinsRegular",
    fontSize: 11,
    color: "#8A8A8A",
    marginTop: -2,
  },

  recommendTitle: {
    fontFamily:
      "PoppinsBold",
    fontSize: 16,
    color: "#D92E3F",
  },

  recommendSubtitle: {
    fontFamily:
      "PoppinsRegular",
    fontSize: 13,
    color: "#222",
    marginTop: 2,
    marginBottom: 12,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: "#F0C8C8",
    padding: 14,
    marginBottom: 10,
  },

  cardTop: {
    flexDirection: "row",
    gap: 16,
  },

  parkingIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent:
      "center",
    alignItems: "center",
  },

  pText: {
    color: "#fff",
    fontFamily:
      "PoppinsBold",
    fontSize: 22,
  },

  cardTitle: {
    fontFamily:
      "PoppinsBold",
    fontSize: 14,
    marginBottom: 8,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  walkText: {
    marginLeft: 6,
    fontSize: 11,
    color: "#444",
  },

  noteText: {
    marginLeft: 6,
    fontSize: 11,
    color: "#444",
  },

  line: {
    height: 1,
    backgroundColor:
      "#ECECEC",
    marginVertical: 18,
  },

  cardBottom: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
  },

  statusBadge: {
    paddingHorizontal: 12,
    height: 28,
    borderRadius: 18,
    justifyContent:
      "center",
    alignItems: "center",
  },

  spotText: {
    marginLeft: 12,
    fontFamily:
      "PoppinsBold",
    fontSize: 13,
  },

  navigateBtn: {
    borderWidth: 2,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "center",
  },
});