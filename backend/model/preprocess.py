import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler

def load_data(company_path, target_path):
    company_data = pd.read_parquet(company_path, engine='pyarrow')
    target_data = pd.read_parquet(target_path, engine='pyarrow')

    for df in [company_data, target_data]:
        # Extract company_id from entity_urn
        df['company_id'] = df['entity_urn'].str.extract(r'company:(\d+)').astype(float)

        # Funding per employee
        df['funding_per_employee'] = df['funding_total'] / df['headcount'].replace(0, np.nan)
        df['funding_per_employee'].fillna(0, inplace=True)

        # Recency score
        today = pd.Timestamp.now(tz=None).normalize()
        df['last_funding_date'] = pd.to_datetime(df.get('last_funding_date'), errors='coerce').dt.tz_localize(None)
        df['funding_recency_score'] = 1 / (1 + (today - df['last_funding_date']).dt.days.fillna(9999))
        

        # Growth momentum
        df['growth_momentum'] = (
            0.6 * df.get('headcount_growth_6m', 0).fillna(0) +
            0.4 * df.get('headcount_growth_12m', 0).fillna(0)
        )

        # Log transforms
        df['log_funding_total'] = np.log1p(df['funding_total'])
        df['log_linkedin_followers'] = np.log1p(df.get('linkedin_follower_count', 0))
        df['log_headcount'] = np.log1p(df['headcount'])

        # One-hot encode gpt_sector (skip gpt_subsector)
        if 'gpt_sector' in df.columns:
            sector_dummies = pd.get_dummies(df['gpt_sector'], prefix='sector')
            df = pd.concat([df.drop('gpt_sector', axis=1), sector_dummies], axis=1)

        # Fill missing values in numeric columns with 0 or string columns with 'unknown'
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        df[numeric_cols] = df[numeric_cols].fillna(0)

        string_cols = df.select_dtypes(include=['object', 'string']).columns
        df[string_cols] = df[string_cols].fillna('unknown')

    # Final feature list
    base_features = [
        'funding_per_employee', 'funding_recency_score', 'growth_momentum',
        'log_funding_total', 'log_linkedin_followers', 'log_headcount'
    ]
    sector_features = [col for col in company_data.columns if col.startswith('sector_')]

    all_features = base_features + sector_features
    company_features = company_data[all_features]
    target_features = target_data[all_features]

    return company_data, target_data, company_features, target_features


def scale_features(company_features, target_features):
    scaler = StandardScaler()
    company_scaled = scaler.fit_transform(company_features)
    target_scaled = scaler.transform(target_features)
    return company_scaled, target_scaled
