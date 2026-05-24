import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ImageBackground,
} from "react-native";

import {
  Ionicons,
  MaterialIcons,
  Feather,
} from "@expo/vector-icons";

import { useNavigation } from "@react-navigation/native";

export default function RegisterScreen() {
  const navigation = useNavigation<any>();

  const [passwordVisible, setPasswordVisible] =
    useState(false);

  const [
    confirmPasswordVisible,
    setConfirmPasswordVisible,
  ] = useState(false);

  const [selectedRole, setSelectedRole] =
    useState("");

  const [showRoleDropdown,
    setShowRoleDropdown] =
    useState(false);

  return (
    <ImageBackground
      source={require("../../assets/images/login-bg.png")}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {/* LOGO - sama kayak SignIn */}
        <Image
          source={require("../../assets/images/spark-logo.png")}
          style={styles.logo}
        />

        {/* CARD */}
        <View style={styles.card}>

          {/* BACK BUTTON */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              navigation.goBack()
            }
          >
            <Ionicons
              name="arrow-back"
              size={30}
              color="#D92E2F"
            />
          </TouchableOpacity>

          {/* ICON */}
          <View style={styles.iconBox}>
            <Ionicons
              name="person-add-outline"
              size={34}
              color="#C91E27"
            />
          </View>

          {/* TITLE */}
          <Text style={styles.title}>
            Sign Up
          </Text>

          <Text style={styles.subtitle}>
            Find available parking faster
            with{"\n"}
            real-time smart guidance
          </Text>

          {/* NAME */}
          <View style={styles.inputContainer}>
            <MaterialIcons
              name="person"
              size={22}
              color="#D14A3D"
            />

            <TextInput
              placeholder="Name"
              placeholderTextColor="#E57A7A"
              style={styles.input}
            />
          </View>

          {/* EMAIL */}
          <View style={styles.inputContainer}>
            <MaterialIcons
              name="email"
              size={22}
              color="#D14A3D"
            />

            <TextInput
              placeholder="Email"
              placeholderTextColor="#E57A7A"
              style={styles.input}
            />
          </View>

          {/* PASSWORD */}
          <View style={styles.inputContainer}>
            <Feather
              name="lock"
              size={22}
              color="#D14A3D"
            />

            <TextInput
              placeholder="Password"
              placeholderTextColor="#E57A7A"
              secureTextEntry={
                !passwordVisible
              }
              style={styles.input}
            />

            <TouchableOpacity
              onPress={() =>
                setPasswordVisible(
                  !passwordVisible
                )
              }
            >
              <Ionicons
                name={
                  passwordVisible
                    ? "eye-outline"
                    : "eye-off-outline"
                }
                size={22}
                color="#D14A3D"
              />
            </TouchableOpacity>
          </View>

          {/* CONFIRM PASSWORD */}
          <View style={styles.inputContainer}>
            <Feather
              name="lock"
              size={22}
              color="#D14A3D"
            />

            <TextInput
              placeholder="Confirm Password"
              placeholderTextColor="#E57A7A"
              secureTextEntry={
                !confirmPasswordVisible
              }
              style={styles.input}
            />

            <TouchableOpacity
              onPress={() =>
                setConfirmPasswordVisible(
                  !confirmPasswordVisible
                )
              }
            >
              <Ionicons
                name={
                  confirmPasswordVisible
                    ? "eye-outline"
                    : "eye-off-outline"
                }
                size={22}
                color="#D14A3D"
              />
            </TouchableOpacity>
          </View>

          {/* ROLE */}
          <View style={{ width: "100%" }}>
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() =>
                setShowRoleDropdown(
                  !showRoleDropdown
                )
              }
            >
              <MaterialIcons
                name="person"
                size={22}
                color="#D14A3D"
              />

              <Text style={styles.roleText}>
                {selectedRole ||
                  "Choose role.."}
              </Text>

              <Ionicons
                name={
                  showRoleDropdown
                    ? "chevron-up"
                    : "chevron-down"
                }
                size={24}
                color="#D92E2F"
              />
            </TouchableOpacity>

            {showRoleDropdown && (
              <View
                style={
                  styles.dropdownContainer
                }
              >
                <TouchableOpacity
                  style={
                    styles.dropdownItem
                  }
                  onPress={() => {
                    setSelectedRole(
                      "Mahasiswa"
                    );
                    setShowRoleDropdown(
                      false
                    );
                  }}
                >
                  <Text
                    style={
                      styles.dropdownText
                    }
                  >
                    Mahasiswa
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={
                    styles.dropdownItem
                  }
                  onPress={() => {
                    setSelectedRole(
                      "Tenaga Pendidik"
                    );
                    setShowRoleDropdown(
                      false
                    );
                  }}
                >
                  <Text
                    style={
                      styles.dropdownText
                    }
                  >
                    Tenaga Pendidik
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          {/* BUTTON */}
          <TouchableOpacity
            style={styles.signUpButton}
            onPress={() =>
              navigation.replace(
                "MainTabs"
              )
            }
          >
            <Text
              style={styles.signUpBtnText}
            >
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    backgroundColor:
      "rgba(248,243,233,0.55)",

    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },

  logo: {
    width: 135,
    height: 45,
    resizeMode: "contain",
    marginBottom: 24,
  },

  card: {
    width: "100%",
    backgroundColor: "#F9F5E8",

    borderRadius: 36,
    borderWidth: 2,
    borderColor: "#F24848",

    paddingHorizontal: 24,
    paddingVertical: 26,

    alignItems: "center",

    shadowColor: "#D92E3F",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },

  backButton: {
    position: "absolute",
    top: 22,
    left: 22,

    width: 54,
    height: 54,

    borderRadius: 18,
    backgroundColor: "#FFF",

    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#D92E3F",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },

  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 24,

    backgroundColor: "#FFF",

    justifyContent: "center",
    alignItems: "center",

    marginTop: 20,
    marginBottom: 20,

    shadowColor: "#D92E3F",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },

  title: {
    fontFamily: "PoppinsBold",
    fontSize: 32,
    color: "#D92E3F",
  },

  subtitle: {
    textAlign: "center",
    fontFamily: "PoppinsMedium",
    fontSize: 13,
    color: "#E76A6A",

    marginTop: 10,
    marginBottom: 24,
    lineHeight: 22,
  },

  inputContainer: {
    width: "100%",
    height: 54,

    borderWidth: 2,
    borderColor: "#D9642A",

    borderRadius: 18,

    paddingHorizontal: 18,

    flexDirection: "row",
    alignItems: "center",

    marginBottom: 16,
  },

  input: {
    flex: 1,
    marginLeft: 14,

    fontFamily: "PoppinsMedium",
    fontSize: 15,
  },

  roleText: {
    flex: 1,
    marginLeft: 14,

    fontFamily: "PoppinsMedium",
    fontSize: 15,
    color: "#E57A7A",
  },

  signUpButton: {
    width: "100%",
    height: 56,

    backgroundColor: "#D92E2F",

    borderRadius: 22,

    justifyContent: "center",
    alignItems: "center",

    marginTop: 12,
  },

  signUpBtnText: {
    color: "#fff",
    fontFamily: "PoppinsBold",
    fontSize: 18,
  },
  dropdownContainer: {
  width: "100%",
  backgroundColor: "#FFF",

  borderWidth: 1.5,
  borderColor: "#F0C8C8",

  borderRadius: 18,
  marginTop: -8,
  marginBottom: 16,

  overflow: "hidden",
},

dropdownItem: {
  paddingVertical: 14,
  paddingHorizontal: 20,

  borderBottomWidth: 1,
  borderBottomColor: "#F6E2E2",
},

dropdownText: {
  fontFamily: "PoppinsMedium",
  fontSize: 14,
  color: "#444",
},
});