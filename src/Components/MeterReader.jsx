import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Button, 
  Image, 
  PermissionsAndroid, 
  Platform, 
  Alert, 
  TextInput, 
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import TextRecognition from '@react-native-ml-kit/text-recognition';

const MeterReader = () => {
  const [imageUri, setImageUri] = useState(null);
  const [reading, setReading] = useState('');
  const [editedReading, setEditedReading] = useState('');

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'This app needs access to your camera to take pictures.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const captureAndRead = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission denied', 'Camera permission is required.');
      return;
    }

    launchCamera(
      {
        mediaType: 'photo',
        quality: 1,
        saveToPhotos: false,
      },
      async response => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.error('ImagePicker Error: ', response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          const uri = response.assets[0].uri;
          setImageUri(uri);
          try {
            const result = await TextRecognition.recognize(uri);
            let candidate = null;
            const keywords = [
              'kwh',
              'm³',
              'meter',
              'reading',
              'consumption',
              'usage',
            ];

            // 1. Keyword search in structured lines
            if (result.blocks) {
              outer: for (const block of result.blocks) {
                for (const line of block.lines) {
                  const lineText = line.text.toLowerCase();
                  if (keywords.some(kw => lineText.includes(kw))) {
                    const match = line.text.match(
                      /(\d{1,5}[.,]\d{1,4}|\d{3,6})/,
                    );
                    if (match) {
                      candidate = match[0];
                      break outer;
                    }
                  }
                }
              }
            }

            // 2. Largest text fallback
            if (!candidate && result.blocks) {
              let maxArea = 0;
              for (const block of result.blocks) {
                for (const line of block.lines) {
                  const match = line.text.match(/(\d{1,5}[.,]\d{1,4}|\d{3,6})/);
                  if (match && line.frame) {
                    const area = line.frame.width * line.frame.height;
                    if (area > maxArea) {
                      maxArea = area;
                      candidate = match[0];
                    }
                  }
                }
              }
            }

            // 3. Full text fallback
            if (!candidate) {
              const fullTextMatch = result.text.match(
                /(\d{1,5}[.,]\d{1,4}|\d{3,6})/,
              );
              candidate = fullTextMatch ? fullTextMatch[0] : null;
            }

            // Final result handling
            if (candidate) {
              // Clean formatting
              const cleaned = candidate
                .replace(/,/g, '')
                .replace(/(\.\d*)\./, '$1');
              setReading(cleaned);
              setEditedReading(cleaned);
            } else {
              setReading('Reading not found');
              setEditedReading('');
            }
          } catch (err) {
            console.error('OCR error:', err);
            setReading('OCR Failed');
            setEditedReading('');
          }
        }
      },
    );
  };

  const handleSave = () => {
    if (editedReading) {
      setReading(editedReading);
      Alert.alert('Success', 'Reading saved successfully!');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Meter Reader</Text>
        
        <TouchableOpacity 
          style={styles.scanButton}
          onPress={captureAndRead}
        >
          <Text style={styles.buttonText}>Scan Meter</Text>
        </TouchableOpacity>
        
        {imageUri && (
          <Image 
            source={{ uri: imageUri }} 
            style={styles.image} 
            resizeMode="contain"
          />
        )}
        
        <View style={styles.resultContainer}>
          <Text style={styles.label}>Detected Reading:</Text>
          <Text style={styles.reading}>{reading || 'N/A'}</Text>
          
          <Text style={styles.label}>Edit Reading:</Text>
          <TextInput
            style={styles.input}
            value={editedReading}
            onChangeText={setEditedReading}
            keyboardType="numeric"
            placeholder="Enter reading manually"
          />
          
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSave}
            disabled={!editedReading}
          >
            <Text style={styles.saveButtonText}>Save Reading</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 30,
    textAlign: 'center',
  },
  scanButton: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginBottom: 25,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  image: {
    width: '90%',
    height: 300,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 25,
    backgroundColor: 'white',
  },
  resultContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  reading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 18,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  saveButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MeterReader;