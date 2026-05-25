import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ImageBackground,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

import {
  Ionicons,
  MaterialIcons,
  Feather,
} from "@expo/vector-icons";

import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";

const ROLES = [
  { label: "Mahasiswa", value: "mahasiswa" },
  { label: "Tenaga Didik", value: "tenaga_didik" },
];

export default function RegisterScreen() {
  const navigation = useNavigation<any>();
  const { signUp } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [showRoles, setShowRoles] = useState(false);

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedRoleLabel = ROLES.find((r) => r.value === role)?.label || "";

  const handleSignUp = async () => {
    // Validation
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!email.trim()) { setError("Please enter your email."); return; }
    if (!password.trim()) { setError("Please enter a password."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (!role) { setError("Please choose a role."); return; }

    setLoading(true);
    setError("");

    try {
      await signUp(name.trim(), email.trim(), password, role);
      // Navigation handled by AuthProvider
    } catch (e: any) {
      const msg =
        e?.response?.data?.detail || e?.message || "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/login-bg.png")}
      style={styles.container}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={styles.overlay}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* LOGO */}
          <Image
            source={require("../../assets/images/spark-logo.png")}
            style={styles.logo}
          />

          {/* CARD */}
          <View style={styles.card}>

          {/* BACK BUTTON */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
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

          {/* ERROR */}
          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color="#D92E3F" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

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
              value={name}
              onChangeText={setName}
              editable={!loading}
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
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
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
              secureTextEntry={!passwordVisible}
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />

            <TouchableOpacity
              onPress={() => setPasswordVisible(!passwordVisible)}
            >
              <Ionicons
                name={passwordVisible ? "eye-outline" : "eye-off-outline"}
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
              secureTextEntry={!confirmPasswordVisible}
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!loading}
            />

            <TouchableOpacity
              onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
            >
              <Ionicons
                name={confirmPasswordVisible ? "eye-outline" : "eye-off-outline"}
                size={22}
                color="#D14A3D"
              />
            </TouchableOpacity>
          </View>

          {/* ROLE */}
          {/* ROLE */}
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => setShowRoles(!showRoles)}
            disabled={loading}
          >
            <MaterialIcons
              name="person"
              size={22}
              color="#D14A3D"
            />

            <Text
              style={[
                styles.roleText,
                role ? { color: "#222" } : {},
              ]}
            >
              {selectedRoleLabel || "Choose role.."}
            </Text>

            <Ionicons
              name="chevron-down"
              size={24}
              color="#D92E2F"
            />
          </TouchableOpacity>

          {/* ROLE DROPDOWN */}
          {showRoles && (
            <View style={styles.roleDropdown}>
              {ROLES.map((r) => (
                <TouchableOpacity
                  key={r.value}
                  style={[
                    styles.roleOption,
                    role === r.value && styles.roleOptionActive,
                  ]}
                  onPress={() => {
                    setRole(r.value);
                    setShowRoles(false);
                  }}
                >
                  <Text
                    style={[
                      styles.roleOptionText,
                      role === r.value && { color: "#D92E3F" },
                    ]}
                  >
                    {r.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {/* BUTTON */}
          <TouchableOpacity
            style={[styles.signUpButton, loading && { opacity: 0.7 }]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signUpBtnText}>
                Sign Up
              </Text>
            )}
          </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  overlay: {
    flexGrow: 1,
    backgroundColor:
      "rgba(248,243,233,0.55)",

    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 40,
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

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF0F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    width: "100%",
  },

  errorText: {
    fontFamily: "PoppinsMedium",
    fontSize: 12,
    color: "#D92E3F",
    marginLeft: 8,
    flex: 1,
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

  roleDropdown: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F0D7D7",
    marginBottom: 16,
    overflow: "hidden",
  },

  roleOption: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F5EDED",
  },

  roleOptionActive: {
    backgroundColor: "#FFF5F5",
  },

  roleOptionText: {
    fontFamily: "PoppinsMedium",
    fontSize: 14,
    color: "#444",
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