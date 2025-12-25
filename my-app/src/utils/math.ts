export function cosineSimilarity(vecA: number[], vecB: number[]): number {
    console.log('🔍 cosineSimilarity called');
    console.log('Vector A length:', vecA.length);
    console.log('Vector B length:', vecB.length);
    
    // Проверяем, что векторы не пустые
    if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) {
        console.error('❌ Empty vectors!');
        return 0;
    }
    
    // Проверяем совпадение размерностей
    if (vecA.length !== vecB.length) {
        console.error('❌ Vector length mismatch!', vecA.length, 'vs', vecB.length);
        return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    console.log('📊 Stats:', {
        dotProduct: dotProduct.toFixed(4),
        normA: normA.toFixed(4),
        normB: normB.toFixed(4),
        sqrtNormA: Math.sqrt(normA).toFixed(4),
        sqrtNormB: Math.sqrt(normB).toFixed(4)
    });

    if (normA === 0 || normB === 0) {
        console.warn('⚠️ Zero norm detected');
        return 0;
    }
    
    const result = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    console.log('✅ Result:', result.toFixed(4));
    
    return result;
}