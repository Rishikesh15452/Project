import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, useColorScheme, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

const STEPS = ['Reported', 'Forwarded', 'In Progress', 'Resolved'];

function getStepIndex(status: string, department?: string | null): number {
  if (status === 'Resolved') return 3;
  if (status === 'In Progress') return 2;
  if (department) return 1;
  return 0;
}

function getStatusMsg(step: number, dept?: string | null): string {
  if (step === 3) return 'Issue has been resolved ✓';
  if (step === 2) return 'Work is being carried out';
  if (step === 1) return `Forwarded to ${dept || 'concerned dept'}`;
  return 'Your report has been registered';
}

export default function DashboardScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const [issues, setIssues] = useState<any[]>([]);
  const [userName, setUserName] = useState('Citizen');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchIssues = async (uid: string) => {
    const { data } = await supabase.from('issues').select('*').eq('user_id', uid).order('created_at', { ascending: false });
    if (data) setIssues(data);
    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { router.replace('/login'); return; }
      const uid = session.user.id;
      setUserId(uid);
      const { data: profile } = await supabase.from('profiles').select('name').eq('id', uid).single();
      if (profile?.name) setUserName(profile.name);
      else if (session.user.user_metadata?.full_name) setUserName(session.user.user_metadata.full_name.split(' ')[0]);
      await fetchIssues(uid);
    };
    init();
  }, []);

  // Realtime
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel('citizen-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'issues', filter: `user_id=eq.${userId}` }, () => { fetchIssues(userId); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const renderItem = ({ item }: { item: any }) => {
    const step = getStepIndex(item.status, item.department);
    const msg = getStatusMsg(step, item.department);
    const date = new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

    return (
      <View style={[s.card, isDark && s.darkCard]}>
        {/* Title Row */}
        <View style={s.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[s.title, isDark && s.white]} numberOfLines={1}>{item.title}</Text>
            <Text style={s.meta}>{item.area || 'Local Area'} • {date}</Text>
          </View>
          <View style={[s.statusBadge, step === 3 ? s.greenBg : step >= 1 ? s.orangeBg : s.redBg]}>
            <Text style={s.statusText}>{item.status}</Text>
          </View>
        </View>

        {/* Image */}
        {item.image_urls?.[0] && (
          <Image source={{ uri: item.image_urls[0] }} style={s.image} />
        )}

        {/* Status Message */}
        <View style={s.msgRow}>
          <Text style={[s.msgText, step === 3 ? { color: '#22c55e' } : { color: '#ec4899' }]}>{msg}</Text>
          {step < 3 && <View style={s.pulseIndicator} />}
        </View>

        {/* ===== HORIZONTAL PROGRESS BAR ===== */}
        <View style={s.trackWrap}>
          {/* Background Track */}
          <View style={[s.trackBg, isDark && { backgroundColor: '#262626' }]} />
          {/* Fill */}
          <View style={[s.trackFill, { width: `${(step / 3) * 100}%` }, step === 3 && { backgroundColor: '#22c55e' }]} />
          {/* Dots */}
          <View style={s.dotsRow}>
            {STEPS.map((_, idx) => (
              <View key={idx} style={[
                s.dot,
                { borderColor: isDark ? '#121212' : '#fff' },
                idx <= step 
                  ? (step === 3 ? { backgroundColor: '#22c55e' } : { backgroundColor: '#ec4899' }) 
                  : { backgroundColor: isDark ? '#333' : '#d4d4d8' },
                idx === step && step < 3 && s.dotCurrent,
              ]} />
            ))}
          </View>
        </View>

        {/* Step Labels */}
        <View style={s.labelsRow}>
          {STEPS.map((label, idx) => (
            <View key={idx} style={s.labelWrap}>
              <Text style={[s.labelText, idx <= step ? (isDark ? s.white : { color: '#111' }) : { color: '#aaa' }]}>{label}</Text>
              {idx === 1 && item.department && (
                <Text style={s.deptText} numberOfLines={1}>{item.department}</Text>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={[s.container, isDark && s.darkBg]}>
      {/* Header */}
      <View style={s.headerSection}>
        <Text style={[s.greeting, isDark && s.white]}>Hi, <Text style={{ color: '#ec4899' }}>{userName}</Text></Text>
        <Text style={s.subGreeting}>{issues.length} total reports</Text>
      </View>

      {loading ? (
        <Text style={s.loadingText}>Loading...</Text>
      ) : issues.length === 0 ? (
        <View style={s.emptyWrap}>
          <Text style={s.emptyText}>No reports yet</Text>
          <TouchableOpacity style={s.reportBtn} onPress={() => router.push('/(tabs)/report')}>
            <Text style={s.reportBtnText}>Report an Issue</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList data={issues} keyExtractor={i => i.id} renderItem={renderItem} contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false} />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  darkBg: { backgroundColor: '#000' },
  headerSection: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  greeting: { fontSize: 24, fontWeight: '900', color: '#111' },
  white: { color: '#fff' },
  subGreeting: { fontSize: 12, color: '#888', marginTop: 2 },
  loadingText: { textAlign: 'center', marginTop: 40, color: '#888', fontWeight: '700' },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  emptyText: { color: '#888', fontWeight: '700' },
  reportBtn: { backgroundColor: '#ec4899', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  reportBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  card: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#f3f4f6' },
  darkCard: { backgroundColor: '#121212', borderColor: '#1a1a1a' },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', padding: 14, paddingBottom: 8 },
  title: { fontSize: 14, fontWeight: '800', color: '#111' },
  meta: { fontSize: 11, color: '#888', marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  redBg: { backgroundColor: 'rgba(239,68,68,0.1)' },
  orangeBg: { backgroundColor: 'rgba(249,115,22,0.1)' },
  greenBg: { backgroundColor: 'rgba(34,197,94,0.1)' },
  statusText: { fontSize: 10, fontWeight: '800', color: '#888', textTransform: 'uppercase' },
  image: { width: '100%', height: 180, backgroundColor: '#e5e7eb' },
  msgRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingTop: 10 },
  msgText: { fontSize: 13, fontWeight: '700' },
  pulseIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ec4899' },
  trackWrap: { height: 8, marginHorizontal: 14, marginTop: 12, position: 'relative', justifyContent: 'center' },
  trackBg: { position: 'absolute', left: 0, right: 0, height: 6, backgroundColor: '#e5e7eb', borderRadius: 3 },
  trackFill: { position: 'absolute', left: 0, height: 6, backgroundColor: '#ec4899', borderRadius: 3 },
  dotsRow: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 3 },
  dotCurrent: { width: 18, height: 18, borderRadius: 9, borderWidth: 3 },
  labelsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 6, paddingTop: 10, paddingBottom: 14 },
  labelWrap: { flex: 1, alignItems: 'center' },
  labelText: { fontSize: 10, fontWeight: '700', textAlign: 'center' },
  deptText: { fontSize: 9, color: '#ec4899', fontWeight: '600', marginTop: 1, textAlign: 'center' },
});
