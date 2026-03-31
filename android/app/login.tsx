import { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, Alert, useColorScheme, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const [activeRole, setActiveRole] = useState<'citizen' | 'admin'>('citizen');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) { Alert.alert('Error', 'Please fill all fields'); return; }
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        Alert.alert('Success', 'Account created! You can now log in.');
        setIsSignUp(false);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        if (activeRole === 'admin') {
          const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
          if (profile?.role !== 'admin') {
            Alert.alert('Access Denied', 'You are not an admin.');
            await supabase.auth.signOut();
            setLoading(false);
            return;
          }
        }
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Authentication failed');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={[s.container, isDark && s.darkBg]} contentContainerStyle={s.content}>
        
        {/* Logo */}
        <View style={s.logoWrap}>
          <Image source={require('../assets/images/icon.png')} style={s.logo} />
        </View>

        <Text style={[s.title, isDark && s.white]}>Welcome to Loksetu</Text>
        <Text style={s.subtitle}>Report & track civic issues</Text>

        {/* Role Toggle */}
        <View style={[s.toggleRow, isDark && s.darkCard]}>
          <TouchableOpacity style={[s.toggleBtn, activeRole === 'citizen' && s.toggleActive]} onPress={() => setActiveRole('citizen')}>
            <Text style={[s.toggleText, activeRole === 'citizen' && s.toggleTextActive]}>Citizen</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.toggleBtn, activeRole === 'admin' && s.toggleActive]} onPress={() => setActiveRole('admin')}>
            <Text style={[s.toggleText, activeRole === 'admin' && s.toggleTextActive]}>Official</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={s.form}>
          <TextInput
            style={[s.input, isDark && s.darkInput, isDark && s.white]}
            placeholder="Email address"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={[s.input, isDark && s.darkInput, isDark && s.white]}
            placeholder="Password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={[s.submitBtn, loading && { opacity: 0.6 }]} onPress={handleAuth} disabled={loading}>
            <Text style={s.submitText}>{loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} style={s.switchBtn}>
            <Text style={s.switchText}>
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  darkBg: { backgroundColor: '#000' },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingBottom: 40 },
  logoWrap: { alignItems: 'center', marginBottom: 20 },
  logo: { width: 80, height: 80, borderRadius: 20 },
  title: { fontSize: 26, fontWeight: '900', textAlign: 'center', color: '#111' },
  white: { color: '#fff' },
  subtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginTop: 4, marginBottom: 24 },
  toggleRow: { flexDirection: 'row', backgroundColor: '#f3f4f6', borderRadius: 16, padding: 4, marginBottom: 24 },
  darkCard: { backgroundColor: '#1a1a1a' },
  toggleBtn: { flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: 'center' },
  toggleActive: { backgroundColor: '#111' },
  toggleText: { fontSize: 14, fontWeight: '700', color: '#888' },
  toggleTextActive: { color: '#fff' },
  form: { gap: 14 },
  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 14, padding: 16, fontSize: 16, color: '#111' },
  darkInput: { backgroundColor: '#121212', borderColor: '#262626' },
  submitBtn: { backgroundColor: '#111', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  switchBtn: { alignItems: 'center', marginTop: 16 },
  switchText: { color: '#888', fontSize: 13 },
});
