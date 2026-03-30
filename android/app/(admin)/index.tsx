import { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';

// Mock issues data for Android Demo 
const INITIAL_ISSUES = [
  { id: '1', title: 'Massive pothole on linking road', category: 'Potholes', area: 'Bandra West', status: 'Open', department: '' },
  { id: '2', title: 'Garbage overflow near station', category: 'Waste', area: 'Andheri East', status: 'In Progress', department: 'Waste Management' },
  { id: '3', title: 'Broken streetlight', category: 'Streetlights', area: 'Colaba', status: 'Resolved', department: 'Electricity' },
];

export default function AdminScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  
  const [issues, setIssues] = useState(INITIAL_ISSUES);

  const stats = {
    total: issues.length,
    open: issues.filter(i => i.status === 'Open').length,
    resolved: issues.filter(i => i.status === 'Resolved').length,
  };

  const cycleStatus = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Open' ? 'In Progress' : currentStatus === 'In Progress' ? 'Resolved' : 'Open';
    setIssues(issues.map(iss => iss.id === id ? { ...iss, status: nextStatus } : iss));
  };

  const handleLogout = () => {
    router.replace('/login');
  };

  return (
    <ScrollView style={[styles.container, isDark && styles.darkContainer]} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={[styles.pageTitle, isDark && styles.darkText]}>Overview</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
         <View style={[styles.statCard, isDark && styles.darkCard]}>
           <Text style={styles.statLabel}>Total Reports</Text>
           <Text style={[styles.statValue, isDark && styles.darkText]}>{stats.total}</Text>
         </View>
         <View style={[styles.statCard, isDark && styles.darkCard]}>
           <Text style={styles.statLabel}>Open</Text>
           <Text style={[styles.statValue, { color: '#ef4444' }]}>{stats.open}</Text>
         </View>
         <View style={[styles.statCard, isDark && styles.darkCard]}>
           <Text style={styles.statLabel}>Resolved</Text>
           <Text style={[styles.statValue, { color: '#22c55e' }]}>{stats.resolved}</Text>
         </View>
      </View>

      <Text style={[styles.pageTitle, isDark && styles.darkText, { marginTop: 32 }]}>Manage Issues</Text>
      
      {issues.map(iss => (
        <View key={iss.id} style={[styles.issueCard, isDark && styles.darkCard]}>
          <View style={styles.issueHeader}>
            <Text style={[styles.issueTitle, isDark && styles.darkText]}>{iss.title}</Text>
            <TouchableOpacity 
              style={[
                styles.statusBadge, 
                iss.status === 'Open' ? styles.statusOpen : iss.status === 'In Progress' ? styles.statusProgress : styles.statusResolved
              ]}
              onPress={() => cycleStatus(iss.id, iss.status)}
            >
              <Text style={[
                styles.statusText,
                iss.status === 'Open' ? styles.statusTextOpen : iss.status === 'In Progress' ? styles.statusTextProgress : styles.statusTextResolved
              ]}>{iss.status}</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.issueContext}>
            {iss.category} • {iss.area}
          </Text>

          <View style={styles.footerRow}>
             <View style={styles.deptBadge}>
               <SymbolView name="briefcase.fill" size={14} tintColor="#6b7280" />
               <Text style={styles.deptText}>{iss.department || 'Unassigned'}</Text>
             </View>
             <TouchableOpacity style={styles.forwardBtn}>
               <Text style={styles.forwardText}>Forward</Text>
             </TouchableOpacity>
          </View>
        </View>
      ))}
      <View style={{height: 40}} /> 
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  darkContainer: { backgroundColor: '#09090b' },
  content: { padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  pageTitle: { fontSize: 24, fontWeight: '800', color: '#111827' },
  logoutBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#fee2e2', borderRadius: 8 },
  logoutText: { color: '#ef4444', fontWeight: 'bold', fontSize: 13 },
  statsGrid: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, padding: 16, backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6' },
  darkCard: { backgroundColor: '#18181b', borderColor: '#27272a' },
  statLabel: { fontSize: 12, color: '#6b7280', fontWeight: '600', marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: '900', color: '#111827' },
  darkText: { color: '#f9fafb' },
  issueCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginTop: 12, borderWidth: 1, borderColor: '#f3f4f6' },
  issueHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  issueTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: '#111827', marginRight: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusOpen: { backgroundColor: '#fee2e2' },
  statusProgress: { backgroundColor: '#ffedd5' },
  statusResolved: { backgroundColor: '#dcfce3' },
  statusText: { fontSize: 12, fontWeight: '700' },
  statusTextOpen: { color: '#ef4444' },
  statusTextProgress: { color: '#ea580c' },
  statusTextResolved: { color: '#22c55e' },
  issueContext: { fontSize: 13, color: '#6b7280', marginBottom: 16 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 12 },
  deptBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f3f4f6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  deptText: { fontSize: 13, color: '#4b5563', fontWeight: '500' },
  forwardBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#22c55e20' },
  forwardText: { color: '#22c55e', fontWeight: '700', fontSize: 13 }
});
