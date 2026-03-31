import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, Alert, useColorScheme, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { supabase } from '../../lib/supabase';

const CATEGORIES = ['Potholes', 'Waste Management', 'Water Supply', 'Streetlights', 'Public Transport', 'Others'];

export default function ReportScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';

  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Potholes');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
  const [locMode, setLocMode] = useState<'none' | 'gps' | 'type'>('none');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setName(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '');
      }
    };
    getUser();
  }, []);

  const handleGPS = async () => {
    setLocating(true);
    setLocMode('gps');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Error', 'Location permission denied'); setLocating(false); setLocMode('type'); return; }
      const loc = await Location.getCurrentPositionAsync({});
      setLatitude(loc.coords.latitude);
      setLongitude(loc.coords.longitude);
      const [place] = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      if (place) {
        setAddress(`${place.street || ''}, ${place.city || ''}, ${place.region || ''}`);
      } else {
        setAddress(`${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`);
      }
    } catch (e) {
      setAddress('Could not detect location');
    }
    setLocating(false);
  };

  const handleSubmit = async () => {
    if (!title) { Alert.alert('Missing', 'Please enter a title'); return; }
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { error } = await supabase.from('issues').insert([{
        title, description, category, status: 'Open',
        area: address || 'Not specified',
        latitude: latitude || 19.0760,
        longitude: longitude || 72.8777,
        reporter_name: name,
        user_id: session?.user?.id || null,
      }]);
      if (error) console.warn(error);
      setIsSubmitting(false);
      Alert.alert('Success!', 'Issue reported.', [{ text: 'OK', onPress: () => router.push('/(tabs)') }]);
    } catch {
      setIsSubmitting(false);
      Alert.alert('Error', 'Submission failed');
    }
  };

  return (
    <ScrollView style={[s.container, isDark && s.darkBg]} contentContainerStyle={s.content} automaticallyAdjustKeyboardInsets>
      {/* Name */}
      <Text style={[s.label, isDark && s.white]}>Your Name</Text>
      <TextInput style={[s.input, isDark && s.darkInput, isDark && s.white]} placeholder="Full name" placeholderTextColor="#888" value={name} onChangeText={setName} />

      {/* Title */}
      <Text style={[s.label, isDark && s.white]}>Issue Title</Text>
      <TextInput style={[s.input, isDark && s.darkInput, isDark && s.white]} placeholder="e.g. Broken streetlight" placeholderTextColor="#888" value={title} onChangeText={setTitle} />

      {/* Description */}
      <Text style={[s.label, isDark && s.white]}>Description</Text>
      <TextInput style={[s.input, s.textArea, isDark && s.darkInput, isDark && s.white]} placeholder="Describe the issue..." placeholderTextColor="#888" multiline numberOfLines={4} textAlignVertical="top" value={description} onChangeText={setDescription} />

      {/* Category */}
      <Text style={[s.label, isDark && s.white]}>Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catRow}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity key={cat} style={[s.catBtn, isDark && s.darkCatBtn, category === cat && s.catActive]} onPress={() => setCategory(cat)}>
            <Text style={[s.catText, category === cat && s.catTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Location */}
      <Text style={[s.label, isDark && s.white]}>Location</Text>
      <View style={s.locBtnRow}>
        <TouchableOpacity style={[s.locBtn, locMode === 'gps' && s.locActive]} onPress={handleGPS}>
          <Text style={[s.locBtnText, locMode === 'gps' && { color: '#ec4899' }]}>{locating ? 'Locating...' : '📍 Current'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.locBtn, locMode === 'type' && s.locActive]} onPress={() => setLocMode('type')}>
          <Text style={[s.locBtnText, locMode === 'type' && { color: '#ec4899' }]}>✏️ Type</Text>
        </TouchableOpacity>
      </View>
      {locMode === 'gps' && address ? (
        <View style={[s.gpsResult, isDark && { backgroundColor: 'rgba(34,197,94,0.1)' }]}>
          <Text style={{ color: '#22c55e', fontSize: 12, fontWeight: '600' }}>{address}</Text>
        </View>
      ) : null}
      {locMode === 'type' && (
        <TextInput style={[s.input, isDark && s.darkInput, isDark && s.white]} placeholder="Type your address..." placeholderTextColor="#888" value={address} onChangeText={setAddress} />
      )}

      {/* Submit */}
      <TouchableOpacity style={[s.submitBtn, isSubmitting && { opacity: 0.6 }]} onPress={handleSubmit} disabled={isSubmitting}>
        <Text style={s.submitText}>{isSubmitting ? 'Submitting...' : 'Submit Report'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  darkBg: { backgroundColor: '#000' },
  content: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 11, fontWeight: '800', color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, marginTop: 16 },
  white: { color: '#fff' },
  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 14, padding: 14, fontSize: 15, color: '#111' },
  darkInput: { backgroundColor: '#121212', borderColor: '#262626' },
  textArea: { minHeight: 100 },
  catRow: { gap: 8, paddingBottom: 8 },
  catBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb' },
  darkCatBtn: { backgroundColor: '#121212', borderColor: '#262626' },
  catActive: { backgroundColor: '#ec4899', borderColor: '#ec4899' },
  catText: { fontSize: 13, color: '#888', fontWeight: '700' },
  catTextActive: { color: '#fff' },
  locBtnRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  locBtn: { flex: 1, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' },
  locActive: { borderColor: '#ec4899', backgroundColor: 'rgba(236,72,153,0.1)' },
  locBtnText: { fontSize: 13, fontWeight: '700', color: '#888' },
  gpsResult: { backgroundColor: 'rgba(34,197,94,0.05)', padding: 12, borderRadius: 12, marginTop: 4 },
  submitBtn: { backgroundColor: '#ec4899', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '900' },
});
