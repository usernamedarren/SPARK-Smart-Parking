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
  getPrediction,
  ParkingAreaWithStatus,
  PredictionResponse,
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

function statusIcon(label: string): string {
  switch (label) {
    case "available": return "checkmark-circle";
    case "limited": return "alert-circle";
    case "full": return "close-circle";
    default: return "checkmark-circle";
  }
}

function predictionNote(pred: PredictionResponse): string {
  if (pred.predicted_status_label === "available") {
    return `Most likely available on arrival\nConfidence: ${Math.round(pred.confidence * 100)}%`;
  }
  if (pred.predicted_status_label === "limited") {
    return `Likely available on arrival\nConfidence: ${Math.round(pred.confidence * 100)}%`;
  }
  return `Not available on arrival\nConfidence: ${Math.round(pred.confidence * 100)}%`;
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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PredictionScreen() {
  const navigation = useNavigation<any>();

  const [areas, setAreas] = useState<ParkingAreaWithStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCampus, setSelectedCampus] = useState("");
  const [showCampusOptions, setShowCampusOptions] = useState(false);

  // Predictions keyed by area_id
  const [predictions, setPredictions] = useState<Record<string, PredictionResponse>>({});
  const [predictingIds, setPredictingIds] = useState<Set<string>>(new Set());

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
    const intervalId = setInterval(fetchAreas, 3000);
    return () => clearInterval(intervalId);
  }, [fetchAreas]);

  // When campus is selected, auto-fetch predictions for all areas in that campus
  useEffect(() => {
    if (!selectedCampus || areas.length === 0) return;

    const campusAreas = selectedCampus === "GANESHA"
      ? areas.filter((a) => a.latitude > -6.92)
      : areas.filter((a) => a.latitude <= -6.92);

    // Predict 30 minutes from now
    const arrivalTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    campusAreas.forEach(async (area) => {
      if (predictions[area.id]) return; // already fetched

      setPredictingIds((prev) => new Set(prev).add(area.id));
      try {
        const pred = await getPrediction(area.id, arrivalTime);
        setPredictions((prev) => ({ ...prev, [area.id]: pred }));
      } catch (e) {
        console.error(`Prediction failed for ${area.name}:`, e);
      } finally {
        setPredictingIds((prev) => {
          const next = new Set(prev);
          next.delete(area.id);
          return next;
        });
      }
    });
  }, [selectedCampus, areas]);

  // Filter areas by campus
  const ganeshaAreas = areas.filter((a) => a.latitude > -6.92);
  const jatinangorAreas = areas.filter((a) => a.latitude <= -6.92);
  const displayAreas = selectedCampus === "GANESHA" ? ganeshaAreas : jatinangorAreas;

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
          onPress={() => setShowCampusOptions(!showCampusOptions)}
        >
          <View style={styles.row}>
            <Ionicons name="location" size={22} color="#D92E3F" />

            <View style={{ marginLeft: 14 }}>
              <Text style={styles.whereTitle}>Where?</Text>
              <Text style={styles.whereSubtitle}>
                {selectedCampus || "Select destination....."}
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
                setSelectedCampus("GANESHA");
                setShowCampusOptions(false);
              }}
            >
              <Text style={styles.optionText}>Ganesha</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => {
                setSelectedCampus("JATINANGOR");
                setShowCampusOptions(false);
              }}
            >
              <Text style={styles.optionText}>Jatinangor</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* RECOMMEND */}
      {selectedCampus !== "" && (
        <>
          <Text style={styles.recommendTitle}>
            Recommend Parking
          </Text>

          <Text style={styles.recommendSubtitle}>
            Prediction based on real-time and historical data estimation
          </Text>

          {displayAreas.map((area) => {
            const pred = predictions[area.id];
            const isPredicting = predictingIds.has(area.id);

            // Use prediction data if available, otherwise use current status
            const color = pred
              ? statusColor(pred.predicted_status_label)
              : statusColor(area.status_label);
            const status = pred
              ? statusText(pred.predicted_status_label)
              : statusText(area.status_label);
            const spots = pred
              ? pred.predicted_available_slots
              : getAreaAvailability(area).available;
            const icon = pred
              ? statusIcon(pred.predicted_status_label)
              : statusIcon(area.status_label);
            const note = pred
              ? predictionNote(pred)
              : "Loading prediction...";

            return (
              <ParkingCard
                key={area.id}
                color={color}
                status={status}
                spots={String(spots)}
                title={area.name}
                icon={icon}
                note={note}
                isPredicting={isPredicting}
                onNavigate={() =>
                  navigation.navigate("DetailParking", {
                    selectedLocation: area.name,
                    areaId: area.id,
                  })
                }
              />
            );
          })}
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
  isPredicting,
  onNavigate,
}: any) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View
          style={[styles.parkingIcon, { backgroundColor: color }]}
        >
          <Text style={styles.pText}>P</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{title}</Text>

          <View style={styles.infoRow}>
            <Ionicons name="walk" size={18} color={color} />
            <Text style={styles.walkText}>
              Estimated arrival: 30 min
            </Text>
          </View>

          <View style={styles.infoRow}>
            {isPredicting ? (
              <ActivityIndicator size="small" color={color} />
            ) : (
              <Ionicons name={icon} size={18} color={color} />
            )}
            <Text style={styles.noteText}>{note}</Text>
          </View>
        </View>
      </View>

      <View style={styles.line} />

      <View style={styles.cardBottom}>
        <View style={styles.row}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: color + "20" },
            ]}
          >
            <Text
              style={{
                color,
                fontFamily: "PoppinsMedium",
              }}
            >
              {status}
            </Text>
          </View>

          <Text style={styles.spotText}>{spots} spots</Text>
        </View>

        <TouchableOpacity
          style={[styles.navigateBtn, { borderColor: color }]}
          onPress={onNavigate}
        >
          <Ionicons name="location" size={18} color={color} />
          <Text
            style={{
              color,
              marginLeft: 4,
              fontFamily: "PoppinsMedium",
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
});