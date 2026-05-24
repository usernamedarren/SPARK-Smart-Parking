import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import MapView, {
  Marker,
} from "react-native-maps";

import {
  Ionicons,
  Feather,
} from "@expo/vector-icons";

import {
  useNavigation,
} from "@react-navigation/native";

import {
  getParkingAreas,
  ParkingAreaWithStatus,
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

function spotsLabel(area: ParkingAreaWithStatus): string {
  if (area.status_label === "full") return "Full";
  if (area.status_label === "limited") return `${area.available_slots} spots`;
  return `${area.available_slots} spots`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MapScreen() {
  const navigation = useNavigation<any>();

  const [areas, setAreas] = useState<ParkingAreaWithStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCampus, setSelectedCampus] = useState("Ganesha");
  const [selected, setSelected] = useState("All");
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch
  const fetchData = useCallback(async () => {
    try {
      const data = await getParkingAreas();
      setAreas(data);
    } catch (e) {
      console.error("MapScreen fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Separate by campus (latitude-based heuristic)
  const ganeshaAreas = areas.filter((a) => a.latitude > -6.92);
  const jatinangorAreas = areas.filter((a) => a.latitude <= -6.92);

  const currentAreas = selectedCampus === "Ganesha" ? ganeshaAreas : jatinangorAreas;

  const filteredAreas = selected === "All"
    ? currentAreas
    : currentAreas.filter((a) => a.name === selected);

  // Build filter chips (first 3 + "More" for extras)
  const mainChips = currentAreas.slice(0, 3).map((a) => a.name);
  const dropdownChips = currentAreas.slice(3).map((a) => a.name);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#D92E3F" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/spark-logo.png")}
          style={styles.logoImage}
        />

        <TouchableOpacity
          onPress={() =>
            navigation.navigate("Profile")
          }
        >
          <Ionicons
            name="person-circle"
            size={45}
            color="#D92E3F"
          />
        </TouchableOpacity>
      </View>

      {/* CAMPUS SELECTOR */}
      <View style={styles.campusContainer}>
        {["Ganesha", "Jatinangor"].map((campus) => (
          <TouchableOpacity
            key={campus}
            style={[
              styles.campusChip,
              selectedCampus === campus && styles.activeCampus,
            ]}
            onPress={() => {
              setSelectedCampus(campus);
              setSelected("All");
            }}
          >
            <Text
              style={[
                styles.campusText,
                selectedCampus === campus && styles.activeCampusText,
              ]}
            >
              {campus}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* FILTER */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterChip, selected === "All" && styles.activeChip]}
          onPress={() => setSelected("All")}
        >
          <Text style={[styles.filterText, selected === "All" && styles.activeChipText]}>
            All
          </Text>
        </TouchableOpacity>

        {mainChips.map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.filterChip, selected === item && styles.activeChip]}
            onPress={() => setSelected(item)}
          >
            <Text style={[styles.filterText, selected === item && styles.activeChipText]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}

        {/* DROPDOWN FOR MORE */}
        {dropdownChips.length > 0 && (
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowDropdown(!showDropdown)}
          >
            <Text style={styles.filterText}>More</Text>
            <Ionicons
              name={showDropdown ? "chevron-up" : "chevron-down"}
              size={16}
              color="#D92E3F"
            />
          </TouchableOpacity>
        )}
      </View>

      {/* DROPDOWN MENU */}
      {showDropdown && (
        <View style={styles.dropdownMenu}>
          {dropdownChips.map((location) => (
            <TouchableOpacity
              key={location}
              style={styles.dropdownItem}
              onPress={() => {
                setSelected(location);
                setShowDropdown(false);
              }}
            >
              <Text style={styles.dropdownText}>{location}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* MAP */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={
            selectedCampus === "Ganesha"
              ? {
                  latitude: -6.8915,
                  longitude: 107.6107,
                  latitudeDelta: 0.006,
                  longitudeDelta: 0.006,
                }
              : {
                  latitude: -6.9275,
                  longitude: 107.7740,
                  latitudeDelta: 0.008,
                  longitudeDelta: 0.008,
                }
          }
        >
          {filteredAreas.map((area) => (
            <Marker
              key={area.id}
              coordinate={{
                latitude: area.latitude,
                longitude: area.longitude,
              }}
              onPress={() =>
                navigation.navigate("DetailParking", {
                  selectedLocation: area.name,
                  areaId: area.id,
                })
              }
            >
              <TouchableOpacity>
                <View
                  style={[
                    styles.marker,
                    { backgroundColor: statusColor(area.status_label) },
                  ]}
                >
                  <Text style={styles.markerText}>P</Text>
                </View>

                <View style={styles.popup}>
                  <Text style={styles.popupTitle}>{area.name}</Text>
                  <Text
                    style={[
                      styles.popupSubtitle,
                      { color: statusColor(area.status_label) },
                    ]}
                  >
                    {spotsLabel(area)}
                  </Text>
                </View>
              </TouchableOpacity>
            </Marker>
          ))}
        </MapView>
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

  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  dropdownMenu: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#F0D7D7",
    paddingVertical: 8,
    marginTop: 8,
  },

  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },

  dropdownText: {
    fontFamily: "PoppinsMedium",
    color: "#444",
  },

  campusContainer: {
    flexDirection: "row",
    marginTop: 8,
    marginBottom: 12,
    gap: 8,
  },

  campusChip: {
    backgroundColor: "#EFEAE6",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },

  activeCampus: {
    backgroundColor: "#FBE6E3",
  },

  campusText: {
    fontFamily: "PoppinsMedium",
    color: "#777",
    fontSize: 12,
  },

  activeCampusText: {
    color: "#D92E3F",
    fontFamily: "PoppinsSemiBold",
  },
});