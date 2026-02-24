// Firestore REST API helper for React Native
// Uses standard fetch() which works reliably in React Native

const PROJECT_ID = 'hatim-zinciri-app';
const API_KEY = 'AIzaSyCOEHFwQE7BHT-G3DuPtLJjsxy04au3YqA';
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// Convert JS value to Firestore value format
function toFirestoreValue(value: any): any {
    if (value === null || value === undefined) return { nullValue: null };
    if (typeof value === 'string') return { stringValue: value };
    if (typeof value === 'number') {
        if (Number.isInteger(value)) return { integerValue: String(value) };
        return { doubleValue: value };
    }
    if (typeof value === 'boolean') return { booleanValue: value };
    if (Array.isArray(value)) {
        return { arrayValue: { values: value.map(toFirestoreValue) } };
    }
    if (typeof value === 'object') {
        const fields: any = {};
        for (const [k, v] of Object.entries(value)) {
            if (v !== undefined) {
                fields[k] = toFirestoreValue(v);
            }
        }
        return { mapValue: { fields } };
    }
    return { stringValue: String(value) };
}

// Convert Firestore value format back to JS value
function fromFirestoreValue(val: any): any {
    if (!val) return null;
    if ('stringValue' in val) return val.stringValue;
    if ('integerValue' in val) return parseInt(val.integerValue, 10);
    if ('doubleValue' in val) return val.doubleValue;
    if ('booleanValue' in val) return val.booleanValue;
    if ('nullValue' in val) return null;
    if ('arrayValue' in val) {
        return (val.arrayValue.values || []).map(fromFirestoreValue);
    }
    if ('mapValue' in val) {
        return fromFirestoreFields(val.mapValue.fields || {});
    }
    if ('timestampValue' in val) return val.timestampValue;
    return null;
}

// Convert Firestore fields object to JS object
function fromFirestoreFields(fields: any): any {
    const result: any = {};
    for (const [key, val] of Object.entries(fields)) {
        result[key] = fromFirestoreValue(val);
    }
    return result;
}

// Convert JS object to Firestore fields
function toFirestoreFields(obj: any): any {
    const fields: any = {};
    for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
            fields[key] = toFirestoreValue(value);
        }
    }
    return fields;
}

// Extract document ID from resource name
function getDocId(name: string): string {
    const parts = name.split('/');
    return parts[parts.length - 1];
}

export const FirestoreREST = {
    // Create a new document in a collection
    async createDoc(collectionPath: string, data: any): Promise<{ id: string; data: any }> {
        const url = `${BASE_URL}/${collectionPath}?key=${API_KEY}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fields: toFirestoreFields(data) }),
        });
        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Firestore create failed (${response.status}): ${err}`);
        }
        const doc = await response.json();
        return { id: getDocId(doc.name), data: fromFirestoreFields(doc.fields || {}) };
    },

    // Get a single document by path
    async getDoc(docPath: string): Promise<{ id: string; data: any } | null> {
        const url = `${BASE_URL}/${docPath}?key=${API_KEY}`;
        const response = await fetch(url, {
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'X-Cache-Buster': Date.now().toString()
            }
        });
        if (response.status === 404) return null;
        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Firestore get failed (${response.status}): ${err}`);
        }
        const doc = await response.json();
        if (!doc.fields) return null;
        return { id: getDocId(doc.name), data: fromFirestoreFields(doc.fields) };
    },

    // List all documents in a collection
    async listDocs(collectionPath: string, pageSize: number = 300): Promise<{ id: string; data: any }[]> {
        const url = `${BASE_URL}/${collectionPath}?key=${API_KEY}&pageSize=${pageSize}`;
        const response = await fetch(url, {
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'X-Cache-Buster': Date.now().toString()
            }
        });
        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Firestore list failed (${response.status}): ${err}`);
        }
        const result = await response.json();
        if (!result.documents) return [];
        return result.documents
            .filter((doc: any) => doc.fields)
            .map((doc: any) => ({
                id: getDocId(doc.name),
                data: fromFirestoreFields(doc.fields),
            }));
    },

    // Update a document (merge)
    async updateDoc(docPath: string, data: any): Promise<void> {
        const updateMask = Object.keys(data).map(k => `updateMask.fieldPaths=${k}`).join('&');
        const url = `${BASE_URL}/${docPath}?key=${API_KEY}&${updateMask}`;
        const response = await fetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fields: toFirestoreFields(data) }),
        });
        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Firestore update failed (${response.status}): ${err}`);
        }
    },

    // Delete a document
    async deleteDoc(docPath: string): Promise<void> {
        const url = `${BASE_URL}/${docPath}?key=${API_KEY}`;
        const response = await fetch(url, { method: 'DELETE' });
        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Firestore delete failed (${response.status}): ${err}`);
        }
    },

    // Run a structured query (for filtering)
    async runQuery(collectionPath: string, filters: { field: string; op: string; value: any }[]): Promise<{ id: string; data: any }[]> {
        const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery?key=${API_KEY}`;

        const compositeFilter = filters.length > 0 ? {
            compositeFilter: {
                op: 'AND',
                filters: filters.map(f => ({
                    fieldFilter: {
                        field: { fieldPath: f.field },
                        op: f.op,
                        value: toFirestoreValue(f.value),
                    }
                }))
            }
        } : undefined;

        const body: any = {
            structuredQuery: {
                from: [{ collectionId: collectionPath }],
                ...(compositeFilter ? { where: compositeFilter } : {}),
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Firestore query failed (${response.status}): ${err}`);
        }
        const results = await response.json();
        if (!Array.isArray(results)) return [];
        return results
            .filter((r: any) => r.document && r.document.fields)
            .map((r: any) => ({
                id: getDocId(r.document.name),
                data: fromFirestoreFields(r.document.fields),
            }));
    },
};
