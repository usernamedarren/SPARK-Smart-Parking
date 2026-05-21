import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";

import { Ionicons, Feather } from "@expo/vector-icons";

import { useNavigation } from "@react-navigation/native";

export default function HistoryScreen() {
  const navigation = useNavigation();
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

      {/* CITY IMAGE */}
      <Image
        source={require("../../assets/images/city-bg.png")}
        style={styles.cityImage}
      />

      {/* TITLE */}
      <Text style={styles.title}>
        Parking History
      </Text>

      {/* FILTER BAR */}
      <View style={styles.filterContainer}>
        <View style={styles.filterLeft}>
          <TouchableOpacity style={styles.filterInactive}>
            <Text style={styles.filterInactiveText}>
              Today
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterActive}>
            <Text style={styles.filterActiveText}>
              This Week
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterInactive}>
            <Text style={styles.filterInactiveText}>
              April
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterInactive}>
            <Text style={styles.filterInactiveText}>
              March
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterIcon}>
          <Feather
            name="sliders"
            size={22}
            color="#D92E3F"
          />
        </View>
      </View>

      {/* HISTORY CARDS */}
      <HistoryCard
        color="#F2C94C"
        block="Blok C"
      />

      <HistoryCard
        color="#D92E3F"
        block="Blok C"
      />

      <HistoryCard
        color="#406A43"
        block="Blok C"
      />

      <HistoryCard
        color="#F2C94C"
        block="Blok C"
      />
    </ScrollView>
  );
}

/* CARD COMPONENT */
function HistoryCard({
  color,
  block,
}: any) {
  return (
    <View style={styles.historyCard}>
      <View style={styles.cardTop}>
        <View>
          <Text style={styles.labtekTitle}>
            Labtek 5
          </Text>

          <View style={styles.blockRow}>
            <View
              style={[
                styles.blockBadge,
                { backgroundColor: color },
              ]}
            >
              <Text style={styles.blockText}>
                C
              </Text>
            </View>

            <Text style={styles.blockLabel}>
              {block}
            </Text>
          </View>
        </View>

        <View style={styles.completedBadge}>
          <Text style={styles.completedText}>
            Completed
          </Text>
        </View>
      </View>

      <View style={styles.line} />

      <Text style={styles.timeText}>
        08:12 - 10:05
      </Text>
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
    marginBottom: 18,
    },

    /* FILTER */
    filterContainer: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#FFF",
    borderRadius: 22,

    borderWidth: 1,
    borderColor: "#F0D7D7",

    overflow: "hidden",
    marginBottom: 14,
    },

    filterLeft: {
    flex: 1,
    flexDirection: "row",
    padding: 8,
    gap: 8,
    },

    filterActive: {
    backgroundColor: "#FBE6E3",
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 16,

    justifyContent: "center",
    },

    filterInactive: {
    backgroundColor: "#F3EEEE",
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 16,

    justifyContent: "center",
    },

    filterActiveText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 11,
    color: "#050404",
    },

    filterInactiveText: {
    fontFamily: "PoppinsMedium",
    fontSize: 11,
    color: "#555",
    },

    filterIcon: {
    width: 55,
    justifyContent: "center",
    alignItems: "center",

    borderLeftWidth: 1,
    borderLeftColor: "#EFE3E3",
    },

    /* CARD */
    historyCard: {
    backgroundColor: "#FFF",

    borderRadius: 26,
    borderWidth: 1.2,
    borderColor: "#F0D7D7",

    padding: 14,
    marginBottom: 14,

    shadowColor: "#F3CFCF",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    },

    cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    },

    labtekTitle: {
    fontFamily: "PoppinsBold",
    fontSize: 15,
    color: "#444",
    },

    blockRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    },

    blockBadge: {
    width: 28,
    height: 22,
    borderRadius: 8,

    justifyContent: "center",
    alignItems: "center",
    },

    blockText: {
    color: "#fff",
    fontFamily: "PoppinsBold",
    fontSize: 13,
    },

    blockLabel: {
    marginLeft: 12,
    fontFamily: "PoppinsSemiBold",
    fontSize: 13,
    color: "#444",
    },

    completedBadge: {
    backgroundColor: "#D9DDC8",
    paddingHorizontal:14,
    height: 30,
    borderRadius: 16,

    justifyContent: "center",
    },

    completedText: {
    fontFamily: "PoppinsMedium",
    color: "#6B725A",
    fontSize: 12,
    },

    line: {
    height: 1,
    backgroundColor: "#ECECEC",
    marginVertical: 12,
    },

    timeText: {
    fontFamily: "PoppinsMedium",
    fontSize: 13,
    color: "#555",
    },
});