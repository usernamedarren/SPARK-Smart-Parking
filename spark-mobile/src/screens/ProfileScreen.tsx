import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  TextInput, 
  Alert,
  ActivityIndicator,
} from "react-native";

import {
  Ionicons,
  Feather,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { updateProfile, updatePassword } from "../services/api";

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, signOut, refreshUser } = useAuth();

  // Modal states
  const [editNameModalVisible, setEditNameModalVisible] = useState(false);
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  
  const [newName, setNewName] = useState(user?.name || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    await signOut();
  };

  const handleSaveName = async () => {
    if (!newName.trim()) {
      Alert.alert("Error", "Name cannot be empty.");
      return;
    }

    setLoading(true);
    try {
      await updateProfile({ name: newName.trim() });
      await refreshUser(); // Refresh global auth state
      setEditNameModalVisible(false);
      Alert.alert("Success", "Name updated successfully!");
    } catch (e: any) {
      const msg = e?.response?.data?.detail || e?.message || "Failed to update name.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await updatePassword(newPassword);
      setChangePasswordModalVisible(false);
      setNewPassword("");
      setConfirmPassword("");
      Alert.alert("Success", "Password changed successfully!");
    } catch (e: any) {
      const msg = e?.response?.data?.detail || e?.message || "Failed to change password.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  // Map role value to display label
  const roleDisplay = (role?: string) => {
    switch (role) {
      case "mahasiswa": return "Mahasiswa";
      case "tenaga_didik": return "Tenaga Didik";
      default: return role || "Mahasiswa";
    }
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 40,
      }}
    >
      {/* EDIT NAME MODAL */}
      <Modal
        visible={editNameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditNameModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Name</Text>
            
            <TextInput
              style={styles.modalInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="Enter your name"
              placeholderTextColor="#A0A0A0"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveName}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Save</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditNameModalVisible(false)}
              >
                <Text style={[styles.buttonText, { color: "#7A6761" }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* CHANGE PASSWORD MODAL */}
      <Modal
        visible={changePasswordModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setChangePasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>
            
            <TextInput
              style={styles.modalInput}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="New password (min. 6 chars)"
              placeholderTextColor="#A0A0A0"
              secureTextEntry
            />

            <TextInput
              style={styles.modalInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              placeholderTextColor="#A0A0A0"
              secureTextEntry
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSavePassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Save</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setChangePasswordModalVisible(false);
                  setNewPassword("");
                  setConfirmPassword("");
                }}
              >
                <Text style={[styles.buttonText, { color: "#7A6761" }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
      <View style={{ alignSelf: "center", position: "relative" }}>
        <Image
          source={require("../../assets/images/profile-avatar.png")}
          style={styles.profileImage}
        />
        <TouchableOpacity 
          style={styles.editImageBadge}
          onPress={() => {
            setNewName(user?.name || "");
            setEditNameModalVisible(true);
          }}
        >
          <MaterialIcons name="edit" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* NAME */}
      <Text style={styles.name}>
        {user?.name || "User"}
      </Text>

      {/* ROLE BADGE */}
      <View style={styles.roleBadge}>
        <Ionicons
          name="school"
          size={14}
          color="#C8473B"
        />

        <Text style={styles.roleText}>
          {roleDisplay(user?.role)}
        </Text>
      </View>

      {/* INFO CARD */}
      <View style={styles.infoCard}>
        {/* EMAIL */}
        <View
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
              {user?.email || "—"}
            </Text>
          </View>
        </View>

        {/* PASSWORD */}
        <TouchableOpacity
          style={styles.infoRow}
          onPress={() => setChangePasswordModalVisible(true)}
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
            <Text style={[styles.infoValue, { color: "#D92E3F", fontFamily: "PoppinsMedium" }]}>
              Change Password
            </Text>

            <Ionicons
              name="chevron-forward"
              size={18}
              color="#D92E3F"
            />
          </View>
        </TouchableOpacity>

        {/* ROLE */}
        <View
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
            <Text style={[styles.infoValue, { textTransform: "capitalize" }]}>
              {roleDisplay(user?.role)}
            </Text>
          </View>
        </View>
      </View>

      {/* LOGOUT */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
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

  editImageBadge: {
    position: "absolute",
    bottom: 0,
    right: 4,
    backgroundColor: "#D92E3F",
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
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
    textTransform: "capitalize",
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

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#F0D7D7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontFamily: "PoppinsBold",
    fontSize: 18,
    color: "#D92E3F",
    marginBottom: 16,
  },
  modalInput: {
    height: 52,
    borderWidth: 1,
    borderColor: "#E2D0D0",
    borderRadius: 14,
    paddingHorizontal: 16,
    fontFamily: "PoppinsRegular",
    fontSize: 14,
    color: "#333",
    marginBottom: 14,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#D92E3F",
  },
  cancelButton: {
    backgroundColor: "#F2E6E6",
  },
  buttonText: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 14,
    color: "#fff",
  },
});