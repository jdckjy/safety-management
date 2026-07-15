
import { collection, writeBatch, doc } from 'firebase/firestore';
import { db } from '../src/firebase';
import { initialComplexFacilities } from '../src/data/initial-complex-facilities';

// Firestore 컬렉션 참조
const facilitiesCollection = collection(db, 'planned_facilities');

async function updatePlannedFacilities() {
    console.log('Starting to update planned facilities in Firestore...');

    if (!initialComplexFacilities || initialComplexFacilities.length === 0) {
        console.log('No initial facility data found. Aborting.');
        return;
    }

    const batch = writeBatch(db);

    initialComplexFacilities.forEach(facility => {
        // 각 facility 객체에 고유한 ID가 이미 있다고 가정합니다. (id: uuidv4())
        const docRef = doc(facilitiesCollection, facility.id);
        batch.set(docRef, facility);
    });

    try {
        await batch.commit();
        console.log(`✅ Successfully wrote ${initialComplexFacilities.length} planned facility documents to Firestore.`);
    } catch (error) {
        console.error('Error committing planned facilities to Firestore:', error);
    }

    console.log('Planned facilities update script finished.');
}

updatePlannedFacilities();
