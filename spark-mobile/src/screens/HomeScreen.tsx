import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

import {
  Ionicons,
  Feather,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import MapView, { Marker } from "react-native-maps";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import {
  getParkingAreas,
  getRecommendations,
  ParkingAreaWithStatus,
  RecommendationItem,
} from "../services/api";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning!";
  if (h < 17) return "Good Afternoon!";
  return "Good Evening!";
}

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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [searchText, setSearchText] = useState("");
  const [areas, setAreas] = useState<ParkingAreaWithStatus[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      const [areasData, recsData] = await Promise.all([
        getParkingAreas(),
        getRecommendations("GKU Barat", 3).catch(() => ({ destination: "", recommendations: [] })),
      ]);
      setAreas(areasData);
      setRecommendations(recsData.recommendations);
    } catch (e) {
      console.error("HomeScreen fetch error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Calculate campus-wide availability
  const totalSlots = areas.reduce((s, a) => s + a.total_slots, 0);
  const totalAvailable = areas.reduce((s, a) => s + a.available_slots, 0);
  const campusPercent = totalSlots > 0 ? Math.round((totalAvailable / totalSlots) * 100) : 0;

  // Search filter
  const filteredLocations = areas.filter((a) =>
    a.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Map markers — only Ganesha campus for the small home map
  const ganeshaAreas = areas.filter((a) => a.latitude > -6.93);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#D92E3F" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#D92E3F"]} />
        }
      >
        <View style={styles.content}>
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

          <Image
            source={require("../../assets/images/city-bg.png")}
            style={styles.cityImage}
          />

        {/* HERO SECTION */}
        <View style={styles.heroWrapper}>
        <View style={styles.heroSection}>
          <View style={styles.textContainer}>
            <Text style={styles.greeting}>
              {getGreeting()}
            </Text>

            <Text style={styles.subtitle}>
              Find & spot your parking space
            </Text>
          </View>
        </View>

        </View>

        {/* SEARCH */}
        <View style={styles.searchBox}>
          <Ionicons
            name="search"
            size={22}
            color="#8D8D8D"
          />

          <TextInput
            placeholder="Search location (e.g., Library, GKU, Labtek)"
            placeholderTextColor="#9D9D9D"
            style={styles.input}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        {searchText.length > 0 && (
          <View style={styles.searchResultBox}>
            {filteredLocations.length === 0 ? (
              <View style={styles.searchItem}>
                <Text style={styles.searchItemText}>No results found</Text>
              </View>
            ) : (
              filteredLocations.map((area) => (
                <TouchableOpacity
                  key={area.id}
                  style={styles.searchItem}
                  onPress={() => {
                    setSearchText("");
                    navigation.navigate("DetailParking", {
                      selectedLocation: area.name,
                      areaId: area.id,
                    });
                  }}
                >
                  <Text style={styles.searchItemText}>
                    {area.name}
                  </Text>
                  <Text style={[styles.searchItemStatus, { color: statusColor(area.status_label) }]}>
                    {area.available_slots} spots
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* AVAILABILITY CARD */}
        <View style={styles.availabilityCard}>

          {/* TOP */}
          <View style={styles.availabilityTop}>

            {/* LEFT */}
            <View style={styles.leftSection}>

              <View style={styles.parkingIconBox}>
                <Text style={styles.parkingIcon}>
                  P
                </Text>
              </View>

              <View>
                <Text style={styles.cardTitle}>
                  Parking Availability
                </Text>

                <Text style={styles.updated}>
                  updated just now
                </Text>
              </View>
            </View>

            {/* RIGHT */}
            <View style={styles.rightSection}>
              <Text style={styles.percent}>
                {campusPercent}%
              </Text>

              <Text style={styles.campusText}>
                Campus Availability
              </Text>
            </View>
          </View>

          {/* DIVIDER */}
          <View style={styles.divider} />

          {/* BOTTOM INFO */}
          <View style={styles.legendRow}>

            <View style={styles.legendLeft}>
            <Text style={styles.legendText}>
              🟢 Available
            </Text>

            <Text style={styles.legendText}>
              🟡 Limited
            </Text>

            <Text style={styles.legendText}>
              🔴 Full
            </Text>
            </View>


            <Text style={styles.peakHours}>
              Peak: 09.00 - 12.00
            </Text>
          </View>
        </View>

        {/* MAP */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Nearby Parking
          </Text>

          <TouchableOpacity onPress={() => navigation.navigate("Map" as never)}>
            <Text style={styles.viewAll}>
              View All
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: -6.8915,
              longitude: 107.6107,
              latitudeDelta: 0.008,
              longitudeDelta: 0.008,
            }}
            scrollEnabled={true}
            zoomEnabled={true}
            rotateEnabled={false}
            pitchEnabled={false}
          >
            {ganeshaAreas.map((area) => (
              <Marker
                key={area.id}
                coordinate={{
                  latitude: area.latitude,
                  longitude: area.longitude,
                }}
                title={area.name}
                description={`${area.available_slots} spots available`}
              />
            ))}
          </MapView>
        </View>

        {/* SMART RECOMMENDATION */}
        <View style={styles.smartHeader}>
          <Text style={styles.smartTitle}>
            Smart Recommendation
          </Text>
        </View>

        <View style={styles.recommendationRow}>
          {recommendations.slice(0, 3).map((rec) => (
            <View key={rec.area_id} style={styles.recommendCard}>
              <View style={[
                styles.parkingBadge,
                { backgroundColor: statusColor(rec.status_label) }
              ]}>
                <Text style={styles.badgeText}>P</Text>
              </View>

              <Text style={styles.locationName}>
                {rec.area_name}
              </Text>

              <Text style={[
                rec.status_label === "available" ? styles.availableStatus :
                rec.status_label === "limited" ? styles.limitedStatus :
                styles.fullStatus
              ]}>
                {statusText(rec.status_label)}
              </Text>

              <Text style={styles.spotsText}>
                {rec.available_slots} spots
              </Text>

              <Text style={styles.walkText}>
                🚶 {rec.estimated_walk_minutes} min walk
              </Text>

              <TouchableOpacity style={styles.detailBtn}
                onPress={() => navigation.navigate("DetailParking", {
                  selectedLocation: rec.area_name,
                  areaId: rec.area_id,
                })}>
                <Text style={styles.detailText}>
                  View Details
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.exploreButton}
          onPress={() => 
            navigation.navigate("Map" as never)
          }
        >
          <Ionicons
            name="location-outline"
            size={18}
            color="#406A43"
          />

          <Text style={styles.exploreText}>
            Explore Parking Map
          </Text>
        </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F5EF",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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

  logoText: {
    fontFamily: "PoppinsBold",
    color: "#3B6A3E",
    fontSize: 22,
    marginLeft: 8,
  },

  cityImage: {
    position: "absolute",
    top: 75,
    right: -11,

    width: 250,
    height: 110,

    resizeMode: "contain",
  },

  greeting: {
    fontFamily: "PoppinsBold",
    fontSize: 20,
    color: "#D92E3F",
    marginTop: 0,
  },

  subtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 15,
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

    zIndex:1000,
    elevation: 5,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontFamily: "PoppinsRegular",
    fontSize: 12,
  },

  availabilityCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 12,
    marginTop: 20,

    borderWidth: 1.5,
    borderColor: "#F0D7D7",
  },

  cardTitle: {
    fontFamily: "PoppinsBold",
    fontSize: 14,
    color: "#D92E3F",
  },

  updated: {
    fontFamily: "PoppinsRegular",
    color: "#888",
    fontSize: 11,
  },

  percent: {
    fontFamily: "PoppinsBold",
    fontSize: 24,
    color: "#D92E3F",
  },

  campusText: {
    fontFamily: "PoppinsRegular",
    color: "#888",
    fontSize: 10,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    alignItems: "center",
  },

  sectionTitle: {
    fontFamily: "PoppinsBold",
    fontSize: 12,
    color: "#D92E3F",
  },

  viewAll: {
    fontFamily: "PoppinsMedium",
    fontSize: 11,
    color: "#D92E3F",
  },

  mapContainer: {
    height: 125,
    borderRadius: 28,
    overflow: "hidden",
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#F0D7D7",
  },

  map: {
    flex: 1,
  },

  heroSection: {
    minHeight: 150,
    justifyContent: "center",
    zIndex: 2,
  },

  textContainer: {
    zIndex: 2,
    width: "75%",
    marginTop: -135,
  },

  heroWrapper: {
    position: "relative",
    marginTop: 20,

    marginHorizontal: -24,
    paddingHorizontal: 24,
  },

  availabilityTop: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  },

  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  rightSection: {
    alignItems: "flex-end",
  },

  parkingIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#D92E3F",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 12,
  },

  parkingIcon: {
    color: "#fff",
    fontFamily: "PoppinsBold",
    fontSize: 18,
  },

  divider: {
    height: 1,
    backgroundColor: "#ECECEC",
    marginVertical: 8,
  },

  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  legendText: {
    fontSize: 10,
    color: "#666",
    fontFamily: "PoppinsRegular",
  },

  peakHours: {
    fontSize: 10,
    color: "#666",
    fontFamily: "PoppinsRegular",
  },

  legendLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  smartHeader: {
    marginTop: 14,
  },

  smartTitle: {
    fontFamily: "PoppinsBold",
    fontSize: 13,
    color: "#D92E3F",
  },

  recommendationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  recommendCard: {
    width: "31%",
    backgroundColor: "#fff",

    borderRadius: 16,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 16,

    minHeight: 150,

    borderWidth: 1,
    borderColor: "#F0D7D7",

    justifyContent: "space-between",
  },

  parkingBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,

    justifyContent: "center",
    alignItems: "center",
  },

  badgeText: {
    color: "#fff",
    fontFamily: "PoppinsBold",
    fontSize: 16,
  },

  locationName: {
    fontFamily: "PoppinsBold",
    fontSize: 13,
    marginTop: 10,
  },

  availableStatus: {
    fontSize: 10,
    color: "#406A43",
  },

  limitedStatus: {
    fontSize: 10,
    color: "#D4A017",
  },

  fullStatus: {
    fontSize: 10,
    color: "#D92E3F",
  },

  spotsText: {
    fontSize: 11,
    fontFamily: "PoppinsBold",
    marginTop: 3,
  },

  walkText: {
    fontSize: 10,
    color: "#777",
    marginTop: 5,
  },

  detailBtn: {
    borderWidth: 1,
    borderColor: "#D92E3F",
    borderRadius: 14,

    paddingVertical: 5,
    marginTop: 8,
  },

  detailText: {
    textAlign: "center",
    color: "#D92E3F",
    fontSize: 10,
    fontFamily: "PoppinsMedium",
  },

  exploreButton: {
    marginTop: 10,

    height: 40,

    borderWidth: 1,
    borderColor: "#EAC9C9",

    borderRadius: 22,

    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "#FFFDFB",
  },

  exploreText: {
    color: "#406A43",
    fontFamily: "PoppinsMedium",
    fontSize: 11,
    marginLeft: 6,
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 55,
  },

  searchResultBox: {
    position: "absolute",

    top: 245,
    left: 24,
    right: 24,

    backgroundColor: "#FFF",
    borderRadius: 18,

    borderWidth: 1,
    borderColor: "#F0D7D7",

    elevation: 8,
    zIndex: 9999,

    paddingVertical: 8,
  },

  searchItem: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  searchItemText: {
    fontFamily: "PoppinsMedium",
    fontSize: 14,
    color: "#333",
  },

  searchItemStatus: {
    fontFamily: "PoppinsMedium",
    fontSize: 12,
  },
});