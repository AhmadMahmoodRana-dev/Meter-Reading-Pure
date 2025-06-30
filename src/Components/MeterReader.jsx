// import React, { useState } from 'react';
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   Button, 
//   Image, 
//   PermissionsAndroid, 
//   Platform, 
//   Alert, 
//   TextInput, 
//   TouchableOpacity,
//   KeyboardAvoidingView,
//   ScrollView
// } from 'react-native';
// import { launchCamera } from 'react-native-image-picker';
// import TextRecognition from '@react-native-ml-kit/text-recognition';

// const MeterReader = () => {
//   const [imageUri, setImageUri] = useState(null);
//   const [reading, setReading] = useState('');
//   const [editedReading, setEditedReading] = useState('');

//   const requestCameraPermission = async () => {
//     if (Platform.OS === 'android') {
//       const granted = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.CAMERA,
//         {
//           title: 'Camera Permission',
//           message: 'This app needs access to your camera to take pictures.',
//           buttonNeutral: 'Ask Me Later',
//           buttonNegative: 'Cancel',
//           buttonPositive: 'OK',
//         },
//       );
//       return granted === PermissionsAndroid.RESULTS.GRANTED;
//     }
//     return true;
//   };

//   const captureAndRead = async () => {
//     const hasPermission = await requestCameraPermission();
//     if (!hasPermission) {
//       Alert.alert('Permission denied', 'Camera permission is required.');
//       return;
//     }

//     launchCamera(
//       {
//         mediaType: 'photo',
//         quality: 1,
//         saveToPhotos: false,
//       },
//       async response => {
//         if (response.didCancel) {
//           console.log('User cancelled image picker');
//         } else if (response.errorCode) {
//           console.error('ImagePicker Error: ', response.errorMessage);
//         } else if (response.assets && response.assets.length > 0) {
//           const uri = response.assets[0].uri;
//           setImageUri(uri);
//           try {
//             const result = await TextRecognition.recognize(uri);
//             let candidate = null;
//             const keywords = [
//               'kwh',
//               'm³',
//               'meter',
//               'reading',
//               'consumption',
//               'usage',
//             ];

//             // 1. Keyword search in structured lines
//             if (result.blocks) {
//               outer: for (const block of result.blocks) {
//                 for (const line of block.lines) {
//                   const lineText = line.text.toLowerCase();
//                   if (keywords.some(kw => lineText.includes(kw))) {
//                     const match = line.text.match(
//                       /(\d{1,5}[.,]\d{1,4}|\d{3,6})/,
//                     );
//                     if (match) {
//                       candidate = match[0];
//                       break outer;
//                     }
//                   }
//                 }
//               }
//             }

//             // 2. Largest text fallback
//             if (!candidate && result.blocks) {
//               let maxArea = 0;
//               for (const block of result.blocks) {
//                 for (const line of block.lines) {
//                   const match = line.text.match(/(\d{1,5}[.,]\d{1,4}|\d{3,6})/);
//                   if (match && line.frame) {
//                     const area = line.frame.width * line.frame.height;
//                     if (area > maxArea) {
//                       maxArea = area;
//                       candidate = match[0];
//                     }
//                   }
//                 }
//               }
//             }

//             // 3. Full text fallback
//             if (!candidate) {
//               const fullTextMatch = result.text.match(
//                 /(\d{1,5}[.,]\d{1,4}|\d{3,6})/,
//               );
//               candidate = fullTextMatch ? fullTextMatch[0] : null;
//             }

//             // Final result handling
//             if (candidate) {
//               // Clean formatting
//               const cleaned = candidate
//                 .replace(/,/g, '')
//                 .replace(/(\.\d*)\./, '$1');
//               setReading(cleaned);
//               setEditedReading(cleaned);
//             } else {
//               setReading('Reading not found');
//               setEditedReading('');
//             }
//           } catch (err) {
//             console.error('OCR error:', err);
//             setReading('OCR Failed');
//             setEditedReading('');
//           }
//         }
//       },
//     );
//   };

//   const handleSave = () => {
//     if (editedReading) {
//       setReading(editedReading);
//       Alert.alert('Success', 'Reading saved successfully!');
//     }
//   };

//   return (
//     <KeyboardAvoidingView 
//       style={styles.container}
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//     >
//       <ScrollView contentContainerStyle={styles.scrollContainer}>
//         <Text style={styles.title}>Meter Reader</Text>
        
//         <TouchableOpacity 
//           style={styles.scanButton}
//           onPress={captureAndRead}
//         >
//           <Text style={styles.buttonText}>Scan Meter</Text>
//         </TouchableOpacity>
        
//         {imageUri && (
//           <Image 
//             source={{ uri: imageUri }} 
//             style={styles.image} 
//             resizeMode="contain"
//           />
//         )}
        
//         <View style={styles.resultContainer}>
//           <Text style={styles.label}>Detected Reading:</Text>
//           <Text style={styles.reading}>{reading || 'N/A'}</Text>
          
//           <Text style={styles.label}>Edit Reading:</Text>
//           <TextInput
//             style={styles.input}
//             value={editedReading}
//             onChangeText={setEditedReading}
//             keyboardType="numeric"
//             placeholder="Enter reading manually"
//           />
          
//           <TouchableOpacity 
//             style={styles.saveButton}
//             onPress={handleSave}
//             disabled={!editedReading}
//           >
//             <Text style={styles.saveButtonText}>Save Reading</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f0f8ff',
//   },
//   scrollContainer: {
//     flexGrow: 1,
//     padding: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#2c3e50',
//     marginBottom: 30,
//     textAlign: 'center',
//   },
//   scanButton: {
//     backgroundColor: '#3498db',
//     paddingVertical: 15,
//     paddingHorizontal: 40,
//     borderRadius: 30,
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     marginBottom: 25,
//   },
//   buttonText: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   image: {
//     width: '90%',
//     height: 300,
//     borderRadius: 15,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     marginBottom: 25,
//     backgroundColor: 'white',
//   },
//   resultContainer: {
//     width: '90%',
//     backgroundColor: 'white',
//     borderRadius: 15,
//     padding: 20,
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   label: {
//     fontSize: 16,
//     color: '#7f8c8d',
//     marginBottom: 5,
//   },
//   reading: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     color: '#27ae60',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 10,
//     padding: 15,
//     fontSize: 18,
//     marginBottom: 20,
//     backgroundColor: '#f9f9f9',
//   },
//   saveButton: {
//     backgroundColor: '#27ae60',
//     paddingVertical: 15,
//     borderRadius: 10,
//     alignItems: 'center',
//   },
//   saveButtonText: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
// });

// export default MeterReader;


import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  PermissionsAndroid, 
  Platform, 
  Alert, 
  TextInput, 
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import Icon from 'react-native-vector-icons/MaterialIcons';

const MeterReader = () => {
  const [imageUri, setImageUri] = useState(null);
  const [reading, setReading] = useState('');
  const [editedReading, setEditedReading] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);

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
    setIsLoading(true);
    setSaved(false);
    
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission denied', 'Camera permission is required.');
      setIsLoading(false);
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
          setIsLoading(false);
        } else if (response.errorCode) {
          console.error('ImagePicker Error: ', response.errorMessage);
          setIsLoading(false);
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
              // Clean formatting (commas, multiple decimals)
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
          } finally {
            setIsLoading(false);
          }
        }
      },
    );
  };

  const handleSave = () => {
    if (editedReading) {
      // Show success message
      setSaved(true);
      
      // Reset all fields after 1.5 seconds
      setTimeout(() => {
        setImageUri(null);
        setReading('');
        setEditedReading('');
        setSaved(false);
      }, 1500);
    }
  };

  const resetAll = () => {
    setImageUri(null);
    setReading('');
    setEditedReading('');
    setSaved(false);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>MeterScan Pro</Text>
        
        {!imageUri && !isLoading && (
          <View style={styles.instructions}>
            <Icon name="info" size={20} color="#3498db" style={styles.infoIcon} />
            <Text style={styles.instructionsText}>
              Position the meter clearly in frame. Ensure good lighting for best results.
            </Text>
          </View>
        )}

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text style={styles.loadingText}>Processing image...</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.scanButton}
            onPress={captureAndRead}
            disabled={isLoading}
          >
            <Icon name="camera-alt" size={24} color="white" />
            <Text style={styles.buttonText}>Scan Meter</Text>
          </TouchableOpacity>
        )}

        {imageUri && (
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: imageUri }} 
              style={styles.image} 
              resizeMode="contain"
            />
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={resetAll}
            >
              <Icon name="close" size={20} color="white" />
            </TouchableOpacity>
          </View>
        )}
        
        {(reading || editedReading) && (
          <View style={styles.resultContainer}>
            <View style={styles.resultRow}>
              <Text style={styles.label}>Detected Reading:</Text>
              <Text style={styles.reading}>{reading || 'N/A'}</Text>
            </View>
            
            <Text style={styles.label}>Edit Reading:</Text>
            <TextInput
              style={styles.input}
              value={editedReading}
              onChangeText={setEditedReading}
              keyboardType="decimal-pad"
              placeholder="Enter reading manually"
              placeholderTextColor="#95a5a6"
            />
            
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.resetButton]}
                onPress={resetAll}
              >
                <Text style={styles.actionButtonText}>Reset</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.saveButton]}
                onPress={handleSave}
                disabled={!editedReading}
              >
                {saved ? (
                  <Icon name="check" size={20} color="white" />
                ) : (
                  <Text style={styles.actionButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {saved && (
          <View style={styles.successMessage}>
            <Icon name="check-circle" size={24} color="#27ae60" />
            <Text style={styles.successText}>
              Saved {editedReading} successfully!
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 25,
    paddingTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  instructions: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e1f0fa',
    padding: 12,
    borderRadius: 10,
    marginBottom: 25,
    width: '100%',
  },
  infoIcon: {
    marginRight: 10,
  },
  instructionsText: {
    fontSize: 14,
    color: '#3498db',
    flex: 1,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498db',
    paddingVertical: 16,
    paddingHorizontal: 35,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    marginBottom: 25,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#3498db',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    marginBottom: 25,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 280,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  resultRow: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 8,
    fontWeight: '500',
  },
  reading: {
    fontSize: 34,
    fontWeight: '700',
    color: '#27ae60',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    marginBottom: 25,
    backgroundColor: '#f9f9f9',
    color: '#2c3e50',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButton: {
    backgroundColor: '#e74c3c',
  },
  saveButton: {
    backgroundColor: '#27ae60',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d5f5e3',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  successText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#27ae60',
    fontWeight: '500',
  },
});

export default MeterReader;