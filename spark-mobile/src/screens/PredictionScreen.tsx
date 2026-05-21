import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";

import {
  Ionicons,
  Feather,
} from "@expo/vector-icons";

import { useNavigation } from "@react-navigation/native";

export default function PredictionScreen() {
  const navigation = useNavigation();
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
        Prediction
      </Text>

      {/* PREDICTION BOX */}
      <View style={styles.predictBox}>
        <Text style={styles.predictTitle}>
          Predict Parking Availability
        </Text>

        {/* WHERE */}
        <TouchableOpacity style={styles.whereBox}>
          <View style={styles.row}>
            <Ionicons
              name="location"
              size={28}
              color="#D92E3F"
            />

            <View style={{ marginLeft: 14 }}>
              <Text style={styles.whereTitle}>
                Where?
              </Text>

              <Text style={styles.whereSubtitle}>
                Select destination.....
              </Text>
            </View>
          </View>

          <Ionicons
            name="chevron-forward"
            size={30}
            color="#D92E3F"
          />
        </TouchableOpacity>

        {/* DATE */}
        <View style={styles.dateBox}>
          <View style={styles.row}>
            <Ionicons
              name="calendar"
              size={24}
              color="#D97A3A"
            />

            <Text style={styles.dateText}>
              25 Apr  |  09:00
            </Text>
          </View>

          <TouchableOpacity
            style={styles.predictButton}
          >
            <Text style={styles.predictBtnText}>
              PREDICT
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* RECOMMEND */}
      <Text style={styles.recommendTitle}>
        Recommend Parking
      </Text>

      <Text style={styles.recommendSubtitle}>
        Prediction based on real-time
        and historical data estimation
      </Text>

      {/* CARDS */}
      <ParkingCard
        color="#406A43"
        status="Available"
        spots="24"
        title="GKU Timur Parking"
        icon="checkmark-circle"
        note="Most likely available on arrival"
      />

      <ParkingCard
        color="#D92E3F"
        status="Full"
        spots="0"
        title="GKU Timur Parking"
        icon="close-circle"
        note="Not available on arrival"
      />

      <ParkingCard
        color="#F2C94C"
        status="Limited"
        spots="4"
        title="GKU Timur Parking"
        icon="alert-circle"
        note="Likely available on arrival"
      />
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
}: any) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View
          style={[
            styles.parkingIcon,
            { backgroundColor: color },
          ]}
        >
          <Text style={styles.pText}>
            P
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>
            {title}
          </Text>

          <View style={styles.infoRow}>
            <Ionicons
              name="walk"
              size={18}
              color={color}
            />
            <Text style={styles.walkText}>
              3 min walk
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons
              name={icon}
              size={18}
              color={color}
            />
            <Text style={styles.noteText}>
              {note}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.line} />

      <View style={styles.cardBottom}>
        <View style={styles.row}>
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

          <Text style={styles.spotText}>
            {spots} spots
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.navigateBtn,
            { borderColor: color },
          ]}
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

  /* HEADER */
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

  /* TITLE */
  title: {
    fontFamily: "PoppinsBold",
    fontSize: 28,
    color: "#D92E3F",

    marginTop: 10,
    marginBottom: 22,
  },

  /* PREDICT BOX */
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

  /* WHERE */
  whereBox: {
    backgroundColor: "#fff",

    borderWidth: 1,
    borderColor: "#F0C8C8",

    borderRadius: 22,

    height: 56,

    paddingHorizontal: 20,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    marginBottom: 16,
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

  /* DATE BOX */
  dateBox: {
    backgroundColor: "#fff",

    borderWidth: 1,
    borderColor: "#F0C8C8",

    borderRadius: 22,

    height: 50,

    paddingHorizontal: 20,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  dateText: {
    marginLeft: 12,
    fontFamily: "PoppinsMedium",
    fontSize: 13,
    color: "#222",
  },

  predictButton: {
    backgroundColor: "#D92E3F",

    paddingHorizontal: 22,
    height: 25,

    borderRadius: 20,

    justifyContent: "center",
    alignItems: "center",
  },

  predictBtnText: {
    color: "#fff",
    fontFamily: "PoppinsBold",
    fontSize: 13,
  },

  /* RECOMMEND */
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

  /* CARD */
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
    color: "#111",

    marginBottom: 8,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  walkText: {
    marginLeft: 6,
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#444",
  },

  noteText: {
    marginLeft: 6,
    fontFamily: "PoppinsRegular",
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
    color: "#222",
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