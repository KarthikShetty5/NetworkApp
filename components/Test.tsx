import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Text, View } from "react-native";
import * as Location from "expo-location";
import { getNotification, sendNotification } from "@/app/api/GetNotificationApi";
import getNearbyUsersApi, { NearbyUsersPayload } from "@/app/api/TrackApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import UpdateLocationApi from "@/app/api/UpdateLocationApi";

interface LocationProps {
  coords: {
    latitude: number;
    longitude: number;
  };
}

const Test = () => {
  const [location, setLocation] = useState<LocationProps | null>(null);
  const previousLocationRef = useRef<LocationProps | null>(null);
  const locationWatcherRef = useRef<Location.LocationSubscription | null>(null);
  const locationUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  

  return (
    <View style={{ backgroundColor: "white", flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 16 }}>Location Tracking Enabled</Text>
    </View>
  );
};

export default Test;
