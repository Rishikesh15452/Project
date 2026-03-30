import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, Alert, useColorScheme } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { useRouter } from 'expo-router';

const CATEGORIES = ["Potholes", "Waste", "Water", "Lights", "Other"];

export default function ReportScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [category, setCategory] = useState("Potholes");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!title) {
       Alert.alert("Missing Fields", "Please enter a title");
       return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert("Success!", "Issue reported successfully.", [
        { text: "OK", onPress: () => router.push('/') }
      ]);
    }, 1500);
  };

  return (
    <ScrollView style={[styles.container, isDark && styles.darkContainer]} automaticallyAdjustKeyboardInsets>
      <View style={styles.form}>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, isDark && styles.darkText]}>Issue Title</Text>
          <TextInput 
            style={[styles.input, isDark && styles.darkInput, isDark && styles.darkText]} 
            placeholder="e.g. Broken streetlight"
            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, isDark && styles.darkText]}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity 
                key={cat} 
                style={[
                  styles.categoryBtn, 
                  isDark && styles.darkCategoryBtn,
                  category === cat && styles.categoryBtnActive
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[
                  styles.categoryText, 
                  isDark && styles.darkCategoryText,
                  category === cat && styles.categoryTextActive
                ]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, isDark && styles.darkText]}>Location</Text>
          <View style={styles.locationContainer}>
             <TextInput 
               style={[styles.input, isDark && styles.darkInput, isDark && styles.darkText, { flex: 1, marginBottom: 0 }]} 
               placeholder="GPS Auto-detecting..."
               placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
               editable={false}
               value="19.0760° N, 72.8777° E (Draft)"
             />
             <TouchableOpacity style={styles.locationBtn}>
               <SymbolView name="location.fill" size={20} tintColor="#fff" />
             </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, isDark && styles.darkText]}>Description</Text>
          <TextInput 
             style={[styles.input, styles.textArea, isDark && styles.darkInput, isDark && styles.darkText]} 
             placeholder="Provide more details..."
             placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
             multiline
             numberOfLines={4}
             textAlignVertical="top"
             value={description}
             onChangeText={setDescription}
          />
        </View>

        <View style={styles.inputGroup}>
           <Text style={[styles.label, isDark && styles.darkText]}>Photos</Text>
           <TouchableOpacity style={[styles.photoUpload, isDark && styles.darkPhotoUpload]}>
              <SymbolView name="camera.fill" size={32} tintColor={isDark ? '#6b7280' : '#9ca3af'} />
              <Text style={styles.photoText}>Tap to add photos</Text>
           </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]} 
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitBtnText}>
             {isSubmitting ? "Submitting..." : "Submit Report"}
          </Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  darkContainer: {
    backgroundColor: '#000',
  },
  form: {
    padding: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  darkText: {
    color: '#f9fafb',
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
  },
  darkInput: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  textArea: {
    minHeight: 120,
  },
  categoryList: {
    gap: 8,
  },
  categoryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 8,
  },
  darkCategoryBtn: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  categoryBtnActive: {
    backgroundColor: '#ea580c', // Saffron primary
    borderColor: '#ea580c',
  },
  categoryText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '600',
  },
  darkCategoryText: {
    color: '#a1a1aa',
  },
  categoryTextActive: {
    color: '#fff',
  },
  locationContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  locationBtn: {
    backgroundColor: '#16a34a', // Green secondary
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoUpload: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f9fafb',
  },
  darkPhotoUpload: {
    backgroundColor: '#09090b',
    borderColor: '#27272a',
  },
  photoText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  submitBtn: {
    backgroundColor: '#ea580c',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  }
});
