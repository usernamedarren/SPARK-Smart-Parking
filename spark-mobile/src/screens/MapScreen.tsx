import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";

import MapView, {
  Marker,
} from "react-native-maps";

import {
  Ionicons,
  Feather,
} from "@expo/vector-icons";

import {
  useNavigation,
} from "@react-navigation/native";

export default function MapScreen() {
  const navigation =
    useNavigation<any>();

  const [selected, setSelected] =
    useState("All");
  
  const [selectedCampus,
    setSelectedCampus] =
    useState("Ganesha");

  const [showDropdown, setShowDropdown] =
    useState(false);

  const campusLocations = {
  Ganesha: [
    {
      name: "Labtek 5",
      spots: "20 spots",
      color: "#406A43",
      latitude: -6.8915,
      longitude: 107.6107,
    },
    {
      name: "Labtek 8",
      spots: "5 spots",
      color: "#F2C94C",
      latitude: -6.8919,
      longitude: 107.6116,
    },
    {
      name: "FSRD",
      spots: "Full",
      color: "#D92E3F",
      latitude: -6.8932,
      longitude: 107.612,
    },
    {
      name: "GKUB",
      spots: "12 spots",
      color: "#406A43",
      latitude: -6.8923,
      longitude: 107.6101,
    },
    {
      name: "GKUT",
      spots: "Limited",
      color: "#F2C94C",
      latitude: -6.8928,
      longitude: 107.6098,
    },
    {
      name: "CADL",
      spots: "15 spots",
      color: "#406A43",
      latitude: -6.8909,
      longitude: 107.611,
    },
    {
      name: "Aula Barat",
      spots: "Full",
      color: "#D92E3F",
      latitude: -6.891,
      longitude: 107.6089,
    },
    {
      name: "Aula Timur",
      spots: "8 spots",
      color: "#F2C94C",
      latitude: -6.892,
      longitude: 107.6127,
    },
  ],

  Jatinangor: [
    {
      name: "GKU 1",
      spots: "18 spots",
      color: "#406A43",
      latitude: -6.9314,
      longitude: 107.7704,
    },
    {
      name: "GKU 2",
      spots: "Limited",
      color: "#F2C94C",
      latitude: -6.9308,
      longitude: 107.7712,
    },
    {
      name: "GKU 3",
      spots: "Full",
      color: "#D92E3F",
      latitude: -6.9319,
      longitude: 107.772,
    },
    {
      name: "Rektorat",
      spots: "9 spots",
      color: "#406A43",
      latitude: -6.9299,
      longitude: 107.7708,
    },
  ],
};

const currentLocations =
  campusLocations[
    selectedCampus as keyof typeof campusLocations
  ];

  const filteredLocations =
    selected === "All"
      ? currentLocations
      : currentLocations.filter(
          (item) =>
            item.name === selected
        );

  const dropdownLocations =
    selectedCampus ===
    "Ganesha"
      ? [
          "GKUB",
          "GKUT",
          "CADL",
          "Aula Barat",
          "Aula Timur",
        ]
      : [];

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/spark-logo.png")}
          style={styles.logoImage}
        />

        <TouchableOpacity
          onPress={() =>
            navigation.navigate(
              "Profile"
            )
          }
        >
          <Ionicons
            name="person-circle"
            size={45}
            color="#D92E3F"
          />
        </TouchableOpacity>
      </View>

      {/* CAMPUS SELECTOR */}
      <View style={styles.campusContainer}>
        {[
          "Ganesha",
          "Jatinangor",
        ].map((campus) => (
          <TouchableOpacity
            key={campus}
            style={[
              styles.campusChip,
              selectedCampus ===
                campus &&
                styles.activeCampus,
            ]}
            onPress={() => {
              setSelectedCampus(
                campus
              );

              setSelected("All");
            }}
          >
            <Text
              style={[
                styles.campusText,
                selectedCampus ===
                  campus &&
                  styles.activeCampusText,
              ]}
            >
              {campus}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

{/* FILTER */}
<View style={styles.filterContainer}>
  {(selectedCampus ===
  "Ganesha"
    ? [
        "All",
        "Labtek 5",
        "Labtek 8",
        "FSRD",
      ]
    : [
        "All",
        "GKU 1",
        "GKU 2",
        "GKU 3",
        "Rektorat",
      ]
  ).map((item) => (
    <TouchableOpacity
      key={item}
      style={[
        styles.filterChip,
        selected === item &&
          styles.activeChip,
      ]}
      onPress={() =>
        setSelected(item)
      }
    >
      <Text
        style={[
          styles.filterText,
          selected === item &&
            styles.activeChipText,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  ))}

  {/* DROPDOWN ONLY GANESHA */}
  {selectedCampus ===
    "Ganesha" && (
    <TouchableOpacity
      style={
        styles.dropdownButton
      }
      onPress={() =>
        setShowDropdown(
          !showDropdown
        )
      }
    >
      <Text
        style={
          styles.filterText
        }
      >
        More
      </Text>

      <Ionicons
        name={
          showDropdown
            ? "chevron-up"
            : "chevron-down"
        }
        size={16}
        color="#D92E3F"
      />
    </TouchableOpacity>
  )}
</View>

      {/* DROPDOWN MENU */}
      {showDropdown && (
        <View
          style={
            styles.dropdownMenu
          }
        >
          {dropdownLocations.map(
            (location) => (
              <TouchableOpacity
                key={location}
                style={
                  styles.dropdownItem
                }
                onPress={() => {
                  setSelected(
                    location
                  );

                  setShowDropdown(
                    false
                  );
                }}
              >
                <Text
                  style={
                    styles.dropdownText
                  }
                >
                  {location}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>
      )}

      {/* MAP */}
      <View
        style={
          styles.mapContainer
        }
      >
        <MapView
          style={styles.map}
          region={
            selectedCampus ===
            "Ganesha"
              ? {
                  latitude: -6.8915,
                  longitude: 107.6107,
                  latitudeDelta: 0.006,
                  longitudeDelta: 0.006,
                }
              : {
                  latitude: -6.9313,
                  longitude: 107.771,
                  latitudeDelta: 0.008,
                  longitudeDelta: 0.008,
                }
          }>
          {filteredLocations.map(
            (location) => (
              <Marker
                key={
                  location.name
                }
                coordinate={{
                  latitude:
                    location.latitude,
                  longitude:
                    location.longitude,
                }}
                onPress={() =>
                  navigation.navigate(
                    "DetailParking",
                    {
                      selectedLocation:
                        location.name,
                    }
                  )
                }
              >
                <TouchableOpacity>
                  <View
                    style={[
                      styles.marker,
                      {
                        backgroundColor:
                          location.color,
                      },
                    ]}
                  >
                    <Text
                      style={
                        styles.markerText
                      }
                    >
                      P
                    </Text>
                  </View>

                  <View
                    style={
                      styles.popup
                    }
                  >
                    <Text
                      style={
                        styles.popupTitle
                      }
                    >
                      {
                        location.name
                      }
                    </Text>

                    <Text
                      style={[
                        styles.popupSubtitle,
                        {
                          color:
                            location.color,
                        },
                      ]}
                    >
                      {
                        location.spots
                      }
                    </Text>
                  </View>
                </TouchableOpacity>
              </Marker>
            )
          )}
        </MapView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F3EE",
    paddingTop: 55,
    paddingHorizontal: 24,
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
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

  /* FILTER BAR */
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    backgroundColor: "#FFF",
    borderRadius: 18,

    borderWidth: 1,
    borderColor: "#F0D7D7",

    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  filterChip: {
    backgroundColor: "#EFEAE6",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
  },

  activeChip: {
    backgroundColor: "#FBE6E3",
  },

  filterText: {
    fontSize: 11,
    fontFamily: "PoppinsMedium",
    color: "#777",
  },

  activeChipText: {
    color: "#D92E3F",
    fontFamily: "PoppinsSemiBold",
  },

  /* LOCATE BUTTON */
  locateBtn: {
    marginTop: 12,

    backgroundColor: "#406A43",

    alignSelf: "flex-start",

    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,

    flexDirection: "row",
    alignItems: "center",
  },

  locateText: {
    color: "#fff",
    fontFamily: "PoppinsMedium",
    fontSize: 11,
    marginLeft: 4,
  },

  /* MAP */
  mapContainer: {
    marginTop: 14,
    height: 460,

    borderRadius: 24,
    overflow: "hidden",

    borderWidth: 1,
    borderColor: "#F0D7D7",
  },

  map: {
    flex: 1,
  },

  /* MARKER */
  marker: {
    width: 34,
    height: 34,
    borderRadius: 17,

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 2,
    borderColor: "#fff",
  },

  markerText: {
    color: "#fff",
    fontFamily: "PoppinsBold",
    fontSize: 14,
  },

  popup: {
    backgroundColor: "#fff",

    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,

    marginTop: 6,
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,

    elevation: 4,
  },

  popupTitle: {
    fontFamily: "PoppinsBold",
    fontSize: 11,
    color: "#222",
  },

  popupSubtitle: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    color: "#777",
  },

  /* LEGEND */
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingHorizontal: 2,
  },

  legend: {
    fontSize: 10,
    color: "#777",
    fontFamily: "PoppinsRegular",
  },

  /* NAVBAR */
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,

    height: 82,
    backgroundColor: "#fff",

    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",

    borderTopWidth: 1.5,
    borderTopColor: "#F2D6D6",

    paddingBottom: 10,
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
    height: 36,
    borderRadius: 18,
  },

  activeTabText: {
    fontFamily: "PoppinsMedium",
    fontSize: 10,
    color: "#D92E3F",
    marginTop: 2,
  },
  dropdownButton: {
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
},

dropdownMenu: {
  backgroundColor: "#FFF",
  borderRadius: 18,
  borderWidth: 1,
  borderColor: "#F0D7D7",
  paddingVertical: 8,
  marginTop: 8,
},

dropdownItem: {
  paddingVertical: 10,
  paddingHorizontal: 16,
},

dropdownText: {
  fontFamily: "PoppinsMedium",
  color: "#444",
},

campusContainer: {
  flexDirection: "row",
  marginTop: 8,
  marginBottom: 12,
  gap: 8,
},

campusChip: {
  backgroundColor: "#EFEAE6",
  paddingHorizontal: 18,
  paddingVertical: 8,
  borderRadius: 20,
},

activeCampus: {
  backgroundColor: "#FBE6E3",
},

campusText: {
  fontFamily: "PoppinsMedium",
  color: "#777",
  fontSize: 12,
},

activeCampusText: {
  color: "#D92E3F",
  fontFamily: "PoppinsSemiBold",
},
});