import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

def compute_similarity(company_scaled, target_scaled):
    return cosine_similarity(company_scaled, target_scaled)

def attach_scores(company_data, similarity_matrix):
    # Each company gets its max similarity score
    company_data = company_data.copy()
    company_data['similarity_score'] = similarity_matrix.max(axis=1)
    return company_data
