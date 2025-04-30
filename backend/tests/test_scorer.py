import pandas as pd
import numpy as np
from model.scorer import compute_similarity, attach_scores

def test_compute_similarity_and_attach():
    company_data = pd.DataFrame({
        'company_id': [1, 2],
        'company_name': ['A', 'B']
    })

    # Simulated vectors
    company_scaled = np.array([[1, 0], [0, 1]])
    target_scaled = np.array([[1, 0]])

    sim = compute_similarity(company_scaled, target_scaled)
    assert sim.shape == (2, 1)

    scored = attach_scores(company_data, sim)
    assert 'similarity_score' in scored.columns
    assert np.isclose(scored['similarity_score'].iloc[0], 1.0)
    assert np.isclose(scored['similarity_score'].iloc[1], 0.0)
