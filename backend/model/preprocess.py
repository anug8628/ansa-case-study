import pandas as pd
from sklearn.preprocessing import StandardScaler

def load_data(company_path, target_path, features):
    company_data = pd.read_parquet(company_path, engine='pyarrow')
    target_data = pd.read_parquet(target_path, engine='pyarrow')

    company_features = company_data[features]
    target_features = target_data[features]

    return company_data, target_data, company_features, target_features

def scale_features(company_features, target_features):
    scaler = StandardScaler()

    numeric_columns = company_features.select_dtypes(include=["number"]).columns
    company_numeric = company_features[numeric_columns]
    target_numeric = target_features[numeric_columns]

    company_scaled = scaler.fit_transform(company_numeric)
    target_scaled = scaler.transform(target_numeric)

    return company_scaled, target_scaled
