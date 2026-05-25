import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  getParkingAreas,
  getSnapshotUrl,
  ParkingAreaWithStatus,
} from "../services/api";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function statusColor(label: string): string {
  switch (label) {
    case "available": return "#3D5E39";
    case "limited": return "#F2C94C";
    case "full": return "#D92E3F";
    default: return "#3D5E39";
  }
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${String(d.getFullYear()).slice(2)}, ${String(d.getHours()).padStart(2, "0")}.${String(d.getMinutes()).padStart(2, "0")}`;
  } catch {
    return "N/A";
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ViewScreen() {
  const navigation = useNavigation();

  const [searchText, setSearchText] = useState("");
  const [areas, setAreas] = useState<ParkingAreaWithStatus[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [snapshotTick, setSnapshotTick] = useState(0);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      const data = await getParkingAreas();
      setAreas(data);
      if (data.length > 0 && !selectedLocation) {
        const defaultArea = data.find(
          (area) => area.name.trim().toLowerCase() === "labtek 5"
        );
        setSelectedLocation((defaultArea || data[0]).name);
      }
    } catch (e) {
      console.error("ViewScreen fetch error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    setSnapshotTick((prev) => prev + 1);
  }, [selectedLocation]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setSnapshotTick((prev) => prev + 1);
      fetchData();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    setSnapshotTick((prev) => prev + 1);
    fetchData();
  };

  // Separate by campus
  const ganeshaAreas = areas.filter((a) => a.latitude > -6.92);
  const jatinangorAreas = areas.filter((a) => a.latitude <= -6.92);

  // Filter by search
  const filteredGanesha = ganeshaAreas.filter((a) =>
    a.name.toLowerCase().includes(searchText.toLowerCase())
  );
  const filteredJatinangor = jatinangorAreas.filter((a) =>
    a.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Selected area details
  const selectedArea = areas.find((a) => a.name === selectedLocation);
  const snapshotUrl = selectedArea?.camera_device_id
    ? `${getSnapshotUrl(selectedArea.camera_device_id)}?t=${snapshotTick}`
    : null;

  // Last updated timestamp
  const lastUpdated = selectedArea?.updated_at || selectedArea?.captured_at;

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
      contentContainerStyle={{ paddingBottom: 120 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#D92E3F"]} />
      }
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

      {/* HERO SECTION */}
      <View style={styles.heroWrapper}>
        <View style={styles.heroSection}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>
              Parking View
            </Text>

            <Text style={styles.lastUpdated}>
              Last updated on {formatDate(lastUpdated as string)}
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
          {snapshotUrl ? (
            <Image
              source={{ uri: snapshotUrl }}
              style={styles.cameraImage}
              defaultSource={require("../../assets/images/live-feed.jpg")}
            />
          ) : (
            <Image
              source={require("../../assets/images/live-feed.jpg")}
              style={styles.cameraImage}
            />
          )}

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
          {filteredGanesha.map((area) => (
            <TouchableOpacity
              key={area.id}
              style={[
                styles.locationButton,
                selectedLocation === area.name && styles.activeLocation,
                { borderColor: statusColor(area.status_label) },
              ]}
              onPress={() => setSelectedLocation(area.name)}
            >
              <Text
                style={[
                  styles.locationText,
                  selectedLocation === area.name && styles.activeText,
                ]}
              >
                {area.name}
              </Text>
              <Text
                style={[
                  styles.locationSpots,
                  selectedLocation === area.name
                    ? { color: "#FFF" }
                    : { color: statusColor(area.status_label) },
                ]}
              >
                {area.status_label === "full" ? "Full" : `${area.available_slots} spots`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.locationSubtitle}>
          ITB JATINANGOR
        </Text>

        <View style={styles.locationGrid}>
          {filteredJatinangor.map((area) => (
            <TouchableOpacity
              key={area.id}
              style={[
                styles.locationButton,
                selectedLocation === area.name && styles.activeLocation,
                { borderColor: statusColor(area.status_label) },
              ]}
              onPress={() => setSelectedLocation(area.name)}
            >
              <Text
                style={[
                  styles.locationText,
                  selectedLocation === area.name && styles.activeText,
                ]}
              >
                {area.name}
              </Text>
              <Text
                style={[
                  styles.locationSpots,
                  selectedLocation === area.name
                    ? { color: "#FFF" }
                    : { color: statusColor(area.status_label) },
                ]}
              >
                {area.status_label === "full" ? "Full" : `${area.available_slots} spots`}
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

  locationSpots: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    marginTop: 2,
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