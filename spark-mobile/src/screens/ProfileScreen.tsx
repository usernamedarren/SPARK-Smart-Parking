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
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import { useNavigation } from "@react-navigation/native";

export default function ProfileScreen() {
const navigation = useNavigation();

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 40,
      }}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color="#D92E3F"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Profile
        </Text>

        <View style={{ width: 40 }} />
      </View>

      {/* CITY BG */}
      <Image
        source={require("../../assets/images/city-bg.png")}
        style={styles.cityImage}
      />

      {/* PROFILE IMAGE */}
      <Image
        source={require("../../assets/images/profile-avatar.png")}
        style={styles.profileImage}
      />

      {/* NAME */}
      <Text style={styles.name}>
        Andi Makmur
      </Text>

      {/* ROLE BADGE */}
      <View style={styles.roleBadge}>
        <Ionicons
          name="school"
          size={14}
          color="#C8473B"
        />

        <Text style={styles.roleText}>
          Student
        </Text>
      </View>

      {/* INFO CARD */}
      <View style={styles.infoCard}>
        {/* EMAIL */}
        <TouchableOpacity
          style={styles.infoRow}
        >
          <View style={styles.leftRow}>
            <MaterialIcons
              name="email"
              size={24}
              color="#7A6761"
            />

            <Text style={styles.infoLabel}>
              Email
            </Text>
          </View>

          <View style={styles.rightRow}>
            <Text style={styles.infoValue}>
              andimakmur22@gmail.com
            </Text>

            <Ionicons
              name="chevron-forward"
              size={18}
              color="#D92E3F"
            />
          </View>
        </TouchableOpacity>

        {/* PASSWORD */}
        <TouchableOpacity
          style={styles.infoRow}
        >
          <View style={styles.leftRow}>
            <Feather
              name="lock"
              size={22}
              color="#7A6761"
            />

            <Text style={styles.infoLabel}>
              Password
            </Text>
          </View>

          <View style={styles.rightRow}>
            <Text style={styles.infoValue}>
              ********
            </Text>

            <Ionicons
              name="chevron-forward"
              size={18}
              color="#D92E3F"
            />
          </View>
        </TouchableOpacity>

        {/* ROLE */}
        <TouchableOpacity
          style={styles.infoRow}
        >
          <View style={styles.leftRow}>
            <MaterialCommunityIcons
              name="card-account-details-outline"
              size={22}
              color="#7A6761"
            />

            <Text style={styles.infoLabel}>
              Role
            </Text>
          </View>

          <View style={styles.rightRow}>
            <Text style={styles.infoValue}>
              Student
            </Text>

            <Ionicons
              name="chevron-forward"
              size={18}
              color="#D92E3F"
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* LOGOUT */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => {navigation.navigate("SignIn" as never);}}
      >
        <MaterialCommunityIcons
          name="logout"
          size={20}
          color="#fff"
        />

        <Text style={styles.logoutText}>
          Log Out
        </Text>
      </TouchableOpacity>
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
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: 20,
    marginTop: 12,
  },

  backButton: {
    width: 38,
    height: 38,

    borderWidth: 1.5,
    borderColor: "#D92E3F",

    borderRadius: 12,

    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    fontFamily: "PoppinsBold",
    fontSize: 20,
    color: "#D92E3F",
  },

  cityImage: {
    position: "absolute",
    right: -25,
    top: 80,

    width: 220,
    height: 110,

    resizeMode: "contain",
  },

  profileImage: {
    width: 110,
    height: 110,

    borderRadius: 55,
    alignSelf: "center",

    marginTop: 22,
  },

  name: {
    fontFamily: "PoppinsBold",
    fontSize: 24,
    color: "#111",

    alignSelf: "center",
    marginTop: 14,
  },

  roleBadge: {
    alignSelf: "center",

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#F8DFC8",

    paddingHorizontal: 16,
    height: 34,

    borderRadius: 20,

    marginTop: 8,
    marginBottom: 22,
  },

  roleText: {
    marginLeft: 6,

    fontFamily: "PoppinsMedium",
    fontSize: 13,
    color: "#111",
  },

  infoCard: {
    backgroundColor: "#FFF",

    borderRadius: 18,

    borderWidth: 1,
    borderColor: "#F0D7D7",

    overflow: "hidden",
  },

  infoRow: {
    height: 72,

    paddingHorizontal: 20,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    borderBottomWidth: 1,
    borderBottomColor: "#F2E6E6",
  },

  leftRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  rightRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  infoLabel: {
    marginLeft: 14,

    fontFamily: "PoppinsMedium",
    fontSize: 15,
    color: "#7A6761",
  },

  infoValue: {
    fontFamily: "PoppinsRegular",
    fontSize: 12,
    color: "#7A6761",

    marginRight: 8,
  },

  logoutButton: {
    marginTop: 28,

    backgroundColor: "#D14A3D",

    height: 56,
    borderRadius: 14,

    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  logoutText: {
    color: "#fff",
    fontFamily: "PoppinsSemiBold",
    fontSize: 16,

    marginLeft: 8,
  },
});