import { StyleSheet, FlatList, Image, TouchableOpacity, View, Text, useColorScheme } from 'react-native';
import { SymbolView } from 'expo-symbols';

const MOCK_ISSUES = [
  { id: '1', title: 'Massive pothole on linking road', category: 'Potholes', status: 'Open', upvotes: 142, distance: '1.2 km', time: '2h ago', image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=400&h=300' },
  { id: '2', title: 'Garbage overflow near station', category: 'Waste', status: 'In Progress', upvotes: 89, distance: '0.8 km', time: '5h ago', image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=400&h=300' },
  { id: '3', title: 'Broken streetlight', category: 'Streetlights', status: 'Resolved', upvotes: 34, distance: '2.1 km', time: '1d ago', image: 'https://images.unsplash.com/photo-1519782414732-4752b0ea2a71?auto=format&fit=crop&q=80&w=400&h=300' }
];

export default function TabOneScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const renderItem = ({ item }: { item: typeof MOCK_ISSUES[0] }) => (
    <View style={[styles.card, isDark && styles.darkCard]}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
        <View style={styles.distanceBadge}>
          <Text style={styles.distanceText}>{item.distance}</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <Text style={[styles.title, isDark && styles.darkText]} numberOfLines={2}>{item.title}</Text>
        <Text style={[styles.description, isDark && styles.darkSubtext]} numberOfLines={2}>
          Reported by an anonymous citizen. Requires attention.
        </Text>
        
        <View style={[styles.footer, isDark && styles.darkFooter]}>
           <TouchableOpacity style={styles.upvoteBtn}>
             <SymbolView name="hand.thumbsup" size={16} tintColor={isDark ? '#9ca3af' : '#6b7280'} />
             <Text style={[styles.upvoteText, isDark && styles.darkSubtext]}>{item.upvotes}</Text>
           </TouchableOpacity>
           <TouchableOpacity>
             <Text style={styles.viewMoreText}>View Details</Text>
           </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      <FlatList 
        data={MOCK_ISSUES}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  darkContainer: {
    backgroundColor: '#000000',
  },
  list: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16
  },
  darkCard: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
  },
  imageContainer: {
    height: 180,
    position: 'relative',
    backgroundColor: '#e5e7eb',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  distanceBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  distanceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  category: {
    fontSize: 12,
    fontWeight: '700',
    color: '#22c55e',
    textTransform: 'uppercase',
  },
  time: {
    fontSize: 12,
    color: '#9ca3af',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  darkText: {
    color: '#f9fafb',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  darkSubtext: {
    color: '#9ca3af',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  darkFooter: {
    borderTopColor: '#27272a',
  },
  upvoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  upvoteText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f97316',
  }
});
