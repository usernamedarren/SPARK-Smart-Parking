import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import {
  MaterialCommunityIcons,
  Feather,
  Ionicons,
} from "@expo/vector-icons";

import { useNavigation, useRoute } from "@react-navigation/native";

export default function DetailParkingScreen() {
  
  const navigation =
    useNavigation<any>();
  const route = useRoute<any>();
  const initialLocation =
  route.params
    ?.selectedLocation ||
  "Labtek 5";

  const [selectedLocation,
    setSelectedLocation] =
    useState(initialLocation);

  const [showDropdown,
    setShowDropdown] =
    useState(false);

  const ganeshaDropdown = [
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

  const [selectedSlot, setSelectedSlot] =
  useState<string | null>(null);

  const [aiPrediction, setAiPrediction] =
  useState(
    "Please select the parking slot first!"
  );

  // 10 SLOT RANDOM TIAP LOKASI
  const parkingData: Record<
    string,
    {
      id: string;
      car: boolean;
    }[]
  > = {
    "Labtek 5": [
      { id: "A", car: false },
      { id: "B", car: true },
      { id: "C", car: true },
      { id: "D", car: false },
      { id: "E", car: false },
      { id: "F", car: true },
      { id: "G", car: false },
      { id: "H", car: true },
      { id: "I", car: false },
      { id: "J", car: true },
      { id: "K", car: false },
      { id: "L", car: true },
    ],

    "Labtek 8": [
      { id: "A", car: true },
      { id: "B", car: false },
      { id: "C", car: false },
      { id: "D", car: true },
      { id: "E", car: true },
      { id: "F", car: false },
      { id: "G", car: true },
      { id: "H", car: false },
      { id: "I", car: true },
      { id: "J", car: false },
    ],

    FSRD: [
      { id: "A", car: true },
      { id: "B", car: true },
      { id: "C", car: false },
      { id: "D", car: true },
      { id: "E", car: false },
      { id: "F", car: false },
      { id: "G", car: true },
      { id: "H", car: false },
      { id: "I", car: true },
      { id: "J", car: false },
    ],

    GKUB: [
      { id: "A", car: false },
      { id: "B", car: false },
      { id: "C", car: true },
      { id: "D", car: false },
      { id: "E", car: true },
      { id: "F", car: false },
      { id: "G", car: false },
      { id: "H", car: true },
      { id: "I", car: false },
      { id: "J", car: true },
    ],

    GKUT: [
      { id: "A", car: true },
      { id: "B", car: false },
      { id: "C", car: true },
      { id: "D", car: false },
      { id: "E", car: true },
      { id: "F", car: true },
      { id: "G", car: false },
      { id: "H", car: false },
      { id: "I", car: true },
      { id: "J", car: false },
    ],

    CADL: [
      { id: "A", car: false },
      { id: "B", car: true },
      { id: "C", car: false },
      { id: "D", car: false },
      { id: "E", car: true },
      { id: "F", car: false },
      { id: "G", car: true },
      { id: "H", car: true },
      { id: "I", car: false },
      { id: "J", car: false },
    ],

    "Aula Barat": [
      { id: "A", car: true },
      { id: "B", car: true },
      { id: "C", car: false },
      { id: "D", car: false },
      { id: "E", car: true },
      { id: "F", car: false },
      { id: "G", car: true },
      { id: "H", car: false },
      { id: "I", car: true },
      { id: "J", car: false },
    ],

    "Aula Timur": [
      { id: "A", car: false },
      { id: "B", car: false },
      { id: "C", car: true },
      { id: "D", car: true },
      { id: "E", car: false },
      { id: "F", car: true },
      { id: "G", car: false },
      { id: "H", car: true },
      { id: "I", car: false },
      { id: "J", car: true },
    ],

    "GKU 1": [
    { id: "A", car: false },
    { id: "B", car: true },
    { id: "C", car: false },
    { id: "D", car: true },
    { id: "E", car: false },
    { id: "F", car: true },
    { id: "G", car: false },
    { id: "H", car: true },
    { id: "I", car: false },
    { id: "J", car: false },
  ],

  "GKU 2": [
    { id: "A", car: true },
    { id: "B", car: false },
    { id: "C", car: true },
    { id: "D", car: false },
    { id: "E", car: true },
    { id: "F", car: false },
    { id: "G", car: false },
    { id: "H", car: true },
    { id: "I", car: false },
    { id: "J", car: true },
  ],

  "GKU 3": [
    { id: "A", car: false },
    { id: "B", car: false },
    { id: "C", car: true },
    { id: "D", car: true },
    { id: "E", car: false },
    { id: "F", car: true },
    { id: "G", car: true },
    { id: "H", car: false },
    { id: "I", car: true },
    { id: "J", car: false },
  ],

  Rektorat: [
    { id: "A", car: true },
    { id: "B", car: false },
    { id: "C", car: false },
    { id: "D", car: true },
    { id: "E", car: true },
    { id: "F", car: false },
    { id: "G", car: false },
    { id: "H", car: true },
    { id: "I", car: false },
    { id: "J", car: true },
  ],
  };

  const parkingSlots =
    parkingData[
      selectedLocation
    ];

  const generatePrediction = (
    slotId: string,
    hasCar: boolean
  ) => {
    if (hasCar) {
      setAiPrediction(
        `❌ Slot ${slotId} is currently occupied.\nPlease select another parking slot.`
      );

      return;
    }

  const predictions = [
    `✅ Slot ${slotId} has a HIGH chance of staying available for the next 20–35 minutes.\nRecommended for immediate parking.\nConfidence: 89%`,

    `⚠️ Slot ${slotId} may become occupied within 10–15 minutes.\nRecommended if arriving soon.\nConfidence: 74%`,

    `✅ Slot ${slotId} is predicted to remain available during peak time.\nEstimated availability: 25+ minutes.\nConfidence: 91%`,
  ];

  const randomPrediction =
    predictions[
      Math.floor(
        Math.random() *
          predictions.length
      )
    ];

  setAiPrediction(
    randomPrediction
  );

  setSelectedSlot(slotId);
};

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* HEADER */}
        <View style={styles.header}>
          <Image
            source={require("../../assets/images/spark-logo.png")}
            style={styles.logo}
          />

          <TouchableOpacity
            onPress={() =>
              navigation.navigate(
                "Profile"
              )
            }
          >
            <MaterialCommunityIcons
              name="account-circle"
              size={48}
              color="#D92E2F"
            />
          </TouchableOpacity>
        </View>

        {/* FILTER */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={
              styles.backButton
            }
            onPress={() =>
              navigation.goBack()
            }
          >
            <Feather
              name="arrow-left"
              size={18}
              color="#D92E2F"
            />
          </TouchableOpacity>

          <View
            style={
              styles.filterContainer
            }
          >
            {(
                selectedLocation.includes("GKU") ||
                selectedLocation === "Rektorat"
                  ? [
                      "GKU 1",
                      "GKU 2",
                      "GKU 3",
                      "Rektorat",
                    ]
                  : [
                      "Labtek 5",
                      "Labtek 8",
                      "FSRD",
                    ]
              ).map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.filterChip,
                  selectedLocation ===
                    item &&
                    styles.activeChip,
                ]}
                onPress={() =>
                  setSelectedLocation(
                    item
                  )
                }
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedLocation ===
                      item &&
                      styles.activeFilterText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
        {!(
          selectedLocation.includes("GKU") ||
          selectedLocation === "Rektorat"
        ) && (
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() =>
              setShowDropdown(
                !showDropdown
              )
            }
          >
            <Text style={styles.filterText}>
              More
            </Text>

            <Ionicons
              name={
                showDropdown
                  ? "chevron-up"
                  : "chevron-down"
              }
              size={16}
              color="#D92E2F"
            />
          </TouchableOpacity>
        )}
          </View>
        </View>

        {/* DROPDOWN */}
        {showDropdown && (
          <View
            style={
              styles.dropdownMenu
            }
          >
            {(
                selectedLocation.includes("GKU") ||
                selectedLocation === "Rektorat"
                  ? jatinangorLocations
                  : ganeshaDropdown
              ).map(
              (
                location
              ) => (
                <TouchableOpacity
                  key={location}
                  style={
                    styles.dropdownItem
                  }
                  onPress={() => {
                    setSelectedLocation(
                      location
                    );

                    setShowDropdown(
                      false
                    );
                  }}
                >
                  <Text
                    style={
                      styles.dropdownText
                    }
                  >
                    {location}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        )}

        {/* TITLE */}
        <View
          style={styles.titleRow}
        >
          <MaterialCommunityIcons
            name="parking"
            size={28}
            color="#D92E2F"
          />

          <Text
            style={styles.title}
          >
            {selectedLocation}
          </Text>
        </View>

        {/* GRID */}
        <ScrollView
          style={styles.gridScroll}
          showsVerticalScrollIndicator={false}
        >
        <View style={styles.grid}>
          {parkingSlots.map(
            (slot) => (
              <View
                key={slot.id}
                style={
                  styles.slotWrapper
                }
              >
      {slot.car ? (
        <TouchableOpacity
          onPress={() =>
            generatePrediction(
              slot.id,
              true
            )
          }
        >
          <Image
            source={require("../../assets/images/car-top.png")}
            style={styles.carImage}
          />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[
            styles.slotCard,
            selectedSlot ===
              slot.id &&
              styles.selectedSlot,
          ]}
          onPress={() =>
            generatePrediction(
              slot.id,
              false
            )
          }
        >
                    <Text
                      style={
                        styles.slotLetter
                      }
                    >
                      {slot.id}
                    </Text>

                    <Text
                      style={
                        styles.slotStatus
                      }
                    >
                      Available
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )
          )}
        </View>
      </ScrollView>  

      </View>
      {/* AI CARD */}

      <View style={styles.fixedAiContainer}>
        <View style={styles.aiCard}>
          <Text style={styles.aiTitle}>
            AI Analysis Prediction
          </Text>

          <View style={styles.aiBox}>
            <Text style={styles.aiText}>
              {aiPrediction}
            </Text>
        </View>
      </View>
    </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F6EE",
  },

  header: {
    marginTop: 52,
    paddingHorizontal: 28,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logo: {
    width: 92,
    height: 40,
    resizeMode: "contain",
  },

  filterContainer: {
    flex: 1,

    borderWidth: 1.3,
    borderColor: "#F1D0D0",

    borderRadius: 20,
    backgroundColor: "#FFF",

    paddingVertical: 8,
    paddingHorizontal: 8,

    marginLeft: 10,

    flexDirection: "row",
    alignItems: "center",
  },

  filterChip: {
    backgroundColor: "#EFEAEA",
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 7,
    marginRight: 6,
    alignItems: "center",
  },

  activeChip: {
    backgroundColor: "#F8DCDC",
  },

  filterText: {
    fontFamily: "PoppinsMedium",
    fontSize: 11,
    color: "#666",
  },

  activeFilterText: {
    color: "#D92E2F",
  },

  filterIcon: {
    marginLeft: "auto",
    paddingLeft: 4,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",

    marginHorizontal: 30,
    marginTop: 18,
  },

  title: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 18,
    color: "#D92E2F",
    marginLeft: 8,
  },

  grid: {
    marginTop: 20,
    paddingHorizontal: 30,

    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  slotWrapper: {
    width: "46%",
    marginBottom: 12,
  },

  slotCard: {
    height: 72,
    borderWidth: 1.5,
    borderColor: "#F1D0D0",
    borderRadius: 16,

    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },

  slotLetter: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 16,
    color: "#D92E2F",
  },

  slotStatus: {
    fontFamily: "PoppinsMedium",
    fontSize: 15,
    color: "#6B5D5D",
  },

  carImage: {
    width: "100%",
    height: 58,
    resizeMode: "contain",
  },

  aiCard: {
    marginTop: 8,
    marginHorizontal: 30,

    backgroundColor: "#FFF",
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: "#F2D2D2",

    padding: 24,
  },

  aiTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 18,
    color: "#D92E2F",
  },

  aiBox: {
    marginTop: 12,
    backgroundColor: "#FBE7E1",
    borderRadius: 14,
    height: 90,

    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  aiText: {
    fontFamily: "PoppinsMedium",
    fontSize: 11,
    color: "#222",
    textAlign: "center",
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 22,
    paddingHorizontal: 30,
  },
  
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,

    borderWidth: 1.5,
    borderColor: "#D92E2F",

    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "#FFF",
  },

  dropdownButton: {
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
  marginLeft: 4,
},

dropdownMenu: {
  backgroundColor: "#FFF",
  borderRadius: 18,
  marginHorizontal: 30,
  marginTop: 8,
  paddingVertical: 10,
  borderWidth: 1,
  borderColor: "#F1D0D0",
},

dropdownItem: {
  paddingVertical: 10,
  paddingHorizontal: 16,
},

dropdownText: {
  fontFamily: "PoppinsMedium",
  fontSize: 13,
  color: "#444",
},

selectedSlot: {
  borderWidth: 2.5,
  borderColor: "#D92E2F",
  backgroundColor: "#FFF5F5",
},

fixedAiContainer: {
  position: "absolute",
  bottom: 20,
  left: 0,
  right: 0,
},

gridScroll: {
  maxHeight: 450,
  marginTop: 20,
  paddingBottom: 180,
},
content: {
  flex: 1,
},
});