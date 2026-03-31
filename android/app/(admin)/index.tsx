import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, useColorScheme, Alert, ScrollView, Modal, Image, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

const DEPARTMENTS = [
  { value: 'Electricity', label: '⚡ Electricity' },
  { value: 'Municipality', label: '🏛️ Municipality' },
  { value: 'Water & Sewage', label: '💧 Water & Sewage' },
  { value: 'Roads & Highways', label: '📍 Roads & Highways' },
  { value: 'Waste Management', label: '🗑️ Waste Mgmt' },
  { value: 'Police / Law', label: '🛡️ Police / Law' },
];

export default function AdminScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewIssue, setViewIssue] = useState<any>(null);
  const [forwardingId, setForwardingId] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace('/login'); return; }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      if (profile?.role !== 'admin') { router.replace('/(tabs)'); return; }
      await fetchIssues();
    };
    check();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('admin-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'issues' }, () => { fetchIssues(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchIssues = async () => {
    setLoading(true);
    const { data } = await supabase.from('issues').select('*').order('created_at', { ascending: false });
    if (data) setIssues(data);
    setLoading(false);
  };

  const handleUpdate = async (id: string, updates: any) => {
    if (updates.department) {
      const issue = issues.find(i => i.id === id);
      if (issue?.status === 'Open') updates.status = 'In Progress';
    }
    await supabase.from('issues').update(updates).eq('id', id);
    await fetchIssues();
    setForwardingId(null);
  };

  const openMap = (lat: number, lng: number) => {
    Linking.openURL(`https://www.google.com/maps?q=${lat},${lng}`);
  };

  const stats = {
    total: issues.length,
    open: issues.filter(i => i.status === 'Open').length,
    progress: issues.filter(i => i.status === 'In Progress').length,
    resolved: issues.filter(i => i.status === 'Resolved').length,
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={[s.card, isDark && s.darkCard]}>
      <View style={s.row}>
        {item.image_urls?.[0] ? (
          <Image source={{ uri: item.image_urls[0] }} style={s.thumb} />
        ) : (
          <View style={[s.thumb, { backgroundColor: isDark ? '#1a1a1a' : '#f3f4f6', justifyContent: 'center', alignItems: 'center' }]}>
            <Text>📋</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={[s.itemTitle, isDark && s.white]} numberOfLines={1}>{item.title}</Text>
          <Text style={s.itemMeta}>{item.category} • {item.area || 'Unknown'}</Text>
          <Text style={s.reporter}>👤 {item.reporter_name || 'Anonymous'}</Text>
          {item.department && <Text style={s.deptBadge}>→ {item.department}</Text>}
        </View>
        <View style={s.actions}>
          <TouchableOpacity style={s.viewBtn} onPress={() => setViewIssue(item)}>
            <Text style={s.viewBtnText}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.fwdBtn} onPress={() => setForwardingId(forwardingId === item.id ? null : item.id)}>
            <Text style={s.fwdBtnText}>Fwd</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Forwarding Panel */}
      {forwardingId === item.id && (
        <View style={[s.fwdPanel, isDark && { borderTopColor: '#1a1a1a' }]}>
          <Text style={s.fwdLabel}>Forward to Department</Text>
          <View style={s.deptGrid}>
            {DEPARTMENTS.map(d => (
              <TouchableOpacity key={d.value} style={[s.deptBtn, isDark && { backgroundColor: '#0a0a0a', borderColor: '#1a1a1a' }, item.department === d.value && s.deptActive]}
                onPress={() => handleUpdate(item.id, { department: d.value })}>
                <Text style={[s.deptBtnText, item.department === d.value && { color: '#fff' }]}>{d.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={[s.container, isDark && s.darkBg]}>
      {/* Stats */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.statsRow}>
        {[
          { label: 'Total', val: stats.total, color: '#111' },
          { label: 'Open', val: stats.open, color: '#ef4444' },
          { label: 'Progress', val: stats.progress, color: '#f97316' },
          { label: 'Resolved', val: stats.resolved, color: '#22c55e' },
        ].map(st => (
          <View key={st.label} style={[s.statCard, isDark && s.darkCard]}>
            <Text style={[s.statVal, { color: st.color }, isDark && st.label === 'Total' && s.white]}>{st.val}</Text>
            <Text style={s.statLabel}>{st.label}</Text>
          </View>
        ))}
      </ScrollView>

      {/* List */}
      {loading ? (
        <Text style={s.loadText}>Loading...</Text>
      ) : (
        <FlatList data={issues} keyExtractor={i => i.id} renderItem={renderItem} contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }} />
      )}

      {/* View Modal */}
      <Modal visible={!!viewIssue} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={[s.modal, isDark && { backgroundColor: '#121212' }]}>
            <ScrollView>
              {viewIssue?.image_urls?.[0] && <Image source={{ uri: viewIssue.image_urls[0] }} style={s.modalImg} />}
              <View style={{ padding: 20 }}>
                <Text style={[s.modalTitle, isDark && s.white]}>{viewIssue?.title}</Text>
                <Text style={s.modalDesc}>{viewIssue?.description || 'No description.'}</Text>

                <View style={[s.infoRow, isDark && { backgroundColor: '#0a0a0a' }]}>
                  <Text style={s.infoLabel}>Reporter</Text>
                  <Text style={[s.infoVal, isDark && s.white]}>{viewIssue?.reporter_name || 'Anonymous'}</Text>
                </View>
                <View style={[s.infoRow, isDark && { backgroundColor: '#0a0a0a' }]}>
                  <Text style={s.infoLabel}>Status</Text>
                  <Text style={[s.infoVal, isDark && s.white]}>{viewIssue?.status}</Text>
                </View>
                <View style={[s.infoRow, isDark && { backgroundColor: '#0a0a0a' }]}>
                  <Text style={s.infoLabel}>Department</Text>
                  <Text style={[s.infoVal, isDark && s.white]}>{viewIssue?.department || 'Not assigned'}</Text>
                </View>

                {viewIssue?.latitude && viewIssue?.longitude && (
                  <TouchableOpacity style={s.mapBtn} onPress={() => openMap(viewIssue.latitude, viewIssue.longitude)}>
                    <Text style={s.mapBtnText}>📍 View on Google Maps</Text>
                  </TouchableOpacity>
                )}

                <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                  <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#ec4899' }]} onPress={() => { setForwardingId(viewIssue?.id); setViewIssue(null); }}>
                    <Text style={s.actionBtnText}>Forward</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#22c55e' }]} onPress={() => { handleUpdate(viewIssue?.id, { status: 'Resolved' }); setViewIssue(null); }}>
                    <Text style={s.actionBtnText}>Resolve</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={s.closeBtn} onPress={() => setViewIssue(null)}>
                  <Text style={s.closeBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  darkBg: { backgroundColor: '#000' },
  white: { color: '#fff' },
  statsRow: { padding: 16, gap: 10 },
  statCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, width: 100, borderWidth: 1, borderColor: '#f3f4f6' },
  darkCard: { backgroundColor: '#121212', borderColor: '#1a1a1a' },
  statVal: { fontSize: 28, fontWeight: '900' },
  statLabel: { fontSize: 10, fontWeight: '700', color: '#888', textTransform: 'uppercase', marginTop: 4, letterSpacing: 1 },
  loadText: { textAlign: 'center', marginTop: 40, color: '#888', fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  thumb: { width: 48, height: 48, borderRadius: 12, overflow: 'hidden' },
  itemTitle: { fontSize: 13, fontWeight: '800', color: '#111' },
  itemMeta: { fontSize: 11, color: '#888', marginTop: 1 },
  reporter: { fontSize: 10, color: '#888', marginTop: 2 },
  deptBadge: { fontSize: 10, color: '#ec4899', fontWeight: '700', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 6 },
  viewBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#f3f4f6' },
  viewBtnText: { fontSize: 11, fontWeight: '800', color: '#111' },
  fwdBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#ec4899' },
  fwdBtnText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  fwdPanel: { padding: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  fwdLabel: { fontSize: 10, fontWeight: '800', color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  deptGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  deptBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb' },
  deptActive: { backgroundColor: '#ec4899', borderColor: '#ec4899' },
  deptBtnText: { fontSize: 12, fontWeight: '700', color: '#555' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  modalImg: { width: '100%', height: 200 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#111', marginBottom: 4 },
  modalDesc: { fontSize: 13, color: '#888', lineHeight: 20, marginBottom: 16 },
  infoRow: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 12, marginBottom: 8 },
  infoLabel: { fontSize: 9, fontWeight: '800', color: '#888', textTransform: 'uppercase', letterSpacing: 1 },
  infoVal: { fontSize: 14, fontWeight: '700', color: '#111', marginTop: 2 },
  mapBtn: { backgroundColor: '#f3f4f6', borderRadius: 14, padding: 14, alignItems: 'center', marginTop: 8 },
  mapBtnText: { fontSize: 13, fontWeight: '700', color: '#111' },
  actionBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  actionBtnText: { fontSize: 14, fontWeight: '900', color: '#fff' },
  closeBtn: { marginTop: 12, alignItems: 'center', padding: 14 },
  closeBtnText: { fontSize: 14, fontWeight: '700', color: '#888' },
});
