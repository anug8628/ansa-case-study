import os
from flask import Flask, jsonify
from model.preprocess import load_data, scale_features
from model.scorer import compute_similarity, attach_scores

import numpy as np

company_data, target_data, company_features, target_features = load_data(
    './data/company_data.parquet',
    './data/target_company_data.parquet'
)

company_scaled, target_scaled = scale_features(company_features, target_features)
similarity_scores, best_match_indices = compute_similarity(company_scaled, target_scaled, top_n_targets=5)
company_data = attach_scores(company_data, similarity_scores, best_match_indices, target_data)


# Log transform for frontend sorting
company_data['log_funding_total'] = np.log1p(company_data['funding_total'].fillna(0))
company_data['log_headcount'] = np.log1p(company_data['headcount'].fillna(0))

print(company_data[['company_id', 'name', 'similarity_score']].sort_values(by='similarity_score', ascending=False).head(10))

app = Flask(__name__)

@app.route('/api/companies', methods=['GET'])
def get_companies():
    included_columns = [
        'company_id', 'name', 'similarity_score', 'most_similar_company', 
        'funding_total', 'headcount',
        'log_funding_total', 'log_headcount',
        'gpt_sector','last_funding_type', 
        'funding_stage','domain_only', 'description',
        'last_funding_date', 'years_since_founding'
    ]
    # Include all sector_ columns dynamically
    sector_cols = [col for col in company_data.columns if col.startswith('sector_')]
    all_cols = included_columns + sector_cols

    scored = company_data[all_cols].sort_values(by='similarity_score', ascending=False)

    if 'last_funding_date' in scored.columns:
        scored['last_funding_date'] = scored['last_funding_date'].dt.strftime('%Y-%m-%d')
        scored['last_funding_date'] = scored['last_funding_date'].fillna('N/A')
        
    return jsonify(scored.to_dict(orient='records'))


@app.route('/api/company/<int:company_id>', methods=['GET'])
def get_company(company_id):
    match = company_data[company_data['company_id'] == company_id]
    if not match.empty:
        return jsonify(match.to_dict(orient='records')[0])
    return jsonify({'error': 'Company not found'}), 404

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)