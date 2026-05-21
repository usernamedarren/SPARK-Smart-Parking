import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";

type Props = {
  name: string;
  status: string;
  spots: number;
  color: string;
};

export default function RecommendationCard({
  name,
  status,
  spots,
  color,
}: Props) {
  return (
    <View style={styles.card}>
      <View
        style={[styles.iconBox, { backgroundColor: color }]}
      >
        <Text style={styles.pText}>P</Text>
      </View>

      <Text style={styles.title}>{name}</Text>

      <View
        style={[
          styles.statusBadge,
          { backgroundColor: `${color}20` },
        ]}
      >
        <Text style={[styles.statusText, { color }]}>
          {status}
        </Text>
      </View>

      <Text style={styles.spotText}>
        {spots} spots
      </Text>

      <View style={styles.walkContainer}>
        <MaterialCommunityIcons
          name="walk"
          size={18}
          color={color}
        />
        <Text style={styles.walkText}>
          3 min walk
        </Text>
      </View>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>
          View Details
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 150,
    backgroundColor: "#fff",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#F0D7D7",
    padding: 15,
    marginRight: 15,
  },

  iconBox: {
    width: 55,
    height: 55,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  pText: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "700",
  },

  title: {
    fontWeight: "700",
    fontSize: 20,
    marginTop: 15,
  },

  statusBadge: {
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 10,
    alignSelf: "flex-start",
    paddingHorizontal: 15,
  },

  statusText: {
    fontWeight: "600",
  },

  spotText: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 10,
  },

  walkContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  walkText: {
    marginLeft: 5,
  },

  button: {
    marginTop: 15,
    borderWidth: 2,
    borderColor: COLORS.primary,
    padding: 12,
    borderRadius: 20,
    alignItems: "center",
  },

  buttonText: {
    color: COLORS.primary,
    fontWeight: "700",
  },
});