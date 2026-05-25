import React, { useState, useEffect, useCallback } from "react";

import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import {
  MaterialCommunityIcons,
  Feather,
  Ionicons,
} from "@expo/vector-icons";

import { useNavigation, useRoute } from "@react-navigation/native";
import {
  getParkingAreas,
  getParkingAreaStatus,
  getPrediction,
  ParkingAreaWithStatus,
  PredictionResponse,
} from "../services/api";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DetailParkingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const initialLocation = route.params?.selectedLocation || "LABTEK 5";
  const initialAreaId = route.params?.areaId || "";

  const [areas, setAreas] = useState<ParkingAreaWithStatus[]>([]);
  const [currentArea, setCurrentArea] = useState<ParkingAreaWithStatus | null>(null);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [loading, setLoading] = useState(true);

  const [showDropdown, setShowDropdown] = useState(false);

  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [aiPrediction, setAiPrediction] = useState("Please select the parking slot first!");
  const [predicting, setPredicting] = useState(false);

  // Fetch all areas
  const fetchAreas = useCallback(async () => {
    try {
      const data = await getParkingAreas();
      setAreas(data);

      // Find current area
      const found = data.find(
        (a) => a.id === initialAreaId || a.name === initialLocation
      );
      if (found) {
        setCurrentArea(found);
        setSelectedLocation(found.name);
      }
    } catch (e) {
      console.error("DetailParkingScreen fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, [initialAreaId, initialLocation]);

  useEffect(() => { fetchAreas(); }, [fetchAreas]);

  // When location changes, update current area
  useEffect(() => {
    const found = areas.find((a) => a.name === selectedLocation);
    if (found) setCurrentArea(found);
  }, [selectedLocation, areas]);

  // Refresh selected area status from API
  useEffect(() => {
    const refreshStatus = async () => {
      if (!currentArea?.id) return;
      try {
        const latest = await getParkingAreaStatus(currentArea.id);
        console.log("OK:", latest);
        setCurrentArea(latest);
        setAreas((prev) => prev.map((a) => (a.id === latest.id ? latest : a)));
      } catch (e) {
        console.error("DetailParkingScreen status refresh error:", e);
      }
    };

    refreshStatus();
    const intervalId = setInterval(refreshStatus, 3000);

    return () => clearInterval(intervalId);
  }, [currentArea?.id]);

  // Determine campus
  const isJatinangor = currentArea ? currentArea.latitude <= -6.92 : false;
  const campusAreas = areas.filter((a) =>
    isJatinangor ? a.latitude <= -6.92 : a.latitude > -6.92
  );

  // Build filter chips (first 3 areas) + dropdown for rest
  const mainChips = campusAreas.slice(0, 3).map((a) => a.name);
  const dropdownChips = campusAreas.slice(3).map((a) => a.name);

  // Generate parking slots from current area data
  const generateSlots = () => {
    if (!currentArea) return [];
    const slots: { id: string; car: boolean }[] = [];
    const slotLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const total = currentArea.total_slots;
    const occupied = currentArea.occupied_slots;
    const slotStatusMap = currentArea.slot_status;

    const resolveOccupied = (slotId: string, slotIndex: number, fallback: boolean) => {
      if (!slotStatusMap) return fallback;
      const statusKey = `slot_${slotIndex + 1}`;
      const raw = (slotStatusMap as Record<string, unknown>)[statusKey]
        ?? (slotStatusMap as Record<string, unknown>)[slotId];
      if (typeof raw === "boolean") return raw;
      if (typeof raw === "string") {
        const value = raw.toLowerCase();
        if (value === "empty" || value === "available") return false;
        return value === "occupied" || value === "full";
      }
      return fallback;
    };

    for (let i = 0; i < Math.min(total, 26); i++) {
      slots.push({
        id: slotLabels[i],
        car: resolveOccupied(slotLabels[i], i, i < occupied),
      });
    }
    return slots;
  };

  const parkingSlots = generateSlots();
  const leftSlots = parkingSlots.slice(0, 6);
  const rightSlots = parkingSlots.slice(6, 12);

  // Generate prediction for a slot
  const generatePrediction = async (slotId: string, hasCar: boolean) => {
    if (hasCar) {
      setAiPrediction(
        `❌ Slot ${slotId} is currently occupied.\nPlease select another parking slot.`
      );
      setSelectedSlot(null);
      return;
    }

    setSelectedSlot(slotId);

    if (!currentArea) return;

    setPredicting(true);
    try {
      const arrivalTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      const pred = await getPrediction(currentArea.id, arrivalTime);

      const confidence = Math.round(pred.confidence * 100);

      if (pred.predicted_status_label === "available") {
        setAiPrediction(
          `✅ Slot ${slotId} has a HIGH chance of staying available for the next 20–35 minutes.\nRecommended for immediate parking.\nConfidence: ${confidence}%`
        );
      } else if (pred.predicted_status_label === "limited") {
        setAiPrediction(
          `⚠️ Slot ${slotId} may become occupied within 10–15 minutes.\nRecommended if arriving soon.\nConfidence: ${confidence}%`
        );
      } else {
        setAiPrediction(
          `❌ Slot ${slotId} is predicted to be occupied soon.\nConsider choosing another area.\nConfidence: ${confidence}%`
        );
      }
    } catch (e) {
      setAiPrediction(
        `✅ Slot ${slotId} is currently available.\nPrediction service unavailable — showing current status.`
      );
    } finally {
      setPredicting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#D92E3F" />
      </View>
    );
  }

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
            onPress={() => navigation.navigate("Profile")}
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
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather
              name="arrow-left"
              size={18}
              color="#D92E2F"
            />
          </TouchableOpacity>

          <View style={styles.filterContainer}>
            {mainChips.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.filterChip,
                  selectedLocation === item && styles.activeChip,
                ]}
                onPress={() => setSelectedLocation(item)}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedLocation === item && styles.activeFilterText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}

            {dropdownChips.length > 0 && (
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowDropdown(!showDropdown)}
              >
                <Text style={styles.filterText}>More</Text>
                <Ionicons
                  name={showDropdown ? "chevron-up" : "chevron-down"}
                  size={16}
                  color="#D92E2F"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* DROPDOWN */}
        {showDropdown && (
          <View style={styles.dropdownMenu}>
            {dropdownChips.map((location) => (
              <TouchableOpacity
                key={location}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedLocation(location);
                  setShowDropdown(false);
                }}
              >
                <Text style={styles.dropdownText}>{location}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* TITLE */}
        <View style={styles.titleRow}>
          <MaterialCommunityIcons
            name="parking"
            size={28}
            color="#D92E2F"
          />

          <Text style={styles.title}>
            {selectedLocation}
          </Text>

          {currentArea && (
            <Text style={styles.statusInfo}>
              {currentArea.available_slots}/{currentArea.total_slots} available
            </Text>
          )}
        </View>

        {/* GRID */}
        <ScrollView
          style={styles.gridScroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.grid}>
            <View style={styles.gridColumn}>
              {leftSlots.map((slot) => (
                <View key={slot.id} style={styles.slotWrapper}>
                  {slot.car ? (
                    <TouchableOpacity
                      onPress={() => generatePrediction(slot.id, true)}
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
                        selectedSlot === slot.id && styles.selectedSlot,
                      ]}
                      onPress={() => generatePrediction(slot.id, false)}
                    >
                      <Text style={styles.slotLetter}>{slot.id}</Text>
                      <Text style={styles.slotStatus}>Available</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
            <View style={styles.gridColumn}>
              {rightSlots.map((slot) => (
                <View key={slot.id} style={styles.slotWrapper}>
                  {slot.car ? (
                    <TouchableOpacity
                      onPress={() => generatePrediction(slot.id, true)}
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
                        selectedSlot === slot.id && styles.selectedSlot,
                      ]}
                      onPress={() => generatePrediction(slot.id, false)}
                    >
                      <Text style={styles.slotLetter}>{slot.id}</Text>
                      <Text style={styles.slotStatus}>Available</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
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
            {predicting ? (
              <ActivityIndicator size="small" color="#D92E3F" />
            ) : (
              <Text style={styles.aiText}>{aiPrediction}</Text>
            )}
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

  statusInfo: {
    fontFamily: "PoppinsRegular",
    fontSize: 12,
    color: "#888",
    marginLeft: "auto",
  },

  grid: {
    marginTop: 20,
    paddingHorizontal: 30,

    flexDirection: "row",
    justifyContent: "space-between",
  },

  gridColumn: {
    width: "46%",
  },

  slotWrapper: {
    width: "100%",
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
    height: 72,
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