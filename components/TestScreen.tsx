import React, { useEffect, useState, useCallback, useRef } from "react";
import * as Location from "expo-location";
import { Alert, StyleSheet, Text, View } from "react-native";
import UpdateLocationApi from "@/app/api/UpdateLocationApi";

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

let count = 0 ;
const TestScreen = () => {
  const [location, setLocation] = useState<LocationProps | null>(null);
  const previousLocationRef = useRef<LocationProps | null>(null);
  const locationWatcherRef = useRef<Location.LocationSubscription | null>(null); 
  const locationUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userId = "122345"; // Replace with your actual user ID

  const fetchLocation = useCallback(async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permissions are required.");
        return;
      }

      // Stop any existing watcher
      if (locationWatcherRef.current) {
        locationWatcherRef.current.remove();
      }

      // Start watching location changes with optimized options
      locationWatcherRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced, // More battery-efficient
          timeInterval: 10000, // Update every 10 seconds
          distanceInterval: 10, // Update every 50 meters
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
          setLocation(prevLocation => {
            // Only update if location has significantly changed
            if (!prevLocation || 
                Math.abs(prevLocation.coords.latitude - newLocationData.coords.latitude) > 0.0000000001 ||
                Math.abs(prevLocation.coords.longitude - newLocationData.coords.longitude) > 0.0000000001
            ) {
              return newLocationData;
            }
            return prevLocation;
          });
        }
      );
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  }, []);

  const updateLocation = useCallback(async () => {
    const userId = '122345'
    count++;
    if (!location || !userId) return;

    // Check if the location has changed significantly
    const hasLocationChanged = !previousLocationRef.current || 
      Math.abs(location.coords.latitude - previousLocationRef.current.coords.latitude) > 0.0000000001 ||
      Math.abs(location.coords.longitude - previousLocationRef.current.coords.longitude) > 0.0000000001;

    if (!hasLocationChanged) {
      console.log("Location unchanged, skipping update.");
      return;
    }

    try {
      console.log("Updating location to backend:", location.coords);
      await UpdateLocationApi(userId, location.coords);
      previousLocationRef.current = location; // Save the current location as the previous location
    } catch (error) {
      console.error("Failed to update location:", error);
    }
  }, [location, userId]);

  const startLocationUpdates = useCallback(() => {
    // Clear any existing timeout
    if (locationUpdateTimeoutRef.current) {
      clearTimeout(locationUpdateTimeoutRef.current);
    }

    const updateLoop = async () => {
      try {
        await updateLocation();
      } catch (error) {
        console.error("Error in update loop:", error);
      }

      // Schedule the next update with a more robust approach
      locationUpdateTimeoutRef.current = setTimeout(updateLoop, 30000);
    };

    updateLoop(); // Start the first update
  }, [updateLocation]);

  useEffect(() => {
    // Separate concerns: location fetching and updates
    fetchLocation();
    const updateInterval = startLocationUpdates();

    // Cleanup on component unmount
    return () => {
      if (locationWatcherRef.current) {
        locationWatcherRef.current.remove();
      }
      if (locationUpdateTimeoutRef.current) {
        clearTimeout(locationUpdateTimeoutRef.current);
      }
    };
  }, []); // Empty dependency array to run only once

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Live Location:</Text>
      {location ? (
        <View>
        <Text style={styles.locationText}>
            updated times :  {count}
          </Text>
          <Text style={styles.locationText}>
            Latitude: {location.coords.latitude.toFixed(7)}
          </Text>
          <Text style={styles.locationText}>
            Longitude: {location.coords.longitude.toFixed(7)}
          </Text>
          <Text style={styles.locationText}>
            Altitude: {location.coords.altitude?.toFixed(2) || "N/A"}
          </Text>
          <Text style={styles.locationText}>
            Speed: {location.coords.speed?.toFixed(2) || "N/A"} m/s
          </Text>
          <Text style={styles.locationText}>
            Accuracy: {location.coords.accuracy?.toFixed(2) || "N/A"} meters
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

export default React.memo(TestScreen);