import pandas as pd
import numpy as np
from model.preprocess import load_data, scale_features

def test_scale_features():
    # Mock data
    company = pd.DataFrame({
        'headcount': [10, 20],
        'funding': [1.5, 3.0],
        'growth_rate': [0.1, 0.2],
        'social_media_presence': [100, 200],
        'sector': [1, 2]
    })
    target = pd.DataFrame({
        'headcount': [15],
        'funding': [2.0],
        'growth_rate': [0.15],
        'social_media_presence': [150],
        'sector': [1.5]
    })

    scaled_company, scaled_target = scale_features(company, target)

    # Ensure dimensions and type
    assert scaled_company.shape == (2, 5)
    assert scaled_target.shape == (1, 5)
    assert isinstance(scaled_company, np.ndarray)
