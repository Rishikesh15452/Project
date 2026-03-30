import { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('+91');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleLogin = () => {
    // Determine target route based on email/phone pattern for demonstration
    // E.g., admin@civic.com or +910000000000 routes to admin panel
    if (email === 'admin@civic.com' || phone === '+910000000000') {
      router.replace('/(admin)');
    } else {
      router.replace('/(tabs)');
    }
  };

  const handlePhoneSubmit = () => {
    if (!otpSent) {
      setOtpSent(true); // Mock sending OTP
    } else {
      handleLogin(); // Mock verifying OTP
    }
  };

  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      {/* Dynamic Background Element */}
      <View style={[styles.orb, styles.orb1]} />
      <View style={[styles.orb, styles.orb2]} />

      <View style={styles.content}>
        <View style={styles.header}>
           <View style={styles.logoBadge}>
             <Text style={styles.logoLetter}>C</Text>
           </View>
           <Text style={[styles.title, isDark && styles.darkText]}>Welcome back</Text>
           <Text style={[styles.subtitle, isDark && styles.darkSubtext]}>Log in as a Citizen or Administrator</Text>
        </View>

        {/* Tab Toggle */}
        <View style={[styles.tabsContainer, isDark && styles.darkInput]}>
          <TouchableOpacity 
            style={[styles.tabBtn, loginMethod === 'email' && styles.activeTab, loginMethod === 'email' && isDark && styles.darkActiveTab]} 
            onPress={() => setLoginMethod('email')}
          >
            <Text style={[styles.tabText, loginMethod === 'email' ? styles.activeTabText : styles.inactiveTabText]}>Email</Text>
          </TouchableOpacity>
          <TouchableOpacity 
             style={[styles.tabBtn, loginMethod === 'phone' && styles.activeTab, loginMethod === 'phone' && isDark && styles.darkActiveTab]} 
             onPress={() => setLoginMethod('phone')}
          >
            <Text style={[styles.tabText, loginMethod === 'phone' ? styles.activeTabText : styles.inactiveTabText]}>Phone Login</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          {loginMethod === 'email' ? (
             <>
               <View style={styles.inputContainer}>
                 <SymbolView name="envelope.fill" size={20} tintColor={isDark ? '#9ca3af' : '#6b7280'} />
                 <TextInput 
                   style={[styles.input, isDark && styles.darkText]} 
                   placeholder="Email address"
                   placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                   value={email}
                   onChangeText={setEmail}
                   autoCapitalize="none"
                   keyboardType="email-address"
                 />
               </View>
               <View style={styles.inputContainer}>
                 <SymbolView name="lock.fill" size={20} tintColor={isDark ? '#9ca3af' : '#6b7280'} />
                 <TextInput 
                   style={[styles.input, isDark && styles.darkText]} 
                   placeholder="Password"
                   placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                   value={password}
                   onChangeText={setPassword}
                   secureTextEntry
                 />
               </View>
               <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
                 <Text style={styles.loginBtnText}>Sign In</Text>
                 <SymbolView name="arrow.right" size={20} tintColor="#fff" />
               </TouchableOpacity>
             </>
          ) : (
            <>
               <View style={styles.inputContainer}>
                 <SymbolView name="phone.fill" size={20} tintColor={isDark ? '#9ca3af' : '#6b7280'} />
                 <TextInput 
                   style={[styles.input, isDark && styles.darkText]} 
                   placeholder="Aadhar linked phone (e.g. +91 9999999999)"
                   placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                   value={phone}
                   onChangeText={setPhone}
                   keyboardType="phone-pad"
                   editable={!otpSent}
                 />
               </View>
               {otpSent && (
                 <View style={styles.inputContainer}>
                   <SymbolView name="lock.fill" size={20} tintColor={isDark ? '#9ca3af' : '#6b7280'} />
                   <TextInput 
                     style={[styles.input, isDark && styles.darkText]} 
                     placeholder="6-digit OTP"
                     placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                     value={otp}
                     onChangeText={setOtp}
                     keyboardType="number-pad"
                   />
                 </View>
               )}
               <TouchableOpacity style={styles.loginBtn} onPress={handlePhoneSubmit}>
                 <Text style={styles.loginBtnText}>{otpSent ? 'Verify OTP' : 'Send OTP'}</Text>
                 <SymbolView name="arrow.right" size={20} tintColor="#fff" />
               </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.socialAuth}>
          <Text style={[styles.orText, isDark && styles.darkSubtext]}>Or continue with</Text>
          <View style={styles.socialBtns}>
             <TouchableOpacity style={[styles.socialBtn, isDark && styles.darkCard]} onPress={() => handleLogin()}>
               <Text style={[styles.socialBtnText, isDark && styles.darkText]}>Google</Text>
             </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.guestBtn} onPress={() => router.replace('/(tabs)')}>
          <Text style={[styles.guestText, isDark && styles.darkSubtext]}>Continue as Guest</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', justifyContent: 'center', position: 'relative' },
  darkContainer: { backgroundColor: '#09090b' },
  orb: { position: 'absolute', width: 300, height: 300, borderRadius: 150, opacity: 0.15 },
  orb1: { top: -100, left: -100, backgroundColor: '#ea580c' },
  orb2: { bottom: -100, right: -100, backgroundColor: '#22c55e' },
  content: { padding: 32, zIndex: 10 },
  header: { alignItems: 'center', marginBottom: 32 },
  logoBadge: { width: 64, height: 64, borderRadius: 20, backgroundColor: '#ea580c', justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: '#ea580c', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 },
  logoLetter: { color: '#fff', fontSize: 32, fontWeight: '900' },
  title: { fontSize: 32, fontWeight: '800', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6b7280', textAlign: 'center' },
  tabsContainer: { flexDirection: 'row', backgroundColor: '#f9fafb', borderRadius: 16, padding: 4, marginBottom: 24 },
  tabBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  activeTab: { backgroundColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  darkActiveTab: { backgroundColor: '#27272a' },
  tabText: { fontSize: 14, fontWeight: '700' },
  activeTabText: { color: '#ea580c' },
  inactiveTabText: { color: '#6b7280' },
  form: { gap: 16, marginBottom: 32 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#f3f4f6', borderRadius: 16, paddingHorizontal: 16 },
  darkInput: { backgroundColor: '#18181b', borderColor: '#27272a' },
  input: { flex: 1, paddingVertical: 18, paddingHorizontal: 12, fontSize: 16, color: '#111827' },
  loginBtn: { backgroundColor: '#ea580c', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRadius: 16, gap: 8, marginTop: 8 },
  loginBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  socialAuth: { alignItems: 'center' },
  orText: { color: '#9ca3af', fontSize: 14, fontWeight: '500', marginBottom: 16 },
  socialBtns: { flexDirection: 'row', gap: 16, width: '100%' },
  socialBtn: { flex: 1, paddingVertical: 16, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' },
  darkCard: { backgroundColor: '#18181b', borderColor: '#27272a' },
  socialBtnText: { fontSize: 16, fontWeight: '600', color: '#111827' },
  guestBtn: { marginTop: 32, alignItems: 'center' },
  guestText: { color: '#6b7280', fontSize: 15, fontWeight: '600' },
  darkText: { color: '#f9fafb' },
  darkSubtext: { color: '#9ca3af' }
});
