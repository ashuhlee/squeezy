
import * as MediaLibrary from 'expo-media-library'
import * as ImagePicker from 'expo-image-picker'

import { useEffect, useState, useRef } from 'react'
import { View, StyleSheet, Platform } from 'react-native'
import { captureRef } from 'react-native-view-shot'

import Button from '@/components/Button'
import ImageViewer from '@/components/ImageViewer'
import CircleButton from '@/components/CircleButton'

import domtoimage from 'dom-to-image'

const PlaceholderImage = require('@/assets/images/background-image.png');

export default function Index() {
	const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
	const [imageFilename, setImageFilename] = useState<string | undefined>(undefined);

	const [showAppOptions, setShowAppOptions] = useState<boolean>(false);

	const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
	const imageRef = useRef<View>(null);

	useEffect(() => {
		if (permissionResponse && !permissionResponse?.granted) {
			requestPermission();
		}
	}, [])

	const selectImage = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ['images'],
			allowsEditing: true,
			quality: 1
		})
		if (!result.canceled) {
			setSelectedImage(result.assets[0].uri);
			setImageFilename(result.assets[0].fileName ?? undefined);
			setShowAppOptions(true);
		} else {
			alert('You did not select any image.');
		}
	}

	const onReset = (): void => {
		setShowAppOptions(false);
	}

	const saveImage = async (uri: string, filename: string) => {
		if (Platform.OS === 'web') {
			const link = document.createElement('a');
			link.href = uri;
			link.download = filename;
			link.click();
		} else {
			await MediaLibrary.createAssetAsync(uri);
			alert('saved!');
		}
	}

	const onSaveImage = async (): Promise<void> => {
		const filename = imageFilename
			? `${imageFilename.split('.')[0]}-compressed.jpg`
			: 'image-compressed.jpg';

		if (Platform.OS === 'web') {
			const localUri = await domtoimage.toJpeg(imageRef.current);
			await saveImage(localUri, filename);
		}
		else {
			const localUri = await captureRef(imageRef, {quality: 1});
			await saveImage(localUri, filename);
		}
	}

	return (
		<View style={styles.container}>
			<View style={styles.imageContainer}>
				<View ref={imageRef} collapsable={false}>
					<ImageViewer imgSource={PlaceholderImage} selectedImage={selectedImage}/>
				</View>

			</View>
			{showAppOptions ? (
				<View style={styles.optionsContainer}>
					<View style={styles.optionsRow}>
						<CircleButton icon="refresh" onPress={onReset}/>
						<CircleButton icon="save-alt" onPress={onSaveImage}/>
					</View>
				</View>
			) : (
				<View style={styles.footerContainer}>
					<Button theme='primary' label='Choose a photo' onPress={selectImage}/>
					<Button label='Use this photo' onPress={() => {
						setShowAppOptions(true);
					}}/>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#25292e',
		alignItems: 'center',
	},
	imageContainer: {
		flex: 1
	},
	footerContainer: {
		flex: 1 / 3,
		alignItems: 'center'
	},
	optionsContainer: {
		position: 'absolute',
		bottom: 80
	},
	optionsRow: {
		alignItems: 'center',
		flexDirection: 'row'
	}
})