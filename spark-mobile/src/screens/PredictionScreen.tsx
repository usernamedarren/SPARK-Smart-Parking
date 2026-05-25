import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  getParkingAreas,
  getRecommendations,
  ParkingAreaWithStatus,
  RecommendationItem,
} from "../services/api";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function statusColor(label: string): string {
  switch (label) {
    case "available": return "#406A43";
    case "limited": return "#F2C94C";
    case "full": return "#D92E3F";
    default: return "#406A43";
  }
}

function statusText(label: string): string {
  switch (label) {
    case "available": return "Available";
    case "limited": return "Limited";
    case "full": return "Full";
    default: return "Available";
  }
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function normalizeName(value: string): string {
  return String(value || "").trim().toLowerCase();
}

function getAreaAvailability(area: ParkingAreaWithStatus): { available: number; total: number } {
  const slotStatus = area.slot_status;
  if (!slotStatus || Object.keys(slotStatus).length === 0) {
    return { available: area.available_slots, total: area.total_slots };
  }

  let available = 0;
  for (const raw of Object.values(slotStatus)) {
    if (typeof raw === "boolean") {
      if (!raw) available += 1;
      continue;
    }
    if (typeof raw === "string") {
      const value = raw.toLowerCase();
      if (value === "empty" || value === "available") {
        available += 1;
      }
    }
  }

  return { available, total: area.total_slots };
}

const campusData = {
  Ganesha: ["LABTEK 5", "LABTEK 8", "FSRD", "GKUB", "GKUT", "CADL", "ALBAR", "ALTIM"],
  Jatinangor: ["GKU 1", "GKU 2", "GKU 3", "REKTORAT"],
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PredictionScreen() {
  const navigation = useNavigation<any>();

  const [areas, setAreas] = useState<ParkingAreaWithStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCampus, setSelectedCampus] = useState("Ganesha");
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [showCampusOptions, setShowCampusOptions] = useState(false);
  const [showBuildingOptions, setShowBuildingOptions] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recommendationError, setRecommendationError] = useState("");

  // Fetch areas
  const fetchAreas = useCallback(async () => {
    try {
      const data = await getParkingAreas();
      setAreas(data);
    } catch (e) {
      console.error("PredictionScreen fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAreas();
    const intervalId = setInterval(fetchAreas, 5000);
    return () => clearInterval(intervalId);
  }, [fetchAreas]);

  // Fetch recommendations when the user chooses a building
  useEffect(() => {
    if (!selectedBuilding) {
      setRecommendations([]);
      setRecommendationError("");
      return;
    }

    const fetchRecommendations = async () => {
      setLoadingRecommendations(true);
      setRecommendationError("");

      try {
        const res = await getRecommendations(selectedBuilding, 5);
        setRecommendations(res.recommendations || []);
      } catch (e) {
        console.error("PredictionScreen recommendation error:", e);

        try {
          const campusAreas = selectedCampus === "Ganesha"
            ? areas.filter((a: ParkingAreaWithStatus) => a.latitude > -6.92)
            : areas.filter((a: ParkingAreaWithStatus) => a.latitude <= -6.92);

          const selectedArea = campusAreas.find(
            (area: ParkingAreaWithStatus) =>
              normalizeName(area.name) === normalizeName(selectedBuilding)
          ) || null;

          const distanceFromDestination = (area: ParkingAreaWithStatus) => {
            if (!selectedArea) return Number.MAX_SAFE_INTEGER;
            return haversineDistance(
              area.latitude,
              area.longitude,
              selectedArea.latitude,
              selectedArea.longitude
            );
          };

          const availableFirst = campusAreas.filter(
            (area: ParkingAreaWithStatus) => getAreaAvailability(area).available > 0
          );
          const fallbackPool = availableFirst.length > 0 ? availableFirst : campusAreas;

          const fallbackRecommendations = [...fallbackPool]
            .sort((a, b) => {
              const distanceDiff = distanceFromDestination(a) - distanceFromDestination(b);
              if (distanceDiff !== 0) return distanceDiff;

              const aAvailability = getAreaAvailability(a).available;
              const bAvailability = getAreaAvailability(b).available;
              if (bAvailability !== aAvailability) {
                return bAvailability - aAvailability;
              }

              return a.name.localeCompare(b.name);
            })
            .slice(0, 5)
            .map((area) => {
              const counts = getAreaAvailability(area);
              const distanceKm = distanceFromDestination(area);
              const walkMinutes = distanceKm === Number.MAX_SAFE_INTEGER
                ? 0
                : (distanceKm / 5) * 60;

              return {
                area_id: area.id,
                area_name: area.name,
                available_slots: counts.available,
                total_slots: counts.total,
                occupancy_rate: area.occupancy_rate,
                status_label: area.status_label,
                distance_km: distanceKm === Number.MAX_SAFE_INTEGER ? 0 : Number(distanceKm.toFixed(4)),
                estimated_walk_minutes: Number(walkMinutes.toFixed(1)),
                score: Number((1 / (1 + (distanceKm === Number.MAX_SAFE_INTEGER ? 0 : distanceKm))).toFixed(4)),
              };
            });

          setRecommendations(fallbackRecommendations);
          setRecommendationError("Backend recommendation service is unavailable. Showing local fallback.");
        } catch (fallbackError) {
          console.error("PredictionScreen fallback error:", fallbackError);
          setRecommendations([]);
          setRecommendationError("Unable to load parking recommendations.");
        }
      } finally {
        setLoadingRecommendations(false);
      }
    };

    fetchRecommendations();
  }, [selectedBuilding, selectedCampus, areas]);

  const buildingOptions = campusData[selectedCampus as keyof typeof campusData] || [];

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#D92E3F" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 90 }}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/spark-logo.png")}
          style={styles.logo}
        />

        <TouchableOpacity
          onPress={() => navigation.navigate("Profile" as never)}
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
        Recommendation
      </Text>

      {/* PREDICT BOX */}
      <View style={styles.predictBox}>
        <Text style={styles.predictTitle}>Find Nearby Parking</Text>

        {/* CAMPUS */}
        <TouchableOpacity
          style={styles.whereBox}
          onPress={() => setShowCampusOptions(!showCampusOptions)}
        >
          <View style={styles.row}>
            <Ionicons name="school" size={22} color="#D92E3F" />

            <View style={{ marginLeft: 14 }}>
              <Text style={styles.whereTitle}>Select Campus</Text>
              <Text style={styles.whereSubtitle}>
                ITB {selectedCampus}
              </Text>
            </View>
          </View>

          <Ionicons name="chevron-down" size={24} color="#D92E3F" />
        </TouchableOpacity>

        {/* CAMPUS OPTIONS */}
        {showCampusOptions && (
          <View style={styles.optionContainer}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => {
                setSelectedCampus("Ganesha");
                setSelectedBuilding("");
                setShowCampusOptions(false);
              }}
            >
              <Text style={styles.optionText}>Ganesha</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => {
                setSelectedCampus("Jatinangor");
                setSelectedBuilding("");
                setShowCampusOptions(false);
              }}
            >
              <Text style={styles.optionText}>Jatinangor</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* BUILDING */}
        <TouchableOpacity
          style={[styles.whereBox, { marginTop: 12 }]}
          onPress={() => setShowBuildingOptions(!showBuildingOptions)}
        >
          <View style={styles.row}>
            <Ionicons name="location" size={22} color="#D92E3F" />

            <View style={{ marginLeft: 14 }}>
              <Text style={styles.whereTitle}>Select Building</Text>
              <Text style={styles.whereSubtitle}>
                {selectedBuilding || "Choose a destination building"}
              </Text>
            </View>
          </View>

          <Ionicons name="chevron-down" size={24} color="#D92E3F" />
        </TouchableOpacity>

        {showBuildingOptions && (
          <View style={styles.optionContainer}>
            {buildingOptions.map((building) => (
              <TouchableOpacity
                key={building}
                style={styles.optionButton}
                onPress={() => {
                  setSelectedBuilding(building);
                  setShowBuildingOptions(false);
                }}
              >
                <Text style={styles.optionText}>{building}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* RECOMMEND */}
      {selectedBuilding !== "" && (
        <>
          <Text style={styles.recommendTitle}>Recommend Parking</Text>

          <Text style={styles.recommendSubtitle}>
            Nearest available parking spots based on your building choice
          </Text>

          {loadingRecommendations ? (
            <View style={{ paddingVertical: 16 }}>
              <ActivityIndicator size="small" color="#D92E3F" />
            </View>
          ) : recommendations.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No recommendation found for this selection.
              </Text>
            </View>
          ) : (
            recommendations.map((rec) => {
              const color = statusColor(rec.status_label);
              const status = statusText(rec.status_label);

              return (
                <View key={rec.area_id} style={styles.card}>
                  <View style={styles.cardTop}>
                    <View style={[styles.parkingIcon, { backgroundColor: color }]}>
                      <Text style={styles.pText}>P</Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{rec.area_name}</Text>

                      <View style={styles.infoRow}>
                        <Ionicons name="walk" size={18} color={color} />
                        <Text style={styles.walkText}>
                          {Math.max(1, Math.round(rec.estimated_walk_minutes || 1))} min walk
                        </Text>
                      </View>

                      <View style={styles.infoRow}>
                        <Ionicons name="location" size={18} color={color} />
                        <Text style={styles.noteText}>
                          {rec.distance_km > 0 ? `${rec.distance_km.toFixed(2)} km from destination` : "Distance estimated by backend"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.line} />

                  <View style={styles.cardBottom}>
                    <View style={styles.row}>
                      <View style={[styles.statusBadge, { backgroundColor: color + "20" }]}>
                        <Text style={{ color, fontFamily: "PoppinsMedium" }}>
                          {status}
                        </Text>
                      </View>

                      <Text style={styles.spotText}>{rec.available_slots} spots</Text>
                    </View>

                    <TouchableOpacity
                      style={[styles.navigateBtn, { borderColor: color }]}
                      onPress={() =>
                        navigation.navigate("DetailParking", {
                          selectedLocation: rec.area_name,
                          areaId: rec.area_id,
                        })
                      }
                    >
                      <Ionicons name="location" size={18} color={color} />
                      <Text style={{ color, marginLeft: 4, fontFamily: "PoppinsMedium" }}>
                        Navigate
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}

          {!!recommendationError && (
            <Text style={styles.errorText}>{recommendationError}</Text>
          )}
        </>
      )}
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
    fontFamily: "PoppinsBold",
    fontSize: 28,
    color: "#D92E3F",
    marginTop: 10,
    marginBottom: 22,
  },

  predictBox: {
    backgroundColor: "#FAF8F6",
    borderWidth: 1.2,
    borderColor: "#F0C8C8",
    borderRadius: 22,
    padding: 16,
    marginBottom: 18,
  },

  predictTitle: {
    fontFamily: "PoppinsBold",
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
    justifyContent: "space-between",
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
    fontFamily: "PoppinsMedium",
    color: "#444",
    fontSize: 12,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  whereTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 14,
    color: "#111",
  },

  whereSubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#8A8A8A",
    marginTop: -2,
  },

  recommendTitle: {
    fontFamily: "PoppinsBold",
    fontSize: 16,
    color: "#D92E3F",
  },

  recommendSubtitle: {
    fontFamily: "PoppinsRegular",
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
    justifyContent: "center",
    alignItems: "center",
  },

  pText: {
    color: "#fff",
    fontFamily: "PoppinsBold",
    fontSize: 22,
  },

  cardTitle: {
    fontFamily: "PoppinsBold",
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
    backgroundColor: "#ECECEC",
    marginVertical: 18,
  },

  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  statusBadge: {
    paddingHorizontal: 12,
    height: 28,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  spotText: {
    marginLeft: 12,
    fontFamily: "PoppinsBold",
    fontSize: 13,
  },

  navigateBtn: {
    borderWidth: 2,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyState: {
    paddingVertical: 16,
    alignItems: "center",
  },

  emptyStateText: {
    fontFamily: "PoppinsRegular",
    color: "#666",
    fontSize: 12,
    textAlign: "center",
  },

  errorText: {
    marginTop: 10,
    fontFamily: "PoppinsMedium",
    color: "#B91C1C",
    fontSize: 11,
    textAlign: "center",
  },
});