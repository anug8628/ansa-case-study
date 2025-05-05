import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

def compute_similarity(company_scaled, target_scaled, top_n_targets=5):
    similarity_matrix = cosine_similarity(company_scaled, target_scaled)
    max_scores = np.max(similarity_matrix, axis=1)  # Best match for each company
    best_match_indices = np.argmax(similarity_matrix, axis=1)  # Indices of the best match
    best_match_indices = np.clip(best_match_indices, 0, len(target_scaled) - 1)  # Ensure indices are within bounds
    return max_scores, best_match_indices


def attach_scores(company_data, similarity_scores, best_match_indices, target_data):
    company_data = company_data.copy()
    company_data['similarity_score'] = similarity_scores

    company_data['most_similar_company'] = [
        target_data.iloc[best_match_indices[i]]['name'] for i in range(0,len(company_data))
    ]
    
    return company_data



