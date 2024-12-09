import React, { useEffect, useState } from "react";
import * as Location from "expo-location";
import { StyleSheet, Text, View } from "react-native";

interface LocationProps {
    coords: {
      latitude: number;
      longitude: number;
      altitude?: number | null;
      accuracy?: number | null;
      heading?: number | null;
      speed?: number | null;
    };
  }

const TestScreen = () => {
  const [location, setLocation] = useState<LocationProps | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return;
      }
      // Start watching location changes
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 20, // Update every 10 meters
        },
        (newLocation) => {
          const newLocationData: LocationProps = {
            coords: {
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude,
              altitude: newLocation.coords.altitude ?? null,
              accuracy: newLocation.coords.accuracy ?? null,
              heading: newLocation.coords.heading ?? null,
              speed: newLocation.coords.speed ?? null,
            },
          };
          setLocation(newLocationData);
          console.log(newLocation.coords.latitude, newLocation.coords.longitude)
        }
      );
      return () => subscription.remove(); // Clean up subscription on unmount
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Live Location:</Text>
      {location ? (
        <View>
          <Text style={styles.locationText}>
            Latitude: {location.coords.latitude}
          </Text>
          <Text style={styles.locationText}>
            Longitude: {location.coords.longitude}
          </Text>
          <Text style={styles.locationText}>
            Altitude: {location.coords.altitude || "N/A"}
          </Text>
          <Text style={styles.locationText}>
            Speed: {location.coords.speed || "N/A"} m/s
          </Text>
          <Text style={styles.locationText}>
            Accuracy: {location.coords.accuracy || "N/A"} meters
          </Text>
        </View>
      ) : (
        <Text style={styles.locationText}>Tracking location...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  locationText: {
    fontSize: 16,
    marginVertical: 5,
  },
});

export default TestScreen;
