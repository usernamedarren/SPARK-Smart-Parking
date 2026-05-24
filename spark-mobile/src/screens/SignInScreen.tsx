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
  Alert,
} from "react-native";

import {
  Ionicons,
  MaterialIcons,
  Feather,
} from "@expo/vector-icons";

import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigation = useNavigation<any>();
  const { signIn } = useAuth();

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signIn(email.trim(), password);
      // Navigation is handled automatically by AuthProvider state change
    } catch (e: any) {
      const msg =
        e?.response?.data?.detail || e?.message || "Login failed. Please try again.";
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
      {/* OVERLAY */}
      <View style={styles.overlay}>

        {/* LOGO */}
        <Image
          source={require("../../assets/images/spark-logo.png")}
          style={styles.logo}
        />

        {/* CARD */}
        <View style={styles.card}>

          {/* ICON */}
          <View style={styles.iconBox}>
            <Ionicons
              name="log-in-outline"
              size={40}
              color="#C91E27"
            />
          </View>

          {/* TITLE */}
          <Text style={styles.title}>
            Sign In
          </Text>

          <Text style={styles.subtitle}>
            Find available parking faster with
            {"\n"}
            real-time smart guidance
          </Text>

          {/* ERROR */}
          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color="#D92E3F" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* EMAIL */}
          <View style={styles.inputContainer}>
            <MaterialIcons
              name="email"
              size={24}
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
                size={24}
                color="#D14A3D"
              />
            </TouchableOpacity>
          </View>

          {/* SIGN IN BUTTON */}
          <TouchableOpacity
            style={[styles.signInButton, loading && { opacity: 0.7 }]}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signInText}>
                Sign In
              </Text>
            )}
          </TouchableOpacity>

          {/* SIGN UP */}
          <TouchableOpacity
              onPress={() =>
              navigation.navigate("Register")
            }
            disabled={loading}
          >
            <Text style={styles.signUpText}>
              Don't have an account?{" "}
              <Text style={styles.signUpBold}>
                Sign Up
              </Text>
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
    paddingVertical: 24,

    alignItems: "center",

    shadowColor: "#D92E3F",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },

  iconBox: {
    width: 72,
    height: 72,

    borderRadius: 24,

    backgroundColor: "#FFF",

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 24,

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
    marginBottom: 32,
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

    marginBottom: 18,

    backgroundColor: "transparent",
  },

  input: {
    flex: 1,

    marginLeft: 14,

    fontFamily: "PoppinsMedium",
    fontSize: 15,
    color: "#222",
  },

  forgotText: {
    alignSelf: "flex-end",

    fontFamily: "PoppinsSemiBold",
    fontSize: 15,

    color: "#E76A6A",

    marginBottom: 30,
  },

  signInButton: {
    width: "100%",
    height: 56,

    borderRadius: 22,

    backgroundColor: "#D92E2F",

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 26,
  },

  signInText: {
    color: "#fff",
    fontFamily: "PoppinsBold",
    fontSize: 18,
  },

  signUpText: {
    fontFamily: "PoppinsMedium",
    fontSize: 15,
    color: "#F08B8B",
  },

  signUpBold: {
    fontFamily: "PoppinsBold",
    color: "#D92E3F",
  },
});