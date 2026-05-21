import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
} from "react-native";

import {
  Ionicons,
  Feather,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import MapView, { Marker } from "react-native-maps";
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
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
              Good Morning!
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
          />

          <Feather
            name="sliders"
            size={22}
            color="#D92E3F"
          />
        </View>

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
                62%
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

          <Text style={styles.viewAll}>
            View All
          </Text>
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
            <Marker
              coordinate={{
                latitude: -6.8915,
                longitude: 107.6107,
              }}
              title="Labtek 5"
              description="Parking Area"
            />

            <Marker
              coordinate={{
                latitude: -6.8922,
                longitude: 107.6115,
              }}
              title="Labtek 8"
            />

            <Marker
              coordinate={{
                latitude: -6.8908,
                longitude: 107.6098,
              }}
              title="FSRD"
            />
          </MapView>
        </View>

        {/* SMART RECOMMENDATION */}
        <View style={styles.smartHeader}>
          <Text style={styles.smartTitle}>
            Smart Recommendation
          </Text>
        </View>

        <View style={styles.recommendationRow}>

          {/* CARD 1 */}
          <View style={styles.recommendCard}>
            <View style={[
              styles.parkingBadge,
              { backgroundColor: "#406A43" }
            ]}>
              <Text style={styles.badgeText}>P</Text>
            </View>

            <Text style={styles.locationName}>
              Labtek 5
            </Text>

            <Text style={styles.availableStatus}>
              Available
            </Text>

            <Text style={styles.spotsText}>
              24 spots
            </Text>

            <Text style={styles.walkText}>
              🚶 3 min walk
            </Text>

            <TouchableOpacity style={styles.detailBtn}>
              <Text style={styles.detailText}>
                View Details
              </Text>
            </TouchableOpacity>
          </View>

          {/* CARD 2 */}
          <View style={styles.recommendCard}>
            <View style={[
              styles.parkingBadge,
              { backgroundColor: "#D92E3F" }
            ]}>
              <Text style={styles.badgeText}>P</Text>
            </View>

            <Text style={styles.locationName}>
              FSRD
            </Text>

            <Text style={styles.fullStatus}>
              Full
            </Text>

            <Text style={styles.spotsText}>
              0 spots
            </Text>

            <Text style={styles.walkText}>
              🚶 3 min walk
            </Text>

            <TouchableOpacity style={styles.detailBtn}>
              <Text style={styles.detailText}>
                View Details
              </Text>
            </TouchableOpacity>
          </View>

          {/* CARD 3 */}
          <View style={styles.recommendCard}>
            <View style={[
              styles.parkingBadge,
              { backgroundColor: "#F2C94C" }
            ]}>
              <Text style={styles.badgeText}>P</Text>
            </View>

            <Text style={styles.locationName}>
              Labtek 8
            </Text>

            <Text style={styles.limitedStatus}>
              Limited
            </Text>

            <Text style={styles.spotsText}>
              4 spots
            </Text>

            <Text style={styles.walkText}>
              🚶 3 min walk
            </Text>

            <TouchableOpacity style={styles.detailBtn}>
              <Text style={styles.detailText}>
                View Details
              </Text>
            </TouchableOpacity>
          </View>

        </View>

        <TouchableOpacity style={styles.exploreButton}>
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
    paddingHorizontal: 15,
    marginTop: -100,

    zIndex:999,
    elevation: 5,
  },

  input: {
    flex: 1,
    marginLeft: 12,
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

bottomNav: {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,

  height: 82,
  backgroundColor: "#FFFFFF",

  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",

  borderTopWidth: 1.5,
  borderTopColor: "#F2D6D6",

  paddingBottom: 10,

  zIndex: 999,
  elevation: 20,
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
    height: 38,
    borderRadius: 20,
  },

  activeTabText: {
    fontFamily: "PoppinsMedium",
    fontSize: 10,
    color: "#D92E3F",
    marginTop: 2,
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
});