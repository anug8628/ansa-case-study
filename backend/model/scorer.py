import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

def compute_similarity(company_scaled, target_scaled, top_n_targets=5):
    similarity_matrix = cosine_similarity(company_scaled, target_scaled)
    max_scores = np.max(similarity_matrix, axis=1)  # Best match for each company
    return max_scores

def attach_scores(company_data, similarity_scores):
    company_data = company_data.copy()
    company_data['similarity_score'] = similarity_scores
    return company_data
